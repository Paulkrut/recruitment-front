"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box, Card, CardContent, Typography, Button, Chip, Divider, CircularProgress, Grid
} from "@mui/material";
import {
  IconBriefcase, IconFileText, IconUsers, IconEdit
} from "@tabler/icons-react";
import DataTable from "@/components/DataTable";
import PageContainer from "@/app/components/container/PageContainer";
import { apiFetch } from "@/utils/api";
import QRCode from 'react-qr-code';
import { format } from 'date-fns';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import QrCodeIcon from '@mui/icons-material/QrCode2';
import AddIcon from '@mui/icons-material/Add';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FilterListIcon from '@mui/icons-material/FilterList';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

export default function HRVacancyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [qrDialog, setQrDialog] = useState<{open: boolean, url: string}>({open: false, url: ''});
  const [copyMsg, setCopyMsg] = useState<string|null>(null);
  const [newCandidate, setNewCandidate] = useState({ name: '', email: '', phone: '' });
  const [adding, setAdding] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [tab, setTab] = useState('1');

  // Перемещаем хуки useMemo выше любых return и условий
  const filteredCandidates = useMemo(() => statusFilter ? candidates.filter(c => c.status === statusFilter) : candidates, [candidates, statusFilter]);
  const statusList = useMemo(() => Array.from(new Set(candidates.map(c => c.status))), [candidates]);

  useEffect(() => {
    const t = localStorage.getItem("recruitment_token");
    if (t) setToken(t);
  }, []);

  useEffect(() => {
    if (!token || !id) return;
    setLoading(true);
    apiFetch(`${API_BASE}/api/admin/vacancies/${id}/full`).then(r => r.json()).then(setData).finally(()=>setLoading(false));
    apiFetch(`${API_BASE}/api/admin/vacancies/${id}/candidates`).then(r=>r.json()).then(setCandidates);
  }, [token, id]);

  if (!token) return <PageContainer title="Вакансия"><Box sx={{p:4}}><Typography>Нет доступа</Typography></Box></PageContainer>;
  if (loading || !data) return <PageContainer title="Вакансия"><Box sx={{p:4, textAlign:'center'}}><CircularProgress /></Box></PageContainer>;

  const { title, description, template, questions } = data;
  const createdAt = data.createdAt ? format(new Date(data.createdAt), 'dd.MM.yyyy HH:mm') : '';

  // --- Шапка ---
  const header = (
    <Card sx={{ mb: 4, p: 0, background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)', boxShadow: 3 }}>
      <Box p={4} display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h4" fontWeight={700}>{title}</Typography>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>Создана: {createdAt}</Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button variant="outlined" color="primary" startIcon={<IconEdit size={20}/>} onClick={()=>router.push(`/hr/vacancy-edit/${id}`)}>
            Редактировать
          </Button>
        </Box>
      </Box>
      <Box px={4} pb={4} display="flex" gap={3} flexWrap="wrap">
        <Chip label={template?.title || 'Без шаблона'} color="secondary" />
        <Chip label={`Вопросов: ${(questions||[]).length}`} />
        <Chip label={`Кандидатов: ${candidates.length}`} />
      </Box>
    </Card>
  );

  return (
    <PageContainer title={`Вакансия: ${title}`}> 
      {header}
      <TabContext value={tab}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <TabList onChange={(_, v) => setTab(v)} aria-label="vacancy tabs">
            <Tab label="Кандидаты" value="1" />
            <Tab label="Описание" value="2" />
            <Tab label="Вопросы теста" value="3" />
          </TabList>
        </Box>
        <TabPanel value="1" sx={{p:0}}>
          {/* Кандидаты — основной блок, как было */}
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', zIndex: 0 }} />
                <CardContent sx={{ position: 'relative', zIndex: 1, p: 4 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box sx={{ p: 2, borderRadius: 2, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
                        <IconUsers size={32} color="white" />
                      </Box>
                      <Box>
                        <Typography variant="h4" fontWeight="700" sx={{ mb: 1 }}>Кандидаты</Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>Всего: {candidates.length}</Typography>
                      </Box>
                    </Box>
                    <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={()=>setAddDialogOpen(true)} sx={{fontWeight:600}}>
                      Добавить кандидата
                    </Button>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <FilterListIcon sx={{color:'white',opacity:0.7}} />
                    <Typography variant="body2" sx={{color:'white',opacity:0.8}}>Фильтр по статусу:</Typography>
                    <Button size="small" variant={!statusFilter?'contained':'outlined'} color="inherit" onClick={()=>setStatusFilter('')} sx={{color:!statusFilter?'#fff':'#fff',borderColor:'#fff',fontWeight:600}}>Все</Button>
                    {statusList.map(st => (
                      <Button key={st} size="small" variant={statusFilter===st?'contained':'outlined'} color="inherit" onClick={()=>setStatusFilter(st)} sx={{color:statusFilter===st?'#fff':'#fff',borderColor:'#fff',fontWeight:600}}>{st}</Button>
                    ))}
                  </Box>
                  <DataTable columns={[
                    {field:'id',header:'ID',render:(r:any)=>(<Link href={`/hr/candidates/${r.id}`}>{r.id}</Link>)},
                    {field:'name',header:'Имя',render:(r:any)=>(<Link href={`/hr/candidates/${r.id}`}>{r.name}</Link>)},
                    {field:'email',header:'Email',render:(r:any)=>r.email||'-'},
                    {field:'phone',header:'Телефон',render:(r:any)=>r.phone||'-'},
                    {field:'status',header:'Статус', render:(r:any)=>(<Chip size="small" label={r.status}/>)} ,
                    {field:'createdAt',header:'Дата добавления',render:(r:any)=>r.createdAt ? format(new Date(r.createdAt), 'dd.MM.yyyy HH:mm') : '-'},
                    {field:'actions',header:'',render:(r:any)=>{
                      const link = `${window.location.origin}/interview/${r.token}`;
                      return <Box display="flex" gap={1}>
                        <Tooltip title="Скопировать ссылку">
                          <IconButton size="small" onClick={()=>{navigator.clipboard.writeText(link); setCopyMsg('Ссылка скопирована!'); setTimeout(()=>setCopyMsg(null),1500);}}><ContentCopyIcon fontSize="small" /></IconButton>
                        </Tooltip>
                        <Tooltip title="QR-код для прохождения">
                          <IconButton size="small" onClick={()=>setQrDialog({open:true,url:link})}><QrCodeIcon fontSize="small" /></IconButton>
                        </Tooltip>
                      </Box>;
                    }},
                  ]} rows={filteredCandidates} defaultRowsPerPage={7} />
                  {copyMsg && <Typography sx={{mt:1, color:'#fff'}}>{copyMsg}</Typography>}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        <TabPanel value="2" sx={{p:0}}>
          {/* Описание вакансии — только карточка вакансии */}
          <Grid container spacing={4}>
            <Grid item xs={12}>
              {/* Карточка вакансии */}
              <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', position: 'relative', overflow: 'hidden', mb:3 }}>
                <Box sx={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', zIndex: 0 }} />
                <CardContent sx={{ position: 'relative', zIndex: 1, p: 4 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <IconBriefcase size={28} color="white" />
                    <Typography variant="h6" fontWeight="700">Вакансия</Typography>
                  </Box>
                  <Typography variant="body1" sx={{ opacity: 0.9, mb: 1 }}>{title}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Создана: {createdAt}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>{description}</Typography>
                  <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.3)' }} />
                  <Button variant="outlined" color="inherit" startIcon={<IconEdit size={20}/>} onClick={()=>router.push(`/hr/vacancy-edit/${id}`)} sx={{color:'white',borderColor:'white'}}>
                    Редактировать
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        <TabPanel value="3" sx={{p:0}}>
          {/* Вопросы теста — отдельная карточка */}
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ position: 'absolute', bottom: -30, left: -30, width: 120, height: 120, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', zIndex: 0 }} />
                <CardContent sx={{ position: 'relative', zIndex: 1, p: 4 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <IconFileText size={28} color="white" />
                    <Typography variant="h6" fontWeight="700">Вопросы теста</Typography>
                  </Box>
                  <Typography variant="body1" sx={{ opacity: 0.9, mb: 1 }}>{template?.title || 'Без шаблона'}</Typography>
                  {template?.description && <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>{template.description}</Typography>}
                  <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.3)' }} />
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Вопросы:</Typography>
                  <Box sx={{ maxHeight: 320, overflowY: 'auto', mb: 2 }}>
                    {(questions||[]).map((q:any)=>(
                      <Box key={q.position} sx={{ mb: 1 }}>
                        <Typography variant="body2" sx={{ color: '#fff', fontWeight: 500 }}>{q.position+1}. {q.text}</Typography>
                        <Typography variant="caption" sx={{ color: '#fff', opacity: 0.7 }}>Тип: {q.type}, Время: {q.maxTime} сек</Typography>
                      </Box>
                    ))}
                  </Box>
                  <Button variant="outlined" color="inherit" startIcon={<IconEdit size={20}/>} onClick={()=>router.push(`/hr/vacancy-edit/${id}`)} sx={{color:'white',borderColor:'white'}}>
                    Редактировать тест
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </TabContext>
      {/* Диалоги и QR-код — как было */}
      <Dialog open={addDialogOpen} onClose={()=>setAddDialogOpen(false)}>
        <DialogTitle>Добавить кандидата</DialogTitle>
        <DialogContent>
          <TextField label="Имя" fullWidth sx={{mb:2}} value={newCandidate.name} onChange={e=>setNewCandidate({...newCandidate, name: e.target.value})} />
          <TextField label="Email" fullWidth sx={{mb:2}} value={newCandidate.email} onChange={e=>setNewCandidate({...newCandidate, email: e.target.value})} />
          <TextField label="Телефон" fullWidth sx={{mb:2}} value={newCandidate.phone} onChange={e=>setNewCandidate({...newCandidate, phone: e.target.value})} />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setAddDialogOpen(false)}>Отмена</Button>
          <Button variant="contained" disabled={adding||!newCandidate.name} onClick={async()=>{
            setAdding(true);
            const res = await apiFetch(`${API_BASE}/api/admin/candidates`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...newCandidate, vacancyId: id})});
            if(res.ok){ setAddDialogOpen(false); setNewCandidate({name:'',email:'',phone:''}); apiFetch(`${API_BASE}/api/admin/vacancies/${id}/candidates`).then(r=>r.json()).then(setCandidates); }
            setAdding(false);
          }}>Добавить</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={qrDialog.open} onClose={()=>setQrDialog({open:false,url:''})}>
        <DialogTitle>QR-код для прохождения теста</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <QRCode value={qrDialog.url} size={200} />
            <Button variant="outlined" onClick={()=>{
              const svg = document.querySelector('#qr-download svg');
              if(svg){
                const serializer = new XMLSerializer();
                const source = serializer.serializeToString(svg);
                const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
                const url = URL.createObjectURL(svgBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'qr-code.svg';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }
            }}>Скачать QR-код (SVG)</Button>
          </Box>
          <Box id="qr-download" style={{display:'none'}}><QRCode value={qrDialog.url} size={400} /></Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setQrDialog({open:false,url:''})}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
} 