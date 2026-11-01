# ♻️ Рефакторинг: Компонент настройки времени вопроса

## Проблема

Компонент настройки времени на ответ для вопросов был **дублирован** в двух местах:
- `app/(DashboardLayout)/hr/vacancy-create/page.tsx`
- `app/(DashboardLayout)/hr/vacancy-edit/[id]/page.tsx`

Это приводило к:
- ❌ Дублированию кода (~90 строк в каждом файле)
- ❌ Сложности поддержки (изменения нужно было вносить в двух местах)
- ❌ Риску рассинхронизации логики

## Решение

Создан **переиспользуемый компонент** `QuestionTimeSettings`:

```typescript
<QuestionTimeSettings
  value={templateData.questionTime}
  onChange={(time) => setTemplateData({ ...templateData, questionTime: time })}
  maxTime={600}
  showFormattedTime={true}
/>
```

### Файлы

1. **Новый компонент:**
   - `src/components/vacancy/QuestionTimeSettings.tsx`

2. **Обновлены:**
   - `app/(DashboardLayout)/hr/vacancy-create/page.tsx` — заменен дублированный код
   - `app/(DashboardLayout)/hr/vacancy-edit/[id]/page.tsx` — заменен дублированный код

## Особенности компонента

### Props

```typescript
interface QuestionTimeSettingsProps {
  value: number;              // Текущее значение времени (секунды)
  onChange: (time: number) => void; // Коллбек для изменения
  minTime?: number;           // Минимум (по умолчанию 60)
  maxTime?: number;           // Максимум (по умолчанию 300)
  showFormattedTime?: boolean; // Показывать MM:SS (по умолчанию false)
  showIcon?: boolean;          // Показывать иконку (по умолчанию true)
}
```

### Функциональность

1. **Кнопки быстрого выбора** — предустановленные значения (60, 90, 120... секунд)
2. **Слайдер** — точная настройка времени с шагом 30 секунд
3. **Форматированное время** — опционально показывает MM:SS
4. **Автоматическая фильтрация** — кнопки показываются только если входят в диапазон `minTime...maxTime`

## Различия в использовании

### Создание вакансии

```typescript
<QuestionTimeSettings
  value={templateData.questionTime}
  onChange={(time) => setTemplateData({ ...templateData, questionTime: time })}
  showFormattedTime={true}  // ✅ Показываем MM:SS
/>
```

- `maxTime`: 300 (по умолчанию — 5 минут)
- Показывает форматированное время
- Обновляет только `templateData` (вопросы создаются с этим временем позже)

### Редактирование вакансии

```typescript
<QuestionTimeSettings
  value={templateData.questionTime}
  onChange={(time) => {
    setTemplateData({ ...templateData, questionTime: time });
    // ⚠️ Обновляем время для ВСЕХ существующих вопросов
    setQuestions(questions.map(q => ({ ...q, maxTime: time })));
  }}
  maxTime={600}  // ✅ Увеличенный лимит — 10 минут
/>
```

- `maxTime`: 600 (10 минут для существующих вакансий)
- НЕ показывает форматированное время
- Обновляет и `templateData`, и `maxTime` у каждого вопроса

## Результаты

### До рефакторинга

- **vacancy-create/page.tsx**: ~90 строк дублированного кода
- **vacancy-edit/[id]/page.tsx**: ~90 строк дублированного кода
- **Итого**: ~180 строк дублирования

### После рефакторинга

- **QuestionTimeSettings.tsx**: 1 компонент (~160 строк)
- **vacancy-create/page.tsx**: 7 строк использования
- **vacancy-edit/[id]/page.tsx**: 11 строк использования
- **Итого**: ~178 строк (но **без дублирования**)

### Преимущества

✅ **Единая точка изменений** — логика в одном месте  
✅ **Переиспользование** — легко добавить в новые страницы  
✅ **Типобезопасность** — TypeScript props с документацией  
✅ **Консистентность** — одинаковый UX во всех местах  
✅ **Гибкость** — настраивается через props

## Исправленные баги

### 🐛 Баг в vacancy-edit

**До рефакторинга:**
- Кнопки быстрого выбора обновляли время у всех вопросов ✅
- Слайдер **НЕ обновлял** время у вопросов ❌

**После рефакторинга:**
- Оба метода ввода корректно обновляют время у всех вопросов ✅

## Техническая архитектура

### Хранение времени

```
Database (InterviewQuestion)
    ↓ maxTime (индивидуально для каждого вопроса)
    
Frontend State
    ↓ templateData.questionTime (общее значение для UI)
    ↓ questions[].maxTime (индивидуальное для каждого вопроса)
    
UI Component
    ↓ QuestionTimeSettings (управляет общим значением)
```

### Синхронизация

1. **Создание вакансии:**
   - UI → `templateData.questionTime`
   - При создании вопросов → `maxTime: templateData.questionTime`

2. **Редактирование вакансии:**
   - UI → `templateData.questionTime` + `questions[].maxTime` (синхронно)
   - При сохранении → каждый вопрос со своим `maxTime`

## Проверка

### Тестовые сценарии

1. ✅ Создание вакансии с временем 180 сек
2. ✅ Редактирование вакансии — изменение времени кнопкой
3. ✅ Редактирование вакансии — изменение времени слайдером
4. ✅ Проверка: время правильно применяется при прохождении интервью

## Дата

Рефакторинг выполнен: **2026-02-05**
