"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box, Card, CardContent, Typography, Button, Chip, Divider, CircularProgress, Grid, Alert, Fab
} from "@mui/material";
import {
  IconBriefcase, IconFileText, IconUsers, IconEdit, IconArrowsDiff
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
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Snackbar from '@mui/material/Snackbar';
import Checkbox from '@mui/material/Checkbox';
import DeleteIcon from '@mui/icons-material/Delete';

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

export default function VacancyDetailClient() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [compareOpen, setCompareOpen] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState<number[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [currentQR, setCurrentQR] = useState<string>('');
  const [currentLink, setCurrentLink] = useState<string>('');
  const [tabValue, setTabValue] = useState('1');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      apiFetch(`${API_BASE}/api/admin/vacancies/${id}`),
      apiFetch(`${API_BASE}/api/admin/vacancies/${id}/candidates`)
    ]).then(([vacancyRes, candidatesRes]) => {
      if (vacancyRes.ok) vacancyRes.json().then(setData);
      if (candidatesRes.ok) candidatesRes.json().then(setCandidates);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setSnackbarMessage('Ссылка скопирована!');
    setSnackbarOpen(true);
  };

  const handleShowQR = (link: string) => {
    setCurrentLink(link);
    setCurrentQR(link);
    setQrDialogOpen(true);
  };

  const handleDeleteCandidate = async (candidateId: number) => {
    try {
      const response = await apiFetch(`${API_BASE}/api/admin/candidates/${candidateId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setCandidates(prev => prev.filter(c => c.id !== candidateId));
        setSnackbarMessage('Кандидат удален!');
        setSnackbarOpen(true);
      }
    } catch (error) {
      setSnackbarMessage('Ошибка при удалении!');
      setSnackbarOpen(true);
    }
    setDeleteDialogOpen(false);
    setCandidateToDelete(null);
  };

  if (loading || !data) {
    return (
      <PageContainer title="Загрузка вакансии">
        <Box sx={{ p: 4, textAlign: "center" }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  const { title, description, status, createdAt, updatedAt, template } = data;

  return (
    <PageContainer title={title}>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link href="/hr/vacancies" style={{ textDecoration: 'none', color: 'inherit' }}>
            Вакансии
          </Link>
          <Typography color="text.primary">{title}</Typography>
        </Breadcrumbs>
        
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" gutterBottom>
            {title}
          </Typography>
          <Box display="flex" gap={1}>
            <Button 
              variant="outlined" 
              startIcon={<IconEdit size={20}/>}
              onClick={() => router.push(`/hr/vacancy-edit/${id}`)}
            >
              Редактировать
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              disabled={selectedCandidates.length < 2} 
              onClick={()=>setCompareOpen(true)}
            >
              <IconArrowsDiff size={20} style={{marginRight: 8}}/>
              Сравнить кандидатов
            </Button>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Основная информация */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <IconFileText size={24} style={{marginRight: 8, verticalAlign: 'middle'}}/>
                Описание вакансии
              </Typography>
              <Typography variant="body1" paragraph>
                {description || 'Описание не указано'}
              </Typography>
              
              <Box display="flex" gap={2} flexWrap="wrap" mt={2}>
                <Chip 
                  label={`Статус: ${getStatusLabel(status)}`} 
                  color={status === 'active' ? 'success' : 'default'}
                  variant="outlined"
                />
                <Chip 
                  label={`Создана: ${format(new Date(createdAt), 'dd.MM.yyyy')}`} 
                  variant="outlined"
                />
                {updatedAt && (
                  <Chip 
                    label={`Обновлена: ${format(new Date(updatedAt), 'dd.MM.yyyy')}`} 
                    variant="outlined"
                  />
                )}
                {template && (
                  <Chip 
                    label={`Шаблон: ${template.title}`} 
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Статистика */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <IconUsers size={24} style={{marginRight: 8, verticalAlign: 'middle'}}/>
                Статистика
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Всего кандидатов:</Typography>
                  <Typography variant="h6" color="primary">{candidates.length}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Новых:</Typography>
                  <Typography variant="h6" color="warning.main">
                    {candidates.filter(c => c.status === 'new').length}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography>В процессе:</Typography>
                  <Typography variant="h6" color="info.main">
                    {candidates.filter(c => c.status === 'in_progress').length}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Завершено:</Typography>
                  <Typography variant="h6" color="success.main">
                    {candidates.filter(c => c.status === 'completed').length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Кандидаты */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              <IconUsers size={24} style={{marginRight: 8, verticalAlign: 'middle'}}/>
              Кандидаты ({candidates.length})
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => router.push('/hr/candidates/create')}
            >
              Добавить кандидата
            </Button>
          </Box>

          <TabContext value={tabValue}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <TabList onChange={(e, newValue) => setTabValue(newValue)}>
                <Tab label="Все" value="1" />
                <Tab label="Новые" value="2" />
                <Tab label="В процессе" value="3" />
                <Tab label="Завершено" value="4" />
              </TabList>
            </Box>
            
            <TabPanel value="1">
              <CandidatesTable 
                candidates={candidates} 
                onSelect={(id) => setSelectedCandidates(prev => 
                  prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
                )}
                selectedCandidates={selectedCandidates}
                onDelete={(id) => { setCandidateToDelete(id); setDeleteDialogOpen(true); }}
                onCopyLink={handleCopyLink}
                onShowQR={handleShowQR}
              />
            </TabPanel>
            
            <TabPanel value="2">
              <CandidatesTable 
                candidates={candidates.filter(c => c.status === 'new')} 
                onSelect={(id) => setSelectedCandidates(prev => 
                  prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
                )}
                selectedCandidates={selectedCandidates}
                onDelete={(id) => { setCandidateToDelete(id); setDeleteDialogOpen(true); }}
                onCopyLink={handleCopyLink}
                onShowQR={handleShowQR}
              />
            </TabPanel>
            
            <TabPanel value="3">
              <CandidatesTable 
                candidates={candidates.filter(c => c.status === 'in_progress')} 
                onSelect={(id) => setSelectedCandidates(prev => 
                  prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
                )}
                selectedCandidates={selectedCandidates}
                onDelete={(id) => { setCandidateToDelete(id); setDeleteDialogOpen(true); }}
                onCopyLink={handleCopyLink}
                onShowQR={handleShowQR}
              />
            </TabPanel>
            
            <TabPanel value="4">
              <CandidatesTable 
                candidates={candidates.filter(c => c.status === 'completed')} 
                onSelect={(id) => setSelectedCandidates(prev => 
                  prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
                )}
                selectedCandidates={selectedCandidates}
                onDelete={(id) => { setCandidateToDelete(id); setDeleteDialogOpen(true); }}
                onCopyLink={handleCopyLink}
                onShowQR={handleShowQR}
              />
            </TabPanel>
          </TabContext>
        </CardContent>
      </Card>

      {/* Диалог сравнения */}
      <Dialog open={compareOpen} onClose={()=>setCompareOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Сравнение кандидатов</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Выбрано кандидатов: {selectedCandidates.length}
          </Typography>
          <Box display="flex" flexDirection="column" gap={1}>
            {candidates
              .filter(c => selectedCandidates.includes(c.id))
              .map(candidate => (
                <Box key={candidate.id} display="flex" alignItems="center" gap={2} p={2} border={1} borderColor="divider" borderRadius={1}>
                  <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                    {candidate.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="subtitle1">{candidate.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{candidate.email}</Typography>
                  </Box>
                  <Chip label={getStatusLabel(candidate.status)} size="small" />
                </Box>
              ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompareOpen(false)}>Отмена</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setCompareOpen(false);
              router.push(`/hr/candidates/compare?ids=${selectedCandidates.join(',')}`);
            }}
          >
            Сравнить
          </Button>
        </DialogActions>
      </Dialog>

      {/* QR-код диалог */}
      <Dialog open={qrDialogOpen} onClose={() => setQrDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>QR-код для интервью</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <QRCode value={currentQR} size={200} />
            <Typography variant="body2" color="text.secondary" textAlign="center">
              {currentLink}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrDialogOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      {/* Диалог удаления */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Удалить кандидата?</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить этого кандидата? Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
          <Button 
            onClick={() => candidateToDelete && handleDeleteCandidate(candidateToDelete)} 
            color="error" 
            variant="contained"
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Уведомления */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />

      {/* FAB для быстрого добавления */}
      <Fab 
        color="primary" 
        aria-label="add" 
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => router.push('/hr/candidates/create')}
      >
        <AddIcon />
      </Fab>
    </PageContainer>
  );
}

// Компонент таблицы кандидатов
function CandidatesTable({ 
  candidates, 
  onSelect, 
  selectedCandidates, 
  onDelete, 
  onCopyLink, 
  onShowQR 
}: {
  candidates: any[];
  onSelect: (id: number) => void;
  selectedCandidates: number[];
  onDelete: (id: number) => void;
  onCopyLink: (link: string) => void;
  onShowQR: (link: string) => void;
}) {
  const router = useRouter();

  const columns = [
    {
      field: 'select',
      headerName: '',
      header: '',
      width: 50,
      renderCell: (params: any) => (
        <Checkbox 
          checked={selectedCandidates.includes(params.row.id)} 
          onChange={() => onSelect(params.row.id)}
        />
      )
    },
    {
      field: 'name',
      headerName: 'Имя',
      header: 'Имя',
      width: 200,
      renderCell: (params: any) => (
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
            {params.row.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="subtitle2">{params.row.name}</Typography>
            <Typography variant="caption" color="text.secondary">{params.row.email}</Typography>
          </Box>
        </Box>
      )
    },
    {
      field: 'status',
      headerName: 'Статус',
      header: 'Статус',
      width: 150,
      renderCell: (params: any) => (
        <Chip 
          label={getStatusLabel(params.row.status)} 
          color={params.row.status === 'completed' ? 'success' : params.row.status === 'in_progress' ? 'warning' : 'default'}
          size="small"
        />
      )
    },
    {
      field: 'createdAt',
      headerName: 'Дата добавления',
      header: 'Дата добавления',
      width: 150,
      renderCell: (params: any) => (
        <Typography variant="body2">
          {format(new Date(params.row.createdAt), 'dd.MM.yyyy HH:mm')}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: 'Действия',
      header: 'Действия',
      width: 200,
      renderCell: (params: any) => (
        <Box display="flex" gap={1}>
          <Tooltip title="Просмотр">
            <IconButton 
              size="small" 
              onClick={() => router.push(`/hr/candidates/${params.row.id}`)}
            >
              <IconUsers size={16} />
            </IconButton>
          </Tooltip>
          <CandidateActions 
            link={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sofihr.ru'}/interview/${params.row.token}`}
            onCopy={() => onCopyLink(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sofihr.ru'}/interview/${params.row.token}`)}
            onShowQR={() => onShowQR(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sofihr.ru'}/interview/${params.row.token}`)}
          />
          <Tooltip title="Удалить">
            <IconButton 
              size="small" 
              color="error"
              onClick={() => onDelete(params.row.id)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  return (
    <DataTable 
      rows={candidates} 
      columns={columns} 
      checkboxSelection
      disableSelectionOnClick
      onSelectionModelChange={(newSelection: any) => {
        newSelection.forEach((id: number) => onSelect(id));
      }}
    />
  );
} 