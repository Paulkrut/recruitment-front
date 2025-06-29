"use client";

import { useEffect, useState } from "react";
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Button, Paper } from "@mui/material";
import { apiFetch } from "@/utils/api";

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

interface VacancyRow { id:number; title:string; description?:string; templateId?:number|null; }

export default function VacanciesPage(){
  const [token,setToken] = useState<string|null>(null);
  const [rows,setRows] = useState<VacancyRow[]>([]);

  useEffect(()=>{ const t=localStorage.getItem('recruitment_token'); if(t) setToken(t); },[]);
  useEffect(()=>{ if(!token) return; apiFetch(`${API_BASE}/api/admin/vacancies`).then(r=>r.json()).then(setRows); },[token]);

  if(!token){ return (<Box sx={{p:4}}><Typography>Нет доступа</Typography></Box>); }

  return (
    <Box sx={{p:4}}>
      <Box sx={{display:'flex',justifyContent:'space-between',alignItems:'center',mb:3}}>
        <Typography variant="h4">Вакансии</Typography>
        <Button variant="contained" href="/hr/vacancy/new" size="small">Новая</Button>
      </Box>
      <Paper sx={{p:2}}>
        <Table size="small">
          <TableHead>
            <TableRow><TableCell>ID</TableCell><TableCell>Название</TableCell><TableCell>Тест</TableCell></TableRow>
          </TableHead>
          <TableBody>
            {rows.map(r=> (
              <TableRow key={r.id} hover>
                <TableCell><a href={`/hr/vacancy/${r.id}`}>{r.id}</a></TableCell>
                <TableCell>{r.title}</TableCell>
                <TableCell>{r.templateId ? <a href={`/hr/template/${r.templateId}`}>{r.templateId}</a> : '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
} 