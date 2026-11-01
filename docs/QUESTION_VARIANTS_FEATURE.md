# Фича: Варианты вопросов интервью

## Обзор

Реализация системы вариантов вопросов для защиты от списывания. Один вопрос может иметь несколько формулировок, которые случайным образом показываются разным кандидатам.

## Цели

1. **Защита от списывания** - разные кандидаты получают разные формулировки одного вопроса
2. **Единая оценка** - все варианты оцениваются по одним критериям
3. **Гибкость** - можно использовать для одних вопросов и не использовать для других

## Архитектура

### Разделение параметров

**ОБЩИЕ параметры** (на уровне `InterviewQuestion`):
- `inputMode` (typing/voice) - способ ответа
- `affectsKnowledge` (boolean) - участвует ли в оценке знаний
- `isRedFlag` (boolean) - критичный ли вопрос
- `maxTime` (int) - время на ответ
- `questionType` (open/choice) - тип вопроса
- `useVariants` (boolean) - использовать ли варианты

**ИНДИВИДУАЛЬНЫЕ параметры** (на уровне `QuestionVariant`):
- `text` (string) - текст вопроса (HTML)
- `referenceAnswer` (string) - эталонный ответ
- `attachments` (JSON) - прикрепленные файлы
- `options` (JSON) - варианты ответа (для choice)

### Структура БД

```sql
-- Основная таблица вопроса
interview_question
- id
- input_mode
- affects_knowledge
- is_red_flag
- max_time
- question_type
- use_variants ← НОВОЕ
- template_id
- position

-- Варианты вопроса
question_variant ← НОВАЯ ТАБЛИЦА
- id
- question_id (FK)
- text (LONGTEXT)
- reference_answer (LONGTEXT, nullable)
- attachments (JSON, nullable)
- options (JSON, nullable)
- position (INT)
- created_at
- updated_at

-- Сохранение выбранного варианта
interview_session_question
- ...
- selected_variant_id (INT, nullable) ← НОВОЕ
```

### Пример данных

#### Вопрос с вариантами

```json
{
  "id": 123,
  "inputMode": "voice",
  "affectsKnowledge": true,
  "isRedFlag": false,
  "maxTime": 180,
  "questionType": "open",
  "useVariants": true,
  "variants": [
    {
      "id": 1,
      "text": "Посмотрите скриншот amoCRM. Расскажите какие модули вы использовали?",
      "referenceAnswer": "В amoCRM использовал модули: Лиды, Сделки...",
      "attachments": [
        {
          "id": "att1",
          "type": "image",
          "filename": "amocrm_screen.png",
          "url": "/uploads/questions/image/att1.png"
        }
      ],
      "options": null,
      "position": 1
    },
    {
      "id": 2,
      "text": "Изучите схему Bitrix24 (Excel файл). Как бы вы организовали воронку продаж?",
      "referenceAnswer": "В Bitrix24 создал бы воронку со стадиями...",
      "attachments": [
        {
          "id": "att2",
          "type": "pdf",
          "filename": "bitrix_structure.xlsx",
          "url": "/uploads/questions/pdf/att2.pdf"
        }
      ],
      "options": null,
      "position": 2
    },
    {
      "id": 3,
      "text": "Сравните функционал Salesforce и HubSpot",
      "referenceAnswer": "Salesforce больше подходит для крупных компаний...",
      "attachments": [],
      "options": null,
      "position": 3
    }
  ]
}
```

#### Обычный вопрос (без вариантов)

```json
{
  "id": 124,
  "inputMode": "typing",
  "affectsKnowledge": true,
  "isRedFlag": false,
  "maxTime": 120,
  "questionType": "open",
  "useVariants": false,
  "variants": [
    {
      "id": 4,
      "text": "Расскажите о вашем опыте работы",
      "referenceAnswer": null,
      "attachments": [],
      "options": null,
      "position": 1
    }
  ]
}
```

## Логика работы

### 1. Создание вопроса

**Обычный режим** (`useVariants = false`):
- Создается 1 вариант
- Работает как раньше

**Режим вариантов** (`useVariants = true`):
- Создается минимум 2 варианта
- Максимум 10 вариантов
- Каждый вариант имеет свой текст, эталон, attachments, options

### 2. Создание интервью

При создании `InterviewSession`:

```php
foreach ($template->getQuestions() as $question) {
    $sessionQuestion = new InterviewSessionQuestion();
    
    // Копируем ОБЩИЕ параметры
    $sessionQuestion->setInputMode($question->getInputMode());
    $sessionQuestion->setAffectsKnowledge($question->getAffectsKnowledge());
    $sessionQuestion->setIsRedFlag($question->getIsRedFlag());
    $sessionQuestion->setMaxTime($question->getMaxTime());
    
    // Выбираем вариант
    $variants = $question->getVariants();
    
    if ($question->getUseVariants() && count($variants) > 1) {
        // Случайный выбор
        $selectedVariant = $variants[array_rand($variants->toArray())];
    } else {
        // Единственный вариант
        $selectedVariant = $variants->first();
    }
    
    // Копируем ИНДИВИДУАЛЬНЫЕ параметры
    $sessionQuestion->setText($selectedVariant->getText());
    $sessionQuestion->setReferenceAnswer($selectedVariant->getReferenceAnswer());
    $sessionQuestion->setSelectedVariantId($selectedVariant->getId());
    
    // Копируем attachments/options из JSON
    // ...
}
```

