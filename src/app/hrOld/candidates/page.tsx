"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Select,
  MenuItem,
  Paper,
} from "@mui/material";
import { apiFetch } from "@/utils/api";
import DataTable from "@/components/DataTable";

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

interface Template { id:number; title:string; }
interface Candidate { id:number; name:string; token:string; status:string; aiStatus?:string; }

export default function CandidatesPage(){
  const [token,setToken] = useState<string|null>(null);
  const [phone,setPhone] = useState('');
  const [password,setPassword] = useState('');
  const [error,setError] = useState<string|null>(null);

  const [templates,setTemplates] = useState<Template[]>([]);
  const [candidates,setCandidates] = useState<Candidate[]>([]);

  // form values
  const [name,setName] = useState('');
  const [email,setEmail] = useState('');
  const [phoneCand,setPhoneCand] = useState('');
  const [templateId,setTemplateId] = useState<number|''>('');
  const [selectedIds,setSelectedIds]=useState<number[]>([]);
  const [generatedLink,setGeneratedLink] = useState<string|null>(null);

  const selectedReady = selectedIds.length>=2 && selectedIds.every(id=>{
    const cand = candidates.find(c=>c.id===id);
    return cand?.aiStatus==='done';
  });

  /* effects */
  useEffect(()=>{ const saved=localStorage.getItem('recruitment_token'); if(saved){ setToken(saved);} },[]);
  useEffect(()=>{ if(!token) return; fetchTemplates(); fetchCandidates(); },[token]);

  async function fetchTemplates(){
    const res = await apiFetch(`${API_BASE}/api/admin/templates?limit=1000`);
    if(!res.ok) return;
    const data = await res.json();
    setTemplates(Array.isArray(data)?data:data.items||[]);
  }
  async function fetchCandidates(){
    const res=await apiFetch(`${API_BASE}/api/admin/candidates`);
    if(res.ok){ setCandidates(await res.json()); }
  }
  async function login(){
    try{
      const res = await fetch(`${API_BASE}/auth/login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone,password})});
      if(!res.ok) throw new Error('Auth error');
      const data=await res.json(); localStorage.setItem('recruitment_token',data.token); setToken(data.token); setError(null);
    }catch(e:any){ setError(e.message);} }

  async function createCandidate(){
    if(!token||!name||!templateId) return;
    const resCand = await apiFetch(`${API_BASE}/api/admin/candidates`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,email,phone:phoneCand})});
    if(!resCand.ok){ setError('Не удалось создать кандидата'); return; }
    const cand = await resCand.json();
    const resAssign = await apiFetch(`${API_BASE}/api/admin/candidates/${cand.id}/assign`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({templateId})});
    if(!resAssign.ok){ setError('Не удалось назначить интервью'); return; }
    const data=await resAssign.json(); setGeneratedLink(data.link); fetchCandidates(); }

  if(!token){ return (
    <Box sx={{p:4,maxWidth:400,mx:'auto'}}>
      <Typography variant="h5" gutterBottom>HR: вход</Typography>
      <TextField label="Телефон" fullWidth sx={{mb:2}} value={phone} onChange={e=>setPhone(e.target.value)}/>
      <TextField label="Пароль" type="password" fullWidth sx={{mb:2}} value={password} onChange={e=>setPassword(e.target.value)}/>
      <Button variant="contained" onClick={login}>Войти</Button>
      {error&&<Typography color="error" sx={{mt:1}}>{error}</Typography>}
    </Box> ); }

  /* main */
  return (
    <Box sx={{p:4}}>
      <Typography variant="h4" gutterBottom>Кандидаты</Typography>

      {/* create candidate form */}
      <Paper sx={{p:3,mb:4,maxWidth:600}}>
        <Typography variant="h6" gutterBottom>Создать кандидата</Typography>
        <TextField label="Имя" fullWidth sx={{mb:2}} value={name} onChange={e=>setName(e.target.value)}/>
        <TextField label="Email" fullWidth sx={{mb:2}} value={email} onChange={e=>setEmail(e.target.value)}/>
        <TextField label="Телефон" fullWidth sx={{mb:2}} value={phoneCand} onChange={e=>setPhoneCand(e.target.value)}/>
        <Select fullWidth displayEmpty sx={{mb:2}} value={templateId} onChange={e=>setTemplateId(e.target.value as number)}>
          <MenuItem value=""><em>Выберите шаблон</em></MenuItem>
          {templates.map(t=>(<MenuItem key={t.id} value={t.id}>{t.title}</MenuItem>))}
        </Select>
        <Button variant="contained" onClick={createCandidate} disabled={!name||!templateId}>Создать и получить ссылку</Button>
        {generatedLink&&<Typography sx={{mt:2}}><b>Ссылка:</b> <a href={generatedLink} target="_blank" rel="noreferrer">{generatedLink}</a></Typography>}
      </Paper>

      {/* table */}
      <Button variant="contained" sx={{mb:2}} disabled={!selectedReady} onClick={()=>{
        const qs = selectedIds.join(',');
        window.location.href = `/hr/candidates/compare?ids=${qs}`; }}>
        Сравнить {selectedIds.length}
      </Button>
      <DataTable selectable onSelectionChange={(ids)=>setSelectedIds(ids as number[])} columns={[
        {field:'id',header:'ID',render:r=>(<a href={`/hr/candidates/${r.id}`}>{r.id}</a>)},
        {field:'name',header:'Имя',render:r=>(<a href={`/hr/candidates/${r.id}`}>{r.name}</a>)},
        {field:'status',header:'Статус'},
        {field:'token',header:'Токен',render:r=>(<a href={`/interview/${r.token}`} target="_blank" rel="noreferrer">{r.token}</a>)},
        {field:'aiStatus',header:'AI',render:r=>(r.aiStatus==='done'?'✓':r.aiStatus==='pending'?'…':'')}
      ]} rows={candidates} />

    </Box>
  );
} 