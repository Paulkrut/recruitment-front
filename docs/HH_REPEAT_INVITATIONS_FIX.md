# Исправление: Повторные приглашения на интервью через HH

## Проблемы

При отправке повторных приглашений кандидатам через HH обнаружены две критические проблемы:

### Проблема 1: Приглашения отправляются всем, даже прошедшим интервью ❌

Повторные приглашения получали:
- ✅ Кандидаты, которые не начали интервью
- ✅ Кандидаты, которые начали но не завершили
- ❌ **Кандидаты, которые УЖЕ ПРОШЛИ интервью** (status=finished, есть ответы)

### Проблема 2: Обращение по фамилии вместо имени ❌

В письмах было обращение вида:
```
Здравствуйте, Гончаров!
```

Вместо правильного:
```
Здравствуйте, Иван!
```

### Причины

#### Причина проблемы 1

В методе `findCandidatesForRepeatInvitation` SQL запрос использовал `leftJoin` для answers и проверку `COUNT(ans.id) = 0`, что могло работать некорректно для завершённых интервью из-за особенностей агрегации в GROUP BY.

**Старый код**:
```php
->leftJoin('isess.answers', 'ans')
->andWhere(
    $qb->expr()->orX(
        'isess.id IS NULL',
        $qb->expr()->andX(
            'isess.id IS NOT NULL',
            'isess.status IN (:statuses)', // ready, in_progress
            $qb->expr()->isNull('ans.id')
        )
    )
)
->having('COUNT(ans.id) = 0')
```

#### Причина проблемы 2

HH присылает имя кандидата в виде отдельных полей:
- `first_name`: "Иван"
- `last_name`: "Гончаров"
- `middle_name`: "Петрович"

В `VacancySyncService` эти данные собираются в формат **"Фамилия Имя Отчество"**:

```php
// src/Service/VacancySyncService.php:301
$fullName = trim(implode(' ', array_filter([$lastName, $firstName, $middleName])));
// Результат: "Гончаров Иван Петрович"
```

Но в `parseFullName` логика была неправильной:

```php
// ❌ СТАРАЯ логика
$parts = explode(' ', trim($fullName));

return [
    'firstName' => $parts[0] ?? '', // ← Это ФАМИЛИЯ!
    'lastName' => $parts[1] ?? '',  // ← Это ИМЯ!
];
```

При разборе строки "Гончаров Иван Петрович":
- `firstName` = "Гончаров" ❌ (на самом деле фамилия)
- `lastName` = "Иван" ❌ (на самом деле имя)

Поэтому шаблон `Здравствуйте, {firstName}!` превращался в `Здравствуйте, Гончаров!`

## Решения

### Решение 1: Улучшенная фильтрация кандидатов

**Файл**: `src/Command/SendRepeatInvitationsCommand.php`

#### Изменения в SQL запросе

1. Упрощён запрос: убраны `leftJoin` на answers и `having`
2. Добавлено явное исключение статуса `finished`:

```php
->andWhere(
    $qb->expr()->orX(
        'isess.id IS NULL', // Нет сессии - подходит
        $qb->expr()->andX(
            'isess.id IS NOT NULL',
            'isess.status != :finishedStatus' // ✅ Исключаем завершённые
        )
    )
)
->setParameter('finishedStatus', 'finished')
```

#### Дополнительная проверка на уровне PHP

Добавлен `array_filter` для дополнительной проверки:

```php
return array_filter($results, function(Candidate $candidate) {
    $session = $candidate->getHhCandidate()?->getInterviewSession();
    if (!$session) {
        return true; // Нет сессии - подходит
    }
    
    // Если сессия завершена или есть хотя бы один ответ - НЕ подходит
    if ($session->getStatus() === 'finished' || $session->getAnswers()->count() > 0) {
        return false;
    }
    
    return true;
});
```

### Решение 2: Корректный парсинг ФИО

**Файл**: `src/Service/HhMessageTemplateService.php`

Исправлен метод `parseFullName` с учётом формата "Фамилия Имя Отчество":

**До**:
```php
private function parseFullName(string $fullName): array
{
    $parts = explode(' ', trim($fullName));
    
    return [
        'firstName' => $parts[0] ?? '', // ❌ Фамилия
        'lastName' => $parts[1] ?? '',  // ❌ Имя
    ];
}
```

**После**:
```php
private function parseFullName(string $fullName): array
{
    $parts = explode(' ', trim($fullName));
    
    return [
        'firstName' => $parts[1] ?? $parts[0] ?? '', // ✅ Имя (2-е слово), fallback на 1-е
        'lastName' => $parts[0] ?? '',                // ✅ Фамилия (1-е слово)
        'middleName' => $parts[2] ?? '',              // ✅ Отчество (3-е слово)
    ];
}
```