### 3. Прохождение интервью

Кандидат видит выбранный вариант:
- Текст зафиксирован в `InterviewSessionQuestion`
- При перезагрузке страницы текст не меняется
- `selectedVariantId` хранится для аналитики

### 4. Оценка ответа

AI оценивает по эталону выбранного варианта:
- Используется `sessionQuestion.referenceAnswer`
- Оценка одинаково справедлива для всех вариантов (они близки по смыслу)

## Миграция данных

### Этап 1: Создание таблицы

```sql
-- Запустить миграцию
php bin/console doctrine:migrations:migrate
```

Или вручную:
```bash
php bin/console doctrine:migrations:migrate
```

### Этап 2: Миграция существующих вопросов

```bash
# Проверить что будет сделано
php bin/console app:migrate-question-variants --dry-run

# Выполнить миграцию
php bin/console app:migrate-question-variants --force
```

Что происходит:
1. Для каждого существующего вопроса создается 1 вариант
2. Переносятся: `text`, `referenceAnswer`, `attachments`, `options`
3. Устанавливается `useVariants = false`

### Этап 3: Удаление старых полей (опционально)

После успешной миграции можно удалить из `interview_question`:
- `text`
- `reference_answer`
- `attachments`
- `options`

**Рекомендация:** Сначала проверить работу системы, потом удалять.

## Backend изменения

### Новые Entity

1. **QuestionVariant** - новая entity для вариантов
   - `src/Entity/QuestionVariant.php`

2. **InterviewQuestion** - обновлена
   - Добавлено `useVariants`
   - Добавлена связь `variants` (OneToMany)

3. **InterviewSessionQuestion** - обновлена
   - Добавлено `selectedVariantId`

### Новые команды

1. **app:migrate-question-variants** - миграция данных
   - `src/Command/MigrateQuestionVariantsCommand.php`

## Frontend изменения

### Типы (TODO - следующий этап)

```typescript
interface QuestionVariant {
  id?: number;
  text: string;
  referenceAnswer?: string;
  attachments?: Attachment[];
  options?: QuestionOption[];
  position: number;
}

interface QuestionDraft {
  // ОБЩИЕ
  inputMode: 'typing' | 'voice';
  affectsKnowledge: boolean;
  isRedFlag: boolean;
  maxTime: number;
  questionType: 'open' | 'choice';
  useVariants: boolean; // ← НОВОЕ
  
  // ВАРИАНТЫ
  variants: QuestionVariant[]; // ← НОВОЕ (минимум 1)
}
```

### UI (TODO - следующий этап)

Экспертный режим:
```
┌─────────────────────────────────────────┐
│ ☐ Использовать варианты вопроса        │
│   (для защиты от списывания)           │
└─────────────────────────────────────────┘

Если включено:

┌─ Вариант 1 ────────────────────────[×]─┐
│ Текст: [RichTextEditor]                 │
│ Файлы: [att1.png] [+ Добавить]         │
│ Эталон: [TextArea]                      │
└─────────────────────────────────────────┘

┌─ Вариант 2 ────────────────────────[×]─┐
│ Текст: [RichTextEditor]                 │
│ Файлы: [att2.pdf] [+ Добавить]         │
│ Эталон: [TextArea]                      │
└─────────────────────────────────────────┘

[+ Добавить вариант] (макс 10)
```

### Валидация (TODO)

- Если `useVariants = true` → минимум 2 варианта
- Если `useVariants = false` → ровно 1 вариант
- Каждый вариант должен иметь text
- Максимум 10 вариантов

## Аналитика для HR

В панели кандидата показывать какой вариант был задан:

```
Вопрос 1: [Вариант 2/3] Изучите схему Bitrix24...
          ^^^^^^^^^^^^
          показываем выбранный вариант

Ответ: В Bitrix24 я бы создал воронку...
Оценка: 75/100
```

## Преимущества решения

✅ **Нет дублирования** - attachments/options только в JSON варианта  
✅ **Чистая структура** - нет старых полей после миграции  
✅ **Простая логика** - всегда работаем через variants  
✅ **Обратная совместимость** - старые вопросы = 1 вариант  
✅ **Гибкость JSON** - легко добавлять поля  
✅ **Меньше JOIN-ов** - всё в одном JSON поле  

## Следующие шаги

1. ✅ Backend: Entity + миграция БД (ГОТОВО)
2. ⏳ Backend: API для CRUD вариантов (TODO)
3. ⏳ Frontend: Типы + UI (TODO)
4. ⏳ Тестирование (TODO)

## Дата внедрения
05.02.2026 (Этап 1: Backend entities)
