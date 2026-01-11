"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import {
  Box, Card, CardContent, Typography, Button, TextField,
  CircularProgress, Alert, Container, Paper, Divider, Checkbox, FormControlLabel
} from '@mui/material';
import { IconUser, IconPhone, IconMail, IconBriefcase } from '@tabler/icons-react';
import { useLingui } from '@lingui/react';
import { msg, Trans } from '@lingui/macro';
import InternationalPhoneInput from '@/components/InternationalPhoneInput';
import { normalizePhoneForBackend, isValidInternationalPhone } from '@/utils/phoneUtils';
import { getErrorMessage } from '@/utils/errorTranslator';


const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

interface VacancyInfo {
  title: string;
  description: string;
  company: string;
}

export default function PublicApplyPage() {
  const { _, i18n } = useLingui();
  const router = useRouter();

  const { token } = useParams<{ token: string }>();
  const searchParams = useSearchParams();
  const [vacancyInfo, setVacancyInfo] = useState<VacancyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // Проверяем ошибки HH OAuth из URL
  useEffect(() => {
    const hhError = searchParams?.get('error');
    if (hhError) {
      switch (hhError) {
        case 'hh_access_denied':
          setError(_(msg`Вы отменили авторизацию через HeadHunter`));
          break;
        case 'hh_no_code':
          setError(_(msg`Ошибка авторизации HeadHunter: код не получен`));
          break;
        case 'hh_callback_failed':
          setError(_(msg`Ошибка при обработке данных HeadHunter`));
          break;
        case 'vacancy_not_found':
          setError(_(msg`Вакансия не найдена`));
          break;
        case 'hh_init_failed':
          setError(_(msg`Не удалось инициировать авторизацию HeadHunter`));
          break;
      }
    }
  }, [searchParams, _]);

  // Форма
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [pdnConsent, setPdnConsent] = useState(false);

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
      .then(async res => {
        const data = await res.json();
        
        // Проверяем HTTP 410 - интервью закрыто
        if (res.status === 410) {
          const errorMessage = i18n._(getErrorMessage(data.error || 'interview.closed_by_company'));
          setError(errorMessage);
          return;
        }
        
        if (data.error) {
          // Backend: {error: 'vacancy.not_found'}
          const errorMessage = i18n._(getErrorMessage(data.error));
          setError(errorMessage);
        } else {
          setVacancyInfo(data);
        }
      })
      .catch(err => {
        setError(_(msg`Ошибка загрузки информации о вакансии`));
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [token]);

  // Обработка отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!pdnConsent) {
      setError(_(msg`Для подачи заявки необходимо согласие на обработку персональных данных`));
      return;
    }

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
          phone: normalizePhoneForBackend(formData.phone), // Нормализуем перед отправкой
          deviceFingerprint: generateDeviceFingerprint()
        })
      });

      const data = await response.json();

      if (data.error) {
        // Backend: {error: 'candidate.name_and_phone_required'}
        const errorMessage = i18n._(getErrorMessage(data.error));
        setError(errorMessage);
      } else {
        // Успешная запись - показываем лоадер и делаем редирект
        setRedirecting(true);
        
        // Небольшая задержка для UX (показать лоадер)
        setTimeout(() => {
          router.push(`/interview/${data.interviewHash}?skipVacancyInfo=true`);
        }, 800);
      }
    } catch (err) {
      setError(_(msg`Ошибка при отправке заявки`));
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Валидация имени и фамилии
  const validateName = (name: string): string => {
    if (!name.trim()) return _(msg`Имя обязательно для заполнения`);
    if (name.trim().length < 2) return _(msg`Имя должно содержать минимум 2 символа`);
    if (name.trim().length > 100) return _(msg`Имя слишком длинное`);
    if (!/^[а-яёa-z\s-]+$/i.test(name.trim())) return _(msg`Имя может содержать только буквы, пробелы и дефисы`);
    return '';
  };

  // Валидация телефона (международная)
  const validatePhone = (phone: string): string => {
    if (!phone.trim()) return _(msg`Телефон обязателен для заполнения`);

    if (!isValidInternationalPhone(phone)) {
      return _(msg`Введите корректный международный номер`);
    }

    return '';
  };

  // Валидация email
  const validateEmail = (email: string): string => {
    if (!email.trim()) return ''; // Email необязателен
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) return _(msg`Введите корректный email адрес`);
    if (email.trim().length > 255) return _(msg`Email слишком длинный`);
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

  // Обработка HH авторизации
  const handleHhAuth = () => {
    if (!token) return;
    window.location.href = `${API_BASE}/api/public/apply/${token}/hh-auth`;
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
    // Специальное оформление для закрытого интервью
    const isInterviewClosed = error.includes('закрыто') || error.includes('closed');
    
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        {isInterviewClosed ? (
          <Card sx={{ textAlign: 'center', p: 4 }}>
            <Box sx={{ color: 'error.main', mb: 3 }}>
              <Typography variant="h1" component="div" sx={{ fontSize: '4rem' }}>
                🚫
              </Typography>
            </Box>
            <Typography variant="h4" gutterBottom fontWeight="bold" color="error.main">
              <Trans>Прохождение интервью закрыто</Trans>
            </Typography>
            <Divider sx={{ my: 3 }} />
            <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
              <Trans>Компания завершила набор по данной вакансии и закрыла возможность прохождения интервью.</Trans>
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
              <Trans>Благодарим за интерес к вакансии!</Trans>
            </Typography>
            <Box
              sx={{
                mt: 3,
                p: 2,
                bgcolor: 'info.lighter',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'info.main',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                <Trans>💡 Если у вас есть вопросы, пожалуйста, свяжитесь с представителем компании.</Trans>
              </Typography>
            </Box>
          </Card>
        ) : (
          <Alert severity="error" sx={{ fontSize: '1.1rem' }}>
            {error}
          </Alert>
        )}
      </Container>
    );
  }

  // Показываем лоадер при редиректе
  if (redirecting) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card sx={{ textAlign: 'center', p: 6 }}>
          <Box sx={{ mb: 3 }}>
            <CircularProgress size={60} sx={{ color: 'success.main' }} />
          </Box>
          <Typography variant="h5" gutterBottom fontWeight={600} color="success.main">
            <Trans>Запись успешна! ✓</Trans>
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mt: 2 }}>
            <Trans>Переходим к интервью...</Trans>
          </Typography>
        </Card>
      </Container>
    );
  }



  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        {/* Заголовок */}
        <Box textAlign="center" mb={4}>
          <Box sx={{ color: 'primary.main', mb: 2 }}>
            <IconBriefcase size={80} />
          </Box>
          <Typography variant="h3" gutterBottom fontWeight="bold"><Trans>Отклик на вакансию</Trans></Typography>
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
              <Trans>Описание вакансии:</Trans>
            </Typography>
            <Typography
              component="div"
              variant="body1"
              dangerouslySetInnerHTML={{ __html: vacancyInfo.description }}
              sx={{
                lineHeight: 1.6,
                '& p': { margin: '8px 0' },
                '& ul, & ol': { paddingLeft: '20px', margin: '8px 0' }
              }}
            />
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Кнопка HH OAuth */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            <Trans>Быстрая запись через HeadHunter</Trans>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            <Trans>Войдите через ваш аккаунт HeadHunter, чтобы автоматически заполнить данные и прикрепить резюме</Trans>
          </Typography>
          
          {/* Чекбокс согласия для HH */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={pdnConsent}
                  onChange={(e) => setPdnConsent(e.target.checked)}
                  name="pdnConsentHh"
                  color="primary"
                />
              }
              label={
                <Typography variant="body2"><Trans>
                  Даю согласие на обработку моих персональных данных для участия в отборе и прохождения интервью. С условиями ознакомлен(а): <a href="/privacy-policy" target="_blank">Политика обработки ПДн</a>.
                </Trans></Typography>
              }
            />
          </Box>
          
          <Button
            variant="contained"
            size="large"
            onClick={handleHhAuth}
            disabled={!pdnConsent}
            sx={{
              bgcolor: '#D6001C',
              color: 'white',
              '&:hover': {
                bgcolor: '#B00017',
              },
              '&:disabled': {
                bgcolor: 'rgba(214, 0, 28, 0.3)',
                color: 'rgba(255, 255, 255, 0.5)',
              },
              fontSize: '1rem',
              py: 1.5,
              px: 4,
            }}
          >
            <Box component="span" sx={{ fontWeight: 'bold', mr: 1 }}>hh</Box>
            <Trans>Войти через HeadHunter</Trans>
          </Button>
        </Box>

        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            <Trans>или заполните форму вручную</Trans>
          </Typography>
        </Divider>

        {/* Форма самозаписи */}
        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="h6" gutterBottom><Trans>Заполните форму для подачи заявки:</Trans></Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
            <TextField
              required
              label={_(msg`Имя и фамилия`)}
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

            <Box>
              <InternationalPhoneInput
                value={formData.phone}
                onChange={(phone) => handleFieldChange('phone', phone)}
                label={_(msg`Номер телефона`)}
                error={fieldErrors.phone}
                required
                placeholder={_(msg`+7 (999) 123-45-67`)}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', pl: 1.5 }}>
                <Trans>Телефон нужен, чтобы работодатель мог с вами связаться</Trans>
              </Typography>
            </Box>

            <TextField
              label={_(msg`Email (необязательно)`)}
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

            <FormControlLabel
              control={
                <Checkbox
                  checked={pdnConsent}
                  onChange={(e) => setPdnConsent(e.target.checked)}
                  name="pdnConsent"
                  color="primary"
                />
              }
              label={
                <Typography variant="body2"><Trans>
                  Даю согласие на обработку моих персональных данных для участия в отборе и прохождения интервью. С условиями ознакомлен(а): <a href="/privacy-policy" target="_blank">Политика обработки ПДн</a>.
                </Trans></Typography>
              }
            />
          </Box>

          <Box textAlign="center">
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={submitting || !formData.name || !formData.phone || !pdnConsent || Object.values(fieldErrors).some(error => error)}
              sx={{ fontSize: '1.1rem', py: 1.5, px: 6 }}
            >
              {submitting ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  <Trans>Отправляем...</Trans>
                </>
              ) : (
                <Trans>Начать интервью</Trans>
              )}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
