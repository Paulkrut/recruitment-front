"use client";
import * as React from "react";
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Button,
  Paper,
} from "@mui/material";
import { Icon } from "@iconify/react";
import Link from "next/link";
import SofiHRLogo from "@/components/shared/SofiHRLogo";

interface CtaFeature {
  icon: string;
  text: string;
}

interface ToolLayoutProps {
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  children: React.ReactNode;
  ctaLabel?: string;
  ctaTitle?: string;
  ctaDescription?: string;
  ctaFeatures?: CtaFeature[];
  ctaButtonText?: string;
}

export default function ToolLayout({
  title,
  description,
  icon,
  iconColor,
  children,
  ctaLabel = "Понравился инструмент?",
  ctaTitle = "Попробуйте полную платформу SofiHR",
  ctaDescription = "AI-интервью, автоматизация HeadHunter, аналитика кандидатов и многое другое. Первые 10 интервью бесплатно.",
  ctaFeatures,
  ctaButtonText = "Начать бесплатно →",
}: ToolLayoutProps) {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fff" }}>
      {/* Header */}
      <Box sx={{ bgcolor: "#fff", borderBottom: "1px solid #e0e0e0", py: 2 }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            {/* Logo */}
            <SofiHRLogo width={110} height={32} href="/" priority />

            {/* Right side */}
            <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 2 }, flexShrink: 0 }}>
              {/* "Все инструменты" — только иконка на xs, с текстом на sm+ */}
              <Button
                component={Link}
                href="/hr-tools"
                sx={{
                  color: "#666",
                  textTransform: "none",
                  fontWeight: 500,
                  minWidth: 0,
                  px: { xs: 1, sm: 2 },
                }}
              >
                <Icon icon="mdi:arrow-left" width={20} height={20} />
                <Box component="span" sx={{ display: { xs: "none", sm: "inline" }, ml: 0.5 }}>
                  Все инструменты
                </Box>
              </Button>
              <Button
                component={Link}
                href="/auth/register"
                variant="contained"
                sx={{
                  bgcolor: "#E91E63",
                  color: "#fff",
                  textTransform: "none",
                  fontWeight: 600,
                  px: { xs: 1.5, sm: 3 },
                  fontSize: { xs: "0.78rem", sm: "0.875rem" },
                  whiteSpace: "nowrap",
                  "&:hover": { bgcolor: "#C2185B" },
                }}
              >
                <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                  Попробовать платформу
                </Box>
                <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
                  Платформа
                </Box>
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Tool zone wrapper — цветной фон отделяет инструмент от SEO-контента */}
      <Box
        sx={{
          bgcolor: "#f0f7ff",
          borderTop: `4px solid ${iconColor}`,
          borderBottom: "1px solid #d0e4f7",
        }}
      >
        {/* Breadcrumbs */}
        <Container maxWidth="lg" sx={{ py: 1.5 }}>
          <Breadcrumbs sx={{ fontSize: "0.85rem" }}>
            <Link
              href="/"
              style={{ textDecoration: "none", color: "#666" }}
            >
              Главная
            </Link>
            <Link
              href="/hr-tools"
              style={{ textDecoration: "none", color: "#666" }}
            >
              HR-инструменты
            </Link>
            <Typography color="text.primary" sx={{ fontSize: "0.85rem" }}>
              {title}
            </Typography>
          </Breadcrumbs>
        </Container>

        {/* Main content */}
        <Container maxWidth="lg" sx={{ pb: 6 }}>
          {/* Tool header */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              mb: 4,
              borderRadius: 3,
              border: "1px solid #d0e4f7",
              bgcolor: "#fff",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 3 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 2,
                  bgcolor: `${iconColor}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon icon={icon} width={32} height={32} color={iconColor} />
              </Box>
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: "1.5rem", md: "2rem" },
                    color: "#1a1a2e",
                    mb: 1,
                  }}
                >
                  {title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "1rem",
                    color: "#666",
                    maxWidth: 600,
                  }}
                >
                  {description}
                </Typography>
              </Box>
            </Box>

            {/* Free badge */}
            <Box
              sx={{
                mt: 3,
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                px: 2,
                py: 0.75,
                bgcolor: "#e8f5e9",
                borderRadius: 2,
                color: "#2e7d32",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              <Icon icon="mdi:gift-outline" width={18} height={18} />
              Бесплатно, без регистрации
            </Box>
          </Paper>

          {/* Tool content */}
          {children}
        </Container>
      </Box>{/* /Tool zone wrapper */}

      {/* Contextual CTA */}
      <Box sx={{ bgcolor: "#1a1a2e", borderTop: "1px solid #e0e0e0", py: { xs: 6, md: 8 } }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: "center" }}>
            <Typography
              sx={{
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.5)",
                mb: 2,
              }}
            >
              {ctaLabel}
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: "1.4rem", md: "1.8rem" },
                fontWeight: 700,
                color: "#fff",
                mb: 1.5,
                lineHeight: 1.3,
              }}
            >
              {ctaTitle}
            </Typography>
            <Typography
              sx={{
                fontSize: "1rem",
                color: "rgba(255,255,255,0.7)",
                mb: ctaFeatures ? 4 : 3,
                maxWidth: 560,
                mx: "auto",
                lineHeight: 1.6,
              }}
            >
              {ctaDescription}
            </Typography>

            {ctaFeatures && ctaFeatures.length > 0 && (
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: 1.5,
                  mb: 4,
                  maxWidth: 600,
                  mx: "auto",
                }}
              >
                {ctaFeatures.map((feature, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.75,
                      px: 2,
                      py: 0.75,
                      bgcolor: "rgba(255,255,255,0.08)",
                      borderRadius: 2,
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    <Icon icon={feature.icon} width={15} height={15} color="rgba(255,255,255,0.6)" />
                    <Typography sx={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
                      {feature.text}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}

            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, justifyContent: "center", alignItems: "center" }}>
              <Button
                component={Link}
                href="/auth/register"
                variant="contained"
                size="large"
                sx={{
                  bgcolor: "#E91E63",
                  color: "#fff",
                  textTransform: "none",
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  fontSize: "1rem",
                  borderRadius: 2,
                  boxShadow: "0 4px 20px rgba(233,30,99,0.4)",
                  "&:hover": { bgcolor: "#C2185B", boxShadow: "0 6px 24px rgba(233,30,99,0.5)" },
                }}
              >
                {ctaButtonText}
              </Button>
              <Button
                component={Link}
                href="/#contact"
                variant="outlined"
                size="large"
                sx={{
                  color: "rgba(255,255,255,0.8)",
                  borderColor: "rgba(255,255,255,0.25)",
                  textTransform: "none",
                  fontWeight: 500,
                  px: 3,
                  py: 1.5,
                  fontSize: "0.95rem",
                  borderRadius: 2,
                  "&:hover": { borderColor: "rgba(255,255,255,0.5)", bgcolor: "rgba(255,255,255,0.05)" },
                }}
              >
                Запросить демо →
              </Button>
            </Box>
            <Typography
              sx={{
                mt: 2.5,
                fontSize: "0.8rem",
                color: "rgba(255,255,255,0.35)",
              }}
            >
              Бесплатные инструменты никуда не денутся — они остаются открытыми
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

