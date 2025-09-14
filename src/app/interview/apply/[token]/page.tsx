"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Box, Card, CardContent, Typography, Button, TextField,
  CircularProgress, Alert, Container, Paper, Divider
} from '@mui/material';
import { IconUser, IconPhone, IconMail, IconBriefcase } from '@tabler/icons-react';

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

interface VacancyInfo {
  title: string;
  description: string;
  company: string;
}

export default function PublicApplyPage() {
  const { token } = useParams<{ token: string }>();
  const [vacancyInfo, setVacancyInfo] = useState<VacancyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [interviewLink, setInterviewLink] = useState<string | null>(null);

  // Форма
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });

  // Ошибки валидации для каждого поля
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    phone: '',
    email: ''
  });

  // Загружаем информацию о вакансии
  useEffect(() => {
    if (!token) return;

    fetch(`${API_BASE}/api/public/apply/${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setVacancyInfo(data);
        }
      })
      .catch(err => {
        setError('Ошибка загрузки информации о вакансии');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [token]);

  // Обработка отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    // Проверяем валидацию перед отправкой
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/public/apply/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          deviceFingerprint: generateDeviceFingerprint()
        })
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setSuccess(true);
        // Формируем ссылку на стандартную страницу интервью
        const interviewUrl = `${window.location.origin}/interview/${data.interviewHash}`;
        setInterviewLink(interviewUrl);
      }
    } catch (err) {
      setError('Ошибка при отправке заявки');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Валидация имени и фамилии
  const validateName = (name: string): string => {
    if (!name.trim()) return 'Имя обязательно для заполнения';
    if (name.trim().length < 2) return 'Имя должно содержать минимум 2 символа';
    if (name.trim().length > 100) return 'Имя слишком длинное';
    if (!/^[а-яёa-z\s-]+$/i.test(name.trim())) return 'Имя может содержать только буквы, пробелы и дефисы';
    return '';
  };

  // Валидация телефона
  const validatePhone = (phone: string): string => {
    if (!phone.trim()) return 'Телефон обязателен для заполнения';

    // Убираем все символы кроме цифр для проверки
    const cleanPhone = phone.replace(/\D/g, '');

    // Проверяем длину (10-15 цифр)
    if (cleanPhone.length < 10) return 'Телефон должен содержать минимум 10 цифр';
    if (cleanPhone.length > 15) return 'Телефон слишком длинный';

    // Проверяем что номер начинается с 7, 8 или +7
    const firstDigit = cleanPhone[0];
    if (firstDigit !== '7' && firstDigit !== '8') {
      return 'Номер должен начинаться с 7, 8 или +7';
    }

    return '';
  };

  // Валидация email
  const validateEmail = (email: string): string => {
    if (!email.trim()) return ''; // Email необязателен
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) return 'Введите корректный email адрес';
    if (email.trim().length > 255) return 'Email слишком длинный';
    return '';
  };

  // Общая валидация формы
  const validateForm = (): boolean => {
    const nameError = validateName(formData.name);
    const phoneError = validatePhone(formData.phone);
    const emailError = validateEmail(formData.email);

    setFieldErrors({
      name: nameError,
      phone: phoneError,
      email: emailError
    });

    return !nameError && !phoneError && !emailError;
  };

  // Улучшенное устройство fingerprinting (стабильное)
  const generateDeviceFingerprint = (): string => {
    try {
      // Собираем стабильные параметры для уникальности
      const fingerprint = {
        // Базовые параметры браузера
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,

        // Разрешение экрана
        screenWidth: screen.width,
        screenHeight: screen.height,
        screenDepth: screen.colorDepth,

        // Временная зона
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,

        // Canvas fingerprint (стабильный)
        canvas: (() => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillText('Device fingerprint', 2, 2);
            ctx.fillText('Unique identification', 4, 4);
            ctx.fillText('Anti-cheat system', 6, 6);
            return canvas.toDataURL().slice(-32);
          }
          return '';
        })()
      };

      // Создаем хэш из стабильных параметров
      const fingerprintString = JSON.stringify(fingerprint);
      let hash = 0;
      for (let i = 0; i < fingerprintString.length; i++) {
        const char = fingerprintString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }

      return Math.abs(hash).toString(36);
    } catch (error) {
      // Fallback на случай ошибки
      return Math.random().toString(36).substring(2);
    }
  };

  // Обработка изменения полей с валидацией
  const handleFieldChange = (field: 'name' | 'phone' | 'email', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Валидируем поле в реальном времени
    let error = '';
    switch (field) {
      case 'name':
        error = validateName(value);
        break;
      case 'phone':
        error = validatePhone(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
    }

    setFieldErrors(prev => ({ ...prev, [field]: error }));
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ fontSize: '1.1rem' }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (success && interviewLink) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card sx={{ textAlign: 'center', p: 4 }}>
          <Box sx={{ color: 'success.main', mb: 3 }}>
            <IconUser size={80} />
          </Box>
          <Typography variant="h4" gutterBottom color="success.main">
            Заявка принята! 🎉
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Спасибо за интерес к вакансии! Теперь вы можете пройти интервью.
          </Typography>
          <Button
            variant="contained"
            size="large"
            href={interviewLink}
            target="_blank"
            sx={{ fontSize: '1.1rem', py: 1.5, px: 4 }}
          >
            Начать интервью
          </Button>
          <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
            Ссылка откроется в новом окне
          </Typography>
        </Card>
      </Container>
    );
  }


  return <Container maxWidth="md" sx={{ py: 8 }}>
    <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
      {/* Заголовок */}
      <Box textAlign="center" mb={4}>
        <Box sx={{ color: 'primary.main', mb: 2 }}>
          <IconBriefcase size={80} />
        </Box>
        <Typography variant="h3" gutterBottom fontWeight="bold">
          Интервью временно не доступно для самозаписи
        </Typography>
      </Box>
    </Paper>
  </Container>


  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        {/* Заголовок */}
        <Box textAlign="center" mb={4}>
          <Box sx={{ color: 'primary.main', mb: 2 }}>
            <IconBriefcase size={80} />
          </Box>
          <Typography variant="h3" gutterBottom fontWeight="bold">
            Отклик на вакансию
          </Typography>
          {vacancyInfo && (
            <>
              <Typography variant="h5" color="primary" gutterBottom>
                {vacancyInfo.title}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {vacancyInfo.company}
              </Typography>
            </>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Описание вакансии */}
        {vacancyInfo?.description && (
          <Box mb={4}>
            <Typography variant="h6" gutterBottom>
              Описание вакансии:
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {vacancyInfo.description}
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Форма самозаписи */}
        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="h6" gutterBottom>
            Заполните форму для подачи заявки:
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
            <TextField
              required
              label="Имя и фамилия"
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              error={!!fieldErrors.name}
              helperText={fieldErrors.name}
              InputProps={{
                startAdornment: <IconUser size={20} style={{ marginRight: 8, opacity: 0.7 }} />
              }}
              fullWidth
              size="medium"
            />

            <TextField
              required
              label="Номер телефона"
              value={formData.phone}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              error={!!fieldErrors.phone}
              helperText={fieldErrors.phone}
              InputProps={{
                startAdornment: <IconPhone size={20} style={{ marginRight: 8, opacity: 0.7 }} />
              }}
              fullWidth
              size="medium"
              placeholder="+7 (999) 123-45-67 или 89991234567"
            />

            <TextField
              label="Email (необязательно)"
              value={formData.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
              InputProps={{
                startAdornment: <IconMail size={20} style={{ marginRight: 8, opacity: 0.7 }} />
              }}
              fullWidth
              size="medium"
              placeholder="your@email.com"
            />
          </Box>

          <Box textAlign="center">
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={submitting || !formData.name || !formData.phone || Object.values(fieldErrors).some(error => error)}
              sx={{ fontSize: '1.1rem', py: 1.5, px: 6 }}
            >
              {submitting ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Отправляем...
                </>
              ) : (
                'Подать заявку'
              )}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
