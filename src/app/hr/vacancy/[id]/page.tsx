"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Typography, Button, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import { apiFetch } from "@/utils/api";

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

interface Vacancy{ id:number; title:string; description?:string; templateId?:number|null; }
interface TemplateRow{ id:number; title:string; questionsCount?:number; }

export default function VacancyPage(){
  const {id} = useParams<{id:string}>();
  const router = useRouter();
  const isNew = id==='new';
  const [token,setToken] = useState<string|null>(null);
  const [title,setTitle] = useState('');
  const [description,setDescription] = useState('');
  const [templateId,setTemplateId] = useState<number|null>(null);

  useEffect(()=>{ const t=localStorage.getItem('recruitment_token'); if(t) setToken(t); },[]);
  useEffect(()=>{ if(isNew||!token) return; apiFetch(`${API_BASE}/api/admin/vacancies/${id}`).then(r=>r.json()).then((d:Vacancy)=>{ setTitle(d.title); setDescription(d.description||''); setTemplateId(d.templateId||null); }); },[id,token]);

  async function attachTemplate(tid:number){
    await apiFetch(`${API_BASE}/api/admin/vacancies/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({templateId:tid})});
    setTemplateId(tid);
  }

  function createTemplate(){
    router.push(`/hr/template/new?vacancy=${id}`);
  }

  if(!token) return (<Box sx={{p:4}}><Typography>Нет доступа</Typography></Box>);

  if(isNew){ /* redirect to create form (reuse older logic)*/ }

  return (
    <Box sx={{p:4,maxWidth:800,mx:'auto'}}>
      <Typography variant="h4" gutterBottom>{title}</Typography>
      {description && <Typography sx={{mb:2}} whiteSpace="pre-line">{description}</Typography>}

      <Paper sx={{p:2,mb:3}}>
        <Typography variant="h6" gutterBottom>Тест</Typography>
        {templateId ? (
          <Box>
            <Typography>Шаблон: <a href={`/hr/template/${templateId}`}>{templateId}</a></Typography>
            <Box sx={{mt:1}}>
              <Button size="small" variant="contained" onClick={createTemplate}>Создать новый тест (заменит текущий)</Button>
            </Box>
          </Box>
        ) : (
          <Button variant="contained" onClick={createTemplate}>Создать тест</Button>
        )}
      </Paper>

      <Button variant="outlined" href={`/hr/vacancy/${id}/edit`} size="small">Редактировать вакансию</Button>
    </Box>
  );
} 