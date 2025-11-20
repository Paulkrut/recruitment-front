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
import { useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';


const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

export default function HRSessionDetailPage() {
  const { _ } = useLingui();

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
      <PageContainer title={_(msg`Интервью-сессия`)}>
        <Box sx={{ p: 4, textAlign: "center" }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );

  const { sessionId, status, startedAt, finishedAt, candidate, template, answers, result } = data;

  return (
    <PageContainer title={_(msg`Интервью-сессия #${sessionId}`)}>
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
                <Typography variant="body2"><b><Trans>Начата</Trans>:</b> {startedAt || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2"><b><Trans>Завершена</Trans>:</b> {finishedAt || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2"><b><Trans>Шаблон</Trans>:</b> {template?.title || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2"><b><Trans>Кандидат</Trans>:</b> {candidate?.name || '-'} (ID: {candidate?.id})</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2"><b>Email:</b> {candidate?.email || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2"><b><Trans>Телефон</Trans>:</b> {candidate?.phone || '-'}</Typography>
              </Grid>
            </Grid>
            <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.3)' }} />
            <Button variant="outlined" color="inherit" startIcon={<IconArrowLeft size={20}/>} onClick={()=>router.push('/hr/candidates')} sx={{color:'white',borderColor:'white'}}>
              <Trans>Назад к кандидатам</Trans>
            </Button>
          </CardContent>
        </Card>

        {/* Ответы на вопросы */}
        <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
          <CardContent sx={{ position: 'relative', zIndex: 1, p: 4 }}>
            <Typography variant="h5" fontWeight="700" sx={{ mb: 2 }}><Trans>Ответы на вопросы</Trans></Typography>
            <Grid container spacing={2}>
              {answers && answers.length > 0 ? answers.map((a:any, idx:number) => (
                <Grid item xs={12} key={a.id}>
                  <Card sx={{background:'rgba(255,255,255,0.08)', color:'#fff', mb:2}}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{mb:1}}><b><Trans>Вопрос</Trans> {idx+1}:</b> {a.question}</Typography>
                      <Typography variant="body2" sx={{mb:1}}><b><Trans>Ответ</Trans>:</b> {a.text || <i><Trans>нет ответа</Trans></i>}</Typography>
                      <Typography variant="body2" sx={{mb:1}}><b><Trans>Оценка</Trans>:</b> {a.score !== undefined && a.score !== null ? a.score : <i><Trans>нет</Trans></i>}</Typography>
                      {a.audio && (
                        <Box mb={1}>
                          <IconMicrophone size={18} style={{verticalAlign:'middle'}} />{' '}
                          <MuiLink href={`${API_BASE}/uploads/${a.audio}`} target="_blank" rel="noopener" sx={{color:'#fff',textDecoration:'underline'}}><Trans>Аудио</Trans></MuiLink>
                        </Box>
                      )}
                      {a.video && (
                        <Box mb={1}>
                          <IconVideo size={18} style={{verticalAlign:'middle'}} />{' '}
                          <MuiLink href={`${API_BASE}/uploads/${a.video}`} target="_blank" rel="noopener" sx={{color:'#fff',textDecoration:'underline'}}><Trans>Видео</Trans></MuiLink>
                        </Box>
                      )}
                      <Typography variant="caption" sx={{opacity:0.7}}><Trans>Время ответа</Trans>: {a.createdAt || '-'}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )) : (
                <Grid item xs={12}><Typography><Trans>Нет ответов</Trans></Typography></Grid>
              )}
            </Grid>
          </CardContent>
        </Card>

        {/* Итог */}
        {result && (
          <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
            <CardContent sx={{ position: 'relative', zIndex: 1, p: 4 }}>
              <Typography variant="h5" fontWeight="700" sx={{ mb: 2 }}><Trans>Итог интервью</Trans></Typography>
              <Typography variant="body1" sx={{mb:1}}><b>Суммарная оценка:</b> {result.totalScore !== undefined && result.totalScore !== null ? result.totalScore : <i><Trans>нет</Trans></i>}</Typography>
              <Typography variant="body2" sx={{mb:1}}><b>Summary:</b> {result.summary || <i><Trans>нет</Trans></i>}</Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    </PageContainer>
  );
}
