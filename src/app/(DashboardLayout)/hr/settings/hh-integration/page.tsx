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
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
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
  IconExternalLink,
  IconClock,
  IconSearch,
  IconArrowUp,
  IconArrowDown,
} from "@tabler/icons-react";
import PageContainer from "@/app/components/container/PageContainer";
import { apiFetch } from "@/utils/api";
import { useLingui } from '@lingui/react';
import { msg, Trans } from '@lingui/macro';
import { getErrorMessage } from '@/utils/errorTranslator';


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
  const { _, i18n } = useLingui();

  const searchParams = useSearchParams();
  const [status, setStatus] = useState<HhIntegrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null); // Для предупреждений (не ошибок)
  const [success, setSuccess] = useState<string | null>(null);
  
  // Новые состояния для выборочного импорта вакансий
  const [hhVacanciesFromApi, setHhVacanciesFromApi] = useState<any[]>([]); // Содержит поля: candidates_sync_status, candidates_total, candidates_synced
  const [loadingHhVacancies, setLoadingHhVacancies] = useState(false);
  const [hhVacanciesError, setHhVacanciesError] = useState<string | null>(null);
  const [selectedVacancyIds, setSelectedVacancyIds] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);

  // Состояния для настройки статусов синхронизации кандидатов
  const [availableStatuses, setAvailableStatuses] = useState<{id: string, name: string, total_count?: number}[]>([]); // Все уникальные статусы
  const [defaultStatuses, setDefaultStatuses] = useState<Set<string>>(new Set()); // Выбранные по умолчанию
  const [vacancyStatuses, setVacancyStatuses] = useState<Map<string, Set<string>>>(new Map()); // Индивидуальные для каждой вакансии
  const [expandedVacancies, setExpandedVacancies] = useState<Set<string>>(new Set());
  
  // Для polling после импорта
  const [importedVacancies, setImportedVacancies] = useState<number[]>([]);

  // Загружаем вакансии когда подключение активно
  useEffect(() => {
    if (status?.isConnected && status.hasValidToken) {
      if (hhVacanciesFromApi.length === 0 && !loadingHhVacancies && !hhVacanciesError) {
        loadHhVacanciesFromApi();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status?.isConnected, status?.hasValidToken]);

  // Фильтры и сортировка
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all"); // all, active, archived
  const [filterImported, setFilterImported] = useState<string>("all"); // all, imported, not_imported
  const [sortBy, setSortBy] = useState<string>("date_desc"); // date_desc, date_asc, name_asc, name_desc, responses_desc

  // Проверяем, вернулся ли пользователь после OAuth
  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      // Специальная обработка режима соискателя
      if (errorParam === 'applicant_mode') {
        setWarning(_(msg`Вы находитесь в режиме соискателя на HeadHunter. Для подключения интеграции переключитесь в режим работодателя/рекрутера на сайте hh.ru и повторите попытку.`));
      } else {
        // Обычная ошибка
        setError(_(msg`Ошибка авторизации: ${errorParam}`));
      }
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

      // Вакансии будут загружены при переходе на соответствующий шаг Stepper'а
    } catch (err: any) {
      setError(err.message || _(msg`Ошибка загрузки статуса интеграции`));
    } finally {
      setLoading(false);
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
        // Специальная обработка ошибки режима соискателя - это ПРЕДУПРЕЖДЕНИЕ, не ошибка
        if (data.error === 'applicant_mode') {
          setWarning(_(msg`Вы находитесь в режиме соискателя на HeadHunter. Для подключения интеграции переключитесь в режим работодателя/рекрутера на сайте hh.ru и повторите попытку.`));
          return;
        }
        
        // Backend: {success: false, error: 'hh.oauth_callback_failed'}
        const errorCode = data.error || 'common.internal_error';
        const errorMessage = i18n._(getErrorMessage(errorCode));
        throw new Error(errorMessage);
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

  const updateAutoSync = async (enabled: boolean) => {
    try {
      const response = await apiFetch(`${API_BASE}/api/hh-integration/auto-sync`, {
        method: 'POST',
        body: JSON.stringify({ enabled }),
      });
      await response.json(); // Парсим ответ

      setStatus(prev => prev ? { ...prev, autoSync: enabled } : null);
      setSuccess(enabled ? _(msg`Автоматическая синхронизация включена`) : _(msg`Автоматическая синхронизация отключена`));
    } catch (err: any) {
      setError(err.message || _(msg`Ошибка обновления настроек`));
    }
  };

  // === НОВЫЕ ФУНКЦИИ ДЛЯ ВЫБОРОЧНОГО ИМПОРТА ВАКАНСИЙ ===
  
  const loadHhVacanciesFromApi = async () => {
    try {
      setLoadingHhVacancies(true);
      setHhVacanciesError(null);
      const response = await apiFetch(`${API_BASE}/api/hh/vacancies/list`);
      if (response.ok) {
      const data = await response.json();
        const vacancies = data.vacancies || [];
        setHhVacanciesFromApi(vacancies);
        
        // Авто-выбираем все вакансии для импорта
        setSelectedVacancyIds(new Set(vacancies.map((v: any) => v.id)));
        
        // Устанавливаем доступные статусы
        if (data.available_statuses && data.available_statuses.length > 0) {
          setAvailableStatuses(data.available_statuses);
          
          // Автоматически выбираем типичные статусы по умолчанию
          const defaultSelected = new Set<string>();
          data.available_statuses.forEach((status: any) => {
            // Выбираем "Отклики", "Приглашения" и "Интервью" по умолчанию
            if (['response', 'invitation', 'interview'].includes(status.id)) {
              defaultSelected.add(status.id);
            }
          });
          setDefaultStatuses(defaultSelected);
        }
      } else {
        const error = await response.json();
        
        // Специальная обработка NO_EMPLOYER_ID
        if (error.code === 'NO_EMPLOYER_ID') {
          setHhVacanciesError(
            error.error + ' ' + (error.help || '')
          );
        } else {
          setHhVacanciesError(error.message || _(msg`Ошибка загрузки списка вакансий с HH`));
        }
      }
    } catch (e: any) {
      setHhVacanciesError(e.message || _(msg`Неизвестная ошибка`));
    } finally {
      setLoadingHhVacancies(false);
    }
  };

  const handleImportSelected = async () => {
    if (selectedVacancyIds.size === 0) {
      setError(_(msg`Выберите хотя бы одну вакансию`));
      return;
    }

    try {
      setImporting(true);
      setError(null);
      setSuccess(null);

      // Подготовить статусы для каждой вакансии
      const selectedStatusesArray = Array.from(defaultStatuses);
      
      // Собрать индивидуальные настройки
      const vacancyStatusesObj: {[key: string]: string[]} = {};
      vacancyStatuses.forEach((statuses, vacancyId) => {
        vacancyStatusesObj[vacancyId] = Array.from(statuses);
      });

      const response = await apiFetch(`${API_BASE}/api/hh/vacancies/import-selected`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vacancy_ids: Array.from(selectedVacancyIds),
          default_statuses: selectedStatusesArray,
          vacancy_statuses: vacancyStatusesObj,
        }),
      });

      if (response.ok) {
      const data = await response.json();

        // Считаем количество новых импортов и пересинхронизаций
        const newImports = data.details.filter((d: any) => d.status === 'success' && !d.is_resync).length;
        const reSyncs = data.details.filter((d: any) => d.status === 'success' && d.is_resync).length;
        
        let successMessage = '';
        if (newImports > 0 && reSyncs > 0) {
          successMessage = _(msg`Импортировано новых: ${newImports}, пересинхронизировано: ${reSyncs}. Загрузка кандидатов начата...`);
        } else if (newImports > 0) {
          successMessage = _(msg`Успешно импортировано: ${newImports} вакансий. Загрузка кандидатов начата...`);
        } else if (reSyncs > 0) {
          successMessage = _(msg`Пересинхронизировано: ${reSyncs} вакансий. Загрузка кандидатов начата...`);
        }
        
        if (data.failed > 0) {
          successMessage += _(msg` Ошибок: ${data.failed}`);
        }
        
        setSuccess(successMessage);
        
        // Собираем ID импортированных HhVacancy для polling
        const importedHhVacancyIds = data.details
          .filter((d: any) => d.status === 'success' && d.hh_vacancy_id)
          .map((d: any) => d.hh_vacancy_id);
        
        // Обновляем hhVacanciesFromApi, добавляя hh_vacancy_id и local_vacancy_id
        setHhVacanciesFromApi((prev) =>
          prev.map((v) => {
            const importedDetail = data.details.find((d: any) => d.hh_id === v.id);
            if (importedDetail && importedDetail.status === 'success') {
              return {
                ...v,
                hh_vacancy_id: importedDetail.hh_vacancy_id,
                local_vacancy_id: importedDetail.local_id,
                imported: true,
                candidates_sync_status: 'syncing', // Начинаем синхронизацию
                candidates_total: 0,
                candidates_synced: 0,
              };
            }
            return v;
          })
        );
        
        setImportedVacancies(importedHhVacancyIds);
        
        setSelectedVacancyIds(new Set());
        // Список уже обновлен выше через setHhVacanciesFromApi
      } else {
        const error = await response.json();
        setError(error.message || _(msg`Ошибка импорта вакансий`));
      }
    } catch (e: any) {
      setError(e.message || _(msg`Неизвестная ошибка`));
    } finally {
      setImporting(false);
    }
  };

  const handleToggleVacancySelection = (id: string) => {
    const newSelected = new Set(selectedVacancyIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedVacancyIds(newSelected);
  };

  const handleSelectAllVacancies = () => {
    const availableVacancies = hhVacanciesFromApi; // Теперь включаем ВСЕ вакансии
    if (selectedVacancyIds.size === availableVacancies.length) {
      setSelectedVacancyIds(new Set());
    } else {
      setSelectedVacancyIds(new Set(availableVacancies.map((v) => v.id)));
    }
  };

  // Polling для импортированных вакансий
  useEffect(() => {
    if (importedVacancies.length === 0) return;

    const pollInterval = setInterval(async () => {
      try {
        // Проверяем статус для каждой импортированной вакансии
        for (const vacancyId of importedVacancies) {
          const response = await apiFetch(
            `${API_BASE}/api/hh-integration/vacancy/${vacancyId}/sync-status`
          );
      const data = await response.json();

      if (data.success) {
            const syncData = data.data;
            
            // Обновляем вакансию в списке для импорта
            setHhVacanciesFromApi((prev) =>
              prev.map((v) => {
                // Найти вакансию по hh_vacancy_id
                if (v.hh_vacancy_id === vacancyId || v.local_vacancy_id === syncData.vacancy_id) {
                  return {
                ...v,
                    candidates_sync_status: syncData.status,
                    candidates_total: syncData.total,
                    candidates_synced: syncData.synced,
                    candidates_sync_error: syncData.error,
                  };
                }
                return v;
              })
            );

            // Если синхронизация завершена (успех или ошибка), убираем из polling
            if (syncData.status !== 'syncing') {
              setImportedVacancies((prev) => prev.filter((id) => id !== vacancyId));
              
              // Показываем уведомление о завершении
              if (syncData.status === 'synced') {
                console.log(`✅ Синхронизация завершена: ${syncData.synced}/${syncData.total} кандидатов`);
              } else if (syncData.status === 'error') {
                console.error(`❌ Ошибка синхронизации: ${syncData.error}`);
              }
            }
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 3000); // Проверяем каждые 3 секунды

    return () => clearInterval(pollInterval);
  }, [importedVacancies]);

  // Helper функции для работы со статусами
  const getStatusesForVacancy = (vacancyId: string): Set<string> => {
    if (vacancyStatuses.has(vacancyId)) {
      return vacancyStatuses.get(vacancyId)!;
    }
    // Дефолтные статусы
    return new Set(defaultStatuses);
  };

  const setStatusesForVacancy = (vacancyId: string, statuses: Set<string>) => {
    const newMap = new Map(vacancyStatuses);
    newMap.set(vacancyId, statuses);
    setVacancyStatuses(newMap);
  };

  const toggleVacancyExpanded = (vacancyId: string) => {
    const newSet = new Set(expandedVacancies);
    if (newSet.has(vacancyId)) {
      newSet.delete(vacancyId);
        } else {
      newSet.add(vacancyId);
    }
    setExpandedVacancies(newSet);
  };

  const toggleStatusForVacancy = (vacancyId: string, statusId: string) => {
    const currentStatuses = getStatusesForVacancy(vacancyId);
    const newStatuses = new Set(currentStatuses);
    if (newStatuses.has(statusId)) {
      newStatuses.delete(statusId);
    } else {
      newStatuses.add(statusId);
    }
    setStatusesForVacancy(vacancyId, newStatuses);
  };

  // Проверяем, есть ли среди выбранных импортированные вакансии
  const hasImportedInSelection = () => {
    return Array.from(selectedVacancyIds).some(
      (id) => hhVacanciesFromApi.find((v) => v.id === id)?.imported
    );
  };

  // Фильтрация и сортировка вакансий
  const getFilteredAndSortedVacancies = () => {
    let filtered = [...hhVacanciesFromApi];

    // Поиск по названию
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((v) =>
        v.name.toLowerCase().includes(query)
      );
    }

    // Фильтр по статусу HH (active/archived)
    if (filterStatus !== "all") {
      filtered = filtered.filter((v) => v.status === filterStatus);
    }

    // Фильтр по импортированным/не импортированным
    if (filterImported === "imported") {
      filtered = filtered.filter((v) => v.imported);
    } else if (filterImported === "not_imported") {
      filtered = filtered.filter((v) => !v.imported);
    }

    // Сортировка
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date_desc":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "date_asc":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        case "responses_desc":
          return (b.responses || 0) - (a.responses || 0);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredVacancies = getFilteredAndSortedVacancies();

  // === КОНЕЦ НОВЫХ ФУНКЦИЙ ===


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

        {warning && (
          <Alert severity="warning" sx={{ mb: 3 }} onClose={() => setWarning(null)}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              ⚠️ <Trans>Вы в режиме соискателя</Trans>
            </Typography>
            <Typography variant="body2" mb={2}>
              {warning}
            </Typography>
            <Typography variant="body2" fontWeight={600} mb={1}>
              <Trans>Как переключиться в режим работодателя:</Trans>
            </Typography>
            <ol style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li><Trans>Откройте сайт</Trans> <strong>hh.ru</strong></li>
              <li><Trans>В правом верхнем углу найдите переключатель режимов</Trans></li>
              <li><Trans>Выберите</Trans> <strong>"<Trans>Работодатель</Trans>"</strong> <Trans>или</Trans> <strong>"<Trans>Рекрутер</Trans>"</strong></li>
              <li><Trans>Вернитесь сюда и нажмите</Trans> <strong>"<Trans>Подключить HH.ru</Trans>"</strong> <Trans>снова</Trans></li>
            </ol>
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

                    {/* Важное предупреждение о режиме работодателя - показываем только если НЕТ warning вверху */}
                    {!warning && (
                      <Alert severity="info" sx={{ mb: 3 }}>
                        <Typography variant="body2" fontWeight="bold" gutterBottom>
                          💡 <Trans>Важно: Убедитесь, что вы в режиме работодателя</Trans>
                        </Typography>
                        <Typography variant="body2" mb={1}>
                          <Trans>На HeadHunter один аккаунт может иметь два режима: соискатель и работодатель.</Trans>
                        </Typography>
                        <Typography variant="body2">
                          <Trans>Перед подключением убедитесь, что на сайте hh.ru вы находитесь в режиме <strong>работодателя/рекрутера</strong>, а не соискателя.</Trans>
                        </Typography>
                      </Alert>
                    )}

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
                          mb: 2,
                          position: 'relative',
                          zIndex: 11,
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
                      </Alert>
                    )}

                    {/* Компактная сводка */}
                    <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                      <Typography variant="body2" color="text.secondary">
                        {status.companyName || _(msg`Не указано`)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">·</Typography>
                      {status.stats && (
                        <>
                          <Typography variant="body2">
                            <strong>{status.stats.totalVacancies}</strong> <Trans>вакансий</Trans>
                          </Typography>
                          <Typography variant="body2" color="text.secondary">·</Typography>
                          <Typography variant="body2">
                            <strong>{status.stats.totalCandidates}</strong> <Trans>кандидатов</Trans>
                          </Typography>
                          {status.stats.newCandidatesToday > 0 && (
                            <>
                              <Typography variant="body2" color="text.secondary">·</Typography>
                              <Chip label={`+${status.stats.newCandidatesToday} сегодня`} color="success" size="small" />
                            </>
                          )}
                          <Typography variant="body2" color="text.secondary">·</Typography>
                        </>
                      )}
                      <FormControlLabel
                        control={
                          <Switch
                            checked={status.autoSync}
                            onChange={(e) => updateAutoSync(e.target.checked)}
                            size="small"
                          />
                        }
                        label={<Typography variant="body2"><Trans>Автосинхронизация</Trans></Typography>}
                        sx={{ m: 0 }}
                      />
                      {status.hhLimits && (
                        <>
                          <Typography variant="body2" color="text.secondary">·</Typography>
                          <Typography
                            variant="body2"
                            color={
                              status.hhLimits.left.resumeView > 500 ? "success.main" :
                              status.hhLimits.left.resumeView > 100 ? "warning.main" : "error.main"
                            }
                          >
                            <Trans>Лимит резюме: {status.hhLimits.left.resumeView}/{status.hhLimits.limits.resumeView}</Trans>
                          </Typography>
                        </>
                      )}
                      {status.resumeQueueCount !== undefined && status.resumeQueueCount > 0 && (
                        <>
                          <Typography variant="body2" color="text.secondary">·</Typography>
                          <Typography variant="body2">
                            📋 <Trans>В очереди: {status.resumeQueueCount}</Trans>
                          </Typography>
                        </>
                      )}
                      <Box sx={{ flex: '1 1 auto' }} />
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={disconnectHh}
                        disabled={!status.hasValidToken}
                        startIcon={<IconX size={16} />}
                        size="small"
                      >
                        <Trans>Отключить</Trans>
                      </Button>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* === НАСТРОЙКА ИМПОРТА ВАКАНСИЙ === */}
          {status?.isConnected && status.hasValidToken && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  {/* Статусы по умолчанию — компактные чипы */}
                  {!loadingHhVacancies && availableStatuses.length > 0 && (
                    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" mb={2}>
                      <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
                        <Trans>Загружать статусы:</Trans>
                      </Typography>
                      {availableStatuses.map((st) => (
                        <Chip
                          key={st.id}
                          label={`${st.name} (${st.total_count || 0})`}
                          variant={defaultStatuses.has(st.id) ? "filled" : "outlined"}
                          color={defaultStatuses.has(st.id) ? "primary" : "default"}
                          size="small"
                          onClick={() => {
                            const newSet = new Set(defaultStatuses);
                            if (newSet.has(st.id)) {
                              newSet.delete(st.id);
                            } else {
                              newSet.add(st.id);
                            }
                            setDefaultStatuses(newSet);
                          }}
                          sx={{ cursor: 'pointer' }}
                        />
                      ))}
                    </Box>
                  )}

                  {/* Загрузка вакансий */}
                  {loadingHhVacancies && (
                    <Box display="flex" flexDirection="column" alignItems="center" py={4}>
                      <CircularProgress sx={{ mb: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        <Trans>Загрузка вакансий из HH.ru...</Trans>
                      </Typography>
                    </Box>
                  )}

                  {!loadingHhVacancies && hhVacanciesError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {hhVacanciesError}
                    </Alert>
                  )}

                  {!loadingHhVacancies && hhVacanciesFromApi.length === 0 && !hhVacanciesError && (
                    <Alert severity="info">
                      <Trans>Вакансии не найдены. Создайте вакансии в HH.ru или обновите список.</Trans>
                    </Alert>
                  )}

                  {!loadingHhVacancies && hhVacanciesFromApi.length > 0 && (
                    <Box>
                      {/* === ФИЛЬТРЫ И СОРТИРОВКА === */}
                      <Card sx={{ mb: 2, p: 2 }}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              size="small"
                              placeholder={_(msg`Поиск по названию...`)}
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <IconSearch size={18} />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>

                          <Grid item xs={12} sm={6} md={2}>
                            <FormControl fullWidth size="small">
                              <InputLabel><Trans>Статус на HH</Trans></InputLabel>
                              <Select
                                value={filterStatus}
                                label={_(msg`Статус на HH`)}
                                onChange={(e) => setFilterStatus(e.target.value)}
                              >
                                <MenuItem value="all"><Trans>Все</Trans></MenuItem>
                                <MenuItem value="active"><Trans>Активные</Trans></MenuItem>
                                <MenuItem value="archived"><Trans>Архивные</Trans></MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>

                          <Grid item xs={12} sm={6} md={2}>
                            <FormControl fullWidth size="small">
                              <InputLabel><Trans>Импорт</Trans></InputLabel>
                              <Select
                                value={filterImported}
                                label={_(msg`Импорт`)}
                                onChange={(e) => setFilterImported(e.target.value)}
                              >
                                <MenuItem value="all"><Trans>Все</Trans></MenuItem>
                                <MenuItem value="imported"><Trans>Импортированы</Trans></MenuItem>
                                <MenuItem value="not_imported"><Trans>Не импортированы</Trans></MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>

                          <Grid item xs={12} sm={12} md={4}>
                            <FormControl fullWidth size="small">
                              <InputLabel><Trans>Сортировка</Trans></InputLabel>
                              <Select
                                value={sortBy}
                                label={_(msg`Сортировка`)}
                                onChange={(e) => setSortBy(e.target.value)}
                              >
                                <MenuItem value="date_desc">
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <IconArrowDown size={16} />
                                    <Trans>Дата создания (новые)</Trans>
                                  </Box>
                                </MenuItem>
                                <MenuItem value="date_asc">
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <IconArrowUp size={16} />
                                    <Trans>Дата создания (старые)</Trans>
                                  </Box>
                                </MenuItem>
                                <MenuItem value="name_asc">
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <IconArrowUp size={16} />
                                    <Trans>Название (А-Я)</Trans>
                                  </Box>
                                </MenuItem>
                                <MenuItem value="name_desc">
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <IconArrowDown size={16} />
                                    <Trans>Название (Я-А)</Trans>
                                  </Box>
                                </MenuItem>
                                <MenuItem value="responses_desc">
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <IconArrowDown size={16} />
                                    <Trans>По откликам (больше)</Trans>
                                  </Box>
                                </MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>

                          <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary">
                              <Trans>Найдено вакансий: {filteredVacancies.length} из {hhVacanciesFromApi.length}</Trans>
                            </Typography>
                          </Grid>
                        </Grid>
                      </Card>

                      {/* Подсказка когда ничего не выбрано */}
                      {selectedVacancyIds.size === 0 && (
                        <Alert severity="info" sx={{ mb: 2 }} icon={false}>
                          <Typography variant="body2">
                            👆 <Trans>Нажмите на вакансию, чтобы выбрать её для импорта. Можно выбрать сразу несколько.</Trans>
                          </Typography>
                        </Alert>
                      )}

                      {/* === ВЕРХНИЕ КНОПКИ === */}
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={
                                selectedVacancyIds.size > 0 &&
                                selectedVacancyIds.size === hhVacanciesFromApi.length
                              }
                              indeterminate={
                                selectedVacancyIds.size > 0 &&
                                selectedVacancyIds.size < hhVacanciesFromApi.length
                              }
                              onChange={handleSelectAllVacancies}
                            />
                          }
                          label={_(msg`Выбрать все`)}
                        />
                        <Box display="flex" gap={1} alignItems="center">
                          <Button
                            variant="outlined"
                            onClick={loadHhVacanciesFromApi}
                            startIcon={<IconRefresh />}
                            size="small"
                          >
                            <Trans>Обновить</Trans>
                          </Button>
                          <Button
                            variant="contained"
                            color="primary"
                            disabled={selectedVacancyIds.size === 0 || importing}
                            startIcon={importing ? <CircularProgress size={20} /> : <IconDownload />}
                            onClick={handleImportSelected}
                          >
                            {importing
                              ? _(msg`Импортируем...`)
                              : hasImportedInSelection()
                                ? _(msg`Пересинхронизировать выбранные (${selectedVacancyIds.size})`)
                                : selectedVacancyIds.size === 0
                                  ? _(msg`Выберите вакансии ↑`)
                                  : _(msg`Импортировать выбранные (${selectedVacancyIds.size})`)
                            }
                          </Button>
                        </Box>
                      </Box>

                      <Grid container spacing={2}>
                        {filteredVacancies.map((vacancy) => {
                          const isImported = vacancy.imported;
                          const isSelected = selectedVacancyIds.has(vacancy.id);

                          return (
                            <Grid item xs={12} key={vacancy.id}>
                              <Card
                                variant="outlined"
                                sx={{
                                  bgcolor: isSelected ? "primary.50" : "inherit",
                                  cursor: "pointer",
                                  border: isSelected ? 2 : 1,
                                  borderColor: isSelected ? "primary.main" : "divider",
                                  transition: 'all 0.15s ease',
                                  '&:hover': {
                                    borderColor: isSelected ? "primary.main" : "primary.light",
                                    boxShadow: isSelected ? 2 : 1,
                                    bgcolor: isSelected ? "primary.50" : "action.hover",
                                  },
                                }}
                                onClick={() => handleToggleVacancySelection(vacancy.id)}
                              >
                                <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                                  <Box display="flex" alignItems="start" gap={1.5}>
                                    <Checkbox
                                      checked={isSelected}
                                      onChange={() => handleToggleVacancySelection(vacancy.id)}
                                      onClick={(e) => e.stopPropagation()}
                                      size="small"
                                      sx={{ mt: -0.5 }}
                                    />
                                    <Box flex={1}>
                                      <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                        <Box
                                          sx={{
                                            width: 6,
                                            height: 6,
                                            borderRadius: "50%",
                                            bgcolor: vacancy.status === "active" ? "success.main" : "grey.400",
                                            flexShrink: 0,
                                          }}
                                        />
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            color: vacancy.status === "active" ? "success.main" : "grey.600",
                                            fontWeight: 600,
                                            textTransform: "uppercase",
                                            fontSize: "0.65rem",
                                          }}
                                        >
                                          {vacancy.status === "active" ? "HH" : "HH архив"}
                                        </Typography>
                                        <Typography variant="body2" component="span" fontWeight={600} sx={{ ml: 0.5 }}>
                                          {vacancy.name}
                                        </Typography>
                                        
                                        {isImported && (
                                          <Chip
                                            label={_(msg`✅ Импортирована`)}
                                            color="success"
                                            size="small"
                                            sx={{ height: 20, fontSize: '0.7rem' }}
                                          />
                                        )}
                                      </Box>

                                      <Box display="flex" gap={1.5} alignItems="center" flexWrap="wrap" mb={0.5}>
                                        <Typography variant="caption" color="text.secondary">
                                          📍 {vacancy.area}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          💼 {vacancy.responses} откл.
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          📅 {new Date(vacancy.created_at).toLocaleDateString("ru-RU")}
                                        </Typography>
                                        {vacancy.salary_from && (
                                          <Typography variant="caption" color="text.secondary">
                                            💰 {vacancy.salary_from.toLocaleString()} - {vacancy.salary_to?.toLocaleString() || '...'} {vacancy.currency || 'RUR'}
                                          </Typography>
                                        )}
                                        <Typography variant="caption" color="text.secondary">
                                          HH: {vacancy.id}
                                        </Typography>
                                      </Box>

                                      {vacancy.candidates_sync_status === 'syncing' && (
                                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                          <CircularProgress size={12} />
                                          <Typography variant="caption" color="primary">
                                            <Trans>Синхронизация: {vacancy.candidates_synced || 0}/{vacancy.candidates_total || 0}</Trans>
                                          </Typography>
                                        </Box>
                                      )}

                                      {vacancy.candidates_sync_status === 'synced' && vacancy.candidates_synced > 0 && (
                                        <Typography variant="caption" color="success.main">
                                          ✅ <Trans>Загружено {vacancy.candidates_synced} кандидатов</Trans>
                                        </Typography>
                                      )}

                                      {vacancy.candidates_sync_status === 'error' && (
                                        <Typography variant="caption" color="error.main">
                                          ❌ <Trans>Ошибка синхронизации</Trans>
                                        </Typography>
                                      )}

                                      <Box display="flex" gap={0.5} flexWrap="wrap" mt={1}>
                                        {isImported && vacancy.local_vacancy_id && (
                                          <Button
                                            size="small"
                                            variant="outlined"
                                            component={Link}
                                            href={`/hr/vacancies/${vacancy.local_vacancy_id}`}
                                            onClick={(e) => e.stopPropagation()}
                                            sx={{ minWidth: 'auto', px: 1 }}
                                          >
                                            <Trans>Открыть</Trans>
                                          </Button>
                                        )}
                                        
                                        <Button
                                          size="small"
                                          variant="text"
                                          startIcon={<IconSettings size={14} />}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleVacancyExpanded(vacancy.id);
                                          }}
                                          sx={{ minWidth: 'auto', px: 1 }}
                                        >
                                          <Trans>
                                            {expandedVacancies.has(vacancy.id) ? "Скрыть" : "Статусы"}
                                          </Trans>
                                        </Button>
                                      </Box>

                                      {expandedVacancies.has(vacancy.id) && (
                                        <Box 
                                          mt={2} 
                                          p={2} 
                                          bgcolor="grey.50" 
                                          borderRadius={1}
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <Typography variant="body2" fontWeight="bold" mb={1}>
                                            <Trans>Статусы для этой вакансии:</Trans>
                                          </Typography>
                                          <Box display="flex" gap={1} flexWrap="wrap">
                                            {(vacancy.available_statuses || []).map((st: any) => {
                                              const currentStatuses = getStatusesForVacancy(vacancy.id);
                                              const isChecked = currentStatuses.has(st.id);

                                              return (
                                                <Box
                                                  key={st.id}
                                                  sx={{
                                                    border: 1,
                                                    borderColor: 'divider',
                                                    borderRadius: 1,
                                                    p: 1,
                                                    minWidth: 120,
                                                    bgcolor: isChecked ? 'primary.50' : 'background.paper'
                                                  }}
                                                  onClick={(e) => e.stopPropagation()}
                                                >
                                                  <FormControlLabel
                                                    control={
                                                      <Switch
                                                        checked={isChecked}
                                                        onChange={(e) => {
                                                          e.stopPropagation();
                                                          toggleStatusForVacancy(vacancy.id, st.id);
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                        size="small"
                                                      />
                                                    }
                                                    label={
                                                      <Box>
                                                        <Typography variant="body2" fontWeight={600}>
                                                          {st.name}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                          {st.count || 0}
                                                        </Typography>
                                                      </Box>
                                                    }
                                                    sx={{ m: 0 }}
                                                  />
                                                </Box>
                                              );
                                            })}
                                          </Box>
                                        </Box>
                                      )}
                                    </Box>
                                  </Box>
                                </CardContent>
                              </Card>
                            </Grid>
                          );
                        })}
                      </Grid>

                      {/* === НИЖНИЕ КНОПКИ === */}
                      <Box mt={3} display="flex" justifyContent="space-between" alignItems="center">
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={
                                selectedVacancyIds.size > 0 &&
                                selectedVacancyIds.size === hhVacanciesFromApi.length
                              }
                              indeterminate={
                                selectedVacancyIds.size > 0 &&
                                selectedVacancyIds.size < hhVacanciesFromApi.length
                              }
                              onChange={handleSelectAllVacancies}
                            />
                          }
                          label={_(msg`Выбрать все`)}
                        />
                        <Box display="flex" gap={1} alignItems="center">
                          <Button
                            variant="outlined"
                            onClick={loadHhVacanciesFromApi}
                            startIcon={<IconRefresh />}
                            size="small"
                          >
                            <Trans>Обновить список</Trans>
                          </Button>
                          <Button
                            variant="contained"
                            color="primary"
                            disabled={selectedVacancyIds.size === 0 || importing}
                            startIcon={importing ? <CircularProgress size={20} /> : <IconDownload />}
                            onClick={handleImportSelected}
                          >
                            {importing
                              ? _(msg`Импортируем...`)
                              : hasImportedInSelection()
                                ? _(msg`Пересинхронизировать выбранные (${selectedVacancyIds.size})`)
                                : selectedVacancyIds.size === 0
                                  ? _(msg`Выберите вакансии ↑`)
                                  : _(msg`Импортировать выбранные (${selectedVacancyIds.size})`)
                            }
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}
          {/* === КОНЕЦ НАСТРОЙКИ ИМПОРТА === */}

          </Grid>
      </Box> {/* Закрывает Box sx={{ position: 'relative' }} */}
      </Box> {/* Закрывает основной Box на строке 495 */}
    </PageContainer>
  );
}
