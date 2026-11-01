# Варианты вопросов - Frontend (Панель HR) ✅

## 🎯 Обзор

Реализован полный UI для управления вариантами вопросов в панели HR. Каждому кандидату показывается случайный вариант вопроса, что усложняет списывание.

## 📋 Реализованные компоненты

### 1. **TypeScript типы** ✅

**Файл**: `src/types/question.ts`

```typescript
// Новый тип для варианта вопроса
export interface QuestionVariantDraft {
  id?: number;
  text: string;
  referenceAnswer?: string | null;
  attachments?: QuestionAttachment[];
  options?: QuestionOption[];
  position?: number;
}

// Обновлен QuestionDraft
export interface QuestionDraft {
  // ... существующие поля
  
  // ✅ НОВОЕ
  useVariants?: boolean;
  variants?: QuestionVariantDraft[];
}
```

**Функции валидации**:
- `validateQuestionVariants(question)` - проверка количества вариантов, текста, options, referenceAnswer
- Обновлена `validateChoiceQuestion()` для поддержки вариантов
- Обновлена `validateQuestions()` для комплексной проверки

### 2. **QuestionVariantsEditor** ✅

**Файл**: `src/components/question/QuestionVariantsEditor.tsx`

**Возможности**:
- Добавление/удаление вариантов (min 2, max 10)
- Drag-and-drop для переупорядочивания (визуально готово)
- Сворачивание/разворачивание вариантов
- Редактирование для каждого варианта:
  - Текст вопроса (RichTextEditor)
  - Эталонный ответ (для OPEN)
  - Варианты ответов (для CHOICE) через `QuestionOptionsEditor`
  - Attachments через `QuestionAttachmentUploader`
- Валидация на лету
- Счетчик вариантов (X/10)

### 3. **QuestionFormItem** (обновлен) ✅

**Файл**: `src/components/QuestionFormItem.tsx`

**Изменения**:
1. Импортирован `QuestionVariantsEditor`
2. Добавлен тумблер "Использовать варианты" в секцию экспертных настроек
3. При включении тумблера:
   - Создаются 2 начальных варианта (первый копирует текущий вопрос)
   - Скрываются старые поля (text, referenceAnswer, attachments, options)
   - Показывается редактор вариантов
4. Обновлена функция `hasExpertSettings()` - учитывает `useVariants`
5. Обновлена функция `resetToDefault()` - сбрасывает варианты

## 🎨 UI/UX

### Расположение в интерфейсе

```
📦 Вопрос
├─ Текст вопроса (скрыт если useVariants=true)
├─ 🔧 Экспертные настройки
│  ├─ Способ ответа кандидата
│  ├─ 🔀 Использовать варианты [Toggle]
│  │  └─ [QuestionVariantsEditor]
│  │     ├─ Вариант 1 [expand/collapse]
│  │     │  ├─ Текст
│  │     │  ├─ Эталон
│  │     │  ├─ Options (если choice)
│  │     │  └─ Attachments
│  │     ├─ Вариант 2 [expand/collapse]
│  │     └─ [Добавить вариант]
│  ├─ Участвует в оценке знаний
│  └─ Red Flag
├─ Эталонный ответ (скрыт если useVariants=true)
└─ Attachments (скрыты если useVariants=true)
```

### Цветовая схема

- **Варианты вопросов**: `#fff3e0` (оранжевый) - отличается от других экспертных настроек
- **Оценка знаний**: `#e3f2fd` (синий)
- **Red Flag**: `#ffeaea` (красный)

### Визуальные индикаторы

- Chip "Вариант X" для каждого варианта
- Счетчик `(X/10)` вариантов
- Alert при < 2 вариантах: "Для режима вариантов нужно минимум 2 варианта"
- Кнопка "Добавить вариант" disabled при 10 вариантах

## 📊 Логика работы

### Включение режима вариантов

```typescript
onUpdate(index, "useVariants", true);

// Создаются 2 начальных варианта
const defaultVariant = {
  text: question.text || "",
  referenceAnswer: question.referenceAnswer,
  attachments: question.attachments || [],
  options: question.options || [],
  position: 1,
};
const emptyVariant = {
  text: "",
  referenceAnswer: null,
  attachments: [],
  options: questionType === 'choice' ? [/* 2 пустых */] : [],
  position: 2,
};
onUpdate(index, "variants", [defaultVariant, emptyVariant]);
```

