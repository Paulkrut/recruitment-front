"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, Typography, TextField, Button, Paper, IconButton, Table, TableHead, TableRow, TableCell, TableBody, Dialog, DialogTitle, DialogContent, DialogActions, Checkbox } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { apiFetch } from "@/utils/api";

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

interface QuestionDraft{ text:string; type:string; maxTime?:number; allowFollowups?:boolean; followupsMax?:number; }

export default function TemplateNewPage(){
  const [title,setTitle] = useState('');
  const [description,setDescription] = useState('');
  const [questions,setQuestions] = useState<QuestionDraft[]>([]);
  const [error,setError] = useState<string|null>(null);
  const [ok,setOk] = useState(false);
  const [genOpen,setGenOpen]=useState(false);
  const [genCount,setGenCount]=useState(5);
  const [templateId,setTemplateId]=useState<number|null>(null);

  const searchParams = useSearchParams();
  const vacancyId = searchParams ? (searchParams.get('vacancy') ? Number(searchParams.get('vacancy')!) : null) : null;
  const router = useRouter();

  function addQuestion(){ setQuestions(q=>[...q,{text:'',type:'text',maxTime:120,allowFollowups:false,followupsMax:0}]); }
  function updateQuestion(idx:number,field:string,value:any){ setQuestions(q=>q.map((it,i)=>i===idx?{...it,[field]:value}:it)); }
  function removeQuestion(idx:number){ setQuestions(q=>q.filter((_,i)=>i!==idx)); }

  async function save(){
    if(!title){ setError('Введите название'); return; }
    if (templateId) {
      const res = await apiFetch(`${API_BASE}/api/admin/templates/${templateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, questions }),
      });
      if (res.ok) {
        if (vacancyId) {
          router.replace(`/hr/vacancy/${vacancyId}`);
        } else {
          router.replace(`/hr/template/${templateId}`);
        }
      } else {
        setError('Ошибка');
      }
    } else {
      const payload:any = { title, description, questions };
      if (vacancyId !== null) payload.vacancyId = vacancyId;
      const res = await apiFetch(`${API_BASE}/api/admin/templates`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if(res.ok){ const d=await res.json();
        if(vacancyId){
          await apiFetch(`${API_BASE}/api/admin/vacancies/${vacancyId}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({templateId:d.id})});
          router.replace(`/hr/vacancy/${vacancyId}`);
        } else {
          router.replace(`/hr/template/${d.id}`);
        }
      } else { setError('Ошибка'); }
    }
  }

  async function ensureTemplate():Promise<number|null>{
    if(templateId) return templateId;
    if(!title.trim()) { alert('Введите название перед генерацией'); return null; }
    if(vacancyId===null){ alert('Шаблон должен быть привязан к вакансии. Откройте страницу создания через /hr/template/new?vacancy={id}'); return null; }
    const res=await apiFetch(`${API_BASE}/api/admin/templates`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title,description,vacancyId,questions:[]})});
    if(res.ok){ const d=await res.json(); setTemplateId(d.id); return d.id; }
    alert('Ошибка создания шаблона'); return null; }

  async function generate(){
    const id=await ensureTemplate(); if(!id) return;
    const cnt=Math.max(1,Math.min(20,genCount));
    const res=await apiFetch(`${API_BASE}/api/admin/templates/${id}/suggest`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({count:cnt})});
    if(res.ok){ const d=await res.json();
      setQuestions(q=>[...q,...(d.questions||[]).map((t:string,i:number)=>({text:t,type:'text',maxTime:120,allowFollowups:false,followupsMax:0,position:q.length+i}))]);
    }
    setGenOpen(false);
  }

  if(ok) return (<Box sx={{p:4}}><Typography>Сохранено</Typography></Box>);

  return (<Box sx={{p:4,maxWidth:800,mx:'auto'}}>
    <Box sx={{display:'flex',justifyContent:'space-between',alignItems:'center',mb:2}}>
      <Typography variant="h4">Новый шаблон</Typography>
      <Button variant="outlined" onClick={()=>setGenOpen(true)}>Сгенерировать вопросы</Button>
    </Box>
    <TextField label="Название" fullWidth sx={{mb:2}} value={title} onChange={e=>setTitle(e.target.value)}/>
    <TextField label="Описание" fullWidth multiline minRows={3} sx={{mb:2}} value={description} onChange={e=>setDescription(e.target.value)}/>
    <Paper sx={{p:2,mb:2}}>
      <Typography variant="h6" gutterBottom>Вопросы</Typography>
      <Table size="small">
        <TableHead><TableRow><TableCell>#</TableCell><TableCell>Текст</TableCell><TableCell>Время, сек</TableCell><TableCell>Уточнения</TableCell><TableCell></TableCell></TableRow></TableHead>
        <TableBody>
          {questions.map((q,idx)=>(<TableRow key={idx}><TableCell>{idx+1}</TableCell><TableCell><TextField fullWidth multiline minRows={2} value={q.text} onChange={e=>updateQuestion(idx,'text',e.target.value)}/></TableCell><TableCell><TextField type="number" value={q.maxTime} sx={{width:100}} onChange={e=>updateQuestion(idx,'maxTime',Number(e.target.value))}/></TableCell><TableCell><Checkbox checked={q.allowFollowups||false} onChange={e=>updateQuestion(idx,'allowFollowups',e.target.checked)}/><TextField type="number" value={q.followupsMax||0} sx={{width:80,ml:1}} disabled={!q.allowFollowups} onChange={e=>updateQuestion(idx,'followupsMax',Number(e.target.value))}/></TableCell><TableCell><IconButton onClick={()=>removeQuestion(idx)}><DeleteIcon/></IconButton></TableCell></TableRow>))}
        </TableBody>
      </Table>
      <Button startIcon={<AddIcon/>} onClick={addQuestion} sx={{mt:1}}>Добавить вопрос</Button>
    </Paper>
    {error && <Typography color="error" sx={{mb:2}}>{error}</Typography>}
    <Button variant="contained" onClick={save} disabled={!title || questions.length===0}>Сохранить</Button>
    <Dialog open={genOpen} onClose={()=>setGenOpen(false)}>
      <DialogTitle>Сгенерировать вопросы</DialogTitle>
      <DialogContent>
        <TextField type="number" fullWidth label="Количество" sx={{mt:1}} inputProps={{min:1,max:20}} value={genCount} onChange={e=>setGenCount(Number(e.target.value))}/>
      </DialogContent>
      <DialogActions>
        <Button onClick={()=>setGenOpen(false)}>Отмена</Button>
        <Button variant="contained" onClick={generate}>Создать</Button>
      </DialogActions>
    </Dialog>
  </Box>); } 