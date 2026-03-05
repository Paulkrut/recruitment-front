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
import { msg, Trans } from '@lingui/macro';
import { CANDIDATE_STATUS_CONFIG, getCandidateStatusItem } from '@/constants/candidateStatuses';


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
    status?: string; // Стадия воронки (stage)
    interviewStatus?: string; // Статус интервью
    testScore?: string; // Новый фильтр для оценки за тест
    invitationSent?: string; // Новый фильтр для приглашений
    redFlag?: string; // Фильтр по red flags
  };
  onFilterChange: (filters: any) => void;
  vacancyId: number;
  viewMode?: 'list' | 'kanban';
  hasRedFlagQuestions?: boolean; // Есть ли у вакансии критические вопросы
}

export default function CandidateFilters({ filters, onFilterChange, vacancyId, viewMode = 'list', hasRedFlagQuestions = false }: CandidateFiltersProps) {
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
        <Box flex={1} fontWeight="bold"><Trans>Фильтры</Trans></Box>

        {hasActiveFilters && (
          <Button
            size="small"
            startIcon={<ClearIcon />}
            onClick={handleClear}
          >
            <Trans>Сбросить</Trans>
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
            <InputLabel><Trans>Источник</Trans></InputLabel>
            <Select
              value={localFilters.source || ''}
              label={_(msg`Источник`)}
              onChange={(e) => handleLocalChange('source', e.target.value)}
            >
              <MenuItem value=""><Trans>Все</Trans></MenuItem>
              <MenuItem value="manual"><Trans>✍️ Ручной</Trans></MenuItem>
              <MenuItem value="headhunter">🎯 HH.ru</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Статус интервью */}
        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel><Trans>Статус интервью</Trans></InputLabel>
            <Select
              value={localFilters.interviewStatus || ''}
              label={_(msg`Статус интервью`)}
              onChange={(e) => handleLocalChange('interviewStatus', e.target.value)}
            >
              <MenuItem value=""><Trans>Все</Trans></MenuItem>
              <MenuItem value="not_started"><Trans>⏳ Не начато</Trans></MenuItem>
              <MenuItem value="in_progress"><Trans>▶️ В процессе</Trans></MenuItem>
              <MenuItem value="finished"><Trans>✅ Завершено</Trans></MenuItem>
              <MenuItem value="no_interview"><Trans>❌ Не проходили</Trans></MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Стадия - только для режима списка */}
        {viewMode === 'list' && (
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel><Trans>Стадия</Trans></InputLabel>
              <Select
                value={localFilters.status || ''}
                label={_(msg`Стадия`)}
                onChange={(e) => handleLocalChange('status', e.target.value)}
              >
                <MenuItem value=""><Trans>Все</Trans></MenuItem>
                {CANDIDATE_STATUS_CONFIG.map((s) => (
                  <MenuItem key={s.value} value={s.value}>
                    {s.icon} {_(s.label)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        {/* AI анализ резюме (объединённый фильтр) */}
        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel><Trans>AI анализ резюме</Trans></InputLabel>
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
              <MenuItem value=""><Trans>Все</Trans></MenuItem>
              <MenuItem value="status_loading_resume"><Trans>⏳ Загрузка резюме</Trans></MenuItem>
              <MenuItem value="status_analyzing"><Trans>🤖 Анализируется</Trans></MenuItem>
              <MenuItem value="status_null"><Trans>⚪ Без анализа</Trans></MenuItem>
              <MenuItem value="status_failed"><Trans>❌ Ошибка анализа</Trans></MenuItem>
              <MenuItem value="score_90"><Trans>≥ 90% (отличные)</Trans></MenuItem>
              <MenuItem value="score_80"><Trans>≥ 80% (хорошие)</Trans></MenuItem>
              <MenuItem value="score_70"><Trans>≥ 70% (средние)</Trans></MenuItem>
              <MenuItem value="score_60"><Trans>≥ 60% (слабые)</Trans></MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Оценка за тест */}
        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel><Trans>Оценка за тест</Trans></InputLabel>
            <Select
              value={localFilters.testScore || ''}
              label={_(msg`Оценка за тест`)}
              onChange={(e) => handleLocalChange('testScore', e.target.value)}
            >
              <MenuItem value=""><Trans>Все</Trans></MenuItem>
              <MenuItem value="passed"><Trans>✅ Прошли тест</Trans></MenuItem>
              <MenuItem value="not_passed"><Trans>❌ Не проходили</Trans></MenuItem>
              <MenuItem value="9"><Trans>≥ 9 (отлично)</Trans></MenuItem>
              <MenuItem value="7"><Trans>≥ 7 (хорошо)</Trans></MenuItem>
              <MenuItem value="5"><Trans>≥ 5 (средне)</Trans></MenuItem>
              <MenuItem value="3"><Trans>≥ 3 (слабо)</Trans></MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Приглашение на интервью (только для HH кандидатов) */}
        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel><Trans>Приглашение</Trans></InputLabel>
            <Select
              value={localFilters.invitationSent || ''}
              label={_(msg`Приглашение`)}
              onChange={(e) => handleLocalChange('invitationSent', e.target.value)}
            >
              <MenuItem value=""><Trans>Все</Trans></MenuItem>
              <MenuItem value="sent"><Trans>✉️ Отправлено</Trans></MenuItem>
              <MenuItem value="not_sent"><Trans>⚪ Не отправлено</Trans></MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Red Flags (только если у вакансии есть критические вопросы) */}
        {hasRedFlagQuestions && (
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel><Trans>🚩 Red Flags</Trans></InputLabel>
              <Select
                value={localFilters.redFlag || ''}
                label={_(msg`🚩 Red Flags`)}
                onChange={(e) => handleLocalChange('redFlag', e.target.value)}
              >
                <MenuItem value=""><Trans>Все</Trans></MenuItem>
                <MenuItem value="has"><Trans>🚩 Есть флаги</Trans></MenuItem>
                <MenuItem value="none"><Trans>✅ Без флагов</Trans></MenuItem>
                <MenuItem value="1"><Trans>= 1 флаг</Trans></MenuItem>
                <MenuItem value="2"><Trans>= 2 флага</Trans></MenuItem>
                <MenuItem value="3"><Trans>= 3 флага</Trans></MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}

        {/* Наличие резюме */}
        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel><Trans>Резюме</Trans></InputLabel>
            <Select
              value={localFilters.hasResume || ''}
              label={_(msg`Резюме`)}
              onChange={(e) => handleLocalChange('hasResume', e.target.value)}
            >
              <MenuItem value=""><Trans>Все</Trans></MenuItem>
              <MenuItem value="true"><Trans>✅ С резюме</Trans></MenuItem>
              <MenuItem value="false"><Trans>❌ Без резюме</Trans></MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Дата добавления */}
        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel><Trans>Дата добавления</Trans></InputLabel>
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
              <MenuItem value=""><Trans>Все время</Trans></MenuItem>
              <MenuItem value="today"><Trans>📅 Сегодня</Trans></MenuItem>
              <MenuItem value="3days"><Trans>📅 Последние 3 дня</Trans></MenuItem>
              <MenuItem value="week"><Trans>📅 Последняя неделя</Trans></MenuItem>
              <MenuItem value="month"><Trans>📅 Последний месяц</Trans></MenuItem>
              <MenuItem value="custom"><Trans>📆 Выбрать диапазон...</Trans></MenuItem>
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
              <InputLabel><Trans>Стадия HH</Trans></InputLabel>
              <Select
                value={localFilters.hhStage || ''}
                label={_(msg`Стадия HH`)}
                onChange={(e) => handleLocalChange('hhStage', e.target.value)}
                disabled={loadingStages}
              >
                <MenuItem value=""><Trans>Все стадии</Trans></MenuItem>
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
          {hasUnappliedChanges ? _(msg`Применить фильтры`) : _(msg`Фильтры применены`)}
        </Button>
      </Box>

      {/* Активные фильтры - удаление применяется сразу */}
      {hasActiveFilters && (
        <Box display="flex" gap={1} mt={2} flexWrap="wrap">
          {filters.search && (
            <Chip
              label={_(msg`Поиск: ${filters.search}`)}
              size="small"
              onDelete={() => handleRemoveFilter('search')}
            />
          )}
          {filters.source && (
            <Chip
              label={`Источник: ${filters.source === 'manual' ? _(msg`Ручной`) : filters.source === 'headhunter' ? 'HH.ru' : filters.source}`}
              size="small"
              onDelete={() => handleRemoveFilter('source')}
            />
          )}
          {filters.interviewStatus && (
            <Chip
              label={_(msg`Интервью: ${
                filters.interviewStatus === 'not_started' ? _(msg`Не начато`) :
                filters.interviewStatus === 'in_progress' ? _(msg`В процессе`) :
                filters.interviewStatus === 'finished' ? _(msg`Завершено`) :
                filters.interviewStatus === 'no_interview' ? _(msg`Не проходили`) :
                filters.interviewStatus
              }`)}
              size="small"
              onDelete={() => handleRemoveFilter('interviewStatus')}
            />
          )}
          {filters.status && viewMode === 'list' && (
            <Chip
              label={(() => {
                const item = getCandidateStatusItem(filters.status);
                return item ? `${_(msg`Стадия`)}: ${item.icon} ${_(item.label)}` : `${_(msg`Стадия`)}: ${filters.status}`;
              })()}
              size="small"
              onDelete={() => handleRemoveFilter('status')}
            />
          )}
          {(filters.minScore || filters.aiAnalysisStatus) && (
            <Chip
              label={_(msg`AI анализ: ${
                filters.minScore ? `≥ ${filters.minScore}%` :
                filters.aiAnalysisStatus === 'loading_resume' ? _(msg`Загрузка резюме`) : 
                filters.aiAnalysisStatus === 'analyzing' ? _(msg`Анализируется`) : 
                filters.aiAnalysisStatus === 'completed' ? _(msg`Завершено`) : 
                filters.aiAnalysisStatus === 'failed' ? _(msg`Ошибка`) : _(msg`Без анализа`)
              }`)}
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
              label={
                filters.testScore === 'passed'
                  ? _(msg`Тест: Прошли`)
                  : filters.testScore === 'not_passed'
                    ? _(msg`Тест: Не проходили`)
                    : _(msg`Тест: ≥ ${filters.testScore}`)
              }
              size="small"
              onDelete={() => handleRemoveFilter('testScore')}
            />
          )}
          {filters.invitationSent && (
            <Chip
              label={
                filters.invitationSent === 'sent'
                  ? _(msg`Приглашение: Отправлено`)
                  : _(msg`Приглашение: Не отправлено`)
              }
              size="small"
              onDelete={() => handleRemoveFilter('invitationSent')}
            />
          )}
          {filters.hasResume && (
            <Chip
              label={filters.hasResume === 'true' ? _(msg`Резюме: Есть`) : _(msg`Резюме: Нет`)}
              size="small"
              onDelete={() => handleRemoveFilter('hasResume')}
            />
          )}
          {filters.datePreset && filters.datePreset !== 'custom' && (
            <Chip
              label={_(msg`Дата: ${
                filters.datePreset === 'today' ? _(msg`Сегодня`) : 
                filters.datePreset === '3days' ? _(msg`Последние 3 дня`) : 
                filters.datePreset === 'week' ? _(msg`Последняя неделя`) : _(msg`Последний месяц`)
              }`)}
              size="small"
              onDelete={() => handleRemoveFilter('datePreset')}
            />
          )}
          {filters.datePreset === 'custom' && (filters.dateFrom || filters.dateTo) && (
            <Chip
              label={_(msg`Дата: ${filters.dateFrom || '...'} — ${filters.dateTo || '...'}`)}
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
              label={_(msg`HH Стадия: ${filters.hhStage}`)}
              size="small"
              onDelete={() => handleRemoveFilter('hhStage')}
            />
          )}
        </Box>
      )}
    </Paper>
  );
}

