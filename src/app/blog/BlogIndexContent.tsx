"use client";
import * as React from "react";
import { Box, Container, Typography, Button, Grid } from "@mui/material";
import { Icon } from "@iconify/react";
import Link from "next/link";
import SofiHRLogo from "@/components/shared/SofiHRLogo";
import FooterSection from "@/app/sections/FooterSection";
import { ARTICLES, formatDate, Article } from "./articles";

export default function BlogIndexContent() {
  return (
    <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh' }}>
      <AppBar />

      {/* Hero */}
      <Box sx={{ bgcolor: '#fff', py: { xs: 6, md: 9 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#2196F3' }} />
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#999' }}>
                Блог SofiHR
              </Typography>
            </Box>

            <Typography sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 800, lineHeight: 1.15, mb: 2 }}>
              Про найм, AI и <Box component="span" sx={{ color: '#2196F3' }}>то, что за ним стоит</Box>
            </Typography>

            <Typography sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, color: '#666', maxWidth: 700, mx: 'auto', lineHeight: 1.7 }}>
              Технологии, партнёрства и практика автоматизации найма — из первых рук
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Статьи */}
      <Box sx={{ py: { xs: 6, md: 9 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {ARTICLES.map((article) => (
              <Grid item xs={12} sm={6} md={4} key={article.slug}>
                <ArticleCard article={article} />
              </Grid>
            ))}
          </Grid>

          {ARTICLES.length === 0 && (
            <Typography sx={{ textAlign: 'center', color: '#999', mt: 6 }}>
              Статьи скоро появятся
            </Typography>
          )}
        </Container>
      </Box>

      {/* CTA */}
      <Box sx={{ bgcolor: '#fff', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', maxWidth: 700, mx: 'auto' }}>
            <Typography sx={{ fontSize: { xs: '1.4rem', md: '1.8rem' }, fontWeight: 800, mb: 1.5 }}>
              Хотите увидеть, как это работает?
            </Typography>
            <Typography sx={{ fontSize: '0.95rem', color: '#666', mb: 3 }}>
              Зарегистрируйтесь и проведите первые AI-интервью уже сегодня
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                href="/auth/register"
                sx={{ bgcolor: '#2196F3', px: 4, py: 1.5, fontWeight: 600, borderRadius: 2, textTransform: 'none', '&:hover': { bgcolor: '#1976D2' } }}
              >
                Попробовать бесплатно
              </Button>
              <Button
                variant="outlined"
                component={Link}
                href="/"
                sx={{ borderColor: '#e5e5e5', color: '#666', px: 4, py: 1.5, fontWeight: 600, borderRadius: 2, textTransform: 'none', '&:hover': { borderColor: '#1a1a1a', color: '#1a1a1a' } }}
              >
                На главную
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      <FooterSection />
    </Box>
  );
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <Link href={`/blog/${article.slug}`} style={{ textDecoration: 'none', height: '100%' }}>
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
          border: '1px solid #e5e5e5',
          bgcolor: '#fff',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: `0 12px 32px ${article.color}25`,
            borderColor: article.color,
          },
        }}
      >
        {/* Обложка */}
        <Box
          sx={{
            height: 140,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: `${article.color}0D`,
          }}
        >
          <Icon icon={article.icon} width={56} height={56} color={article.color} />
        </Box>

        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', flex: 1 }}>
          {/* Теги */}
          <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
            {article.tags.map((tag) => (
              <Typography
                key={tag}
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: article.color,
                  bgcolor: `${article.color}12`,
                  px: 1.5,
                  py: 0.4,
                  borderRadius: 1,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                {tag}
              </Typography>
            ))}
          </Box>

          <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a1a1a', mb: 1, lineHeight: 1.35 }}>
            {article.title}
          </Typography>

          <Typography sx={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.6, mb: 2, flex: 1 }}>
            {article.excerpt}
          </Typography>

          <Typography sx={{ fontSize: '0.8rem', color: '#999' }}>
            {formatDate(article.date)}
          </Typography>
        </Box>
      </Box>
    </Link>
  );
}

function AppBar() {
  return (
    <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #e5e5e5', py: 1.5 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <SofiHRLogo width={120} height={35} href="/" priority />
          <Button
            variant="outlined"
            href="/auth/register"
            size="small"
            sx={{ borderColor: '#e5e5e5', color: '#666', textTransform: 'none', fontWeight: 600, fontSize: '0.85rem', '&:hover': { borderColor: '#1a1a1a', color: '#1a1a1a' } }}
          >
            Регистрация
          </Button>
        </Box>
      </Container>
    </Box>
  );
}