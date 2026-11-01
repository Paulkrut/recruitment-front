# Краткая сводка: Исправление повторных приглашений HH

## Проблемы
1. **Отправка всем кандидатам** - повторные приглашения получали даже те, кто УЖЕ прошёл интервью
2. **Обращение по фамилии** - "Здравствуйте, Гончаров!" вместо "Здравствуйте, Иван!"

## Исправлено

### 1. HhMessageTemplateService.php
**Метод `parseFullName`** - корректный разбор ФИО в формате "Фамилия Имя Отчество":

```php
// БЫЛО:
'firstName' => $parts[0] ?? '',  // ← фамилия!
'lastName' => $parts[1] ?? '',   // ← имя!

// СТАЛО:
'firstName' => $parts[1] ?? $parts[0] ?? '',  // ✅ имя
'lastName' => $parts[0] ?? '',                // ✅ фамилия
'middleName' => $parts[2] ?? '',              // ✅ отчество
```

**Метод `generateRepeatInvitationMessage`** - добавлено обращение по имени:

```php
// БЫЛО:
$message = "Здравствуйте!\n\n";

// СТАЛО:
$message = "Здравствуйте, {$firstName}!\n\n";
```

### 2. SendRepeatInvitationsCommand.php
**Метод `findCandidatesForRepeatInvitation`**:
- Явное исключение статуса `finished` в SQL
- Дополнительная проверка через `array_filter`: исключаем кандидатов с ответами

### 3. SendCandidateReminderHandler.php
**Улучшена проверка завершённости интервью**:
```php
// Не отправляем если:
- status === 'finished' ИЛИ
- есть completedAt ИЛИ
- есть хотя бы 1 ответ
```

**✅ Добавлена проверка актуальности настроек**:
```php
// Проверяем что напоминания ВСЁ ЕЩЁ включены
if (!($settings['reminders']['enabled'] ?? false)) {
    return; // Настройки изменились - не отправляем
}
```

## Затронутые файлы
- ✅ `src/Service/HhMessageTemplateService.php`
- ✅ `src/Command/SendRepeatInvitationsCommand.php`
- ✅ `src/MessageHandler/SendCandidateReminderHandler.php`

## Результат
- ✅ Повторные приглашения отправляются ТОЛЬКО непрошедшим
- ✅ Обращение: "Здравствуйте, Иван!" (имя, не фамилия)
- ✅ Исправлено во ВСЕХ типах сообщений (приглашения, напоминания, отказы)

## Тестирование
```bash
# Режим dry-run (без реальной отправки)
php bin/console app:send-repeat-invitations VACANCY_ID --dry-run

# Проверить сгенерированные сообщения и список кандидатов
```

**Дата**: 05.02.2026
