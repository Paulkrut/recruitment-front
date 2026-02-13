/**
 * 🎯 Компонент настройки времени ответа на вопросы
 * 
 * Переиспользуемый компонент для установки времени на ответ для всех вопросов вакансии.
 * Используется на страницах создания и редактирования вакансии.
 * 
 * ⚡ Оптимизация: использует локальный state + debounce для плавной работы слайдера
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Slider,
  Typography,
  Card,
  CardContent,
  Stack,
  Tooltip,
  IconButton,
  TextField,
} from '@mui/material';
import { Trans, msg } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import CustomFormLabel from '@/app/components/forms/theme-elements/CustomFormLabel';
import { IconSettings, IconEye, IconClock } from '@tabler/icons-react';

interface QuestionTimeSettingsProps {
  /** Текущее значение времени в секундах */
  value: number;
  
  /** Коллбек для изменения времени */
  onChange: (time: number) => void;
  
  /** Минимальное время в секундах (по умолчанию 60) */
  minTime?: number;
  
  /** Максимальное время в секундах (по умолчанию 300) */
  maxTime?: number;
  
  /** Показывать ли форматированное время MM:SS (по умолчанию false) */
  showFormattedTime?: boolean;
  
  /** Показывать ли иконку в заголовке (по умолчанию true) */
  showIcon?: boolean;
}

const QuestionTimeSettings: React.FC<QuestionTimeSettingsProps> = ({
  value,
  onChange,
  minTime = 60,
  maxTime = 300,
  showFormattedTime = false,
  showIcon = true,
}) => {
  const { _ } = useLingui();

  // 🔥 Локальный state для мгновенного отклика без задержек
  const [localValue, setLocalValue] = useState(value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Синхронизируем локальный state с props
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounced update - обновляем родительский state через 500ms после остановки движения слайдера
  const handleTimeChange = (newValue: number) => {
    setLocalValue(newValue); // Мгновенно обновляем локальный state
    
    // Отменяем предыдущий таймер
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Устанавливаем новый таймер
    timeoutRef.current = setTimeout(() => {
      onChange(newValue);
    }, 500);
  };

  // Очищаем таймер при размонтировании
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Предустановленные значения времени (фильтруем только те, что входят в диапазон)
  const presetTimes = [60, 90, 120, 150, 180, 210, 240, 270, 300, 360, 420, 480, 540, 600]
    .filter(time => time >= minTime && time <= maxTime);

  return (
    <Card sx={{ background: '#fff', color: 'text.primary', position: 'relative', overflow: 'hidden' }}>
      <CardContent sx={{ position: 'relative', zIndex: 1, p: 4 }}>
        <Stack spacing={3}>
          {/* Заголовок */}
          <Box display="flex" alignItems="center" gap={2}>
            {showIcon && <IconSettings size={32} color="#1976d2" />}
            <Typography variant="h4" fontWeight={700} sx={{ color: 'text.primary' }}>
              <Trans>Настройки теста</Trans>
            </Typography>
            <Tooltip title={_(msg`Здесь вы можете задать параметры теста для кандидатов`)} placement="right">
              <IconButton size="small">
                <IconEye size={20} color="#1976d2" />
              </IconButton>
            </Tooltip>
          </Box>

          <Box>
            <CustomFormLabel
              sx={{
                color: 'text.primary',
                fontSize: '1.1rem',
                fontWeight: 600,
                mb: 2
              }}
            >
              <Trans>Время на один вопрос</Trans>
            </CustomFormLabel>

            {/* Кнопки быстрого выбора */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', opacity: 0.9, mb: 2 }}>
                <Trans>Быстрый выбор:</Trans>
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {presetTimes.map((time) => (
                  <Button
                    key={time}
                    variant={localValue === time ? "contained" : "outlined"}
                    onClick={() => {
                      // Мгновенно обновляем и сразу сохраняем (без debounce для кнопок)
                      setLocalValue(time);
                      onChange(time);
                      // Отменяем pending debounce
                      if (timeoutRef.current) {
                        clearTimeout(timeoutRef.current);
                      }
                    }}
                    sx={{
                      backgroundColor: localValue === time ? "#e3f2fd" : "#fff",
                      color: "#1976d2",
                      borderColor: "#1976d2",
                      fontWeight: 600,
                      minWidth: 'auto',
                      px: 2,
                      py: 1,
                      fontSize: '0.9rem',
                      '&:hover': { backgroundColor: "#bbdefb" }
                    }}
                  >
                    <Trans>{time} сек</Trans>
                  </Button>
                ))}
              </Box>
            </Box>

            {/* Слайдер с числовым полем и отображением времени */}
            <Box sx={{ 
              p: 2.5, 
              borderRadius: 2, 
              background: '#fafafa',
              border: '1px solid #e0e0e0'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <IconClock size={20} color="#666" />
                <Typography variant="body2" fontWeight={600} color="text.secondary">
                  <Trans>Глобальное время</Trans>
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                  type="number"
                  size="small"
                  value={localValue}
                  onChange={(e) => {
                    const newValue = parseInt(e.target.value);
                    if (!isNaN(newValue) && newValue >= minTime && newValue <= maxTime) {
                      handleTimeChange(newValue);
                    }
                  }}
                  inputProps={{ min: minTime, max: maxTime, step: 30 }}
                  sx={{ 
                    width: 100,
                    '& input': { textAlign: 'center', fontWeight: 600 }
                  }}
                  label={<Trans>сек</Trans>}
                />
                
                <Box sx={{ flex: 1 }}>
                  <Slider
                    value={localValue}
                    onChange={(_, newValue) => handleTimeChange(newValue as number)}
                    min={minTime}
                    max={maxTime}
                    step={30}
                    marks={[
                      { value: 60, label: '1 мин' },
                      { value: 180, label: '3 мин' },
                      { value: 300, label: '5 мин' },
                      ...(maxTime >= 600 ? [{ value: 600, label: '10 мин' }] : []),
                    ]}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${Math.floor(value / 60)}:${(value % 60).toString().padStart(2, '0')}`}
                    sx={{
                      '& .MuiSlider-track': { backgroundColor: '#1976d2' },
                      '& .MuiSlider-thumb': { backgroundColor: '#1976d2' },
                      '& .MuiSlider-rail': { backgroundColor: '#e0e0e0' }
                    }}
                  />
                </Box>
                
                <Typography variant="h6" sx={{ minWidth: 70, textAlign: 'center', fontWeight: 700, color: 'text.primary' }}>
                  {Math.floor(localValue / 60)}:{(localValue % 60).toString().padStart(2, '0')}
                </Typography>
              </Box>

              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                <Trans>Время, отведенное на ответ на каждый вопрос. Можно настроить индивидуально в экспертном режиме.</Trans>
              </Typography>
            </Box>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default QuestionTimeSettings;
