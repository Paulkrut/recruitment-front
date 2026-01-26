# Интеграция текстовых вопросов - ЗАВЕРШЕНО ✅

## Что было сделано

### Backend (PHP/Symfony)
✅ Миграции БД
✅ Entities (InterviewQuestion, InterviewAnswer, TypingMetrics)
✅ Repositories (TypingMetricsRepository)
✅ Services (TypingMetricsService, InterviewAiFacade)
✅ Промпты для AI
✅ Handlers (ScoreAnswerHandler, EvaluateCandidateHandler)
✅ API (PublicInterviewController)

### Frontend (Next.js/React)
✅ Форма редактирования вопроса с выбором типа
✅ Утилита TypingTracker для отслеживания метрик
✅ Компонент TextQuestionAnswer для письменных ответов
✅ Компонент QuestionTypeTransition для предупреждения о смене типа
✅ Интеграция в основной файл интервью (page.tsx)
✅ Обработчики для отправки текстовых ответов
✅ Проверка смены типа вопроса
✅ Компонент TypingMetricsDisplay для админки

## Следующие шаги

### 1. Запустить миграции
```bash
cd recruitment
php bin/console doctrine:migrations:migrate
```

### 2. Протестировать функционал
- [ ] Создать вакансию с текстовыми вопросами
- [ ] Пройти интервью
- [ ] Проверить отправку метрик
- [ ] Проверить AI анализ
- [ ] Проверить предупреждение при смене типа вопроса

### 3. Интегрировать TypingMetricsDisplay в админку
В файле `recruitment-front/src/app/(DashboardLayout)/hr/candidates/[id]/page.tsx`:

1. Импортировать компонент:
```typescript
import TypingMetricsDisplay from '@/components/hr/TypingMetricsDisplay';
```

2. Загрузить метрики при загрузке ответов (в API добавить поле `typingMetrics`)

3. Добавить рендеринг в аккордеон ответа (после текста ответа):
```typescript
{a.answerType === 'typing' && a.typingMetrics && (
  <Accordion sx={{ mt: 2 }}>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Typography variant="body2" fontWeight={600}>
        <Trans>Метрики печати</Trans>
      </Typography>
    </AccordionSummary>
    <AccordionDetails>
      <TypingMetricsDisplay metrics={a.typingMetrics} />
    </AccordionDetails>
  </Accordion>
)}
```

### 4. Обновить API для получения метрик
В `PublicInterviewController` или соответствующем контроллере для получения деталей кандидата:
- Добавить загрузку `TypingMetrics` для ответов типа 'typing'
- Включить в JSON response

## Архитектура

```
Frontend Flow:
1. HR создает вопрос и выбирает тип (video_audio | typing)
2. Кандидат проходит интервью
3. При смене типа → показывается предупреждение
4. Для typing → TextQuestionAnswer с TypingTracker
5. Метрики отправляются вместе с ответом

Backend Flow:
1. PublicInterviewController получает текстовый ответ + метрики
2. Создает InterviewAnswer (answerType = 'typing')
3. Создает TypingMetrics через TypingMetricsService
4. Отправляет ScoreAnswerMessage в очередь
5. ScoreAnswerHandler вызывает AI для оценки текста
6. EvaluateCandidateHandler анализирует грамотность при финальной оценке
```

## Важно

- ✅ Метрики печати НЕ анализируются AI (только для HR)
- ✅ AI оценивает только содержание (как для видео)
- ✅ Грамотность/стиль оцениваются отдельно в конце
- ✅ Предупреждение о замере скорости НЕ показывается
- ✅ Таймер работает автоматически для обоих типов


