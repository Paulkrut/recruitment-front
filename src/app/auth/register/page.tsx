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
} from "@mui/material";
import Link from "next/link";
import { Icon } from "@iconify/react";

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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Валидация имени
    if (!formData.name.trim()) {
      newErrors.name = "Введите ваше имя";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Имя должно содержать минимум 2 символа";
    }

    // Валидация должности
    if (!formData.position.trim()) {
      newErrors.position = "Введите вашу должность";
    }

    // Валидация компании
    if (!formData.company.trim()) {
      newErrors.company = "Введите название компании";
    }

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Введите email адрес";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Введите корректный email адрес";
    }

    // Валидация телефона (опционально, но если введен - должен быть корректным)
    if (formData.phone.trim()) {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(formData.phone.replace(/\s/g, ""))) {
        newErrors.phone = "Введите корректный номер телефона";
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
          general: data.message || "Ошибка при регистрации. Попробуйте еще раз.",
        });
      }
    } catch (error) {
      setErrors({
        general: "Ошибка соединения. Проверьте интернет и попробуйте еще раз.",
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
          <Typography variant="h4" fontWeight={700} color="success.main" sx={{ mt: 2, mb: 2 }}>
            Регистрация успешна!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Мы отправили пароль на ваш email: <strong>{formData.email}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Проверьте почту и используйте полученный пароль для входа в систему.
          </Typography>
          <CircularProgress size={24} sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Переходим на страницу входа...
          </Typography>
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
            <Typography variant="h3" fontWeight={700} color="primary.main" sx={{ mt: 2, mb: 1 }}>
              Регистрация
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Создайте аккаунт для работы с SofiHR
            </Typography>
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
                label="Ваше имя"
                variant="outlined"
                fullWidth
                required
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                placeholder="Иван Иванов"
                disabled={loading}
              />

              {/* Должность */}
              <TextField
                label="Должность"
                variant="outlined"
                fullWidth
                required
                value={formData.position}
                onChange={(e) => handleInputChange("position", e.target.value)}
                error={!!errors.position}
                helperText={errors.position}
                placeholder="HR менеджер, Рекрутер, Директор по персоналу"
                disabled={loading}
              />

              {/* Компания */}
              <TextField
                label="Компания"
                variant="outlined"
                fullWidth
                required
                value={formData.company}
                onChange={(e) => handleInputChange("company", e.target.value)}
                error={!!errors.company}
                helperText={errors.company}
                placeholder="ООО «Ваша компания»"
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
                helperText={errors.email || "На этот email будет отправлен пароль"}
                placeholder="example@company.com"
                disabled={loading}
              />

              {/* Телефон */}
              <TextField
                label="Телефон"
                variant="outlined"
                fullWidth
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                error={!!errors.phone}
                helperText={errors.phone || "Для дополнительной безопасности входа (необязательно)"}
                placeholder="+7 (900) 123-45-67"
                disabled={loading}
              />

              {/* Кнопка регистрации */}
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
                    Создание аккаунта...
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:account-plus" width={20} height={20} style={{ marginRight: 8 }} />
                    Зарегистрироваться
                  </>
                )}
              </Button>
            </Box>
          </form>

          {/* Разделитель */}
          <Divider sx={{ my: 3 }} />

          {/* Ссылка на вход */}
          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Уже есть аккаунт?{" "}
              <Link href="/auth/login" passHref>
                <MuiLink color="primary" sx={{ fontWeight: 600, textDecoration: "none" }}>
                  Войти в систему
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
              После регистрации система автоматически сгенерирует безопасный пароль и отправит его на ваш email.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
} 