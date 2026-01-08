"use client";
import * as React from "react";
import { Box, Container, Typography, Button, Chip } from "@mui/material";
import { Icon } from "@iconify/react";

export default function PricingSection() {
  const plans = [
    {
      id: 'trial',
      name: 'Пробный',
      price: null,
      priceText: 'Бесплатно',
      period: '10 интервью',
      pricePerInterview: '0₽',
      description: 'Для тестирования платформы без финансовых вложений',
      features: [
        { text: '10 AI-интервью бесплатно', included: true },
        { text: 'Базовый анализ ИИ', included: true },
        { text: 'Ранжирование кандидатов', included: true },
        { text: 'Видео и аудио запись', included: true },
        { text: 'Базовые шаблоны', included: true },
        { text: 'Поддержка по email', included: true },
        { text: 'Детальные отчеты', included: false },
        { text: 'Кастомные шаблоны', included: false },
      ],
      cta: 'Начать бесплатно',
      popular: false,
      color: '#607D8B',
    },
    {
      id: 'start',
      name: 'Старт',
      price: 13500,
      period: '100 интервью',
      pricePerInterview: '135₽',
      description: 'Для небольших компаний и стартапов до 10 найма/месяц',
      features: [
        { text: '100 AI-интервью', included: true },
        { text: 'Полный анализ ответов ИИ', included: true },
        { text: 'Ранжирование кандидатов', included: true },
        { text: 'Видео и аудио запись', included: true },
        { text: 'Базовые шаблоны', included: true },
        { text: 'Поддержка по email', included: true },
        { text: 'Экспорт базовых отчетов', included: true },
        { text: 'Кастомные шаблоны', included: false },
      ],
      cta: 'Попробовать 14 дней',
      popular: false,
      color: '#4CAF50',
    },
    {
      id: 'business',
      name: 'Бизнес',
      price: 54000,
      period: '500 интервью',
      pricePerInterview: '108₽',
      discount: 'Экономия 20%',
      description: 'Для средних компаний с активным процессом найма',
      features: [
        { text: '500 AI-интервью', included: true },
        { text: 'Расширенный анализ ИИ', included: true },
        { text: 'Детальные отчеты', included: true },
        { text: 'Кастомные шаблоны', included: true },
        { text: 'Мультикомпанийность', included: true },
        { text: 'Приоритетная поддержка', included: true },
        { text: 'Экспорт данных', included: true },
        { text: 'Интеграции с внешними системами', included: true },
      ],
      cta: 'Попробовать 14 дней',
      popular: true,
      color: '#2196F3',
    },
    {
      id: 'premium',
      name: 'Премиум',
      price: 90000,
      period: '1000 интервью',
      pricePerInterview: '90₽',
      discount: 'Экономия 33%',
      description: 'Для крупных компаний и HR-агентств с высокой нагрузкой',
      features: [
        { text: '1000 AI-интервью', included: true },
        { text: 'AI-генерация вопросов', included: true },
        { text: 'Сравнение кандидатов', included: true },
        { text: 'Неограниченные шаблоны', included: true },
        { text: 'Аналитика и дашборды', included: true },
        { text: 'Персональный менеджер', included: true },
        { text: 'API доступ', included: true },
        { text: 'Интеграции с любыми системами', included: true },
        { text: 'Приоритетная разработка функций', included: true },
      ],
      cta: 'Связаться с нами',
      popular: false,
      color: '#9C27B0',
    },
  ];

  return (
    <Box sx={{ bgcolor: '#fff', py: { xs: 6, md: 10 } }}>
      <Container maxWidth="lg">

        {/* Hero */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#E91E63' }} />
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#999' }}>
              Тарифы
            </Typography>
          </Box>

          <Typography sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 800, lineHeight: 1.1, mb: 1.5 }}>
            Прозрачные цены для <Box component="span" sx={{ color: '#E91E63' }}>любого бизнеса</Box>
          </Typography>

          <Typography sx={{ fontSize: { xs: '0.95rem', md: '1.05rem' }, color: '#666', maxWidth: 650, mx: 'auto' }}>
            Начните с 10 бесплатных интервью. Без привязки карты. Без скрытых платежей.
          </Typography>
        </Box>

        {/* Pricing Cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 3,
          }}
        >
          {plans.map((plan) => (
            <Box
              key={plan.id}
              sx={{
                position: 'relative',
                bgcolor: '#fff',
                borderRadius: 3,
                p: 3,
                border: plan.popular ? `2px solid ${plan.color}` : '1px solid #e5e5e5',
                boxShadow: plan.popular ? '0 8px 32px rgba(233, 30, 99, 0.15)' : 'none',
                transform: plan.popular ? { md: 'scale(1.05)' } : 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: plan.popular ? { md: 'scale(1.08)' } : { md: 'scale(1.03)' },
                  boxShadow: `0 8px 32px ${plan.color}20`,
                },
              }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bgcolor: plan.color,
                    color: '#fff',
                    px: 2,
                    py: 0.5,
                    borderRadius: 2,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                  }}
                >
                  Популярный
                </Box>
              )}

              {/* Plan Name */}
              <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, mb: 0.5, color: plan.color }}>
                {plan.name}
              </Typography>

              {/* Description */}
              <Typography sx={{ fontSize: '0.85rem', color: '#999', mb: 2 }}>
                {plan.description}
              </Typography>

              {/* Price */}
              <Box sx={{ mb: 3 }}>
                {plan.priceText ? (
                  <Typography sx={{ fontSize: '2rem', fontWeight: 900, color: '#1a1a1a' }}>
                    {plan.priceText}
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '2.5rem', fontWeight: 900, color: '#1a1a1a', lineHeight: 1 }}>
                      {plan.price.toLocaleString('ru-RU')}
                    </Typography>
                    <Typography sx={{ fontSize: '1rem', color: '#999' }}>
                      ₽
                    </Typography>
                  </Box>
                )}
                <Typography sx={{ fontSize: '0.85rem', color: '#999' }}>
                  {plan.period}
                </Typography>
                {plan.pricePerInterview && (
                  <Typography sx={{ fontSize: '0.75rem', color: '#666', mt: 0.5 }}>
                    {plan.pricePerInterview} за интервью
                  </Typography>
                )}
                {plan.discount && (
                  <Chip 
                    label={plan.discount} 
                    size="small" 
                    sx={{ mt: 1, bgcolor: '#4CAF50', color: '#fff', fontSize: '0.7rem', height: 20 }} 
                  />
                )}
              </Box>

              {/* CTA Button */}
              <Button
                fullWidth
                variant={plan.popular ? 'contained' : 'outlined'}
                href="/auth/register"
                sx={{
                  py: 1.5,
                  mb: 3,
                  bgcolor: plan.popular ? plan.color : 'transparent',
                  color: plan.popular ? '#fff' : plan.color,
                  borderColor: plan.color,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: plan.popular ? '#1976D2' : `${plan.color}10`,
                    borderColor: plan.color,
                  },
                }}
              >
                {plan.cta}
              </Button>

              {/* Features */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {plan.features.map((feature, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1,
                      opacity: feature.included ? 1 : 0.4,
                    }}
                  >
                    <Icon
                      icon={feature.included ? 'mdi:check-circle' : 'mdi:minus-circle'}
                      width={20}
                      height={20}
                      style={{ color: feature.included ? '#4CAF50' : '#999', flexShrink: 0, marginTop: 2 }}
                    />
                    <Typography sx={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.6 }}>
                      {feature.text}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>

        {/* Дополнительная информация */}
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography sx={{ fontSize: '0.85rem', color: '#999' }}>
            Все тарифы включают интеграцию с HeadHunter, AI-анализ и соответствие 152-ФЗ
          </Typography>
        </Box>

      </Container>
    </Box>
  );
}