**Логика fallback**: Если в ФИО только одно слово (например "Иван"), оно используется как `firstName` и `lastName` одновременно.

#### Затронутые сообщения

Исправление применяется ко ВСЕМ типам сообщений через HH:
- ✅ Первичные приглашения (`generateAiInvitationMessage`)
- ✅ Повторные приглашения (`generateRepeatInvitationMessage`)
- ✅ Напоминания (`generateReminderMessage`)
- ✅ Отказы (`generateRejectionMessage`)

### Дополнительные улучшения в SendCandidateReminderHandler

**Файл**: `src/MessageHandler/SendCandidateReminderHandler.php`

#### 1. Улучшена проверка завершённости интервью

**До**:
```php
if ($interviewSession && $interviewSession->getCompletedAt()) {
    return; // Пропускаем
}
```

**После**:
```php
if ($interviewSession) {
    // Проверяем: если интервью завершено ИЛИ есть хотя бы один ответ - не отправляем
    if ($interviewSession->getStatus() === 'finished' || 
        $interviewSession->getCompletedAt() ||
        $interviewSession->getAnswers()->count() > 0) {
        return; // Пропускаем
    }
}
```

#### 2. ✅ Добавлена проверка актуальности настроек вакансии

**Проблема**: Если напоминания были отключены ПОСЛЕ планирования, они всё равно отправлялись.

**Сценарий**:
```
День 0: reminders.enabled = true → отправили приглашение → запланировали напоминание
День 3: HR отключил reminders.enabled = false
День 7: Напоминание всё равно отправлялось! ❌
```

**Решение**:
```php
// Проверяем что напоминания ВСЁ ЕЩЁ включены
if (!($settings['reminders']['enabled'] ?? false)) {
    $this->logger->debug('Reminders disabled in vacancy settings, skipping');
    return;
}
```

Теперь если HR отключил напоминания после планирования - они **НЕ отправятся** ✅

## Результаты

### До исправления ❌
- Повторные приглашения отправлялись кандидатам с завершёнными интервью
- Обращение: `Здравствуйте, Гончаров!` (фамилия)

### После исправления ✅
- Повторные приглашения отправляются ТОЛЬКО кандидатам без завершённого интервью
- Обращение: `Здравствуйте, Иван!` (имя)

## Примеры

### Пример ФИО из HH

**Исходные данные**:
```json
{
  "first_name": "Иван",
  "last_name": "Гончаров",
  "middle_name": "Петрович"
}
```

**Хранится в БД**:
```
"Гончаров Иван Петрович"
```

**Разбор через parseFullName**:
```php
[
  'firstName' => 'Иван',      // ✅ Правильно
  'lastName' => 'Гончаров',   // ✅ Правильно
  'middleName' => 'Петрович'  // ✅ Правильно
]
```

**Результат в письме**:
```
Здравствуйте, Иван! ✅
```

### Сценарии фильтрации кандидатов

| Статус сессии | Есть ответы | Отправлять повторное? |
|---------------|-------------|----------------------|
| NULL (нет сессии) | N/A | ✅ ДА |
| `ready` | Нет | ✅ ДА |
| `ready` | Есть | ❌ НЕТ |
| `in_progress` | Нет | ✅ ДА |
| `in_progress` | Есть | ❌ НЕТ |
| `finished` | Любые | ❌ НЕТ |

## Файлы

- `src/Service/HhMessageTemplateService.php` - исправлен `parseFullName`
- `src/Command/SendRepeatInvitationsCommand.php` - улучшена фильтрация кандидатов
- `src/MessageHandler/SendCandidateReminderHandler.php` - улучшена проверка завершённости

## Тестирование

### Как протестировать исправление имён

1. Найти кандидата с ФИО "Гончаров Иван Петрович"
2. Отправить ему повторное приглашение командой:
   ```bash
   php bin/console app:send-repeat-invitations VACANCY_ID --dry-run
   ```
3. Проверить сгенерированное сообщение - должно быть "Здравствуйте, Иван!"

### Как протестировать фильтрацию

1. Создать тестовых кандидатов:
   - Кандидат A: приглашение отправлено, интервью НЕ начато
   - Кандидат B: приглашение отправлено, интервью завершено (status=finished)
   - Кандидат C: приглашение отправлено, есть хотя бы 1 ответ

2. Запустить команду:
   ```bash
   php bin/console app:send-repeat-invitations VACANCY_ID --dry-run
   ```

3. Проверить результат:
   - ✅ Кандидат A должен быть в списке
   - ❌ Кандидат B НЕ должен быть в списке
   - ❌ Кандидат C НЕ должен быть в списке

## Дата внедрения
05.02.2026
