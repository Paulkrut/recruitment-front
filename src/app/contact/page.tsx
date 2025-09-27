"use client";
import React, { useState } from 'react';
import {
  Container, Typography, Box, Paper, TextField, Button, 
  Alert, Grid, IconButton, FormControlLabel, Checkbox
} from '@mui/material';
import {
  ContactSupport, Send, Error, Info
} from '@mui/icons-material';
import Link from 'next/link';
import { logContactFormConsent } from '@/utils/consentLogger';

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://localhost:8000";

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [pdnConsent, setPdnConsent] = useState(false);
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Валидация формы
  const validateForm = (): boolean => {
    const newErrors: Partial<ContactFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Имя обязательно для заполнения';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Имя должно содержать минимум 2 символа';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен для заполнения';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Введите корректный email адрес';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Тема обязательна для заполнения';
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = 'Тема должна содержать минимум 5 символов';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Сообщение обязательно для заполнения';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Сообщение должно содержать минимум 10 символов';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Обработка изменения полей
  const handleFieldChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Очищаем ошибку при вводе
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Отправка формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setSubmitResult(null);

    try {
      const response = await fetch(`${API_BASE}/api/contact/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitResult({
          success: true,
          message: 'Сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.'
        });
        
        // Логируем согласие, если есть ID сообщения
        if (result.id) {
          logContactFormConsent(result.id.toString());
        }
        
        // Очищаем форму
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
        setPdnConsent(false);
      } else {
        setSubmitResult({
          success: false,
          message: result.error || 'Произошла ошибка при отправке сообщения'
        });
      }
    } catch (error) {
      setSubmitResult({
        success: false,
        message: 'Ошибка соединения. Проверьте интернет-соединение и попробуйте снова.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Заголовок */}
      <Box textAlign="center" mb={4}>
        <ContactSupport sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" gutterBottom fontWeight="bold">
          Связаться с нами
        </Typography>
        <Typography variant="h6" color="text.secondary">
          У вас есть вопросы? Мы готовы помочь!
        </Typography>
      </Box>

      {/* Форма обратной связи */}
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
          Форма обратной связи
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Заполните форму ниже, и мы свяжемся с вами в ближайшее время
        </Typography>

        {/* Результат отправки */}
        {submitResult && (
          <Alert 
            severity={submitResult.success ? 'success' : 'error'} 
            sx={{ mb: 3 }}
            action={
              <IconButton
                color="inherit"
                size="small"
                onClick={() => setSubmitResult(null)}
              >
                <Error fontSize="inherit" />
              </IconButton>
            }
          >
            {submitResult.message}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Имя */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Имя *"
                value={formData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email *"
                type="email"
                value={formData.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
                required
              />
            </Grid>

            {/* Телефон */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Телефон"
                value={formData.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                placeholder="+7 (999) 123-45-67"
              />
            </Grid>

            {/* Тема */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Тема *"
                value={formData.subject}
                onChange={(e) => handleFieldChange('subject', e.target.value)}
                error={!!errors.subject}
                helperText={errors.subject}
                required
              />
            </Grid>

            {/* Сообщение */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Сообщение *"
                multiline
                rows={6}
                value={formData.message}
                onChange={(e) => handleFieldChange('message', e.target.value)}
                error={!!errors.message}
                helperText={errors.message}
                required
              />
            </Grid>

            {/* Согласие на обработку ПДн */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={pdnConsent}
                    onChange={(e) => setPdnConsent(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2">
                    Даю согласие на обработку персональных данных в соответствии с{' '}
                    <Link href="/privacy-policy" style={{ color: '#1976d2', textDecoration: 'underline' }}>
                      Политикой конфиденциальности
                    </Link>
                    {' '}*
                  </Typography>
                }
              />
            </Grid>

            {/* Кнопка отправки */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={submitting || !pdnConsent}
                  startIcon={submitting ? <Info /> : <Send />}
                  sx={{ px: 4, py: 1.5 }}
                >
                  {submitting ? 'Отправляем...' : 'Отправить сообщение'}
                </Button>

                <Typography variant="caption" color="text.secondary">
                  * - обязательные поля
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Кнопки навигации */}
      <Box textAlign="center" mt={4}>
        <Button 
          variant="outlined" 
          color="primary" 
          size="large"
          component={Link}
          href="/"
          sx={{ mr: 2 }}
        >
          Вернуться на главную
        </Button>
        <Button 
          variant="outlined" 
          color="primary" 
          size="large"
          component={Link}
          href="/privacy-policy"
        >
          Политика конфиденциальности
        </Button>
      </Box>
    </Container>
  );
} 