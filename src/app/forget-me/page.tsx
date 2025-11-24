"use client";
import React, { useState } from 'react';
import {
  Container, Typography, Box, Paper, Divider, TextField, Button, 
  Alert, FormControlLabel, Checkbox, Grid, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { DeleteForever, Warning, Info, CheckCircle } from '@mui/icons-material';
import Link from 'next/link';
import { useLingui } from '@lingui/react';
import { msg, Trans } from '@lingui/macro';



const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://localhost:8000";

interface ForgetMeFormData {
  email: string;
  name: string;
  phone: string;
  interviewDate: string;
  reason: string;
}

export default function ForgetMePage() {
  const { _ } = useLingui();

  const [formData, setFormData] = useState<ForgetMeFormData>({
    email: '',
    name: '',
    phone: '',
    interviewDate: '',
    reason: ''
  });

  const [submitting, setSubmitting] = useState(false);
  // Состояние для результата отправки
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  
  // Состояние для модального окна успеха
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleFieldChange = (field: keyof ForgetMeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.trim() || !formData.name.trim()) {
      setSubmitResult({
        success: false,
        message: _(msg`Пожалуйста, заполните обязательные поля`)
      });
      return;
    }

    setSubmitting(true);
    setSubmitResult(null);

    try {
      const response = await fetch(`${API_BASE}/api/public/forget-me-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitResult({
          success: true,
          message: _(msg`Ваш запрос на удаление данных успешно зарегистрирован в нашей системе. Мы свяжемся с вами в течение 30 дней для подтверждения личности и полного удаления всех данных. Номер вашего запроса: ${result.request_id || 'N/A'}`)
        });
        
        // Показываем модальное окно успеха
        setShowSuccessModal(true);
        
        // Воспроизводим звук успеха (если браузер поддерживает)
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
          oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.2);
          
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.3);
        } catch (e) {
          // Игнорируем ошибки звука
        }
        
        // Очищаем форму
        setFormData({
          email: '',
          name: '',
          phone: '',
          interviewDate: '',
          reason: ''
        });
      } else {
        setSubmitResult({
          success: false,
          message: result.error || _(msg`Произошла ошибка при отправке запроса`)
        });
      }
    } catch (error) {
      setSubmitResult({
        success: false,
        message: _(msg`Ошибка соединения. Проверьте интернет-соединение и попробуйте снова.`)
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Заголовок */}
        <Box textAlign="center" mb={6}>
          <DeleteForever sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
          <Typography variant="h3" gutterBottom fontWeight="bold"><Trans>Запрос на удаление данных</Trans></Typography>
          <Typography variant="h6" color="text.secondary"><Trans>Реализуйте свое право на забвение согласно 152-ФЗ</Trans></Typography>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Результат отправки - показываем вверху для лучшей видимости */}
        {submitResult && (
          <Alert 
            severity={submitResult.success ? 'success' : 'error'} 
            sx={{ 
              mb: 4,
              p: 3,
              fontSize: '1.1rem',
              animation: submitResult.success ? 'fadeInScale 0.5s ease-out' : 'none',
              '@keyframes fadeInScale': {
                '0%': {
                  opacity: 0,
                  transform: 'scale(0.9) translateY(-10px)'
                },
                '100%': {
                  opacity: 1,
                  transform: 'scale(1) translateY(0)'
                }
              },
              '& .MuiAlert-icon': {
                fontSize: '2rem'
              }
            }}
            action={
              submitResult.success && (
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => setSubmitResult(null)}
                  sx={{ color: 'success.dark' }}
                >
                  <Trans>Закрыть</Trans>
                </Button>
              )
            }
          >
            <Typography variant="h6" gutterBottom fontWeight={600}>
              {submitResult.success ? _(msg`✅ Запрос успешно отправлен!`) : _(msg`❌ Ошибка отправки`)}
            </Typography>
            <Typography variant="body1">
              {submitResult.message}
            </Typography>
            {submitResult.success && (
              <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic', color: 'success.dark' }}><Trans>📧 Проверьте указанный email - мы отправили подтверждение получения вашего запроса.</Trans></Typography>
            )}
          </Alert>
        )}

        {/* Информация */}
        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="body1">
            <Trans><strong>Важно:</strong> Если у вас есть активная ссылка на интервью, 
            используйте кнопку "Удалить мои данные" прямо на странице интервью для мгновенного удаления.</Trans>
          </Typography>
        </Alert>

        {/* Уведомление о быстром способе */}
        <Alert severity="warning" sx={{ mb: 4, p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={600} color="warning.dark"><Trans>🚀 Быстрый способ удаления данных!</Trans></Typography>
          <Typography variant="body1" paragraph>
            <Trans><strong>Если вы кандидат и проходили интервью:</strong></Trans>
          </Typography>
          <Typography variant="body2" paragraph sx={{ pl: 2 }}><Trans>
            1️⃣ <strong>Откройте ссылку на интервью</strong> (если она у вас есть)
          </Trans></Typography>
          <Typography variant="body2" paragraph sx={{ pl: 2 }}><Trans>
            2️⃣ <strong>Найдите внизу страницы</strong> текст "удаление своих персональных данных"
          </Trans></Typography>
          <Typography variant="body2" paragraph sx={{ pl: 2 }}><Trans>
            3️⃣ <strong>Нажмите на ссылку</strong> и подтвердите удаление
          </Trans></Typography>
          <Typography variant="body1" sx={{ mt: 2, fontWeight: 600, color: 'success.main' }}><Trans>✅ Тогда удаление будет мгновенным!</Trans></Typography>
          <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
            <Trans>Иначе нам придется вручную искать вас в базе данных по данным, которые вы предоставите в форме ниже. 
            <strong>Это займет больше времени, так как мы должны проверить вашу личность.</strong></Trans>
          </Typography>
        </Alert>

        <Grid container spacing={4}>
          {/* Форма */}
          <Grid item xs={12} md={8}>
            <Box component="form" onSubmit={handleSubmit}>
              <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 3 }}><Trans>Заполните форму для запроса удаления всех ваших данных:</Trans></Typography>

              {/* Информация о том, что удаляется */}
              <Card sx={{ mb: 3, bgcolor: 'warning.light' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight={600} color="warning.dark"><Trans>⚠️ Внимание! Будут удалены ВСЕ ваши данные:</Trans></Typography>
                  <Typography variant="body2" paragraph sx={{ pl: 2, mb: 1 }}><Trans>• Персональные данные (имя, email, телефон)</Trans></Typography>
                  <Typography variant="body2" paragraph sx={{ pl: 2, mb: 1 }}><Trans>• Видео и аудио записи интервью</Trans></Typography>
                  <Typography variant="body2" paragraph sx={{ pl: 2, mb: 1 }}><Trans>• Результаты анализа и оценки</Trans></Typography>
                  <Typography variant="body2" paragraph sx={{ pl: 2, mb: 1 }}><Trans>• Все согласия на обработку данных</Trans></Typography>
                  <Typography variant="body2" paragraph sx={{ pl: 2, mb: 1 }}><Trans>• Данные, переданные HR-клиентам</Trans></Typography>
                  <Typography variant="body1" sx={{ mt: 2, fontWeight: 600, color: 'error.main' }}><Trans>🗑️ Это действие нельзя отменить!</Trans></Typography>
                </CardContent>
              </Card>

              {/* Данные для идентификации */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 2 }}><Trans>Ваши данные для идентификации:</Trans></Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label={_(msg`Имя *`)}
                        value={formData.name}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        required
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email *"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleFieldChange('email', e.target.value)}
                        required
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label={_(msg`Телефон`)}
                        value={formData.phone}
                        onChange={(e) => handleFieldChange('phone', e.target.value)}
                        placeholder="+7 (999) 123-45-67"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label={_(msg`Дата интервью (приблизительно)`)}
                        type="date"
                        value={formData.interviewDate}
                        onChange={(e) => handleFieldChange('interviewDate', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Причина удаления */}
              <Card sx={{ mb: 4 }}>
                <CardContent>
                  <TextField
                    fullWidth
                    label={_(msg`Причина удаления данных (необязательно)`)}
                    multiline
                    rows={3}
                    value={formData.reason}
                    onChange={(e) => handleFieldChange('reason', e.target.value)}
                    placeholder={_(msg`Укажите причину удаления данных, если хотите...`)}
                  />
                </CardContent>
              </Card>

              {/* Кнопка отправки */}
              <Box textAlign="center">
                <Button
                  type="submit"
                  variant="contained"
                  color="warning"
                  size="large"
                  disabled={submitting}
                  startIcon={submitting ? <Info /> : <DeleteForever />}
                  sx={{ px: 4, py: 1.5 }}
                >
                  {submitting ? _(msg`Отправляем...`) : _(msg`Отправить запрос на удаление`)}
                </Button>
              </Box>
            </Box>
          </Grid>

          {/* Информация */}
          <Grid item xs={12} md={4}>
            <Card elevation={2} sx={{ height: 'fit-content' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600} color="warning.main">
                  <Warning sx={{ mr: 1, verticalAlign: 'middle' }} />
                  <Trans>Важная информация</Trans>
                </Typography>
                
                <Typography variant="body2" paragraph><Trans>
                  <strong>Срок обработки:</strong> До 30 дней согласно 152-ФЗ
                </Trans></Typography>
                
                <Typography variant="body2" paragraph><Trans>
                  <strong>Подтверждение:</strong> Мы свяжемся с вами для подтверждения
                </Trans></Typography>
                
                <Typography variant="body2" paragraph><Trans>
                  <strong>Уведомления:</strong> HR-клиенты будут уведомлены о запросе
                </Trans></Typography>
                
                <Typography variant="body2" paragraph><Trans>
                  <strong>Безвозвратность:</strong> Удаленные данные восстановить невозможно
                </Trans></Typography>

                <Divider sx={{ my: 2 }} />
                
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight={600}>
                    <Trans><strong>⚡ Мгновенное удаление!</strong></Trans>
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}><Trans>Если у вас есть ссылка на интервью, используйте кнопку "Удалить мои данные" прямо на странице интервью.</Trans></Typography>
                </Alert>
                
                <Typography variant="body2" color="text.secondary"><Trans>
                  <strong>Полное удаление:</strong> При отправке формы будут удалены ВСЕ ваши данные с платформы.
                </Trans></Typography>

                <Divider sx={{ my: 2 }} />
                
                <Typography variant="body2" color="text.secondary">
                  <Trans><strong>Важно:</strong> Запросы без ссылки на интервью обрабатываются вручную администраторами 
                  для проверки вашей личности. Это занимает больше времени, но обеспечивает безопасность.</Trans>
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Кнопки навигации */}
        <Box textAlign="center" mt={6}>
          <Button 
            variant="outlined" 
            color="primary" 
            size="large"
            component={Link}
            href="/"
            sx={{ mr: 2 }}
          ><Trans>Вернуться на главную</Trans></Button>
          <Button 
            variant="outlined" 
            color="primary" 
            size="large"
            component={Link}
            href="/privacy-policy"
          ><Trans>Политика конфиденциальности</Trans></Button>
        </Box>
      </Paper>

      {/* Модальное окно успеха */}
      <Dialog
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', color: 'success.main' }}>
          <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
            <CheckCircle sx={{ fontSize: 60, color: 'success.main', mr: 2 }} />
            <Typography variant="h4" fontWeight="bold"><Trans>Запрос отправлен!</Trans></Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph><Trans>Ваш запрос на удаление данных успешно зарегистрирован в нашей системе.</Trans></Typography>
          <Typography variant="body1" paragraph>
            <Trans><strong>Что дальше:</strong></Trans>
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            <Typography component="li" variant="body2" paragraph><Trans>📧 Мы отправили подтверждение на указанный email</Trans></Typography>
            <Typography component="li" variant="body2" paragraph><Trans>⏰ Обработка займет до 30 дней согласно 152-ФЗ</Trans></Typography>
            <Typography component="li" variant="body2" paragraph><Trans>🔍 Мы свяжемся с вами для подтверждения личности</Trans></Typography>
            <Typography component="li" variant="body2" paragraph><Trans>🗑️ После подтверждения все данные будут удалены</Trans></Typography>
          </Box>
          {submitResult?.message.includes(_(msg`Номер вашего запроса:`)) && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2"><Trans>
                <strong>Номер запроса:</strong> {submitResult.message.split('Номер вашего запроса: ')[1]}
              </Trans></Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant="contained"
            color="success"
            size="large"
            onClick={() => setShowSuccessModal(false)}
            sx={{ px: 4 }}
          >
            <Trans>Понятно</Trans>
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 