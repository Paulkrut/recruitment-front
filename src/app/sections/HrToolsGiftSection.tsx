"use client";
import * as React from "react";
import { Box, Container, Typography, Grid, alpha } from "@mui/material";
import { Icon } from "@iconify/react";
import Link from "next/link";

const tools = [
  {
    id: "question-generator",
    icon: "mdi:chat-question-outline",
    iconColor: "#2196F3",
    gradient: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
    title: "Генератор вопросов",
    description: "Создайте умные вопросы для интервью за 30 секунд",
    emoji: "💬",
    href: "/hr-tools/question-generator",
  },
  {
    id: "job-description",
    icon: "mdi:file-document-edit-outline",
    iconColor: "#4CAF50",
    gradient: "linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)",
    title: "Генератор вакансий",
    description: "Напишите привлекательное описание вакансии за минуту",
    emoji: "📝",
    href: "/hr-tools/job-description",
  },
  {
    id: "resume-analyzer",
    icon: "mdi:account-search-outline",
    iconColor: "#FF9800",
    gradient: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
    title: "Анализатор резюме",
    description: "Получите AI-анализ кандидата с оценкой соответствия",
    emoji: "🔍",
    href: "/hr-tools/resume-analyzer",
  },
  {
    id: "reply-generator",
    icon: "mdi:email-edit-outline",
    iconColor: "#9C27B0",
    gradient: "linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)",
    title: "Ответ кандидату",
    description: "Составьте тактичный и профессиональный ответ",
    emoji: "✉️",
    href: "/hr-tools/reply-generator",
  },
  {
    id: "salary-guide",
    icon: "mdi:cash-multiple",
    iconColor: "#E91E63",
    gradient: "linear-gradient(135deg, #E91E63 0%, #C2185B 100%)",
    title: "Зарплатный гид",
    description: "Узнайте актуальный уровень зарплат по рынку 2025",
    emoji: "💰",
    href: "/hr-tools/salary-guide",
  },
];

