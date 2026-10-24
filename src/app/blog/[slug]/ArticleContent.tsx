"use client";
import * as React from "react";
import { Box, Container, Typography, Button, Chip } from "@mui/material";
import { Icon } from "@iconify/react";
import Link from "next/link";
import SofiHRLogo from "@/components/shared/SofiHRLogo";
import FooterSection from "@/app/sections/FooterSection";
import { ARTICLES, Article, ArticleBlock, formatDate } from "../articles";

export default function ArticleContent({ article }: { article: Article }) {
  return (
    <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh' }}>
      <AppBar />

      {/* Шапка статьи */}
      <Box sx={{ bgcolor: '#fff', py: { xs: 5, md: 7 } }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: article.color }} />
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#999' }}>
                Блог SofiHR
              </Typography>
            </Box>

            <Typography sx={{ fontSize: { xs: '1.6rem', md: '2.2rem' }, fontWeight: 800, lineHeight: 1.25, mb: 3 }}>
              {article.title}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
              {article.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  sx={{ bgcolor: `${article.color}12`, color: article.color, fontWeight: 600, fontSize: '0.75rem' }}
                />
              ))}
              <Typography sx={{ fontSize: '0.85rem', color: '#999' }}>
                {formatDate(article.date)}
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Текст статьи */}
      <Box sx={{ py: { xs: 5, md: 7 } }}>
        <Container maxWidth="md">
          <Box sx={{ bgcolor: '#fff', borderRadius: 3, border: '1px solid #e5e5e5', p: { xs: 3, md: 6 } }}>
            {article.content.map((block, i) => (
              <Block key={i} block={block} color={article.color} />
            ))}

            <Box sx={{ height: 1, bgcolor: '#e5e5e5', my: 5 }} />

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                href="/auth/register"
                sx={{ bgcolor: '#2196F3', px: 4, py: 1.5, fontWeight: 600, borderRadius: 2, textTransform: 'none', '&:hover': { bgcolor: '#1976D2' } }}
              >
                Попробовать SofiHR
              </Button>
              <Button
                variant="outlined"
                component={Link}
                href="/blog"
                sx={{ borderColor: '#e5e5e5', color: '#666', px: 4, py: 1.5, fontWeight: 600, borderRadius: 2, textTransform: 'none', '&:hover': { borderColor: '#1a1a1a', color: '#1a1a1a' } }}
              >
                Все статьи
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Другие статьи */}
      <NextArticles currentSlug={article.slug} />

      <FooterSection />
    </Box>
  );
}

/** Поддержка inline-ссылок в тексте: [текст](url) */
function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (m) {
      return (
        <a
          key={i}
          href={m[2]}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#2196F3', fontWeight: 600, textDecoration: 'none' }}
          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
        >
          {m[1]}
        </a>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

function Block({ block, color }: { block: ArticleBlock; color: string }) {
  switch (block.type) {
    case 'h2':
      return (
        <Typography sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' }, fontWeight: 700, mt: 5, mb: 2 }}>
          {block.text}
        </Typography>
      );
    case 'p':
      return (
        <Typography sx={{ fontSize: '1rem', color: '#444', lineHeight: 1.85, mb: 2.5 }}>
          {renderInline(block.text)}
        </Typography>
      );
    case 'quote':
      return (
        <Box
          sx={{
            my: 4,
            p: 3.5,
            borderRadius: 3,
            bgcolor: '#f8fafc',
            borderLeft: `4px solid ${color}`,
          }}
        >
          <Typography sx={{ fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.7, color: '#1a1a1a' }}>
            «{block.text}»
          </Typography>
        </Box>
      );
    case 'list':
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, my: 3 }}>
          {block.items.map((item) => (
            <Box key={item} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <Icon icon="mdi:check-circle" width={20} height={20} color="#4CAF50" style={{ marginTop: 2, flexShrink: 0 }} />
              <Typography sx={{ fontSize: '0.95rem', color: '#444', lineHeight: 1.7 }}>
                {item}
              </Typography>
            </Box>
          ))}
        </Box>
      );
    case 'cards':
      return (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2.5, my: 4 }}>
          {block.items.map((card) => (
            <Box
              key={card.title}
              sx={{
                borderRadius: 3,
                border: `2px solid ${card.color}30`,
                bgcolor: '#fafafa',
                p: 3,
              }}
            >
              <Icon icon={card.icon} width={30} height={30} color={card.color} style={{ marginBottom: 12 }} />
              <Typography sx={{ fontSize: '1rem', fontWeight: 700, mb: 1, color: card.color }}>
                {card.title}
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.6 }}>
                {card.text}
              </Typography>
            </Box>
          ))}
        </Box>
      );
    default:
      return null;
  }
}

function NextArticles({ currentSlug }: { currentSlug: string }) {
  const others = ARTICLES.filter((a) => a.slug !== currentSlug);

  if (others.length === 0) return null;

  return (
    <Box sx={{ bgcolor: '#fff', py: { xs: 5, md: 7 } }}>
      <Container maxWidth="lg">
        <Typography sx={{ fontSize: { xs: '1.3rem', md: '1.6rem' }, fontWeight: 800, mb: 3, textAlign: 'center' }}>
          Читайте также
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 3, maxWidth: 900, mx: 'auto' }}>
          {others.map((a) => (
            <Link key={a.slug} href={`/blog/${a.slug}`} style={{ textDecoration: 'none' }}>
              <Box
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  border: '1px solid #e5e5e5',
                  p: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': { borderColor: a.color, transform: 'translateY(-4px)' },
                }}
              >
                <Icon icon={a.icon} width={32} height={32} color={a.color} style={{ marginBottom: 12 }} />
                <Typography sx={{ fontSize: '1rem', fontWeight: 700, mb: 1, color: '#1a1a1a', lineHeight: 1.35 }}>
                  {a.title}
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#999' }}>
                  {formatDate(a.date)}
                </Typography>
              </Box>
            </Link>
          ))}
        </Box>
      </Container>
    </Box>
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
            component={Link}
            href="/blog"
            size="small"
            sx={{ borderColor: '#e5e5e5', color: '#666', textTransform: 'none', fontWeight: 600, fontSize: '0.85rem', '&:hover': { borderColor: '#1a1a1a', color: '#1a1a1a' } }}
          >
            Все статьи
          </Button>
        </Box>
      </Container>
    </Box>
  );
}