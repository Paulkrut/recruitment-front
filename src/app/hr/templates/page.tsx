"use client";

import { useEffect, useState } from "react";
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, Button, TextField, Pagination } from "@mui/material";
import { apiFetch } from "@/utils/api";

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

interface TemplateRow { id:number; title:string; description?:string; createdAt:string; questionsCount:number; }

export default function TemplatesPage(){
  const [token,setToken] = useState<string|null>(null);
  const [rows,setRows] = useState<TemplateRow[]>([]);
  const [page,setPage] = useState(1);
  const [pages,setPages] = useState(1);
  const [q,setQ] = useState('');

  useEffect(()=>{ const t=localStorage.getItem('recruitment_token'); if(t) setToken(t); },[]);

  useEffect(()=>{
    if(!token) return;
    const params = new URLSearchParams();
    params.set('page', String(page));
    if(q) params.set('q', q);
    apiFetch(`${API_BASE}/api/admin/templates?${params.toString()}`)
      .then(r=>r.json())
      .then((data)=>{ setRows(data.items); setPages(data.pages); });
  },[token,page,q]);

  return (
    <Box sx={{p:4}}>
      <Box sx={{display:'flex',justifyContent:'space-between',alignItems:'center',mb:2}}>
        <Typography variant="h4">Шаблоны интервью</Typography>
        <Button variant="contained" href="/hr/template/new" size="small">Новый</Button>
      </Box>
      <Box sx={{display:'flex',mb:2}}>
        <TextField placeholder="Поиск…" size="small" value={q} onChange={e=>{setPage(1);setQ(e.target.value);}} />
      </Box>
      <Paper sx={{p:2}}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell><TableCell>Название</TableCell><TableCell>Вопросов</TableCell><TableCell>Создан</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(r=>(
              <TableRow key={r.id} hover>
                <TableCell><a href={`/hr/template/${r.id}`}>{r.id}</a></TableCell>
                <TableCell>{r.title}</TableCell>
                <TableCell>{r.questionsCount}</TableCell>
                <TableCell>{r.createdAt}</TableCell>
              </TableRow>))}
          </TableBody>
        </Table>
        <Box sx={{display:'flex',justifyContent:'center',mt:2}}><Pagination count={pages} page={page} onChange={(_,v)=>setPage(v)} /></Box>
      </Paper>
    </Box>
  );
} 