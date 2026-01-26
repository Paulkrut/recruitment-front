"use client";

/**
 * TypingMetricsDisplay - компонент для отображения метрик печати в админке
 * 
 * Показывает:
 * - Скорость печати
 * - Количество исправлений
 * - Паузы при печати
 * - Общее время
 * - Воспроизведение процесса печати
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Chip,
  Divider,
  Paper,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { Trans } from '@lingui/macro';
import SpeedIcon from '@mui/icons-material/Speed';
import EditIcon from '@mui/icons-material/Edit';
import PauseIcon from '@mui/icons-material/Pause';
import TimerIcon from '@mui/icons-material/Timer';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import TypingReplayPlayer from './TypingReplayPlayer';

interface TimelineEvent {
  timestamp: number;
  char: string;
  action: 'add' | 'delete';
}

interface TypingMetrics {
  charsPerMinute: number;
  totalCharacters: number;
  totalTimeSeconds: number;
  pauseCount: number;
  correctionCount: number;
  pauses?: Array<{ atChar: number; durationSeconds: number }>;
  typingTimeline?: TimelineEvent[];
}

interface TypingMetricsDisplayProps {
  metrics: TypingMetrics;
  finalText?: string;
}

export default function TypingMetricsDisplay({ metrics, finalText = '' }: TypingMetricsDisplayProps) {
  const [replayOpen, setReplayOpen] = useState(false);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };
  
  const getSpeedQuality = (speed: number) => {
    if (speed < 100) return { label: 'Медленная', color: '#ff9800' };
    if (speed < 200) return { label: 'Средняя', color: '#2196f3' };
    if (speed < 300) return { label: 'Хорошая', color: '#4caf50' };
    return { label: 'Отличная', color: '#66bb6a' };
  };
  
  const speedQuality = getSpeedQuality(metrics.charsPerMinute);
  
  return (
    <Paper elevation={0} sx={{ p: 3, backgroundColor: '#f8f9fa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <SpeedIcon sx={{ color: '#1976d2', mr: 1 }} />
        <Typography variant="h6" fontWeight={600}>
          <Trans>Метрики печати</Trans>
        </Typography>
      </Box>
      
      <Grid container spacing={2}>
        {/* Скорость печати */}
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#fff', borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              <Trans>Скорость печати</Trans>
            </Typography>
            <Typography variant="h4" fontWeight={700} sx={{ color: speedQuality.color }}>
              {Math.round(metrics.charsPerMinute)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              <Trans>симв/мин</Trans>
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Chip 
                label={speedQuality.label} 
                size="small" 
                sx={{ 
                  backgroundColor: speedQuality.color + '20',
                  color: speedQuality.color,
                  fontWeight: 600
                }}
              />
            </Box>
          </Box>
        </Grid>
        
        {/* Время печати */}
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#fff', borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              <Trans>Время печати</Trans>
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <TimerIcon sx={{ color: '#1976d2' }} />
              <Typography variant="h4" fontWeight={700} color="text.primary">
                {formatTime(metrics.totalTimeSeconds)}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              <Trans>{metrics.totalCharacters} символов</Trans>
            </Typography>
          </Box>
        </Grid>
        
        {/* Исправления */}
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#fff', borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              <Trans>Исправления</Trans>
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <EditIcon sx={{ color: metrics.correctionCount > 20 ? '#ff9800' : '#4caf50' }} />
              <Typography 
                variant="h4" 
                fontWeight={700} 
                color={metrics.correctionCount > 20 ? '#ff9800' : '#4caf50'}
              >
                {metrics.correctionCount}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              <Trans>нажатий Backspace</Trans>
            </Typography>
          </Box>
        </Grid>
        
        {/* Паузы */}
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#fff', borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              <Trans>Паузы (&gt;3 сек)</Trans>
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <PauseIcon sx={{ color: metrics.pauseCount > 5 ? '#ff9800' : '#1976d2' }} />
              <Typography 
                variant="h4" 
                fontWeight={700} 
                color={metrics.pauseCount > 5 ? '#ff9800' : '#1976d2'}
              >
                {metrics.pauseCount}
              </Typography>
            </Box>
            {metrics.pauses && metrics.pauses.length > 0 && (
              <Tooltip 
                title={
                  <Box>
                    {metrics.pauses.slice(0, 5).map((pause, idx) => (
                      <Typography key={idx} variant="caption" display="block">
                        {pause.durationSeconds.toFixed(1)}с на позиции {pause.atChar}
                      </Typography>
                    ))}
                    {metrics.pauses.length > 5 && (
                      <Typography variant="caption" display="block">
                        ...и ещё {metrics.pauses.length - 5}
                      </Typography>
                    )}
                  </Box>
                }
              >
                <Typography variant="caption" sx={{ color: '#1976d2', cursor: 'pointer', textDecoration: 'underline' }}>
                  <Trans>детали</Trans>
                </Typography>
              </Tooltip>
            )}
          </Box>
        </Grid>
      </Grid>
      
      {/* Интерпретация */}
      <Divider sx={{ my: 2 }} />
      <Box sx={{ p: 2, backgroundColor: '#fff', borderRadius: 2 }}>
        <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" gutterBottom>
          <Trans>Интерпретация:</Trans>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {metrics.charsPerMinute < 100 && (
            <Trans>Низкая скорость печати может указывать на обдумывание ответа или недостаточную уверенность в теме.</Trans>
          )}
          {metrics.charsPerMinute >= 100 && metrics.charsPerMinute < 200 && (
            <Trans>Средняя скорость печати. Кандидат размышлял над ответом в процессе написания.</Trans>
          )}
          {metrics.charsPerMinute >= 200 && (
            <Trans>Высокая скорость печати говорит о уверенности кандидата в теме и хороших навыках печати.</Trans>
          )}
          {' '}
          {metrics.correctionCount > 20 && (
            <Trans>Большое количество исправлений может указывать на неуверенность или тщательность при формулировке.</Trans>
          )}
          {' '}
          {metrics.pauseCount > 5 && (
            <Trans>Частые паузы могут означать обдумывание или затруднения с ответом.</Trans>
          )}
        </Typography>
      </Box>
      
      {/* Кнопка воспроизведения */}
      {metrics.typingTimeline && metrics.typingTimeline.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<PlayCircleOutlineIcon />}
              onClick={() => setReplayOpen(true)}
              sx={{ 
                borderRadius: 3,
                textTransform: 'none',
                px: 4,
                py: 1.5,
                fontSize: '16px',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s'
                }
              }}
            >
              <Trans>🎬 Воспроизвести процесс печати</Trans>
            </Button>
            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
              <Trans>Посмотрите как кандидат печатал в реальном времени</Trans>
            </Typography>
          </Box>

          {/* Модальное окно с плеером */}
          <Dialog
            open={replayOpen}
            onClose={() => setReplayOpen(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 3,
                maxHeight: '90vh'
              }
            }}
          >
            <DialogTitle sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              pb: 1
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PlayCircleOutlineIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  <Trans>Воспроизведение процесса печати</Trans>
                </Typography>
              </Box>
              <IconButton onClick={() => setReplayOpen(false)} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
              <TypingReplayPlayer 
                timeline={metrics.typingTimeline} 
                finalText={finalText}
              />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setReplayOpen(false)} variant="outlined">
                <Trans>Закрыть</Trans>
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Paper>
  );
}


