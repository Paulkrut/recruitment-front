'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  Checkbox,
  FormControlLabel,
  Alert,
  CircularProgress,
  LinearProgress,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';
import {
  IconArrowLeft,
  IconRefresh,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
} from '@tabler/icons-react';
import { apiFetch } from '@/utils/api';
import { useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';


const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test';

// Мемоизированная карточка статуса для производительности
const StateCard = memo(({ 
  stateData, 
  isSelected, 
  onToggle 
}: { 
  stateData: StateStats; 
  isSelected: boolean; 
  onToggle: (state: string) => void;
}) => {
  const hasNew = stateData.count_hh > stateData.count;
  
  return (
    <Card 
      variant="outlined"
      sx={{ 
        cursor: 'pointer',
        border: isSelected ? 2 : 1,
        borderColor: isSelected ? 'primary.main' : 'divider',
        bgcolor: isSelected ? 'primary.50' : 'background.paper',
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: 2,
        }
      }}
      onClick={() => onToggle(stateData.state)}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <Checkbox
              checked={isSelected}
              size="small"
              sx={{ p: 0 }}
              onClick={(e) => e.stopPropagation()}
            />
            <Typography variant="subtitle1" fontWeight={600}>
              {stateData.state_name}
            </Typography>
          </Box>
          {hasNew && (
            <Chip
              label={`+${stateData.count_hh - stateData.count}`}
              color="primary"
              size="small"
              sx={{ height: 20, fontSize: '0.7rem' }}
            />
          )}
        </Box>

        <Box display="flex" flexDirection="column" gap={0.5}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color="text.secondary"><Trans>На HH:</Trans></Typography>
            <Typography variant="body2" fontWeight={600}>
              {stateData.count_hh}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color="text.secondary"><Trans>У нас:</Trans></Typography>
            <Typography variant="body2">
              {stateData.count}
            </Typography>
          </Box>
          {stateData.count > 0 && (
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="text.secondary">
                AI:
              </Typography>
              <Typography variant="caption">
                {stateData.with_ai_score} / {stateData.count}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
});

StateCard.displayName = 'StateCard';

interface HhVacancy {
  id: number;
  hh_id: string;
  name: string;
  status: string;
  salary_from: number | null;
  salary_to: number | null;
  salary_currency: string;
  experience: string;
  description: string;
  key_skills: string[];
  area_name: string;
  employer_name: string;
  created_at: string;
  published_at: string;
  archived: boolean;
  url: string;
}

interface StateStats {
  state: string;
  state_name: string;
  count_hh: number;        // Количество на HH.ru (актуальное)
  count: number;           // Количество в нашей БД
  synced: number;          // Синхронизировано
  with_ai_score: number;   // С AI анализом
}

interface SyncSettings {
  selectedStates: string[];
  autoImport: boolean;
  minAiScore: number;
}

interface SyncStatus {
  status: string;
  last_synced_at: string | null;
  total: number;
  synced: number;
  error: string | null;
}

interface VacancyDetailsData {
  vacancy: HhVacancy;
  sync_settings: SyncSettings;
  candidates_by_state: StateStats[];
  sync_status: SyncStatus;
}

export default function HhVacancyDetailPage() {
  const { _ } = useLingui();

  const params = useParams();
  const router = useRouter();
  const vacancyId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<VacancyDetailsData | null>(null);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncingVacancy, setSyncingVacancy] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [expandedDescription, setExpandedDescription] = useState(false);
  const [pollingStatus, setPollingStatus] = useState(false);

  // Загрузка данных
  const fetchVacancyDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiFetch(`${API_BASE}/api/hh-integration/vacancy/${vacancyId}/details`);
      const result = await response.json();

      if (result.success) {
        setData(result);
        setSelectedStates(result.sync_settings.selectedStates || []);
      } else {
        setError(result.error || _(msg`Ошибка загрузки данных`));
      }
    } catch (err) {
      setError(_(msg`Ошибка при загрузке данных вакансии`));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [vacancyId]);

  useEffect(() => {
    fetchVacancyDetails();
  }, [fetchVacancyDetails]);

  // Сохранить настройки
  const handleSaveSettings = useCallback(async () => {
    try {
      const response = await apiFetch(
        `${API_BASE}/api/hh-integration/vacancy/${vacancyId}/update-sync-settings`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ selectedStates }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setSuccess(_(msg`Настройки синхронизации сохранены`));
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || _(msg`Ошибка сохранения настроек`));
      }
    } catch (err) {
      setError(_(msg`Ошибка при сохранении настроек`));
      console.error(err);
    }
  }, [vacancyId, selectedStates]);

  // Синхронизировать только вакансию
  const handleSyncVacancyOnly = useCallback(async () => {
    try {
      setSyncingVacancy(true);
      const response = await apiFetch(
        `${API_BASE}/api/hh-integration/vacancy/${vacancyId}/sync-vacancy-only`,
        { method: 'POST' }
      );

      const result = await response.json();

      if (result.success) {
        setSuccess(_(msg`Вакансия обновлена`));
        fetchVacancyDetails(); // Перезагружаем данные
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || _(msg`Ошибка обновления вакансии`));
      }
    } catch (err) {
      setError(_(msg`Ошибка при обновлении вакансии`));
      console.error(err);
    } finally {
      setSyncingVacancy(false);
    }
  }, [vacancyId, fetchVacancyDetails]);

  // Синхронизировать кандидатов
  const handleSyncCandidates = useCallback(async () => {
    if (selectedStates.length === 0) {
      setError(_(msg`Выберите хотя бы один статус для синхронизации`));
      return;
    }

    try {
      setSyncing(true);
      setError(null);

      // Сначала сохраняем настройки
      await handleSaveSettings();

      // Затем запускаем синхронизацию с выбранными статусами
      const response = await apiFetch(
        `${API_BASE}/api/hh-integration/vacancy/${vacancyId}/sync-candidates`,
        { 
          method: 'POST',
          body: JSON.stringify({ states: selectedStates })
        }
      );

      const result = await response.json();

      if (result.success) {
        setSuccess(_(msg`Синхронизация кандидатов запущена`));
        setPollingStatus(true);
        pollSyncStatus();
      } else {
        setError(result.message || _(msg`Ошибка синхронизации`));
        setSyncing(false);
      }
    } catch (err) {
      setError(_(msg`Ошибка при запуске синхронизации`));
      console.error(err);
      setSyncing(false);
    }
  }, [vacancyId, selectedStates, handleSaveSettings]);

  // Запустить AI-анализ
  const handleAnalyzeCandidates = useCallback(async () => {
    try {
      setAnalyzing(true);
      const response = await apiFetch(
        `${API_BASE}/api/hh-integration/vacancy/${vacancyId}/analyze-candidates`,
        { method: 'POST' }
      );

      const result = await response.json();

      if (result.success) {
        setSuccess(_(msg`AI-анализ завершён: ${result.data.analyzed} кандидатов проанализировано`));
        fetchVacancyDetails(); // Перезагружаем статистику
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError(result.message || _(msg`Ошибка AI-анализа`));
      }
    } catch (err) {
      setError(_(msg`Ошибка при запуске AI-анализа`));
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  }, [vacancyId, fetchVacancyDetails]);

  // Polling статуса синхронизации
  const pollSyncStatus = useCallback(async () => {
    const interval = setInterval(async () => {
      try {
        const response = await apiFetch(
          `${API_BASE}/api/hh-integration/vacancy/${vacancyId}/sync-status`
        );
        const result = await response.json();

        if (result.success && result.data) {
          const syncStatus = result.data.status;
          
          if (syncStatus === 'synced' || syncStatus === 'error') {
            clearInterval(interval);
            setPollingStatus(false);
            setSyncing(false);
            fetchVacancyDetails(); // Перезагружаем данные
            
            if (syncStatus === 'error') {
              setError(result.data.error || _(msg`Ошибка синхронизации`));
            } else {
              setSuccess(_(msg`Синхронизация завершена! Обработано: ${result.data.synced} из ${result.data.total}`));
              setTimeout(() => setSuccess(null), 5000);
            }
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2000);

    // Таймаут на 5 минут
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setPollingStatus(false);
      setSyncing(false);
      setError(_(msg`Таймаут синхронизации (превышено 5 минут)`));
    }, 300000);

    // Сохраняем ID таймаута чтобы очистить его при успешном завершении
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [vacancyId, fetchVacancyDetails]);

  // Toggle выбора статуса (мемоизировано для производительности)
  const handleToggleState = useCallback((state: string) => {
    setSelectedStates(prev =>
      prev.includes(state)
        ? prev.filter(s => s !== state)
        : [...prev, state]
    );
  }, []);

  // Подсчёт общего количества кандидатов для выбранных статусов (актуальное с HH)
  const getTotalSelectedCandidates = useCallback(() => {
    if (!data) return 0;
    return data.candidates_by_state
      .filter(s => selectedStates.includes(s.state))
      .reduce((sum, s) => sum + s.count_hh, 0); // Используем count_hh (актуальное)
  }, [data, selectedStates]);

  if (loading) {
    return (
      <PageContainer title={_(msg`Загрузка...`)} description="">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (!data) {
    return (
      <PageContainer title={_(msg`Ошибка`)} description="">
        <Alert severity="error">{error || _(msg`Вакансия не найдена`)}</Alert>
      </PageContainer>
    );
  }

  const { vacancy, candidates_by_state, sync_status } = data;

  return (
    <PageContainer
      title={vacancy.name}
      description="Настройка синхронизации вакансии"
    >
      <Box>
        {/* Кнопка назад */}
        <Button
          startIcon={<IconArrowLeft />}
          onClick={() => router.push('/hr/settings/hh-integration')}
          sx={{ mb: 3 }}
        >
          Назад к списку вакансий
        </Button>

        {/* Алерты */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Заголовок вакансии */}
        <Typography variant="h3" mb={3}>
          {vacancy.name}
        </Typography>

        <Grid container spacing={3}>
          {/* Информация о вакансии */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h5"><Trans>📊 Информация о вакансии</Trans></Typography>
                  <Button
                    variant="outlined"
                    startIcon={syncingVacancy ? <CircularProgress size={16} /> : <IconRefresh />}
                    onClick={handleSyncVacancyOnly}
                    disabled={syncingVacancy}
                  >
                    Обновить вакансию
                  </Button>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <List>
                      <ListItem>
                        <ListItemText
                          primary="Статус"
                          secondary={
                            <Chip
                              label={vacancy.status === 'active' ? 'Активна' : 'Архив'}
                              color={vacancy.status === 'active' ? 'success' : 'default'}
                              size="small"
                            />
                          }
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Зарплата"
                          secondary={
                            vacancy.salary_from || vacancy.salary_to
                              ? `${vacancy.salary_from ? vacancy.salary_from.toLocaleString() : '...'} - ${vacancy.salary_to ? vacancy.salary_to.toLocaleString() : '...'} ${vacancy.salary_currency}`
                              : 'Не указана'
                          }
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Опыт" secondary={vacancy.experience} />
                      </ListItem>
                    </List>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <List>
                      <ListItem>
                        <ListItemText primary="Город" secondary={vacancy.area_name} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="HH ID" secondary={vacancy.hh_id} />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Ссылка на HH"
                          secondary={
                            <a href={vacancy.url} target="_blank" rel="noopener noreferrer">
                              Открыть на hh.ru
                            </a>
                          }
                        />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>

                {/* Описание вакансии */}
                {vacancy.description && (
                  <Box mt={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6"><Trans>Описание:</Trans></Typography>
                      <IconButton
                        size="small"
                        onClick={() => setExpandedDescription(!expandedDescription)}
                      >
                        {expandedDescription ? <IconChevronUp /> : <IconChevronDown />}
                      </IconButton>
                    </Box>
                    <Collapse in={expandedDescription}>
                      <Box
                        mt={1}
                        dangerouslySetInnerHTML={{ __html: vacancy.description }}
                        sx={{
                          '& p': { margin: '8px 0' },
                          '& ul, & ol': { paddingLeft: '20px' },
                        }}
                      />
                    </Collapse>
                  </Box>
                )}

                {/* Ключевые навыки */}
                {vacancy.key_skills && vacancy.key_skills.length > 0 && (
                  <Box mt={2}>
                    <Typography variant="h6" mb={1}><Trans>Ключевые навыки:</Trans></Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {vacancy.key_skills.map((skill, index) => (
                        <Chip key={index} label={skill} variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Синхронизация кандидатов */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h5" mb={2}><Trans>👥 Синхронизация кандидатов</Trans></Typography>

                <Typography variant="body2" color="text.secondary" mb={3}><Trans>Выберите статусы HH.ru для синхронизации:</Trans></Typography>

                {/* Список статусов */}
                {candidates_by_state.length === 0 ? (
                  <Alert severity="info"><Trans>Статистика по статусам пока недоступна. Запустите синхронизацию кандидатов.</Trans></Alert>
                ) : (
                  <Grid container spacing={2}>
                    {candidates_by_state.map((stateData) => (
                      <Grid item xs={12} sm={6} md={4} key={stateData.state}>
                        <StateCard 
                          stateData={stateData}
                          isSelected={selectedStates.includes(stateData.state)}
                          onToggle={handleToggleState}
                        />
                      </Grid>
                    ))}
                  </Grid>
                )}

                {/* Предупреждение */}
                {getTotalSelectedCandidates() > 100 && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    ⚠️ Внимание: Синхронизация {getTotalSelectedCandidates()} кандидатов может занять
                    несколько минут.
                  </Alert>
                )}

                {/* Прогресс синхронизации */}
                {syncing && sync_status && (
                  <Box mt={2}>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Синхронизация: {sync_status.synced} / {sync_status.total}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(sync_status.synced / sync_status.total) * 100}
                    />
                  </Box>
                )}

                {/* Кнопки действий */}
                <Box mt={3} display="flex" gap={2}>
                  <Button
                    variant="outlined"
                    onClick={handleSaveSettings}
                    disabled={syncing}
                  ><Trans>Сохранить настройки</Trans></Button>
                  <Button
                    variant="contained"
                    onClick={handleSyncCandidates}
                    disabled={syncing || selectedStates.length === 0}
                    startIcon={syncing ? <CircularProgress size={16} /> : <IconCheck />}
                  >
                    Синхронизировать кандидатов
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Статистика синхронизации */}
          {sync_status && sync_status.last_synced_at && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h5" mb={2}><Trans>📈 Статистика синхронизации</Trans></Typography>

                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Последняя синхронизация"
                        secondary={new Date(sync_status.last_synced_at).toLocaleString('ru-RU')}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Синхронизировано кандидатов"
                        secondary={`${sync_status.synced} / ${sync_status.total}`}
                      />
                    </ListItem>
                    {candidates_by_state.length > 0 && (
                      <ListItem>
                        <ListItemText
                          primary="Кандидатов с AI-анализом"
                          secondary={`${candidates_by_state.reduce((sum, s) => sum + s.with_ai_score, 0)} (${Math.round((candidates_by_state.reduce((sum, s) => sum + s.with_ai_score, 0) / candidates_by_state.reduce((sum, s) => sum + s.count, 0)) * 100)}%)`}
                        />
                      </ListItem>
                    )}
                  </List>

                  <Button
                    variant="outlined"
                    startIcon={analyzing ? <CircularProgress size={16} /> : <IconRefresh />}
                    onClick={handleAnalyzeCandidates}
                    disabled={analyzing}
                    sx={{ mt: 2 }}
                  >
                    Запустить AI-анализ для всех
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>
    </PageContainer>
  );
}

