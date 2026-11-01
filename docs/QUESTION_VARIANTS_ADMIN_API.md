# Варианты вопросов - Admin API

## Обзор

Admin API (панель HR) обновлен для работы с вариантами вопросов. Поддерживается **обратная совместимость** со старым форматом (single text/referenceAnswer/attachments на уровне вопроса).

## 📋 Структура данных

### Формат API для вопроса с вариантами

```json
{
  "id": 123,
  "position": 0,
  
  // ✅ ОБЩИЕ параметры (влияют на все варианты)
  "type": "text",
  "inputMode": "text",
  "questionType": "open",
  "maxTime": 180,
  "allowFollowups": false,
  "followupsMax": 0,
  "isRedFlag": false,
  "affectsKnowledge": true,
  
  // ✅ ВАРИАНТЫ
  "useVariants": true,
  "variants": [
    {
      "id": 1,
      "text": "Вариант 1: Какой ваш опыт работы с React?",
      "referenceAnswer": "Ожидаем описание проектов...",
      "attachments": [],
      "options": [],
      "position": 1
    },
    {
      "id": 2,
      "text": "Вариант 2: Расскажите о сложном проекте на React",
      "referenceAnswer": "Ожидаем конкретные примеры...",
      "attachments": [],
      "options": [],
      "position": 2
    }
  ],
  
  // ⚠️ Для обратной совместимости дублируются данные первого варианта
  "text": "Вариант 1: Какой ваш опыт работы с React?",
  "referenceAnswer": "Ожидаем описание проектов...",
  "attachments": [],
  "options": []
}
```

### Старый формат (обратная совместимость)

```json
{
  "id": 123,
  "text": "Какой ваш опыт работы с React?",
  "referenceAnswer": "Ожидаем описание проектов...",
  "attachments": [],
  "options": [],
  "type": "text",
  "inputMode": "text",
  "questionType": "open",
  "maxTime": 180,
  "isRedFlag": false,
  "affectsKnowledge": true
}
```

> ⚠️ При сохранении в старом формате автоматически создается 1 вариант с `useVariants = false`.

## 🔧 Компоненты Backend

### 1. **QuestionApiService**

**Файл**: `src/Service/QuestionApiService.php`

**Методы**:

- `createQuestionFromApiData(InterviewTemplate $template, array $data, int $position): InterviewQuestion`
  - Создает `InterviewQuestion` из данных API
  - Поддерживает как новый формат (variants), так и старый
  - Если `variants` присутствует → создает варианты
  - Если `variants` отсутствует → создает 1 вариант из `text`, `referenceAnswer`, etc.

- `questionToApiFormat(InterviewQuestion $question): array`
  - Преобразует `InterviewQuestion` в формат API
  - Возвращает все варианты + дублирует первый вариант на уровень вопроса (обратная совместимость)

- `validateQuestionData(array $data): array`
  - Валидация данных вопроса
  - Проверяет количество вариантов (min 2 если `useVariants=true`, ровно 1 если `false`)
  - Максимум 10 вариантов

### 2. **QuestionValidator**

**Файл**: `src/Service/QuestionValidator.php`

**Обновления**:

- Проверка вариантов:
  - Если `useVariants=true` → минимум 2 варианта
  - Если `useVariants=false` → ровно 1 вариант
  - Максимум 10 вариантов
  - Текст каждого варианта обязателен

- Проверка для **choice** вопросов:
  - Каждый вариант должен иметь минимум 2 `options`
  - Если `affectsKnowledge=true` или `isRedFlag=true` → каждый вариант должен иметь правильные ответы (`isCorrect=true`)

- Проверка для **open** вопросов с Red Flag:
  - Если `isRedFlag=true` и `affectsKnowledge=false` → каждый вариант должен иметь `referenceAnswer`

### 3. **AdminVacancyController**

**Файл**: `src/Controller/Api/AdminVacancyController.php`

**Обновленные методы**:

- `createWithTemplate(Request $req): JsonResponse` (POST `/api/admin/vacancies/with-template`)
  - Использует `QuestionApiService->createQuestionFromApiData()`
  - Валидирует через `QuestionValidator`

- `updateWithTemplate(int $id, Request $req): JsonResponse` (PUT `/api/admin/vacancies/{id}/with-template`)
  - Удаляет старые вопросы, создает новые через `QuestionApiService`

- `showFull(Vacancy $v): JsonResponse` (GET `/api/admin/vacancies/{id}/full`)
  - Использует `QuestionApiService->questionToApiFormat()` для возврата вопросов

### 4. **AdminTemplateController**

**Файл**: `src/Controller/Api/AdminTemplateController.php`

**Обновленные методы**:

- `detail(InterviewTemplate $tpl): JsonResponse` (GET `/api/admin/templates/{id}`)
  - Возвращает вопросы через `QuestionApiService->questionToApiFormat()`

