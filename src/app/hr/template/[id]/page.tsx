"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Chip, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import { apiFetch } from "@/utils/api";

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

interface QuestionRow{ id:number; position:number; text:string; type:string; maxTime?:number; }

export default function TemplateDetailPage(){
  const {id} = useParams<{id:string}>();
  const [data,setData] = useState<{title:string;description?:string;questions:QuestionRow[]}|null>(null);
  const [confirmOpen,setConfirmOpen] = useState(false);

  useEffect(()=>{
    apiFetch(`${API_BASE}/api/admin/templates/${id}`).then(r=>r.json()).then(setData);
  },[id]);

  if(!data) return (<Box sx={{p:4}}><Typography>Загрузка…</Typography></Box>);

  async function handleDelete(){
    const res = await apiFetch(`${API_BASE}/api/admin/templates/${id}`,{method:'DELETE'});
    if(res.ok){ window.location.replace('/hr/templates'); }
  }

  return (<Box sx={{p:4}}>
    <Typography variant="h4" gutterBottom>Шаблон: {data.title}</Typography>
    <Box sx={{mb:2}}>
      <Button variant="outlined" href={`/hr/template/${id}/edit`} sx={{mr:1}}>Редактировать</Button>
      <Button variant="outlined" color="error" onClick={()=>setConfirmOpen(true)}>Удалить</Button>
    </Box>
    {data.description && <Typography sx={{mb:2}}>{data.description}</Typography>}
    <Paper sx={{p:2}}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell><TableCell>Вопрос</TableCell><TableCell>Тип</TableCell><TableCell>Время, сек</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.questions.map(q=>(<TableRow key={q.id}><TableCell>{q.position+1}</TableCell><TableCell>{q.text}</TableCell><TableCell><Chip label={q.type}/></TableCell><TableCell>{q.maxTime||'-'}</TableCell></TableRow>))}
        </TableBody>
      </Table>
    </Paper>
    <Dialog open={confirmOpen} onClose={()=>setConfirmOpen(false)}>
      <DialogTitle>Удалить шаблон</DialogTitle>
      <DialogContent>
        <DialogContentText>Вы уверены, что хотите удалить этот шаблон? Это действие нельзя отменить.</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={()=>setConfirmOpen(false)}>Отмена</Button>
        <Button color="error" onClick={handleDelete}>Удалить</Button>
      </DialogActions>
    </Dialog>
  </Box>);
} 