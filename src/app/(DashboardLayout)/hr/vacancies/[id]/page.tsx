"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box, Card, CardContent, Typography, Button, Chip, Divider, CircularProgress, Grid, Alert, Fab, Tooltip, ToggleButtonGroup, ToggleButton, Switch, FormControlLabel, LinearProgress
} from "@mui/material";
import {
  IconBriefcase, IconFileText, IconUsers, IconEdit, IconArrowsDiff, IconTrash, IconRestore, IconArchive
} from "@tabler/icons-react";
import DataTable from "@/components/DataTable";
import PageContainer from "@/app/components/container/PageContainer";
import { apiFetch } from "@/utils/api";
import QRCode from 'react-qr-code';
import { formatDateToLocal, formatDateOnly, formatTimeOnly } from "@/utils/dateUtils";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import QrCodeIcon from '@mui/icons-material/QrCode2';
import AddIcon from '@mui/icons-material/Add';
import CommentIcon from '@mui/icons-material/Comment';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import FilterListIcon from '@mui/icons-material/FilterList';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Link from "next/link";
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Snackbar from '@mui/material/Snackbar';
import Checkbox from '@mui/material/Checkbox';
import DeleteIcon from '@mui/icons-material/Delete';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import KanbanView from './KanbanView';
import CandidatesList from './CandidatesList';
import CandidateFilters from './CandidateFilters';
import BulkActionsPanel from './BulkActionsPanel';
import { useLingui } from '@lingui/react';
import { msg, Trans } from '@lingui/macro';
import InternationalPhoneInput from '@/components/InternationalPhoneInput';
import { isValidInternationalPhone, normalizePhoneForBackend } from '@/utils/phoneUtils';


const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

function getStatusLabel(status: string, _: any) {
  switch (status) {
    case "completed":
      return _(msg`Завершено`);
    case "finished":
      return _(msg`Завершено`);
    case "in_progress":
      return _(msg`В процессе`);
    case "pending":
      return _(msg`Ожидает`);
    case "ready":
      return _(msg`Готов к интервью`);
    case "failed":
      return _(msg`Ошибка`);
    case "canceled":
      return _(msg`Отменено`);
    case "new":
      return _(msg`Новый`);
    case "rejected":
      return _(msg`Отклонён`);
    default:
      return status;
  }
}

