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

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError("Введите email адрес");
      return;
    }

    if (!validateEmail(email)) {
      setError("Введите корректный email адрес");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.message || "Ошибка при восстановлении пароля");
      }
    } catch (error) {
      setError("Ошибка соединения. Попробуйте еще раз.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Card elevation={3}>
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            <Icon icon="mdi:email-check" color="#4caf50" width={64} height={64} />
            <Typography variant="h4" fontWeight={700} color="success.main" sx={{ mt: 2, mb: 2 }}>
              Новый пароль отправлен!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Мы отправили новый пароль на ваш email: <strong>{email}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Проверьте почту и используйте новый пароль для входа в систему.
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push("/auth/login")}
              sx={{ mt: 2 }}
            >
              Перейти к входу
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Card elevation={3}>
        <CardContent sx={{ p: 4 }}>
          {/* Заголовок */}
          <Box textAlign="center" mb={4}>
            <Icon icon="mdi:lock-reset" color="#2196F3" width={48} height={48} />
            <Typography variant="h3" fontWeight={700} color="primary.main" sx={{ mt: 2, mb: 1 }}>
              Восстановление пароля
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Введите ваш email и мы отправим новый пароль
            </Typography>
          </Box>

          {/* Форма */}
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Ошибка */}
              {error && (
                <Alert severity="error">{error}</Alert>
              )}

              {/* Email */}
              <TextField
                label="Email"
                type="email"
                variant="outlined"
                fullWidth
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="example@company.com"
                disabled={loading}
              />

              {/* Кнопка отправки */}
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
                    Отправка...
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:email-send" width={20} height={20} style={{ marginRight: 8 }} />
                    Отправить новый пароль
                  </>
                )}
              </Button>
            </Box>
          </form>

          {/* Разделитель */}
          <Divider sx={{ my: 3 }} />

          {/* Ссылки */}
          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Вспомнили пароль?{" "}
              <Link href="/auth/login" passHref>
                <MuiLink color="primary" sx={{ fontWeight: 600, textDecoration: "none" }}>
                  Войти в систему
                </MuiLink>
              </Link>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Нет аккаунта?{" "}
              <Link href="/auth/register" passHref>
                <MuiLink color="primary" sx={{ fontWeight: 600, textDecoration: "none" }}>
                  Зарегистрироваться
                </MuiLink>
              </Link>
            </Typography>
          </Box>

          {/* Информация */}
          <Box 
            sx={{ 
              mt: 3, 
              p: 2, 
              backgroundColor: "warning.light", 
              borderRadius: 1, 
              border: "1px solid",
              borderColor: "warning.main"
            }}
          >
            <Typography variant="body2" color="warning.dark" sx={{ display: "flex", alignItems: "center" }}>
              <Icon icon="mdi:information" width={16} height={16} style={{ marginRight: 8 }} />
              Мы автоматически сгенерируем новый безопасный пароль и отправим его на ваш email.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
} 