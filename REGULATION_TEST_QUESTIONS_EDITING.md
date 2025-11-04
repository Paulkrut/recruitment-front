# ✏️ Редактирование сгенерированных вопросов

## 📝 Описание

После генерации вопросов для теста по регламентам, HR может просмотреть и отредактировать каждый вопрос перед созданием приглашений.

---

## 🎯 Что можно редактировать

Для каждого вопроса доступны следующие поля:

1. **Текст вопроса** - сам вопрос для сотрудника
2. **Ожидаемый ответ** - эталонный ответ для AI проверки
3. **Время на ответ** - количество секунд (30-600)
4. **Сложность** - Легкий (1), Средний (2), Сложный (3)

---

## 🎨 UI Компоненты

### Список вопросов после генерации

```
┌────────────────────────────────────────────────────────────┐
│ ✅ Вопросы успешно сгенерированы!                          │
│    Создано 15 вопросов. Вы можете отредактировать их ниже. │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ [Вопрос 1]  [Сложность: 2]  [HR документы]  [🗑️]          │
├────────────────────────────────────────────────────────────┤
│ Вопрос:                                                    │
│ [Какие основные этапы адаптации новых сотрудников?]        │
│                                                            │
│ Ожидаемый ответ (для AI проверки):                         │
│ [Основные этапы: знакомство с командой, обучение...]       │
│ [...]                                                      │
│                                                            │
│ Время на ответ: [120 сек]  Сложность: [Средний ▼]         │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ [Вопрос 2]  [Сложность: 1]  [Безопасность]  [🗑️]          │
├────────────────────────────────────────────────────────────┤
│ ...                                                        │
└────────────────────────────────────────────────────────────┘
```

### Карточка вопроса

**Компоненты:**
- **Заголовок**: Номер вопроса + теги (сложность, регламент) + кнопка удалить
- **Текст вопроса**: Многострочное поле (2 строки)
- **Ожидаемый ответ**: Многострочное поле (3 строки)
- **Настройки**: Время на ответ (число) + Сложность (выпадающий список)

---

## 🔧 Технические детали

### Интерфейс вопроса

```typescript
interface GeneratedQuestion {
  id?: number;
  text: string;
  type: 'text' | 'multiple_choice';
  expectedAnswer: string;
  difficulty: number;
  maxTime?: number;
  regulationId: number;
  regulationTitle: string;
}
```

### Состояние

```typescript
const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
```

### Функции редактирования

```typescript
// Обновить поле вопроса
const handleUpdateQuestion = (index: number, field: keyof GeneratedQuestion, value: any) => {
  setGeneratedQuestions(prev => {
    const updated = [...prev];
    updated[index] = { ...updated[index], [field]: value };
    return updated;
  });
};

// Удалить вопрос
const handleDeleteQuestion = (index: number) => {
  setGeneratedQuestions(prev => prev.filter((_, i) => i !== index));
};
```

### Загрузка вопросов после генерации

```typescript
const handleGenerateQuestions = async () => {
  if (!testId) return;

  setGeneratingQuestions(true);
  try {
    const response = await apiFetch(`${API_BASE}/api/regulation-tests/${testId}/generate-questions`, {
      method: 'POST',
    });

    if (response.ok) {
      // Загружаем сгенерированные вопросы
      const questionsResponse = await apiFetch(`${API_BASE}/api/regulation-tests/${testId}/questions`);
      if (questionsResponse.ok) {
        const questions = await questionsResponse.json();
        setGeneratedQuestions(questions);
        setQuestionsGenerated(true);
      }
    }
  } catch (error) {
    console.error('Error generating questions:', error);
    alert('Ошибка при генерации вопросов');
  } finally {
    setGeneratingQuestions(false);
  }
};
```

---

## 📊 Backend API

### Endpoint: `GET /api/regulation-tests/{id}/questions`

**Response:**
```json
[
  {
    "id": 1,
    "text": "Какие основные этапы адаптации новых сотрудников?",
    "type": "text",
    "expectedAnswer": "Основные этапы включают: знакомство с командой, обучение корпоративным стандартам, назначение наставника, период испытательного срока.",
    "difficulty": 2,
    "maxTime": 120,
    "regulationId": 5,
    "regulationTitle": "Регламент адаптации новичков"
  },
  {
    "id": 2,
    "text": "Какие требования безопасности при работе с оборудованием?",
    "type": "text",
    "expectedAnswer": "Обязательное использование средств индивидуальной защиты, регулярная проверка исправности оборудования, соблюдение инструкций по эксплуатации.",
    "difficulty": 1,
    "maxTime": 90,
    "regulationId": 7,
    "regulationTitle": "Техника безопасности"
  }
]
```

**Controller:**
```php
#[Route('/{id}/questions', name: 'get_questions', methods: ['GET'])]
public function getQuestions(int $id, Request $request): JsonResponse
{
    $company = $request->attributes->get('company');
    $test = $this->testRepo->find($id);

    if (!$test || $test->getCompany() !== $company) {
        return $this->json(['error' => 'Test not found'], 404);
    }

    $questions = $test->getQuestions()->map(fn($q) => [
        'id' => $q->getId(),
        'text' => $q->getText(),
        'type' => $q->getType(),
        'expectedAnswer' => $q->getExpectedAnswer(),
        'difficulty' => $q->getDifficulty(),
        'maxTime' => $q->getMaxTime(),
        'regulationId' => $q->getRegulation()?->getId(),
        'regulationTitle' => $q->getRegulation()?->getTitle(),
    ])->toArray();

    return $this->json(array_values($questions));
}
```

