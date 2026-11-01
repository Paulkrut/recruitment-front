# Backend логика: Выбор вариантов вопросов

## Обзор

Реализация логики выбора и использования вариантов вопросов при создании интервью.

## Компоненты

### 1. QuestionVariantSelectorService

**Файл**: `src/Service/QuestionVariantSelectorService.php`

Центральный сервис для работы с вариантами вопросов.

#### Основные методы:

**createSessionQuestion()**
```php
public function createSessionQuestion(
    InterviewQuestion $question,
    InterviewSession $session,
    ?self $parent = null
): InterviewSessionQuestion
```

Создает `InterviewSessionQuestion` из `InterviewQuestion`:
1. Выбирает вариант (случайный или единственный)
2. Копирует ОБЩИЕ параметры из `InterviewQuestion`
3. Копирует ИНДИВИДУАЛЬНЫЕ параметры из выбранного `QuestionVariant`
4. Сохраняет `selectedVariantId` для аналитики

**selectVariant()** (private)
```php
private function selectVariant(InterviewQuestion $question): QuestionVariant
```

Логика выбора варианта:
- Если `useVariants = true` И вариантов > 1 → случайный выбор через `array_rand()`
- Иначе → первый вариант (единственный)

**getVariantForSessionQuestion()**
```php
public function getVariantForSessionQuestion(
    InterviewSessionQuestion $sessionQuestion
): ?QuestionVariant
```

Загружает выбранный вариант для существующего `SessionQuestion`:
- Используется для получения `attachments` при показе вопроса
- Возвращает `null` для старых вопросов (до миграции)

### 2. Обновленные контроллеры

#### PublicInterviewController

**Создание вопросов сессии** (строки 314-328):

```php
foreach ($tplQuestions as $q) {
    // ✅ НОВОЕ: Используем сервис для выбора варианта
    $sq = $this->variantSelector->createSessionQuestion($q, $session);
    $this->em->persist($sq);
    
    $this->interviewLogger->logDebug('Вопрос сессии создан', [
        'selected_variant_id' => $sq->getSelectedVariantId(),
        'use_variants' => $q->getUseVariants(),
    ]);
}
```

**Получение attachments** (строки 1393-1419):

```php
if ($q instanceof \App\Entity\InterviewSessionQuestion) {
    if (!$q->isGenerated()) {
        // ✅ НОВОЕ: Загружаем attachments из выбранного варианта
        $selectedVariant = $this->variantSelector->getVariantForSessionQuestion($q);
        
        if ($selectedVariant) {
            $attachments = $selectedVariant->getAttachments() ?? [];
        }
    }
}
```

#### DemoDataService

**Создание демо-интервью** (строки 238-256):

```php
foreach ($templateQuestions as $tq) {
    // ✅ НОВОЕ: Используем сервис вместо ручного копирования
    $sq = $this->variantSelector->createSessionQuestion($tq, $session);
    $this->em->persist($sq);
    $sessionQuestions[] = $sq;
}
```

### 3. Repository

**QuestionVariantRepository**

Файл: `src/Repository/QuestionVariantRepository.php`

Стандартный Doctrine repository для `QuestionVariant`.

## Алгоритм выбора варианта

### Блок-схема

```
Начало
  ↓
Получить variants из InterviewQuestion
  ↓
variants.isEmpty()?
  ├─ Да → Exception (нужна миграция)
  └─ Нет ↓
     useVariants = true И count(variants) > 1?
       ├─ Да → Случайный выбор через array_rand()
       └─ Нет → Первый вариант (variants.first())
            ↓
       Выбранный вариант
            ↓
       Копировать в InterviewSessionQuestion:
         - Общие параметры (из InterviewQuestion)
         - Индивидуальные параметры (из QuestionVariant)
         - Сохранить selected_variant_id
            ↓
       Конец
```

### Код выбора

```php
private function selectVariant(InterviewQuestion $question): QuestionVariant
{
    $variants = $question->getVariants();

    if ($variants->isEmpty()) {
        throw new \RuntimeException('Question has no variants');
    }

    // Режим вариантов: случайный выбор
    if ($question->getUseVariants() && $variants->count() > 1) {
        $variantsArray = $variants->toArray();
        $randomIndex = array_rand($variantsArray);
        return $variantsArray[$randomIndex];
    }

    // Обычный режим: первый вариант
    return $variants->first();
}
```

## Примеры использования

### Пример 1: Обычный вопрос (1 вариант)

