"use client";
import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Button, Chip, Dialog, 
  DialogTitle, DialogContent, DialogActions, TextField, 
  Alert, IconButton, Tooltip, Card, CardContent, Grid
} from '@mui/material';
import {
  DeleteForever, Visibility, CheckCircle, Cancel, 
  Warning, Info, Email, Person, CalendarToday
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';


const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://localhost:8000";

interface ForgetMeRequest {
  id: number;
  email: string;
  name: string;
  phone?: string;
  interviewDate?: string;
  reason?: string;
  status: 'pending' | 'processed' | 'rejected';
  requestedAt: string;
  processedAt?: string;
  adminNotes?: string;
  candidate?: {
    id: number;
    name: string;
    email: string;
  };
}

export default function ForgetMeRequestsPage() {
  const { _ } = useLingui();

  const [requests, setRequests] = useState<ForgetMeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ForgetMeRequest | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Вспомогательная функция для получения заголовков с токеном
  const getAuthHeaders = () => {
    const token = localStorage.getItem('recruitment_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/hr/privacy/forget-me-requests`, {
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      } else if (response.status === 401) {
        setError(_(msg`Сессия истекла. Пожалуйста, войдите в систему заново.`));
        // Можно добавить редирект на страницу входа
        // window.location.href = '/auth/login';
      } else {
        setError(_(msg`Ошибка при загрузке запросов`));
      }
    } catch (error) {
      setError(_(msg`Ошибка соединения`));
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRequest = async (requestId: number) => {
    if (!adminNotes.trim()) {
      setError(_(msg`Пожалуйста, добавьте комментарий`));
      return;
    }

    setProcessing(true);
    
    try {
      const token = localStorage.getItem('recruitment_token');
      const response = await fetch(`${API_BASE}/api/hr/privacy/forget-me-requests/${requestId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ adminNotes })
      });

      if (response.ok) {
        // Обновляем список запросов
        await fetchRequests();
        setProcessDialogOpen(false);
        setSelectedRequest(null);
        setAdminNotes('');
        setError(null);
      } else if (response.status === 401) {
        setError(_(msg`Сессия истекла. Пожалуйста, войдите в систему заново.`));
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Ошибка при обработке запроса');
      }
    } catch (error) {
      setError(_(msg`Ошибка соединения`));
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'processed': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return _(msg`Требует подтверждения`);
      case 'processed': return _(msg`Подтверждено`);
      case 'rejected': return _(msg`Отклонено`);
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd.MM.yyyy HH:mm', { locale: ru });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom><Trans>Загрузка запросов на удаление данных...</Trans></Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Заголовок */}
      <Box mb={4}>
        <Typography variant="h3" gutterBottom fontWeight="bold">
          <DeleteForever sx={{ mr: 2, verticalAlign: 'middle', color: 'warning.main' }} />
          Уведомления об удалении данных кандидатов
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom><Trans>Информация для HR-клиентов о кандидатах, чьи данные были удалены с платформы</Trans></Typography>
        
        {/* Подробное описание для HR */}
        <Paper elevation={1} sx={{ p: 3, mt: 3, bgcolor: 'info.light' }}>
          <Typography variant="h6" gutterBottom fontWeight={600} color="info.dark"><Trans>📋 Что это за страница и зачем она нужна?</Trans></Typography>
          
          <Typography variant="body1" paragraph>
            Эта страница содержит <strong>уведомления о кандидатах, чьи персональные данные уже удалены</strong> 
            с платформы SofiHR в соответствии с их запросами на реализацию права на забвение (152-ФЗ).
          </Typography>
          
          <Typography variant="body1" paragraph>
            <strong>Важно:</strong> Данные уже удалены с нашей платформы, но <strong>вы обязаны удалить все копии 
            этих данных, которые вы получили от нас</strong> в соответствии с 152-ФЗ "О персональных данных".
          </Typography>
          
          <Typography variant="h6" gutterBottom fontWeight={600} color="warning.dark" sx={{ mt: 3 }}><Trans>⚠️ Что именно нужно удалить у HR-клиентов!</Trans></Typography>
          
          <Typography variant="body1" paragraph>
            При получении уведомления вы должны удалить из своих систем только <strong>копии данных, 
            полученных с платформы SofiHR</strong>:
          </Typography>
          
          <Box component="ul" sx={{ pl: 3, mb: 2 }}>
            <Typography component="li" variant="body2" paragraph>
              • <strong>Копии резюме и анкет</strong> кандидата, скачанные с нашей платформы
            </Typography>
            <Typography component="li" variant="body2" paragraph>
              • <strong>Копии результатов интервью</strong> и оценки, полученные от SofiHR
            </Typography>
            <Typography component="li" variant="body2" paragraph>
              • <strong>Копии видео/аудио записей</strong> интервью, переданные вам
            </Typography>
            <Typography component="li" variant="body2" paragraph>
              • <strong>Любые другие копии данных</strong>, которые вы получили от нас
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
            <strong>Примечание:</strong> Если у вас есть <strong>собственные данные</strong> о кандидате 
            (например, личные встречи, переписка, собственные оценки), которые НЕ связаны с платформой SofiHR, 
            то их удалять НЕ обязательно.
          </Typography>
          
          <Typography variant="h6" gutterBottom fontWeight={600} color="success.dark" sx={{ mt: 3 }}><Trans>🎯 Как работать с этой страницей?</Trans></Typography>
          
          <Box component="ol" sx={{ pl: 3, mb: 2 }}>
            <Typography component="li" variant="body2" paragraph>
              <strong>1. Просмотр уведомлений</strong> - в таблице отображаются кандидаты, чьи данные удалены с платформы
            </Typography>
            <Typography component="li" variant="body2" paragraph>
              <strong>2. Анализ информации</strong> - нажмите "👁️" для просмотра деталей
            </Typography>
            <Typography component="li" variant="body2" paragraph>
              <strong>3. Удаление копий</strong> - удалите из своих систем копии данных, полученных от SofiHR
            </Typography>
            <Typography component="li" variant="body2" paragraph>
              <strong>4. Подтверждение</strong> - отметьте что выполнили требования по удалению
            </Typography>
          </Box>
          
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>⚠️ Внимание:</strong> Невыполнение требований по удалению копий данных, полученных от SofiHR, 
              может привести к нарушению 152-ФЗ и административной ответственности!
            </Typography>
          </Alert>
        </Paper>
      </Box>

      {/* Статистика */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="warning.main" gutterBottom>
                {requests.filter(r => r.status === 'pending').length}
              </Typography>
              <Typography variant="body2" color="text.secondary"><Trans>Требуют подтверждения</Trans></Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="success.main" gutterBottom>
                {requests.filter(r => r.status === 'processed').length}
              </Typography>
              <Typography variant="body2" color="text.secondary"><Trans>Подтверждено удаление</Trans></Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="error.main" gutterBottom>
                {requests.filter(r => r.status === 'rejected').length}
              </Typography>
              <Typography variant="body2" color="text.secondary"><Trans>Отклонено</Trans></Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Информация о статусах */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom fontWeight={600} color="text.primary"><Trans>�� Понимание статусов уведомлений</Trans></Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Chip label={_(msg`Требует подтверждения`)} color="warning" size="small" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary"><Trans>HR-клиент еще не подтвердил удаление копий данных</Trans></Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Chip label={_(msg`Подтверждено`)} color="success" size="small" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary"><Trans>HR-клиент подтвердил удаление копий данных из своих систем</Trans></Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Chip label={_(msg`Отклонено`)} color="error" size="small" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary"><Trans>Запрос на удаление отклонен по веским причинам</Trans></Typography>
            </Box>
          </Grid>
        </Grid>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
          <strong>Примечание:</strong> Статус "Подтверждено" означает, что HR-клиент подтвердил удаление 
          копий данных, полученных от SofiHR, из своих внутренних систем. Данные с платформы SofiHR уже удалены.
        </Typography>
      </Paper>

      {/* Ошибки */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Таблица запросов */}
      <Paper elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Кандидат</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Дата удаления с платформы</strong></TableCell>
                <TableCell><strong>Дата запроса</strong></TableCell>
                <TableCell><strong>Статус</strong></TableCell>
                <TableCell><strong>Действия</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary"><Trans>Уведомлений об удалении данных пока нет</Trans></Typography>
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" fontWeight={500}>
                          {request.name}
                        </Typography>
                        {request.phone && (
                          <Typography variant="body2" color="text.secondary">
                            {request.phone}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {request.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {request.processedAt ? formatDate(request.processedAt) : 'Не указана'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(request.requestedAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(request.status)}
                        color={getStatusColor(request.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title={_(msg`Просмотреть детали`)}>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedRequest(request);
                              setDetailDialogOpen(true);
                            }}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        
                        {request.status === 'pending' && (
                          <Tooltip title={_(msg`Подтвердить удаление копий данных`)}>
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => {
                                setSelectedRequest(request);
                                setProcessDialogOpen(true);
                              }}
                            >
                              <CheckCircle />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Диалог деталей */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Person />
            Детали уведомления об удалении данных кандидата
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary"><Trans>Имя кандидата</Trans></Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedRequest.name}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedRequest.email}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary"><Trans>Телефон</Trans></Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedRequest.phone || 'Не указан'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary"><Trans>Дата интервью</Trans></Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedRequest.interviewDate ? formatDate(selectedRequest.interviewDate) : 'Не указана'}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary"><Trans>Причина удаления</Trans></Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedRequest.reason || 'Не указана'}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary"><Trans>Типы данных для удаления</Trans></Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {/* The parseConsentTypes function is removed, so this block will be empty or need to be re-implemented */}
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary"><Trans>Дата запроса</Trans></Typography>
                <Typography variant="body1" gutterBottom>
                  {formatDate(selectedRequest.requestedAt)}
                </Typography>
              </Grid>
              
              {selectedRequest.processedAt && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary"><Trans>Дата обработки</Trans></Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(selectedRequest.processedAt)}
                  </Typography>
                </Grid>
              )}
              
              {selectedRequest.adminNotes && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary"><Trans>Комментарий администратора</Trans></Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedRequest.adminNotes}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог обработки запроса */}
      <Dialog
        open={processDialogOpen}
        onClose={() => setProcessDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <CheckCircle color="success" />
            Подтверждение удаления копий данных
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Пожалуйста, подтвердите, что вы удалили все <strong>копии данных кандидата{' '}
            {selectedRequest?.name}, полученные с платформы SofiHR</strong> из своих внутренних систем.
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}><Trans>Это обязательное требование в соответствии с 152-ФЗ "О персональных данных".</Trans></Typography>
          <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic', color: 'text.secondary' }}>
            <strong>Напоминание:</strong> Удалять нужно только копии данных, полученных от нас. 
            Собственные данные о кандидате (личные встречи, переписка) удалять не обязательно.
          </Typography>
          
          <TextField
            fullWidth
            label={_(msg`Комментарий о выполненных действиях *`)}
            multiline
            rows={4}
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder={_(msg`Опишите какие копии данных были удалены и из каких систем...`)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProcessDialogOpen(false)}>
            Отмена
          </Button>
          
          <Button
            variant="contained"
            color="success"
            onClick={() => selectedRequest && handleProcessRequest(selectedRequest.id)}
            disabled={!adminNotes.trim() || processing}
            startIcon={processing ? <Info /> : <CheckCircle />}
          >
            {processing ? 'Подтверждаем...' : 'Подтвердить удаление'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Юридическая информация */}
      <Box sx={{ bgcolor: 'grey.100', py: 4, mt: 6 }}>
        <Paper elevation={1} sx={{ p: 4, bgcolor: 'white' }}>
          <Typography variant="h6" gutterBottom fontWeight={600} color="primary.main"><Trans>⚖️ Юридические аспекты и ответственность</Trans></Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" paragraph>
                <strong>152-ФЗ "О персональных данных":</strong>
              </Typography>
              <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  • Срок обработки запроса: <strong>30 дней</strong>
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}><Trans>• Обязательное уведомление о результатах</Trans></Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}><Trans>• Ответственность за несоблюдение сроков</Trans></Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="body2" paragraph>
                <strong>Ответственность HR-клиентов:</strong>
              </Typography>
              <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}><Trans>• Удаление всех копий данных из своих систем</Trans></Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}><Trans>• Подтверждение выполнения требований</Trans></Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}><Trans>• Сохранение доказательств удаления</Trans></Typography>
              </Box>
            </Grid>
          </Grid>
          
          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>📞 Нужна помощь?</strong> При возникновении вопросов по обработке запросов на удаление данных 
              обращайтесь в службу поддержки SofiHR или к вашему менеджеру по работе с клиентами.
            </Typography>
          </Alert>
          
          <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary">
              <strong>Важно:</strong> Данная страница является инструментом для соблюдения требований 152-ФЗ. 
              Все действия по обработке запросов логируются и могут быть проверены контролирующими органами.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
} 