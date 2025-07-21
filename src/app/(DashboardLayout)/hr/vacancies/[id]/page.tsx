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
import React from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FilterListIcon from '@mui/icons-material/FilterList';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Link from "next/link";
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Snackbar from '@mui/material/Snackbar';
import Checkbox from '@mui/material/Checkbox';

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

function getStatusLabel(status: string) {
  switch (status) {
    case "completed":
      return "Завершено";
    case "finished":
      return "Завершено";
    case "in_progress":
      return "В процессе";
    case "pending":
      return "Ожидает";
    case "ready":
      return "Готов к интервью";
    case "failed":
      return "Ошибка";
    case "canceled":
      return "Отменено";
    case "new":
      return "Новый";
    case "rejected":
      return "Отклонён";
    default:
      return status;
  }
}

function CandidateActions({ link, onCopy, onShowQR }: { link: string, onCopy: () => void, onShowQR: () => void }) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  return (
    <Box display="flex" gap={1}>
      <Tooltip title="Действия">
        <IconButton size="small" onClick={handleClick}><FilterListIcon fontSize="small" /></IconButton>
      </Tooltip>
      <Popover open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={handleClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <List>
          <ListItem button onClick={() => { onCopy(); handleClose(); }}>
            <ListItemIcon><ContentCopyIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="Скопировать ссылку" />
          </ListItem>
          <ListItem button onClick={() => { onShowQR(); handleClose(); }}>
            <ListItemIcon><QrCodeIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="Показать QR-код" />
          </ListItem>
        </List>
      </Popover>
    </Box>
  );
}

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
  // moved adding state into dialog component
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [tab, setTab] = useState('1');
  const [snackbar, setSnackbar] = useState<string|null>(null);
  const [selectedCandidates, setSelectedCandidates] = useState<number[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

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
    <Box mb={4}>
      <Breadcrumbs sx={{ mb: 2 }} aria-label="breadcrumb">
        <Link href="/hr/vacancies" style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 500 }}>Вакансии</Link>
        <Typography color="text.primary">{title}</Typography>
      </Breadcrumbs>
      <Card sx={{ p: 0, background: '#fff', boxShadow: 3 }}>
        <Box p={4} display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap">
          <Box>
            <Typography variant="h3" fontWeight={800} sx={{ mb: 1, color: 'text.primary' }}>{title}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.7, color: 'text.secondary' }}>Создана: {createdAt}</Typography>
            <Box display="flex" gap={2} mt={2}>
              <Chip icon={<IconFileText size={18}/>} label={template?.title || 'Без шаблона'} color={template ? 'secondary' : 'default'} sx={{ fontWeight: 600 }} />
              <Chip icon={<IconFileText size={18}/>} label={`Вопросов: ${(questions||[]).length}`} color="primary" sx={{ fontWeight: 600 }} />
              <Chip icon={<IconUsers size={18}/>} label={`Кандидатов: ${candidates.length}`} color="success" sx={{ fontWeight: 600 }} />
            </Box>
          </Box>
          <Button variant="contained" color="primary" size="large" startIcon={<IconEdit size={24}/>} sx={{ fontWeight: 700, minWidth: 180, mt: { xs: 2, md: 0 } }} onClick={()=>router.push(`/hr/vacancy-edit/${id}`)}>
            Редактировать
          </Button>
        </Box>
      </Card>
    </Box>
  );

  return (
    <PageContainer title={`Вакансия: ${title}`}> 
      {header}
      <TabContext value={tab}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <TabList onChange={(_, v) => setTab(v)} aria-label="vacancy tabs">
            <Tab icon={<IconUsers size={20}/>} iconPosition="start" label={`Кандидаты (${candidates.length})`} value="1" />
            <Tab icon={<IconBriefcase size={20}/>} iconPosition="start" label="Описание" value="2" />
            <Tab icon={<IconFileText size={20}/>} iconPosition="start" label={`Вопросы (${(questions||[]).length})`} value="3" />
          </TabList>
        </Box>
        <TabPanel value="1" sx={{p:0}}>
          {/* Кандидаты — основной блок, как было, но с улучшениями */}
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Card sx={{ background: '#fff', color: 'text.primary', position: 'relative', overflow: 'hidden', mb: 3, boxShadow: 1 }}>
                <CardContent sx={{ position: 'relative', zIndex: 1, p: 4 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box sx={{ p: 2, borderRadius: 2, background: '#f5f5f5', backdropFilter: 'blur(10px)' }}>
                        <IconUsers size={32} color="#1976d2" />
                      </Box>
                      <Box>
                        <Typography variant="h4" fontWeight="700" sx={{ mb: 1, color: 'text.primary' }}>Кандидаты</Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9, color: 'text.secondary' }}>Всего: {candidates.length}</Typography>
                      </Box>
                    </Box>
                    <Box display="flex" gap={2}>
                      <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={()=>setAddDialogOpen(true)} sx={{fontWeight:600}}>
                        Добавить кандидата
                      </Button>
                      <Button variant="contained" color="primary" disabled={selectedCandidates.length !== 2} onClick={()=>setCompareOpen(true)}>
                        Сравнить выбранных
                      </Button>
                    </Box>
                  </Box>
                  {/* Фильтр вынесен отдельно */}
                  <Box display="flex" alignItems="center" gap={2} mb={4}>
                    <FilterListIcon sx={{color:'#1976d2',opacity:0.7}} />
                    <Typography variant="body2" sx={{color:'text.secondary',opacity:0.8}}>Фильтр по статусу:</Typography>
                    <Button size="small" variant={!statusFilter?'contained':'outlined'} color="primary" onClick={()=>setStatusFilter('')} sx={{fontWeight:600}}>
                      Все
                    </Button>
                    {statusList.map(st => (
                      <Button key={st} size="small" variant={statusFilter===st?'contained':'outlined'} color="primary" onClick={()=>setStatusFilter(st)} sx={{fontWeight:600}}>{getStatusLabel(st)}</Button>
                    ))}
                  </Box>
                  <DataTable columns={[
                    {field:'select',header:'',render:(r:any)=>(
                      <Checkbox
                        checked={selectedCandidates.includes(r.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            if (selectedCandidates.length < 2) setSelectedCandidates([...selectedCandidates, r.id]);
                          } else {
                            setSelectedCandidates(selectedCandidates.filter(id => id !== r.id));
                          }
                        }}
                        disabled={selectedCandidates.length === 2 && !selectedCandidates.includes(r.id)}
                        size="small"
                        color="primary"
                      />
                    )},
                    {field:'name',header:'Имя',render:(r:any)=>(
                      <Link href={`/hr/candidates/${r.id}`} style={{ textDecoration: 'none' }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2', fontWeight: 700 }}>{r.name ? r.name.split(' ').map((n:string)=>n[0]).join('').toUpperCase() : '?'}</Avatar>
                          <Typography sx={{color:'#1976d2',fontWeight:700}}>{r.name}</Typography>
                        </Box>
                      </Link>
                    )},
                    {field:'email',header:'Email',render:(r:any)=>r.email||'-'},
                    {field:'phone',header:'Телефон',render:(r:any)=>r.phone||'-'},
                    {field:'status',header:'Статус', render:(r:any)=>(<Chip size="small" label={getStatusLabel(r.status)} />)} ,
                    {field:'score',header:'Оценка',render:(r:any)=>r.score !== undefined && r.score !== null ? (<Chip label={r.score} color={r.score >= 8 ? 'success' : r.score >= 5 ? 'warning' : 'error'} size="small" />) : '-'},
                    {field:'createdAt',header:'Дата добавления',render:(r:any)=>r.createdAt ? format(new Date(r.createdAt), 'dd.MM.yyyy HH:mm') : '-'},
                    {field:'actions',header:'',render:(r:any)=>(
                      <Box display="flex" gap={1} alignItems="center">
                        <Tooltip title="Скопировать ссылку на интервью">
                          <IconButton size="small" color="primary" onClick={() => {
                            navigator.clipboard.writeText(typeof window !== 'undefined' ? `${window.location.origin}/interview/${r.token}` : '');
                            setSnackbar('Ссылка скопирована!');
                          }}>
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Показать QR-код для интервью">
                          <IconButton size="small" color="secondary" onClick={() => setQrDialog({open:true,url:typeof window !== 'undefined' ? `${window.location.origin}/interview/${r.token}` : ''})}>
                            <QrCodeIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )},
                  ]} rows={filteredCandidates} defaultRowsPerPage={7} />
                  {filteredCandidates.length === 0 && (
                    <Box textAlign="center" py={4}>
                      <Typography variant="h6" color="textSecondary" gutterBottom>
                        Нет кандидатов по выбранному фильтру
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Добавьте первого кандидата или измените фильтр
                      </Typography>
                    </Box>
                  )}
                  <Snackbar open={!!snackbar} autoHideDuration={2000} onClose={()=>setSnackbar(null)} message={snackbar} />
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
              <Card sx={{ background: '#fff', color: 'text.primary', position: 'relative', overflow: 'hidden', mb:3, boxShadow: 1 }}>
                <CardContent sx={{ position: 'relative', zIndex: 1, p: 4 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <IconBriefcase size={28} color="#1976d2" />
                    <Typography variant="h6" fontWeight="700" color="text.primary">Вакансия</Typography>
                  </Box>
                  <Typography variant="body1" sx={{ opacity: 0.9, mb: 1, color: 'text.primary' }}>{title}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, mb: 1, color: 'text.secondary' }}>Создана: {createdAt}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, color: 'text.secondary' }}>{description || <span style={{opacity:0.6}}>Описание не заполнено</span>}</Typography>
                  <Divider sx={{ my: 2, borderColor: '#eee' }} />
                  <Button variant="outlined" color="primary" startIcon={<IconEdit size={20}/>} onClick={()=>router.push(`/hr/vacancy-edit/${id}`)} sx={{fontWeight:600}}>
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
              <Card sx={{ background: '#fff', color: 'text.primary', position: 'relative', overflow: 'hidden', boxShadow: 1 }}>
                <CardContent sx={{ position: 'relative', zIndex: 1, p: 4 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <IconFileText size={28} color="#1976d2" />
                    <Typography variant="h6" fontWeight="700" color="text.primary">Вопросы теста</Typography>
                  </Box>
                  <Typography variant="body1" sx={{ opacity: 0.9, mb: 1, color: 'text.primary' }}>{template?.title || 'Без шаблона'}</Typography>
                  {template?.description && <Typography variant="body2" sx={{ mb: 1, opacity: 0.9, color: 'text.secondary' }}>{template.description}</Typography>}
                  <Divider sx={{ my: 2, borderColor: '#eee' }} />
                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>Вопросы:</Typography>
                  <Box sx={{ maxHeight: 320, overflowY: 'auto', mb: 2 }}>
                    {(questions||[]).length === 0 ? (
                      <Typography variant="body2" sx={{ opacity: 0.7, color: 'text.secondary' }}>Вопросы не добавлены</Typography>
                    ) : (
                      (questions||[]).map((q:any)=>(
                        <Box key={q.position} sx={{ mb: 1, p: 1, borderRadius: 1, background: '#f5f5f5' }}>
                          <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>{q.position+1}. {q.text}</Typography>
                        </Box>
                      ))
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </TabContext>
      {/* Диалоги и QR-код — как было */}
      <AddCandidateDialog open={addDialogOpen} vacancyId={id} onClose={()=>setAddDialogOpen(false)} onAdded={()=>{
        apiFetch(`${API_BASE}/api/admin/vacancies/${id}/candidates`).then(r=>r.json()).then(setCandidates);
      }} />
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
      {/* Попап сравнения двух кандидатов */}
      <Dialog open={compareOpen} onClose={()=>setCompareOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Сравнение кандидатов</DialogTitle>
        <DialogContent>
          {selectedCandidates.length === 2 ? (
            <Grid container spacing={2}>
              {selectedCandidates.map((id, idx) => {
                const cand = candidates.find((c:any) => c.id === id);
                return (
                  <Grid item xs={12} sm={6} key={id}>
                    <Card sx={{p:2}}>
                      <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <Avatar sx={{ width: 40, height: 40, bgcolor: '#1976d2', fontWeight: 700 }}>{cand.name ? cand.name.split(' ').map((n:string)=>n[0]).join('').toUpperCase() : '?'}</Avatar>
                        <Typography variant="h6" fontWeight={700}>{cand.name}</Typography>
                      </Box>
                      <Typography variant="body2">Email: {cand.email || '-'}</Typography>
                      <Typography variant="body2">Телефон: {cand.phone || '-'}</Typography>
                      <Typography variant="body2">Статус: {getStatusLabel(cand.status)}</Typography>
                      <Typography variant="body2">Оценка: {cand.score !== undefined && cand.score !== null ? cand.score : '-'}</Typography>
                      <Typography variant="body2">Дата добавления: {cand.createdAt ? format(new Date(cand.createdAt), 'dd.MM.yyyy HH:mm') : '-'}</Typography>
                      <Button variant="outlined" color="primary" fullWidth sx={{mt:2}} onClick={()=>router.push(`/hr/candidates/${cand.id}`)}>Подробнее</Button>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <Typography>Выберите двух кандидатов для сравнения.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setCompareOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
} 

// --- AddCandidateDialog component ---
function AddCandidateDialog({open, onClose, vacancyId, onAdded}:{open:boolean; onClose:()=>void; vacancyId:string; onAdded:()=>void}){
  const [form,setForm] = React.useState({name:'',email:'',phone:''});
  const [loading,setLoading]=React.useState(false);
  const canSubmit = form.name.trim()!=='' && !loading;
  const handleChange=(field:keyof typeof form)=>(e:React.ChangeEvent<HTMLInputElement>)=>setForm({...form,[field]:e.target.value});
  const handleSubmit=async()=>{
    if(!canSubmit) return;
    setLoading(true);
    const res = await apiFetch(`${API_BASE}/api/admin/candidates`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,vacancyId})});
    setLoading(false);
    if(res.ok){ setForm({name:'',email:'',phone:''}); onClose(); onAdded(); }
  };
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Добавить кандидата</DialogTitle>
      <DialogContent>
        <TextField label="Имя" fullWidth sx={{mb:2}} value={form.name} onChange={handleChange('name')} autoFocus />
        <TextField label="Email" fullWidth sx={{mb:2}} value={form.email} onChange={handleChange('email')} />
        <TextField label="Телефон" fullWidth sx={{mb:2}} value={form.phone} onChange={handleChange('phone')} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button variant="contained" disabled={!canSubmit} onClick={handleSubmit}>{loading?'Добавление…':'Добавить'}</Button>
      </DialogActions>
    </Dialog>
  );
} 
