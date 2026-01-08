"use client";
import * as React from "react";
import { Box, Container, Typography, Grid, Button } from "@mui/material";
import { Icon } from "@iconify/react";

interface PartnersSectionProps {
  onOpenContact?: () => void;
}

export default function PartnersSection({ onOpenContact }: PartnersSectionProps) {
  const options = [
    {
      icon: 'mdi:api',
      title: 'API для разработчиков',
      description: 'Интегрируйте AI-интервью в ваши HR-продукты и сервисы',
      features: [
        'RESTful API с полной документацией',
        'Webhook уведомления о событиях',
        'SDK для популярных языков',
        'Тестовый доступ бесплатно',
      ],
      color: '#2196F3',
      cta: 'Обсудить интеграцию',
      href: '#',
    },
    {
      icon: 'mdi:palette',
      title: 'White Label решения',
      description: 'Платформа под вашим брендом для HR-агентств и аутсорсинговых компаний',
      features: [
        'Полная кастомизация интерфейса',
        'Ваш логотип и фирменные цвета',
        'Собственный домен',
        'Техническая поддержка',
      ],
      color: '#9C27B0',
      cta: 'Узнать подробнее',
      href: '#',
    },
    {
      icon: 'mdi:handshake',
      title: 'Партнёрская программа',
      description: 'Развивайте свой бизнес вместе с SofiHR — рекомендуйте платформу вашим клиентам',
      features: [
        'Специальные условия для партнёров',
        'Маркетинговые материалы',
        'Обучение вашей команды',
        'Персональный менеджер',
      ],
      color: '#4CAF50',
      cta: 'Стать партнёром',
      href: '#',
    },
  ];

  return (
    <Box sx={{ bgcolor: '#fafafa', py: { xs: 6, md: 10 } }}>
      <Container maxWidth="lg">

        {/* Hero */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#2196F3' }} />
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#999' }}>
              Сотрудничество
            </Typography>
          </Box>

          <Typography sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 800, lineHeight: 1.1, mb: 1.5 }}>
            Работаем <Box component="span" sx={{ color: '#2196F3' }}>вместе</Box>
          </Typography>

          <Typography sx={{ fontSize: { xs: '0.95rem', md: '1.05rem' }, color: '#666', maxWidth: 700, mx: 'auto' }}>
            API интеграции, White Label решения и партнёрская программа для масштабирования вашего бизнеса
          </Typography>
        </Box>

        {/* Карточки */}
        <Grid container spacing={4}>
          {options.map((option, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Box
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  border: `2px solid ${option.color}30`,
                  bgcolor: '#fafafa',
                  p: 4,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 12px 32px ${option.color}30`,
                    borderColor: option.color,
                  },
                }}
              >
                {/* Icon */}
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 2,
                    bgcolor: `${option.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                  }}
                >
                  <Icon icon={option.icon} width={32} height={32} color={option.color} />
                </Box>

                {/* Title */}
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, mb: 1.5, color: option.color }}>
                  {option.title}
                </Typography>

                {/* Description */}
                <Typography sx={{ fontSize: '0.95rem', color: '#666', mb: 3, lineHeight: 1.6 }}>
                  {option.description}
                </Typography>

                {/* Features */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 4 }}>
                  {option.features.map((feature, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <Icon icon="mdi:check-circle" width={18} height={18} color={option.color} style={{ marginTop: 2, flexShrink: 0 }} />
                      <Typography sx={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.5 }}>
                        {feature}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* CTA */}
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={onOpenContact}
                  sx={{
                    borderColor: option.color,
                    color: option.color,
                    py: 1.5,
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    borderRadius: 2,
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: option.color,
                      bgcolor: `${option.color}10`,
                    },
                  }}
                >
                  {option.cta}
                </Button>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Дополнительная информация */}
        <Box sx={{ textAlign: 'center', mt: 6, p: 4, bgcolor: '#f8fafc', borderRadius: 3 }}>
          <Typography sx={{ fontSize: '1.1rem', fontWeight: 600, mb: 1 }}>
            Есть вопросы или нестандартные запросы?
          </Typography>
          <Typography sx={{ fontSize: '0.95rem', color: '#666', mb: 2 }}>
            Свяжитесь с нами, и мы обсудим индивидуальные условия сотрудничества
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={onOpenContact}
            sx={{
              bgcolor: '#2196F3',
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: 2,
              textTransform: 'none',
              '&:hover': {
                bgcolor: '#1976D2',
              },
            }}
          >
            Написать нам
          </Button>
        </Box>

      </Container>
    </Box>
  );
}

