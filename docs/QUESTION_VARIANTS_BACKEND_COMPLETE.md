# Варианты вопросов - Backend реализация ЗАВЕРШЕНА ✅

## 🎯 Выполненные этапы

### ✅ Этап 1: Entities + Database
- Создана entity `QuestionVariant` с JSON полями для `attachments` и `options`
- Обновлена entity `InterviewQuestion` (добавлены `useVariants`, `variants`)
- Обновлена entity `InterviewSessionQuestion` (добавлен `selectedVariantId`)
- Создана Doctrine миграция `Version20260207100000AddQuestionVariants.php`
- Создана команда `MigrateQuestionVariantsCommand` для программной миграции

### ✅ Этап 2: Core Logic
- Создан сервис `QuestionVariantSelectorService` для выбора случайного варианта
- Обновлен `PublicInterviewController` для работы с вариантами при создании сессии
- Обновлен метод `formatQuestionForResponse` для возврата attachments из выбранного варианта
- Обновлен `DemoDataService` для использования `QuestionVariantSelectorService`

### ✅ Этап 3: Admin API (Панель HR)
- Создан сервис `QuestionApiService` для работы с API форматом
  - `createQuestionFromApiData()` - создание вопроса из API данных (поддержка старого и нового форматов)
  - `questionToApiFormat()` - преобразование вопроса в API формат
  - `validateQuestionData()` - валидация данных вопроса
- Обновлен сервис `QuestionValidator`
  - Проверка количества вариантов (min 2 для `useVariants=true`, ровно 1 для `false`)
  - Максимум 10 вариантов
  - Валидация для choice вопросов (правильные ответы в каждом варианте)
  - Валидация для open вопросов с Red Flag (referenceAnswer в каждом варианте)
- Обновлен `AdminVacancyController`
  - `createWithTemplate()` - использует `QuestionApiService`
  - `updateWithTemplate()` - использует `QuestionApiService`
  - `showFull()` - возвращает варианты через `questionToApiFormat()`
- Обновлен `AdminTemplateController`
  - `detail()` - возвращает варианты
  - `create()` - использует `QuestionApiService`
  - `update()` - использует `QuestionApiService`

## 📋 Файлы, созданные/обновленные

### Новые файлы:
```
src/Entity/QuestionVariant.php
src/Repository/QuestionVariantRepository.php
src/Service/QuestionVariantSelectorService.php
src/Service/QuestionApiService.php
src/Command/MigrateQuestionVariantsCommand.php
migrations/Version20260207100000AddQuestionVariants.php
docs/QUESTION_VARIANTS_FEATURE.md
docs/QUESTION_VARIANTS_BACKEND_LOGIC.md
docs/QUESTION_VARIANTS_ADMIN_API.md
docs/QUESTION_VARIANTS_BACKEND_COMPLETE.md (этот файл)
```

### Обновленные файлы:
```
src/Entity/InterviewQuestion.php
src/Entity/InterviewSessionQuestion.php
src/Controller/Api/PublicInterviewController.php
src/Controller/Api/AdminVacancyController.php
src/Controller/Api/AdminTemplateController.php
src/Service/QuestionValidator.php
src/Service/DemoDataService.php
```

## 🧪 Тестирование

### Запуск миграции:
```bash
# Dry-run (без изменений)
php bin/console app:migrate:question-variants --dry-run

# Реальная миграция
php bin/console app:migrate:question-variants --force
```

### Проверка через API:
```bash
# Получить вопросы вакансии с вариантами
curl http://recruitment.test/api/admin/vacancies/1/full

# Создать вопрос с вариантами
curl -X POST http://recruitment.test/api/admin/vacancies/with-template \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Vacancy",
    "questions": [{
      "useVariants": true,
      "questionType": "open",
      "type": "text",
      "maxTime": 180,
      "variants": [
        {"text": "Вариант 1", "referenceAnswer": "Ответ 1"},
        {"text": "Вариант 2", "referenceAnswer": "Ответ 2"}
      ]
    }]
  }'
```

### Проверка рандомного выбора:
1. Создать вопрос с 2+ вариантами
2. Открыть интервью несколько раз (для разных кандидатов)
3. Проверить, что показываются разные варианты

## 🔄 Обратная совместимость

✅ **Полностью сохранена**:
- Старый формат API (без `variants`) продолжает работать
- При создании вопроса в старом формате автоматически создается 1 вариант с `useVariants=false`
- При возврате вопросов в API формате первый вариант дублируется на уровень вопроса (для старых клиентов)
- Существующие вопросы мигрируются автоматически через `MigrateQuestionVariantsCommand`

## 📊 Архитектурные решения

### Почему QuestionVariant - отдельная entity, а не JSON?
- ✅ Нормализация данных (проще делать миграции, изменения структуры)
- ✅ Прямые связи через Doctrine (cascade, orphanRemoval)
- ✅ Возможность добавить индексы, поиск по вариантам
- ✅ Типизация на уровне PHP/Doctrine

### Почему attachments и options - JSON внутри QuestionVariant?
- ✅ Гибкая структура (разные типы вложений, разное количество)
- ✅ Не требуется дополнительных join-ов при получении вопроса
- ✅ Упрощение миграции (копируем JSON as-is)
- ✅ Соответствие текущей структуре в `InterviewQuestion`

### Почему QuestionApiService отдельно от QuestionVariantSelectorService?
- ✅ Разделение ответственности:
  - `QuestionVariantSelectorService` - логика выбора варианта (runtime, интервью)
  - `QuestionApiService` - преобразование данных (API layer, админка)
- ✅ Тестируемость
- ✅ Переиспользуемость

## ⏭️ Следующий этап: Frontend (Панель HR)

### TODO:
1. **TypeScript типы**
   - Обновить `QuestionDraft` (добавить `useVariants`, `variants`)
   - Создать тип `QuestionVariantDraft`

2. **UI компоненты**
   - Toggle "Использовать варианты"
   - Список вариантов с drag-and-drop для сортировки
   - Форма добавления/редактирования варианта
   - Кнопки добавить/удалить вариант
   - Preview случайного варианта

3. **Валидация на фронте**
   - Min 2 варианта если `useVariants=true`
   - Max 10 вариантов
   - Непустой текст для каждого варианта
   - Для choice: min 2 options, правильные ответы если нужно
   - Для open с Red Flag: referenceAnswer если нужно

4. **Интеграция**
   - Обновить формы создания/редактирования вопросов
   - Обновить отображение вопросов в списке
   - Протестировать создание/редактирование/удаление

## 📖 Документация

- [QUESTION_VARIANTS_FEATURE.md](./QUESTION_VARIANTS_FEATURE.md) - Общее описание фичи
- [QUESTION_VARIANTS_BACKEND_LOGIC.md](./QUESTION_VARIANTS_BACKEND_LOGIC.md) - Core Logic (этап 2)
- [QUESTION_VARIANTS_ADMIN_API.md](./QUESTION_VARIANTS_ADMIN_API.md) - Admin API (этап 3)

## 🎉 Готово к работе!

Backend полностью готов. Можно переходить к реализации Frontend для панели HR.