function CandidateActions({ link, onCopy, onShowQR }: { link: string, onCopy: () => void, onShowQR: () => void }) {
  const { _ } = useLingui();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  return (
    <Box display="flex" gap={1}>
      <Tooltip title={_(msg`Действия`)}>
        <IconButton size="small" onClick={handleClick}><FilterListIcon fontSize="small" /></IconButton>
      </Tooltip>
      <Popover open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={handleClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <List>
          <ListItem button onClick={() => { onCopy(); handleClose(); }}>
            <ListItemIcon><ContentCopyIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary={_(msg`Скопировать ссылку`)} />
          </ListItem>
          <ListItem button onClick={() => { onShowQR(); handleClose(); }}>
            <ListItemIcon><QrCodeIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary={_(msg`Показать QR-код`)} />
          </ListItem>
        </List>
      </Popover>
    </Box>
  );
}

export default function HRVacancyDetailPage() {
  const { _ } = useLingui();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [totalCandidates, setTotalCandidates] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [qrDialog, setQrDialog] = useState({ open: false, url: '' });
  const [compareOpen, setCompareOpen] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState<number[]>([]);
  const [snackbar, setSnackbar] = useState('');
  const [tab, setTab] = useState('1');
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Для обновления списка
  const [templateActive, setTemplateActive] = useState<boolean>(true);
  const [toggleLoading, setToggleLoading] = useState(false);

  // Состояния для канбана (сохраняем в localStorage)
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>(() => {
    // Читаем из localStorage при первой загрузке
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kanban_view_mode');
      return (saved === 'kanban' || saved === 'list') ? saved : 'list';
    }
    return 'list';
  });
  // Общие фильтры для обоих режимов
  const [filters, setFilters] = useState<any>({});
  
  // Данные для floating панели от CandidatesList
  const [floatingPanelData, setFloatingPanelData] = useState<any>(null);

  // Обработчик переключения режима просмотра
  const handleViewModeChange = (event: React.MouseEvent<HTMLElement>, newMode: 'list' | 'kanban' | null) => {
    if (newMode !== null) {
      setViewMode(newMode);
      localStorage.setItem('kanban_view_mode', newMode);

      // Если переключаемся на канбан, убираем фильтр по статусу
      if (newMode === 'kanban' && filters.status) {
        const { status, ...restFilters } = filters;
        setFilters(restFilters);
      }
    }
  };


  // Функция для генерации публичной ссылки
  const generatePublicLink = async () => {
    try {
      const response = await apiFetch(`${API_BASE}/api/admin/vacancies/${id}/public-token`, {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        // Формируем полный URL на фронтенде
        const fullUrl = `${window.location.origin}/interview/apply/${data.publicToken}`;
        setPublicUrl(fullUrl);
        setSnackbar(_(msg`Публичная ссылка создана!`));
      } else {
        setSnackbar(_(msg`Ошибка при создании ссылки`));
      }
    } catch (error) {
      setSnackbar(_(msg`Ошибка при создании ссылки`));
    }
  };

  // Функция для переключения статуса активности шаблона
  const toggleTemplateActive = async () => {
    if (!data?.template?.id) return;
    
    setToggleLoading(true);
    try {
      const response = await apiFetch(`${API_BASE}/api/admin/templates/${data.template.id}/toggle-active`, {
        method: 'PATCH'
      });

      if (response.ok) {
        const result = await response.json();
        setTemplateActive(result.isActive);
        setSnackbar(result.isActive ? _(msg`Интервью включено`) : _(msg`Интервью выключено`));
      } else {
        setSnackbar(_(msg`Ошибка при изменении статуса`));
      }
    } catch (error) {
      setSnackbar(_(msg`Ошибка при изменении статуса`));
    } finally {
      setToggleLoading(false);
    }
  };

  // Функции управления статусом вакансии
  const handleDeleteVacancy = async () => {
    if (!confirm(_(msg`Вы уверены, что хотите удалить эту вакансию? Она будет перемещена в "Удалённые".`))) {
      return;
    }

    try {
      const response = await apiFetch(`${API_BASE}/api/admin/vacancies/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSnackbar(_(msg`Вакансия перемещена в удалённые`));
        // Обновляем данные
        setTimeout(() => {
          router.push('/hr/vacancies');
        }, 1500);
      } else {
        setSnackbar(_(msg`Ошибка при удалении`));
      }
    } catch (error) {
      setSnackbar(_(msg`Ошибка при удалении`));
    }
  };

  const handleRestoreVacancy = async () => {
    if (!confirm(_(msg`Восстановить вакансию?`))) {
      return;
    }

    try {
      const response = await apiFetch(`${API_BASE}/api/admin/vacancies/${id}/restore`, {
        method: 'PATCH',
      });

      if (response.ok) {
        setSnackbar(_(msg`Вакансия восстановлена`));
        // Перезагружаем данные
        const updatedData = await apiFetch(`${API_BASE}/api/admin/vacancies/${id}/full`);
        const newData = await updatedData.json();
        setData(newData);
      } else {
        setSnackbar(_(msg`Ошибка при восстановлении`));
      }
    } catch (error) {
      setSnackbar(_(msg`Ошибка при восстановлении`));
    }
  };

  const handleArchiveVacancy = async () => {
    if (!confirm(_(msg`Переместить вакансию в архив?`))) {
      return;
    }

    try {
      const response = await apiFetch(`${API_BASE}/api/admin/vacancies/${id}/archive`, {
        method: 'PATCH',
      });

      if (response.ok) {
        setSnackbar(_(msg`Вакансия перемещена в архив`));
        // Перезагружаем данные
        const updatedData = await apiFetch(`${API_BASE}/api/admin/vacancies/${id}/full`);
        const newData = await updatedData.json();
        setData(newData);
      } else {
        setSnackbar(_(msg`Ошибка при архивации`));
      }
    } catch (error) {
      setSnackbar(_(msg`Ошибка при архивации`));
    }
  };

  // Состояние для прогресса массовой отправки приглашений
  const [sendingInProgress, setSendingInProgress] = useState(false);
  const [sendingJobId, setSendingJobId] = useState<number | null>(null);
  const [sendingProgress, setSendingProgress] = useState({
    total: 0,
    processed: 0,
    succeeded: 0,
    failed: 0,
    progress: 0,
  });
  const [sendingProgressDialogOpen, setSendingProgressDialogOpen] = useState(false);
  const [sendingResults, setSendingResults] = useState<any[] | null>(null);

  // Polling для отслеживания прогресса массовой отправки
  const pollSendingProgress = async (jobId: number) => {
    const maxAttempts = 300; // 5 минут (каждые 2 секунды)
    let attempts = 0;

    const poll = async (): Promise<void> => {
      if (attempts >= maxAttempts) {
        setSnackbar(_(msg`⏱️ Превышено время ожидания`));
        setSendingInProgress(false);
        return;
      }

      attempts++;

      try {
        const response = await apiFetch(`${API_BASE}/api/hh-integration/invitation-job/${jobId}/status`);
        
        if (response.ok) {
          const result = await response.json();
          const job = result.job;

          setSendingProgress({
            total: job.total,
            processed: job.processed,
            succeeded: job.succeeded,
            failed: job.failed,
            progress: job.progress,
          });

          if (job.isCompleted) {
            // Джоба завершена
            setSendingInProgress(false);
            setSendingResults(job.results || []);
            
            if (job.status === 'completed') {
              if (job.succeeded === job.total) {
                setSnackbar(_(msg`✅ Все приглашения отправлены (${job.succeeded}/${job.total})`));
              } else if (job.succeeded > 0) {
                setSnackbar(_(msg`⚠️ Частично отправлено: ${job.succeeded}/${job.total}`));
              } else {
                setSnackbar(_(msg`❌ Не удалось отправить приглашения`));
              }
            } else {
              setSnackbar(_(msg`❌ Ошибка отправки: ${job.errorMessage || 'Unknown error'}`));
            }

            // Обновляем список кандидатов
            setRefreshKey(prev => prev + 1);

            return;
          }

          // Продолжаем polling через 2 секунды
          setTimeout(() => poll(), 2000);
        } else {
          setSnackbar(_(msg`Ошибка проверки статуса отправки`));
          setSendingInProgress(false);
        }
      } catch (error) {
        console.error('Error polling sending progress:', error);
        setSnackbar(_(msg`Ошибка проверки статуса отправки`));
        setSendingInProgress(false);
      }
    };

    poll();
  };

  // Функция массовой отправки приглашений в HH.ru
  const handleBulkSendInvitations = async (candidateIds: (number | string)[]) => {
    if (!id) return;
    
    try {
      setSendingInProgress(true);
      setSendingProgressDialogOpen(true);
      setSendingProgress({ total: candidateIds.length, processed: 0, succeeded: 0, failed: 0, progress: 0 });

      const response = await apiFetch(`${API_BASE}/api/hh-integration/vacancy/${id}/send-bulk-invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ candidateIds }),
      });

      if (response.ok) {
        const result = await response.json();
        const jobId = result.jobId;
        setSendingJobId(jobId);
        
        // Запускаем polling
        pollSendingProgress(jobId);
      } else {
        const error = await response.json();
        setSnackbar(error.message || _(msg`Ошибка создания задачи отправки`));
        setSendingInProgress(false);
        setSendingProgressDialogOpen(false);
      }
    } catch (error) {
      console.error('Error starting bulk invitations:', error);
      setSnackbar(_(msg`Ошибка отправки приглашений`));
      setSendingInProgress(false);
      setSendingProgressDialogOpen(false);
    }
  };

  // Функция для выбора всех кандидатов (только завершенных)
  const handleSelectAll = () => {
    const finishedCandidates = filteredCandidates.filter(c => c.status === 'finished');
    if (selectedCandidates.length === finishedCandidates.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(finishedCandidates.map(c => c.id));
    }
  };

  // Получаем только завершенных кандидатов для сравнения
  const finishedCandidates = useMemo(() =>
    (candidates || []).filter(c => c.status === 'finished'),
    [candidates]
  );

  // Получаем параметры из URL
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setSearchParams(params);

      // Устанавливаем вкладку из URL
      const tabParam = params.get('tab');
      if (tabParam) {
        setTab(tabParam);
      }
    }
  }, []);

  // Скролл к вопросу после загрузки данных
  useEffect(() => {
    if (data && searchParams) {
      const scrollToQuestion = searchParams.get('scrollToQuestion');
      if (scrollToQuestion && tab === '3') {
        setTimeout(() => {
          const questionElement = document.querySelector(`[data-question-id="${scrollToQuestion}"]`);
          if (questionElement) {
            questionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            questionElement.classList.add('highlight-question');
            setTimeout(() => {
              questionElement.classList.remove('highlight-question');
            }, 3000);
          }
        }, 500);
      }
    }
  }, [data, searchParams, tab]);

  // Получаем только завершенных кандидатов для сравнения (используется в старом коде)
  const filteredCandidates = candidates; // Теперь фильтрация происходит через CandidateFilters

  useEffect(() => {
    const t = localStorage.getItem("recruitment_token");
    if (t) setToken(t);
  }, []);

  useEffect(() => {
    if (!token || !id) return;
    setLoading(true);
    apiFetch(`${API_BASE}/api/admin/vacancies/${id}/full`).then(r => r.json()).then(data => {
      setData(data);
      // Устанавливаем статус активности шаблона
      if (data.template?.isActive !== undefined) {
        setTemplateActive(data.template.isActive);
      }
    }).finally(()=>setLoading(false));
    apiFetch(`${API_BASE}/api/admin/vacancies/${id}/candidates`).then(r=>r.json()).then(result => {
      // API теперь возвращает { data: [], total: ... } или старый формат []
      if (Array.isArray(result)) {
        setCandidates(result);
        setTotalCandidates(result.length);
      } else {
        setCandidates(result.data || []);
        setTotalCandidates(result.total || 0);
      }
    });

    // Загружаем информацию о публичной ссылке
    apiFetch(`${API_BASE}/api/admin/vacancies/${id}/public-info`)
      .then(r => r.json())
      .then(data => {
        if (data.publicToken) {
          // Формируем полный URL на фронтенде
          const fullUrl = `${window.location.origin}/interview/apply/${data.publicToken}`;
          setPublicUrl(fullUrl);
        }
      })
      .catch(() => {
        // Игнорируем ошибки при загрузке публичной информации
      });
  }, [token, id]);

  if (!token) return <PageContainer title={_(msg`Вакансия`)}><Box sx={{p:4}}><Typography>{_(msg`Нет доступа`)}</Typography></Box></PageContainer>;
  if (loading || !data) return <PageContainer title={_(msg`Вакансия`)}><Box sx={{p:4, textAlign:'center'}}><CircularProgress /></Box></PageContainer>;

  const { title, description, template, questions } = data;
  const createdAt = data.createdAt ? formatDateToLocal(data.createdAt, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }) : '';

  // --- Шапка ---
  const header = (
    <Box mb={4}>
      <Breadcrumbs sx={{ mb: 2 }} aria-label="breadcrumb">
        <Link href="/hr/vacancies" style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 500 }}><Trans>Вакансии</Trans></Link>
        <Typography color="text.primary">{title}</Typography>
      </Breadcrumbs>
      <Card sx={{ p: 0, background: '#fff', boxShadow: 3 }}>
        <Box p={4} display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap">
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={2} mb={1}>
              <Typography variant="h3" fontWeight={800} sx={{ color: 'text.primary' }}>{title}</Typography>
              {data?.status === 'deleted' && (
                <Chip label="🗑️ Удалено" color="error" size="medium" sx={{ fontWeight: 700, fontSize: '0.9rem' }} />
              )}
              {data?.status === 'archived' && (
                <Chip label="📦 Архив" color="default" size="medium" sx={{ fontWeight: 700, fontSize: '0.9rem' }} />
              )}
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.7, color: 'text.secondary' }}><Trans>Создана: {createdAt}</Trans></Typography>
            <Box display="flex" gap={2} mt={2} flexWrap="wrap">
              <Chip icon={<IconFileText size={18}/>} label={template?.title || _(msg`Без шаблона`)} color={template ? 'secondary' : 'default'} sx={{ fontWeight: 600 }} />
              <Chip icon={<IconFileText size={18}/>} label={_(msg`Вопросов: ${(questions||[]).length}`)} color="primary" sx={{ fontWeight: 600 }} />
              <Chip icon={<IconUsers size={18}/>} label={_(msg`Кандидатов: ${candidates.length}`)} color="success" sx={{ fontWeight: 600 }} />
            </Box>

            {/* Публичная ссылка для самозаписи */}
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1, maxWidth: 600 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="body2" fontWeight={600} color="text.primary"><Trans>🌐 Ссылка для самозаписи на интервью</Trans></Typography>
                <Tooltip
                  title={
                    <Box sx={{ p: 1 }}>
                      <Typography variant="body2" gutterBottom fontWeight={600}><Trans>Публичная ссылка для массовой рассылки</Trans></Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}><Trans>Любой человек может записаться на интервью, указав свои данные.</Trans></Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}><Trans>📌 Используйте для размещения на сайтах вакансий, в соцсетях, массовых рассылках.</Trans></Typography>
                      <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.2)' }} />
                      <Typography variant="body2" sx={{ fontStyle: 'italic', opacity: 0.9 }}><Trans>💡 Для конкретных кандидатов создавайте персональные ссылки во вкладке "Кандидаты" → "Добавить кандидата" — так исключите повторные прохождения под разными именами.</Trans></Typography>
                    </Box>
                  }
                  arrow
                  placement="top"
                  componentsProps={{
                    tooltip: {
                      sx: {
                        maxWidth: 400,
                        bgcolor: 'primary.dark',
                      }
                    }
                  }}
                >
                  <IconButton size="small" sx={{ p: 0.5 }}>
                    <InfoOutlinedIcon fontSize="small" color="action" />
                  </IconButton>
                </Tooltip>
              </Box>
              <TextField
                value={publicUrl || _(msg`Не создана`)}
                size="small"
                InputProps={{
                  readOnly: true,
                  sx: { fontSize: '0.875rem' }
                }}
                sx={{
                  flex: 1,
                  '& .MuiInputBase-root': {
                    bgcolor: 'grey.50'
                  }
                }}
              />
              {publicUrl ? (
                <Tooltip title={_(msg`Скопировать ссылку`)}>
                  <IconButton
                    onClick={() => {
                      navigator.clipboard.writeText(publicUrl);
                      setSnackbar(_(msg`Ссылка скопирована!`));
                    }}
                    color="primary"
                    size="small"
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              ) : (
                <Button
                  onClick={generatePublicLink}
                  variant="outlined"
                  size="small"
                  sx={{ whiteSpace: 'nowrap' }}
                ><Trans>Создать</Trans></Button>
              )}
            </Box>

            {/* Переключатель активности интервью */}
            {template && (
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={templateActive} 
                      onChange={toggleTemplateActive}
                      disabled={toggleLoading}
                      color="success"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight={600} color="text.primary">
                        {templateActive ? '🟢' : '🔴'} {templateActive ? <Trans>Интервью включено</Trans> : <Trans>Интервью выключено</Trans>}
                      </Typography>
                      <Tooltip
                        title={
                          <Box sx={{ p: 1 }}>
                            <Typography variant="body2" gutterBottom fontWeight={600}>
                              {templateActive ? <Trans>Выключение интервью</Trans> : <Trans>Включение интервью</Trans>}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              {templateActive 
                                ? <Trans>Если выключить, кандидаты не смогут начать новое интервью. Уже начатые интервью продолжат работать.</Trans>
                                : <Trans>Если включить, кандидаты снова смогут проходить интервью по этой вакансии.</Trans>
                              }
                            </Typography>
                            <Typography variant="body2" sx={{ fontStyle: 'italic', opacity: 0.9 }}>
                              <Trans>💡 Используйте для временной приостановки набора или после закрытия вакансии.</Trans>
                            </Typography>
          </Box>
                        }
                        arrow
                        placement="top"
                        componentsProps={{
                          tooltip: {
                            sx: {
                              maxWidth: 400,
                              bgcolor: 'primary.dark',
                            }
                          }
                        }}
                      >
                        <IconButton size="small" sx={{ p: 0.5 }}>
                          <InfoOutlinedIcon fontSize="small" color="action" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                />
                {toggleLoading && <CircularProgress size={20} />}
              </Box>
            )}
          </Box>
          <Box display="flex" gap={2} alignItems="center" mt={{ xs: 2, md: 0 }}>
            {/* Кнопки для активных вакансий */}
            {data?.status === 'active' && (
              <>
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large" 
                  startIcon={<IconEdit size={20}/>} 
                  sx={{ fontWeight: 700, minWidth: 140 }} 
                  onClick={()=>router.push(`/hr/vacancy-edit/${id}`)}
                >
            <Trans>Редактировать</Trans>
          </Button>
                <Tooltip title={_(msg`В архив`)}>
                  <Button 
                    variant="outlined" 
                    color="inherit" 
                    size="large" 
                    onClick={handleArchiveVacancy}
                    sx={{ minWidth: 50 }}
                  >
                    <IconArchive size={20}/>
                  </Button>
                </Tooltip>
                <Tooltip title={_(msg`Удалить`)}>
                  <Button 
                    variant="outlined" 
                    color="error" 
                    size="large" 
                    onClick={handleDeleteVacancy}
                    sx={{ minWidth: 50 }}
                  >
                    <IconTrash size={20}/>
                  </Button>
                </Tooltip>
              </>
            )}
            
            {/* Кнопки для удалённых/архивных вакансий */}
            {(data?.status === 'deleted' || data?.status === 'archived') && (
              <Tooltip title={_(msg`Восстановить`)}>
                <Button 
                  variant="contained" 
                  color="success" 
                  size="large" 
                  startIcon={<IconRestore size={20}/>} 
                  onClick={handleRestoreVacancy}
                  sx={{ fontWeight: 700, minWidth: 160 }}
                >
                  <Trans>Восстановить</Trans>
                </Button>
              </Tooltip>
            )}
          </Box>
        </Box>
      </Card>
    </Box>
  );

  return (
    <PageContainer title={_(msg`Вакансия: ${title}`)}>
      <style jsx global>{`
        .highlight-question {
          background-color: #fff3cd !important;
          border: 2px solid #ffc107 !important;
          box-shadow: 0 0 10px rgba(255, 193, 7, 0.3) !important;
          transition: all 0.3s ease;
        }
      `}</style>
      {header}
      
      {/* Предупреждение для удалённых/архивных вакансий */}
      {data?.status === 'deleted' && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight={600}>
            <Trans>⚠️ Эта вакансия удалена. Кандидаты не могут проходить интервью.</Trans>
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            <Trans>Вы можете восстановить её, нажав кнопку "Восстановить" выше.</Trans>
          </Typography>
        </Alert>
      )}
      {data?.status === 'archived' && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight={600}>
            <Trans>📦 Эта вакансия находится в архиве. Кандидаты не могут проходить интервью.</Trans>
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            <Trans>Вы можете восстановить её, нажав кнопку "Восстановить" выше.</Trans>
          </Typography>
        </Alert>
      )}
      
      <TabContext value={tab}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <TabList onChange={(_, v) => setTab(v)} aria-label="vacancy tabs">
            <Tab icon={<IconUsers size={20}/>} iconPosition="start" label={_(msg`Кандидаты (${candidates.length})`)} value="1" />
            <Tab icon={<IconBriefcase size={20}/>} iconPosition="start" label={_(msg`Описание`)} value="2" />
            <Tab icon={<IconFileText size={20}/>} iconPosition="start" label={_(msg`Вопросы (${(questions||[]).length})`)} value="3" />
          </TabList>
        </Box>
        <TabPanel value="1" sx={{p:0}}>
          {/* Кандидаты — основной блок, как было, но с улучшениями */}
          <Grid container spacing={4}>
            <Grid item xs={12}>
              {/* Breadcrumbs для кандидатов */}
              <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link href="/hr/vacancies" style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 500 }}><Trans>Вакансии</Trans></Link>
                <Typography color="text.primary">{title}</Typography>
                <Typography color="text.primary"><Trans>Кандидаты</Trans></Typography>
              </Breadcrumbs>
              <Card sx={{ background: '#fff', color: 'text.primary', position: 'relative', overflow: 'hidden', mb: 3, boxShadow: 1 }}>
                {/* Заголовок с padding */}
                <Box sx={{ p: 3, pb: 0 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box sx={{ p: 2, borderRadius: 2, background: '#f5f5f5', backdropFilter: 'blur(10px)' }}>
                        <IconUsers size={32} color="#1976d2" />
                      </Box>
                      <Box>
                        <Typography variant="h4" fontWeight="700" sx={{ mb: 1, color: 'text.primary' }}><Trans>Кандидаты</Trans></Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9, color: 'text.secondary' }}><Trans>Всего: {totalCandidates}</Trans></Typography>
                      </Box>
                    </Box>
                    <Box display="flex" gap={2} alignItems="center">
                      {/* Переключатель вида */}
                      <ToggleButtonGroup
                        value={viewMode}
                        exclusive
                        onChange={handleViewModeChange}
                        size="small"
                      >
                        <ToggleButton value="list">
                          <ViewListIcon sx={{ mr: 1 }} fontSize="small" />
                          <Trans>Список</Trans>
                        </ToggleButton>
                        <ToggleButton value="kanban">
                          <ViewKanbanIcon sx={{ mr: 1 }} fontSize="small" />
                          <Trans>Канбан</Trans>
                        </ToggleButton>
                      </ToggleButtonGroup>

                      <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={()=>setAddDialogOpen(true)} sx={{fontWeight:600}}>
                        <Trans>Добавить кандидата</Trans>
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        disabled={selectedCandidates.length < 2}
                        onClick={()=>setCompareOpen(true)}
                        startIcon={<IconArrowsDiff />}
                      >
                        <Trans>Сравнить выбранных</Trans>{' '}({selectedCandidates.length})
                      </Button>
                    </Box>
                  </Box>

                  {/* Индикатор выбранных кандидатов */}
                  {selectedCandidates.length > 0 && (
                    <Alert
                      severity="info"
                      sx={{ mb: 2 }}
                      action={
                        selectedCandidates.length >= 2 && finishedCandidates.length >= 2 && (
                          <Button
                            color="inherit"
                            size="small"
                            onClick={() => setCompareOpen(true)}
                            startIcon={<IconArrowsDiff />}
                          >
                            <Trans>Сравнить ({selectedCandidates.length})</Trans>
                          </Button>
                        )
                      }
                    >
                      <Trans>Выбрано кандидатов: {selectedCandidates.length}</Trans>
                      {selectedCandidates.length < 2 && <Trans> (минимум 2 для сравнения)</Trans>}
                      {selectedCandidates.length >= 2 && finishedCandidates.length < 2 && <Trans> (но нет завершенных кандидатов для сравнения)</Trans>}
                    </Alert>
                  )}

                  {/* Информация о доступных для сравнения кандидатах */}
                  {finishedCandidates.length > 0 && (
                    <Alert severity="success" sx={{ mb: 2 }}><Trans>
                      ✅ Доступно для сравнения: <strong>{finishedCandidates.length}</strong> кандидатов
                      {candidates.length > finishedCandidates.length && (
                        <span> (еще {candidates.length - finishedCandidates.length} не завершили тест)</span>
                      )}
                    </Trans></Alert>
                  )}

                  {/* Фильтры - общие для обоих режимов */}
                  <CandidateFilters
                    filters={filters}
                    onFilterChange={setFilters}
                    vacancyId={parseInt(id)}
                    viewMode={viewMode}
                  />

                  {/* Floating панель массовых действий - для обоих режимов */}
                  {(selectedCandidates.length > 0 || floatingPanelData) && (
                    <BulkActionsPanel
                      selectedCount={
                        viewMode === 'list' && floatingPanelData
                          ? (floatingPanelData.selectAllByFilter ? floatingPanelData.total : selectedCandidates.length)
                          : selectedCandidates.length
                      }
                      selectedAllInColumns={[]}
                      onCancel={() => {
                        if (viewMode === 'list' && floatingPanelData?.onCancel) {
                          floatingPanelData.onCancel();
                        } else {
                          setSelectedCandidates([]);
                        }
                      }}
                      onBulkMove={async (targetStage) => {
                        if (viewMode === 'list' && floatingPanelData?.onStatusChange) {
                          await floatingPanelData.onStatusChange(targetStage);
                        } else if ((window as any).__candidatesListBulkChange) {
                          try {
                            await (window as any).__candidatesListBulkChange(selectedCandidates, targetStage);
                            setSelectedCandidates([]);
                          } catch (error) {
                            // Ошибка уже обработана
                          }
                        }
                      }}
                      statusTriggers={{}}
                      vacancySource={data?.source || ''}
                      selectedCandidates={
                        viewMode === 'list' && floatingPanelData
                          ? floatingPanelData.selectedCandidates
                          : candidates.filter(c => selectedCandidates.includes(c.id))
                      }
                      onBulkSendInvitations={async (hhCandidateIds) => {
                        if (viewMode === 'list' && floatingPanelData?.onSendInvitations) {
                          await floatingPanelData.onSendInvitations();
                        } else {
                          await handleBulkSendInvitations(hhCandidateIds);
                        }
                      }}
                      sendingInProgress={sendingInProgress}
                      hhCandidatesInfo={
                        viewMode === 'list' && floatingPanelData?.hhCandidatesInfo
                          ? floatingPanelData.hhCandidatesInfo
                          : undefined
                      }
                    />
                  )}
                </Box>

                {/* Контент без padding */}
                <Box>
                  {/* Таблица или Канбан */}
                  {viewMode === 'list' ? (
                    <CandidatesList
                      key={refreshKey}
                      vacancyId={id}
                      filters={filters}
                      onSnackbar={setSnackbar}
                      onShowQR={(url) => setQrDialog({ open: true, url })}
                      selectedCandidates={selectedCandidates}
                      onSelectedCandidatesChange={setSelectedCandidates}
                      vacancySource={data?.source || ''}
                      refreshTrigger={refreshKey}
                      onBulkStatusChangeRequest={async (candidateIds, targetStatus) => {
                        // Вызов из floating panel - используем унифицированный метод
                        if ((window as any).__candidatesListBulkChange) {
                          await (window as any).__candidatesListBulkChange(candidateIds, targetStatus);
                          setSelectedCandidates([]);
                        }
                      }}
                      onFloatingPanelData={setFloatingPanelData}
                    />
                  ) : (
                    <KanbanView
                      key={refreshKey}
                      vacancyId={id}
                      filters={filters}
                      selectedCandidates={selectedCandidates}
                      onSelectedCandidatesChange={setSelectedCandidates}
                    />
                  )}

                  {/* OLD TABLE CODE - УДАЛИТЬ
                    <DataTable columns={[
                    {field:'select',header:(
                      <Checkbox
                        checked={selectedCandidates.length === finishedCandidates.length && finishedCandidates.length > 0}
                        indeterminate={selectedCandidates.length > 0 && selectedCandidates.length < finishedCandidates.length}
                        onChange={handleSelectAll}
                        size="small"
                        color="primary"
                      />
                    ),render:(r:any)=>(
                      <Box>
                        <Checkbox
                          checked={selectedCandidates.includes(r.id)}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedCandidates([...selectedCandidates, r.id]);
                            } else {
                              setSelectedCandidates(selectedCandidates.filter(id => id !== r.id));
                            }
                          }}
                          disabled={r.status !== 'finished'}
                          size="small"
                          color="primary"
                        />
                        {r.status !== 'finished' && (
                          <Tooltip title={_(msg`Кандидат еще не завершил тест`)} arrow>
                            <Box component="span" sx={{ ml: 0.5, color: 'text.disabled', fontSize: '0.75rem' }}>
                              ⏳
                            </Box>
                          </Tooltip>
                        )}
                      </Box>
                    )},
                    {field:'name',header: _(msg`Имя`),render:(r:any)=>(
                      <Box display="flex" alignItems="center" gap={1}>
                      <Link href={`/hr/candidates/${r.id}`} style={{ textDecoration: 'none' }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar sx={{ width: 28, height: 28, bgcolor: '#1976d2', fontWeight: 700, fontSize: '0.75rem' }}>{r.name ? r.name.split(' ').map((n:string)=>n[0]).join('').toUpperCase() : '?'}</Avatar>
                          <Typography sx={{color:'#1976d2',fontWeight:700, fontSize: '0.875rem'}}>{r.name}</Typography>
                        </Box>
                      </Link>
                        {r.candidateOpinion && (
                          <Tooltip title={_(msg`У кандидата есть дополнительная информация`)} arrow>
                            <CommentIcon sx={{ fontSize: 16, color: 'primary.main', ml: 0.5 }} />
                          </Tooltip>
                        )}
                      </Box>
                    )},
                    {field:'contact',header: _(msg`Контакты`),render:(r:any)=>(
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                          {r.phone || '-'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                          {r.email || '-'}
                        </Typography>
                      </Box>
                    )},
                    {field:'status',header: _(msg`Статус`), render:(r:any)=>(<Chip size="small" label={getStatusLabel(r.status, _)} />)} ,
                    {field:'score',header: _(msg`Оценка`),render:(r:any)=>{
                      if (r.score !== undefined && r.score !== null) {
                        return (
                          <Chip
                            label={r.score}
                            color={r.score >= 8 ? 'success' : r.score >= 5 ? 'warning' : 'error'}
                            size="small"
                          />
                        );
                      } else if (r.status === 'finished') {
                        return (
                          <Chip
                            label="..."
                            color="info"
                            size="small"
                          />
                        );
                      } else {
                        return (
                          <Chip
                            label="—"
                            color="default"
                            size="small"
                          />
                        );
                      }
                    }},
                    {field:'createdAt',header: _(msg`Дата`),render:(r:any)=>r.createdAt ? (
                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                        {formatDateToLocal(r.createdAt)}
                        </Typography>
                    ) : '-'},
                    {field:'trustLevel',header: _(msg`Доверие`),render:(r:any)=>{
                      // Если нет fingerprint'а - показываем пустой кружок
                      if (!r.deviceFingerprint) {
                        return (
                          <Tooltip title={_(msg`❓ Нет данных об устройстве`)} arrow>
                            <Box sx={{
                              width: 14,
                              height: 14,
                              borderRadius: '50%',
                              border: '2px solid #ccc',
                              display: 'inline-block'
                            }} />
                          </Tooltip>
                        );
                      }

                      // Проверяем есть ли другие кандидаты с таким же device fingerprint
                      const hasDuplicateDevice = candidates.some(c =>
                        c.id !== r.id &&
                        c.deviceFingerprint &&
                        r.deviceFingerprint &&
                        c.deviceFingerprint === r.deviceFingerprint
                      );

                      return (
                        <Tooltip title={hasDuplicateDevice ? _(msg`⚠️ Устройство использовалось другими кандидатами`) : _(msg`✅ Уникальное устройство`)
                        } arrow>
                          <Box sx={{
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            bgcolor: hasDuplicateDevice ? 'error.main' : 'success.main',
                            display: 'inline-block'
                          }} />
                        </Tooltip>
                      );
                    }},
                    {field:'actions',header:'',render:(r:any)=>(
                      <Box display="flex" gap={1} alignItems="center">
                        <Tooltip title={_(msg`Скопировать ссылку на интервью`)}>
                          <IconButton size="small" color="primary" onClick={() => {
                            navigator.clipboard.writeText(typeof window !== 'undefined' ? `${window.location.origin}/interview/${r.token}` : '');
                            setSnackbar(_(msg`Ссылка скопирована!`));
                          }}>
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={_(msg`Показать QR-код для интервью`)}>
                          <IconButton size="small" color="secondary" onClick={() => setQrDialog({open:true,url:typeof window !== 'undefined' ? `${window.location.origin}/interview/${r.token}` : ''})}>
                            <QrCodeIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={_(msg`Удалить кандидата`)}>
                          <IconButton size="small" color="error" onClick={() => {
                            if (window.confirm(_(msg`Вы уверены, что хотите удалить этого кандидата?`))) {
                              apiFetch(`${API_BASE}/api/admin/candidates/${r.id}`, { method: 'DELETE' })
                                .then(response => {
                                  if (response.ok) {
                                    setSnackbar(_(msg`Кандидат удален!`));
                                    // Обновляем список кандидатов
                                    apiFetch(`${API_BASE}/api/admin/vacancies/${id}/candidates`)
                                      .then(r => r.json())
                                      .then(setCandidates);
                                  } else {
                                    return response.json().then(data => {
                                      throw new Error(data.error || _(msg`Ошибка удаления`));
                                    });
                                  }
                                })
                                .catch(e => {
                                  setSnackbar(_(msg`Ошибка удаления: ${e.message}`));
                                });
                            }
                          }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )},
                  ]} rows={filteredCandidates} defaultRowsPerPage={7} />
                  END OLD TABLE CODE */}
                  <Snackbar
                    open={!!snackbar}
                    autoHideDuration={2000}
                    onClose={()=>setSnackbar(null)}
                    message={snackbar}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                  />
                </Box>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        <TabPanel value="2" sx={{p:0}}>
          {/* Описание вакансии — только карточка вакансии */}
          <Grid container spacing={4}>
            <Grid item xs={12}>
              {/* Карточка вакансии */}
              <Card sx={{ background: '#fff', color: 'text.primary', position: 'relative', overflow: 'hidden', mb:3, boxShadow: 1 }}>
                <CardContent sx={{ position: 'relative', zIndex: 1, p: 4 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <IconBriefcase size={28} color="#1976d2" />
                    <Typography variant="h6" fontWeight="700" color="text.primary"><Trans>Вакансия</Trans></Typography>
                  </Box>
                  <Typography variant="body1" sx={{ opacity: 0.9, mb: 1, color: 'text.primary' }}>{title}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, mb: 1, color: 'text.secondary' }}><Trans>Создана:</Trans> {createdAt}</Typography>
                  {description ? (
                    <Typography
                      component="div"
                      variant="body1"
                      sx={{
                        opacity: 0.9,
                        color: 'text.secondary',
                        wordBreak: 'break-word',
                        fontSize: '1rem',
                        lineHeight: 1.7,
                        '& p': { margin: '8px 0', fontSize: '1rem' },
                        '& ul, & ol': { paddingLeft: '20px', margin: '8px 0', fontSize: '1rem' },
                        '& li': { marginBottom: '4px' }
                      }}
                      dangerouslySetInnerHTML={{ __html: description }}
                    />
                  ) : (
                    <Typography variant="body2" sx={{ opacity: 0.6, color: 'text.secondary' }}>
                      <Trans>Описание не заполнено</Trans>
                    </Typography>
                  )}
                  <Divider sx={{ my: 2, borderColor: '#eee' }} />
                  <Button variant="outlined" color="primary" startIcon={<IconEdit size={20}/>} onClick={()=>router.push(`/hr/vacancy-edit/${id}`)} sx={{fontWeight:600}}>
                    <Trans>Редактировать</Trans>
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        <TabPanel value="3" sx={{p:0}}>
          {/* Вопросы теста — отдельная карточка */}
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Card sx={{ background: '#fff', color: 'text.primary', position: 'relative', overflow: 'hidden', boxShadow: 1 }}>
                <CardContent sx={{ position: 'relative', zIndex: 1, p: 4 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <IconFileText size={28} color="#1976d2" />
                    <Typography variant="h6" fontWeight="700" color="text.primary"><Trans>Вопросы теста</Trans></Typography>
                  </Box>
                  <Typography variant="body1" sx={{ opacity: 0.9, mb: 1, color: 'text.primary' }}>{template?.title || _(msg`Без шаблона`)}</Typography>
                  {template?.description && (
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        opacity: 0.9,
                        color: 'text.secondary',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                      }}
                    >
                      {template.description}
                    </Typography>
                  )}
                  <Divider sx={{ my: 2, borderColor: '#eee' }} />
                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}><Trans>Вопросы:</Trans></Typography>
                  <Box sx={{ maxHeight: 320, overflowY: 'auto', mb: 2 }}>
                    {(questions||[]).length === 0 ? (
                      <Typography variant="body2" sx={{ opacity: 0.7, color: 'text.secondary' }}><Trans>Вопросы не добавлены</Trans></Typography>
                    ) : (
                      (questions||[]).map((q:any, index:number)=>(
                        <Box
                          key={q.position}
                          sx={{ mb: 1, p: 1, borderRadius: 1, background: '#f5f5f5', cursor: 'pointer' }}
                          onClick={() => {
                            const newSearchParams = new URLSearchParams(window.location.search);
                            newSearchParams.set('scrollToQuestion', q.position.toString());
                            router.push(`${window.location.pathname}?${newSearchParams.toString()}`);
                          }}
                          data-question-id={q.position}
                        >
                          <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>{q.position+1}. {q.text}</Typography>
                        </Box>
                      ))
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </TabContext>
      {/* Диалоги и QR-код — как было */}
      <AddCandidateDialog open={addDialogOpen} vacancyId={id} onClose={()=>setAddDialogOpen(false)} onAdded={()=>{
        // Обновляем список через изменение ключа
        setRefreshKey(prev => prev + 1);
        setSnackbar(_(msg`Кандидат добавлен успешно!`));
      }} />
      <Dialog open={qrDialog.open} onClose={()=>setQrDialog({open:false,url:''})}>
        <DialogTitle><Trans>QR-код для прохождения теста</Trans></DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <QRCode value={qrDialog.url} size={200} />
            <Button variant="outlined" onClick={()=>{
              const svg = document.querySelector('#qr-download svg');
              if(svg){
                const serializer = new XMLSerializer();
                const source = serializer.serializeToString(svg);
                const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
                const url = URL.createObjectURL(svgBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'qr-code.svg';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }
            }}><Trans>Скачать QR-код (SVG)</Trans></Button>
          </Box>
          <Box id="qr-download" style={{display:'none'}}><QRCode value={qrDialog.url} size={400} /></Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setQrDialog({open:false,url:''})}><Trans>Закрыть</Trans></Button>
        </DialogActions>
      </Dialog>
      {/* Попап сравнения двух кандидатов */}
      <Dialog open={compareOpen} onClose={()=>setCompareOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle><Trans>Сравнение кандидатов</Trans></DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          {selectedCandidates.length >= 2 ? (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                <Trans>Выбрано кандидатов</Trans>: {selectedCandidates.length}
              </Typography>
              <Grid container spacing={2}>
                {selectedCandidates.map((id, idx) => {
                  const cand = candidates.find((c:any) => c.id === id);
                  if (!cand) return null; // Пропускаем, если кандидат не найден
                  return (
                    <Grid item xs={12} sm={6} md={4} key={id}>
                      <Card sx={{p:2}}>
                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                          <Avatar sx={{ width: 40, height: 40, bgcolor: '#1976d2', fontWeight: 700 }}>{cand.name ? cand.name.split(' ').map((n:string)=>n[0]).join('').toUpperCase() : '?'}</Avatar>
                          <Typography variant="h6" fontWeight={700}>{cand.name}</Typography>
                        </Box>
                        <Typography variant="body2">Email: {cand.email || '-'}</Typography>
                        <Typography variant="body2"><Trans>Телефон</Trans>: {cand.phone || '-'}</Typography>
                        <Typography variant="body2"><Trans>Статус</Trans>: {getStatusLabel(cand.status, _)}</Typography>
                        <Typography variant="body2"><Trans>Оценка</Trans>: {cand.score !== undefined && cand.score !== null ? cand.score : '-'}</Typography>
                        <Typography variant="body2"><Trans>Дата добавления</Trans>: {cand.createdAt ? formatDateToLocal(cand.createdAt) : '-'}</Typography>
                        <Button variant="outlined" color="primary" fullWidth sx={{mt:2}} onClick={()=>router.push(`/hr/candidates/${cand.id}`)}><Trans>Подробнее</Trans></Button>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          ) : (
            <Typography><Trans>Выберите минимум 2 кандидатов для сравнения.</Trans></Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setCompareOpen(false)}><Trans>Закрыть</Trans></Button>
          {selectedCandidates.length >= 2 && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setCompareOpen(false);
                router.push(`/hr/candidates/compare?ids=${selectedCandidates.join(',')}`);
              }}
            ><Trans>
              AI-сравнение ({selectedCandidates.length})
            </Trans></Button>
          )}
        </DialogActions>
      </Dialog>



      {/* Плавающая кнопка сравнения */}
      {selectedCandidates.length >= 2 && (
        <Fab
          color="primary"
          onClick={() => setCompareOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000,
          }}
        >
          <IconArrowsDiff />
        </Fab>
      )}

      {/* Диалог прогресса массовой отправки */}
      <Dialog
        open={sendingProgressDialogOpen}
        onClose={() => {}}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown
      >
        <DialogTitle>
          {sendingInProgress ? (
            <Trans>📤 Отправка приглашений...</Trans>
          ) : (
            <Trans>✅ Отправка завершена</Trans>
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2">
                <Trans>Прогресс: {sendingProgress.processed} из {sendingProgress.total}</Trans>
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {sendingProgress.progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={sendingProgress.progress}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>

          <Box display="flex" gap={2} mb={2}>
            <Chip
              label={`✅ Успешно: ${sendingProgress.succeeded}`}
              color="success"
              size="small"
            />
            <Chip
              label={`❌ Ошибки: ${sendingProgress.failed}`}
              color="error"
              size="small"
            />
          </Box>

          {!sendingInProgress && sendingResults && sendingResults.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                <Trans>Детали:</Trans>
              </Typography>
              <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                {sendingResults.map((result, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      py: 0.5,
                      borderBottom: '1px solid #eee',
                    }}
                  >
                    <Box sx={{ fontSize: 14 }}>
                      {result.success ? '✅' : '❌'}
                    </Box>
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {result.candidateName || `Кандидат #${result.candidateId}`}
                    </Typography>
                    {!result.success && result.error && (
                      <Tooltip title={result.error} arrow>
                        <Chip label="Ошибка" size="small" color="error" />
                      </Tooltip>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {!sendingInProgress && (
            <Button
              onClick={() => {
                setSendingProgressDialogOpen(false);
                setSendingResults(null);
                setSelectedCandidates([]);
              }}
              variant="contained"
              color="primary"
            >
              <Trans>Закрыть</Trans>
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}

// --- AddCandidateDialog component ---
function AddCandidateDialog({open, onClose, vacancyId, onAdded}:{open:boolean; onClose:()=>void; vacancyId:string; onAdded:()=>void}){
  const { _, i18n } = useLingui();
  const [form,setForm] = React.useState({name:'',email:'',phone:''});
  const [loading,setLoading]=React.useState(false);
  const [errors, setErrors] = React.useState({name:'',email:'',phone:''});

  // Валидация email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const canSubmit = form.name.trim()!=='' && !loading && !errors.name && !errors.email && !errors.phone;

  const handleChange=(field:'name'|'email')=>(e:React.ChangeEvent<HTMLInputElement>)=>{
    const value = e.target.value;
    setForm({...form,[field]:value});

    // Очищаем ошибку при вводе
    setErrors(prev => ({...prev, [field]: ''}));

    // Валидация в реальном времени
    if (field === 'email' && value && !validateEmail(value)) {
      setErrors(prev => ({...prev, email: _(msg`Введите корректный email адрес`)}));
    }
  };

  const handlePhoneChange = (phone: string) => {
    setForm({...form, phone});
    
    // Очищаем ошибку при вводе
    setErrors(prev => ({...prev, phone: ''}));
    
    // Валидация в реальном времени
    if (phone && !isValidInternationalPhone(phone)) {
      setErrors(prev => ({...prev, phone: _(msg`Введите корректный номер телефона`)}));
    }
  };

  const handleSubmit=async()=>{
    if(!canSubmit) return;

    // Финальная валидация перед отправкой
    const newErrors = {name:'',email:'',phone:''};
    if (!form.name.trim()) newErrors.name = _(msg`Имя обязательно`);
    if (form.email && !validateEmail(form.email)) newErrors.email = _(msg`Введите корректный email адрес`);
    if (form.phone && !isValidInternationalPhone(form.phone)) newErrors.phone = _(msg`Введите корректный номер телефона`);

    if (newErrors.name || newErrors.email || newErrors.phone) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    const res = await apiFetch(`${API_BASE}/api/admin/candidates`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        ...form,
        phone: form.phone ? normalizePhoneForBackend(form.phone) : form.phone,
        vacancyId
      })
    });
    setLoading(false);
    if(res.ok){
      setForm({name:'',email:'',phone:''});
      setErrors({name:'',email:'',phone:''});
      onClose();
      onAdded();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle><Trans>Добавить кандидата</Trans></DialogTitle>
      <DialogContent sx={{ pt: '16px !important' }}>
        <TextField
          label={_(msg`Имя *`)}
          fullWidth
          sx={{mb:2}}
          value={form.name}
          onChange={handleChange('name')}
          autoFocus
          error={!!errors.name}
          helperText={errors.name}
        />
        <TextField
          label="Email"
          fullWidth
          sx={{mb:2}}
          value={form.email}
          onChange={handleChange('email')}
          error={!!errors.email}
          helperText={errors.email || _(msg`Например: example@mail.ru`)}
          placeholder="example@mail.ru"
        />
        <InternationalPhoneInput
          value={form.phone}
          onChange={handlePhoneChange}
          label={_(msg`Телефон`)}
          error={errors.phone}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}><Trans>Отмена</Trans></Button>
        <Button variant="contained" disabled={!canSubmit} onClick={handleSubmit}>{loading? _(msg`Добавление…`): _(msg`Добавить`)}</Button>
      </DialogActions>
    </Dialog>
  );
}
