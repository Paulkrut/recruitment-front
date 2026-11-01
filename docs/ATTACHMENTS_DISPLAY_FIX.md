# Исправление: Дублирующиеся attachments не отображаются в интервью

## Проблема

При прохождении интервью, если один и тот же PDF (или другой файл) был прикреплен к нескольким вопросам:
- К первому вопросу (PDF + audio): оба файла видны ✅
- Ко второму вопросу (только PDF): файл **не виден** ❌

### Причина

В компоненте `QuestionAttachmentsDisplay.tsx` при маппинге attachments не использовался `key` prop:

```tsx
// ❌ БЕЗ key prop
{attachments.map((attachment) => renderAttachment(attachment))}
```

Когда один и тот же attachment (с одинаковым `id`) использовался в разных вопросах, React не мог правильно отличить элементы и **не перерисовывал** их при изменении вопроса.

## Решение

### 1. Frontend: Исправлен key для attachments

**Файл**: `src/components/QuestionAttachmentsDisplay.tsx`

Добавлен уникальный `key` prop, комбинирующий `attachment.id` и `index`:

```tsx
// ✅ С уникальным key prop
{attachments.map((attachment, index) => (
  <div key={`${attachment.id}-${index}`}>
    {renderAttachment(attachment)}
  </div>
))}
```

Также удалены дублирующиеся `key` из элементов внутри `renderAttachment`, так как ключ уже установлен на уровне обёртки.

**До**:
```tsx
case 'document':
  return (
    <Box key={attachment.id} sx={{...}}>
      {/* content */}
    </Box>
  );
```

**После**:
```tsx
case 'document':
  return (
    <Box sx={{...}}>
      {/* content */}
    </Box>
  );
```

### 2. Backend: Добавлено логирование для отладки

**Файл**: `src/Controller/Api/PublicInterviewController.php`

В метод `formatQuestionForResponse` добавлено:
- Проверка, что `attachments` - это массив (не null)
- Проверка, что `options` - это массив (не null)
- Debug логирование для отладки

```php
// Убеждаемся, что attachments - это массив (не null)
if (!is_array($attachments)) {
    $attachments = [];
}

// Логирование для отладки
$this->logger->debug('formatQuestionForResponse attachments', [
    'question_id' => $q->getId(),
    'attachments_count' => count($attachments),
    'attachments' => $attachments
]);

return [
    // ...
    'options' => $q->getOptions() ?? [],
    'attachments' => $attachments,
];
```

## Результат

✅ Теперь PDF и DOC файлы корректно отображаются для всех вопросов интервью
✅ Один и тот же файл, прикрепленный к разным вопросам, отображается для каждого вопроса
✅ React правильно идентифицирует и перерисовывает элементы attachments при смене вопроса

## Техническая информация

### Почему использован `${attachment.id}-${index}`?

- **Только `attachment.id`**: Не работает, так как один и тот же файл имеет одинаковый ID
- **Только `index`**: Небезопасно, так как может сломаться при динамическом изменении массива
- **Комбинация `${attachment.id}-${index}`**: ✅ Уникальный ключ для каждой комбинации файла и позиции

### Альтернативные решения (не использованы)

1. **Генерировать новый UUID для каждого attachment при копировании вопроса**
   - ❌ Сложнее реализовать
   - ❌ Усложняет логику на бэкенде
   - ❌ Увеличивает размер базы данных

2. **Использовать questionId + attachmentId как key**
   - ✅ Более семантичный ключ
   - ❌ Требует прокидывания questionId в компонент
   - ⚠️ Можно рассмотреть в будущем для улучшения

## Файлы

- `src/components/QuestionAttachmentsDisplay.tsx` - исправлен key prop
- `src/Controller/Api/PublicInterviewController.php` - добавлено логирование

## Дата
05.02.2026