### Отключение режима вариантов

При отключении:
- Сохраняются варианты в памяти (на случай повторного включения)
- Показываются старые поля

### Валидация

**Client-side (Frontend)**:
```typescript
// Минимум 2 варианта если useVariants=true
if (variantsCount < 2) {
  errors.push('Для режима вариантов нужно минимум 2 варианта');
}

// Максимум 10 вариантов
if (variantsCount > 10) {
  errors.push('Максимум 10 вариантов на вопрос');
}

// Текст каждого варианта обязателен
variants.forEach((variant, index) => {
  if (!variant.text || variant.text.trim() === '') {
    errors.push(`Вариант ${index + 1}: текст не может быть пустым`);
  }
});
```

**Server-side (Backend)** - см. [QUESTION_VARIANTS_ADMIN_API.md](./QUESTION_VARIANTS_ADMIN_API.md)

## 🔄 Обратная совместимость

✅ **Полностью сохранена**:

1. Старые вопросы без вариантов работают как раньше
2. При загрузке вакансии с вариантами:
   - Если `useVariants=true` → показывается редактор вариантов
   - Если `useVariants=false` → показываются старые поля
3. При сохранении:
   - Backend автоматически создает 1 вариант для старого формата
   - Frontend отправляет `variants` если `useVariants=true`

## 🧪 Тестирование

### Чек-лист

- [ ] Включить тумблер "Использовать варианты"
- [ ] Проверить создание 2 начальных вариантов
- [ ] Добавить 3-й вариант
- [ ] Отредактировать текст каждого варианта
- [ ] Для CHOICE: добавить варианты ответов в каждом варианте
- [ ] Для OPEN: добавить эталонный ответ в каждом варианте
- [ ] Добавить attachments в каждом варианте (если есть questionId)
- [ ] Попытаться добавить 11-й вариант (должна быть disabled кнопка)
- [ ] Удалить вариант
- [ ] Попытаться удалить единственный вариант (должна быть disabled кнопка)
- [ ] Свернуть/развернуть варианты
- [ ] Сохранить вопрос
- [ ] Перезагрузить страницу - проверить что варианты сохранились
- [ ] Отключить тумблер - проверить что старые поля появились
- [ ] Включить тумблер снова - проверить что варианты вернулись
- [ ] Проверить валидацию при сохранении вакансии

### Проверка интеграции с backend

```bash
# 1. Создать вопрос с вариантами через UI
# 2. Проверить запрос в DevTools Network
POST /api/admin/vacancies/{id}/with-template
{
  "questions": [{
    "useVariants": true,
    "variants": [
      {"text": "Вариант 1", ...},
      {"text": "Вариант 2", ...}
    ]
  }]
}

# 3. Получить вопросы
GET /api/admin/vacancies/{id}/full

# Response должен содержать:
{
  "questions": [{
    "useVariants": true,
    "variants": [...]
  }]
}
```

## 🐛 Известные ограничения

1. **Attachments для новых вопросов**: `QuestionAttachmentUploader` требует `questionId`, который появляется только после первого сохранения вопроса. Для новых вопросов attachments недоступны до первого сохранения.
   
   **Workaround**: Сохраните вопрос сначала, затем добавьте attachments.

2. **Drag-and-drop переупорядочивание**: Визуально готово (иконка `IconGripVertical`), но логика перемещения не реализована. Варианты переупорядочиваются по `position` на backend при рандомном выборе.

## 📦 Файлы

### Новые:
- `src/components/question/QuestionVariantsEditor.tsx`
- `docs/QUESTION_VARIANTS_FRONTEND.md` (этот файл)

### Обновленные:
- `src/types/question.ts`
- `src/components/QuestionFormItem.tsx`

## 🚀 Следующие шаги

1. ✅ Типы TypeScript
2. ✅ QuestionVariantsEditor компонент
3. ✅ Интеграция в QuestionFormItem
4. ✅ Валидация на фронте
5. ⏭️ **Тестирование на dev окружении**
6. ⏭️ **Обработка edge cases**
7. ⏭️ **Финальная полировка UX**

## 🎉 Готово!

Frontend для управления вариантами вопросов полностью реализован и готов к тестированию!
