"use client";
import * as React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
} from "@mui/material";
import { Icon } from "@iconify/react";
import Link from "next/link";
import ToolCard from "./components/ToolCard";

// Конфигурация инструментов
const tools = [
  {
    id: "question-generator",
    icon: "mdi:chat-question",
    iconColor: "#2196F3",
    title: "Генератор вопросов",
    description:
      "Создайте профессиональные вопросы для собеседования за 30 секунд. Просто опишите вакансию — AI сгенерирует релевантные вопросы.",
    href: "/hr-tools/question-generator",
  },
  {
    id: "job-description",
    icon: "mdi:file-document-edit",
    iconColor: "#4CAF50",
    title: "Генератор вакансии",
    description:
      "Сгенерируйте полное описание вакансии за минуту. Укажите должность — получите готовый текст для публикации.",
    href: "/hr-tools/job-description",
  },
  {
    id: "resume-analyzer",
    icon: "mdi:account-search",
    iconColor: "#FF9800",
    title: "Анализатор резюме",
    description:
      "Получите AI-анализ резюме кандидата за минуту. Можно сравнить с вакансией и узнать процент соответствия.",
    href: "/hr-tools/resume-analyzer",
  },
  {
    id: "reply-generator",
    icon: "mdi:email-edit",
    iconColor: "#9C27B0",
    title: "Ответ кандидату",
    description:
      "Создайте профессиональный ответ кандидату — приглашение или вежливый отказ. За 10 секунд.",
    href: "/hr-tools/reply-generator",
  },
  {
    id: "salary-guide",
    icon: "mdi:cash-multiple",
    iconColor: "#E91E63",
    title: "Зарплатный гид",
    description:
      "Узнайте актуальный уровень зарплат для любой позиции. Данные по рынку труда России 2025-2026.",
    href: "/hr-tools/salary-guide",
  },
];

export default function HrToolsPage() {
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
            <Link href="/" style={{ textDecoration: "none" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    bgcolor: "#E91E63",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon icon="mdi:robot-happy" width={22} height={22} color="#fff" />
                </Box>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: "1.3rem",
                    color: "#1a1a2e",
                  }}
                >
                  SofiHR
                </Typography>
              </Box>
            </Link>

            {/* Right side */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Button
                component={Link}
                href="/"
                startIcon={<Icon icon="mdi:arrow-left" />}
                sx={{
                  color: "#666",
                  textTransform: "none",
                  fontWeight: 500,
                }}
              >
                На главную
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

      {/* Hero */}
      <Box sx={{ bgcolor: "#fff", py: { xs: 6, md: 10 }, borderBottom: "1px solid #e0e0e0" }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", maxWidth: 800, mx: "auto" }}>
            {/* Badge */}
            <Box
              sx={{
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
                mb: 3,
              }}
            >
              <Icon icon="mdi:gift-outline" width={18} height={18} />
              Бесплатно. Без регистрации. Без ограничений.
            </Box>

            {/* Title */}
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "2rem", md: "3rem" },
                fontWeight: 800,
                color: "#1a1a2e",
                mb: 2,
                lineHeight: 1.2,
              }}
            >
              AI-инструменты для HR
            </Typography>

            {/* Subtitle */}
            <Typography
              sx={{
                fontSize: { xs: "1rem", md: "1.2rem" },
                color: "#666",
                maxWidth: 600,
                mx: "auto",
                lineHeight: 1.6,
              }}
            >
              Полноценные инструменты на базе искусственного интеллекта.
              Автоматизируйте рутинные задачи найма — вопросы, вакансии, анализ резюме.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Tools Grid */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Grid container spacing={3}>
          {tools.map((tool) => (
            <Grid item xs={12} sm={6} md={4} key={tool.id}>
              <ToolCard {...tool} />
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How it works */}
      <Box sx={{ bgcolor: "#fff", py: { xs: 6, md: 8 }, borderTop: "1px solid #e0e0e0" }}>
        <Container maxWidth="lg">
          <Typography
            sx={{
              textAlign: "center",
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              color: "#999",
              mb: 2,
            }}
          >
            Как это работает
          </Typography>

          <Typography
            sx={{
              textAlign: "center",
              fontSize: { xs: "1.5rem", md: "2rem" },
              fontWeight: 700,
              color: "#1a1a2e",
              mb: 6,
            }}
          >
            Три простых шага
          </Typography>

          <Grid container spacing={4}>
            {[
              {
                icon: "mdi:pencil",
                title: "1. Введите данные",
                description: "Опишите вакансию, вставьте резюме или укажите должность — в зависимости от инструмента.",
              },
              {
                icon: "mdi:robot",
                title: "2. AI генерирует",
                description: "Искусственный интеллект анализирует данные и создаёт результат за 10-30 секунд.",
              },
              {
                icon: "mdi:content-copy",
                title: "3. Копируйте и используйте",
                description: "Готовый результат можно скопировать или скачать. Никаких скрытых условий.",
              },
            ].map((step, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box sx={{ textAlign: "center" }}>
                  <Box
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: "50%",
                      bgcolor: "#f5f5f5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 2,
                    }}
                  >
                    <Icon icon={step.icon} width={32} height={32} color="#E91E63" />
                  </Box>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "1.1rem",
                      color: "#1a1a2e",
                      mb: 1,
                    }}
                  >
                    {step.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.95rem",
                      color: "#666",
                      lineHeight: 1.6,
                    }}
                  >
                    {step.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA */}
      <Box sx={{ bgcolor: "#1a1a2e", py: { xs: 6, md: 8 } }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: "center" }}>
            <Typography
              sx={{
                fontSize: { xs: "1.5rem", md: "2rem" },
                fontWeight: 700,
                color: "#fff",
                mb: 2,
              }}
            >
              Хотите больше возможностей?
            </Typography>
            <Typography
              sx={{
                fontSize: "1rem",
                color: "rgba(255,255,255,0.7)",
                mb: 4,
                maxWidth: 500,
                mx: "auto",
              }}
            >
              Попробуйте полную платформу SofiHR: AI-интервью, автоматизация HeadHunter,
              аналитика кандидатов и многое другое.
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
              Начать бесплатно — 10 интервью в подарок
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: "#fff", py: 4, borderTop: "1px solid #e0e0e0" }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Typography sx={{ fontSize: "0.85rem", color: "#999" }}>
              © 2025 SofiHR. Все права защищены.
            </Typography>
            <Box sx={{ display: "flex", gap: 3 }}>
              <Link
                href="/privacy-policy"
                style={{ textDecoration: "none", color: "#666", fontSize: "0.85rem" }}
              >
                Политика конфиденциальности
              </Link>
              <Link
                href="/terms-of-service"
                style={{ textDecoration: "none", color: "#666", fontSize: "0.85rem" }}
              >
                Условия использования
              </Link>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

