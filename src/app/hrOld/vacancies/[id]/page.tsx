"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box, Card, CardContent, Typography, Button, Paper, Chip, Divider, Grid, CircularProgress
} from "@mui/material";
import {
  IconBriefcase, IconFileText, IconSettings, IconUsers, IconEdit, IconDeviceFloppy, IconArrowLeft
} from "@tabler/icons-react";
import DataTable from "@/components/DataTable";
import PageContainer from "@/app/components/container/PageContainer";
import { apiFetch } from "@/utils/api";

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

export default function HRVacancyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("recruitment_token");
    if (t) setToken(t);
  }, []);

  useEffect(() => {
    if (!token || !id) return;
    setLoading(true);
    apiFetch(`${API_BASE}/api/admin/vacancies/${id}/full`).then(r => r.json()).then(setData).finally(()=>setLoading(false));
    apiFetch(`${API_BASE}/api/admin/vacancies/${id}/candidates`).then(r=>r.json()).then(setCandidates);
  }, [token, id]);

  if (!token) return <PageContainer title="Вакансия"><Box sx={{p:4}}><Typography>Нет доступа</Typography></Box></PageContainer>;
  if (loading || !data) return <PageContainer title="Вакансия"><Box sx={{p:4, textAlign:'center'}}><CircularProgress /></Box></PageContainer>;

  const { title, description, template, questions } = data;

  return (
    <PageContainer title={`Вакансия: ${title}`}> 
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Информация о вакансии */}
        <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
          <Box sx={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', zIndex: 0 }} />
          <CardContent sx={{ position: 'relative', zIndex: 1, p: 4 }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Box sx={{ p: 2, borderRadius: 2, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
                <IconBriefcase size={32} color="white" />
        </Box>
        <Box>
                <Typography variant="h4" fontWeight="700" sx={{ mb: 1 }}>Информация о вакансии</Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>{title}</Typography>
              </Box>
        </Box>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>{description}</Typography>
            <Box display="flex" gap={2} mt={2}>
              <Button variant="outlined" color="inherit" startIcon={<IconEdit size={20}/>} onClick={()=>router.push(`/hr-vacancy-edit/${id}`)} sx={{color:'white',borderColor:'white'}}>
                Редактировать
        </Button>
              <Button variant="outlined" color="inherit" startIcon={<IconUsers size={20}/>} onClick={()=>router.push(`/hr/vacancies/${id}/candidates`)} sx={{color:'white',borderColor:'white'}}>
          Кандидаты
        </Button>
      </Box>
          </CardContent>
        </Card>

        {/* Тест и вопросы */}
        <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
          <Box sx={{ position: 'absolute', bottom: -30, left: -30, width: 120, height: 120, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', zIndex: 0 }} />
          <CardContent sx={{ position: 'relative', zIndex: 1, p: 4 }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Box sx={{ p: 2, borderRadius: 2, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
                <IconFileText size={32} color="white" />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight="700" sx={{ mb: 1 }}>Тест для кандидатов</Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>{template?.title || 'Без шаблона'}</Typography>
              </Box>
            </Box>
            {template?.description && <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>{template.description}</Typography>}
            <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.3)' }} />
            <Typography variant="h6" sx={{ mb: 2 }}>Вопросы теста</Typography>
            <DataTable columns={[
              { field: 'position', header: '#', render: (q:any) => q.position+1 },
              { field: 'text', header: 'Вопрос' },
              { field: 'type', header: 'Тип', render: (q:any) => <Chip label={q.type} size="small" /> },
              { field: 'maxTime', header: 'Время, сек' },
            ]} rows={questions || []} defaultRowsPerPage={5} />
            <Box mt={2}>
              <Button variant="outlined" color="inherit" startIcon={<IconEdit size={20}/>} onClick={()=>router.push(`/hr-vacancy-edit/${id}`)} sx={{color:'white',borderColor:'white'}}>
                Редактировать тест
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Кандидаты */}
        <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
          <Box sx={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', zIndex: 0 }} />
          <CardContent sx={{ position: 'relative', zIndex: 1, p: 4 }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Box sx={{ p: 2, borderRadius: 2, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
                <IconUsers size={32} color="white" />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight="700" sx={{ mb: 1 }}>Кандидаты</Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>Все отклики на вакансию</Typography>
              </Box>
            </Box>
            <DataTable columns={[
              {field:'id',header:'ID',render:(r:any)=>(<a href={`/hr/candidates/${r.id}`}>{r.id}</a>)},
              {field:'name',header:'Имя',render:(r:any)=>(<a href={`/hr/candidates/${r.id}`}>{r.name}</a>)},
              {field:'status',header:'Статус', render:(r:any)=>(<Chip size="small" label={r.status}/>)} ,
              {field:'token',header:'Токен',render:(r:any)=>(<a href={`/interview/${r.token}`} target="_blank" rel="noreferrer">{r.token}</a>)}
            ]} rows={candidates} defaultRowsPerPage={5} />
            <Box mt={2}>
              <Button variant="outlined" color="inherit" startIcon={<IconUsers size={20}/>} onClick={()=>router.push(`/hr/vacancies/${id}/candidates`)} sx={{color:'white',borderColor:'white'}}>
                Все кандидаты
              </Button>
            </Box>
          </CardContent>
        </Card>
    </Box>
    </PageContainer>
  );
} 