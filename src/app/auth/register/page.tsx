"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Container,
  CircularProgress,
  Paper,
  Link as MuiLink,
  Divider,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import Link from "next/link";
import { Icon } from "@iconify/react";
import PrivacyConsent from "@/app/components/PrivacyConsent";
import { useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';


const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

interface FormData {
  name: string;
  position: string;
  company: string;
  email: string;
  phone: string;
}

interface FormErrors {
  name?: string;
  position?: string;
  company?: string;
  email?: string;
  phone?: string;
  general?: string;
}

export default function RegisterPage() {
  const { _ } = useLingui();

  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    position: "",
    company: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pdnOk, setPdnOk] = useState(false);
  const [marketing, setMarketing] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Валидация имени
    if (!formData.name.trim()) {
      newErrors.name = _(msg`Введите ваше имя`);
    } else if (formData.name.trim().length < 2) {
      newErrors.name = _(msg`Имя должно содержать минимум 2 символа`);
    }

    // Валидация должности
    if (!formData.position.trim()) {
      newErrors.position = _(msg`Введите вашу должность`);
    }

    // Валидация компании
    if (!formData.company.trim()) {
      newErrors.company = _(msg`Введите название компании`);
    }

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = _(msg`Введите email адрес`);
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = _(msg`Введите корректный email адрес`);
    }

    // Валидация телефона (опционально, но если введен - должен быть корректным)
    if (formData.phone.trim()) {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(formData.phone.replace(/\s/g, ""))) {
        newErrors.phone = _(msg`Введите корректный номер телефона`);
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Очищаем ошибку для конкретного поля при изменении
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!pdnOk) {
      setErrors({ general: _(msg`Для регистрации необходимо согласие на обработку персональных данных`) });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          position: formData.position.trim(),
          company: formData.company.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim() || null,
          marketing_opt_in: marketing
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Автоматический переход на страницу входа через 3 секунды
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      } else {
        setErrors({
          general: data.message || _(msg`Ошибка при регистрации. Попробуйте еще раз.`),
        });
      }
    } catch (error) {
      setErrors({
        general: _(msg`Ошибка соединения. Проверьте интернет и попробуйте еще раз.`),
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
          <Icon icon="mdi:check-circle" color="#4caf50" width={64} height={64} />
          <Typography variant="h4" fontWeight={700} color="success.main" sx={{ mt: 2, mb: 2 }}><Trans>Регистрация успешна!</Trans></Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}><Trans>
            Мы отправили пароль на ваш email: <strong>{formData.email}</strong>
          </Trans></Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}><Trans>Проверьте почту и используйте полученный пароль для входа в систему.</Trans></Typography>
          <CircularProgress size={24} sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary"><Trans>Переходим на страницу входа...</Trans></Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Card elevation={3}>
        <CardContent sx={{ p: 4 }}>
          {/* Заголовок */}
          <Box textAlign="center" mb={4}>
            <Icon icon="mdi:account-plus" color="#2196F3" width={48} height={48} />
            <Typography variant="h3" fontWeight={700} color="primary.main" sx={{ mt: 2, mb: 1 }}><Trans>Регистрация</Trans></Typography>
            <Typography variant="body1" color="text.secondary"><Trans>Создайте аккаунт для работы с SofiHR</Trans></Typography>
          </Box>

          {/* Форма */}
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Общая ошибка */}
              {errors.general && (
                <Alert severity="error">{errors.general}</Alert>
              )}

              {/* Имя */}
              <TextField
                label={_(msg`Ваше имя`)}
                variant="outlined"
                fullWidth
                required
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                placeholder={_(msg`Иван Иванов`)}
                disabled={loading}
              />

              {/* Должность */}
              <TextField
                label={_(msg`Должность`)}
                variant="outlined"
                fullWidth
                required
                value={formData.position}
                onChange={(e) => handleInputChange("position", e.target.value)}
                error={!!errors.position}
                helperText={errors.position}
                placeholder={_(msg`HR менеджер, Рекрутер, Директор по персоналу`)}
                disabled={loading}
              />

              {/* Компания */}
              <TextField
                label={_(msg`Компания`)}
                variant="outlined"
                fullWidth
                required
                value={formData.company}
                onChange={(e) => handleInputChange("company", e.target.value)}
                error={!!errors.company}
                helperText={errors.company}
                placeholder={_(msg`ООО «Ваша компания»`)}
                disabled={loading}
              />

              {/* Email */}
              <TextField
                label="Email"
                type="email"
                variant="outlined"
                fullWidth
                required
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                error={!!errors.email}
                helperText={errors.email || _(msg`На этот email будет отправлен пароль`)}
                placeholder="example@company.com"
                disabled={loading}
              />

              {/* Телефон */}
              <TextField
                label={_(msg`Телефон`)}
                variant="outlined"
                fullWidth
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                error={!!errors.phone}
                helperText={errors.phone || _(msg`Для дополнительной безопасности входа (необязательно)`)}
                placeholder="+7 (900) 123-45-67"
                disabled={loading}
              />

              {/* Согласие на ПДн (обязательно) */}
              <PrivacyConsent value={pdnOk} onChange={setPdnOk} required />

              {/* Маркетинг (необязательно) */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={marketing}
                    onChange={(e) => setMarketing(e.target.checked)}
                    name="marketing"
                    color="primary"
                  />
                }
                label={_(msg`Согласен(на) получать новости и предложения на указанный email`)}
              />

              {/* Кнопка регистрации */}
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading || !pdnOk}
                sx={{
                  py: 1.5,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  textTransform: "none",
                  mt: 2,
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    <Trans>Создание аккаунта...</Trans>
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:account-plus" width={20} height={20} style={{ marginRight: 8 }} />
                    <Trans>Зарегистрироваться</Trans>
                  </>
                )}
              </Button>
            </Box>
          </form>

          {/* Разделитель */}
          <Divider sx={{ my: 3 }} />

          {/* Ссылка на вход */}
          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary"><Trans>
              Уже есть аккаунт?{" "}
              </Trans><Link href="/auth/login" passHref>
                <MuiLink color="primary" sx={{ fontWeight: 600, textDecoration: "none" }}>
                  <Trans>Войти в систему</Trans>
                </MuiLink>
              </Link>
            </Typography>
          </Box>

          {/* Информация о пароле */}
          <Box
            sx={{
              mt: 3,
              p: 2,
              backgroundColor: "info.light",
              borderRadius: 1,
              border: "1px solid",
              borderColor: "info.main"
            }}
          >
            <Typography variant="body2" color="info.dark" sx={{ display: "flex", alignItems: "center" }}>
              <Icon icon="mdi:information" width={16} height={16} style={{ marginRight: 8 }} />
              <Trans>После регистрации система автоматически сгенерирует безопасный пароль и отправит его на ваш email.</Trans>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
