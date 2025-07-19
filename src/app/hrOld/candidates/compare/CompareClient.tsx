"use client";

import { useEffect, useState } from 'react';
import { apiFetch } from '@/utils/api';
import { Radar } from 'react-chartjs-2';
import { Box, Typography, Paper, Grid } from '@mui/material';
import 'chart.js/auto';

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test';

interface CompareResponse {
  skills: string[];
  candidates: {
    id: number;
    name: string;
    overallScore: number;
    skills: { skill: string; level: string }[];
  }[];
}

export default function CompareClient({ idsParam }: { idsParam: string | null }){
  const [data,setData]=useState<CompareResponse>();

  useEffect(()=>{
    if(!idsParam) return;
    (async()=>{
      const ids = idsParam.split(',').map(Number);
      const res = await apiFetch(`${API_BASE}/api/admin/candidates/compare`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ids})
      });
      if(res.ok) setData(await res.json());
    })();
  },[idsParam]);

  if(!idsParam){return <Typography sx={{p:4}}>Не переданы id кандидатов.</Typography>;}
  if(!data){return <Typography sx={{p:4}}>Загрузка…</Typography>;}

  const chartData = {
    labels: data.skills,
    datasets: data.candidates.map((c,i)=>({
      label: c.name,
      data: data.skills.map(sk=>{
        const m = c.skills.find(s=>s.skill===sk);
        const levelMap = {low:1,medium:2,high:3} as const;
        return m? levelMap[m.level as keyof typeof levelMap] : 0;
      }),
      backgroundColor:`rgba(${50*i},${100+30*i},220,0.2)` ,
      borderColor: `rgba(${50*i},${100+30*i},220,1)`
    }))
  } as any;

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>Сравнение кандидатов</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{p:2}}>
            <Radar data={chartData}/>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          {data.candidates.map(c=> (
            <Paper key={c.id} sx={{p:2,mb:2}}>
              <Typography variant="h6">{c.name}</Typography>
              <Typography>Общий балл: {c.overallScore}</Typography>
            </Paper>
          ))}
        </Grid>
      </Grid>
    </Box>
  );
} 