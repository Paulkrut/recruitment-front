"use client";

import { useState } from "react";
import { Box, Typography, TextField, Button, Paper, IconButton, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { apiFetch } from "@/utils/api";

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

interface QuestionDraft{ text:string; type:string; maxTime?:number; }

export default function TemplateNewPage(){
  const [title,setTitle] = useState('');
  const [description,setDescription] = useState('');
  const [questions,setQuestions] = useState<QuestionDraft[]>([]);
  const [error,setError] = useState<string|null>(null);
  const [ok,setOk] = useState(false);

  function addQuestion(){ setQuestions(q=>[...q,{text:'',type:'text',maxTime:120}]); }
  function updateQuestion(idx:number,field:string,value:any){ setQuestions(q=>q.map((it,i)=>i===idx?{...it,[field]:value}:it)); }
  function removeQuestion(idx:number){ setQuestions(q=>q.filter((_,i)=>i!==idx)); }

  async function save(){
    if(!title){ setError('Введите название'); return; }
    const res = await apiFetch(`${API_BASE}/api/admin/templates`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title,description,questions})});
    if(res.ok){ const d=await res.json(); window.location.replace(`/hr/template/${d.id}`); } else { setError('Ошибка'); }
  }

  if(ok) return (<Box sx={{p:4}}><Typography>Сохранено</Typography></Box>);

  return (<Box sx={{p:4,maxWidth:800,mx:'auto'}}>
    <Typography variant="h4" gutterBottom>Новый шаблон</Typography>
    <TextField label="Название" fullWidth sx={{mb:2}} value={title} onChange={e=>setTitle(e.target.value)}/>
    <TextField label="Описание" fullWidth multiline minRows={3} sx={{mb:2}} value={description} onChange={e=>setDescription(e.target.value)}/>
    <Paper sx={{p:2,mb:2}}>
      <Typography variant="h6" gutterBottom>Вопросы</Typography>
      <Table size="small">
        <TableHead><TableRow><TableCell>#</TableCell><TableCell>Текст</TableCell><TableCell>Время, сек</TableCell><TableCell></TableCell></TableRow></TableHead>
        <TableBody>
          {questions.map((q,idx)=>(<TableRow key={idx}><TableCell>{idx+1}</TableCell><TableCell><TextField fullWidth value={q.text} onChange={e=>updateQuestion(idx,'text',e.target.value)}/></TableCell><TableCell><TextField type="number" value={q.maxTime} sx={{width:100}} onChange={e=>updateQuestion(idx,'maxTime',Number(e.target.value))}/></TableCell><TableCell><IconButton onClick={()=>removeQuestion(idx)}><DeleteIcon/></IconButton></TableCell></TableRow>))}
        </TableBody>
      </Table>
      <Button startIcon={<AddIcon/>} onClick={addQuestion} sx={{mt:1}}>Добавить вопрос</Button>
    </Paper>
    {error && <Typography color="error" sx={{mb:2}}>{error}</Typography>}
    <Button variant="contained" onClick={save} disabled={!title || questions.length===0}>Сохранить</Button>
  </Box>); } 