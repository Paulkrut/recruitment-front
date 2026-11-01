# Исправление: Проверка актуальности настроек напоминаний

## Проблема

При отправке автоматических напоминаний не проверялось, что настройки **всё ещё активны** на момент отправки.

### Проблемный сценарий

```
День 0 (Понедельник):
  ✅ HR включил автоматические напоминания
  ✅ reminders.enabled = true
  ✅ reminders.daysAfter = 7
  ↓
  Кандидат откликнулся
  ↓
  Отправлено первое приглашение
  ↓
  Запланировано напоминание в очередь (DelayStamp = 7 дней)
  ↓
  [Сообщение ждёт в очереди Symfony Messenger]

День 3 (Четверг):
  ⚙️ HR изменил стратегию
  ⚙️ Отключил автоматические напоминания
  ❌ reminders.enabled = false
  ↓
  [Сообщение всё ещё в очереди!]

День 7 (Понедельник):
  ⏰ Messenger запускает обработчик SendCandidateReminderHandler
  ↓
  Получает настройки вакансии (reminders.enabled = false)
  ↓
  ❌ ПРОБЛЕМА: Нет проверки на enabled!
  ↓
  ❌ Напоминание ОТПРАВЛЯЕТСЯ, хотя настройки отключены!
```

### Причина

В `SendCandidateReminderHandler` (строки 96-102) не было проверки на `reminders.enabled`:

```php
$settings = $vacancy->getHhAutoSettings();
if (!$settings) {
    return;
}

// ❌ НЕТ ПРОВЕРКИ что reminders.enabled === true!

// Сразу отправка
$sent = $this->hhAutomationService->sendReminder($candidate, $settings);
```

## Решение

**Файл**: `src/MessageHandler/SendCandidateReminderHandler.php`

Добавлена проверка актуальности настроек ПЕРЕД отправкой:

```php
$settings = $vacancy->getHhAutoSettings();
if (!$settings) {
    return;
}

// ✅ Проверяем что напоминания ВСЁ ЕЩЁ включены
if (!($settings['reminders']['enabled'] ?? false)) {
    $this->logger->debug('Reminders disabled in vacancy settings, skipping', [
        'candidate_id' => $message->candidateId,
        'vacancy_id' => $vacancy->getId(),
    ]);
    return;
}

// Теперь отправляем
$sent = $this->hhAutomationService->sendReminder($candidate, $settings);
```

## Логика проверки

Обработчик `SendCandidateReminderHandler` теперь выполняет следующие проверки:

1. ✅ Кандидат существует?
2. ✅ Приглашение было отправлено? (`invitationSentAt`)
3. ✅ Интервью НЕ пройдено? (нет ответов, status != finished)
4. ✅ Статус кандидата не финальный? (не rejected/hired/withdrawn)
5. ✅ Напоминание ещё не отправлялось? (`reminderSentAt`)
6. ✅ **[НОВОЕ]** Напоминания всё ещё включены? (`reminders.enabled`)

Только если **ВСЕ** проверки прошли - напоминание отправляется.

## Результаты

### До исправления ❌

```
HR отключил напоминания → Старые запланированные всё равно отправятся ❌
```

### После исправления ✅

```
HR отключил напоминания → Старые запланированные НЕ отправятся ✅
```

## Важные детали

### Почему это важно?

1. **Изменение стратегии**: HR может решить изменить подход к коммуникации с кандидатами
2. **Массовая рассылка**: Если было запланировано много напоминаний, все они НЕ отправятся при отключении
3. **Согласованность**: Настройки вакансии всегда актуальны на момент действия

### Где ещё используется эта логика?

**При планировании** напоминания (`ProcessCandidateAutoInviteHandler`):

```php
// Проверка ПЕРЕД планированием
if (!$settings || !($settings['reminders']['enabled'] ?? false)) {
    return; // Не планируем
}

// Планируем
$this->messageBus->dispatch(
    new SendCandidateReminderMessage($candidate->getId()),
    [new DelayStamp($daysAfter * 86400 * 1000)]
);
```

**При выполнении** напоминания (`SendCandidateReminderHandler`):

```php
// ✅ ПОВТОРНАЯ проверка ПЕРЕД отправкой
if (!($settings['reminders']['enabled'] ?? false)) {
    return; // Настройки изменились - не отправляем
}
```

**Двойная защита** гарантирует что:
- Не планируем, если отключено
- Не отправляем, если отключили после планирования

## Логирование

При пропуске отправки из-за отключённых настроек записывается лог:

```json
{
  "level": "debug",
  "message": "Reminders disabled in vacancy settings, skipping",
  "context": {
    "candidate_id": 123,
    "vacancy_id": 45
  }
}
```

Это помогает отследить причину неотправки в логах.

## Смежная логика

Аналогичная проверка есть для **автоотказов** (`ProcessCandidateAutoRejectHandler`):

```php
if (!($settings['autoReject']['enabled'] ?? false)) {
    $this->logger->debug('Auto-reject disabled, skipping');
    return;
}
```

Теперь обе автоматизации (напоминания + автоотказы) проверяют актуальность настроек! ✅

## Тестирование

### Ручное тестирование

1. Создать вакансию с `reminders.enabled = true`, `daysAfter = 1` (1 день для быстроты)
2. Отправить приглашение кандидату → напоминание запланировано
3. Через 10 минут отключить `reminders.enabled = false`
4. Подождать 1 день (или запустить worker вручную)
5. Проверить логи: должна быть запись "Reminders disabled in vacancy settings, skipping"
6. Проверить HH: напоминание **НЕ отправлено** ✅

### Проверка через команду

```bash
# Запустить consumer вручную
php bin/console messenger:consume async -vv

# В логах искать:
# "Reminders disabled in vacancy settings, skipping"
```

## Файлы

- `src/MessageHandler/SendCandidateReminderHandler.php` - добавлена проверка `reminders.enabled`

## Дата внедрения
05.02.2026
