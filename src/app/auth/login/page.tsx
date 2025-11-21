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
  Link as MuiLink,
  Divider,
} from "@mui/material";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';


const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginPage() {
  const { _ } = useLingui();

  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Введите email адрес";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Введите корректный email адрес";
    }

    // Валидация пароля
    if (!formData.password.trim()) {
      newErrors.password = "Введите пароль";
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

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Сохраняем токен
        localStorage.setItem("recruitment_token", data.token);
        localStorage.removeItem("current_company"); // Очищаем сохраненную компанию
        
        // Перезагружаем страницу как в старой авторизации
        window.location.href = "/hr/";
      } else {
        setErrors({
          general: data.message || _(msg`Ошибка авторизации. Проверьте данные.`),
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

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Card elevation={3}>
        <CardContent sx={{ p: 4 }}>
          {/* Заголовок */}
          <Box textAlign="center" mb={4}>
            <Icon icon="mdi:login" color="#2196F3" width={48} height={48} />
            <Typography variant="h3" fontWeight={700} color="primary.main" sx={{ mt: 2, mb: 1 }}><Trans>Вход в систему</Trans></Typography>
            <Typography variant="body1" color="text.secondary"><Trans>Войдите в свой аккаунт SofiHR</Trans></Typography>
          </Box>

          {/* Форма */}
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Общая ошибка */}
              {errors.general && (
                <Alert severity="error">{errors.general}</Alert>
              )}

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
                helperText={errors.email}
                placeholder="example@company.com"
                disabled={loading}
                InputLabelProps={{
                  shrink: true,
                }}
              />

              {/* Пароль */}
              <TextField
                label={_(msg`Пароль`)}
                type="password"
                variant="outlined"
                fullWidth
                required
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                error={!!errors.password}
                helperText={errors.password}
                placeholder={_(msg`Введите пароль из email`)}
                disabled={loading}
                InputLabelProps={{
                  shrink: true,
                }}
              />

              {/* Кнопка входа */}
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
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
                    Вход в систему...
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:login" width={20} height={20} style={{ marginRight: 8 }} />
                    <Trans>Войти</Trans>
                  </>
                )}
              </Button>
            </Box>
          </form>

          {/* Ссылки */}
          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              <Link href="/auth/forgot-password" passHref>
                <MuiLink color="primary" sx={{ textDecoration: "none" }}>
                  Забыли пароль?
                </MuiLink>
              </Link>
            </Typography>
          </Box>

          {/* Разделитель */}
          <Divider sx={{ my: 3 }} />

          {/* Ссылка на регистрацию */}
          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary"><Trans>
              Нет аккаунта?{" "}
              </Trans><Link href="/auth/register" passHref>
                <MuiLink color="primary" sx={{ fontWeight: 600, textDecoration: "none" }}>
                  <Trans>Зарегистрироваться</Trans>
                </MuiLink>
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
} 