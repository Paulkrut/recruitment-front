"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Box, Typography, TextField, Button, Paper, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { apiFetch } from "@/utils/api";
import SortableQuestions, { QuestionDraft } from "@/components/SortableQuestions";

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

export default function TemplateEditPage(){
  const {id} = useParams<{id:string}>();
  const [title,setTitle] = useState('');
  const [description,setDescription] = useState('');
  const [questions,setQuestions] = useState<QuestionDraft[]>([]);
  const [error,setError] = useState<string|null>(null);
  const [loading,setLoading] = useState(true);
  const [genOpen,setGenOpen]=useState(false);
  const [genCount,setGenCount]=useState(5);

  useEffect(()=>{
    apiFetch(`${API_BASE}/api/admin/templates/${id}`)
      .then(r=>r.json())
      .then((d)=>{ setTitle(d.title); setDescription(d.description||''); setQuestions(d.questions||[]); })
      .finally(()=>setLoading(false));
  },[id]);

  function addQuestion(){ setQuestions(q=>[...q,{text:'',type:'text',maxTime:120,allowFollowups:false,followupsMax:0}]); }

  async function save(){
    if(!title){ setError('Введите название'); return; }
    const payload={title,description,questions};
    const res = await apiFetch(`${API_BASE}/api/admin/templates/${id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    if(res.ok){ window.location.replace(`/hr/template/${id}`); } else { setError('Ошибка'); }
  }

  async function generate(){
    const cnt=Math.max(1,Math.min(20,genCount));
    const res=await apiFetch(`${API_BASE}/api/admin/templates/${id}/suggest`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({count:cnt})});
    if(res.ok){ const d=await res.json();
      setQuestions(q=>[...q,...(d.questions||[]).map((t:string,i:number)=>({text:t,type:'text',maxTime:120,allowFollowups:false,followupsMax:0,position:q.length+i}))]);
    }
    setGenOpen(false);
  }

  if(loading) return (<Box sx={{p:4}}><Typography>Загрузка…</Typography></Box>);

  return (<Box sx={{p:4,maxWidth:800,mx:'auto'}}>
    <Box sx={{display:'flex',justifyContent:'space-between',alignItems:'center',mb:2}}>
      <Typography variant="h4">Редактирование шаблона</Typography>
      <Button variant="outlined" onClick={()=>setGenOpen(true)}>Сгенерировать вопросы</Button>
    </Box>
    <TextField label="Название" fullWidth sx={{mb:2}} value={title} onChange={e=>setTitle(e.target.value)}/>
    <TextField label="Описание" fullWidth multiline minRows={3} sx={{mb:2}} value={description} onChange={e=>setDescription(e.target.value)}/>
    <Paper sx={{p:2,mb:2}}>
      <Box sx={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <Typography variant="h6">Вопросы</Typography>
        <Button startIcon={<AddIcon/>} size="small" onClick={addQuestion}>Добавить</Button>
      </Box>
      <SortableQuestions questions={questions} onChange={setQuestions} />
    </Paper>
    {error && <Typography color="error" sx={{mb:2}}>{error}</Typography>}
    <Button variant="contained" onClick={save} disabled={!title || questions.length===0}>Сохранить</Button>
    <Dialog open={genOpen} onClose={()=>setGenOpen(false)}>
      <DialogTitle>Сгенерировать вопросы</DialogTitle>
      <DialogContent>
        <TextField type="number" label="Количество" fullWidth sx={{mt:1}} inputProps={{min:1,max:20}} value={genCount} onChange={e=>setGenCount(Number(e.target.value))}/>
      </DialogContent>
      <DialogActions>
        <Button onClick={()=>setGenOpen(false)}>Отмена</Button>
        <Button variant="contained" onClick={generate}>Создать</Button>
      </DialogActions>
    </Dialog>
  </Box>);
} 