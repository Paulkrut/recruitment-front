"use client";

import { useEffect, useState } from "react";
import { Box, Typography, Paper, LinearProgress, Table, TableHead, TableRow, TableCell, TableBody, List, ListItem, ListItemText } from "@mui/material";
import { Line } from "react-chartjs-2";
import { Chart, LineElement, CategoryScale, LinearScale, PointElement } from "chart.js";
import { apiFetch } from "@/utils/api";

Chart.register(LineElement, CategoryScale, LinearScale, PointElement);

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

export default function DashboardPage(){
  const [data,setData]=useState<any|null>(null);
  useEffect(()=>{ apiFetch(`${API_BASE}/api/dashboard`).then(r=>r.json()).then(setData); },[]);

  if(!data) return (<Box sx={{p:4}}><Typography>Загрузка…</Typography></Box>);

  return (
    <Box sx={{p:4,display:'grid',gridTemplateColumns:{md:'1fr 1fr'},gap:2}}>
      {/* Open vacancies */}
      <Paper sx={{p:2}}>
        <Typography variant="h6" gutterBottom>Открытые вакансии</Typography>
        <Table size="small">
          <TableHead><TableRow><TableCell>Вакансия</TableCell><TableCell>Прогресс</TableCell></TableRow></TableHead>
          <TableBody>
            {data.openVacancies.map((v:any)=>(
              <TableRow key={v.id}><TableCell>{v.title}</TableCell><TableCell><LinearProgress variant="determinate" value={v.total? (v.finished/v.total*100):0} sx={{height:6,borderRadius:4}}/></TableCell></TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Line chart */}
      <Paper sx={{p:2}}>
        <Typography variant="h6" gutterBottom>Тестов за 7 дней</Typography>
        <Line data={{
          labels:data.testsPerDay.map((d:any)=>d.date),
          datasets:[{label:'Тестов',data:data.testsPerDay.map((d:any)=>d.count),borderColor:'#1976d2'}]
        }} options={{plugins:{legend:{display:false}}}} height={200} />
      </Paper>

      {/* Weak questions */}
      <Paper sx={{p:2}}>
        <Typography variant="h6" gutterBottom>Слабые вопросы</Typography>
        <List dense>
          {data.weakQuestions.map((q:any,i:number)=>(<ListItem key={i}><ListItemText primary={q.questionText} secondary={`avg ${q.avgScore}`}/></ListItem>))}
        </List>
      </Paper>

      {/* Overdue candidates */}
      <Paper sx={{p:2}}>
        <Typography variant="h6" gutterBottom>Просроченные кандидаты</Typography>
        <List dense>
          {data.overdueCandidates.map((c:any,i:number)=>(<ListItem key={i}><ListItemText primary={c.name} secondary={c.created_at}/></ListItem>))}
        </List>
      </Paper>
    </Box>
  );
} 