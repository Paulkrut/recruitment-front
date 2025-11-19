"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
} from "@mui/material";
import { IconUsers, IconMail, IconPhone, IconArrowLeft, IconLink, IconCheck, IconClock, IconEdit, IconCopy, IconEye, IconArrowsDiff, IconMoodHappy, IconFileDescription } from "@tabler/icons-react";
import PageContainer from "@/app/components/container/PageContainer";
import { apiFetch } from "@/utils/api";
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
import { msg } from '@lingui/macro';


const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

function getStatusLabel(status: string) {
  const { _ } = useLingui();

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

export default function CandidateDetailPage() {
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
  const [compareOpen, setCompareOpen] = useState(false);
  const [allCandidates, setAllCandidates] = useState<any[]>([]);
  const [selectedCompare, setSelectedCompare] = useState<number[]>([]);
  const [resumeText, setResumeText] = useState<string | null>(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeData, setResumeData] = useState<any>(null);

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
          setResumeData({ error: 'Ошибка при загрузке' });
        })
        .finally(() => setResumeLoading(false));
    }
  }, [tab, resumeData, resumeLoading, token, id]);
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
      await navigator.share({ title: 'Интервью', url: interviewUrl });
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
      
      await exportCandidateToPDFWithFont(pdfData);
    } catch (error) {
      console.error('Ошибка при экспорте PDF:', error);
      setCopyMsg(_(msg`Ошибка при создании PDF`));
    }
  };

  return (
    <PageContainer title={`Кандидат: ${candidate}`}> 
      <Stack spacing={3}>
        {/* Breadcrumbs */}
        <Breadcrumbs aria-label="breadcrumb">
          <Link href="/hr/vacancies" style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 500 }}>Вакансии</Link>
          {statusData?.vacancyId ? (
            <Link href={`/hr/vacancies/${statusData.vacancyId}`} style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 500 }}>
              {sessionDetail?.vacancy?.title || statusData.vacancyTitle || 'Вакансия'}
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
                  {candidateStatus && <Chip label={getStatusLabel(candidateStatus)} color={candidateStatus==='active'?'success':candidateStatus==='rejected'?'error':'default'} size="medium" icon={<CheckCircleIcon color={candidateStatus==='active'?'success':'disabled'} />} />}
                  {sessionDetail?.status && <Chip label={getStatusLabel(sessionDetail.status)} color={sessionDetail.status==='completed'?'success':sessionDetail.status==='in_progress'?'warning':'default'} size="medium" icon={sessionDetail.status==='completed'?<CheckCircleIcon color="success" />:<HourglassEmptyIcon color="warning" />} />}
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
                  <Typography variant="body2" color="text.secondary">Телефон: {candidatePhone || '-'}</Typography>
                  <Typography variant="body2" color="text.secondary">Вопросов: {sessionDetail?.answers?.length || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">Оценка: {sessionDetail?.result?.totalScore !== undefined ? sessionDetail.result.totalScore : '-'}</Typography>
                  <Typography variant="body2" color="text.secondary">Создано: {createdAt || '-'}</Typography>
                  <Typography variant="body2" color="text.secondary">Завершено: {sessionDetail?.finishedAt || '-'}</Typography>
                </Stack>
              </Box>
              <Stack direction="row" spacing={1}>
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
                  Назад
                </Button>
              </Tooltip>
              <Tooltip title={_(msg`Сравнить с другими`)}>
                <Button variant="outlined" color="primary" startIcon={<IconArrowsDiff size={20}/>} onClick={()=>setCompareOpen(true)}>
                  Сравнить
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
              <Tab icon={<MailOutlineIcon />} iconPosition="start" label={_(msg`Письма`)} value="letters" />
              <Tab icon={<FeedbackIcon />} iconPosition="start" label={_(msg`Отзыв`)} value="feedback" />
              <Tab icon={<IconMoodHappy />} iconPosition="start" label={_(msg`Мнение кандидата`)} value="opinion" />
            </Tabs>
          </Box>
          <TabPanel value="results" sx={{p:0}}>
            {/* Детальная информация по сессии интервью */}
            {sessionDetail && (
              <Card sx={{ background: '#fff', color: 'text.primary', position: 'relative', overflow: 'hidden', mb:3 }}>
                <CardContent sx={{ position: 'relative', zIndex: 1, p: 4 }}>
                  <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                    <IconFileText size={32} color="#1976d2" />
                    <Typography variant="h4" fontWeight="700"><Trans>Детали интервью-сессии</Trans></Typography>
                    <Chip label={getStatusLabel(sessionDetail.status)} color={sessionDetail.status==='completed'?'success':sessionDetail.status==='in_progress'?'warning':'default'} size="medium" />
                  </Stack>
                  <Grid container spacing={2} mb={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="body2"><b>Начата:</b> <HourglassEmptyIcon fontSize="small" sx={{verticalAlign:'middle',mr:0.5}} /> {sessionDetail.startedAt || '-'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="body2"><b>Завершена:</b> <CheckCircleIcon fontSize="small" sx={{verticalAlign:'middle',mr:0.5}} /> {sessionDetail.finishedAt || '-'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="body2"><b>Шаблон:</b> {sessionDetail.template?.title || '-'}{sessionDetail.template?.id && (<Button component={Link} href={`/hr-tests/${sessionDetail.template.id}`} size="small" color="primary" sx={{ml:1}}><Trans>Открыть</Trans></Button>)}</Typography>
                    </Grid>
                    {sessionDetail.vacancy && (
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2"><b>Вакансия:</b> {sessionDetail.vacancy.title}{sessionDetail.vacancy.id && (<Button component={Link} href={`/hr/vacancies/${sessionDetail.vacancy.id}`} size="small" color="primary" sx={{ml:1}}><Trans>Открыть</Trans></Button>)}</Typography>
                      </Grid>
                    )}
                    {/* Длительность интервью */}
                    {sessionDetail.startedAt && (sessionDetail.finishedAt || (sessionDetail.answers && sessionDetail.answers.length > 0)) && (
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2"><b>Длительность:</b> <HourglassEmptyIcon fontSize="small" sx={{verticalAlign:'middle',mr:0.5}} /> {(() => {
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
                        })()}</Typography>
                      </Grid>
                    )}
                  </Grid>
                  <Divider sx={{ my: 2, borderColor: '#eee' }} />
                  <Typography variant="h5" fontWeight="700" sx={{ mb: 2 }}><Trans>Ответы на вопросы</Trans></Typography>
                  {/* Accordion для длинных списков */}
                  {sessionDetail.answers && sessionDetail.answers.length > 0 ? sessionDetail.answers.map((a:any, idx:number) => (
                    <Accordion key={a.id} defaultExpanded={idx<3} sx={{background:'#f5f5f5', color:'#333', mb:2}}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color:'#1976d2'}} />}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Typography variant="subtitle1"><b>Вопрос {idx+1}:</b> {a.question}</Typography>
                          {a.score !== undefined && a.score !== null && (
                            <Chip 
                              label={`Оценка: ${a.score}`} 
                              color={a.score >= 8 ? 'success' : a.score >= 5 ? 'warning' : 'error'} 
                              size="small" 
                            />
                          )}
                        </Stack>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" sx={{mb:1}}><b>Ответ:</b> {a.text ? a.text : <i style={{color:'#888'}}>Нет ответа</i>}</Typography>
                        <Typography variant="body2" sx={{mb:1}}><b>Оценка:</b> {a.score !== undefined && a.score !== null ? a.score : <i style={{color:'#888'}}>нет</i>}</Typography>
                        {a.aiComment && (
                          <Typography variant="body2" sx={{mb:1, color:'#ffeb3b'}}><b>AI-характеристика:</b> {a.aiComment}</Typography>
                        )}
                        {a.audio && (
                          <Box mb={1} display="flex" alignItems="center" gap={1}>
                            <IconMicrophone size={18} style={{verticalAlign:'middle'}} />
                            <Button component={Link} href={`${API_BASE}/uploads/${a.audio}`} target="_blank" rel="noopener" size="small" color="primary" startIcon={<IconMicrophone />}>Аудио</Button>
                          </Box>
                        )}
                        {a.video && (
                          <Box mb={1} display="flex" alignItems="center" gap={1}>
                            <IconVideo size={18} style={{verticalAlign:'middle'}} />
                            <Button component={Link} href={`${API_BASE}/uploads/${a.video}`} target="_blank" rel="noopener" size="small" color="primary" startIcon={<IconVideo />}>Видео</Button>
                          </Box>
                        )}
                        <Typography variant="caption" sx={{opacity:0.7}}>Время ответа: {a.createdAt || '-'}</Typography>
                      </AccordionDetails>
                    </Accordion>
                  )) : (
                    <Typography color="text.secondary"><Trans>Нет ответов</Trans></Typography>
                  )}
                  {sessionDetail.result && (
                    <Box mt={3}>
                      <Typography variant="h5" fontWeight="700" sx={{ mb: 2 }}><Trans>Итог интервью</Trans></Typography>
                      <Typography variant="body1" sx={{mb:1}}><b>Суммарная оценка:</b> {sessionDetail.result.totalScore !== undefined && sessionDetail.result.totalScore !== null ? sessionDetail.result.totalScore : <i style={{color:'#888'}}>нет</i>}</Typography>
                      <Typography variant="body2" sx={{mb:1}}><b>Summary:</b> {sessionDetail.result.summary || <i style={{color:'#888'}}>нет</i>}</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}
            {/* AI-оценка */}
            {evalData && (
              <Card sx={{ background: '#fff', color: 'text.primary', position: 'relative', overflow: 'hidden' }}>
                <CardContent sx={{ position: 'relative', zIndex: 1, p: 4 }}>
                  <Stack spacing={2}>
                    <Typography variant="h5" fontWeight="700"><Trans>AI-оценка кандидата</Trans></Typography>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Chip label={aiStatus || 'нет данных'} color={aiStatus==='done'?'success':aiStatus==='pending'?'warning':'default'} size="small" />
                      {aiUpdatedAt && <Typography variant="caption" sx={{ opacity: 0.8 }}>Обновлено: {aiUpdatedAt}</Typography>}
                    </Stack>
                    {aiSummary && <Typography variant="body1" sx={{ mb: 1 }}><b>Резюме:</b> {aiSummary}</Typography>}
                    {aiStrengths && Array.isArray(aiStrengths) && aiStrengths.length > 0 && (
                      <Box mb={1}>
                        <Typography variant="subtitle2"><Trans>Сильные стороны:</Trans></Typography>
                        <Stack component="ul" spacing={0.5} sx={{pl:2}}>
                          {aiStrengths.map((s:string,i:number)=>(<li key={i}><CheckCircleIcon color="success" fontSize="small" sx={{mr:0.5,verticalAlign:'middle'}} />{s}</li>))}
                        </Stack>
                      </Box>
                    )}
                    {aiWeaknesses && Array.isArray(aiWeaknesses) && aiWeaknesses.length > 0 && (
                      <Box mb={1}>
                        <Typography variant="subtitle2"><Trans>Слабые стороны:</Trans></Typography>
                        <Stack component="ul" spacing={0.5} sx={{pl:2}}>
                          {aiWeaknesses.map((s:string,i:number)=>(<li key={i}><HourglassEmptyIcon color="warning" fontSize="small" sx={{mr:0.5,verticalAlign:'middle'}} />{s}</li>))}
                        </Stack>
                      </Box>
                    )}
                    {aiMetrics && (
                      <Box mb={1}>
                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}><Trans>Метрики оценки:</Trans></Typography>
                        <Grid container spacing={2}>
                          {Object.entries(aiMetrics).map(([metric, value]) => {
                            const score = typeof value === 'number' ? value : 0;
                            const getColor = (score: number) => {
                              if (score >= 80) return 'success';
                              if (score >= 60) return 'warning';
                              return 'error';
                            };
                            const getIcon = (metric: string) => {
                              const metricLower = metric.toLowerCase();
                              if (metricLower.includes('communication') || metricLower.includes('общение')) return '💬';
                              if (metricLower.includes('problem') || metricLower.includes('решение')) return '🧩';
                              if (metricLower.includes('leadership') || metricLower.includes('лидерство')) return '👑';
                              if (metricLower.includes('technical') || metricLower.includes('технический')) return '⚙️';
                              if (metricLower.includes('teamwork') || metricLower.includes('команда')) return '🤝';
                              if (metricLower.includes('motivation') || metricLower.includes('мотивация')) return '🚀';
                              if (metricLower.includes('стресс') || metricLower.includes('stress')) return '🛡️';
                              return '📊';
                            };
                            const getLabel = (metric: string) => {
                              const labels: { [key: string]: string } = {
                                'COMMUNICATION': 'Коммуникация',
                                'PROBLEM_SOLVING': 'Решение проблем',
                                'LEADERSHIP': 'Лидерство',
                                'TECHNICAL': 'Технические навыки',
                                'TEAMWORK': 'Работа в команде',
                                'MOTIVATION': 'Мотивация',
                                'Стрессоустойчивость': 'Стрессоустойчивость'
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
                                    {score >= 80 ? 'Отлично' : score >= 60 ? 'Хорошо' : score >= 40 ? 'Средне' : 'Требует улучшения'}
                                  </Typography>
                                </Card>
                              </Grid>
                            );
                          })}
                        </Grid>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
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
                          label={`Источник: ${resumeData.source === 'headhunter' ? 'HeadHunter.ru' : resumeData.source}`} 
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
                    
                    {resumeText ? (
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
                        <Typography variant="body1" sx={{ 
                          whiteSpace: 'pre-wrap',
                          lineHeight: 1.8,
                        }}>
                          {resumeText}
                        </Typography>
                      </Box>
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
                                  setCopyMsg(data.message || 'Резюме загружено из HeadHunter.ru');
                                } else {
                                  setCopyMsg(data.error || 'Ошибка при загрузке резюме');
                                }
                              } catch (error: any) {
                                console.error('Error loading resume from HH:', error);
                                setCopyMsg(_(msg`Ошибка при загрузке резюме из HeadHunter.ru`));
                              } finally {
                                setResumeLoading(false);
                              }
                            }}
                          >
                            Загрузить из HeadHunter.ru
                          </Button>
                        )}
                        
                        {!resumeData.canLoadFromHh && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}><Trans>Для загрузки резюме необходимо добавить его вручную</Trans></Typography>
                        )}
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
          {/* Tab: Письма */}
          <TabPanel value="letters" sx={{p:0}}>
            <Card sx={{ background: '#fff', color: 'text.primary', position: 'relative', overflow: 'hidden', mb:3 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{mb:1}}><Trans>Письма кандидату</Trans></Typography>
                <Typography variant="body2" sx={{opacity:0.7}}><Trans>Здесь появится история писем и уведомлений кандидату (в будущем).</Trans></Typography>
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
                                  Общая оценка: {feedback.average_score}/10
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
          <DialogTitle>Сравнить с другими кандидатами</DialogTitle>
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
            <Button onClick={()=>setCompareOpen(false)}>Отмена</Button>
            <Button variant="contained" color="primary" disabled={selectedCompare.length===0} onClick={()=>{
              setCompareOpen(false);
              const allIds = [candId, ...selectedCompare];
              router.push(`/hr/candidates/compare?ids=${allIds.join(',')}`);
            }}>Сравнить</Button>
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