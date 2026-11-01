# Варианты вопросов - ПОЛНАЯ РЕАЛИЗАЦИЯ ✅

## 🎯 Обзор

Реализована **полная** функциональность "Варианты вопросов" (рандомные вопросы) для усложнения списывания. Каждому кандидату показывается случайный вариант вопроса из созданных HR.

## ✅ Что реализовано

### Backend (100% готово)

#### 1. **Database & Entities**
- ✅ Entity `QuestionVariant` (text, referenceAnswer, attachments, options, position)
- ✅ Обновлена `InterviewQuestion` (удалены старые поля, добавлена связь variants)
- ✅ Обновлена `InterviewSessionQuestion` (selectedVariantId)
- ✅ Doctrine миграция `Version20260207100000AddQuestionVariants.php` - создание таблицы
- ✅ Doctrine миграция `Version20260207110000RemoveOldQuestionFields.php` - удаление старых полей
- ✅ Doctrine миграция `Version20260207120000RemoveUseVariantsFlag.php` - удаление флага

#### 2. **Core Logic**
- ✅ Сервис `QuestionVariantSelectorService`
  - Выбор случайного варианта при создании сессии
  - Сохранение `selectedVariantId`
  - Получение варианта для отображения attachments
- ✅ Обновлен `PublicInterviewController`
  - Использует `QuestionVariantSelectorService`
  - Возвращает attachments из выбранного варианта
- ✅ Обновлен `DemoDataService`

#### 3. **Admin API**
- ✅ Сервис `QuestionApiService`
  - `createQuestionFromApiData()` - создание с поддержкой вариантов
  - `questionToApiFormat()` - преобразование для API
  - `validateQuestionData()` - валидация
- ✅ Обновлен `QuestionValidator`
  - Проверка количества вариантов (min 2, max 10)
  - Валидация для choice (правильные ответы)
  - Валидация для open с Red Flag (referenceAnswer)
- ✅ Обновлен `AdminVacancyController`
  - `createWithTemplate()`
  - `updateWithTemplate()`
  - `showFull()`
- ✅ Обновлен `AdminTemplateController`
  - `detail()`
  - `create()`
  - `update()`

### Frontend (100% готово)

#### 1. **TypeScript типы**
- ✅ Тип `QuestionVariantDraft`
- ✅ Обновлен `QuestionDraft` (useVariants, variants)
- ✅ Функция `validateQuestionVariants()`
- ✅ Обновлена `validateChoiceQuestion()`
- ✅ Обновлена `validateQuestions()`

#### 2. **UI Components**
- ✅ Новый компонент `QuestionVariantsEditor`
  - Добавление/удаление вариантов (2-10)
  - Сворачивание/разворачивание
  - Редактирование текста (RichTextEditor)
  - Редактирование эталонного ответа
  - Редактирование options (QuestionOptionsEditor)
  - Управление attachments (QuestionAttachmentUploader)
  - Счетчик вариантов (X/10)
  - Валидация на лету

- ✅ Обновлен `QuestionFormItem`
  - Тумблер "Использовать варианты"
  - Интеграция `QuestionVariantsEditor`
  - Скрытие старых полей при useVariants=true
  - Обновлена `hasExpertSettings()`
  - Обновлена `resetToDefault()`

## 📊 Архитектура

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        HR Panel                              │
├─────────────────────────────────────────────────────────────┤
│ 1. HR включает "Использовать варианты"                      │
│ 2. Редактирует варианты (text, referenceAnswer, ...)        │
│ 3. Сохраняет вопрос                                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
        POST /api/admin/vacancies/{id}/with-template
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              QuestionApiService.createQuestionFromApiData    │
├─────────────────────────────────────────────────────────────┤
│ - Создает InterviewQuestion                                  │
│ - Создает QuestionVariant[] для каждого варианта            │
│ - Сохраняет в БД                                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
               ┌───────────────┐
               │   DATABASE    │
               │ question      │
               │ - useVariants │
               │               │
               │ variants[]    │
               │ - text        │
               │ - reference   │
               │ - attachments │
               │ - options     │
               └───────┬───────┘
                       │
          ┌────────────┴────────────┐
          │                         │
          ▼                         ▼
┌────────────────┐      ┌─────────────────────┐
│ Candidate      │      │ HR views question   │
│ starts         │      │ GET /full           │
│ interview      │      │ returns variants[]  │
└────────┬───────┘      └─────────────────────┘
         │
         ▼
 QuestionVariantSelectorService.createSessionQuestion()
         │
         ├─ selectVariant() → random choice
         │
         ├─ Copy properties from QuestionVariant
         │  to InterviewSessionQuestion
         │
         └─ Save selectedVariantId
                 │
                 ▼
    InterviewSessionQuestion
    - selectedVariantId (1, 2, 3...)
    - text (from variant)
    - referenceAnswer (from variant)
    - attachments (from variant)
    - options (from variant)