- `create(Request $request): JsonResponse` (POST `/api/admin/templates`)
  - Создает вопросы через `QuestionApiService->createQuestionFromApiData()`

- `update(InterviewTemplate $tpl, Request $request): JsonResponse` (PUT `/api/admin/templates/{id}`)
  - Удаляет старые вопросы, создает новые через `QuestionApiService`

## 📊 Правила валидации

### Количество вариантов
- `useVariants = true` → минимум **2** варианта, максимум **10**
- `useVariants = false` → ровно **1** вариант

### Текст варианта
- Каждый вариант должен иметь непустой `text`

### Choice вопросы
- Каждый вариант должен иметь минимум **2** `options`
- Если `affectsKnowledge=true` или `isRedFlag=true`:
  - Каждый вариант должен иметь хотя бы один правильный ответ (`isCorrect=true`)

### Open вопросы с Red Flag
- Если `isRedFlag=true` и `affectsKnowledge=false`:
  - Каждый вариант должен иметь `referenceAnswer`

## 🔄 Примеры использования

### Создание вопроса с 2 вариантами (НОВЫЙ ФОРМАТ)

```http
POST /api/admin/vacancies/with-template
Content-Type: application/json

{
  "title": "Backend Developer",
  "questions": [
    {
      "questionType": "open",
      "type": "text",
      "maxTime": 180,
      "isRedFlag": false,
      "affectsKnowledge": true,
      "useVariants": true,
      "variants": [
        {
          "text": "Вариант 1: Опишите ваш опыт с PostgreSQL",
          "referenceAnswer": "Должен упомянуть индексы, оптимизацию запросов",
          "attachments": [],
          "options": []
        },
        {
          "text": "Вариант 2: Как бы вы оптимизировали медленный SQL запрос?",
          "referenceAnswer": "EXPLAIN, индексы, денормализация",
          "attachments": [],
          "options": []
        }
      ]
    }
  ]
}
```

### Создание вопроса (СТАРЫЙ ФОРМАТ)

```http
POST /api/admin/vacancies/with-template
Content-Type: application/json

{
  "title": "Backend Developer",
  "questions": [
    {
      "text": "Опишите ваш опыт с PostgreSQL",
      "referenceAnswer": "Должен упомянуть индексы",
      "questionType": "open",
      "type": "text",
      "maxTime": 180,
      "isRedFlag": false,
      "affectsKnowledge": true
    }
  ]
}
```

> ✅ Автоматически создается 1 вариант с `useVariants=false`.

### Получение вопросов с вариантами

```http
GET /api/admin/vacancies/123/full
```

**Ответ**:
```json
{
  "id": 123,
  "title": "Backend Developer",
  "questions": [
    {
      "id": 456,
      "useVariants": true,
      "variants": [
        {
          "id": 1,
          "text": "Вариант 1: ...",
          "referenceAnswer": "...",
          "attachments": [],
          "options": [],
          "position": 1
        },
        {
          "id": 2,
          "text": "Вариант 2: ...",
          "referenceAnswer": "...",
          "attachments": [],
          "options": [],
          "position": 2
        }
      ],
      
      // Обратная совместимость - дублируем первый вариант
      "text": "Вариант 1: ...",
      "referenceAnswer": "...",
      "attachments": [],
      "options": []
    }
  ]
}
```

## 🚀 Миграция существующих данных

См. [QUESTION_VARIANTS_FEATURE.md](./QUESTION_VARIANTS_FEATURE.md) для деталей по миграции.

## 🔐 Безопасность

- ✅ Все endpoints защищены `#[IsGranted('IS_AUTHENTICATED_FULLY')]`
- ✅ `#[CompanyOwned]` атрибут проверяет доступ к ресурсам компании
- ✅ Валидация данных через `QuestionValidator` перед сохранением
- ✅ HTML-санитизация (уже реализована через `HtmlSanitizerService`)

## 📝 TODO (Frontend)

- [ ] Обновить TypeScript типы для `QuestionDraft` (добавить `variants`, `useVariants`)
- [ ] Создать UI для управления вариантами в форме редактирования вопроса
- [ ] Добавить валидацию на фронте (min 2 варианта если `useVariants=true`)
- [ ] Добавить тоггл "Использовать варианты"
- [ ] UI для добавления/удаления/редактирования вариантов
- [ ] Preview случайного варианта при редактировании

## 🎯 Резюме

1. **Обратная совместимость** сохранена - старый формат работает как раньше
2. **QuestionApiService** централизует логику преобразования
3. **QuestionValidator** проверяет корректность данных
4. **Admin API** обновлен для работы с вариантами
5. **Автоматическая миграция** через команду `php bin/console app:migrate:question-variants`
