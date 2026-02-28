'use client';
import React from 'react';
import { Box, LinearProgress, Typography, Chip, Alert, Button } from '@mui/material';
import Link from 'next/link';
import { ColdSearchJob } from './types';

const STATUS_LABELS: Record<string, string> = {
  pending:    'Подготовка...',
  searching:  'Поиск на HH.ru...',
  prescoring: 'Предварительный отбор...',
  scoring:    'Детальный скоринг...',
  complete:   'Завершено',
  failed:     'Ошибка',
};

interface Props {
  job: ColdSearchJob;
}

export default function ColdSearchProgress({ job }: Props) {
  const { status, progress, params_expanded, error } = job;
  const isRunning = ['pending', 'searching', 'prescoring', 'scoring'].includes(status);

  const percent = (() => {
    if (status === 'searching') return 10;
    if (status === 'pending')   return 5;
    if (!progress.total)        return 0;

    if (status === 'prescoring') {
      const done = (progress.prescored + progress.skipped);
      return 10 + Math.round((done / progress.total) * 40);
    }
    if (status === 'scoring') {
      const preDone = progress.prescored + progress.skipped;
      const scoreDone = progress.scored;
      const scoreTotal = progress.prescored;
      const prePercent = 50;
      const scorePercent = scoreTotal > 0 ? Math.round((scoreDone / scoreTotal) * 50) : 0;
      return prePercent + scorePercent;
    }
    if (status === 'complete') return 100;
    return 0;
  })();

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <Typography variant="body2" fontWeight={600} color={status === 'failed' ? 'error' : 'text.primary'}>
          {STATUS_LABELS[status] ?? status}
        </Typography>

        {isRunning && (
          <>
            {progress.found > 0 && (
              <Chip size="small" label={`Найдено: ${progress.found}`} color="default" />
            )}
            {progress.prescored + progress.skipped > 0 && (
              <Chip size="small" label={`Отобрано: ${progress.prescored}/${progress.total}`} color="primary" variant="outlined" />
            )}
            {progress.scored > 0 && (
              <Chip size="small" label={`Оценено: ${progress.scored}`} color="success" variant="outlined" />
            )}
          </>
        )}

        {status === 'complete' && (
          <>
            <Chip size="small" label={`${progress.scored} кандидатов`} color="success" />
            {progress.skipped > 0 && (
              <Chip size="small" label={`${progress.skipped} отсеяно`} color="default" variant="outlined" />
            )}
          </>
        )}
      </Box>

      {isRunning && (
        <LinearProgress
          variant={status === 'pending' ? 'indeterminate' : 'determinate'}
          value={percent}
          sx={{ borderRadius: 1, height: 6 }}
        />
      )}

      {params_expanded && (
        <Alert severity="info" sx={{ mt: 1.5, py: 0.5 }}>
          Параметры поиска были расширены — недостаточно кандидатов по строгим фильтрам.
        </Alert>
      )}

      {status === 'failed' && error && (
        error === 'NO_HH_TOKEN' ? (
          <Alert
            severity="error"
            sx={{ mt: 1.5 }}
            action={
              <Button
                component={Link}
                href="/hr/settings/hh-integration"
                size="small"
                color="inherit"
                variant="outlined"
                sx={{ whiteSpace: 'nowrap' }}
              >
                Настроить HH
              </Button>
            }
          >
            Нет активного токена HH.ru — необходимо авторизоваться в интеграции.
          </Alert>
        ) : (
          <Alert severity="error" sx={{ mt: 1.5, py: 0.5 }}>
            {error}
          </Alert>
        )
      )}
    </Box>
  );
}
