"use client";
import React from 'react';
import {
  Box,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  Stack,
  Divider,
  Paper,
  LinearProgress,
  Collapse,
  IconButton,
} from '@mui/material';
import { Trans } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';
import type { NewMetrics } from '@/hooks/useCandidateEvaluation';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import RemoveIcon from '@mui/icons-material/Remove';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

interface CompetencyEvaluationTableProps {
  metrics: NewMetrics;
}

export default function CompetencyEvaluationTable({ metrics }: CompetencyEvaluationTableProps) {
  const { _ } = useLingui();
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set());

  const competencyLabels: Record<string, string> = {
    motivation: _(msg`Мотивация к вакансии`),
    speech_culture: _(msg`Культура речи`),
    client_orientation: _(msg`Клиентоориентированность`),
    stress_resistance: _(msg`Стрессоустойчивость`),
    responsibility: _(msg`Ответственность`),
    system_thinking: _(msg`Системное мышление`),
  };

  const competencyIcons: Record<string, string> = {
    motivation: '🚀',
    speech_culture: '💬',
    client_orientation: '🤝',
    stress_resistance: '🛡️',
    responsibility: '✅',
    system_thinking: '🧠',
  };

  const toggleRow = (key: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  // Функция для получения иконки статуса критерия
  const getCriterionStatusIcon = (status: string) => {
    switch (status) {
      case 'yes':
        return <CheckIcon fontSize="small" color="success" />;
      case 'no':
        return <CloseIcon fontSize="small" color="error" />;
      case 'partial':
        return <RemoveIcon fontSize="small" color="warning" />;
      case 'not_checked':
        return <HelpOutlineIcon fontSize="small" color="disabled" />;
      default:
        return null;
    }
  };

  // Функция для получения текста статуса
  const getCriterionStatusText = (status: string): string => {
    switch (status) {
      case 'yes':
        return _(msg`Да`);
      case 'no':
        return _(msg`Нет`);
      case 'partial':
        return _(msg`Частично`);
      case 'not_checked':
        return _(msg`Не проверено`);
      default:
        return status;
    }
  };

  // Проверка на недостаточность данных
  if (metrics.insufficient_data) {
    const coveredDimensions = metrics.covered_dimensions || [];
    const missingDimensions = metrics.missing_dimensions || [];
    const verificationNeeded = metrics.recommendation?.verification_needed || [];

    return (
      <Alert severity="warning" icon={<WarningIcon />}>
        <Typography variant="body1" fontWeight={600} gutterBottom>
          <Trans>⚠️ Недостаточно данных для объективной оценки</Trans>
        </Typography>
        <Typography variant="body2">
          {metrics.reason || _(msg`Система не нашла достаточно оснований для уверенной fit-оценки.`)}
        </Typography>

        {metrics.fit_confidence && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            <Trans>Уверенность системы:</Trans> {metrics.fit_confidence}
          </Typography>
        )}

        {coveredDimensions.length > 0 && (
          <Box sx={{ mt: 1.5 }}>
            <Typography variant="body2" fontWeight={600}>
              <Trans>Удалось частично оценить:</Trans>
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }} flexWrap="wrap">
              {coveredDimensions.map((dimension, idx) => (
                <Chip key={idx} label={competencyLabels[dimension] || dimension} size="small" color="info" />
              ))}
            </Stack>
          </Box>
        )}

        {missingDimensions.length > 0 && (
          <Box sx={{ mt: 1.5 }}>
            <Typography variant="body2" fontWeight={600}>
              <Trans>Не хватило данных по:</Trans>
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }} flexWrap="wrap">
              {missingDimensions.map((dimension, idx) => (
                <Chip key={idx} label={competencyLabels[dimension] || dimension} size="small" color="warning" />
              ))}
            </Stack>
          </Box>
        )}

        {verificationNeeded.length > 0 && (
          <Box sx={{ mt: 1.5 }}>
            <Typography variant="body2" fontWeight={600}>
              <Trans>Что стоит проверить дополнительно:</Trans>
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }} flexWrap="wrap">
              {verificationNeeded.map((dimension, idx) => (
                <Chip key={idx} label={competencyLabels[dimension] || dimension} size="small" color="default" />
              ))}
            </Stack>
          </Box>
        )}
      </Alert>
    );
  }

  const competencies = metrics.competencies || {};
  const additionalScores = metrics.additional_scores || {};
  const criticalRisks = metrics.critical_risks || {
    short_term_plans: false,
    avoids_conflicts: false,
    excessive_parasites: false,
    no_client_experience: false,
    unwilling_routine: false
  };
  const recommendation = metrics.recommendation;
  const summaryTable = metrics.summary_table;

  const hasNonEmptyText = (value: unknown): value is string =>
    typeof value === 'string' && value.trim().length > 0;

  const normalizeValueItem = (item: unknown): { value: string; quote?: string } | null => {
    if (hasNonEmptyText(item)) {
      const trimmed = item.trim();
      const match = trimmed.match(/^([^:]+):\s*[«"]?(.+?)[»"]?$/u);

      if (match) {
        return {
          value: match[1].trim(),
          quote: match[2].trim(),
        };
      }

      return { value: trimmed };
    }

    if (!item || typeof item !== 'object') {
      return null;
    }

    const value = hasNonEmptyText((item as { value?: unknown }).value)
      ? (item as { value: string }).value.trim()
      : '';
    const quote = hasNonEmptyText((item as { quote?: unknown }).quote)
      ? (item as { quote: string }).quote.trim()
      : '';

    if (!value && !quote) {
      return null;
    }

    return {
      value: value || quote,
      quote: quote || undefined,
    };
  };

  const valueItems = Array.isArray(additionalScores.values)
    ? additionalScores.values
        .map((item) => normalizeValueItem(item))
        .filter((item): item is { value: string; quote?: string } => item !== null)
    : [];

  const showLearningAbility = Boolean(
    additionalScores.learning_ability && (
      additionalScores.learning_ability.score !== undefined &&
      additionalScores.learning_ability.score !== null ||
      hasNonEmptyText(additionalScores.learning_ability.comment)
    )
  );

  const showTechnicalSkills = Boolean(
    additionalScores.technical_skills && (
      additionalScores.technical_skills.score === 'insufficient_info' ||
      additionalScores.technical_skills.score !== undefined &&
      additionalScores.technical_skills.score !== null ||
      hasNonEmptyText(additionalScores.technical_skills.comment)
    )
  );

  const showWritingQuality = Boolean(
    additionalScores.writing_quality && (
      additionalScores.writing_quality.score !== undefined &&
      additionalScores.writing_quality.score !== null ||
      hasNonEmptyText(additionalScores.writing_quality.comment) ||
      additionalScores.writing_quality.details
    )
  );

  const hasAdditionalScoresContent =
    valueItems.length > 0 ||
    showLearningAbility ||
    showTechnicalSkills ||
    showWritingQuality;

  // Функция для определения цвета по оценке
  const getScoreColor = (score: number): 'success' | 'warning' | 'error' => {
    if (score >= 8) return 'success';
    if (score >= 5) return 'warning';
    return 'error';
  };

  // Функция для определения текста по оценке
  const getScoreText = (score: number): string => {
    if (score >= 9) return _(msg`Отлично`);
    if (score >= 7) return _(msg`Хорошо`);
    if (score >= 5) return _(msg`Удовлетворительно`);
    if (score >= 3) return _(msg`Ниже среднего`);
    return _(msg`Требует улучшения`);
  };

  const hasMeasuredCriteria = (criteria?: Array<{ status: string }>): boolean => {
    if (!criteria || criteria.length === 0) return false;
    return criteria.some((criterion) => ['yes', 'partial', 'no'].includes(criterion.status));
  };

  const isFitEvaluated =
    summaryTable?.evaluated_competencies !== undefined
      ? summaryTable.evaluated_competencies > 0
      : summaryTable !== undefined && Object.values(competencies).some((value) => hasMeasuredCriteria(value?.criteria));

  // Статус рекомендации
  const getRecommendationIcon = () => {
    if (!recommendation) return null;
    switch (recommendation.status) {
      case 'recommended':
        return <CheckCircleIcon color="success" />;
      case 'verification_needed':
        return <WarningIcon color="warning" />;
      case 'not_recommended':
        return <ErrorIcon color="error" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getRecommendationColor = (): 'success' | 'warning' | 'error' | 'info' => {
    if (!recommendation) return 'info';
    switch (recommendation.status) {
      case 'recommended':
        return 'success';
      case 'verification_needed':
        return 'warning';
      case 'not_recommended':
        return 'error';
      default:
        return 'info';
    }
  };

  return (
    <Stack spacing={3}>
      {/* Итоговая рекомендация */}
      {recommendation && (
        <Alert 
          severity={getRecommendationColor()} 
          icon={getRecommendationIcon()}
          sx={{ fontSize: '1rem' }}
        >
          <Typography variant="h6" gutterBottom>
            {recommendation.status === 'recommended' && <Trans>✅ Рекомендую к следующему этапу</Trans>}
            {recommendation.status === 'verification_needed' && <Trans>⚠️ Требуется верификация</Trans>}
            {recommendation.status === 'not_recommended' && <Trans>❌ Не рекомендую</Trans>}
          </Typography>
          <Typography variant="body2">{recommendation.comment}</Typography>
          {recommendation.verification_needed && recommendation.verification_needed.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" fontWeight={600}>
                <Trans>Требуется верификация по компетенциям:</Trans>
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 0.5 }} flexWrap="wrap">
                {recommendation.verification_needed.map((comp, idx) => (
                  <Chip key={idx} label={comp} size="small" color="warning" />
                ))}
              </Stack>
            </Box>
          )}
        </Alert>
      )}

      {/* Fit-оценка */}
      {summaryTable && (
        <Card sx={{ p: 3, bgcolor: 'grey.50' }}>
          <Typography variant="h6" gutterBottom fontWeight={700}>
            <Trans>📊 Fit-оценка</Trans>
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                <Trans>Средняя Fit-оценка:</Trans>
              </Typography>
              {isFitEvaluated ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                  <Typography variant="h4" fontWeight={700} color={getScoreColor(summaryTable.average_score) + '.main'}>
                    {summaryTable.average_score.toFixed(1)}/10
                  </Typography>
                  <Box sx={{ flexGrow: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={summaryTable.average_score * 10} 
                      color={getScoreColor(summaryTable.average_score)}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                </Box>
              ) : (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="h5" fontWeight={700} color="text.secondary">
                    <Trans>Не оценён</Trans>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {metrics.reason || _(msg`Недостаточно данных для уверенной fit-оценки.`)}
                  </Typography>
                </Box>
              )}
              {metrics.fit_confidence && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  <Trans>Уверенность системы:</Trans> {metrics.fit_confidence}
                </Typography>
              )}
              {summaryTable.evaluated_competencies !== undefined && summaryTable.total_competencies !== undefined && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  <Trans>Оценено компетенций:</Trans> {summaryTable.evaluated_competencies}/{summaryTable.total_competencies}
                </Typography>
              )}
              {summaryTable.evaluated_competencies !== undefined &&
                summaryTable.total_competencies !== undefined &&
                summaryTable.evaluated_competencies < summaryTable.total_competencies && (
                  <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 0.75 }}>
                    <Trans>Оценка построена не по всем компетенциям.</Trans>
                  </Typography>
                )}
            </Box>
            
            {summaryTable.key_strengths && summaryTable.key_strengths.length > 0 && (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <Trans>Ключевые сильные стороны:</Trans>
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {summaryTable.key_strengths.map((strength, idx) => (
                    <Chip key={idx} label={strength} color="success" size="small" icon={<CheckCircleIcon />} />
                  ))}
                </Stack>
              </Box>
            )}
            
            {summaryTable.key_risks && summaryTable.key_risks.length > 0 && (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <Trans>Ключевые риски:</Trans>
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {summaryTable.key_risks.map((risk, idx) => (
                    <Chip key={idx} label={risk} color="warning" size="small" icon={<WarningIcon />} />
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </Card>
      )}

      {/* Таблица компетенций */}
      <Card>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={700}>
            <Trans>📋 Оценка по компетенциям</Trans>
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 700, width: '30%' }}><Trans>Компетенция</Trans></TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, width: '15%' }}><Trans>Оценка</Trans></TableCell>
                <TableCell sx={{ fontWeight: 700, width: '55%' }} colSpan={2}><Trans>Общий комментарий</Trans></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(competencies).map(([key, value]) => {
                if (!value) return null;
                const { score, criteria, overall_comment, evidence, comment } = value;
                const isExpanded = expandedRows.has(key);
                const hasCriteria = criteria && criteria.length > 0;
                const isCompetencyEvaluated = hasMeasuredCriteria(criteria);
                
                return (
                  <React.Fragment key={key}>
                    {/* Основная строка компетенции */}
                    <TableRow hover sx={{ '& > *': { borderBottom: hasCriteria && isExpanded ? 'none !important' : undefined } }}>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          {hasCriteria && (
                            <IconButton
                              size="small"
                              onClick={() => toggleRow(key)}
                              sx={{ 
                                transition: 'transform 0.3s',
                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                              }}
                            >
                              <KeyboardArrowDownIcon />
                            </IconButton>
                          )}
                          <Typography variant="h6">{competencyIcons[key]}</Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {competencyLabels[key] || key}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <Stack alignItems="center" spacing={0.5}>
                          {isCompetencyEvaluated ? (
                            <>
                              <Chip
                                label={`${score}/10`}
                                color={getScoreColor(score)}
                                size="medium"
                                sx={{ fontWeight: 700, minWidth: 70 }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {getScoreText(score)}
                              </Typography>
                            </>
                          ) : (
                            <>
                              <Chip
                                label={_(msg`Не оценено`)}
                                color="default"
                                size="medium"
                                sx={{ fontWeight: 700, minWidth: 90 }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                <Trans>Недостаточно данных</Trans>
                              </Typography>
                            </>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell colSpan={2}>
                        <Typography variant="body2">
                          {overall_comment || comment || _(msg`Нет комментария`)}
                        </Typography>
                        {hasCriteria && (
                          <Typography variant="caption" color="primary" sx={{ mt: 0.5, display: 'block' }}>
                            <Trans>🔍 Кликните для просмотра детализации ({criteria.length} критериев)</Trans>
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                    
                    {/* Раскрывающаяся секция с критериями */}
                    {hasCriteria && (
                      <TableRow>
                        <TableCell colSpan={4} sx={{ py: 0, bgcolor: 'grey.50' }}>
                          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            <Box sx={{ py: 2, px: 3 }}>
                              <Typography variant="subtitle2" gutterBottom fontWeight={600} color="primary">
                                <Trans>Детализация по критериям:</Trans>
                              </Typography>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell sx={{ fontWeight: 600, width: '30%' }}>
                                      <Trans>Критерий</Trans>
                                    </TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 600, width: '10%' }}>
                                      <Trans>Статус</Trans>
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, width: '35%' }}>
                                      <Trans>Доказательство</Trans>
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, width: '25%' }}>
                                      <Trans>Комментарий</Trans>
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {criteria.map((criterion, idx) => (
                                    <TableRow key={idx}>
                                      <TableCell>
                                        <Typography variant="body2">{criterion.name}</Typography>
                                      </TableCell>
                                      <TableCell align="center">
                                        <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="center">
                                          {getCriterionStatusIcon(criterion.status)}
                                          <Typography variant="caption">
                                            {getCriterionStatusText(criterion.status)}
                                          </Typography>
                                        </Stack>
                                      </TableCell>
                                      <TableCell>
                                        <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                                          {criterion.evidence || '-'}
                                        </Typography>
                                      </TableCell>
                                      <TableCell>
                                        <Typography variant="caption" color="text.secondary">
                                          {criterion.comment || '-'}
                                        </Typography>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Дополнительные оценки */}
      {hasAdditionalScoresContent && (
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={700}>
            <Trans>📌 Дополнительные оценки</Trans>
          </Typography>
          <Stack spacing={2} divider={<Divider />}>
            {/* Ценности */}
            {valueItems.length > 0 && (
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  <Trans>💎 Ценности кандидата:</Trans>
                </Typography>
                <Stack spacing={1}>
                  {valueItems.map((item, idx) => (
                    <Box key={idx}>
                      <Chip label={item.value} size="small" color="primary" variant="outlined" />
                      {item.quote && (
                        <Typography variant="caption" sx={{ ml: 1, fontStyle: 'italic', color: 'text.secondary' }}>
                          "{item.quote}"
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}

            {/* Обучаемость */}
            {showLearningAbility && (
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  <Trans>📚 Обучаемость:</Trans>
                </Typography>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Chip
                    label={`${additionalScores.learning_ability.score}/10`}
                    color={getScoreColor(Number(additionalScores.learning_ability.score))}
                    size="small"
                  />
                  {hasNonEmptyText(additionalScores.learning_ability?.comment) && (
                    <Typography variant="body2">{additionalScores.learning_ability.comment}</Typography>
                  )}
                </Stack>
              </Box>
            )}

            {/* Технические навыки */}
            {showTechnicalSkills && (
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  <Trans>⚙️ Технические навыки:</Trans>
                </Typography>
                <Stack direction="row" alignItems="center" spacing={2}>
                  {additionalScores.technical_skills.score === 'insufficient_info' ? (
                    <Chip label={_(msg`Недостаточно информации`)} size="small" color="default" />
                  ) : (
                    <Chip
                      label={`${additionalScores.technical_skills.score}/10`}
                      color={getScoreColor(Number(additionalScores.technical_skills.score))}
                      size="small"
                    />
                  )}
                  {hasNonEmptyText(additionalScores.technical_skills?.comment) && (
                    <Typography variant="body2">{additionalScores.technical_skills.comment}</Typography>
                  )}
                </Stack>
              </Box>
            )}

            {/* Качество письменной речи */}
            {showWritingQuality && (
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  <Trans>✍️ Качество письменной речи:</Trans>
                </Typography>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Chip
                    label={`${additionalScores.writing_quality.score}/10`}
                    color={getScoreColor(Number(additionalScores.writing_quality.score))}
                    size="small"
                  />
                  {hasNonEmptyText(additionalScores.writing_quality?.comment) && (
                    <Typography variant="body2">{additionalScores.writing_quality.comment}</Typography>
                  )}
                </Stack>
                {additionalScores.writing_quality.details && (
                  <Box sx={{ mt: 1, pl: 2, borderLeft: '3px solid', borderColor: 'primary.main' }}>
                    <Typography variant="caption" color="text.secondary">
                      {JSON.stringify(additionalScores.writing_quality.details)}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Stack>
        </Card>
      )}

      {/* Критические риски */}
      {criticalRisks && Object.values(criticalRisks).some(v => v === true) && (
        <Alert severity="error" icon={<ErrorIcon />}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            <Trans>🚨 Обнаружены критические риски:</Trans>
          </Typography>
          <Stack spacing={0.5}>
            {criticalRisks?.short_term_plans && (
              <Typography variant="body2">• <Trans>Планируемый срок работы менее 1 года</Trans></Typography>
            )}
            {criticalRisks?.avoids_conflicts && (
              <Typography variant="body2">• <Trans>Избегание конфликтных ситуаций</Trans></Typography>
            )}
            {criticalRisks?.excessive_parasites && (
              <Typography variant="body2">• <Trans>Слова-паразиты более 40% в речи</Trans></Typography>
            )}
            {criticalRisks?.no_client_experience && (
              <Typography variant="body2">• <Trans>Отсутствие опыта прямого контакта с клиентами</Trans></Typography>
            )}
            {criticalRisks?.unwilling_routine && (
              <Typography variant="body2">• <Trans>Неготовность к рутинной работе</Trans></Typography>
            )}
          </Stack>
        </Alert>
      )}
    </Stack>
  );
}

