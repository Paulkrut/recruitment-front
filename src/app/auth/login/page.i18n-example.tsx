/**
 * Пример миграции страницы входа на LinguiJS
 * 
 * Этот файл показывает как мигрировать существующую страницу.
 * Сравните с оригиналом в src/app/auth/login/page.tsx
 */

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

// ✅ ШАГ 1: Добавляем импорты LinguiJS
import { Trans, useLingui } from '@lingui/react';
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

export default function LoginPageI18n() {
  const router = useRouter();
  
  // ✅ ШАГ 2: Добавляем хук useLingui для перевода строк
  const { _ } = useLingui();
  
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      // ✅ ШАГ 3: Переводим сообщения об ошибках
      newErrors.email = _(msg`Введите email адрес`);
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = _(msg`Введите корректный email адрес`);
    }

    if (!formData.password.trim()) {
      newErrors.password = _(msg`Введите пароль`);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
        localStorage.setItem("recruitment_token", data.token);
        localStorage.removeItem("current_company");
        window.location.href = "/hr/";
      } else {
        // ✅ ШАГ 4: Переводим серверные ошибки
        setErrors({ 
          general: data.message || _(msg`Произошла ошибка при входе`) 
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ 
        general: _(msg`Ошибка сети. Проверьте подключение к интернету`) 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Card elevation={24}>
          <CardContent sx={{ p: 4 }}>
            {/* ✅ ШАГ 5: Оборачиваем заголовки в <Trans> */}
            <Box textAlign="center" mb={3}>
              <Icon 
                icon="solar:user-circle-bold-duotone" 
                width="64" 
                height="64" 
                style={{ color: "#667eea" }}
              />
              <Typography variant="h4" fontWeight="700" mt={2}>
                <Trans>Вход в систему</Trans>
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                <Trans>Введите ваши учетные данные для доступа</Trans>
              </Typography>
            </Box>

            {/* ✅ ШАГ 6: Переводим Alert сообщения */}
            {errors.general && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.general}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Box mb={3}>
                {/* ✅ ШАГ 7: Переводим label и placeholder через _() */}
                <TextField
                  fullWidth
                  label={_(msg`Email`)}
                  type="email"
                  placeholder={_(msg`Введите ваш email`)}
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <Icon 
                        icon="solar:letter-bold-duotone" 
                        width="20" 
                        style={{ marginRight: 8, color: "#667eea" }}
                      />
                    ),
                  }}
                />
              </Box>

              <Box mb={3}>
                <TextField
                  fullWidth
                  label={_(msg`Пароль`)}
                  type="password"
                  placeholder={_(msg`Введите ваш пароль`)}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  error={!!errors.password}
                  helperText={errors.password}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <Icon 
                        icon="solar:lock-password-bold-duotone" 
                        width="20" 
                        style={{ marginRight: 8, color: "#667eea" }}
                      />
                    ),
                  }}
                />
              </Box>

              <Box textAlign="right" mb={3}>
                <Link href="/auth/forgot-password" passHref legacyBehavior>
                  <MuiLink 
                    variant="body2" 
                    sx={{ 
                      color: "#667eea",
                      textDecoration: "none",
                      "&:hover": { textDecoration: "underline" }
                    }}
                  >
                    {/* ✅ ШАГ 8: Переводим ссылки */}
                    <Trans>Забыли пароль?</Trans>
                  </MuiLink>
                </Link>
              </Box>

              {/* ✅ ШАГ 9: Переводим текст кнопок */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                type="submit"
                disabled={loading}
                sx={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  py: 1.5,
                  "&:hover": {
                    background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: "white" }} />
                ) : (
                  <Trans>Войти</Trans>
                )}
              </Button>
            </form>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                <Trans>ИЛИ</Trans>
              </Typography>
            </Divider>

            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">
                {/* ✅ ШАГ 10: Переводим составной текст */}
                <Trans>Нет аккаунта?</Trans>{" "}
                <Link href="/auth/register" passHref legacyBehavior>
                  <MuiLink
                    sx={{
                      color: "#667eea",
                      fontWeight: 600,
                      textDecoration: "none",
                      "&:hover": { textDecoration: "underline" }
                    }}
                  >
                    <Trans>Зарегистрироваться</Trans>
                  </MuiLink>
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Box textAlign="center" mt={3}>
          <Typography variant="body2" sx={{ color: "white", opacity: 0.8 }}>
            <Trans>© 2025 SofiHR. Все права защищены.</Trans>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

/**
 * ПОСЛЕ МИГРАЦИИ:
 * 
 * 1. Запустите: npm run i18n:extract
 * 2. Откройте: src/locales/en/messages.po
 * 3. Добавьте переводы:
 * 
 *    msgid "Вход в систему"
 *    msgstr "Sign In"
 * 
 *    msgid "Введите ваши учетные данные для доступа"
 *    msgstr "Enter your credentials to access"
 * 
 *    msgid "Email"
 *    msgstr "Email"
 * 
 *    msgid "Введите ваш email"
 *    msgstr "Enter your email"
 * 
 *    msgid "Пароль"
 *    msgstr "Password"
 * 
 *    msgid "Введите ваш пароль"
 *    msgstr "Enter your password"
 * 
 *    msgid "Забыли пароль?"
 *    msgstr "Forgot password?"
 * 
 *    msgid "Войти"
 *    msgstr "Sign In"
 * 
 *    msgid "ИЛИ"
 *    msgstr "OR"
 * 
 *    msgid "Нет аккаунта?"
 *    msgstr "Don't have an account?"
 * 
 *    msgid "Зарегистрироваться"
 *    msgstr "Sign Up"
 * 
 *    msgid "© 2025 SofiHR. Все права защищены."
 *    msgstr "© 2025 SofiHR. All rights reserved."
 * 
 * 4. Скомпилируйте: npm run i18n:compile
 * 5. Проверьте на обоих языках
 */


