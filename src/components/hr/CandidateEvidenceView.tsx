'use client';

import { Alert, Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { msg, Trans } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import type { NewMetrics } from '@/hooks/useCandidateEvaluation';
import QuestionText from '@/components/QuestionText';
import { getBasicConditions, getOverallConditionStatus, getReportCompetencySummaries, getTechnicalKnowledge, getVerificationTopics, type EvidenceSession, type SummaryEvidence } from './candidateEvidence';

const COMPETENCY_KEYS = ['motivation', 'client_orientation', 'stress_resistance', 'speech_culture'] as const;

export default function CandidateEvidenceView({ metrics, session, evaluationStatus }: {
  metrics?: NewMetrics | null;
  session?: EvidenceSession | null;
  evaluationStatus?: string;
}) {
  const { _ } = useLingui();
  const labels: Record<string, string> = {
    motivation: _(msg`Мотивация к вакансии`),
    client_orientation: _(msg`Клиентоориентированность`),
    stress_resistance: _(msg`Стрессоустойчивость`),
    speech_culture: _(msg`Культура речи`),
  };
  const competencyData = getReportCompetencySummaries(metrics, session);
  const competencies = COMPETENCY_KEYS.map(key => competencyData.find(item => item.key === key) ?? {
    key, positives: [], concerns: [], evidence: [], incomplete: true,
  });
  const knowledge = getTechnicalKnowledge(session);
  const topics = getVerificationTopics(metrics);
  const conditions = getBasicConditions(session);
  const overall = getOverallConditionStatus(conditions.map(item => item.status));
  const colors = { confirmed: 'success', mismatch: 'error', unverified: 'warning' } as const;
  const scoreColor = (score?: number) => score === undefined ? 'default' : score >= 8 ? 'success' : score >= 6 ? 'warning' : 'error';
  const renderEvidence = (items: SummaryEvidence[]) => items.map((item, index) => <Box key={`${item.text}-${index}`} sx={{ mb: 1 }}>
    {item.text && <Typography variant="body2" sx={item.literal ? { whiteSpace: 'pre-wrap', borderLeft: 2, borderColor: 'divider', bgcolor: 'action.hover', px: 1.25, py: 0.75 } : { whiteSpace: 'pre-wrap' }}>{item.literal ? `«${item.text}»` : item.text}</Typography>}
    {item.comment && <Typography variant="body2" color="text.secondary" sx={{ mt: item.text ? 0.5 : 0 }}>{item.comment}</Typography>}
  </Box>);

  const renderCompetency = ({ key, score, conclusion, positives, concerns, incomplete }: (typeof competencyData)[number]) => <Card key={key} variant="outlined"><CardContent sx={{ '&:last-child': { pb: 2 } }}>
    <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2} mb={1.5}>
      <Typography variant="h6" fontWeight={700}>{labels[key]}</Typography>
      <Chip size="small" sx={{ flexShrink: 0 }} variant={score === undefined ? 'outlined' : 'filled'} color={scoreColor(score)} label={score !== undefined ? `${score}/10` : _(msg`Нет оценки`)} />
    </Stack>
    {conclusion && <Typography variant="body2" sx={{ mb: 1.5, whiteSpace: 'pre-wrap' }}><strong><Trans>Вывод:</Trans></strong>{' '}{conclusion}</Typography>}
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' }, gap: 2, overflowWrap: 'anywhere' }}>
      <Box><Typography variant="subtitle2" color="success.main" sx={{ mb: 0.5 }}><Trans>Плюсы</Trans></Typography>
        {positives.length ? renderEvidence(positives) : <Typography variant="body2" color="text.secondary"><Trans>Недостаточно данных для оценки сильных сторон</Trans></Typography>}
      </Box>
      <Box><Typography variant="subtitle2" color="error.main" sx={{ mb: 0.5 }}><Trans>Минусы</Trans></Typography>
        {concerns.length ? renderEvidence(concerns) : <Typography variant="body2" color="text.secondary"><Trans>Недостаточно данных для оценки слабых сторон</Trans></Typography>}
      </Box>
    </Box>
    {incomplete && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}><Trans>Данных недостаточно для полного вывода.</Trans></Typography>}
  </CardContent></Card>;

  return <Stack spacing={2} sx={{ mb: 4 }}>
    {evaluationStatus !== 'done' && <Alert severity="info"><Trans>Оценка ещё не завершена. Доступные результаты могут быть неполными.</Trans></Alert>}
    {metrics?.insufficient_data && <Alert severity="warning">{metrics.reason || _(msg`Недостаточно данных для уверенной оценки компетенций`)}</Alert>}
    <Typography variant="h5" fontWeight={700}><Trans>Оценка по компетенциям</Trans></Typography>
    {competencies.filter(item => item.key !== 'speech_culture').map(renderCompetency)}
    <Card variant="outlined"><CardContent sx={{ '&:last-child': { pb: 2 } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
        <Typography variant="h6" fontWeight={700}><Trans>Технические знания</Trans></Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="caption" color="text.secondary"><Trans>Оценено ответов: {knowledge.assessedCount} из {knowledge.totalAnswers}</Trans></Typography>
          <Chip size="small" variant={knowledge.score === undefined ? 'outlined' : 'filled'} color={scoreColor(knowledge.score)} label={knowledge.score !== undefined ? `${knowledge.score}/10` : _(msg`Нет оценки`)} />
        </Stack>
      </Stack>
      {(knowledge.positives.length > 0 || knowledge.concerns.length > 0) && <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}><Trans>Сохранённые комментарии к оценённым ответам</Trans></Typography>}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' }, gap: 2, mt: 1, overflowWrap: 'anywhere' }}>
        <Box><Typography variant="subtitle2" color="success.main" sx={{ mb: 0.5 }}><Trans>Плюсы</Trans></Typography>
          {knowledge.positives.length ? renderEvidence(knowledge.positives) : <Typography variant="body2" color="text.secondary"><Trans>Недостаточно данных для оценки сильных сторон</Trans></Typography>}
        </Box>
        <Box><Typography variant="subtitle2" color="error.main" sx={{ mb: 0.5 }}><Trans>Минусы</Trans></Typography>
          {knowledge.concerns.length ? renderEvidence(knowledge.concerns) : <Typography variant="body2" color="text.secondary"><Trans>Недостаточно данных для оценки слабых сторон</Trans></Typography>}
        </Box>
      </Box>
    </CardContent></Card>
    {competencies.filter(item => item.key === 'speech_culture').map(renderCompetency)}
    <Card variant="outlined"><CardContent>
      <Typography variant="h6" fontWeight={700} gutterBottom><Trans>Гигиенические вопросы (Базовый скрининг)</Trans></Typography>
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
      <Typography variant="h6" fontWeight={700} gutterBottom><Trans>Темы для проверки на интервью</Trans></Typography>
      <Stack spacing={1.5}>{topics.length ? topics.map((topic, index) => <Box key={`${topic.competency}-${index}`}>
        <Typography variant="subtitle1" fontWeight={600} color="error.main">{topic.name}</Typography>
        <Typography variant="caption" color="text.secondary">{labels[topic.competency] || topic.competency}</Typography>
        {topic.comment && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{topic.comment}</Typography>}
        <Box sx={{ borderLeft: 2, borderColor: 'divider', bgcolor: 'action.hover', px: 1.25, py: 0.75, mt: 1 }}>
          <Typography variant="caption" color="text.secondary"><Trans>Цитата или подтверждение из ответа:</Trans></Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{topic.evidence}</Typography>
        </Box>
        <Box sx={{ bgcolor: 'action.selected', borderRadius: 1, px: 1.25, py: 0.75, mt: 1 }}>
          <Typography variant="caption" color="text.secondary"><Trans>Что проверить на интервью:</Trans></Typography>
          <Typography variant="body2"><Trans>Попросить привести конкретный рабочий пример по теме «{topic.name}»: ситуация, действия кандидата и результат. Уточнить выявленное замечание на практическом кейсе.</Trans></Typography>
        </Box>
      </Box>) : <Typography color="text.secondary"><Trans>Существенные минусы с подтверждениями для дополнительной проверки не сохранены.</Trans></Typography>}</Stack>
    </CardContent></Card>
    {(session?.answers ?? []).some(answer => answer.hasRedFlag) && <Card variant="outlined"><CardContent>
      <Typography variant="h6" fontWeight={700} gutterBottom><Trans>Сработавшие красные флаги</Trans></Typography>
      <Stack spacing={2}>{session?.answers?.filter(answer => answer.hasRedFlag).map((answer, index) => <Box key={answer.id ?? index}>
        <QuestionText text={answer.question || ''} variant="body2" />
        <Typography variant="body2">{answer.text || _(msg`Нет текстового ответа`)}</Typography>
      </Box>)}</Stack>
    </CardContent></Card>}
  </Stack>;
}
