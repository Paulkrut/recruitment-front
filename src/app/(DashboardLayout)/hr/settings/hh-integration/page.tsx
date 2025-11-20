"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  IconBrandHipchat,
  IconCheck,
  IconX,
  IconRefresh,
  IconSettings,
  IconDownload,
  IconUsers,
  IconBriefcase,
  IconChevronDown,
  IconExternalLink,
  IconClock,
  IconShield,
} from "@tabler/icons-react";
import PageContainer from "@/app/components/container/PageContainer";
import { apiFetch } from "@/utils/api";
import { useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';


const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

interface HhIntegrationStatus {
  isConnected: boolean;
  hasValidToken: boolean;
  tokenStatus?: string; // 'valid' | 'expired' | 'revoked' | 'refresh_failed' | 'invalid' | 'disconnected'
  tokenMessage?: string;
  employerId?: string;
  companyName?: string;
  lastSyncAt?: string;
  tokenExpiresAt?: string;
  autoSync: boolean;
  syncInterval: number;
  stats?: {
    totalVacancies: number;
    totalCandidates: number;
    newCandidatesToday: number;
  };
  hhLimits?: {
    left: {
      resumeView: number;
      resumeViewFromApi: number;
    };
    limits: {
      resumeView: number;
      resumeViewFromApi: number;
    };
    spend: {
      resumeView: number;
      resumeViewFromApi: number;
    };
    source: string;
  };
  resumeQueueCount?: number;
}

interface HhVacancy {
  id: number;
  hh_id: string;
  title: string;
  status: string;
  salary_from?: number;
  salary_to?: number;
  currency?: string;
  experience?: string;
  is_imported: boolean;
  candidates_sync_status: string;
  candidates_total: number;
  candidates_synced: number;
  candidates_last_synced_at?: string;
  candidates_sync_error?: string;
  created_at: string;
  last_synced_at?: string;
}

export default function HhIntegrationPage() {
  const { _ } = useLingui();

  const searchParams = useSearchParams();
  const [status, setStatus] = useState<HhIntegrationStatus | null>(null);
  const [vacancies, setVacancies] = useState<HhVacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pollingVacancyId, setPollingVacancyId] = useState<number | null>(null);

  // Проверяем, вернулся ли пользователь после OAuth
  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      setError(_(msg`Ошибка авторизации: ${error}`));
      setLoading(false);
      return;
    }

    if (code && state) {
      handleOAuthCallback(code, state);
    } else {
      fetchStatus();
    }
  }, [searchParams]);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(`${API_BASE}/api/hh-integration/status`);
      const data = await response.json();
      setStatus(data);

      // Если подключено, загружаем вакансии
      if (data.isConnected) {
        await fetchVacancies();
      }
    } catch (err: any) {
      setError(err.message || _(msg`Ошибка загрузки статуса интеграции`));
    } finally {
      setLoading(false);
    }
  };

  const fetchVacancies = async () => {
    try {
      const response = await apiFetch(`${API_BASE}/api/hh-integration/vacancies`);
      const data = await response.json();
      if (data.success && data.data) {
        setVacancies(data.data);
      }
    } catch (err: any) {
      console.error('Ошибка загрузки вакансий:', err);
    }
  };

  const handleOAuthCallback = async (code: string, state: string) => {
    try {
      setConnecting(true);
      const response = await apiFetch(`${API_BASE}/api/hh-integration/oauth-callback`, {
        method: 'POST',
        body: JSON.stringify({ code, state }),
      });
      const data = await response.json();

      if (data.success) {
        setSuccess(_(msg`HH.ru успешно подключен!`));
        await fetchStatus();
      } else {
        throw new Error(data.message || _(msg`Ошибка подключения`));
      }
    } catch (err: any) {
      setError(err.message || _(msg`Ошибка обработки авторизации`));
    } finally {
      setConnecting(false);
    }
  };

  const startOAuthFlow = async () => {
    try {
      setConnecting(true);
      const response = await apiFetch(`${API_BASE}/api/hh-integration/start-oauth`);
      const data = await response.json();
      if (data.authUrl) {
        // Перенаправляем на HH.ru для авторизации
        window.location.href = data.authUrl;
      } else {
        throw new Error(_(msg`Не удалось получить URL авторизации`));
      }
    } catch (err: any) {
      setError(err.message || _(msg`Ошибка запуска авторизации`));
      setConnecting(false);
    }
  };

  const disconnectHh = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(`${API_BASE}/api/hh-integration/disconnect`, {
        method: 'POST',
      });
      await response.json(); // Парсим ответ

      setSuccess(_(msg`HH.ru отключен`));
      await fetchStatus();
    } catch (err: any) {
      setError(err.message || _(msg`Ошибка отключения`));
      setLoading(false);
    }
  };

  const syncVacancies = async () => {
    try {
      setSyncing(true);
      const response = await apiFetch(`${API_BASE}/api/hh-integration/sync-vacancies`, {
        method: 'POST',
      });
      const data = await response.json();

      setSuccess(_(msg`Синхронизация завершена. Загружено вакансий: ${data.syncedCount || 0}`));
      await fetchStatus();
    } catch (err: any) {
      setError(err.message || _(msg`Ошибка синхронизации`));
    } finally {
      setSyncing(false);
    }
  };

  const updateAutoSync = async (enabled: boolean) => {
    try {
      const response = await apiFetch(`${API_BASE}/api/hh-integration/auto-sync`, {
        method: 'POST',
        body: JSON.stringify({ enabled }),
      });
      await response.json(); // Парсим ответ

      setStatus(prev => prev ? { ...prev, autoSync: enabled } : null);
      setSuccess(_(msg`Автоматическая синхронизация ${enabled ? _(msg`включена`) : _(msg`отключена`)}`));
    } catch (err: any) {
      setError(err.message || _(msg`Ошибка обновления настроек`));
    }
  };

  // Синхронизация кандидатов для конкретной вакансии
  const syncVacancyCandidates = async (vacancyId: number) => {
    try {
      setPollingVacancyId(vacancyId);
      
      const response = await apiFetch(`${API_BASE}/api/hh-integration/vacancy/${vacancyId}/sync-candidates`, {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        // Начинаем polling для отслеживания прогресса
        pollVacancyStatus(vacancyId);
      } else {
        setError(data.message || _(msg`Ошибка запуска синхронизации`));
        setPollingVacancyId(null);
      }
    } catch (err: any) {
      setError(err.message || _(msg`Ошибка синхронизации кандидатов`));
      setPollingVacancyId(null);
    }
  };

  // Запуск AI-анализа для кандидатов вакансии
  const analyzeVacancyCandidates = async (vacancyId: number) => {
    try {
      const response = await apiFetch(`${API_BASE}/api/hh-integration/vacancy/${vacancyId}/analyze-candidates`, {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        setSuccess(_(msg`AI-анализ запущен. Будет проанализировано ${data.candidatesCount || 0} кандидатов.`));
        // Обновляем список вакансий через несколько секунд
        setTimeout(() => fetchVacancies(), 3000);
      } else {
        setError(data.message || _(msg`Ошибка запуска AI-анализа`));
      }
    } catch (err: any) {
      setError(err.message || _(msg`Ошибка запуска AI-анализа`));
    }
  };

  // Polling статуса синхронизации вакансии
  const pollVacancyStatus = async (vacancyId: number) => {
    try {
      const response = await apiFetch(`${API_BASE}/api/hh-integration/vacancy/${vacancyId}/sync-status`);
      const data = await response.json();

      if (data.success) {
        const vacancyStatus = data.data;
        
        // Обновляем вакансию в списке
        setVacancies(prev => prev.map(v => 
          v.id === vacancyId 
            ? {
                ...v,
                candidates_sync_status: vacancyStatus.candidates_sync_status,
                candidates_total: vacancyStatus.candidates_total,
                candidates_synced: vacancyStatus.candidates_synced,
                candidates_last_synced_at: vacancyStatus.candidates_last_synced_at,
                candidates_sync_error: vacancyStatus.candidates_sync_error,
              }
            : v
        ));

        // Если синхронизация еще идет, продолжаем polling
        if (vacancyStatus.candidates_sync_status === 'syncing') {
          setTimeout(() => pollVacancyStatus(vacancyId), 2000); // Проверяем каждые 2 секунды
        } else {
          setPollingVacancyId(null);
          
          if (vacancyStatus.candidates_sync_status === 'synced') {
            setSuccess(_(msg`Синхронизация завершена! Загружено ${vacancyStatus.candidates_synced} кандидатов.`));
          } else if (vacancyStatus.candidates_sync_status === 'error') {
            setError(_(msg`Ошибка синхронизации: ${vacancyStatus.candidates_sync_error || _(msg`Неизвестная ошибка`)}`));
          }
        }
      }
    } catch (err: any) {
      console.error('Ошибка polling:', err);
      setPollingVacancyId(null);
    }
  };

  if (loading) {
    return (
      <PageContainer title={_(msg`Интеграция с HH.ru`)} description="Настройка интеграции с HeadHunter">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer title={_(msg`Интеграция с HH.ru`)} description="Настройка интеграции с HeadHunter">
      <Box>
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

        <Box sx={{ position: 'relative' }}>
          {/* Оверлей блокировки при проблемах с токеном */}
          {status?.isConnected && !status?.hasValidToken && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 10,
                pointerEvents: 'none', // Не блокируем Alert
              }}
            >
              {/* Размытый фон */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgcolor: 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(2px)',
                  pointerEvents: 'all', // Блокируем клики
                  cursor: 'not-allowed',
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </Box>
          )}

          <Grid container spacing={3}>
            {/* Статус подключения */}
            <Grid item xs={12}>
            <Card>
              <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <IconBrandHipchat size={32} color="#d63031" />
                  <Typography variant="h5"><Trans>Интеграция с HeadHunter</Trans></Typography>
                  {status?.isConnected && (
                    <Chip
                      icon={<IconCheck size={16} />}
                      label={status.hasValidToken ? _(msg`Подключено`) : _(msg`Требуется переавторизация`)}
                      color={status.hasValidToken ? "success" : "warning"}
                      size="small"
                    />
                  )}
                </Box>

                {!status?.isConnected ? (
                  <Box>
                    <Typography variant="body1" color="text.secondary" mb={3}><Trans>Подключите ваш аккаунт работодателя HH.ru для автоматической синхронизации вакансий и получения откликов кандидатов.</Trans></Typography>

                    <Button
                      variant="contained"
                      size="large"
                      onClick={startOAuthFlow}
                      disabled={connecting}
                      startIcon={connecting ? <CircularProgress size={20} /> : <IconExternalLink />}
                    >
                      {connecting ? _(msg`Подключение...`) : _(msg`Подключить HH.ru`)}
                    </Button>

                    <Box mt={3}>
                      <Typography variant="h6" gutterBottom><Trans>Что даст интеграция:</Trans></Typography>
                      <List>
                        <ListItem>
                          <ListItemIcon>
                            <IconBriefcase color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={_(msg`Автоматическая загрузка ваших вакансий`)}
                            secondary={_(msg`Все опубликованные на HH.ru вакансии будут синхронизированы`)}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <IconUsers color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={_(msg`Получение откликов кандидатов`)}
                            secondary={_(msg`Все отклики на вакансии будут автоматически импортированы`)}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <IconClock color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={_(msg`Автоматическая синхронизация`)}
                            secondary={_(msg`Новые данные будут обновляться каждые 2 часа`)}
                          />
                        </ListItem>
                      </List>
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    {/* Предупреждение о проблемах с токеном */}
                    {status.isConnected && !status.hasValidToken && status.tokenMessage && (
                      <Alert 
                        severity={
                          status.tokenStatus === 'revoked' || 
                          status.tokenStatus === 'refresh_failed' || 
                          status.tokenStatus === 'disconnected_with_data'
                            ? 'error' 
                            : 'warning'
                        } 
                        sx={{ 
                          mb: 3, 
                          position: 'relative', 
                          zIndex: 11, // Выше оверлея
                          boxShadow: 3,
                        }}
                        action={
                          <Button 
                            color="inherit" 
                            size="small"
                            variant="outlined"
                            onClick={startOAuthFlow}
                          >
                            {status.tokenStatus === 'disconnected_with_data' 
                              ? _(msg`Подключить заново`) 
                              : _(msg`Переавторизоваться`)
                            }
                          </Button>
                        }
                      >
                        <Typography variant="body2" fontWeight="bold">
                          {status.tokenStatus === 'disconnected_with_data'
                            ? _(msg`📊 Интеграция отключена`)
                            : status.tokenStatus === 'revoked' 
                            ? _(msg`⚠️ Токен доступа был отозван`) 
                            : status.tokenStatus === 'refresh_failed'
                            ? _(msg`⚠️ Не удалось обновить токен`)
                            : _(msg`⚠️ Проблема с токеном доступа`)
                          }
                        </Typography>
                        <Typography variant="body2" mt={0.5}>
                          {status.tokenMessage}
                        </Typography>
                        {status.tokenStatus === 'disconnected_with_data' && (
                          <Typography variant="caption" display="block" mt={1} color="text.secondary">
                            Данные от HH.ru ({status.stats?.totalVacancies || 0} вакансий, {status.stats?.totalCandidates || 0} кандидатов) 
                            сохранены и доступны для просмотра. Для получения новых обновлений подключитесь заново.
                          </Typography>
                        )}
                        {(status.tokenStatus === 'revoked' || status.tokenStatus === 'refresh_failed') && (
                          <Typography variant="caption" display="block" mt={1} color="text.secondary">
                            Это может произойти если вы отозвали доступ к приложению в настройках HH.ru.
                            Ваши данные ({status.stats?.totalVacancies || 0} вакансий, {status.stats?.totalCandidates || 0} кандидатов) 
                            сохранены. Переавторизуйтесь для продолжения работы.
                          </Typography>
                        )}
                      </Alert>
                    )}

                    <Grid container spacing={2} mb={3}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary"><Trans>Компания</Trans></Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {status.companyName || _(msg`Не указано`)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary"><Trans>ID работодателя</Trans></Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {status.employerId || _(msg`Не указано`)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary"><Trans>Последняя синхронизация</Trans></Typography>
                        <Typography variant="body1">
                          {status.lastSyncAt
                            ? new Date(status.lastSyncAt).toLocaleString('ru-RU')
                            : _(msg`Еще не выполнялась`)
                          }
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary"><Trans>Токен действует до</Trans></Typography>
                        <Typography variant="body1">
                          {status.tokenExpiresAt
                            ? new Date(status.tokenExpiresAt).toLocaleString('ru-RU')
                            : _(msg`Не указано`)
                          }
                        </Typography>
                      </Grid>
                    </Grid>

                    {/* Статистика */}
                    {status.stats && (
                      <Box mb={3}>
                        <Typography variant="h6" gutterBottom><Trans>Статистика</Trans></Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={4}>
                            <Box textAlign="center">
                              <Typography variant="h4" color="primary">
                                {status.stats.totalVacancies}
                              </Typography>
                              <Typography variant="body2" color="text.secondary"><Trans>Вакансий</Trans></Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={4}>
                            <Box textAlign="center">
                              <Typography variant="h4" color="secondary">
                                {status.stats.totalCandidates}
                              </Typography>
                              <Typography variant="body2" color="text.secondary"><Trans>Кандидатов</Trans></Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={4}>
                            <Box textAlign="center">
                              <Typography variant="h4" color="success.main">
                                {status.stats.newCandidatesToday}
                              </Typography>
                              <Typography variant="body2" color="text.secondary"><Trans>Новых сегодня</Trans></Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    )}

                    {/* Лимиты HeadHunter.ru */}
                    {status.hhLimits && (
                      <Box mb={3}>
                        <Alert 
                          severity={
                            status.hhLimits.left.resumeView > 500 ? "success" : 
                            status.hhLimits.left.resumeView > 100 ? "warning" : "error"
                          } 
                          icon={<IconShield size={20} />}
                        >
                          <Typography variant="subtitle2" gutterBottom>
                            Дневной лимит просмотра резюме на {status.hhLimits.source}:
                          </Typography>
                          <Grid container spacing={2} mt={0.5}>
                            <Grid item xs={12} md={6}>
                              <Box textAlign="center">
                                <Typography 
                                  variant="h3" 
                                  color={
                                    status.hhLimits.left.resumeView > 500 ? "success.main" : 
                                    status.hhLimits.left.resumeView > 100 ? "warning.main" : "error.main"
                                  }
                                >
                                  {status.hhLimits.left.resumeView}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block"><Trans>Осталось просмотров резюме</Trans></Typography>
                                <Typography variant="caption" color="text.secondary">
                                  из {status.hhLimits.limits.resumeView} на сегодня
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Box textAlign="center">
                                <Typography variant="h4" color="text.secondary">
                                  {status.hhLimits.spend.resumeView}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block"><Trans>Потрачено сегодня</Trans></Typography>
                              </Box>
                            </Grid>
                          </Grid>
                          <Typography variant="caption" color="text.secondary" mt={1} display="block"><Trans>⏰ Лимит менеджера HeadHunter.ru на все вакансии, обнуляется в 00:00</Trans></Typography>
                          
                          {status.resumeQueueCount !== undefined && status.resumeQueueCount > 0 && (
                            <Box 
                              sx={{ 
                                mt: 2, 
                                pt: 2, 
                                borderTop: '1px solid', 
                                borderColor: 'divider' 
                              }}
                            >
                              <Typography variant="body2" color="text.primary">
                                📋 В очереди на загрузку резюме: <strong>{status.resumeQueueCount}</strong> {status.resumeQueueCount === 1 ? _(msg`кандидат`) : status.resumeQueueCount < 5 ? _(msg`кандидата`) : _(msg`кандидатов`)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}><Trans>Кандидаты из HeadHunter.ru ожидают загрузки резюме из HH для AI скрининга</Trans></Typography>
                            </Box>
                          )}
                        </Alert>
                      </Box>
                    )}

                    <Divider sx={{ my: 2 }} />

                    {/* Кнопки управления */}
                    <Box display="flex" gap={2} flexWrap="wrap">
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={disconnectHh}
                        disabled={!status.hasValidToken}
                        startIcon={<IconX />}
                      >
                        <Trans>Отключить</Trans>
                      </Button>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Настройки автоматической синхронизации */}
          {status?.isConnected && (
            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<IconChevronDown />}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <IconSettings />
                    <Typography variant="h6"><Trans>Настройки синхронизации</Trans></Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={status.autoSync}
                          onChange={(e) => updateAutoSync(e.target.checked)}
                        />
                      }
                      label={_(msg`Автоматическая синхронизация`)}
                    />

                    <Typography variant="body2" color="text.secondary" mt={1}><Trans>При включении данные будут автоматически обновляться каждые 2 часа</Trans></Typography>

                    {status.autoSync && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          <IconShield size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                          Автоматическая синхронизация выполняется в фоновом режиме.
                          Следующая синхронизация запланирована на {
                            new Date(Date.now() + 2 * 60 * 60 * 1000).toLocaleString('ru-RU')
                          }
                        </Typography>
                      </Alert>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Grid>
          )}

          {/* Список вакансий из HH.ru */}
          {status?.isConnected && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <IconBriefcase size={24} />
                      <Typography variant="h5">
                        Вакансии из HH.ru ({vacancies.length})
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      onClick={syncVacancies}
                      disabled={syncing || !status.hasValidToken}
                      startIcon={syncing ? <CircularProgress size={20} /> : <IconRefresh />}
                      size="small"
                    >
                      {syncing ? _(msg`Обновление...`) : _(msg`Обновить список`)}
                    </Button>
                  </Box>

                  {vacancies.length === 0 ? (
                    <Alert severity="info">
                      <Typography variant="body2"><Trans>Нажмите "Обновить список" чтобы загрузить вакансии из HH.ru</Trans></Typography>
                    </Alert>
                  ) : (
                    <Alert severity="info" sx={{ mb: 3 }}>
                      <Typography variant="body2">
                        💡 <strong>Как это работает:</strong>
                      </Typography>
                      <Typography variant="body2" mt={1}><Trans>1. Вакансии автоматически синхронизируются с вашим профилем HH.ru</Trans></Typography>
                      <Typography variant="body2">
                        2. Нажмите <strong>"Настроить"</strong> на любой вакансии чтобы:
                      </Typography>
                      <Typography variant="body2" ml={2}><Trans>• Выбрать какие статусы кандидатов синхронизировать (отклики, приглашения, интервью и т.д.)</Trans></Typography>
                      <Typography variant="body2" ml={2}><Trans>• Загрузить кандидатов из выбранных статусов</Trans></Typography>
                      <Typography variant="body2" ml={2}><Trans>• Запустить AI-анализ резюме для автоматической оценки кандидатов</Trans></Typography>
                    </Alert>
                  )}

                  {vacancies.length > 0 && (
                    <Grid container spacing={2}>
                      {vacancies.map((vacancy) => (
                        <Grid item xs={12} key={vacancy.id}>
                          <Card variant="outlined">
                            <CardContent>
                              <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                                <Box flex={1}>
                                  <Typography variant="h6" gutterBottom>
                                    {vacancy.title}
                                  </Typography>
                                  <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
                                    <Chip
                                      label={vacancy.status === 'active' ? _(msg`Активна`) : _(msg`Архивная`)}
                                      color={vacancy.status === 'active' ? 'success' : 'default'}
                                      size="small"
                                    />
                                    {vacancy.salary_from && (
                                      <Chip
                                        label={`${vacancy.salary_from.toLocaleString()} - ${vacancy.salary_to?.toLocaleString() || '...'} ${vacancy.currency || 'RUR'}`}
                                        size="small"
                                        variant="outlined"
                                      />
                                    )}
                                    {vacancy.experience && (
                                      <Chip
                                        label={vacancy.experience}
                                        size="small"
                                        variant="outlined"
                                      />
                                    )}
                                  </Box>
                                  <Typography variant="body2" color="text.secondary">
                                    HH ID: {vacancy.hh_id}
                                  </Typography>
                                </Box>
                              </Box>

                              <Divider sx={{ my: 2 }} />

                              {/* Статус синхронизации кандидатов */}
                              <Box>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                  <Typography variant="body2" color="text.secondary"><Trans>Синхронизация кандидатов:</Trans></Typography>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    component={Link}
                                    href={`/hr/hh-vacancies/${vacancy.id}`}
                                    startIcon={<IconSettings />}
                                  >
                                    <Trans>Настроить</Trans>
                                  </Button>
                                </Box>
                                
                                {(!vacancy.candidates_sync_status || vacancy.candidates_sync_status === 'not_synced') && (
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <Chip
                                      label={_(msg`Не синхронизированы`)}
                                      size="small"
                                      variant="outlined"
                                    />
                                  </Box>
                                )}

                                {vacancy.candidates_sync_status === 'syncing' && (
                                  <Box>
                                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                                      <CircularProgress size={16} />
                                      <Typography variant="body2">
                                        Синхронизация... ({vacancy.candidates_synced}/{vacancy.candidates_total})
                                      </Typography>
                                    </Box>
                                    <Box sx={{ width: '100%' }}>
                                      <div style={{
                                        width: '100%',
                                        height: 4,
                                        backgroundColor: '#e0e0e0',
                                        borderRadius: 2,
                                        overflow: 'hidden'
                                      }}>
                                        <div style={{
                                          width: `${vacancy.candidates_total > 0 ? (vacancy.candidates_synced / vacancy.candidates_total) * 100 : 0}%`,
                                          height: '100%',
                                          backgroundColor: '#1976d2',
                                          transition: 'width 0.3s'
                                        }} />
                                      </div>
                                    </Box>
                                  </Box>
                                )}

                                {vacancy.candidates_sync_status === 'synced' && (
                                  <Box>
                                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                                      <IconCheck size={16} color="green" />
                                      <Typography variant="body2" color="success.main">
                                        Синхронизировано: {vacancy.candidates_synced} кандидатов
                                      </Typography>
                                    </Box>
                                    {vacancy.candidates_last_synced_at && (
                                      <Typography variant="caption" color="text.secondary">
                                        Последняя синхронизация: {new Date(vacancy.candidates_last_synced_at).toLocaleString('ru-RU')}
                                      </Typography>
                                    )}
                                  </Box>
                                )}

                                {vacancy.candidates_sync_status === 'error' && (
                                  <Alert severity="error" sx={{ mt: 1 }}>
                                    <Typography variant="body2">
                                      {vacancy.candidates_sync_error || _(msg`Произошла ошибка при синхронизации`)}
                                    </Typography>
                                  </Alert>
                                )}
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}
          </Grid>
        </Box>
      </Box>
    </PageContainer>
  );
}