---

## ✨ Преимущества

### 1. **Контроль качества**
- ✅ HR видит все сгенерированные вопросы
- ✅ Может исправить неточности AI
- ✅ Может адаптировать под специфику компании

### 2. **Гибкость**
- ✅ Изменить текст вопроса
- ✅ Уточнить ожидаемый ответ
- ✅ Настроить время и сложность
- ✅ Удалить неподходящие вопросы

### 3. **Прозрачность**
- ✅ Видно какие вопросы будут заданы
- ✅ Видно по какому регламенту каждый вопрос
- ✅ Видно ожидаемые ответы для AI проверки

### 4. **UX**
- ✅ Все вопросы в одном месте
- ✅ Удобное редактирование inline
- ✅ Прокручиваемый список для большого количества
- ✅ Визуальные теги и метки

---

## 🎨 Детали UI

### Карточка вопроса

```tsx
<Card sx={{ mb: 2, border: '1px solid', borderColor: 'divider' }}>
  <CardContent>
    {/* Заголовок с тегами */}
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
      <Chip label={`Вопрос ${index + 1}`} size="small" color="primary" />
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Chip label={`Сложность: ${question.difficulty}`} size="small" variant="outlined" />
        <Chip label={question.regulationTitle} size="small" variant="outlined" color="secondary" />
        <IconButton size="small" color="error" onClick={() => handleDeleteQuestion(index)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>

    {/* Текст вопроса */}
    <TextField
      fullWidth
      multiline
      rows={2}
      label="Вопрос"
      value={question.text}
      onChange={(e) => handleUpdateQuestion(index, 'text', e.target.value)}
      sx={{ mb: 2 }}
    />

    {/* Ожидаемый ответ */}
    <TextField
      fullWidth
      multiline
      rows={3}
      label="Ожидаемый ответ (для AI проверки)"
      value={question.expectedAnswer}
      onChange={(e) => handleUpdateQuestion(index, 'expectedAnswer', e.target.value)}
      sx={{ mb: 2 }}
    />

    {/* Настройки */}
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <TextField
          fullWidth
          type="number"
          label="Время на ответ (сек)"
          value={question.maxTime || maxTimePerQuestion}
          onChange={(e) => handleUpdateQuestion(index, 'maxTime', parseInt(e.target.value))}
          inputProps={{ min: 30, max: 600 }}
        />
      </Grid>
      <Grid item xs={6}>
        <FormControl fullWidth>
          <InputLabel>Сложность</InputLabel>
          <Select
            value={question.difficulty}
            label="Сложность"
            onChange={(e) => handleUpdateQuestion(index, 'difficulty', e.target.value as number)}
          >
            <MenuItem value={1}>Легкий</MenuItem>
            <MenuItem value={2}>Средний</MenuItem>
            <MenuItem value={3}>Сложный</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  </CardContent>
</Card>
```

### Контейнер для списка вопросов

```tsx
<Box>
  {generatedQuestions.map((question, index) => (
    // ... карточка вопроса
  ))}
</Box>
```

**Примечание:** Ограничение по высоте убрано, используется общий скролл страницы для лучшего UX.

---

## 🧪 Тестирование

### Сценарий 1: Просмотр вопросов
1. Создать тест
2. Выбрать регламенты
3. На шаге "Генерация вопросов" выбрать "Заранее"
4. Кликнуть "Сгенерировать вопросы"
5. ✅ Должны отобразиться все вопросы
6. ✅ Для каждого вопроса видны все поля

### Сценарий 2: Редактирование вопроса
1. После генерации вопросов
2. Изменить текст вопроса
3. Изменить ожидаемый ответ
4. Изменить время на ответ
5. Изменить сложность
6. ✅ Все изменения должны сохраниться в состоянии

### Сценарий 3: Удаление вопроса
1. После генерации вопросов
2. Кликнуть на иконку 🗑️ для одного из вопросов
3. ✅ Вопрос должен исчезнуть из списка
4. ✅ Остальные вопросы должны остаться

### Сценарий 4: Много вопросов
1. Сгенерировать 20+ вопросов
2. ✅ Используется общий скролл страницы
3. ✅ Можно прокрутить до конца
4. ✅ Все вопросы доступны для редактирования
5. ✅ Нет двойного скролла

---

## 📝 Изменённые файлы

### Frontend
- `recruitment-front/src/app/(DashboardLayout)/hr/regulation-tests/create/page.tsx`
  - Добавлен интерфейс `GeneratedQuestion`
  - Добавлено состояние `generatedQuestions`
  - Обновлён `handleGenerateQuestions` для загрузки вопросов
  - Добавлены функции `handleUpdateQuestion` и `handleDeleteQuestion`
  - Обновлён UI шага 3 для отображения вопросов

### Backend
- `recruitment/src/Controller/Api/RegulationTestController.php`
  - Добавлен endpoint `GET /api/regulation-tests/{id}/questions`

---

## 🚀 Результат

Теперь при создании теста:
1. ✅ HR генерирует вопросы AI
2. ✅ Видит все сгенерированные вопросы
3. ✅ Может редактировать каждый вопрос
4. ✅ Может удалить ненужные вопросы
5. ✅ Может изменить настройки (время, сложность)
6. ✅ Видит какой вопрос к какому регламенту относится
7. ✅ Контролирует качество перед созданием приглашений

---

**Дата:** 2025-11-04  
**Статус:** ✅ Реализовано

