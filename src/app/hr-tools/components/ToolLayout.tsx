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

interface ToolLayoutProps {
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  children: React.ReactNode;
}

export default function ToolLayout({
  title,
  description,
  icon,
  iconColor,
  children,
}: ToolLayoutProps) {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fafafa" }}>
      {/* Header */}
      <Box sx={{ bgcolor: "#fff", borderBottom: "1px solid #e0e0e0", py: 2 }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* Logo */}
            <SofiHRLogo width={120} height={35} href="/" priority />

            {/* Right side */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Button
                component={Link}
                href="/hr-tools"
                startIcon={<Icon icon="mdi:arrow-left" />}
                sx={{
                  color: "#666",
                  textTransform: "none",
                  fontWeight: 500,
                }}
              >
                Все инструменты
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
                  px: 3,
                  "&:hover": { bgcolor: "#C2185B" },
                }}
              >
                Попробовать платформу
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Breadcrumbs */}
      <Container maxWidth="lg" sx={{ py: 2 }}>
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
      <Container maxWidth="lg" sx={{ pb: 8 }}>
        {/* Tool header */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            mb: 4,
            borderRadius: 3,
            border: "1px solid #e0e0e0",
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

      {/* Soft CTA */}
      <Box sx={{ bgcolor: "#fff", borderTop: "1px solid #e0e0e0", py: 6 }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: "center" }}>
            <Typography
              sx={{
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                color: "#999",
                mb: 2,
              }}
            >
              Понравился инструмент?
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: "1.3rem", md: "1.6rem" },
                fontWeight: 700,
                color: "#1a1a2e",
                mb: 1.5,
              }}
            >
              Попробуйте полную платформу SofiHR
            </Typography>
            <Typography
              sx={{
                fontSize: "1rem",
                color: "#666",
                mb: 3,
                maxWidth: 500,
                mx: "auto",
              }}
            >
              AI-интервью, автоматизация HeadHunter, аналитика кандидатов и
              многое другое. Первые 10 интервью бесплатно.
            </Typography>
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
                "&:hover": { bgcolor: "#C2185B" },
              }}
            >
              Начать бесплатно →
            </Button>
            <Typography
              sx={{
                mt: 2,
                fontSize: "0.85rem",
                color: "#999",
              }}
            >
              (это необязательно, инструменты останутся бесплатными 😊)
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