export default function HrToolsGiftSection() {
  const [hoveredTool, setHoveredTool] = React.useState<string | null>(null);

  return (
    <Box
      id="free-tools"
      sx={{
        bgcolor: "#fff",
        py: { xs: 6, md: 8 },
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Декоративный фон */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.03,
          backgroundImage: "radial-gradient(circle at 20% 50%, #4CAF50 0%, transparent 50%), radial-gradient(circle at 80% 80%, #E91E63 0%, transparent 50%)",
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        {/* Эмоциональный заголовок */}
        <Box sx={{ textAlign: "center", mb: 5 }}>
          {/* Badge с сердечком */}
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              px: 2.5,
              py: 1,
              bgcolor: alpha("#4CAF50", 0.08),
              borderRadius: 50,
              border: `2px solid ${alpha("#4CAF50", 0.2)}`,
              mb: 3,
            }}
          >
            <Box
              sx={{
                fontSize: "1.2rem",
                animation: "heartbeat 1.5s ease-in-out infinite",
                "@keyframes heartbeat": {
                  "0%, 100%": { transform: "scale(1)" },
                  "10%, 30%": { transform: "scale(1.2)" },
                  "20%, 40%": { transform: "scale(1.1)" },
                },
              }}
            >
              💚
            </Box>
            <Typography
              sx={{
                fontSize: "0.9rem",
                fontWeight: 700,
                color: "#2e7d32",
                letterSpacing: 0.5,
              }}
            >
              Наш подарок для HR-специалистов
            </Typography>
          </Box>

          {/* Основной заголовок */}
          <Typography
            sx={{
              fontSize: { xs: "1.8rem", md: "2.5rem" },
              fontWeight: 800,
              lineHeight: 1.2,
              mb: 2,
              color: "#1a1a1a",
            }}
          >
            Не готовы к платформе?{" "}
            <Box
              component="span"
              sx={{
                background: "linear-gradient(135deg, #4CAF50 0%, #2196F3 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Попробуйте бесплатные инструменты
            </Box>
          </Typography>

          {/* Тёплое описание */}
          <Typography
            sx={{
              fontSize: { xs: "1rem", md: "1.15rem" },
              color: "#555",
              maxWidth: 700,
              mx: "auto",
              lineHeight: 1.7,
            }}
          >
            Мы создали отдельные AI-инструменты, которые работают{" "}
            <Box component="span" sx={{ fontWeight: 600, color: "#4CAF50" }}>
              без регистрации и совершенно бесплатно
            </Box>
            . Познакомьтесь с возможностями искусственного интеллекта для HR
            и оцените, как мы заботимся о вашей работе. 💚
          </Typography>
        </Box>

        {/* Карточки инструментов */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {tools.map((tool, index) => (
            <Grid item xs={12} sm={6} md={2.4} key={tool.id}>
              <Box
                component={Link}
                href={tool.href}
                onMouseEnter={() => setHoveredTool(tool.id)}
                onMouseLeave={() => setHoveredTool(null)}
                sx={{
                  display: "block",
                  textDecoration: "none",
                  height: "100%",
                  // Анимация появления с задержкой
                  opacity: 0,
                  animation: "fadeInUp 0.6s ease forwards",
                  animationDelay: `${index * 0.1}s`,
                  "@keyframes fadeInUp": {
                    from: {
                      opacity: 0,
                      transform: "translateY(20px)",
                    },
                    to: {
                      opacity: 1,
                      transform: "translateY(0)",
                    },
                  },
                }}
              >
                <Box
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    p: 3,
                    bgcolor: "#fafafa",
                    borderRadius: 3,
                    border: "2px solid",
                    borderColor:
                      hoveredTool === tool.id
                        ? tool.iconColor
                        : "transparent",
                    background:
                      hoveredTool === tool.id
                        ? `linear-gradient(to bottom, ${alpha(tool.iconColor, 0.05)}, #fafafa)`
                        : "#fafafa",
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    transform:
                      hoveredTool === tool.id
                        ? "translateY(-8px) scale(1.02)"
                        : "translateY(0) scale(1)",
                    boxShadow:
                      hoveredTool === tool.id
                        ? `0 12px 32px ${alpha(tool.iconColor, 0.25)}`
                        : "0 2px 8px rgba(0,0,0,0.04)",
                    cursor: "pointer",
                  }}
                >
                  {/* Иконка с градиентом */}
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 3,
                      background: tool.gradient,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2,
                      transition: "all 0.4s ease",
                      transform:
                        hoveredTool === tool.id ? "scale(1.1) rotate(5deg)" : "scale(1) rotate(0deg)",
                      boxShadow:
                        hoveredTool === tool.id
                          ? `0 8px 24px ${alpha(tool.iconColor, 0.4)}`
                          : "none",
                    }}
                  >
                    <Icon icon={tool.icon} width={32} height={32} color="#fff" />
                  </Box>

                  {/* Заголовок */}
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "1rem",
                      color: "#1a1a1a",
                      textAlign: "center",
                      mb: 1,
                      lineHeight: 1.3,
                    }}
                  >
                    {tool.title}
                  </Typography>

                  {/* Описание */}
                  <Typography
                    sx={{
                      fontSize: "0.85rem",
                      color: "#666",
                      textAlign: "center",
                      lineHeight: 1.5,
                    }}
                  >
                    {tool.description}
                  </Typography>

                  {/* Стрелка при наведении */}
                  <Box
                    sx={{
                      mt: "auto",
                      pt: 2,
                      opacity: hoveredTool === tool.id ? 1 : 0,
                      transform:
                        hoveredTool === tool.id
                          ? "translateX(0)"
                          : "translateX(-10px)",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <Icon
                      icon="mdi:arrow-right"
                      width={24}
                      height={24}
                      color={tool.iconColor}
                    />
                  </Box>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Нижний блок с призывом */}
        <Box
          sx={{
            textAlign: "center",
            py: 4,
            px: 3,
            borderRadius: 3,
            bgcolor: alpha("#4CAF50", 0.05),
            border: `1px solid ${alpha("#4CAF50", 0.15)}`,
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: "0.95rem", md: "1.05rem" },
              color: "#555",
              mb: 2,
              lineHeight: 1.6,
            }}
          >
            <Box component="span" sx={{ fontWeight: 600, color: "#1a1a1a" }}>
              Используйте сколько хотите
            </Box>{" "}
            — эти инструменты всегда бесплатны. Никаких скрытых платежей, никаких
            ограничений.
            <br />
            Просто инструменты, созданные с заботой о вашей работе. 💚
          </Typography>

          <Box
            component={Link}
            href="/hr-tools"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              px: 3,
              py: 1.5,
              bgcolor: "#4CAF50",
              color: "#fff",
              borderRadius: 2,
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "1rem",
              transition: "all 0.3s ease",
              boxShadow: `0 4px 16px ${alpha("#4CAF50", 0.3)}`,
              "&:hover": {
                bgcolor: "#43A047",
                transform: "translateY(-2px)",
                boxShadow: `0 6px 24px ${alpha("#4CAF50", 0.4)}`,
              },
            }}
          >
            <span>Попробовать инструменты</span>
            <Icon icon="mdi:arrow-right" width={20} height={20} />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

