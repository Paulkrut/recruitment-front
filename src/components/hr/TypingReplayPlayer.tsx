"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  IconButton,
  Slider,
  Tooltip,
  LinearProgress,
  Chip,
  Stack,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import FastForwardIcon from '@mui/icons-material/FastForward';
import FastRewindIcon from '@mui/icons-material/FastRewind';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import { Trans } from '@lingui/macro';

interface TimelineEvent {
  timestamp: number;
  char: string;
  action: 'add' | 'delete';
}

interface TypingReplayPlayerProps {
  timeline: TimelineEvent[];
  finalText: string;
}

/**
 * TypingReplayPlayer - модуль для воспроизведения процесса печати
 * 
 * Позволяет HR увидеть:
 * - Как кандидат печатал в реальном времени
 * - Где были паузы (подсвечиваются)
 * - Где были исправления (Backspace)
 * - Скорость печати в конкретный момент
 */
export default function TypingReplayPlayer({ timeline, finalText }: TypingReplayPlayerProps) {
  const [currentText, setCurrentText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [speed, setSpeed] = useState(2); // 1x, 2x, 4x, 8x
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [lastAction, setLastAction] = useState<'add' | 'delete' | null>(null);
  const [currentSpeed, setCurrentSpeed] = useState(0); // текущая скорость печати
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const charsInLastSecondRef = useRef<number>(0);
  const lastSpeedUpdateRef = useRef<number>(0);

  // Остановить воспроизведение
  const stop = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentIndex(0);
    setCurrentText('');
    setProgress(0);
    setLastAction(null);
    setCurrentSpeed(0);
  };

  // Пауза
  const pause = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsPlaying(false);
    setIsPaused(true);
  };

  // Воспроизведение одного события
  const playNextEvent = (index: number) => {
    if (index >= timeline.length) {
      setIsPlaying(false);
      setProgress(100);
      return;
    }

    const event = timeline[index];
    const nextEvent = timeline[index + 1];
    
    // Вычисляем задержку до следующего события
    let delay = 0;
    if (nextEvent) {
      delay = nextEvent.timestamp - event.timestamp;
      // Применяем ускорение и ограничиваем максимальную задержку
      delay = Math.min(delay / speed, 500); // макс 500мс даже для длинных пауз
    }

    // Обновляем текст
    if (event.action === 'add') {
      setCurrentText(prev => prev + event.char);
      setLastAction('add');
      charsInLastSecondRef.current++;
    } else if (event.action === 'delete') {
      setCurrentText(prev => prev.slice(0, -1));
      setLastAction('delete');
    }

    // Обновляем скорость (каждую секунду)
    const now = Date.now();
    if (now - lastSpeedUpdateRef.current >= 1000) {
      setCurrentSpeed(charsInLastSecondRef.current * 60);
      charsInLastSecondRef.current = 0;
      lastSpeedUpdateRef.current = now;
    }

    // Обновляем прогресс
    const newProgress = ((index + 1) / timeline.length) * 100;
    setProgress(newProgress);
    setCurrentIndex(index + 1);

    // Планируем следующее событие
    timeoutRef.current = setTimeout(() => {
      playNextEvent(index + 1);
    }, delay);
  };

  // Начать воспроизведение
  const play = () => {
    if (currentIndex >= timeline.length) {
      // Если закончилось - начать сначала
      stop();
    }
    
    setIsPlaying(true);
    setIsPaused(false);
    startTimeRef.current = Date.now();
    lastSpeedUpdateRef.current = Date.now();
    charsInLastSecondRef.current = 0;
    playNextEvent(currentIndex);
  };

  // Изменить скорость
  const cycleSpeed = () => {
    const speeds = [1, 2, 4, 8];
    const currentSpeedIndex = speeds.indexOf(speed);
    const nextSpeed = speeds[(currentSpeedIndex + 1) % speeds.length];
    setSpeed(nextSpeed);
  };

  // Cleanup при размонтировании
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Определяем есть ли данные
  if (!timeline || timeline.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
        <Typography color="text.secondary">
          <Trans>Нет данных для воспроизведения</Trans>
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Контролы */}
      <Stack direction="row" spacing={1} alignItems="center" mb={2} flexWrap="wrap">
        {!isPlaying && !isPaused && (
          <Tooltip title={<Trans>Воспроизвести</Trans>}>
            <IconButton color="primary" onClick={play} size="large">
              <PlayArrowIcon />
            </IconButton>
          </Tooltip>
        )}
        
        {isPlaying && (
          <Tooltip title={<Trans>Пауза</Trans>}>
            <IconButton color="primary" onClick={pause} size="large">
              <PauseIcon />
            </IconButton>
          </Tooltip>
        )}
        
        {isPaused && (
          <Tooltip title={<Trans>Продолжить</Trans>}>
            <IconButton color="primary" onClick={play} size="large">
              <PlayArrowIcon />
            </IconButton>
          </Tooltip>
        )}
        
        <Tooltip title={<Trans>Остановить</Trans>}>
          <IconButton onClick={stop} disabled={!isPlaying && !isPaused}>
            <StopIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title={<Trans>Скорость воспроизведения</Trans>}>
          <Chip
            label={`${speed}x`}
            onClick={cycleSpeed}
            color="primary"
            variant="outlined"
            sx={{ cursor: 'pointer', minWidth: '50px' }}
          />
        </Tooltip>
        
        {isPlaying && lastAction === 'delete' && (
          <Chip
            icon={<KeyboardBackspaceIcon />}
            label={<Trans>Исправление</Trans>}
            color="error"
            size="small"
            sx={{ animation: 'pulse 0.5s' }}
          />
        )}
        
        {isPlaying && currentSpeed > 0 && (
          <Chip
            label={`${currentSpeed} симв/мин`}
            color="info"
            size="small"
            variant="outlined"
          />
        )}
      </Stack>

      {/* Прогресс-бар */}
      <Box sx={{ mb: 2 }}>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ 
            height: 8, 
            borderRadius: 4,
            backgroundColor: '#e0e0e0',
            '& .MuiLinearProgress-bar': {
              backgroundColor: isPlaying ? '#1976d2' : isPaused ? '#ff9800' : '#4caf50'
            }
          }} 
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          <Trans>Прогресс: {Math.round(progress)}%</Trans> • {currentIndex} / {timeline.length} <Trans>событий</Trans>
        </Typography>
      </Box>

      {/* Область воспроизведения текста */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          minHeight: '200px',
          backgroundColor: '#fafafa',
          border: '2px solid',
          borderColor: isPlaying ? '#1976d2' : isPaused ? '#ff9800' : '#e0e0e0',
          transition: 'border-color 0.3s',
          position: 'relative',
          fontFamily: 'monospace',
          fontSize: '14px',
          lineHeight: 1.8,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
      >
        {currentText || (
          <Typography color="text.secondary" fontStyle="italic">
            <Trans>Нажмите "Воспроизвести" чтобы увидеть процесс печати...</Trans>
          </Typography>
        )}
        {isPlaying && (
          <Box
            component="span"
            sx={{
              display: 'inline-block',
              width: '2px',
              height: '18px',
              backgroundColor: '#1976d2',
              marginLeft: '2px',
              animation: 'blink 1s infinite',
              '@keyframes blink': {
                '0%, 49%': { opacity: 1 },
                '50%, 100%': { opacity: 0 }
              }
            }}
          />
        )}
      </Paper>

      {/* Финальный текст (для сравнения) */}
      {progress === 100 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="success.main" fontWeight={600}>
            ✅ <Trans>Воспроизведение завершено</Trans>
          </Typography>
        </Box>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </Box>
  );
}

