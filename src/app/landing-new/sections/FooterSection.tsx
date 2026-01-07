"use client";
import * as React from "react";
import { Box, Container, Typography, Grid, Link as MuiLink } from "@mui/material";
import { Icon } from "@iconify/react";
import Link from "next/link";

export default function FooterSection() {
  const footerLinks = [
    {
      title: 'Возможности',
      links: [
        { label: 'AI-интервью', href: '#' },
        { label: 'Интеграция с HH', href: '#' },
        { label: 'Аналитика', href: '#' },
        { label: 'Канбан', href: '#' },
      ],
    },
    {
      title: 'Компания',
      links: [
        { label: 'О нас', href: '#' },
        { label: 'Контакты', href: '#' },
        { label: 'Блог', href: '#' },
      ],
    },
    {
      title: 'Поддержка',
      links: [
        { label: 'Документация', href: '#' },
        { label: 'API', href: '#' },
        { label: 'Помощь', href: '#' },
      ],
    },
  ];

  const socialLinks = [
    { icon: 'mdi:telegram', href: '#', label: 'Telegram' },
    { icon: 'mdi:youtube', href: '#', label: 'YouTube' },
    { icon: 'mdi:github', href: '#', label: 'GitHub' },
  ];

  return (
    <Box sx={{ bgcolor: '#0A1929', color: '#fff', pt: 8, pb: 4 }}>
      <Container maxWidth="lg">
        {/* Main Footer Content */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {/* Logo & Description */}
          <Grid item xs={12} md={4}>
            <Typography variant="h4" fontWeight={900} sx={{ mb: 2, letterSpacing: 1 }}>
              SofiHR
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3, lineHeight: 1.7 }}>
              AI-платформа для автоматизации найма и интервью. Экономьте время, находите лучших кандидатов.
            </Typography>
            {/* Social Links */}
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              {socialLinks.map((social) => (
                <Box
                  key={social.label}
                  component="a"
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    bgcolor: 'rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: '#E91E63',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Icon icon={social.icon} width={20} height={20} />
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Links Columns */}
          {footerLinks.map((column) => (
            <Grid item xs={6} sm={4} md={2.66} key={column.title}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                {column.title}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {column.links.map((link) => (
                  <MuiLink
                    key={link.label}
                    component={Link}
                    href={link.href}
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

