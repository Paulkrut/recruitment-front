"use client";
import * as React from "react";
import { Box, Container, Typography, Button, Grid } from "@mui/material";
import { Icon } from "@iconify/react";
import Link from "next/link";

const tools = [
  {
    id: "question-generator",
    icon: "mdi:chat-question",
    iconColor: "#2196F3",
    title: "Вопросы",
    subtitle: "для интервью",
    href: "/hr-tools/question-generator",
  },
  {
    id: "job-description",
    icon: "mdi:file-document-edit",
    iconColor: "#4CAF50",
    title: "Вакансия",
    subtitle: "описание",
    href: "/hr-tools/job-description",
  },
  {
    id: "resume-analyzer",
    icon: "mdi:account-search",
    iconColor: "#FF9800",
    title: "Резюме",
    subtitle: "анализ",
    href: "/hr-tools/resume-analyzer",
  },
  {
    id: "reply-generator",
    icon: "mdi:email-edit",
    iconColor: "#9C27B0",
    title: "Ответ",
    subtitle: "кандидату",
    href: "/hr-tools/reply-generator",
  },
  {
    id: "salary-guide",
    icon: "mdi:cash-multiple",
    iconColor: "#E91E63",
    title: "Зарплата",
    subtitle: "гид",
    href: "/hr-tools/salary-guide",
  },
];

export default function HrToolsMiniSection() {
  return (
    <Box
      id="hr-tools"
      sx={{
        bgcolor: "#fff",
        py: { xs: 5, md: 6 },
        borderTop: "1px solid #e0e0e0",
        borderBottom: "1px solid #e0e0e0",
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
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
              fontSize: "0.8rem",
              fontWeight: 600,
              mb: 2,
            }}
          >
            <Icon icon="mdi:gift-outline" width={16} height={16} />
            Бесплатно. Без регистрации.
          </Box>

          <Typography
            sx={{
              fontSize: { xs: "1.5rem", md: "2rem" },
              fontWeight: 800,
              color: "#1a1a2e",
              mb: 1,
            }}
          >
            AI-инструменты для HR
          </Typography>

          <Typography
            sx={{
              fontSize: { xs: "0.9rem", md: "1rem" },
              color: "#666",
              maxWidth: 500,
              mx: "auto",
            }}
          >
            Полноценные инструменты на базе искусственного интеллекта.
            Автоматизируйте рутинные задачи.
          </Typography>
        </Box>

        {/* Tools grid */}
        <Grid
          container
          spacing={2}
          justifyContent="center"
          sx={{ mb: 3 }}
        >
          {tools.map((tool) => (
            <Grid item xs={6} sm={4} md={2.4} key={tool.id}>
              <Box
                component={Link}
                href={tool.href}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  p: 2,
                  bgcolor: "#fafafa",
                  borderRadius: 2,
                  border: "1px solid #e0e0e0",
                  textDecoration: "none",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  "&:hover": {
                    borderColor: tool.iconColor,
                    transform: "translateY(-2px)",
                    boxShadow: `0 4px 12px ${tool.iconColor}20`,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: `${tool.iconColor}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 1.5,
                  }}
                >
                  <Icon icon={tool.icon} width={24} height={24} color={tool.iconColor} />
                </Box>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    color: "#1a1a2e",
                    textAlign: "center",
                  }}
                >
                  {tool.title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    color: "#999",
                    textAlign: "center",
                  }}
                >
                  {tool.subtitle}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* CTA */}
        <Box sx={{ textAlign: "center" }}>
          <Button
            component={Link}
            href="/hr-tools"
            endIcon={<Icon icon="mdi:arrow-right" />}
            sx={{
              color: "#E91E63",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "1rem",
              "&:hover": {
                bgcolor: "#fce4ec",
              },
            }}
          >
            Все инструменты
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