```

### Ключевые решения

1. **QuestionVariant = отдельная entity** (не JSON)
   - ✅ Нормализация
   - ✅ Миграции проще
   - ✅ Типизация Doctrine

2. **attachments & options = JSON** внутри QuestionVariant
   - ✅ Гибкость
   - ✅ Нет лишних join-ов
   - ✅ Упрощение миграции

3. **selectedVariantId** в InterviewSessionQuestion
   - ✅ Отслеживание выбранного варианта
   - ✅ Получение attachments из правильного варианта
   - ✅ Аудит/аналитика

## 🔄 Обратная совместимость

✅ **100% сохранена**:

- Старые вопросы без вариантов продолжают работать
- При создании вопроса в старом формате автоматически создается 1 вариант
- При возврате через API первый вариант дублируется на уровень вопроса
- Миграция `MigrateQuestionVariantsCommand` для существующих вопросов

## 📋 API Format

### Создание вопроса с вариантами

```json
POST /api/admin/vacancies/with-template

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
          "referenceAnswer": "Должен упомянуть индексы, оптимизацию",
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

### Получение вопросов

```json
GET /api/admin/vacancies/{id}/full

{
  "questions": [
    {
      "id": 123,
      "useVariants": true,
      "variants": [
        {
          "id": 1,
          "text": "Вариант 1...",
          "referenceAnswer": "...",
          "attachments": [],
          "options": [],
          "position": 1
        },
        {
          "id": 2,
          "text": "Вариант 2...",
          "referenceAnswer": "...",
          "attachments": [],
          "options": [],
          "position": 2
        }
      ],
      
      // Обратная совместимость - дублируем первый вариант
      "text": "Вариант 1...",
      "referenceAnswer": "...",
      "attachments": [],
      "options": []
    }
  ]
}
```

## 📁 Файлы

### Backend - Новые:
```
src/Entity/QuestionVariant.php
src/Repository/QuestionVariantRepository.php
src/Service/QuestionVariantSelectorService.php
src/Service/QuestionApiService.php
src/Command/MigrateQuestionVariantsCommand.php
migrations/Version20260207100000AddQuestionVariants.php
```

### Backend - Обновленные:
```
src/Entity/InterviewQuestion.php
src/Entity/InterviewSessionQuestion.php
src/Controller/Api/PublicInterviewController.php
src/Controller/Api/AdminVacancyController.php
src/Controller/Api/AdminTemplateController.php
src/Service/QuestionValidator.php
src/Service/DemoDataService.php
```

### Frontend - Новые:
```
src/components/question/QuestionVariantsEditor.tsx
```

### Frontend - Обновленные:
```
src/types/question.ts
src/components/QuestionFormItem.tsx
```

### Документация:
```
docs/QUESTION_VARIANTS_FEATURE.md
docs/QUESTION_VARIANTS_BACKEND_LOGIC.md
docs/QUESTION_VARIANTS_ADMIN_API.md
docs/QUESTION_VARIANTS_BACKEND_COMPLETE.md
docs/QUESTION_VARIANTS_FRONTEND.md
docs/QUESTION_VARIANTS_COMPLETE.md (этот файл)
```

## 🧪 Тестирование

### 1. Миграция данных

```bash
# Dry-run
php bin/console app:migrate:question-variants --dry-run

# Реальная миграция
php bin/console app:migrate:question-variants --force
```

### 2. Backend API

```bash
# Создать вопрос с вариантами
curl -X POST http://recruitment.test/api/admin/vacancies/with-template \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","questions":[{"useVariants":true,"variants":[...]}]}'

# Получить вопросы
curl http://recruitment.test/api/admin/vacancies/1/full
```

### 3. Frontend (Панель HR)

1. Открыть редактирование вакансии
2. Включить экспертный режим
3. Включить тумблер "Использовать варианты"
4. Добавить 2-3 варианта
5. Отредактировать текст каждого варианта
6. Добавить attachments (если есть questionId)
7. Сохранить вакансию
8. Перезагрузить страницу - проверить сохранение

### 4. Кандидат (Интервью)

1. Создать несколько кандидатов для одной вакансии
2. Открыть интервью для каждого
3. Проверить, что показываются разные варианты вопросов
4. Проверить, что attachments отображаются корректно

## 🎉 Итоги

### Реализовано:
- ✅ Backend: Database, Entities, Migrations
- ✅ Backend: Core Logic (QuestionVariantSelectorService)
- ✅ Backend: Admin API (QuestionApiService, Controllers)
- ✅ Backend: Валидация
- ✅ Frontend: TypeScript типы
- ✅ Frontend: UI компоненты (QuestionVariantsEditor)
- ✅ Frontend: Интеграция в QuestionFormItem
- ✅ Frontend: Валидация
- ✅ Документация

### Готово к использованию!

Функция "Варианты вопросов" полностью реализована на Backend и Frontend. Можно переходить к тестированию на dev/staging окружении.

## 📖 Дополнительные материалы

- [Общее описание фичи](./QUESTION_VARIANTS_FEATURE.md)
- [Backend Core Logic](./QUESTION_VARIANTS_BACKEND_LOGIC.md)
- [Admin API](./QUESTION_VARIANTS_ADMIN_API.md)
- [Backend сводка](./QUESTION_VARIANTS_BACKEND_COMPLETE.md)
- [Frontend сводка](./QUESTION_VARIANTS_FRONTEND.md)
