"use client";
import * as React from "react";
import { Box, Container, Typography, Grid, Button, Paper } from "@mui/material";
import { Icon } from "@iconify/react";

export default function RegulationsSection() {
  const features = [
    {
      icon: 'mdi:file-document-outline',
      title: 'Загрузка регламентов',
      description: 'Загружайте документы в PDF, DOCX или вставляйте текст',
    },
    {
      icon: 'mdi:robot',
      title: 'AI-генерация вопросов',
      description: 'ИИ автоматически создаёт тестовые вопросы из документа',
    },
    {
      icon: 'mdi:email-multiple',
      title: 'Массовые рассылки',
      description: 'Отправляйте приглашения всем сотрудникам одним кликом',
    },
    {
      icon: 'mdi:chart-bar',
      title: 'Отслеживание прогресса',
      description: 'Видите кто прошёл тест, кто ещё не начал',
    },
    {
      icon: 'mdi:account-check',
      title: 'Детальные результаты',
      description: 'Анализ ответов каждого сотрудника с оценкой',
    },
    {
      icon: 'mdi:clock-check',
      title: 'Автоматические напоминания',
      description: 'Система сама напомнит не прошедшим тест',
    },
  ];

  const useCases = [
    {
      icon: 'mdi:shield-check',
      title: 'Техника безопасности',
      example: 'Проверка знания ТБ для производственных рабочих',
      color: '#FF9800',
    },
    {
      icon: 'mdi:account-tie',
      title: 'Корпоративная культура',
      example: 'Онбординг новых сотрудников с проверкой',
      color: '#2196F3',
    },
    {
      icon: 'mdi:book-open',
      title: 'Внутренние процессы',
      example: 'Тестирование знания CRM, учетных систем',
      color: '#9C27B0',
    },
  ];

  return (
    <Box sx={{ bgcolor: '#fff', py: { xs: 6, md: 10 } }}>
      <Container maxWidth="lg">

        {/* Hero */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#9C27B0' }} />
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#999' }}>
              Регламенты и тестирование
            </Typography>
          </Box>

          <Typography sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 800, lineHeight: 1.1, mb: 1.5 }}>
            Проверяйте знания <Box component="span" sx={{ color: '#9C27B0' }}>внутренних регламентов</Box>
          </Typography>

          <Typography sx={{ fontSize: { xs: '0.95rem', md: '1.05rem' }, color: '#666', maxWidth: 700, mx: 'auto' }}>
            Автоматизируйте проверку знаний сотрудников: техника безопасности, корпоративные правила, внутренние процессы
          </Typography>
        </Box>

        {/* Основные возможности */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: 2,
                  border: '1px solid #e5e5e5',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#9C27B0',
                    boxShadow: '0 4px 12px rgba(156, 39, 176, 0.1)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: 'rgba(156, 39, 176, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  <Icon icon={feature.icon} width={24} height={24} color="#9C27B0" />
                </Box>
                <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, mb: 1 }}>
                  {feature.title}
                </Typography>
                <Typography sx={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.6 }}>
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Примеры использования */}
        <Box sx={{ mb: 6 }}>
          <Typography sx={{ fontSize: '1.8rem', fontWeight: 700, textAlign: 'center', mb: 4 }}>
            Примеры использования
          </Typography>

          <Grid container spacing={3}>
            {useCases.map((useCase, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    bgcolor: `${useCase.color}10`,
                    border: `2px solid ${useCase.color}30`,
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 24px ${useCase.color}20`,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      bgcolor: useCase.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                    }}
                  >
                    <Icon icon={useCase.icon} width={28} height={28} color="#fff" />
                  </Box>
                  <Typography sx={{ fontSize: '1.3rem', fontWeight: 700, mb: 1, color: '#1a1a1a' }}>
                    {useCase.title}
                  </Typography>
                  <Typography sx={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                    {useCase.example}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Статистика / Результаты */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 4,
            p: { xs: 4, md: 6 },
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Декоративные элементы */}
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.1)',
            }}
          />

          <Grid container spacing={4} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
            <Grid item xs={12} md={6}>
              <Typography sx={{ fontSize: { xs: '1.5rem', md: '2rem' }, fontWeight: 800, color: '#fff', mb: 2 }}>
                Почему это важно?
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Icon icon="mdi:check-circle" width={24} height={24} color="#4CAF50" style={{ marginTop: 2, flexShrink: 0 }} />
                  <Typography sx={{ color: 'rgba(255,255,255,0.95)', lineHeight: 1.6 }}>
                    <strong>152-ФЗ обязывает</strong> обучать сотрудников правилам обработки персональных данных
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Icon icon="mdi:check-circle" width={24} height={24} color="#4CAF50" style={{ marginTop: 2, flexShrink: 0 }} />
                  <Typography sx={{ color: 'rgba(255,255,255,0.95)', lineHeight: 1.6 }}>
                    <strong>Техника безопасности</strong> — обязательная проверка для производств
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Icon icon="mdi:check-circle" width={24} height={24} color="#4CAF50" style={{ marginTop: 2, flexShrink: 0 }} />
                  <Typography sx={{ color: 'rgba(255,255,255,0.95)', lineHeight: 1.6 }}>
                    <strong>Онбординг</strong> — быстрее вводите новых сотрудников в курс дела
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2, p: 2 }}>
                    <Typography sx={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                      100%
                    </Typography>
                    <Typography sx={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)', mt: 0.5 }}>
                      Охват сотрудников
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2, p: 2 }}>
                    <Typography sx={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                      5x
                    </Typography>
                    <Typography sx={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)', mt: 0.5 }}>
                      Быстрее ручного
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2, p: 2 }}>
                    <Typography sx={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                      0
                    </Typography>
                    <Typography sx={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)', mt: 0.5 }}>
                      Бумажной работы
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2, p: 2 }}>
                    <Typography sx={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                      24/7
                    </Typography>
                    <Typography sx={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)', mt: 0.5 }}>
                      Доступность
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>

        {/* CTA */}
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Button
            variant="contained"
            size="large"
            href="/auth/register"
            sx={{
              bgcolor: '#9C27B0',
              px: 5,
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 700,
              borderRadius: 2,
              textTransform: 'none',
              boxShadow: '0 8px 24px rgba(156, 39, 176, 0.3)',
              '&:hover': {
                bgcolor: '#7B1FA2',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 32px rgba(156, 39, 176, 0.4)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Попробовать тестирование регламентов
          </Button>
        </Box>

      </Container>
    </Box>
  );
}

