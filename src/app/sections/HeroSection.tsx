"use client";
import * as React from "react";
import { Box, Container, Typography, Button, Chip } from "@mui/material";
import { Icon } from "@iconify/react";

interface HeroSectionProps {
  activeInterviews: number;
  rotatingWord: number;
  rotatingWords: string[];
  onContactClick?: () => void;
}

export default function HeroSection({ activeInterviews, rotatingWord, rotatingWords, onContactClick }: HeroSectionProps) {
  return (
    <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: 0 }}>
      {/* Combined Background: Mesh + Dots + Grid */}
      <>
        {/* Слой 1: Mesh Gradient (задний план) */}
        <Box sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          zIndex: 0, 
          pointerEvents: 'none',
          background: `
            radial-gradient(at 0% 0%, rgba(33, 150, 243, 0.15) 0px, transparent 50%),
            radial-gradient(at 100% 0%, rgba(76, 175, 80, 0.12) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(255, 152, 0, 0.13) 0px, transparent 50%),
            radial-gradient(at 0% 100%, rgba(156, 39, 176, 0.1) 0px, transparent 50%)
          `,
          '@keyframes meshMove': {
            '0%, 100%': { transform: 'scale(1) rotate(0deg)' },
            '50%': { transform: 'scale(1.1) rotate(5deg)' },
          },
          animation: 'meshMove 25s ease-in-out infinite',
        }} />

        {/* Слой 2: Dots (средний план) */}
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1, pointerEvents: 'none' }}>
          {Array.from({ length: 60 }).map((_, i) => {
            const size = Math.random() * 3 + 1.5;
            const colors = ['rgba(33, 150, 243, 0.3)', 'rgba(76, 175, 80, 0.25)', 'rgba(255, 152, 0, 0.28)'];
            return (
              <Box
                key={i}
                sx={{
                  position: 'absolute',
                  width: size,
                  height: size,
                  borderRadius: '50%',
                  bgcolor: colors[i % 3],
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  '@keyframes dotFloat': {
                    '0%, 100%': { transform: 'translateY(0) scale(1)', opacity: 0.3 },
                    '50%': { transform: `translateY(${Math.random() * 30 - 15}px) scale(${1 + Math.random() * 0.5})`, opacity: 0.7 },
                  },
                  animation: `dotFloat ${5 + Math.random() * 10}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 5}s`,
                }}
              />
            );
          })}
        </Box>

        {/* Слой 3: Grid (передний план) */}
        <Box sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          zIndex: 2, 
          pointerEvents: 'none',
          backgroundImage: `
            linear-gradient(rgba(33, 150, 243, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(33, 150, 243, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          '@keyframes gridMove': {
            '0%': { backgroundPosition: '0 0' },
            '100%': { backgroundPosition: '60px 60px' },
          },
          animation: 'gridMove 30s linear infinite',
        }}>
          {/* Акцентные точки на пересечениях */}
          {Array.from({ length: 12 }).map((_, i) => (
            <Box
              key={i}
              sx={{
                position: 'absolute',
                width: 3,
                height: 3,
                borderRadius: '50%',
                bgcolor: 'rgba(33, 150, 243, 0.4)',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 0.2, transform: 'scale(1)' },
                  '50%': { opacity: 0.8, transform: 'scale(2)' },
                },
                animation: `pulse ${2 + Math.random() * 3}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </Box>
      </>

      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 }, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 5, md: 8 }, alignItems: 'center' }}>

          <Box sx={{ flex: 1, maxWidth: { md: 600 } }}>
            {/* Badge с AI + HH + живой статус */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <Chip
                label="AI-платформа для найма"
                size="small"
                sx={{
                  bgcolor: 'rgba(33, 150, 243, 0.1)',
                  color: '#2196F3',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  border: '1px solid rgba(33, 150, 243, 0.2)'
                }}
              />
              <Box sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 1.5,
                py: 0.5,
                borderRadius: 10,
                bgcolor: 'rgba(214, 0, 28, 0.08)',
                border: '1px solid rgba(214, 0, 28, 0.2)',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'rgba(214, 0, 28, 0.12)',
                  borderColor: 'rgba(214, 0, 28, 0.4)',
                }
              }}>
                <Typography sx={{ color: '#D6001C', fontSize: '0.7rem', fontWeight: 700 }}>hh</Typography>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#D6001C' }}>
                  Интеграция с HeadHunter
                </Typography>
              </Box>
              <Box sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 1.5,
                py: 0.5,
                borderRadius: 10,
                bgcolor: 'rgba(76, 175, 80, 0.1)',
                border: '1px solid rgba(76, 175, 80, 0.2)'
              }}>
                <Box sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: '#4CAF50',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                    '50%': { opacity: 0.5, transform: 'scale(1.2)' },
                  },
                  animation: 'pulse 2s ease-in-out infinite',
                }} />
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#4CAF50' }}>
                  {activeInterviews} интервью сейчас
                </Typography>
              </Box>
            </Box>

            {/* Заголовок с ротацией слова - всегда с новой строки */}
            <Typography variant="h1" sx={{ fontSize: { xs: '2rem', sm: '2.5rem', md: '3.2rem' }, fontWeight: 800, lineHeight: 1.15, mb: 2, color: '#1a1a1a', letterSpacing: -1 }}>
              HR-платформа для автоматизации найма
              <Box
                key={rotatingWord}
                component="span"
                sx={{
                  display: 'block',
                  color: '#2196F3',
                  minHeight: { xs: '2.5rem', sm: '3rem', md: '3.8rem' },
                  '@keyframes slideUp': {
                    '0%': { opacity: 0, transform: 'translateY(20px)' },
                    '15%': { opacity: 1, transform: 'translateY(0)' },
                    '85%': { opacity: 1, transform: 'translateY(0)' },
                    '100%': { opacity: 0, transform: 'translateY(-20px)' },
                  },
                  animation: 'slideUp 3.5s ease-in-out',
                }}
              >
                {rotatingWords[rotatingWord]}
              </Box>
            </Typography>

            <Typography sx={{ fontSize: { xs: '0.95rem', md: '1.05rem' }, color: '#666', lineHeight: 1.5, mb: 2.5 }}>
              Платформа для собеседований, генерации вопросов, оценки кандидатов с помощью ИИ.
            </Typography>

            {/* Список возможностей - компактнее */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2.5 }}>
              {[
                { emoji: '📝', text: 'Генерировать вопросы для любой вакансии за 1 клик' },
                { emoji: '🎥', text: 'Проводить видеоинтервью с помощью ИИ, без ваших усилий' },
                { emoji: '📊', text: 'Получать объективную оценку и сравнение кандидатов' },
                { emoji: '🔍', text: 'Проверять знание регламентов и внутренних правил' },
              ].map((item, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2 }}>
                  <Typography sx={{ fontSize: '0.95rem' }}>{item.emoji}</Typography>
                  <Typography sx={{ fontSize: '0.88rem', color: '#333', lineHeight: 1.4 }}>{item.text}</Typography>
                </Box>
              ))}
            </Box>

            {/* CTA кнопка - для мобилки */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 2, mb: 2.5 }}>
              <Button
                variant="contained"
                href="/auth/register"
                sx={{
                  bgcolor: '#2196F3',
                  color: '#fff',
                  px: 5,
                  py: 1.8,
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  borderRadius: 1.5,
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.25)',
                  '&:hover': {
                    bgcolor: '#1976D2',
                    boxShadow: '0 6px 16px rgba(33, 150, 243, 0.35)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s ease',
                  width: '100%',
                }}
              >
                Попробовать платформу
              </Button>
            </Box>
          </Box>

          <Box sx={{ flex: 1, display: { xs: 'none', md: 'block' } }}>
            <Box sx={{ bgcolor: '#fff', border: '1px solid #e5e5e5', borderRadius: 2, p: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <Typography sx={{ fontSize: '0.65rem', color: '#aaa', letterSpacing: 1.5, textTransform: 'uppercase', mb: 3 }}>
                Платформа в цифрах
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 4 }}>
                {[
                  { value: '50,000+', label: 'Интервью проведено', color: '#2196F3' },
                  { value: '75,000+', label: 'Кандидатов оценено', color: '#4CAF50' },
                  { value: '17x', label: 'Быстрее найм', color: '#9C27B0' },
                  { value: '24/7', label: 'Работаем всегда', color: '#FF9800' },
                ].map((stat, i) => (
                  <Box key={i}>
                    <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: stat.color, lineHeight: 1, mb: 0.5 }}>
                      {stat.value}
                    </Typography>
                    <Typography sx={{ fontSize: '0.8rem', color: '#888' }}>{stat.label}</Typography>
                  </Box>
                ))}
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontSize: '0.75rem', color: '#999', mb: 2.5, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Результаты для бизнеса
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[
                    { emoji: '💰', text: 'Снижает затраты на найм в 5 раз' },
                    { emoji: '⚡', text: 'Ускоряет закрытие вакансий в 17 раз' },
                    { emoji: '🎯', text: 'Повышает качество найма на 40%' },
                  ].map((item, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Typography sx={{ fontSize: '1.1rem' }}>{item.emoji}</Typography>
                      <Typography sx={{ fontSize: '0.85rem', color: '#333', fontWeight: 500 }}>{item.text}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Оффер в правой колонке */}
              <Box sx={{
                bgcolor: '#f8fafc',
                border: '1px solid #e5e5e5',
                borderRadius: 1.5,
                p: 2.5,
                mb: 3,
                textAlign: 'center'
              }}>
                <Typography sx={{ fontSize: '0.75rem', color: '#999', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Специальное предложение
                </Typography>
                <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: '#2196F3', lineHeight: 1, mb: 0.5 }}>
                  10 интервью
                </Typography>
                <Typography sx={{ fontSize: '0.9rem', color: '#666', mb: 1 }}>
                  в подарок при регистрации
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <Icon icon="mdi:check-circle" width={14} height={14} style={{ color: '#4CAF50' }} />
                  <Typography sx={{ fontSize: '0.75rem', color: '#888' }}>
                    Без кредитной карты
                  </Typography>
                </Box>
              </Box>

              <Button
                variant="contained"
                href="/auth/register"
                fullWidth
                sx={{
                  bgcolor: '#2196F3',
                  color: '#fff',
                  py: 1.8,
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderRadius: 1.5,
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.25)',
                  '&:hover': {
                    bgcolor: '#1976D2',
                    boxShadow: '0 6px 16px rgba(33, 150, 243, 0.35)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s ease',
                  mb: 2
                }}
              >
                Попробовать платформу
              </Button>

              <Button
                onClick={onContactClick}
                variant="outlined"
                fullWidth
                sx={{
                  borderColor: '#e5e5e5',
                  color: '#666',
                  py: 1.8,
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  borderRadius: 1.5,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#2196F3',
                    color: '#2196F3',
                    bgcolor: 'rgba(33, 150, 243, 0.04)',
                  },
                  transition: 'all 0.2s ease',
                }}
                startIcon={<Icon icon="mdi:headset" width={20} height={20} />}
              >
                Связаться с нами
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

