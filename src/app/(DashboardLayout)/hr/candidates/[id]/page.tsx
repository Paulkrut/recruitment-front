"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from 'next/dynamic';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Divider,
  Grid,
  CircularProgress,
  Tooltip,
  IconButton,
  Snackbar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { IconUsers, IconMail, IconPhone, IconArrowLeft, IconLink, IconCheck, IconClock, IconEdit, IconCopy, IconEye, IconArrowsDiff, IconMoodHappy, IconFileDescription, IconRobot, IconChevronDown } from "@tabler/icons-react";
import PageContainer from "@/app/components/container/PageContainer";
import { apiFetch } from "@/utils/api";

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false });
import MuiLink from '@mui/material/Link';
import { IconFileText, IconMicrophone, IconVideo } from '@tabler/icons-react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TabPanel from '@mui/lab/TabPanel';
import TabContext from '@mui/lab/TabContext';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Link from 'next/link';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import CommentIcon from '@mui/icons-material/Comment';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import FeedbackIcon from '@mui/icons-material/Feedback';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { exportCandidateToPDFWithFont } from '@/utils/pdfExportWithFont';
import Rating from '@mui/material/Rating';
import { useLingui } from '@lingui/react';
import { msg, Trans } from '@lingui/macro';
import { getErrorMessage } from '@/utils/errorTranslator';
import CandidateEventsTimeline from '@/components/hr/hh-integration/CandidateEventsTimeline';
import TypingMetricsDisplay from '@/components/hr/TypingMetricsDisplay';
import CompetencyEvaluationTable from '@/components/hr/CompetencyEvaluationTable';
import CandidateScoresCard from '@/components/hr/CandidateScoresCard';
import RetentionForecastTable from '@/components/hr/RetentionForecastTable';
import QuestionAttachmentsDisplay from '@/components/QuestionAttachmentsDisplay';
import QuestionText from '@/components/QuestionText';
import type { NewMetrics } from '@/hooks/useCandidateEvaluation';


const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

function getStatusLabel(status: string, _: any) {
  switch (status) {
    case "completed":
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
    case "active":
      return _(msg`Активен`);
    default:
      return status;
  }
}

// Доступные статусы кандидата для изменения
const CANDIDATE_STATUSES = [
  { value: 'new', label: (l: any) => l(msg`Новый`), icon: '🆕' },
  { value: 'screening', label: (l: any) => l(msg`Скрининг`), icon: '🔍' },
  { value: 'contacted', label: (l: any) => l(msg`Связались`), icon: '📞' },
  { value: 'testing', label: (l: any) => l(msg`Тестирование`), icon: '📝' },
  { value: 'interview', label: (l: any) => l(msg`Интервью`), icon: '💼' },
  { value: 'offer', label: (l: any) => l(msg`Оффер`), icon: '📋' },
  { value: 'hired', label: (l: any) => l(msg`Нанят`), icon: '✅' },
  { value: 'rejected', label: (l: any) => l(msg`Отклонён`), icon: '❌' },
  { value: 'withdrawn', label: (l: any) => l(msg`Отказался`), icon: '🚫' },
];

