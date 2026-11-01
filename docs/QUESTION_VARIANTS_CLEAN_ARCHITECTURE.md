# Варианты вопросов - ЧИСТАЯ АРХИТЕКТУРА ✅

## 🎯 Финальная версия

Реализована **максимально чистая** архитектура без избыточности и старых полей.

## 🧹 Что убрано:

### 1. **Старые поля из `InterviewQuestion`** ❌
- `text` → только в `QuestionVariant`
- `reference_answer` → только в `QuestionVariant`
- `attachments` → только в `QuestionVariant`
- `options` → только в `QuestionVariant`

### 2. **Флаг `use_variants`** ❌
- Избыточен! Определяем по количеству вариантов:
  - **1 вариант** = обычный вопрос
  - **2+ варианта** = рандомный вопрос

## 📊 Чистая структура

### Database:

```sql
interview_question:
  id
  template_id
  position
  type                -- text | typing
  question_type       -- open | choice | code
  max_time
  allow_followups
  followups_max
  is_red_flag
  affects_knowledge
  -- ✅ ВСЁ! Никаких text, options, etc.

question_variant:
  id
  question_id  -- FK → interview_question
  text         -- 📝 Текст варианта
  reference_answer
  attachments  -- JSON
  options      -- JSON
  position
  created_at
  updated_at

interview_session_question:
  ...
  selected_variant_id  -- FK → question_variant
  text         -- Скопировано из выбранного варианта
  reference_answer
  options
  ...
```

### Логика выбора варианта:

```php
// QuestionVariantSelectorService::selectVariant()

if ($variants->count() > 1) {
    // 🎲 Рандомный выбор
    return $variantsArray[array_rand($variantsArray)];
}

// Берем единственный вариант
return $variants->first();
```

**Просто и понятно!** ✅

## 📋 Миграции (3 штуки)

### 1. `Version20260207100000AddQuestionVariants.php`
- Создает таблицу `question_variant`
- Добавляет `selected_variant_id` в `interview_session_question`
- Мигрирует существующие данные (INSERT ... SELECT)

### 2. `Version20260207110000RemoveOldQuestionFields.php`
- Удаляет `text`, `reference_answer`, `attachments`, `options` из `interview_question`

### 3. `Version20260207120000RemoveUseVariantsFlag.php`
- Удаляет `use_variants` из `interview_question`

## 🚀 Запуск:

```bash
php bin/console doctrine:migrations:migrate
```

Все 3 миграции выполнятся последовательно.

## 🎨 UI/UX Frontend

### Вместо тумблера - кнопка:

```tsx
// Если вариантов НЕТ или 0:
<Button onClick={createVariants}>
  Добавить варианты вопроса (защита от списывания)
</Button>

// Если варианты ЕСТЬ:
<Box>
  <QuestionVariantsEditor ... />
  <Button onClick={removeAllVariants}>
    Удалить варианты
  </Button>
</Box>
```

**Логика:**
- Нет вариантов → показать старые поля (text, referenceAnswer, attachments, options)
- Есть варианты → показать `QuestionVariantsEditor`

## 📊 API Format

### Создание вопроса (2 варианта):

```json
POST /api/admin/vacancies/with-template

{
  "questions": [{
    "questionType": "open",
    "type": "text",
    "maxTime": 180,
    "isRedFlag": false,
    "affectsKnowledge": true,
    
    "variants": [
      {
        "text": "Вариант 1: Опишите опыт с PostgreSQL",
        "referenceAnswer": "Индексы, оптимизация",
        "attachments": [],
        "options": []
      },
      {
        "text": "Вариант 2: Как оптимизировать медленный SQL?",
        "referenceAnswer": "EXPLAIN, индексы",
        "attachments": [],
        "options": []
      }
    ]
  }]
}
```

### Создание обычного вопроса (1 вариант):

```json
{
  "questions": [{
    "questionType": "open",
    "variants": [
      {
        "text": "Опишите ваш опыт",
        "referenceAnswer": null,
        "attachments": [],
        "options": []
      }
    ]
  }]
}
```

**ИЛИ** старый формат (автоматически создастся 1 вариант):

```json
{
  "questions": [{
    "text": "Опишите ваш опыт",
    "referenceAnswer": null,
    "questionType": "open"
  }]
}
```

### Получение вопросов:

```json
GET /api/admin/vacancies/{id}/full

{
  "questions": [{
    "id": 123,
    "variants": [
      {"id": 1, "text": "Вариант 1", ...},
      {"id": 2, "text": "Вариант 2", ...}
    ]
    // ✅ Больше НЕТ дублирования на уровне вопроса
  }]
}
```

## ✨ Преимущества чистой архитектуры:

1. ✅ **Нет дублирования** - данные только в `question_variant`
2. ✅ **Простая логика** - проверка `variants.count()` вместо флага
3. ✅ **Меньше полей** в БД
4. ✅ **Понятная структура** - один источник правды
5. ✅ **Легче поддерживать** - нет синхронизации флагов

## 🔄 Обратная совместимость API:

✅ **Сохранена** для `QuestionApiService::createQuestionFromApiData()`:
- Старый формат `text`, `referenceAnswer` → создастся 1 вариант
- Новый формат `variants[]` → создадутся N вариантов

## 📁 Обновленные файлы

### Backend:
```
migrations/Version20260207100000AddQuestionVariants.php (новый)
migrations/Version20260207110000RemoveOldQuestionFields.php (новый)
migrations/Version20260207120000RemoveUseVariantsFlag.php (новый)
src/Entity/InterviewQuestion.php (убраны поля + методы)
src/Service/QuestionVariantSelectorService.php (упрощена логика)
src/Service/QuestionApiService.php (убран useVariants из API)
src/Service/QuestionValidator.php (упрощена валидация)
src/Service/DemoDataService.php (использует QuestionApiService)
```

### Frontend:
```
src/types/question.ts (убран useVariants)
src/components/QuestionFormItem.tsx (кнопка вместо тумблера)
```

### Удалено:
```
migrations/Version20260205_AddQuestionVariants.sql (заменена на .php)
src/Command/MigrateQuestionVariantsCommand.php (больше не нужна)
```

## 🎉 Результат:

**Максимально чистая и простая архитектура!**
- Однозначность данных
- Нет избыточности
- Простая логика
- Легко поддерживать

Готово к production! 🚀
