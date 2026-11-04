'use client';

import { Alert, Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { msg, Trans } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import type { NewMetrics } from '@/hooks/useCandidateEvaluation';
import QuestionText from '@/components/QuestionText';
import { getBasicConditions, getOverallConditionStatus, getReportCompetencySummaries, getTechnicalKnowledge, getVerificationTopics, type EvidenceSession, type SummaryEvidence } from './candidateEvidence';

export default function CandidateEvidenceView({ metrics, session, evaluationStatus }: {
  metrics?: NewMetrics | null;
  session?: EvidenceSession | null;
  evaluationStatus?: string;
}) {
  const { _ } = useLingui();
  const labels: Record<string, string> = {
    motivation: _(msg`Мотивация к вакансии`),
    speech_culture: _(msg`Культура речи`),
    client_orientation: _(msg`Клиентоориентированность`),
    stress_resistance: _(msg`Стрессоустойчивость`),
  };
  const competencies = getReportCompetencySummaries(metrics, session);
  const knowledge = getTechnicalKnowledge(session);
  const topics = getVerificationTopics(metrics);
  const conditions = getBasicConditions(session);
  const overall = getOverallConditionStatus(conditions.map(item => item.status));
  const colors = { confirmed: 'success', mismatch: 'error', unverified: 'warning' } as const;
  const renderEvidence = (items: SummaryEvidence[]) => <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
    {items.map((item, index) => <Box component="li" key={index} sx={{ mb: 0.75 }}>
      {item.text && <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{item.literal ? `«${item.text}»` : item.text}</Typography>}
      {item.comment && <Typography variant="body2" color="text.secondary">{item.comment}</Typography>}
    </Box>)}
  </Box>;

  return <Stack spacing={3} sx={{ mb: 4 }}>
    {evaluationStatus !== 'done' && <Alert severity="info"><Trans>Оценка ещё не завершена. Доступные результаты могут быть неполными.</Trans></Alert>}
    {metrics?.insufficient_data && <Alert severity="warning">{metrics.reason || _(msg`Недостаточно данных для уверенной оценки компетенций`)}</Alert>}
    <Typography variant="h5" fontWeight={700}><Trans>Оценка по компетенциям</Trans></Typography>
    {competencies.length === 0 && <Alert severity="info"><Trans>Нет сохранённых данных по компетенциям</Trans></Alert>}
    {competencies.map(({ key, score, conclusion, positives, concerns, incomplete }) => <Card key={key} variant="outlined"><CardContent>
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2} mb={1.5}>
        <Typography variant="h6">{labels[key] || key}</Typography>
        <Typography fontWeight={600}>{score !== undefined ? `${score}/10` : _(msg`Нет оценки`)}</Typography>
      </Stack>
      <Typography variant="body2" sx={{ mb: 1.5, whiteSpace: 'pre-wrap' }}><strong><Trans>Вывод:</Trans></strong>{' '}{conclusion || _(msg`Общий вывод не сохранён.`)}</Typography>
      <Stack spacing={1}>
        <Typography variant="subtitle2" color="success.main">{positives.length > 0 && positives.every(item => item.literal) ? _(msg`Плюсы`) : _(msg`Плюсы (подтверждения)`)}</Typography>
        {positives.length ? renderEvidence(positives) : <Typography variant="body2" color="text.secondary"><Trans>Подтверждения не сохранены.</Trans></Typography>}
        <Typography variant="subtitle2" color="warning.main">{concerns.length > 0 && concerns.every(item => item.literal) ? _(msg`Минусы`) : _(msg`Минусы (основания и замечания)`)}</Typography>
        {concerns.length ? renderEvidence(concerns) : <Typography variant="body2" color="text.secondary"><Trans>Основания для минусов не сохранены.</Trans></Typography>}
        {incomplete && <Typography variant="caption" color="text.secondary"><Trans>Данных недостаточно для полного вывода.</Trans></Typography>}
      </Stack>
    </CardContent></Card>)}
    <Card variant="outlined"><CardContent>
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2} mb={1.5}>
        <Typography variant="h6"><Trans>Технические знания</Trans></Typography>
        <Typography fontWeight={600}>{knowledge.score !== undefined ? `${knowledge.score}/10` : _(msg`Нет оценки`)}</Typography>
      </Stack>
      <Typography variant="body2" sx={{ mb: 1.5 }}><strong><Trans>Вывод:</Trans></strong>{' '}
        {knowledge.assessedCount > 0
          ? <Trans>Итоговая оценка рассчитана по {knowledge.assessedCount} оценённым ответам из {knowledge.totalAnswers}.</Trans>
          : <Trans>Оценённые ответы на вопросы знаний не сохранены.</Trans>}
        {knowledge.unscoredCount > 0 && <> <Trans>{knowledge.unscoredCount} ответов без оценки не отнесены к плюсам или минусам.</Trans></>}
      </Typography>
      <Stack spacing={1}>
        <Typography variant="subtitle2" color="success.main">{knowledge.positives.length ? _(msg`Плюсы`) : _(msg`Плюсы (подтверждения)`)}</Typography>
        {knowledge.positives.length ? renderEvidence(knowledge.positives) : <Typography variant="body2" color="text.secondary"><Trans>Подтверждения не сохранены.</Trans></Typography>}
        <Typography variant="subtitle2" color="warning.main">{knowledge.concerns.length ? _(msg`Минусы`) : _(msg`Минусы (основания и замечания)`)}</Typography>
        {knowledge.concerns.length ? renderEvidence(knowledge.concerns) : <Typography variant="body2" color="text.secondary"><Trans>Основания для минусов не сохранены.</Trans></Typography>}
      </Stack>
    </CardContent></Card>
    <Card variant="outlined"><CardContent>
      <Typography variant="h5" fontWeight={700} gutterBottom><Trans>Гигиенические вопросы (Базовый скрининг)</Trans></Typography>
      <Alert severity={colors[overall]}>
        <Typography variant="body2" fontWeight={600}>
          {overall === 'confirmed' ? _(msg`Пройдены. Замечаний нет.`) : overall === 'mismatch' ? _(msg`Есть несоответствия`) : _(msg`Требует уточнения`)}
        </Typography>
        <Typography variant="body2">
          {conditions.length === 0
            ? _(msg`Вопросы базовых условий не отмечены или ещё не загружены`)
            : overall === 'confirmed'
              ? _(msg`Кандидат подтвердил все отмеченные базовые условия вакансии.`)
              : overall === 'mismatch'
                ? _(msg`Не все базовые условия вакансии подтверждены. Несоответствия можно проверить в деталях интервью.`)
                : _(msg`По части базовых условий нет проверенного результата. Уточните их на интервью.`)}
        </Typography>
      </Alert>
    </CardContent></Card>
    <Card variant="outlined"><CardContent>
      <Typography variant="h5" fontWeight={700} gutterBottom><Trans>Темы для проверки на интервью</Trans></Typography>
      <Stack spacing={2}>{topics.length ? topics.map((topic, index) => <Box key={`${topic.competency}-${index}`}>
        <Typography variant="subtitle1" fontWeight={600} color="error.main">{topic.name}</Typography>
        <Typography variant="caption" color="text.secondary">{labels[topic.competency] || topic.competency}</Typography>
        {topic.comment && <Typography variant="body2" sx={{ mt: 0.5 }}>{topic.comment}</Typography>}
        <Typography variant="body2" fontWeight={600} sx={{ mt: 1 }}><Trans>Цитата или подтверждение из ответа:</Trans></Typography>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{topic.evidence}</Typography>
        <Typography variant="body2" fontWeight={600} sx={{ mt: 1 }}><Trans>Что проверить на интервью:</Trans></Typography>
        <Typography variant="body2"><Trans>Попросить привести конкретный рабочий пример по теме «{topic.name}»: ситуация, действия кандидата и результат. Уточнить выявленное замечание на практическом кейсе.</Trans></Typography>
      </Box>) : <Typography color="text.secondary"><Trans>Существенные минусы с подтверждениями для дополнительной проверки не сохранены.</Trans></Typography>}</Stack>
    </CardContent></Card>
    {(session?.answers ?? []).some(answer => answer.hasRedFlag) && <Card variant="outlined"><CardContent>
      <Typography variant="h5" fontWeight={700} gutterBottom><Trans>Сработавшие красные флаги</Trans></Typography>
      <Stack spacing={2}>{session?.answers?.filter(answer => answer.hasRedFlag).map((answer, index) => <Box key={answer.id ?? index}>
        <QuestionText text={answer.question || ''} variant="body2" />
        <Typography variant="body2">{answer.text || _(msg`Нет текстового ответа`)}</Typography>
      </Box>)}</Stack>
    </CardContent></Card>}
  </Stack>;
}
