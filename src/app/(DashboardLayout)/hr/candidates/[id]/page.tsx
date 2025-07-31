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
import { IconUsers, IconMail, IconPhone, IconArrowLeft, IconLink, IconCheck, IconClock, IconEdit, IconCopy, IconEye, IconArrowsDiff } from "@tabler/icons-react";
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

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

function getStatusLabel(status: string) {
  switch (status) {
    case "completed":
    case "finished":
      return "Завершено";
    case "in_progress":
      return "В процессе";
    case "pending":
      return "Ожидает";
    case "ready":
      return "Готов к интервью";
    case "failed":
      return "Ошибка";
    case "canceled":
      return "Отменено";
    case "new":
      return "Новый";
    case "rejected":
      return "Отклонён";
    case "active":
      return "Активен";
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
  const saveNote = () => {
    if (id) localStorage.setItem(`hr_note_${id}`, hrNote);
  };
  // PDF экспорт
  // Удалить функцию exportPDF

  useEffect(() => {
    if (!token) return;
    // Получаем всех кандидатов для сравнения
    apiFetch(`${API_BASE}/api/admin/candidates`).then(r=>r.json()).then(data => {
      // Проверяем что data это массив
      if (Array.isArray(data)) {
        setAllCandidates(data);
      } else if (data && Array.isArray(data.items)) {
        // Если API возвращает объект с полем items
        setAllCandidates(data.items);
      } else {
        // Если что-то пошло не так, устанавливаем пустой массив
        setAllCandidates([]);
      }
    }).catch(() => {
      // В случае ошибки устанавливаем пустой массив
      setAllCandidates([]);
    });
  }, [token]);

  if (!token)
    return (
      <PageContainer title="Кандидат">
        <Box sx={{ p: 4 }}>
          <Typography>Нет доступа</Typography>
        </Box>
      </PageContainer>
    );
  if (loading || !statusData)
    return (
      <PageContainer title="Кандидат">
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
      setCopyMsg('Ссылка скопирована!');
    }
  };
  const shareInterviewUrl = async () => {
    if (navigator.share && interviewUrl) {
      await navigator.share({ title: 'Интервью', url: interviewUrl });
    } else {
      copyInterviewUrl();
    }
  };

  return (
    <PageContainer title={`Кандидат: ${candidate}`}> 
      <Stack spacing={3}>
        {/* Breadcrumbs */}
        <Breadcrumbs aria-label="breadcrumb">
          <Link href="/hr/vacancies" style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 500 }}>Вакансии</Link>
          {sessionDetail?.vacancy ? (
            <Link href={`/hr/vacancies/${sessionDetail.vacancy.id}`} style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 500 }}>
              {sessionDetail.vacancy.title}
            </Link>
          ) : (
            <Typography color="text.primary">Вакансия</Typography>
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
                <Tooltip title="Скопировать ссылку на интервью">
                  <IconButton color="primary" onClick={copyInterviewUrl}><ContentCopyIcon /></IconButton>
                </Tooltip>
                <Tooltip title="Открыть интервью">
                  <Link href={interviewLink || '#'} target="_blank" rel="noopener" passHref legacyBehavior>
                    <Button variant="contained" color="primary" size="small" component="a">Интервью</Button>
                  </Link>
                </Tooltip>
              </Stack>
            </Stack>
            <Divider sx={{ my: 2, borderColor: '#eee' }} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
              <Tooltip title="Назад к вакансии">
                <Button variant="outlined" color="primary" startIcon={<IconArrowLeft size={20}/>} onClick={()=>router.push(sessionDetail?.vacancy?.id ? `/hr/vacancies/${sessionDetail.vacancy.id}` : '/hr/vacancies')}>
                  Назад
                </Button>
              </Tooltip>
              <Tooltip title="Сравнить с другими">
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
              <Tab icon={<AssignmentTurnedInIcon />} iconPosition="start" label="Результаты" value="results" />
              <Tab icon={<CommentIcon />} iconPosition="start" label="Комментарии" value="comments" />
              <Tab icon={<MailOutlineIcon />} iconPosition="start" label="Письма" value="letters" />
              <Tab icon={<FeedbackIcon />} iconPosition="start" label="Отзыв" value="feedback" />
            </Tabs>
          </Box>
          <TabPanel value="results" sx={{p:0}}>
            {/* Детальная информация по сессии интервью */}
            {sessionDetail && (
              <Card sx={{ background: '#fff', color: 'text.primary', position: 'relative', overflow: 'hidden', mb:3 }}>
                <CardContent sx={{ position: 'relative', zIndex: 1, p: 4 }}>
                  <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                    <IconFileText size={32} color="#1976d2" />
                    <Typography variant="h4" fontWeight="700">Детали интервью-сессии</Typography>
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
                      <Typography variant="body2"><b>Шаблон:</b> {sessionDetail.template?.title || '-'}{sessionDetail.template?.id && (<Button component={Link} href={`/hr-tests/${sessionDetail.template.id}`} size="small" color="primary" sx={{ml:1}}>Открыть</Button>)}</Typography>
                    </Grid>
                    {sessionDetail.vacancy && (
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2"><b>Вакансия:</b> {sessionDetail.vacancy.title}{sessionDetail.vacancy.id && (<Button component={Link} href={`/hr/vacancies/${sessionDetail.vacancy.id}`} size="small" color="primary" sx={{ml:1}}>Открыть</Button>)}</Typography>
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
                            return `${min} мин ${sec} сек`;
                          }
                          return '-';
                        })()}</Typography>
                      </Grid>
                    )}
                  </Grid>
                  <Divider sx={{ my: 2, borderColor: '#eee' }} />
                  <Typography variant="h5" fontWeight="700" sx={{ mb: 2 }}>Ответы на вопросы</Typography>
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
                    <Typography color="text.secondary">Нет ответов</Typography>
                  )}
                  {sessionDetail.result && (
                    <Box mt={3}>
                      <Typography variant="h5" fontWeight="700" sx={{ mb: 2 }}>Итог интервью</Typography>
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
                    <Typography variant="h5" fontWeight="700">AI-оценка кандидата</Typography>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Chip label={aiStatus || 'нет данных'} color={aiStatus==='done'?'success':aiStatus==='pending'?'warning':'default'} size="small" />
                      {aiUpdatedAt && <Typography variant="caption" sx={{ opacity: 0.8 }}>Обновлено: {aiUpdatedAt}</Typography>}
                    </Stack>
                    {aiSummary && <Typography variant="body1" sx={{ mb: 1 }}><b>Резюме:</b> {aiSummary}</Typography>}
                    {aiStrengths && Array.isArray(aiStrengths) && aiStrengths.length > 0 && (
                      <Box mb={1}>
                        <Typography variant="subtitle2">Сильные стороны:</Typography>
                        <Stack component="ul" spacing={0.5} sx={{pl:2}}>
                          {aiStrengths.map((s:string,i:number)=>(<li key={i}><CheckCircleIcon color="success" fontSize="small" sx={{mr:0.5,verticalAlign:'middle'}} />{s}</li>))}
                        </Stack>
                      </Box>
                    )}
                    {aiWeaknesses && Array.isArray(aiWeaknesses) && aiWeaknesses.length > 0 && (
                      <Box mb={1}>
                        <Typography variant="subtitle2">Слабые стороны:</Typography>
                        <Stack component="ul" spacing={0.5} sx={{pl:2}}>
                          {aiWeaknesses.map((s:string,i:number)=>(<li key={i}><HourglassEmptyIcon color="warning" fontSize="small" sx={{mr:0.5,verticalAlign:'middle'}} />{s}</li>))}
                        </Stack>
                      </Box>
                    )}
                    {aiMetrics && (
                      <Box mb={1}>
                        <Typography variant="subtitle2">Метрики:</Typography>
                        <pre style={{background:'#f5f5f5',padding:8,borderRadius:4}}>{JSON.stringify(aiMetrics,null,2)}</pre>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            )}
          </TabPanel>
          {/* Tab: Комментарии */}
          <TabPanel value="comments" sx={{p:0}}>
            <Card sx={{ background: '#fff', color: 'text.primary', position: 'relative', overflow: 'hidden', mb:3 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{mb:1}}>Заметки HR</Typography>
                <textarea
                  value={hrNote}
                  onChange={e=>setHrNote(e.target.value)}
                  rows={6}
                  style={{width:'100%',borderRadius:8,padding:8,fontSize:16,marginBottom:8,border:'1px solid #eee'}}
                  placeholder="Введите заметку или комментарий..."
                />
                <Stack direction="row" spacing={2} alignItems="center">
                  <Button variant="contained" color="primary" onClick={saveNote}>Сохранить заметку</Button>
                  {copyMsg && <Typography color="success.main">Сохранено!</Typography>}
                </Stack>
                <Typography variant="body2" sx={{opacity:0.7}}>Заметка хранится только локально в браузере (MVP).</Typography>
              </CardContent>
            </Card>
          </TabPanel>
          {/* Tab: Письма */}
          <TabPanel value="letters" sx={{p:0}}>
            <Card sx={{ background: '#fff', color: 'text.primary', position: 'relative', overflow: 'hidden', mb:3 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{mb:1}}>Письма кандидату</Typography>
                <Typography variant="body2" sx={{opacity:0.7}}>Здесь появится история писем и уведомлений кандидату (в будущем).</Typography>
              </CardContent>
            </Card>
          </TabPanel>
          {/* Tab: Отзыв кандидата */}
          <TabPanel value="feedback" sx={{p:0}}>
            <Card sx={{ background: '#fff', color: 'text.primary', position: 'relative', overflow: 'hidden', mb:3 }}>
              <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{mb:1}}>Отзыв кандидата</Typography>
                  <Typography variant="body2" sx={{opacity:0.7}}>Здесь появится обратная связь от кандидата (в будущем).</Typography>
              </CardContent>
            </Card>
          </TabPanel>
        </TabContext>
        {/* Попап сравнения кандидатов */}
        <Dialog open={compareOpen} onClose={()=>setCompareOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Сравнить с другими кандидатами</DialogTitle>
          <DialogContent sx={{ pt: '16px !important' }}>
            <Typography variant="body2" sx={{mb:2}}>Выберите кандидатов для сравнения (минимум 1):</Typography>
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
              // Реализовать переход на сравнение или показать сравнение в попапе
              // Например, router.push(`/hr/candidates/compare?ids=${candId},${selectedCompare.join(',')}`)
            }}>Сравнить</Button>
          </DialogActions>
        </Dialog>
        <Snackbar open={!!copyMsg} autoHideDuration={2000} onClose={()=>setCopyMsg(null)} message={copyMsg} />
      </Stack>
    </PageContainer>
  );
} 