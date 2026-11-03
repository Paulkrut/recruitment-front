'use client';

import { Alert, Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { msg, Trans } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import type { NewMetrics, CompetencyCriterion } from '@/hooks/useCandidateEvaluation';
import QuestionText from '@/components/QuestionText';
import { getBasicConditions, getOverallConditionStatus, getCompetencyEvidence, getVerificationTopics, type ScreeningQuestion } from './candidateEvidence';

export default function CandidateEvidenceView({ metrics, session, evaluationStatus }: {
  metrics?: NewMetrics | null;
  session?: { questions?: ScreeningQuestion[]; answers?: ScreeningQuestion[] } | null;
  evaluationStatus?: string;
}) {
  const { _ } = useLingui();
  const labels: Record<string, string> = {
    motivation: _(msg`Мотивация к вакансии`),
    speech_culture: _(msg`Культура речи`),
    client_orientation: _(msg`Клиентоориентированность`),
    stress_resistance: _(msg`Стрессоустойчивость`),
    responsibility: _(msg`Ответственность`),
    system_thinking: _(msg`Системное мышление`),
  };
  const competencies = getCompetencyEvidence(metrics);
  const topics = getVerificationTopics(metrics);
  const conditions = getBasicConditions(session);
  const overall = getOverallConditionStatus(conditions.map(item => item.status));
  const colors = { confirmed: 'success', mismatch: 'error', unverified: 'warning' } as const;
  const renderCriterion = (criterion: CompetencyCriterion, index: number) => (
    <Box key={`${criterion.name}-${index}`} sx={{ pl: 2, borderLeft: '2px solid', borderColor: 'divider' }}>
      <Typography variant="body2" fontWeight={600}>{criterion.name}</Typography>
      <Typography variant="caption" color="text.secondary">
        {criterion.status === 'yes' ? _(msg`Подтверждено`) : criterion.status === 'no' ? _(msg`Не подтверждено`) : criterion.status === 'partial' ? _(msg`Частично`) : _(msg`Не проверено`)}
      </Typography>
      {criterion.evidence && <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 0.5 }}>{criterion.evidence}</Typography>}
      {criterion.comment && <Typography variant="body2" color="text.secondary">{criterion.comment}</Typography>}
      {!criterion.evidence && <Typography variant="caption" color="text.secondary"><Trans>Цитата или доказательство не сохранены</Trans></Typography>}
    </Box>
  );

  return <Stack spacing={3} sx={{ mb: 4 }}>
    {evaluationStatus !== 'done' && <Alert severity="info"><Trans>Оценка ещё не завершена. Доступные результаты могут быть неполными.</Trans></Alert>}
    {metrics?.insufficient_data && <Alert severity="warning">{metrics.reason || _(msg`Недостаточно данных для уверенной оценки компетенций`)}</Alert>}
    <Typography variant="h5" fontWeight={700}><Trans>Оценка по компетенциям</Trans></Typography>
    {competencies.length === 0 && <Alert severity="info"><Trans>Нет сохранённых данных по компетенциям</Trans></Alert>}
    {competencies.map(({ key, competency, positives, concerns, unchecked }) => <Card key={key} variant="outlined"><CardContent>
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2} mb={2}>
        <Typography variant="h6">{labels[key] || key}</Typography>
        {[...positives, ...concerns].length > 0 && Number.isFinite(competency.score)
          ? <Chip label={`${competency.score}/10`} variant="outlined" />
          : <Chip label={_(msg`Не проверено`)} variant="outlined" />}
      </Stack>
      {(competency.overall_comment || competency.comment) && <Typography sx={{ mb: 2 }}>{competency.overall_comment || competency.comment}</Typography>}
      <Stack spacing={1.5}>
        <Typography variant="subtitle2" color="success.main"><Trans>Подтверждённые критерии</Trans></Typography>
        {positives.length ? positives.map(renderCriterion) : <Typography variant="body2" color="text.secondary"><Trans>Нет сохранённых подтверждений</Trans></Typography>}
        <Typography variant="subtitle2" color="warning.main"><Trans>Риски и частичные подтверждения</Trans></Typography>
        {concerns.length ? concerns.map(renderCriterion) : <Typography variant="body2" color="text.secondary"><Trans>Замечания по критериям не сохранены</Trans></Typography>}
        {unchecked.length > 0 && <><Typography variant="subtitle2"><Trans>Не проверено</Trans></Typography>{unchecked.map(renderCriterion)}</>}
        {!competency.criteria?.length && <Alert severity="info"><Trans>Детализация по критериям отсутствует в сохранённой оценке</Trans></Alert>}
        {!competency.criteria?.length && competency.evidence?.map((evidence, index) => <Typography key={index} variant="body2">{evidence}</Typography>)}
      </Stack>
    </CardContent></Card>)}
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