export default function CandidateDetailPage() {
  const { _, i18n } = useLingui();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [statusData, setStatusData] = useState<any>(null);
  const [evalData, setEvalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copyMsg, setCopyMsg] = useState<string|null>(null);
  const [sessionDetail, setSessionDetail] = useState<any>(null);
  // HR заметки (MVP: localStorage)
  const [hrNote, setHrNote] = useState<string>("");
  const [tab, setTab] = useState('results');
  const [sendingHhInvitation, setSendingHhInvitation] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(null);
  const [changingStatus, setChangingStatus] = useState(false);
  const [allCandidates, setAllCandidates] = useState<any[]>([]);
  const [selectedCompare, setSelectedCompare] = useState<number[]>([]);
  const [resumeText, setResumeText] = useState<string | null>(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeData, setResumeData] = useState<any>(null);
  const [isEditingResume, setIsEditingResume] = useState(false);
  
  // Коммуникации
  const [communications, setCommunications] = useState<any[]>([]);
  const [communicationsLoading, setCommunicationsLoading] = useState(false);
  const [syncingMessages, setSyncingMessages] = useState(false);

  const getKnowledgeColor = (score: number): 'success' | 'warning' | 'error' => {
    if (score >= 8) return 'success';
    if (score >= 6) return 'warning';
    return 'error';
  };
  const [hasHhNegotiation, setHasHhNegotiation] = useState(false);
  const [hhCandidateId, setHhCandidateId] = useState<number | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("recruitment_token");
    if (t) setToken(t);
  }, []);

  useEffect(() => {
    if (!token || !id) return;
    setLoading(true);
    Promise.all([
      apiFetch(`${API_BASE}/api/admin/candidates/${id}/status`).then(r=>r.json()),
      apiFetch(`${API_BASE}/api/admin/candidates/${id}/evaluation`).then(r=>r.json())
    ]).then(([status, evaluation]) => {
      setStatusData(status);
      setEvalData(evaluation);
      // если есть хотя бы одна сессия — грузим её детали
      if (status.sessions && status.sessions.length > 0) {
        apiFetch(`${API_BASE}/api/admin/interview/session/${status.sessions[0].sessionId}`)
          .then(r=>r.json())
          .then(setSessionDetail);
      }
    }).finally(()=>setLoading(false));
  }, [token, id]);

  useEffect(() => {
    if (id) {
      const saved = localStorage.getItem(`hr_note_${id}`);
      if (saved) setHrNote(saved);
    }
  }, [id]);

  // Автозагрузка резюме при открытии вкладки "Резюме"
  useEffect(() => {
    if (tab === 'resume' && !resumeData && !resumeLoading && token && id) {
      setResumeLoading(true);
      apiFetch(`${API_BASE}/api/admin/candidates/${id}/resume`)
        .then(r => r.json())
        .then(data => {
          setResumeData(data);
          setResumeText(data.resumeText);
        })
        .catch(error => {
          console.error('Error loading resume:', error);
          setResumeData({ error: _(msg`Ошибка при загрузке`) });
        })
        .finally(() => setResumeLoading(false));
    }
  }, [tab, resumeData, resumeLoading, token, id]);
  
  // Автозагрузка коммуникаций при открытии вкладки
  useEffect(() => {
    if (tab === 'communications' && communications.length === 0 && !communicationsLoading && token && id) {
      loadCommunications();
    }
  }, [tab, token, id]);
  
  const loadCommunications = async () => {
    if (!token || !id) return;
    
    setCommunicationsLoading(true);
    try {
      const res = await apiFetch(`${API_BASE}/api/admin/candidates/${id}/communications`);
      const data = await res.json();
      
      if (res.ok) {
        setCommunications(data.communications || []);
        setHasHhNegotiation(data.hasHhNegotiation || false);
        setHhCandidateId(data.hhCandidateId || null);
      } else {
        setCopyMsg(_(msg`Ошибка загрузки коммуникаций`));
      }
    } catch (error) {
      console.error('Error loading communications:', error);
      setCopyMsg(_(msg`Ошибка загрузки коммуникаций`));
    } finally {
      setCommunicationsLoading(false);
    }
  };
  
  const syncHhMessages = async () => {
    if (!hhCandidateId) return;
    
    setSyncingMessages(true);
    try {
      const res = await apiFetch(`${API_BASE}/api/hh-integration/candidate/${hhCandidateId}/sync-messages`, {
        method: 'POST'
      });
      
      if (res.ok) {
        const data = await res.json();
        setCopyMsg(_(msg`✅ Загружено сообщений: ${data.synced}`));
        // Перезагружаем коммуникации
        await loadCommunications();
      } else {
        const data = await res.json().catch(() => ({}));
        const errorCode = data.error || 'common.internal_error';
        const errorMessage = i18n._(getErrorMessage(errorCode));
        setCopyMsg(`❌ ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error syncing HH messages:', error);
      setCopyMsg(_(msg`❌ Ошибка синхронизации`));
    } finally {
      setSyncingMessages(false);
    }
  };
  
  const saveNote = () => {
    if (id) localStorage.setItem(`hr_note_${id}`, hrNote);
  };
  // PDF экспорт
  // Удалить функцию exportPDF

  useEffect(() => {
    if (!token || !statusData?.vacancyId) return;
    // Получаем кандидатов этой вакансии для сравнения
    apiFetch(`${API_BASE}/api/admin/vacancies/${statusData.vacancyId}/candidates`).then(r=>r.json()).then(data => {
      // API теперь возвращает { data: [], total: ... } или старый формат []
      const candidates = Array.isArray(data) ? data : (data.data || []);
      setAllCandidates(candidates);
    }).catch(() => {
      // В случае ошибки устанавливаем пустой массив
      setAllCandidates([]);
    });
  }, [token, statusData]);

  if (!token)
    return (
      <PageContainer title={_(msg`Кандидат`)}>
        <Box sx={{ p: 4 }}>
          <Typography><Trans>Нет доступа</Trans></Typography>
        </Box>
      </PageContainer>
    );
  if (loading || !statusData)
    return (
      <PageContainer title={_(msg`Кандидат`)}>
        <Box sx={{ p: 4, textAlign: "center" }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );

  const { candidate, id: candId, token: candidateToken, sessions } = statusData;
  const createdAt = sessions?.[0]?.createdAt;
  const aiStatus = evalData?.status;
  const aiSummary = evalData?.summary;
  const aiStrengths = evalData?.strengths;
  const aiWeaknesses = evalData?.weaknesses;
  const aiMetrics = evalData?.metrics;
  const aiUpdatedAt = evalData?.updatedAt;
  
  // Вычисляем оценку по компетенциям (средняя из новой структуры)
  const competencyScore = aiMetrics && typeof aiMetrics === 'object' && 'summary_table' in aiMetrics 
    ? (aiMetrics as NewMetrics).summary_table?.average_score 
    : undefined;

  const interviewLink = candidateToken ? `${window.location.origin}/interview/${candidateToken}` : null;

  // email, phone, status
  const candidateStatus = statusData?.status;
  const candidateEmail = statusData?.email || sessionDetail?.candidate?.email;
  const candidatePhone = statusData?.phone || sessionDetail?.candidate?.phone;

  // Ссылка на интервью
  const interviewUrl = interviewLink;
  const copyInterviewUrl = () => {
    if (interviewUrl) {
      navigator.clipboard.writeText(interviewUrl);
      setCopyMsg(_(msg`Ссылка скопирована!`));
    }
  };
  const shareInterviewUrl = async () => {
    if (navigator.share && interviewUrl) {
      await navigator.share({ title: _(msg`Интервью`), url: interviewUrl });
    } else {
      copyInterviewUrl();
    }
  };

  // Функция экспорта в PDF
  const handleExportPDF = async () => {
    try {
      const pdfData = {
        candidate,
        email: candidateEmail,
        phone: candidatePhone,
        status: candidateStatus,
        createdAt,
        finishedAt: sessionDetail?.finishedAt,
        sessionDetail,
        evalData
      };

      await exportCandidateToPDFWithFont(pdfData, i18n);
    } catch (error) {
      console.error('Ошибка при экспорте PDF:', error);
      setCopyMsg(_(msg`Ошибка при создании PDF`));
    }
  };

  // Отправка приглашения на интервью в HH
  const handleSendHhInvitation = async () => {
    if (!statusData?.hhCandidateId) {
      setCopyMsg(_(msg`Кандидат не из HeadHunter.ru`));
      return;
    }

    setSendingHhInvitation(true);

    try {
      const res = await apiFetch(`${API_BASE}/api/hh-integration/candidate/${statusData.hhCandidateId}/send-interview-link`, {
        method: 'POST'
      });

      if (res.ok) {
        setCopyMsg(_(msg`✅ Приглашение отправлено в HH.ru`));
        // Автоматически синхронизируем сообщения после отправки
        if (statusData.hhCandidateId) {
          setTimeout(() => {
            syncHhMessages();
          }, 1000); // Небольшая задержка чтобы HH успел обработать
        }
      } else {
        const data = await res.json().catch(() => ({}));
        const errorCode = data.error || 'common.internal_error';
        const errorMessage = i18n._(getErrorMessage(errorCode));
        setCopyMsg(`❌ ${errorMessage}`);
      }
    } catch (error) {
      console.error('Ошибка при отправке приглашения в HH:', error);
      setCopyMsg(_(msg`❌ Ошибка при отправке приглашения`));
    } finally {
      setSendingHhInvitation(false);
    }
  };

  // Изменение статуса кандидата
  const handleChangeStatus = async (newStatus: string) => {
    setStatusMenuAnchor(null);
    
    if (!statusData?.id || !statusData?.vacancyId) {
      setCopyMsg(_(msg`❌ Ошибка: нет данных кандидата`));
      return;
    }

    if (newStatus === candidateStatus) {
      return; // Уже такой статус
    }

    setChangingStatus(true);

    try {
      const res = await apiFetch(
        `${API_BASE}/api/admin/vacancies/${statusData.vacancyId}/candidates/${statusData.id}/status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        setCopyMsg(_(msg`✅ Статус изменен`));
        
        // Обновляем локальные данные
        setStatusData((prev: any) => ({ ...prev, status: newStatus }));
      } else {
        const data = await res.json().catch(() => ({}));
        const errorCode = data.error || 'common.internal_error';
        const errorMessage = i18n._(getErrorMessage(errorCode));
        setCopyMsg(`❌ ${errorMessage}`);
      }
    } catch (error) {
      console.error('Ошибка при изменении статуса:', error);
      setCopyMsg(_(msg`❌ Ошибка при изменении статуса`));
    } finally {
      setChangingStatus(false);
    }
  };

  return (
    <PageContainer title={_(msg`Кандидат`) + ': ' + candidate}>
      <Stack spacing={3}>
        {/* Breadcrumbs */}
        <Breadcrumbs aria-label="breadcrumb">
          <Link href="/hr/vacancies" style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 500 }}><Trans>Вакансии</Trans></Link>
          {statusData?.vacancyId ? (
            <Link href={`/hr/vacancies/${statusData.vacancyId}`} style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 500 }}>
              {sessionDetail?.vacancy?.title || statusData.vacancyTitle || _(msg`Вакансия`)}
            </Link>
          ) : (
            <Typography color="text.primary"><Trans>Вакансия</Trans></Typography>
          )}
          <Typography color="text.primary">{candidate}</Typography>
        </Breadcrumbs>
        {/* Информация о кандидате */}
        <Card sx={{ background: '#fff', color: 'text.primary', position: 'relative', overflow: 'hidden' }}>
          <CardContent sx={{ position: 'relative', zIndex: 1, p: 4 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center" mb={3}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: '#1976d2', fontWeight: 700, fontSize: 32 }}>
                {candidate ? candidate.split(' ').map((n:string)=>n[0]).join('').toUpperCase() : '?'}
              </Avatar>
              <Box flexGrow={1}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography variant="h4" fontWeight="700">{candidate}</Typography>
                  {candidateStatus && (
                    <Tooltip title={_(msg`Кликните для изменения статуса`)}>
                      <Chip 
                        label={getStatusLabel(candidateStatus, _)} 
                        color={candidateStatus==='hired'?'success':candidateStatus==='rejected'?'error':'default'} 
                        size="medium" 
                        icon={<CheckCircleIcon color={candidateStatus==='hired'?'success':'disabled'} />}
                        deleteIcon={<IconChevronDown size={18} />}
                        onDelete={(e) => setStatusMenuAnchor(e.currentTarget)}
                        onClick={(e) => setStatusMenuAnchor(e.currentTarget)}
                        sx={{ 
                          cursor: 'pointer', 
                          '&:hover': { opacity: 0.8 },
                          '& .MuiChip-deleteIcon': {
                            color: 'inherit',
                            fontSize: '1.2rem',
                            marginRight: '4px',
                            '&:hover': {
                              color: 'inherit',
                            }
                          }
                        }}
                      />
                    </Tooltip>
                  )}
                  <Menu
                    anchorEl={statusMenuAnchor}
                    open={Boolean(statusMenuAnchor)}
                    onClose={() => setStatusMenuAnchor(null)}
                  >
                    {CANDIDATE_STATUSES.map((status) => (
                      <MenuItem 
                        key={status.value} 
                        onClick={() => handleChangeStatus(status.value)}
                        selected={status.value === candidateStatus}
                        disabled={changingStatus}
                      >
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <Typography fontSize="1.2rem">{status.icon}</Typography>
                        </ListItemIcon>
                        <ListItemText>{status.label(_)}</ListItemText>
                      </MenuItem>
                    ))}
                  </Menu>
                  {sessionDetail?.status && <Chip label={getStatusLabel(sessionDetail.status, _)} color={sessionDetail.status==='completed'?'success':sessionDetail.status==='in_progress'?'warning':'default'} size="medium" icon={sessionDetail.status==='completed'?<CheckCircleIcon color="success" />:<HourglassEmptyIcon color="warning" />} />}
                  {statusData?.candidateOpinion && (
                    <Tooltip title={_(msg`Кандидат оставил мнение о результатах`)}>
                      <Chip
                        label={_(msg`Есть мнение`)}
                        color="info"
                        size="small"
                        icon={<IconMoodHappy size={16} />}
                        onClick={() => setTab('opinion')}
                        sx={{ cursor: 'pointer' }}
                      />
                    </Tooltip>
                  )}
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={1} flexWrap="wrap">
                  <Typography variant="body2" color="text.secondary">Email: {candidateEmail || '-'}</Typography>
                  <Typography variant="body2" color="text.secondary"><Trans>Телефон: {candidatePhone || '-'}</Trans></Typography>
                  <Typography variant="body2" color="text.secondary"><Trans>Вопросов: {sessionDetail?.answers?.length || 0}</Trans></Typography>
                  {/* Компактные оценки в шапке */}
                  {sessionDetail?.result?.totalScore !== undefined && sessionDetail?.result?.totalScore !== null && (
                    <Typography variant="body2" color="text.secondary">
                      <Trans>🎓 Total Skills: <strong style={{ color: sessionDetail.result.totalScore >= 8 ? '#4caf50' : sessionDetail.result.totalScore >= 6 ? '#ff9800' : '#f44336' }}>{sessionDetail.result.totalScore.toFixed(1)}/10</strong></Trans>
                    </Typography>
                  )}
                  {competencyScore !== undefined && (
                    <Typography variant="body2" color="text.secondary">
                      <Trans>💡 Fit: <strong style={{ color: competencyScore >= 8 ? '#4caf50' : competencyScore >= 6 ? '#ff9800' : '#f44336' }}>{competencyScore.toFixed(1)}/10</strong></Trans>
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary"><Trans>Создано: {createdAt || '-'}</Trans></Typography>
                  <Typography variant="body2" color="text.secondary"><Trans>Завершено: {sessionDetail?.finishedAt || '-'}</Trans></Typography>
                </Stack>
              </Box>
              <Stack direction="row" spacing={1}>
                {/* Кнопка отправки приглашения в HH */}
                {statusData?.hhCandidateId && (
                  <Tooltip title={_(msg`Отправить приглашение на интервью в HH.ru`)}>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={handleSendHhInvitation}
                      disabled={sendingHhInvitation}
                      startIcon={sendingHhInvitation ? <CircularProgress size={16} /> : <MailOutlineIcon />}
                    >
                      {sendingHhInvitation ? <Trans>Отправка...</Trans> : <Trans>HH</Trans>}
                    </Button>
                  </Tooltip>
                )}
                <Tooltip title={_(msg`Скопировать ссылку на интервью`)}>
                  <IconButton color="primary" onClick={copyInterviewUrl}><ContentCopyIcon /></IconButton>
                </Tooltip>
                <Tooltip title={_(msg`Открыть интервью`)}>
                  <Link href={interviewLink || '#'} target="_blank" rel="noopener" passHref legacyBehavior>
                    <Button variant="contained" color="primary" size="small" component="a"><Trans>Интервью</Trans></Button>
                  </Link>
                </Tooltip>
                <Tooltip title={_(msg`Экспорт в PDF`)}>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    startIcon={<PictureAsPdfIcon />}
                    onClick={handleExportPDF}
                  >
                    PDF
                  </Button>
                </Tooltip>
              </Stack>
            </Stack>
            <Divider sx={{ my: 2, borderColor: '#eee' }} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
              <Tooltip title={_(msg`Назад к вакансии`)}>
                <Button variant="outlined" color="primary" startIcon={<IconArrowLeft size={20}/>} onClick={()=>router.push(statusData?.vacancyId ? `/hr/vacancies/${statusData.vacancyId}` : '/hr/vacancies')}>
                  <Trans>Назад</Trans>
                </Button>
              </Tooltip>
              <Tooltip title={_(msg`Сравнить с другими`)}>
                <Button variant="outlined" color="primary" startIcon={<IconArrowsDiff size={20}/>} onClick={()=>setCompareOpen(true)}>
                  <Trans>Сравнить</Trans>
                </Button>
              </Tooltip>
            </Stack>
          </CardContent>
        </Card>

        {/* Табы с иконками */}
        <TabContext value={tab}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={tab} onChange={(_,v)=>setTab(v)} variant="scrollable" scrollButtons="auto">
              <Tab icon={<AssignmentTurnedInIcon />} iconPosition="start" label={_(msg`Результаты`)} value="results" />
              <Tab icon={<IconFileDescription />} iconPosition="start" label={_(msg`Резюме`)} value="resume" />
              <Tab icon={<CommentIcon />} iconPosition="start" label={_(msg`Комментарии`)} value="comments" />
              <Tab icon={<MailOutlineIcon />} iconPosition="start" label={_(msg`Коммуникации`)} value="communications" />
              <Tab icon={<IconRobot />} iconPosition="start" label={_(msg`История действий`)} value="automation" />
              <Tab icon={<FeedbackIcon />} iconPosition="start" label={_(msg`Отзыв`)} value="feedback" />
              <Tab icon={<IconMoodHappy />} iconPosition="start" label={_(msg`Мнение кандидата`)} value="opinion" />
            </Tabs>
          </Box>
          <TabPanel value="results" sx={{p:0}}>
            {/* ═══════════════════════════════════════════ */}
            {/* 📊 ИТОГОВЫЕ ПОКАЗАТЕЛИ */}
            {/* ═══════════════════════════════════════════ */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ 
                mb: 2, 
                pb: 1.5, 
                borderBottom: '3px solid',
                borderColor: 'primary.main',
              }}>
                <Typography variant="h5" fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span style={{ fontSize: '1.5rem' }}>📊</span>
                  <Trans>Итоговые показатели</Trans>
                </Typography>
              </Box>
              <CandidateScoresCard
                interviewScore={sessionDetail?.result?.totalScore}
                competencyScore={competencyScore}
                questionsCount={sessionDetail?.answers?.length}
              />
            </Box>

            {/* ═══════════════════════════════════════════ */}
            {/* 🧠 ОЦЕНКА ЗНАНИЙ */}
            {/* ═══════════════════════════════════════════ */}
            {(sessionDetail?.result?.summary || sessionDetail?.result?.totalScore !== undefined || (evalData && (aiSummary || aiStrengths || aiWeaknesses || (aiMetrics && typeof aiMetrics === 'object' && !('competencies' in aiMetrics))))) && (
              <Box sx={{ mb: 4 }}>
                <Box sx={{ 
                  mb: 2, 
                  pb: 1.5, 
                  borderBottom: '3px solid',
                  borderColor: 'warning.main',
                }}>
                  <Typography variant="h5" fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span style={{ fontSize: '1.5rem' }}>🧠</span>
                    <Trans>Оценка знаний</Trans>
                  </Typography>
                </Box>
                <Card sx={{ background: '#fff', color: 'text.primary', position: 'relative', overflow: 'hidden' }}>
                  <CardContent sx={{ position: 'relative', zIndex: 1, p: 4 }}>
                    {sessionDetail?.result?.totalScore !== undefined && sessionDetail?.result?.totalScore !== null && (
                      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Typography variant="h3" fontWeight={700} color={getKnowledgeColor(sessionDetail.result.totalScore) + '.main'}>
                          {sessionDetail.result.totalScore.toFixed(1)}/10
                        </Typography>
                        <Chip
                          label={sessionDetail.result.totalScore >= 8 ? _(msg`Сильный уровень`) : sessionDetail.result.totalScore >= 6 ? _(msg`Средний уровень`) : _(msg`Требует усиления`)}
                          color={getKnowledgeColor(sessionDetail.result.totalScore)}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                    )}
                    {sessionDetail?.result?.summary && (
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        <Trans><b>Общая оценка по интервью:</b> {sessionDetail.result.summary}</Trans>
                      </Typography>
                    )}
                    {/* Старый формат - общее резюме и сильные/слабые стороны */}
                    {aiSummary === null ? (
                      <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, borderLeft: '4px solid #ff9800' }}>
                        <Typography variant="body2" color="text.secondary">
                          <Trans>ℹ️ <b>Оценка знаний не проводилась</b> — в интервью использовались только компетенционные вопросы (не влияющие на оценку знаний).</Trans>
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          <Trans>Анализ компетенций (FIT), грамотности и прогноз удержания доступны ниже.</Trans>
                        </Typography>
                      </Box>
                    ) : aiSummary ? (
                      <Typography variant="body1" sx={{ mb: 2 }}><Trans><b>Общее резюме:</b> {aiSummary}</Trans></Typography>
                    ) : null}
                    {aiStrengths && Array.isArray(aiStrengths) && aiStrengths.length > 0 && (
                      <Box mb={2}>
                        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}><Trans>Сильные стороны:</Trans></Typography>
                        <Stack component="ul" spacing={0.5} sx={{pl:2, m:0}}>
                          {aiStrengths.map((s:string,i:number)=>(<li key={i}><CheckCircleIcon color="success" fontSize="small" sx={{mr:0.5,verticalAlign:'middle'}} />{s}</li>))}
                        </Stack>
                      </Box>
                    )}
                    {aiWeaknesses && Array.isArray(aiWeaknesses) && aiWeaknesses.length > 0 && (
                      <Box mb={2}>
                        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}><Trans>Области для развития:</Trans></Typography>
                        <Stack component="ul" spacing={0.5} sx={{pl:2, m:0}}>
                          {aiWeaknesses.map((s:string,i:number)=>(<li key={i}><HourglassEmptyIcon color="warning" fontSize="small" sx={{mr:0.5,verticalAlign:'middle'}} />{s}</li>))}
                        </Stack>
                      </Box>
                    )}
                    
                    {/* Старый формат метрик - показываем только если это старая структура */}
                    {aiMetrics && typeof aiMetrics === 'object' && !('competencies' in aiMetrics) && (
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}><Trans>Метрики оценки:</Trans></Typography>
                        <Grid container spacing={2}>
                          {Object.entries(aiMetrics).filter(([key]) => key !== 'writing_analysis').map(([metric, value]) => {
                            const score = typeof value === 'number' ? value : 0;
                            const getColor = (score: number) => {
                              if (score >= 80) return 'success';
                              if (score >= 60) return 'warning';
                              return 'error';
                            };
                            const getIcon = (metric: string) => {
                              const metricLower = metric.toLowerCase();
                              if (metricLower.includes('communication') || metricLower.includes(_(msg`общение`))) return '💬';
                              if (metricLower.includes('problem') || metricLower.includes(_(msg`решение`))) return '🧩';
                              if (metricLower.includes('leadership') || metricLower.includes(_(msg`лидерство`))) return '👑';
                              if (metricLower.includes('technical') || metricLower.includes(_(msg`технический`))) return '⚙️';
                              if (metricLower.includes('teamwork') || metricLower.includes(_(msg`команда`))) return '🤝';
                              if (metricLower.includes('motivation') || metricLower.includes(_(msg`мотивация`))) return '🚀';
                              if (metricLower.includes('writing') || metricLower.includes(_(msg`письм`))) return '✍️';
                              if (metricLower.includes(_(msg`стресс`)) || metricLower.includes('stress')) return '🛡️';
                              return '📊';
                            };
                            const getLabel = (metric: string) => {
                              const labels: { [key: string]: string } = {
                                'COMMUNICATION': _(msg`Коммуникация`),
                                'PROBLEM_SOLVING': _(msg`Решение проблем`),
                                'LEADERSHIP': _(msg`Лидерство`),
                                'TECHNICAL': _(msg`Технические навыки`),
                                'TEAMWORK': _(msg`Работа в команде`),
                                'MOTIVATION': _(msg`Мотивация`),
                                'WRITING_QUALITY': _(msg`Качество письменной речи`),
                                'Стрессоустойчивость': _(msg`Стрессоустойчивость`)
                              };
                              return labels[metric] || metric;
                            };

                            return (
                              <Grid item xs={12} sm={6} md={4} key={metric}>
                                <Card
                                  sx={{
                                    p: 2,
                                    height: '100%',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    '&:hover': {
                                      borderColor: 'primary.main',
                                      boxShadow: 1,
                                    },
                                    transition: 'all 0.2s ease'
                                  }}
                                >
                                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                                    <Typography variant="h6" sx={{ fontSize: '1.2rem' }}>
                                      {getIcon(metric)}
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ flexGrow: 1 }}>
                                      {getLabel(metric)}
                                    </Typography>
                                    <Chip
                                      label={`${score}/100`}
                                      size="small"
                                      color={getColor(score) as any}
                                      sx={{ fontWeight: 600 }}
                                    />
                                  </Box>

                                  <Box sx={{ width: '100%', mb: 1 }}>
                                    <Box
                                      sx={{
                                        width: `${score}%`,
                                        height: 8,
                                        borderRadius: 4,
                                        backgroundColor: score >= 80 ? 'success.main' : score >= 60 ? 'warning.main' : 'error.main',
                                        transition: 'width 0.3s ease'
                                      }}
                                    />
                                  </Box>

                                  <Typography variant="caption" color="textSecondary">
                                    {score >= 80 ? _(msg`Отлично`) : score >= 60 ? _(msg`Хорошо`) : score >= 40 ? _(msg`Средне`) : _(msg`Требует улучшения`)}
                                  </Typography>
                                </Card>
                              </Grid>
                            );
                          })}
                        </Grid>
                      </Box>
                    )}
                    
                    {/* Анализ письменной речи (writing_analysis) - только для старого формата */}
                    {aiMetrics && typeof aiMetrics === 'object' && !('competencies' in aiMetrics) && 'writing_analysis' in aiMetrics && aiMetrics.writing_analysis && (
                      <Box sx={{ mt: 3 }}>
                        <Card sx={{ p: 3, backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0' }}>
                          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span>✍️</span>
                            <Trans>Анализ письменной речи</Trans>
                          </Typography>
                          {typeof aiMetrics.writing_analysis === 'object' && (
                            <Stack spacing={2}>
                              {aiMetrics.writing_analysis.grammar_quality && (
                                <Box>
                                  <Typography variant="caption" fontWeight={600} color="text.secondary"><Trans>Грамматика и орфография:</Trans></Typography>
                                  <Typography variant="body2">{aiMetrics.writing_analysis.grammar_quality}</Typography>
                                </Box>
                              )}
                              {aiMetrics.writing_analysis.style_quality && (
                                <Box>
                                  <Typography variant="caption" fontWeight={600} color="text.secondary"><Trans>Стиль и ясность:</Trans></Typography>
                                  <Typography variant="body2">{aiMetrics.writing_analysis.style_quality}</Typography>
                                </Box>
                              )}
                              {aiMetrics.writing_analysis.structure_quality && (
                                <Box>
                                  <Typography variant="caption" fontWeight={600} color="text.secondary"><Trans>Структура:</Trans></Typography>
                                  <Typography variant="body2">{aiMetrics.writing_analysis.structure_quality}</Typography>
                                </Box>
                              )}
                              {aiMetrics.writing_analysis.strengths && aiMetrics.writing_analysis.strengths.length > 0 && (
                                <Box>
                                  <Typography variant="caption" fontWeight={600} color="text.secondary"><Trans>Сильные стороны:</Trans></Typography>
                                  <ul style={{margin: 0, paddingLeft: '20px'}}>
                                    {aiMetrics.writing_analysis.strengths.map((s: string, i: number) => (
                                      <li key={i}><Typography variant="body2">{s}</Typography></li>
                                    ))}
                                  </ul>
                                </Box>
                              )}
                              {aiMetrics.writing_analysis.weaknesses && aiMetrics.writing_analysis.weaknesses.length > 0 && (
                                <Box>
                                  <Typography variant="caption" fontWeight={600} color="text.secondary"><Trans>Области для улучшения:</Trans></Typography>
                                  <ul style={{margin: 0, paddingLeft: '20px'}}>
                                    {aiMetrics.writing_analysis.weaknesses.map((w: string, i: number) => (
                                      <li key={i}><Typography variant="body2">{w}</Typography></li>
                                    ))}
                                  </ul>
                                </Box>
                              )}
                              {aiMetrics.writing_analysis.recommendation && (
                                <Box>
                                  <Typography variant="caption" fontWeight={600} color="text.secondary"><Trans>Рекомендации:</Trans></Typography>
                                  <Typography variant="body2">{aiMetrics.writing_analysis.recommendation}</Typography>
                                </Box>
                              )}
                            </Stack>
                          )}
                        </Card>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Box>
            )}

            {/* ═══════════════════════════════════════════ */}
            {/* 🎯 FIT-ОЦЕНКА */}
            {/* ═══════════════════════════════════════════ */}
            {evalData && aiMetrics && typeof aiMetrics === 'object' && 'competencies' in aiMetrics && (
              <Box sx={{ mb: 4 }}>
                <Box sx={{ 
                  mb: 2, 
                  pb: 1.5, 
                  borderBottom: '3px solid',
                  borderColor: 'success.main',
                }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                    <Typography variant="h5" fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span style={{ fontSize: '1.5rem' }}>🎯</span>
                      <Trans>Fit-оценка</Trans>
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Chip 
                        label={aiStatus === 'done' ? _(msg`Оценка завершена`) : aiStatus === 'pending' ? _(msg`Обрабатывается`) : _(msg`Нет данных`)} 
                        color={aiStatus==='done'?'success':aiStatus==='pending'?'warning':'default'} 
                        size="small" 
                      />
                      {aiUpdatedAt && <Typography variant="caption" sx={{ opacity: 0.7 }}><Trans>Обновлено: {aiUpdatedAt}</Trans></Typography>}
                    </Stack>
                  </Stack>
                </Box>
                <CompetencyEvaluationTable metrics={aiMetrics as NewMetrics} />
              </Box>
            )}

            {/* ═══════════════════════════════════════════ */}
            {/* 📈 ПРОГНОЗ УДЕРЖАНИЯ */}
            {/* ═══════════════════════════════════════════ */}
            {evalData && aiMetrics && typeof aiMetrics === 'object' && 'retention_forecast' in aiMetrics && (
              <Box sx={{ mb: 4 }}>
                <Box sx={{ 
                  mb: 2, 
                  pb: 1.5, 
                  borderBottom: '3px solid',
                  borderColor: 'info.main',
                }}>
                  <Typography variant="h5" fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span style={{ fontSize: '1.5rem' }}>📈</span>
                    <Trans>Прогноз удержания в компании</Trans>
                  </Typography>
                </Box>
                <RetentionForecastTable forecast={(aiMetrics as NewMetrics).retention_forecast!} />
              </Box>
            )}

            {/* ═══════════════════════════════════════════ */}
            {/* 📝 ДЕТАЛИ ИНТЕРВЬЮ */}
            {/* ═══════════════════════════════════════════ */}
            {sessionDetail && (
              <Box sx={{ mb: 3 }}>
                <Box sx={{ 
                  mb: 2, 
                  pb: 1.5, 
                  borderBottom: '3px solid',
                  borderColor: 'divider',
                }}>
                  <Typography variant="h5" fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span style={{ fontSize: '1.5rem' }}>📝</span>
                    <Trans>Детали интервью</Trans>
                  </Typography>
                </Box>
                <Card sx={{ background: '#fff', color: 'text.primary', position: 'relative', overflow: 'hidden' }}>
                  <CardContent sx={{ position: 'relative', zIndex: 1, p: 4 }}>
                    <Stack direction="row" alignItems="center" spacing={2} mb={3} flexWrap="wrap">
                      <Chip 
                        label={getStatusLabel(sessionDetail.status, _)} 
                        color={sessionDetail.status==='completed'?'success':sessionDetail.status==='in_progress'?'warning':'default'} 
                        size="medium" 
                      />
                      {sessionDetail.template?.title && (
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <b><Trans>Шаблон:</Trans></b> {sessionDetail.template.title}
                          {sessionDetail.template.id && (
                            <Button component={Link} href={`/hr-tests/${sessionDetail.template.id}`} size="small" color="primary">
                              <Trans>Открыть</Trans>
                            </Button>
                          )}
                        </Typography>
                      )}
                      {sessionDetail.vacancy && (
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <b><Trans>Вакансия:</Trans></b> {sessionDetail.vacancy.title}
                          {sessionDetail.vacancy.id && (
                            <Button component={Link} href={`/hr/vacancies/${sessionDetail.vacancy.id}`} size="small" color="primary">
                              <Trans>Открыть</Trans>
                            </Button>
                          )}
                        </Typography>
                      )}
                    </Stack>

                    <Grid container spacing={2} mb={3}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                          <HourglassEmptyIcon fontSize="small" sx={{verticalAlign:'middle',mr:0.5}} />
                          <b><Trans>Начата:</Trans></b> {sessionDetail.startedAt ? new Date(sessionDetail.startedAt).toLocaleString() : '-'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                          <CheckCircleIcon fontSize="small" sx={{verticalAlign:'middle',mr:0.5}} />
                          <b><Trans>Завершена:</Trans></b> {sessionDetail.finishedAt ? new Date(sessionDetail.finishedAt).toLocaleString() : '-'}
                        </Typography>
                      </Grid>
                      {sessionDetail.startedAt && (sessionDetail.finishedAt || (sessionDetail.answers && sessionDetail.answers.length > 0)) && (
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" color="text.secondary">
                            <HourglassEmptyIcon fontSize="small" sx={{verticalAlign:'middle',mr:0.5}} />
                            <b><Trans>Длительность:</Trans></b> {(() => {
                              const start = sessionDetail.startedAt ? new Date(sessionDetail.startedAt) : null;
                              let end = sessionDetail.finishedAt ? new Date(sessionDetail.finishedAt) : null;
                              if (!end && sessionDetail.answers && sessionDetail.answers.length > 0) {
                                const last = sessionDetail.answers[sessionDetail.answers.length-1];
                                end = last.createdAt ? new Date(last.createdAt) : null;
                              }
                              if (start && end) {
                                const ms = end.getTime() - start.getTime();
                                const min = Math.floor(ms/60000);
                                const sec = Math.floor((ms%60000)/1000);
                                return _(msg`${min} мин ${sec} сек`);
                              }
                              return '-';
                            })()}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>

                    <Divider sx={{ my: 3, borderColor: '#eee' }} />
                    
                    <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                      <Trans>Ответы на вопросы</Trans> ({sessionDetail.answers?.length || 0})
                    </Typography>
                    
                    {/* Accordion для длинных списков */}
                    {sessionDetail.answers && sessionDetail.answers.length > 0 ? sessionDetail.answers.map((a:any, idx:number) => (
                      <Accordion key={a.id} defaultExpanded={false} sx={{background:'#f5f5f5', color:'#333', mb:2}}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color:'#1976d2'}} />}>
                          <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap" sx={{ width: '100%' }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle2" component="span" sx={{ fontWeight: 600 }}>
                                <Trans>Вопрос {idx+1}:</Trans>
                              </Typography>{' '}
                              <QuestionText text={a.question} variant="body2" sx={{ display: 'inline' }} />
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                              {a.score !== undefined && a.score !== null && (
                                <Chip
                                  label={_(msg`Оценка`) + ': ' + a.score}
                                  color={a.score >= 8 ? 'success' : a.score >= 5 ? 'warning' : 'error'}
                                  size="small"
                                />
                              )}
                              {a.hasRedFlag && (
                                <Tooltip title={_(msg`Критический вопрос - ответ не соответствует требованиям`)} arrow>
                                  <span style={{fontSize: 20}}>🚩</span>
                                </Tooltip>
                              )}
                            </Box>
                          </Stack>
                        </AccordionSummary>
                        <AccordionDetails>
                          {/* Прикреплённые к вопросу файлы */}
                          {a.questionAttachments && a.questionAttachments.length > 0 && (
                            <Box sx={{ mb: 2, p: 2, bgcolor: '#f0f7ff', borderRadius: 1, border: '1px solid #90caf9' }}>
                              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#1976d2' }}>
                                📎 <Trans>Материалы к вопросу</Trans>
                              </Typography>
                              <QuestionAttachmentsDisplay attachments={a.questionAttachments} />
                            </Box>
                          )}
                          <Typography variant="body2" sx={{mb:1}}><b><Trans>Ответ:</Trans></b> {a.text ? a.text : <i style={{color:'#888'}}><Trans>Нет ответа</Trans></i>}</Typography>
                          <Typography variant="body2" sx={{mb:1}}><b><Trans>Оценка:</Trans></b> {a.score !== undefined && a.score !== null ? a.score : <i style={{color:'#888'}}><Trans>нет</Trans></i>}</Typography>
                          {a.aiComment && (
                            <Typography variant="body2" sx={{mb:1}}><Trans><b>Характеристика:</b> {a.aiComment}</Trans></Typography>
                          )}
                          {/* Метрики печати для текстовых ответов */}
                          {a.typingMetrics && (
                            <Accordion sx={{mt:2, boxShadow:'none', border:'1px solid #e0e0e0'}}>
                              <AccordionSummary expandIcon={<IconChevronDown />}>
                                <Typography variant="subtitle2" sx={{fontWeight:600}}>
                                  📊 <Trans>Метрики печати</Trans>
                                </Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                <TypingMetricsDisplay metrics={a.typingMetrics} finalText={a.text || ''} />
                              </AccordionDetails>
                            </Accordion>
                          )}
                          {a.audio && (
                            <Box mb={1} display="flex" alignItems="center" gap={1}>
                              <IconMicrophone size={18} style={{verticalAlign:'middle'}} />
                              <Button component={Link} href={`${API_BASE}/uploads/${a.audio}`} target="_blank" rel="noopener" size="small" color="primary" startIcon={<IconMicrophone />}><Trans>Аудио</Trans></Button>
                            </Box>
                          )}
                          {a.video && (
                            <Box mb={1} display="flex" alignItems="center" gap={1}>
                              <IconVideo size={18} style={{verticalAlign:'middle'}} />
                              <Button component={Link} href={`${API_BASE}/uploads/${a.video}`} target="_blank" rel="noopener" size="small" color="primary" startIcon={<IconVideo />}><Trans>Видео</Trans></Button>
                            </Box>
                          )}
                          <Typography variant="caption" sx={{opacity:0.7}}><Trans>Время ответа: {a.createdAt || '-'}</Trans></Typography>
                        </AccordionDetails>
                      </Accordion>
                    )) : (
                      <Typography color="text.secondary"><Trans>Нет ответов</Trans></Typography>
                    )}
                  </CardContent>
                </Card>
              </Box>
            )}
          </TabPanel>
          {/* Tab: Резюме */}
          <TabPanel value="resume" sx={{p:0}}>
            <Card sx={{ background: '#fff', color: 'text.primary', position: 'relative', overflow: 'hidden', mb:3 }}>
              <CardContent sx={{ p: 4 }}>
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                  <IconFileDescription size={32} color="#1976d2" />
                  <Typography variant="h6" fontWeight="700"><Trans>Резюме кандидата</Trans></Typography>
                </Stack>

                {resumeLoading && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress />
                    <Typography variant="body2" sx={{ mt: 2, opacity: 0.7 }}><Trans>Загрузка резюме...</Trans></Typography>
                  </Box>
                )}

                {resumeData && !resumeLoading && (
                  <>
                    {/* Информация о резюме */}
                    <Stack direction="row" spacing={2} mb={2} flexWrap="wrap" alignItems="center">
                      {resumeData.source && (
                        <Chip
                          label={_(msg`Источник`) + ': ' + (resumeData.source === 'headhunter' ? 'HeadHunter.ru' : resumeData.source)}
                          color="primary"
                          size="small"
                        />
                      )}
                      {resumeData.hasResume && (
                        <Chip
                          label={_(msg`Резюме доступно`)}
                          color="success"
                          size="small"
                          icon={<CheckCircleIcon />}
                        />
                      )}
                      {!resumeData.hasResume && resumeData.canLoadFromHh && (
                        <Chip
                          label={_(msg`Можно загрузить из HH`)}
                          color="info"
                          size="small"
                        />
                      )}
                    </Stack>

                    {resumeData?.hasResume && !isEditingResume ? (
                      <>
                        <Box sx={{
                          bgcolor: 'grey.50',
                          p: 3,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'grey.200',
                          mt: 2,
                          maxHeight: '70vh',
                          overflow: 'auto'
                        }}>
                          <Typography
                            component="div"
                            variant="body1"
                            sx={{
                              lineHeight: 1.8,
                              '& p': { margin: '8px 0' },
                              '& ul, & ol': { paddingLeft: '20px', margin: '8px 0' },
                              '& li': { marginBottom: '4px' }
                            }}
                            dangerouslySetInnerHTML={{ __html: resumeText }}
                          />
                        </Box>
                        <Button
                          variant="outlined"
                          color="primary"
                          sx={{ mt: 2 }}
                          onClick={() => setIsEditingResume(true)}
                        >
                          <Trans>Редактировать резюме</Trans>
                        </Button>
                      </>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <IconFileDescription size={48} color="#ccc" style={{ marginBottom: 16 }} />
                        <Typography variant="body1" color="text.secondary" gutterBottom><Trans>Резюме отсутствует в базе</Trans></Typography>

                        {resumeData.canLoadFromHh && (
                          <Button
                            variant="contained"
                            color="primary"
                            sx={{ mt: 2 }}
                            onClick={async () => {
                              setResumeLoading(true);
                              try {
                                const response = await apiFetch(`${API_BASE}/api/admin/candidates/${id}/resume/load-from-hh`, {
                                  method: 'POST',
                                });
                                const data = await response.json();

                                if (data.success) {
                                  setResumeText(data.resumeText);
                                  setResumeData({
                                    ...resumeData,
                                    resumeText: data.resumeText,
                                    hasResume: true,
                                  });
                                  setCopyMsg(data.message || _(msg`Резюме загружено из HeadHunter.ru`));
                                } else {
                                  // Backend: {error: 'candidate.hh_resume_not_found'}, {error: 'hh.api_error'}
                                  const errorMessage = data.error ? i18n._(getErrorMessage(data.error)) : _(msg`Ошибка при загрузке резюме`);
                                  setCopyMsg(errorMessage);
                                }
                              } catch (error: any) {
                                console.error('Error loading resume from HH:', error);
                                setCopyMsg(_(msg`Ошибка при загрузке резюме из HeadHunter.ru`));
                              } finally {
                                setResumeLoading(false);
                              }
                            }}
                          >
                            <Trans>Загрузить из HeadHunter.ru</Trans>
                          </Button>
                        )}

                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                            {isEditingResume ? _(msg`Редактирование резюме`) : _(msg`Добавьте текст резюме`)}
                          </Typography>
                          <RichTextEditor
                            value={resumeText || ''}
                            onChange={(value: string) => setResumeText(value)}
                            placeholder={_(msg`Вставьте или введите текст резюме кандидата...`)}
                          />
                          <Stack direction="row" spacing={2}>
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={async () => {
                                if (!resumeText || resumeText.trim() === '') {
                                  setCopyMsg(_(msg`Введите текст резюме`));
                                  return;
                                }

                                setResumeLoading(true);
                                try {
                                  const response = await apiFetch(`${API_BASE}/api/admin/candidates/${id}/resume`, {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                      resumeText: resumeText,
                                      source: 'manual',
                                    }),
                                  });

                                  const data = await response.json();

                                  if (response.ok) {
                                    setResumeData({
                                      ...resumeData,
                                      resumeText: resumeText,
                                      hasResume: true,
                                      source: 'manual',
                                    });
                                    setIsEditingResume(false);
                                    setCopyMsg(_(msg`Резюме успешно сохранено`));
                                  } else {
                                    // Backend: {error: 'candidate.not_found'}, {error: 'candidate.resume_save_failed'}
                                    const errorMessage = data.error ? i18n._(getErrorMessage(data.error)) : _(msg`Ошибка при сохранении резюме`);
                                    setCopyMsg(errorMessage);
                                  }
                                } catch (error: any) {
                                  console.error('Error saving resume:', error);
                                  setCopyMsg(_(msg`Ошибка при сохранении резюме`));
                                } finally {
                                  setResumeLoading(false);
                                }
                              }}
                            >
                              <Trans>Сохранить резюме</Trans>
                            </Button>
                            {isEditingResume && (
                              <Button
                                variant="outlined"
                                color="secondary"
                                onClick={() => {
                                  setIsEditingResume(false);
                                  // Восстанавливаем оригинальный текст
                                  if (resumeData?.resumeText) {
                                    setResumeText(resumeData.resumeText);
                                  }
                                }}
                              >
                                <Trans>Отмена</Trans>
                              </Button>
                            )}
                          </Stack>
                          <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                            <Trans>Вставьте текст резюме и нажмите "Сохранить"</Trans>
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabPanel>
          {/* Tab: Комментарии */}
          <TabPanel value="comments" sx={{p:0}}>
            <Card sx={{ background: '#fff', color: 'text.primary', position: 'relative', overflow: 'hidden', mb:3 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{mb:1}}><Trans>Заметки HR</Trans></Typography>
                <textarea
                  value={hrNote}
                  onChange={e=>setHrNote(e.target.value)}
                  rows={6}
                  style={{width:'100%',borderRadius:8,padding:8,fontSize:16,marginBottom:8,border:'1px solid #eee'}}
                  placeholder={_(msg`Введите заметку или комментарий...`)}
                />
                <Stack direction="row" spacing={2} alignItems="center">
                  <Button variant="contained" color="primary" onClick={saveNote}><Trans>Сохранить заметку</Trans></Button>
                  {copyMsg && <Typography color="success.main"><Trans>Сохранено!</Trans></Typography>}
                </Stack>
                <Typography variant="body2" sx={{opacity:0.7}}><Trans>Заметка хранится только локально в браузере (MVP).</Trans></Typography>
              </CardContent>
            </Card>
          </TabPanel>
          {/* Tab: Коммуникации */}
          <TabPanel value="communications" sx={{p:0}}>
            <Card sx={{ background: '#fff', color: 'text.primary', position: 'relative', overflow: 'hidden', mb:3 }}>
              <CardContent sx={{ p: 4 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <MailOutlineIcon sx={{ fontSize: 32, color: '#1976d2' }} />
                    <Typography variant="h6" fontWeight="700"><Trans>История коммуникаций</Trans></Typography>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    {statusData?.hhCandidateId && (
                      <Tooltip title={_(msg`Отправить приглашение на интервью в HH.ru`)}>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={handleSendHhInvitation}
                          disabled={sendingHhInvitation}
                          startIcon={
                            sendingHhInvitation
                              ? <CircularProgress size={16} />
                              : <MailOutlineIcon />
                          }
                        >
                          {sendingHhInvitation ? <Trans>Отправка...</Trans> : <Trans>📤 Отправить приглашение</Trans>}
                        </Button>
                      </Tooltip>
                    )}
                    {hasHhNegotiation && (
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={syncHhMessages}
                        disabled={syncingMessages}
                        startIcon={syncingMessages ? <CircularProgress size={16} /> : <MailOutlineIcon />}
                      >
                        {syncingMessages ? <Trans>Загрузка...</Trans> : <Trans>🔄 Загрузить из HH</Trans>}
                      </Button>
                    )}
                  </Stack>
                </Stack>
                
                {communicationsLoading ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : communications.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      <Trans>Пока нет коммуникаций с кандидатом</Trans>
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={2}>
                    {communications.map((comm) => {
                      const isOutgoing = comm.direction === 'outgoing';
                      const sourceIcon = comm.source === 'hh' ? '💬' : '✉️';
                      const directionText = isOutgoing ? 'SofiHR → HH.ru' : 'HH.ru';
                      
                      return (
                        <Card 
                          key={comm.id} 
                          variant="outlined"
                          sx={{ 
                            borderLeft: isOutgoing ? '4px solid #1976d2' : '4px solid #f57c00',
                            bgcolor: isOutgoing ? 'rgba(25, 118, 210, 0.02)' : 'rgba(245, 124, 0, 0.02)'
                          }}
                        >
                          <CardContent sx={{ p: 2 }}>
                            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography variant="body2" fontWeight={600} color="text.primary">
                                  {sourceIcon} {directionText}
                                </Typography>
                                {comm.sentBy && (
                                  <Chip 
                                    label={comm.sentBy.name} 
                                    size="small" 
                                    sx={{ height: 20, fontSize: 11 }}
                                  />
                                )}
                              </Stack>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(comm.createdAt).toLocaleString('ru-RU', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </Typography>
                            </Stack>
                            
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>
                              {comm.message}
                            </Typography>
                            
                            {comm.metadata?.interview_link && (
                              <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                  <Trans>🔗 Ссылка на интервью отправлена</Trans>
                                </Typography>
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </TabPanel>
          
          {/* Tab: История действий (только для HH кандидатов) */}
          <TabPanel value="automation" sx={{p:0}}>
            <Card sx={{ background: '#fff', color: 'text.primary', position: 'relative', overflow: 'hidden', mb:3 }}>
              <CardContent sx={{ p: 4 }}>
                <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                  <IconRobot size={32} color="#1976d2" />
                  <Typography variant="h6" fontWeight="700"><Trans>История действий с кандидатом</Trans></Typography>
                </Stack>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  <Trans>Все автоматические и ручные действия, совершённые с этим кандидатом</Trans>
                </Typography>
                
                {statusData?.id && <CandidateEventsTimeline candidateId={statusData.id} />}
              </CardContent>
            </Card>
          </TabPanel>

          {/* Tab: Отзыв кандидата */}
          <TabPanel value="feedback" sx={{p:0}}>
            <Card sx={{ background: '#fff', color: 'text.primary', position: 'relative', overflow: 'hidden', mb:3 }}>
              <CardContent sx={{ p: 4 }}>
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                  <FeedbackIcon sx={{ fontSize: 32, color: '#1976d2' }} />
                  <Typography variant="h6" fontWeight="700"><Trans>Обратная связь, полученная кандидатом</Trans></Typography>
                </Stack>
                {statusData?.candidateFeedback ? (
                  <>
                    {(() => {
                      try {
                        const feedback = JSON.parse(statusData.candidateFeedback);
                        return (
                          <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom><Trans>Это та же обратная связь, которую видит кандидат после интервью</Trans></Typography>

                            {feedback.average_score > 0 && (
                              <Box sx={{ textAlign: 'center', mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                <Typography variant="h6" gutterBottom>
                                  <Trans>Общая оценка: {feedback.average_score}/10</Trans>
                                </Typography>
                                <Rating value={feedback.average_score / 2} readOnly />
                              </Box>
                            )}

                            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}><Trans>📝 Краткий итог</Trans></Typography>
                            <Typography paragraph sx={{ fontStyle: 'italic', bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                              {feedback.summary}
                            </Typography>

                            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}><Trans>💡 Развивающая обратная связь</Trans></Typography>
                            <Typography paragraph sx={{ fontStyle: 'italic', bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                              {feedback.feedback}
                            </Typography>

                            {feedback.strengths && feedback.strengths.length > 0 && (
                              <>
                                <Typography variant="h6" gutterBottom sx={{ mt: 3 }} color="success.main"><Trans>✅ Сильные стороны (по мнению AI)</Trans></Typography>
                                <Stack spacing={1}>
                                  {feedback.strengths.map((strength: string, index: number) => (
                                    <Chip key={index} label={strength} color="success" variant="outlined" />
                                  ))}
                                </Stack>
                              </>
                            )}

                            {feedback.weaknesses && feedback.weaknesses.length > 0 && (
                              <>
                                <Typography variant="h6" gutterBottom sx={{ mt: 3 }} color="warning.main"><Trans>🎯 Области для развития (по мнению AI)</Trans></Typography>
                                <Stack spacing={1}>
                                  {feedback.weaknesses.map((weakness: string, index: number) => (
                                    <Chip key={index} label={weakness} color="warning" variant="outlined" />
                                  ))}
                                </Stack>
                              </>
                            )}

                            <Divider sx={{ my: 3 }} />

                            <Typography variant="caption" color="text.secondary" align="center" display="block">
                              {feedback.disclaimer}
                            </Typography>
                          </Box>
                        );
                      } catch (e) {
                        return (
                          <Typography color="error"><Trans>Ошибка при отображении обратной связи</Trans></Typography>
                        );
                      }
                    })()}
                  </>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <FeedbackIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary" gutterBottom><Trans>Кандидат еще не запросил обратную связь</Trans></Typography>
                    <Typography variant="body2" color="text.secondary"><Trans>Обратная связь появится после того, как кандидат нажмет соответствующую кнопку на странице результатов</Trans></Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </TabPanel>

          {/* Tab: Мнение кандидата */}
          <TabPanel value="opinion" sx={{p:0}}>
            <Card sx={{ background: '#fff', color: 'text.primary', position: 'relative', overflow: 'hidden', mb:3 }}>
              <CardContent sx={{ p: 4 }}>
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                  <IconMoodHappy size={32} color="#1976d2" />
                  <Typography variant="h6" fontWeight="700"><Trans>Мнение кандидата о своей оценке</Trans></Typography>
                </Stack>
                {statusData?.candidateOpinion ? (
                  <Box sx={{
                    bgcolor: 'grey.50',
                    p: 3,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'grey.200',
                    mt: 2
                  }}>
                    <Typography variant="body1" sx={{
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.6,
                      fontStyle: 'italic'
                    }}>
                      "{statusData.candidateOpinion}"
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}><Trans>💭 Мнение кандидата о результатах интервью</Trans></Typography>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <IconMoodHappy size={48} color="#ccc" style={{ marginBottom: 16 }} />
                    <Typography variant="body1" color="text.secondary" gutterBottom><Trans>Кандидат еще не оставил свое мнение о результатах</Trans></Typography>
                    <Typography variant="body2" color="text.secondary"><Trans>Мнение появится после того, как кандидат получит обратную связь</Trans></Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </TabPanel>
        </TabContext>
        {/* Попап сравнения кандидатов */}
        <Dialog open={compareOpen} onClose={()=>setCompareOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle><Trans>Сравнить с другими кандидатами</Trans></DialogTitle>
          <DialogContent sx={{ pt: '16px !important' }}>
            <Typography variant="body2" sx={{mb:2}}><Trans>Выберите кандидатов для сравнения (минимум 1):</Trans></Typography>
            <Stack spacing={1}>
              {Array.isArray(allCandidates) && allCandidates.filter(c=>c.id!==candId).map(c=>(
                <FormControlLabel
                  key={c.id}
                  control={<Checkbox checked={selectedCompare.includes(c.id)} onChange={e=>{
                    setSelectedCompare(e.target.checked ? [...selectedCompare, c.id] : selectedCompare.filter(id=>id!==c.id));
                  }} />}
                  label={c.name}
                />
              ))}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={()=>setCompareOpen(false)}><Trans>Отмена</Trans></Button>
            <Button variant="contained" color="primary" disabled={selectedCompare.length===0} onClick={()=>{
              setCompareOpen(false);
              const allIds = [candId, ...selectedCompare];
              router.push(`/hr/candidates/compare?ids=${allIds.join(',')}`);
            }}><Trans>Сравнить</Trans></Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          open={!!copyMsg}
          autoHideDuration={2000}
          onClose={()=>setCopyMsg(null)}
          message={copyMsg}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        />
      </Stack>
    </PageContainer>
  );
}
