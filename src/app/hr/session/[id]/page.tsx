"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, LinearProgress } from "@mui/material";
import { apiFetch } from "@/utils/api";

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

interface AnswerRow{ q:string; a:string; score?:number; }

export default function SessionDetailPage(){
  const {id} = useParams<{id:string}>();
  const [data,setData] = useState<{summary:string;totalScore:number;answers:AnswerRow[]}|null>(null);

  useEffect(()=>{
    apiFetch(`${API_BASE}/api/interviews/${id}/result`).then(r=>r.json()).then(setData);
  },[id]);

  if(!data) return (<Box sx={{p:4}}><Typography>Загрузка…</Typography></Box>);

  return (<Box sx={{p:4}}>
    <Typography variant="h4" gutterBottom>Результаты сессии #{id}</Typography>
    <Paper sx={{p:2,mb:3}}>
      <Typography variant="h6">Итоговый балл</Typography>
      <Typography variant="h3" color="primary">{data.totalScore.toFixed(1)}</Typography>
      <Typography variant="h6" sx={{mt:2}}>AI-Summary</Typography>
      <Typography whiteSpace="pre-line">{data.summary}</Typography>
    </Paper>
    <Paper sx={{p:2}}>
      <Table size="small">
        <TableHead><TableRow><TableCell>#</TableCell><TableCell>Вопрос</TableCell><TableCell>Ответ</TableCell><TableCell>Оценка</TableCell></TableRow></TableHead>
        <TableBody>
          {data.answers.map((row,i)=>(<TableRow key={i}><TableCell>{i+1}</TableCell><TableCell>{row.q}</TableCell><TableCell>{row.a}</TableCell><TableCell>{row.score?.toFixed(1)||'-'}</TableCell></TableRow>))}
        </TableBody>
      </Table>
    </Paper>
  </Box>);
} 