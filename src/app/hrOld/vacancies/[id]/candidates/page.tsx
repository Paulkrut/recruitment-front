"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Box, Typography, Chip } from "@mui/material";
import { apiFetch } from "@/utils/api";
import DataTable from "@/components/DataTable";

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

type Row = { id:number; name:string; token:string; status:string; sessionId:number; startedAt?:string };

export default function VacancyCandidatesPage(){
  const { id } = useParams<{id:string}>();
  const [token,setToken] = useState<string|null>(null);
  const [rows,setRows] = useState<Row[]>([]);

  useEffect(()=>{ const t=localStorage.getItem('recruitment_token'); if(t) setToken(t); },[]);
  useEffect(()=>{ if(!token||!id) return; apiFetch(`${API_BASE}/api/admin/vacancies/${id}/candidates`).then(r=>r.json()).then(setRows); },[token,id]);

  if(!token){ return <Box sx={{p:4}}><Typography>Нет доступа</Typography></Box>; }

  return (
    <Box sx={{p:4}}>
      <Typography variant="h4" gutterBottom>Кандидаты вакансии #{id}</Typography>
      <DataTable<Row> columns={[
        {field:'id',header:'ID',render:r=>(<a href={`/hr/candidates/${r.id}`}>{r.id}</a>)},
        {field:'name',header:'Имя',render:r=>(<a href={`/hr/candidates/${r.id}`}>{r.name}</a>)},
        {field:'status',header:'Статус', render:r=>(<Chip size="small" label={r.status}/>)},
        {field:'token',header:'Токен',render:r=>(<a href={`/interview/${r.token}`} target="_blank" rel="noreferrer">{r.token}</a>)},
      ]} rows={rows} />
    </Box>
  );
} 