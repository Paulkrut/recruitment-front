# Changelog: Auto-submit при истечении времени в тестах по регламентам

**Дата:** 03.11.2025  
**Задача:** Исправить обработку истечения времени на вопрос в тестах по регламентам

---

## 🐛 Проблема

При истечении времени на вопрос (`maxTime`), если пользователь не записывал ответ:
- Таймер доходил до 0
- В консоли: `"Auto-submitting due to timeout"` → `"No recording, skipping question..."`
- Вопрос пропускался локально (`skipToNextQuestion()`)
- **НЕ отправлялось** ничего на сервер
- В БД не создавалась запись для этого вопроса
- HR не видел что вопрос был показан и пропущен

---

## ✅ Решение

### Frontend изменения

**Файл:** `recruitment-front/src/app/test/[token]/page.tsx`

1. **Изменена логика `handleAutoSubmit()`:**
   ```typescript
   // Было:
   else {
     console.log('No recording, skipping question...');
     skipToNextQuestion(); // ❌ Просто пропуск
   }

   // Стало:
   else {
     console.log('No recording, submitting empty answer...');
     handleSubmitEmptyAnswer(); // ✅ Отправка на сервер
   }
   ```

2. **Добавлена новая функция `handleSubmitEmptyAnswer()`:**
   - Останавливает таймер
   - Создаёт `FormData` с `questionId` и пустым `answerText`
   - Отправляет POST запрос на `/api/public/regulation-tests/session/{id}/answer`
   - Обрабатывает ошибки (402, 404, 410)
   - Переходит к следующему вопросу при успехе

---

### Backend изменения

**Файл:** `recruitment/src/Service/RegulationAnswerEvaluatorService.php`

**Метод:** `evaluateAnswer()`

```php
// Добавлена проверка на пустой ответ после транскрипции
$answerText = trim($answer->getAnswerText());
if (empty($answerText)) {
    // Пустой ответ = автоматически 0 баллов
    $answer->setAiScore(0);
    $answer->setAiComment('Ответ не был дан (время истекло или вопрос пропущен)');
    $answer->setProcessingStatus('completed');
    return;
}
```

**Логика:**
1. Если `answerText` пустая строка после `trim()`
2. Не вызывать AI для оценки
3. Сразу установить:
   - `ai_score`: 0
   - `ai_comment`: "Ответ не был дан (время истекло или вопрос пропущен)"
   - `processing_status`: "completed"
4. Вернуться (не продолжать обработку)

---

## 📊 Результат

### Что теперь происходит при истечении времени:

| Сценарий | Действие системы | Результат в БД |
|----------|------------------|----------------|
| Запись идёт (`recording = true`) | Останавливает запись → создаёт blob → отправляет | `video_filename` или `audio_filename` заполнено, AI оценка |
| Blob готов (`audioBlob` существует) | Отправляет готовый blob | `video_filename` или `audio_filename` заполнено, AI оценка |
| Нет записи (`audioBlob = null`) | **✅ НОВОЕ:** Отправляет пустой ответ | `answer_text = ''`, `ai_score = 0`, комментарий |

---

## 🎯 Преимущества

1. ✅ **Полная статистика:** HR видит сколько вопросов было пропущено
2. ✅ **Корректный подсчёт:** Каждый вопрос имеет запись в БД
3. ✅ **Прозрачность:** HR может понять почему низкий балл (не знал / не успел / технические проблемы)
4. ✅ **Защита от эксплуатации:** Пропуск сложного вопроса = 0 баллов
5. ✅ **Единообразие данных:** Проще делать JOIN и аналитику

---

## 🧪 Как тестировать

1. Создать тест с `maxTimePerQuestion = 10` секунд
2. Открыть тест: `http://localhost:3002/test/[token]`
3. **НЕ** нажимать "🎤 Записать ответ"
4. Дождаться когда таймер дойдёт до 0

**Ожидаемое поведение:**
- В консоли браузера: `"No recording, submitting empty answer..."`
- Автоматический переход к следующему вопросу
- В БД появится запись:
  ```sql
  SELECT * FROM regulation_test_answer WHERE question_id = ...;
  -- answer_text: ''
  -- ai_score: 0
  -- ai_comment: 'Ответ не был дан (время истекло или вопрос пропущен)'
  -- processing_status: 'completed'
  ```

5. В HR панели результатов (`/hr/regulation-tests/[id]/results/[sessionId]`):
   - Вопрос отображается
   - Оценка: 0/100
   - Комментарий: "Ответ не был дан (время истекло или вопрос пропущен)"

---

## 📝 Изменённые файлы

### Frontend:
- ✅ `recruitment-front/src/app/test/[token]/page.tsx`
  - Modified: `handleAutoSubmit()`
  - Added: `handleSubmitEmptyAnswer()`

### Backend:
- ✅ `recruitment/src/Service/RegulationAnswerEvaluatorService.php`
  - Modified: `evaluateAnswer()` - добавлена проверка на пустой ответ

### Документация:
- ✅ `recruitment-front/REGULATION_TEST_TIMEOUT.md` (новый файл)
- ✅ `recruitment-front/REGULATION_TEST_TIMEOUT_QUICK_START.md` (новый файл)

---

## 🔗 Связанные функции

Эта логика работает вместе с:
- ⏱️ Таймер на вопрос (`maxTime`, `maxTimePerQuestion`)
- 🎥 Запись видео/аудио ответов
- 🎤 Whisper транскрипция
- 🤖 AI оценка ответов
- 🔄 Retake функционал (для интервью)

---

## ⚠️ Важные замечания

1. **Backend уже поддерживал пустые ответы:**
   ```php
   $answer->setAnswerText($data['answerText'] ?? ''); // ✅ Уже было
   ```
   Мы просто не использовали эту возможность на frontend.

2. **Не нужна миграция БД:**
   - Структура таблицы не менялась
   - `answer_text` может быть пустой строкой (не NULL)

3. **AI не вызывается для пустых ответов:**
   - Экономия API запросов к DeepInfra
   - Быстрая обработка (instant 0 баллов)

4. **Работает для всех типов вопросов:**
   - `text` - пустой ответ = 0 баллов
   - `multiple_choice` - пустой ответ = 0 баллов

---

## ✨ Итог

Система теперь **полностью и корректно** обрабатывает все сценарии истечения времени на вопрос. Пропущенные вопросы фиксируются в БД с 0 баллами, обеспечивая HR полную и честную статистику прохождения теста! 🎉

