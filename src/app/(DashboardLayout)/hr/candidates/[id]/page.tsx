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

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

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
      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {/* Информация о кандидате (цветная карточка, всегда сверху) */}
        <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
          <Box sx={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', zIndex: 0 }} />
          <CardContent sx={{ position: 'relative', zIndex: 1, p: 4 }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Box sx={{ p: 2, borderRadius: 2, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
                <IconUsers size={32} color="white" />
              </Box>
              <Box>
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="h4" fontWeight="700" sx={{ mb: 1 }}>{candidate}</Typography>
                  {candidateStatus && <Chip label={candidateStatus} color={candidateStatus==='active'?'success':candidateStatus==='rejected'?'error':'default'} size="medium" />}
                  {sessionDetail?.status && <Chip label={sessionDetail.status==='completed'?'Завершено':'В процессе'} color={sessionDetail.status==='completed'?'success':'warning'} size="medium" />}
                </Box>
                <Box display="flex" gap={2} mt={1} flexWrap="wrap">
                  <Typography variant="body2">Email: {candidateEmail || '-'}</Typography>
                  <Typography variant="body2">Телефон: {candidatePhone || '-'}</Typography>
                  <Typography variant="body2">Вопросов: {sessionDetail?.answers?.length || 0}</Typography>
                  <Typography variant="body2">Оценка: {sessionDetail?.result?.totalScore !== undefined ? sessionDetail.result.totalScore : '-'}</Typography>
                  <Typography variant="body2">Создано: {createdAt || '-'}</Typography>
                  <Typography variant="body2">Завершено: {sessionDetail?.finishedAt || '-'}</Typography>
                </Box>
              </Box>
            </Box>
            <Grid container spacing={2} mb={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Box display="flex" alignItems="center" gap={1}>
                  <IconLink size={18} color="white" />
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Токен: {candidateToken}</Typography>
                  <Tooltip title="Скопировать токен">
                    <IconButton size="small" onClick={()=>{navigator.clipboard.writeText(candidateToken); setCopyMsg('Токен скопирован!');}}><IconCopy size={16} color="white" /></IconButton>
                  </Tooltip>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Box display="flex" alignItems="center" gap={1}>
                  <IconEye size={18} color="white" />
                  <Button variant="outlined" color="inherit" size="small" sx={{color:'white',borderColor:'white'}} onClick={()=>{if(interviewLink) window.open(interviewLink, '_blank')}}>Интервью</Button>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Box display="flex" alignItems="center" gap={1}>
                  <IconCheck size={18} color="white" />
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>ID: {candId}</Typography>
                </Box>
              </Grid>
            </Grid>
            <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.3)' }} />
            <Box display="flex" gap={2} flexWrap="wrap">
              <Button variant="outlined" color="inherit" startIcon={<IconArrowLeft size={20}/>} onClick={()=>router.push('/hr/candidates')} sx={{color:'white',borderColor:'white'}}>
                Назад к списку
              </Button>
              <Button variant="outlined" color="inherit" startIcon={<IconEdit size={20}/>} onClick={()=>router.push(`/hr/candidates/${id}/edit`)} sx={{color:'white',borderColor:'white'}}>
                Редактировать
              </Button>
              <Button variant="outlined" color="inherit" startIcon={<IconArrowsDiff size={20}/>} onClick={()=>router.push(`/hr/candidates/compare?ids=${candId}`)} sx={{color:'white',borderColor:'white'}}>
                Сравнить
              </Button>
              <Button variant="outlined" color="primary" startIcon={<ContentCopyIcon />} onClick={copyInterviewUrl} sx={{borderColor:'white',color:'white'}}>Скопировать ссылку</Button>
            </Box>
          </CardContent>
        </Card>
        <TabContext value={tab}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={tab} onChange={(_,v)=>setTab(v)} variant="scrollable" scrollButtons="auto">
              <Tab label="Результаты собеседования" value="results" />
              <Tab label="Комментарии" value="comments" />
              <Tab label="Письма" value="letters" />
              <Tab label="Отзыв кандидата" value="feedback" />
            </Tabs>
          </Box>
          <TabPanel value="results" sx={{p:0}}>
            {/* Детальная информация по сессии интервью */}
            {sessionDetail && (
              <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', position: 'relative', overflow: 'hidden', mb:3 }}>
                <CardContent sx={{ position: 'relative', zIndex: 1, p: 4 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <IconFileText size={32} color="white" />
                    <Typography variant="h4" fontWeight="700">Детали интервью-сессии</Typography>
                    <Chip label={sessionDetail.status} color={sessionDetail.status==='completed'?'success':sessionDetail.status==='in_progress'?'warning':'default'} size="medium" />
                  </Box>
                  <Grid container spacing={2} mb={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="body2"><b>Начата:</b> {sessionDetail.startedAt || '-'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="body2"><b>Завершена:</b> {sessionDetail.finishedAt || '-'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="body2"><b>Шаблон:</b> {sessionDetail.template?.title || '-'}{sessionDetail.template?.id && (<MuiLink href={`/hr-tests/${sessionDetail.template.id}`} sx={{color:'#fff',ml:1,textDecoration:'underline'}}>Открыть</MuiLink>)}</Typography>
                    </Grid>
                    {sessionDetail.vacancy && (
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2"><b>Вакансия:</b> {sessionDetail.vacancy.title}{sessionDetail.vacancy.id && (<MuiLink href={`/hr/vacancies/${sessionDetail.vacancy.id}`} sx={{color:'#fff',ml:1,textDecoration:'underline'}}>Открыть</MuiLink>)}</Typography>
                      </Grid>
                    )}
                    {/* Длительность интервью */}
                    {sessionDetail.startedAt && (sessionDetail.finishedAt || (sessionDetail.answers && sessionDetail.answers.length > 0)) && (
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2"><b>Длительность:</b> {(() => {
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
                  <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.3)' }} />
                  <Typography variant="h5" fontWeight="700" sx={{ mb: 2 }}>Ответы на вопросы</Typography>
                  {/* Accordion для длинных списков */}
                  {sessionDetail.answers && sessionDetail.answers.length > 0 ? sessionDetail.answers.map((a:any, idx:number) => (
                    <Accordion key={a.id} defaultExpanded={idx<3} sx={{background:'rgba(255,255,255,0.08)', color:'#fff', mb:2}}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color:'#fff'}} />}>
                        <Typography variant="subtitle1"><b>Вопрос {idx+1}:</b> {a.question}</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" sx={{mb:1}}><b>Ответ:</b> {a.text || <i>нет ответа</i>}</Typography>
                        <Typography variant="body2" sx={{mb:1}}><b>Оценка:</b> {a.score !== undefined && a.score !== null ? a.score : <i>нет</i>}</Typography>
                        {a.audio && (
                          <Box mb={1}>
                            <IconMicrophone size={18} style={{verticalAlign:'middle'}} />{' '}
                            <MuiLink href={`${API_BASE}/uploads/${a.audio}`} target="_blank" rel="noopener" sx={{color:'#fff',textDecoration:'underline'}}>Аудио</MuiLink>
                          </Box>
                        )}
                        {a.video && (
                          <Box mb={1}>
                            <IconVideo size={18} style={{verticalAlign:'middle'}} />{' '}
                            <MuiLink href={`${API_BASE}/uploads/${a.video}`} target="_blank" rel="noopener" sx={{color:'#fff',textDecoration:'underline'}}>Видео</MuiLink>
                          </Box>
                        )}
                        <Typography variant="caption" sx={{opacity:0.7}}>Время ответа: {a.createdAt || '-'}</Typography>
                      </AccordionDetails>
                    </Accordion>
                  )) : (
                    <Typography>Нет ответов</Typography>
                  )}
                  {sessionDetail.result && (
                    <Box mt={3}>
                      <Typography variant="h5" fontWeight="700" sx={{ mb: 2 }}>Итог интервью</Typography>
                      <Typography variant="body1" sx={{mb:1}}><b>Суммарная оценка:</b> {sessionDetail.result.totalScore !== undefined && sessionDetail.result.totalScore !== null ? sessionDetail.result.totalScore : <i>нет</i>}</Typography>
                      <Typography variant="body2" sx={{mb:1}}><b>Summary:</b> {sessionDetail.result.summary || <i>нет</i>}</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}
            {/* AI-оценка */}
            {evalData && (
              <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', zIndex: 0 }} />
                <CardContent sx={{ position: 'relative', zIndex: 1, p: 4 }}>
                  <Typography variant="h5" fontWeight="700" sx={{ mb: 2 }}>AI-оценка кандидата</Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>Статус: <Chip label={aiStatus || 'нет данных'} color={aiStatus==='done'?'success':aiStatus==='pending'?'warning':'default'} size="small" /></Typography>
                  {aiSummary && <Typography variant="body1" sx={{ mb: 1 }}>Резюме: {aiSummary}</Typography>}
                  {aiStrengths && Array.isArray(aiStrengths) && aiStrengths.length > 0 && (
                    <Box mb={1}>
                      <Typography variant="subtitle2">Сильные стороны:</Typography>
                      <ul style={{margin:0,paddingLeft:18}}>
                        {aiStrengths.map((s:string,i:number)=>(<li key={i}>{s}</li>))}
                      </ul>
                    </Box>
                  )}
                  {aiWeaknesses && Array.isArray(aiWeaknesses) && aiWeaknesses.length > 0 && (
                    <Box mb={1}>
                      <Typography variant="subtitle2">Слабые стороны:</Typography>
                      <ul style={{margin:0,paddingLeft:18}}>
                        {aiWeaknesses.map((s:string,i:number)=>(<li key={i}>{s}</li>))}
                      </ul>
                    </Box>
                  )}
                  {aiMetrics && (
                    <Box mb={1}>
                      <Typography variant="subtitle2">Метрики:</Typography>
                      <pre style={{background:'rgba(0,0,0,0.1)',padding:8,borderRadius:4}}>{JSON.stringify(aiMetrics,null,2)}</pre>
                    </Box>
                  )}
                  {aiUpdatedAt && <Typography variant="caption" sx={{ opacity: 0.8 }}>Обновлено: {aiUpdatedAt}</Typography>}
                </CardContent>
              </Card>
            )}
          </TabPanel>
          {/* Tab: Комментарии */}
          <TabPanel value="comments" sx={{p:0}}>
            <Card sx={{ background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)', color: '#222', position: 'relative', overflow: 'hidden', mb:3 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{mb:1}}>Заметки HR</Typography>
                <textarea
                  value={hrNote}
                  onChange={e=>setHrNote(e.target.value)}
                  rows={6}
                  style={{width:'100%',borderRadius:8,padding:8,fontSize:16,marginBottom:8}}
                  placeholder="Введите заметку или комментарий..."
                />
                <Button variant="contained" color="secondary" onClick={saveNote} sx={{mb:2}}>Сохранить заметку</Button>
                <Typography variant="body2" sx={{opacity:0.7}}>Заметка хранится только локально в браузере (MVP).</Typography>
              </CardContent>
            </Card>
          </TabPanel>
          {/* Tab: Письма */}
          <TabPanel value="letters" sx={{p:0}}>
            <Card sx={{ background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)', color: '#222', position: 'relative', overflow: 'hidden', mb:3 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{mb:1}}>Письма кандидату</Typography>
                <Typography variant="body2" sx={{opacity:0.7}}>Здесь появится история писем и уведомлений кандидату (в будущем).</Typography>
              </CardContent>
            </Card>
          </TabPanel>
          {/* Tab: Отзыв кандидата */}
          <TabPanel value="feedback" sx={{p:0}}>
            <Card sx={{ background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)', color: '#222', position: 'relative', overflow: 'hidden', mb:3 }}>
              <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{mb:1}}>Отзыв кандидата</Typography>
                  <Typography variant="body2" sx={{opacity:0.7}}>Здесь появится обратная связь от кандидата (в будущем).</Typography>
              </CardContent>
            </Card>
          </TabPanel>
        </TabContext>
        <Snackbar open={!!copyMsg} autoHideDuration={2000} onClose={()=>setCopyMsg(null)} message={copyMsg} />
      </Box>
    </PageContainer>
  );
} 