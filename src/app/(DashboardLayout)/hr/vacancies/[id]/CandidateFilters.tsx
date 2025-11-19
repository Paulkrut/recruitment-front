"use client";
import React, { useEffect, useState, useRef } from 'react';
import {
  Box, TextField, Select, MenuItem, FormControl, InputLabel, Chip, Button, Paper, Grid
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import CheckIcon from '@mui/icons-material/Check';
import { apiFetch } from '@/utils/api';
import { useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';


const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

interface CandidateFiltersProps {
  filters: {
    source?: string;
    search?: string;
    minScore?: number;
    aiAnalysisStatus?: string;
    hasResume?: string;
    hhStage?: string;
    datePreset?: string;
    dateFrom?: string;
    dateTo?: string;
    status?: string;
    testScore?: string; // Новый фильтр для оценки за тест
  };
  onFilterChange: (filters: any) => void;
  vacancyId: number;
  viewMode?: 'list' | 'kanban';
}

export default function CandidateFilters({ filters, onFilterChange, vacancyId, viewMode = 'list' }: CandidateFiltersProps) {
  const { _ } = useLingui();

  const [hhStages, setHhStages] = useState<string[]>([]);
  const [loadingStages, setLoadingStages] = useState(false);
  
  // Локальное состояние для фильтров (до применения)
  const [localFilters, setLocalFilters] = useState(filters);
  
  // Debounce таймер для поиска
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Загружаем HH стадии при монтировании
  useEffect(() => {
    const fetchHhStages = async () => {
      setLoadingStages(true);
      try {
        const response = await apiFetch(`${API_BASE}/api/admin/vacancies/${vacancyId}/hh-stages`);
        const data = await response.json();
        if (data.stages) {
          setHhStages(data.stages);
        }
      } catch (error) {
        console.error('Error fetching HH stages:', error);
      } finally {
        setLoadingStages(false);
      }
    };

    fetchHhStages();
  }, [vacancyId]);

  // Синхронизация локальных фильтров с внешними
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Cleanup debounce таймера при размонтировании
  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, []);

  // Обработчик изменения локальных фильтров
  const handleLocalChange = (key: string, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    
    // Поиск применяется автоматически с debounce
    if (key === 'search') {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
      
      searchDebounceRef.current = setTimeout(() => {
        onFilterChange(newFilters);
      }, 500); // Задержка 500мс
    }
  };

  // Применение всех фильтров
  const handleApply = () => {
    onFilterChange(localFilters);
  };

  // Сброс фильтров (применяется сразу)
  const handleClear = () => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    setLocalFilters({});
    onFilterChange({});
  };

  // Удаление конкретного фильтра из активных (применяется сразу)
  const handleRemoveFilter = (key: string) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== '');
  const hasUnappliedChanges = JSON.stringify(localFilters) !== JSON.stringify(filters);

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <FilterListIcon />
        <Box flex={1} fontWeight="bold">Фильтры</Box>
        
        {hasActiveFilters && (
          <Button
            size="small"
            startIcon={<ClearIcon />}
            onClick={handleClear}
          >
            Сбросить
          </Button>
        )}
      </Box>

      <Grid container spacing={2}>
        {/* Поиск (с автоприменением через debounce) */}
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            label={_(msg`Поиск`)}
            placeholder={_(msg`Имя, email, телефон...`)}
            value={localFilters.search || ''}
            onChange={(e) => handleLocalChange('search', e.target.value)}
          />
        </Grid>

        {/* Источник */}
        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Источник</InputLabel>
            <Select
              value={localFilters.source || ''}
              label={_(msg`Источник`)}
              onChange={(e) => handleLocalChange('source', e.target.value)}
            >
              <MenuItem value="">Все</MenuItem>
              <MenuItem value="manual">✍️ Ручной</MenuItem>
              <MenuItem value="headhunter">🎯 HH.ru</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Статус - только для режима списка */}
        {viewMode === 'list' && (
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Статус</InputLabel>
              <Select
                value={localFilters.status || ''}
                label={_(msg`Статус`)}
                onChange={(e) => handleLocalChange('status', e.target.value)}
              >
                <MenuItem value="">Все</MenuItem>
                <MenuItem value="new">Новый</MenuItem>
                <MenuItem value="screening">AI Скрининг</MenuItem>
                <MenuItem value="contacted">Связались</MenuItem>
                <MenuItem value="testing">Тестирование</MenuItem>
                <MenuItem value="finalist">Финалист</MenuItem>
                <MenuItem value="offer">Оффер</MenuItem>
                <MenuItem value="hired">Принят</MenuItem>
                <MenuItem value="rejected">Отклонён</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}

        {/* AI анализ резюме (объединённый фильтр) */}
        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>AI анализ резюме</InputLabel>
            <Select
              value={
                localFilters.minScore ? `score_${localFilters.minScore}` : 
                localFilters.aiAnalysisStatus ? `status_${localFilters.aiAnalysisStatus}` : ''
              }
              label={_(msg`AI анализ резюме`)}
              onChange={(e) => {
                const value = e.target.value;
                const newFilters = { ...localFilters };
                
                // Удаляем оба старых фильтра
                delete newFilters.minScore;
                delete newFilters.aiAnalysisStatus;
                
                // Устанавливаем новый фильтр в зависимости от типа
                if (value.startsWith('score_')) {
                  newFilters.minScore = parseInt(value.replace('score_', ''));
                } else if (value.startsWith('status_')) {
                  newFilters.aiAnalysisStatus = value.replace('status_', '');
                }
                
                setLocalFilters(newFilters);
              }}
            >
              <MenuItem value="">Все</MenuItem>
              <MenuItem value="status_loading_resume">⏳ Загрузка резюме</MenuItem>
              <MenuItem value="status_analyzing">🤖 Анализируется</MenuItem>
              <MenuItem value="status_null">⚪ Без анализа</MenuItem>
              <MenuItem value="status_failed">❌ Ошибка анализа</MenuItem>
              <MenuItem value="score_90">≥ 90% (отличные)</MenuItem>
              <MenuItem value="score_80">≥ 80% (хорошие)</MenuItem>
              <MenuItem value="score_70">≥ 70% (средние)</MenuItem>
              <MenuItem value="score_60">≥ 60% (слабые)</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Оценка за тест */}
        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Оценка за тест</InputLabel>
            <Select
              value={localFilters.testScore || ''}
              label={_(msg`Оценка за тест`)}
              onChange={(e) => handleLocalChange('testScore', e.target.value)}
            >
              <MenuItem value="">Все</MenuItem>
              <MenuItem value="passed">✅ Прошли тест</MenuItem>
              <MenuItem value="not_passed">❌ Не проходили</MenuItem>
              <MenuItem value="9">≥ 9 (отлично)</MenuItem>
              <MenuItem value="7">≥ 7 (хорошо)</MenuItem>
              <MenuItem value="5">≥ 5 (средне)</MenuItem>
              <MenuItem value="3">≥ 3 (слабо)</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Наличие резюме */}
        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Резюме</InputLabel>
            <Select
              value={localFilters.hasResume || ''}
              label={_(msg`Резюме`)}
              onChange={(e) => handleLocalChange('hasResume', e.target.value)}
            >
              <MenuItem value="">Все</MenuItem>
              <MenuItem value="true">✅ С резюме</MenuItem>
              <MenuItem value="false">❌ Без резюме</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Дата добавления */}
        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Дата добавления</InputLabel>
            <Select
              value={localFilters.datePreset || ''}
              label={_(msg`Дата добавления`)}
              onChange={(e) => {
                const value = e.target.value;
                const newFilters = { ...localFilters, datePreset: value };
                
                // Если выбран не "custom", очищаем dateFrom и dateTo
                if (value !== 'custom') {
                  delete newFilters.dateFrom;
                  delete newFilters.dateTo;
                }
                
                setLocalFilters(newFilters);
              }}
            >
              <MenuItem value="">Все время</MenuItem>
              <MenuItem value="today">📅 Сегодня</MenuItem>
              <MenuItem value="3days">📅 Последние 3 дня</MenuItem>
              <MenuItem value="week">📅 Последняя неделя</MenuItem>
              <MenuItem value="month">📅 Последний месяц</MenuItem>
              <MenuItem value="custom">📆 Выбрать диапазон...</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Диапазон дат (если выбран custom) */}
        {localFilters.datePreset === 'custom' && (
          <>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label={_(msg`С даты`)}
                value={localFilters.dateFrom || ''}
                onChange={(e) => handleLocalChange('dateFrom', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label={_(msg`По дату`)}
                value={localFilters.dateTo || ''}
                onChange={(e) => handleLocalChange('dateTo', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </>
        )}

        {/* Стадия HH */}
        {hhStages.length > 0 && (
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Стадия HH</InputLabel>
              <Select
                value={localFilters.hhStage || ''}
                label={_(msg`Стадия HH`)}
                onChange={(e) => handleLocalChange('hhStage', e.target.value)}
                disabled={loadingStages}
              >
                <MenuItem value="">Все стадии</MenuItem>
                {hhStages.map((stage) => (
                  <MenuItem key={stage} value={stage}>
                    {stage}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}
      </Grid>

      {/* Кнопка "Применить фильтры" - всегда видна, явная и заметная */}
      <Box display="flex" alignItems="center" gap={2} mt={3}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<CheckIcon />}
          onClick={handleApply}
          disabled={!hasUnappliedChanges}
          sx={{ 
            minWidth: 200,
            fontWeight: 700,
            fontSize: '1rem',
            py: 1.5,
            boxShadow: hasUnappliedChanges ? 3 : 1,
            animation: hasUnappliedChanges ? 'pulse 2s infinite' : 'none',
            '@keyframes pulse': {
              '0%': { boxShadow: 3 },
              '50%': { boxShadow: 6 },
              '100%': { boxShadow: 3 },
            },
          }}
        >
          {hasUnappliedChanges ? 'Применить фильтры' : 'Фильтры применены'}
        </Button>
      </Box>

      {/* Активные фильтры - удаление применяется сразу */}
      {hasActiveFilters && (
        <Box display="flex" gap={1} mt={2} flexWrap="wrap">
          {filters.search && (
            <Chip
              label={`Поиск: ${filters.search}`}
              size="small"
              onDelete={() => handleRemoveFilter('search')}
            />
          )}
          {filters.source && (
            <Chip
              label={`Источник: ${filters.source === 'manual' ? 'Ручной' : filters.source === 'headhunter' ? 'HH.ru' : filters.source}`}
              size="small"
              onDelete={() => handleRemoveFilter('source')}
            />
          )}
          {filters.status && viewMode === 'list' && (
            <Chip
              label={`Статус: ${
                filters.status === 'new' ? 'Новый' :
                filters.status === 'screening' ? 'AI Скрининг' :
                filters.status === 'contacted' ? 'Связались' :
                filters.status === 'testing' ? 'Тестирование' :
                filters.status === 'finalist' ? 'Финалист' :
                filters.status === 'offer' ? 'Оффер' :
                filters.status === 'hired' ? 'Принят' :
                filters.status === 'rejected' ? 'Отклонён' :
                filters.status
              }`}
              size="small"
              onDelete={() => handleRemoveFilter('status')}
            />
          )}
          {(filters.minScore || filters.aiAnalysisStatus) && (
            <Chip
              label={`AI анализ: ${
                filters.minScore ? `≥ ${filters.minScore}%` :
                filters.aiAnalysisStatus === 'loading_resume' ? 'Загрузка резюме' : 
                filters.aiAnalysisStatus === 'analyzing' ? 'Анализируется' : 
                filters.aiAnalysisStatus === 'completed' ? 'Завершено' : 
                filters.aiAnalysisStatus === 'failed' ? 'Ошибка' : 'Без анализа'
              }`}
              size="small"
              onDelete={() => {
                const newFilters = { ...filters };
                delete newFilters.minScore;
                delete newFilters.aiAnalysisStatus;
                setLocalFilters(newFilters);
                onFilterChange(newFilters);
              }}
            />
          )}
          {filters.testScore && (
            <Chip
              label={`Тест: ${
                filters.testScore === 'passed' ? 'Прошли' :
                filters.testScore === 'not_passed' ? 'Не проходили' :
                `≥ ${filters.testScore}`
              }`}
              size="small"
              onDelete={() => handleRemoveFilter('testScore')}
            />
          )}
          {filters.hasResume && (
            <Chip
              label={`Резюме: ${filters.hasResume === 'true' ? 'Есть' : 'Нет'}`}
              size="small"
              onDelete={() => handleRemoveFilter('hasResume')}
            />
          )}
          {filters.datePreset && filters.datePreset !== 'custom' && (
            <Chip
              label={`Дата: ${
                filters.datePreset === 'today' ? 'Сегодня' : 
                filters.datePreset === '3days' ? 'Последние 3 дня' : 
                filters.datePreset === 'week' ? 'Последняя неделя' : 'Последний месяц'
              }`}
              size="small"
              onDelete={() => handleRemoveFilter('datePreset')}
            />
          )}
          {filters.datePreset === 'custom' && (filters.dateFrom || filters.dateTo) && (
            <Chip
              label={`Дата: ${filters.dateFrom || '...'} — ${filters.dateTo || '...'}`}
              size="small"
              onDelete={() => {
                const newFilters = { ...filters };
                delete newFilters.datePreset;
                delete newFilters.dateFrom;
                delete newFilters.dateTo;
                setLocalFilters(newFilters);
                onFilterChange(newFilters);
              }}
            />
          )}
          {filters.hhStage && (
            <Chip
              label={`HH Стадия: ${filters.hhStage}`}
              size="small"
              onDelete={() => handleRemoveFilter('hhStage')}
            />
          )}
        </Box>
      )}
    </Paper>
  );
}

