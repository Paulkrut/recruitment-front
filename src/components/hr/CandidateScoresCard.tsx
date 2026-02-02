"use client";
import React from 'react';
import { Box, Card, Typography, Stack, LinearProgress, Chip, Grid, Divider } from '@mui/material';
import { Trans } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';
import SchoolIcon from '@mui/icons-material/School';
import PsychologyIcon from '@mui/icons-material/Psychology';

interface CandidateScoresCardProps {
  interviewScore?: number; // Оценка по вопросам (существующая totalScore)
  competencyScore?: number; // Средняя оценка по компетенциям (новая из metrics)
  questionsCount?: number; // Количество вопросов
}

export default function CandidateScoresCard({ 
  interviewScore, 
  competencyScore,
  questionsCount 
}: CandidateScoresCardProps) {
  const { _ } = useLingui();

  // Функция для определения цвета по оценке
  const getScoreColor = (score: number): 'success' | 'warning' | 'error' => {
    if (score >= 8) return 'success';
    if (score >= 6) return 'warning';
    return 'error';
  };

  // Функция для определения текста по оценке
  const getScoreText = (score: number): string => {
    if (score >= 9) return _(msg`Отлично`);
    if (score >= 8) return _(msg`Хорошо`);
    if (score >= 6) return _(msg`Удовлетворительно`);
    if (score >= 4) return _(msg`Ниже среднего`);
    return _(msg`Плохо`);
  };

  return (
    <Card sx={{ p: 3, bgcolor: 'grey.50' }}>
      <Typography variant="h6" gutterBottom fontWeight={700}>
        <Trans>📊 Сводная оценка кандидата</Trans>
      </Typography>
      
      <Grid container spacing={3}>
        {/* Оценка знаний и навыков */}
        <Grid item xs={12} md={6}>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
              <SchoolIcon sx={{ fontSize: 24, color: 'primary.main' }} />
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  <Trans>Общая оценка по интервью</Trans>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  <Trans>Оценка ответов на вопросы (знания, навыки, опыт)</Trans>
                </Typography>
              </Box>
            </Stack>
            
            {interviewScore !== undefined && interviewScore !== null ? (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Typography variant="h4" fontWeight={700} color={getScoreColor(interviewScore) + '.main'}>
                    {interviewScore.toFixed(1)}/10
                  </Typography>
                  <Chip 
                    label={getScoreText(interviewScore)} 
                    size="small"
                    color={getScoreColor(interviewScore)}
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
                
                <Box sx={{ mb: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={interviewScore * 10} 
                    color={getScoreColor(interviewScore)}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
                
                {questionsCount && (
                  <Typography variant="caption" color="text.secondary">
                    <Trans>На основе {questionsCount} вопросов</Trans>
                  </Typography>
                )}
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                <Trans>Нет данных</Trans>
              </Typography>
            )}
          </Box>
        </Grid>

        {/* Разделитель */}
        <Grid item xs={12} md="auto" sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'stretch' }}>
          <Divider orientation="vertical" flexItem />
        </Grid>
        <Grid item xs={12} sx={{ display: { xs: 'block', md: 'none' } }}>
          <Divider />
        </Grid>

        {/* Оценка по компетенциям */}
        <Grid item xs={12} md>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
              <PsychologyIcon sx={{ fontSize: 24, color: 'primary.main' }} />
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  <Trans>Fit-компетенции</Trans>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  <Trans>Соответствие вакансии и личностные качества</Trans>
                </Typography>
              </Box>
            </Stack>
            
            {competencyScore !== undefined && competencyScore !== null ? (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Typography variant="h4" fontWeight={700} color={getScoreColor(competencyScore) + '.main'}>
                    {competencyScore.toFixed(1)}/10
                  </Typography>
                  <Chip 
                    label={getScoreText(competencyScore)} 
                    size="small"
                    color={getScoreColor(competencyScore)}
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
                
                <Box sx={{ mb: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={competencyScore * 10} 
                    color={getScoreColor(competencyScore)}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
                
                <Typography variant="caption" color="text.secondary">
                  <Trans>Мотивация, речь, клиентоориентированность, стрессоустойчивость...</Trans>
                </Typography>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                <Trans>Анализ компетенций не проведён</Trans>
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>
    </Card>
  );
}

