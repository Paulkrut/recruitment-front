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
  Link as MuiLink,
} from "@mui/material";
import { IconUsers, IconFileText, IconCheck, IconClock, IconArrowLeft, IconMicrophone, IconVideo } from "@tabler/icons-react";
import PageContainer from "@/app/components/container/PageContainer";

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

export default function HRSessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`${API_BASE}/api/admin/interview/session/${id}`)
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !data)
    return (
      <PageContainer title="Интервью-сессия">
        <Box sx={{ p: 4, textAlign: "center" }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );

  const { sessionId, status, startedAt, finishedAt, candidate, template, answers, result } = data;

  return (
    <PageContainer title={`Интервью-сессия #${sessionId}`}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
          <CardContent sx={{ position: 'relative', zIndex: 1, p: 4 }}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <IconFileText size={32} color="white" />
              <Typography variant="h4" fontWeight="700">Интервью-сессия #{sessionId}</Typography>
              <Chip label={status} color={status==='completed'?'success':status==='in_progress'?'warning':'default'} size="medium" />
            </Box>
            <Grid container spacing={2} mb={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2"><b>Начата:</b> {startedAt || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2"><b>Завершена:</b> {finishedAt || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2"><b>Шаблон:</b> {template?.title || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2"><b>Кандидат:</b> {candidate?.name || '-'} (ID: {candidate?.id})</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2"><b>Email:</b> {candidate?.email || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2"><b>Телефон:</b> {candidate?.phone || '-'}</Typography>
              </Grid>
            </Grid>
            <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.3)' }} />
            <Button variant="outlined" color="inherit" startIcon={<IconArrowLeft size={20}/>} onClick={()=>router.push('/hr/candidates')} sx={{color:'white',borderColor:'white'}}>
              Назад к кандидатам
            </Button>
          </CardContent>
        </Card>

        {/* Ответы на вопросы */}
        <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
          <CardContent sx={{ position: 'relative', zIndex: 1, p: 4 }}>
            <Typography variant="h5" fontWeight="700" sx={{ mb: 2 }}>Ответы на вопросы</Typography>
            <Grid container spacing={2}>
              {answers && answers.length > 0 ? answers.map((a:any, idx:number) => (
                <Grid item xs={12} key={a.id}>
                  <Card sx={{background:'rgba(255,255,255,0.08)', color:'#fff', mb:2}}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{mb:1}}><b>Вопрос {idx+1}:</b> {a.question}</Typography>
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
                    </CardContent>
                  </Card>
                </Grid>
              )) : (
                <Grid item xs={12}><Typography>Нет ответов</Typography></Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
        mv "recruitment-front/src/app/(DashboardLayout)/hr-dashboard" "recruitment-front/src/app/(DashboardLayout)/hr/dashboard"
        {/* Итог */}
        {result && (
          <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
            <CardContent sx={{ position: 'relative', zIndex: 1, p: 4 }}>
              <Typography variant="h5" fontWeight="700" sx={{ mb: 2 }}>Итог интервью</Typography>
              <Typography variant="body1" sx={{mb:1}}><b>Суммарная оценка:</b> {result.totalScore !== undefined && result.totalScore !== null ? result.totalScore : <i>нет</i>}</Typography>
              <Typography variant="body2" sx={{mb:1}}><b>Summary:</b> {result.summary || <i>нет</i>}</Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    </PageContainer>
  );
}
