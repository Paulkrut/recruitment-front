# ⏱️ Auto-submit при истечении времени - Quick Start

## Проблема (исправлена ✅)

**Было:** Когда таймер доходил до 0 и пользователь не записал ответ, вопрос просто пропускался без отправки на сервер.

**Стало:** Система отправляет пустой ответ с 0 баллов, обеспечивая полную статистику.

---

## Логика обработки

### 3 сценария при истечении таймера:

```
┌─────────────────────────────────────────┐
│ Таймер дошёл до 0                       │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────┴─────────┐
        │ handleAutoSubmit()│
        └─────────┬─────────┘
                  │
        ┌─────────┴──────────┐
        │                    │
┌───────▼────────┐   ┌──────▼──────────┐   ┌──────────▼─────────┐
│ recording?     │   │ audioBlob?      │   │ Нет записи         │
│ ✅ Да          │   │ ✅ Да           │   │ ❌ Нет             │
└───────┬────────┘   └──────┬──────────┘   └──────────┬─────────┘
        │                    │                          │
┌───────▼────────┐   ┌──────▼──────────┐   ┌──────────▼─────────┐
│ Останавливаем  │   │ Отправляем      │   │ Отправляем пустой  │
│ запись → blob  │   │ готовый blob    │   │ ответ → 0 баллов   │
└───────┬────────┘   └──────┬──────────┘   └──────────┬─────────┘
        │                    │                          │
        └────────────────────┴──────────────────────────┘
                             │
                  ┌──────────▼───────────┐
                  │ Следующий вопрос     │
                  └──────────────────────┘
```

---

## Ключевые изменения

### Frontend: `recruitment-front/src/app/test/[token]/page.tsx`

```typescript
const handleAutoSubmit = () => {
  if (recording && mediaRecorder) {
    // 1. Запись идёт → останавливаем и отправляем
    handleStopRecording();
  } else if (audioBlob) {
    // 2. Blob готов → отправляем
    handleSubmitAnswer();
  } else {
    // 3. Нет записи → пустой ответ ✅ НОВОЕ!
    handleSubmitEmptyAnswer();
  }
};

const handleSubmitEmptyAnswer = async () => {
  const formData = new FormData();
  formData.append('questionId', currentQuestion.id.toString());
  formData.append('answerText', ''); // Пустая строка

  await fetch(`${API_BASE}/api/public/regulation-tests/session/${sessionId}/answer`, {
    method: 'POST',
    body: formData,
  });

  skipToNextQuestion();
};
```

### Backend: `recruitment/src/Service/RegulationAnswerEvaluatorService.php`

```php
public function evaluateAnswer(RegulationTestAnswer $answer): void
{
    // ... транскрипция видео/аудио ...

    // ✅ НОВОЕ! Проверка на пустой ответ
    $answerText = trim($answer->getAnswerText());
    if (empty($answerText)) {
        $answer->setAiScore(0);
        $answer->setAiComment('Ответ не был дан (время истекло или вопрос пропущен)');
        $answer->setProcessingStatus('completed');
        return;
    }

    // ... дальнейшая оценка ...
}
```

---

## Что теперь сохраняется в БД

### Пустой ответ (time expired):
```sql
regulation_test_answer:
  answer_text: ''  -- пусто
  ai_score: 0      -- 0 баллов
  ai_comment: 'Ответ не был дан (время истекло или вопрос пропущен)'
  processing_status: 'completed'
```

### Записанный ответ (auto-stopped):
```sql
regulation_test_answer:
  video_filename: 'regulation_answers/xxx.webm'
  transcription: 'Текст из речи...'
  ai_score: 75      -- AI оценка
  ai_comment: 'Ответ правильный...'
  processing_status: 'completed'
```

---

## Тестирование

```bash
# 1. Открыть тест по регламенту
http://localhost:3002/test/[token]

# 2. НЕ записывать ответ, дождаться таймера → 0
# Ожидается:
# - В консоли: "No recording, submitting empty answer..."
# - Переход к следующему вопросу
# - В БД: answer_text = '', ai_score = 0

# 3. Проверить в HR панели:
http://localhost:3002/hr/regulation-tests/[id]/results/[sessionId]
# Должен быть виден вопрос с оценкой 0/100 и комментарием
```

---

## Связанные документы

📄 **Полная документация:** [`REGULATION_TEST_TIMEOUT.md`](./REGULATION_TEST_TIMEOUT.md)

📄 **Retake функционал:** [`INTERVIEW_RETAKE_FEATURE.md`](./INTERVIEW_RETAKE_FEATURE.md)

