"use client";
import * as React from "react";
import { Box, Container, Typography, Grid, Link as MuiLink } from "@mui/material";
import { Icon } from "@iconify/react";
import Link from "next/link";
import SofiHRLogo from "@/components/shared/SofiHRLogo";

interface FooterSectionProps {
  onContactClick?: () => void;
}

export default function FooterSection({ onContactClick }: FooterSectionProps) {
  // Плавный скроллинг к якорям
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        const offsetTop = targetElement.offsetTop - 80;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    }
  };

  const footerLinks = [
    {
      title: 'Возможности',
      links: [
        { label: 'AI-интервью', href: '#ai-interview' },
        { label: 'Интеграция с HH', href: '#hh-integration' },
        { label: 'Функционал', href: '#features' },
        { label: 'Скриншоты', href: '#screenshots' },
      ],
    },
    {
      title: 'О платформе',
      links: [
        { label: 'Кейсы клиентов', href: '#cases' },
        { label: 'Отзывы', href: '#testimonials' },
        { label: 'Тарифы', href: '#pricing' },
        { label: 'Сотрудничество', href: '#partners' },
      ],
    },
    {
      title: 'Бесплатные инструменты',
      links: [
        { label: '🤖 Генератор вопросов', href: '/hr-tools/question-generator' },
        { label: '📝 Генератор вакансии', href: '/hr-tools/job-description' },
        { label: '📊 Анализатор резюме', href: '/hr-tools/resume-analyzer' },
        { label: '✉️ Ответ кандидату', href: '/hr-tools/reply-generator' },
        { label: '💰 Зарплатный гид', href: '/hr-tools/salary-guide' },
        { label: '🔍 Детектор AI в резюме', href: '/hr-tools/ai-detector' },
      ],
    },
    {
      title: 'Для клиентов',
      links: [
        { label: 'Регистрация', href: '/auth/register' },
        { label: 'Войти', href: '/auth/login' },
        { label: 'Восстановить пароль', href: '/auth/forgot-password' },
      ],
    },
  ];

  return (
    <Box sx={{ bgcolor: '#0A1929', color: '#fff', pt: 8, pb: 4 }}>
      <Container maxWidth="lg">
        {/* Main Footer Content */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {/* Logo & Description */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 2 }}>
              <SofiHRLogo width={140} height={40} href="/" />
            </Box>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3, lineHeight: 1.7 }}>
              AI-платформа для автоматизации найма и интервью. Экономьте время, находите лучших кандидатов.
            </Typography>
          </Grid>

          {/* Links Columns */}
          {footerLinks.map((column) => (
            <Grid item xs={6} sm={4} md={2} key={column.title}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                {column.title}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {column.links.map((link) => (
                  <MuiLink
                    key={link.label}
                    component={Link}
                    href={link.href}
                    onClick={(e) => handleSmoothScroll(e, link.href)}
                    sx={{
                      color: 'rgba(255,255,255,0.7)',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      transition: 'color 0.2s ease',
                      '&:hover': {
                        color: '#E91E63',
                      },
                    }}
                  >
                    {link.label}
                  </MuiLink>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Divider */}
        <Box sx={{ height: 1, bgcolor: 'rgba(255,255,255,0.1)', mb: 4 }} />

        {/* Bottom Footer */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
              © {new Date().getFullYear()} SofiHR. Все права защищены.
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', mt: 0.5 }}>
              Система соответствует требованиям 152-ФЗ "О персональных данных"
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 3, justifyContent: { xs: 'flex-start', md: 'flex-end' }, flexWrap: 'wrap' }}>
              <MuiLink
                component={Link}
                href="/privacy-policy"
                sx={{
                  color: 'rgba(255,255,255,0.6)',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  '&:hover': { color: '#E91E63' },
                }}
              >
                Политика конфиденциальности
              </MuiLink>
              <MuiLink
                component={Link}
                href="/terms-of-service"
                sx={{
                  color: 'rgba(255,255,255,0.6)',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  '&:hover': { color: '#E91E63' },
                }}
              >
                Условия использования
              </MuiLink>
              <MuiLink
                component={Link}
                href="/personal-data-consent"
                sx={{
                  color: 'rgba(255,255,255,0.6)',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  '&:hover': { color: '#E91E63' },
                }}
              >
                Согласие на ПД
              </MuiLink>
              <MuiLink
                component={Link}
                href="/forget-me"
                sx={{
                  color: 'rgba(255,255,255,0.6)',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  '&:hover': { color: '#E91E63' },
                }}
              >
                Удалить мои данные
              </MuiLink>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