```php
// InterviewQuestion
$question = [
    'useVariants' => false,
    'variants' => [
        ['id' => 1, 'text' => 'Расскажите о себе', 'position' => 1]
    ]
];

// selectVariant() всегда вернет вариант с id=1
// Кандидат A: вариант 1
// Кандидат B: вариант 1
// Кандидат C: вариант 1
```

### Пример 2: Вопрос с 3 вариантами

```php
// InterviewQuestion
$question = [
    'useVariants' => true,
    'variants' => [
        ['id' => 1, 'text' => 'Опишите опыт с amoCRM', 'position' => 1],
        ['id' => 2, 'text' => 'Опишите опыт с Bitrix24', 'position' => 2],
        ['id' => 3, 'text' => 'Опишите опыт с Salesforce', 'position' => 3]
    ]
];

// selectVariant() вернет случайный вариант
// Кандидат A: вариант 2 (array_rand вернул индекс 1)
// Кандидат B: вариант 1 (array_rand вернул индекс 0)
// Кандидат C: вариант 3 (array_rand вернул индекс 2)
// Кандидат D: вариант 2 (array_rand вернул индекс 1)
```

### Пример 3: Attachments из варианта

```php
// При прохождении интервью
$sessionQuestion = [
    'id' => 123,
    'text' => 'Опишите опыт с Bitrix24', // Уже выбрано
    'selected_variant_id' => 2,
];

// Загружаем вариант
$variant = $variantSelector->getVariantForSessionQuestion($sessionQuestion);

// Получаем attachments
$attachments = $variant->getAttachments();
// [
//   {"id": "att1", "type": "pdf", "filename": "bitrix_guide.pdf", ...}
// ]
```

## Логирование

### При создании сессии

```php
$this->logger->debug('Selected question variant', [
    'question_id' => 123,
    'use_variants' => true,
    'total_variants' => 3,
    'selected_variant_id' => 2,
    'selected_variant_position' => 2,
]);
```

### При создании SessionQuestion

```php
$this->interviewLogger->logDebug('Вопрос сессии создан', [
    'session_id' => 456,
    'question_id' => 123,
    'selected_variant_id' => 2,
    'use_variants' => true,
    'text' => substr($sq->getText(), 0, 100),
]);
```

### При загрузке варианта

```php
// Если вариант не найден
$this->logger->warning('Selected variant not found', [
    'session_question_id' => 789,
    'variant_id' => 999, // не существует
]);

// Если старый вопрос (до миграции)
$this->logger->debug('Session question has no selected variant (created before variants feature)', [
    'session_question_id' => 111,
]);
```

## Миграция существующих данных

### До миграции

```php
InterviewQuestion {
    text: "Вопрос",
    referenceAnswer: "Ответ",
    attachments: [...]
}
↓ создание сессии
InterviewSessionQuestion {
    text: "Вопрос", // копируется напрямую
    selectedVariantId: NULL
}
```

### После миграции

```php
InterviewQuestion {
    useVariants: false,
    variants: [
        QuestionVariant {
            id: 1,
            text: "Вопрос",
            referenceAnswer: "Ответ",
            attachments: [...]
        }
    ]
}
↓ QuestionVariantSelectorService
InterviewSessionQuestion {
    text: "Вопрос", // из варианта
    selectedVariantId: 1 // ✅ НОВОЕ
}
```

## Обработка ошибок

### Вопрос без вариантов

```php
try {
    $sq = $variantSelector->createSessionQuestion($question, $session);
} catch (\RuntimeException $e) {
    // "Question 123 has no variants. Run migration: app:migrate-question-variants"
    $this->logger->error('Question migration required', [
        'question_id' => $question->getId(),
    ]);
}
```

### Вариант не найден

```php
$variant = $variantSelector->getVariantForSessionQuestion($sessionQuestion);

if (!$variant) {
    // Fallback: вопрос создан до миграции или вариант удален
    $attachments = [];
}
```

## Преимущества реализации

✅ **Централизованная логика** - вся логика выбора в одном сервисе  
✅ **Повторное использование** - сервис используется во всех контроллерах  
✅ **Логирование** - все действия логируются  
✅ **Обратная совместимость** - работает со старыми вопросами  
✅ **Тестируемость** - легко тестировать отдельный сервис  

## Следующие шаги

- ⏳ Admin API для CRUD вариантов
- ⏳ Frontend типы и UI
- ⏳ Валидация (минимум 2 варианта если useVariants=true)

## Дата внедрения
05.02.2026 (Этап 2: Backend логика)
