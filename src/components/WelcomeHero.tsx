"use client";
import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Stack,
  IconButton,
  Paper,
} from "@mui/material";
import {
  IconPlus,
  IconUsers,
  IconFileText,
  IconArrowRight,
  IconBriefcase,
} from "@tabler/icons-react";
import Link from "next/link";
import { useLingui } from '@lingui/react';
import { msg, Trans } from '@lingui/macro';

interface WelcomeHeroProps {
  hasHhIntegration?: boolean;
}

export default function WelcomeHero({
  hasHhIntegration = false,
}: WelcomeHeroProps) {
  const { _ } = useLingui();

  return (
    <Box
      sx={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 2,
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
        borderRadius: 3,
      }}
    >
      <Box sx={{ maxWidth: 900, width: '100%' }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
            <Typography sx={{ fontSize: '3rem' }}>👋</Typography>
            <Typography
              variant="h2"
              fontWeight={800}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              <Trans>Добро пожаловать в SofiHR!</Trans>
            </Typography>
          </Box>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            <Trans>Автоматизируйте интервью с кандидатами и находите лучших специалистов быстрее</Trans>
          </Typography>
        </Box>

        {/* Main Cards */}
        <Grid container spacing={3}>
          {/* HH Import Card */}
          <Grid item xs={12} md={6}>
            <Link
              href={'/hr/settings/hh-integration'}
              passHref
              legacyBehavior
            >
              <Card
                component="a"
                elevation={0}
                sx={{
                  height: '100%',
                  border: '2px solid',
                  borderColor: hasHhIntegration ? 'primary.main' : 'divider',
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  display: 'block',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 8px 30px rgba(102, 126, 234, 0.2)',
                    transform: 'translateY(-4px)',
                  },
                }}
              >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ textAlign: 'center' }}>
                  {/* Icon */}
                  <Paper
                    elevation={0}
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                      background: hasHhIntegration
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : 'linear-gradient(135deg, #D6001C 0%, #FF4D6D 100%)',
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '2rem',
                        fontWeight: 900,
                        color: 'white',
                        fontFamily: '"Arial Black", sans-serif',
                        letterSpacing: '-2px'
                      }}
                    >
                      HH
                    </Typography>
                  </Paper>

                  {/* Title */}
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    {hasHhIntegration ? (
                      <Trans>Импортировать вакансии</Trans>
                    ) : (
                      <Trans>Подключить HeadHunter</Trans>
                    )}
                  </Typography>

                  {/* Description */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3, minHeight: 48 }}
                  >
                    {hasHhIntegration ? (
                      <Trans>Загрузите вакансии и кандидатов из вашего аккаунта HH.ru</Trans>
                    ) : (
                      <Trans>Подключите HeadHunter и импортируйте вакансии с кандидатами автоматически</Trans>
                    )}
                  </Typography>

                  {/* Features */}
                  <Stack spacing={1} sx={{ mb: 3, textAlign: 'left' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconFileText size={18} color="#667eea" />
                      <Typography variant="body2" color="text.secondary">
                        <Trans>Импорт вакансий</Trans>
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconUsers size={18} color="#667eea" />
                      <Typography variant="body2" color="text.secondary">
                        <Trans>Импорт кандидатов</Trans>
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconArrowRight size={18} color="#667eea" />
                      <Typography variant="body2" color="text.secondary">
                        <Trans>Синхронизация откликов</Trans>
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Button */}
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    endIcon={<IconArrowRight size={20} />}
                    component="span"
                    sx={{
                      background: hasHhIntegration
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : 'linear-gradient(135deg, #D6001C 0%, #FF4D6D 100%)',
                      fontWeight: 600,
                      py: 1.5,
                      '&:hover': {
                        boxShadow: '0 8px 20px rgba(214, 0, 28, 0.3)',
                      },
                    }}
                  >
                    {hasHhIntegration ? (
                      <Trans>Импортировать</Trans>
                    ) : (
                      <Trans>Подключить HH</Trans>
                    )}
                  </Button>
                </Box>
              </CardContent>
            </Card>
            </Link>
          </Grid>

          {/* Create Manually Card */}
          <Grid item xs={12} md={6}>
            <Link href="/hr/vacancy-create" passHref legacyBehavior>
              <Card
                component="a"
                elevation={0}
                sx={{
                  height: '100%',
                  border: '2px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  display: 'block',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 8px 30px rgba(102, 126, 234, 0.2)',
                    transform: 'translateY(-4px)',
                  },
                }}
              >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ textAlign: 'center' }}>
                  {/* Icon */}
                  <Paper
                    elevation={0}
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                      background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
                    }}
                  >
                    <IconPlus size={40} color="#667eea" />
                  </Paper>

                  {/* Title */}
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    <Trans>Создать вручную</Trans>
                  </Typography>

                  {/* Description */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3, minHeight: 48 }}
                  >
                    <Trans>Создайте новую вакансию с нуля и настройте вопросы для интервью</Trans>
                  </Typography>

                  {/* Features */}
                  <Stack spacing={1} sx={{ mb: 3, textAlign: 'left' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconFileText size={18} color="#667eea" />
                      <Typography variant="body2" color="text.secondary">
                        <Trans>Гибкая настройка вакансии</Trans>
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconUsers size={18} color="#667eea" />
                      <Typography variant="body2" color="text.secondary">
                        <Trans>AI генерация вопросов</Trans>
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconArrowRight size={18} color="#667eea" />
                      <Typography variant="body2" color="text.secondary">
                        <Trans>Публичная ссылка для кандидатов</Trans>
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Button */}
                  <Button
                    variant="outlined"
                    size="large"
                    fullWidth
                    endIcon={<IconArrowRight size={20} />}
                    component="span"
                    sx={{
                      borderWidth: 2,
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      fontWeight: 600,
                      py: 1.5,
                      '&:hover': {
                        borderWidth: 2,
                        borderColor: 'primary.dark',
                        backgroundColor: 'primary.main',
                        color: 'white',
                      },
                    }}
                  >
                    <Trans>Создать вакансию</Trans>
                  </Button>
                </Box>
              </CardContent>
            </Card>
            </Link>
          </Grid>
        </Grid>

        {/* Bottom hint */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" color="text.secondary">
            <Trans>💡 Подсказка: Если у вас есть аккаунт на HH.ru, рекомендуем начать с подключения для ускорения процесса</Trans>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

