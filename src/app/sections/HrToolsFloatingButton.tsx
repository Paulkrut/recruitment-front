"use client";
import * as React from "react";
import { Fab, Box, Typography, Tooltip, Paper, Drawer, useMediaQuery, useTheme } from "@mui/material";
import { Icon } from "@iconify/react";
import Link from "next/link";

const toolGroups = [
  {
    label: "Подбор и интервью",
    icon: "mdi:account-group",
    color: "#2196F3",
    tools: [
      { icon: "mdi:chat-question", color: "#2196F3", title: "Генератор вопросов", sub: "Вопросы под вакансию за 30 сек", href: "/hr-tools/question-generator" },
      { icon: "mdi:account-search", color: "#FF9800", title: "Анализатор резюме", sub: "AI-разбор и % соответствия", href: "/hr-tools/resume-analyzer" },
      { icon: "mdi:microphone-message", color: "#1565C0", title: "Транскрибация", sub: "Аудио/видео в текст + Word", href: "/hr-tools/transcription" },
      { icon: "mdi:clipboard-check-multiple", color: "#009688", title: "Оценочный лист", sub: "Scorecard с критериями", href: "/hr-tools/interview-scorecard" },
      { icon: "mdi:email-edit", color: "#9C27B0", title: "Ответ кандидату", sub: "Приглашение или отказ", href: "/hr-tools/reply-generator" },
      { icon: "mdi:robot-confused", color: "#673AB7", title: "Детектор AI", sub: "ChatGPT в резюме?", href: "/hr-tools/ai-detector" },
    ],
  },
  {
    label: "Вакансия и оффер",
    icon: "mdi:briefcase-outline",
    color: "#4CAF50",
    tools: [
      { icon: "mdi:file-document-edit", color: "#4CAF50", title: "Генератор вакансии", sub: "Полное описание за минуту", href: "/hr-tools/job-description" },
      { icon: "mdi:file-document-multiple-outline", color: "#0D9488", title: "Должностная инструкция", sub: "Обязанности, KPI, Word", href: "/hr-tools/job-description-instruction-generator" },
      { icon: "mdi:email-check-outline", color: "#009688", title: "Генератор оффера", sub: "Письмо-предложение", href: "/hr-tools/offer-generator" },
      { icon: "mdi:cash-multiple", color: "#E91E63", title: "Зарплатный гид", sub: "Вилка по рынку РФ", href: "/hr-tools/salary-guide" },
    ],
  },
  {
    label: "Юридический пакет",
    icon: "mdi:scale-balance",
    color: "#1565C0",
    tools: [
      { icon: "mdi:file-sign", color: "#1565C0", title: "Трудовой договор", sub: "По ТК РФ + Word", href: "/hr-tools/employment-contract-generator" },
      { icon: "mdi:file-document-edit-outline", color: "#7B1FA2", title: "Допсоглашение", sub: "Оклад, перевод, должность", href: "/hr-tools/additional-agreement-generator" },
      { icon: "mdi:handshake-outline", color: "#E65100", title: "Договор ГПХ", sub: "Физлица, самозанятые, ИП", href: "/hr-tools/gph-contract-generator" },
      { icon: "mdi:clipboard-text-clock-outline", color: "#2E7D32", title: "Приказ о приёме", sub: "Форма Т-1 за минуту", href: "/hr-tools/job-order-generator" },
    ],
  },
];

export default function HrToolsFloatingButton() {
  const [isVisible, setIsVisible] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [hasInteracted, setHasInteracted] = React.useState(false);
  const [showLabel, setShowLabel] = React.useState(false);
  const closeTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  React.useEffect(() => {
    const showTimer = setTimeout(() => setIsVisible(true), 2000);
    const labelTimer = setTimeout(() => {
      if (!hasInteracted) setShowLabel(true);
    }, 3000);
    const hideLabelTimer = setTimeout(() => {
      if (!hasInteracted) setShowLabel(false);
    }, 10000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(labelTimer);
      clearTimeout(hideLabelTimer);
    };
  }, [hasInteracted]);

  const openMenu = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setMenuOpen(true);
    setShowLabel(false);
    setHasInteracted(true);
  };

  const scheduleClose = () => {
    closeTimerRef.current = setTimeout(() => setMenuOpen(false), 300);
  };

  const cancelClose = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  };

  const handleFabClick = (e: React.MouseEvent) => {
    if (!menuOpen) {
      e.preventDefault();
      openMenu();
    }
  };

  if (!isVisible) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: { xs: 80, md: 100 },
        right: { xs: 16, md: 24 },
        zIndex: 1001,
      }}
    >
      {/* Menu content (shared between desktop popup and mobile drawer) */}
      {(() => {
        const menuContent = (
          <Box sx={{ p: 1.5 }}>
            <Box
              component={Link}
              href="/hr-tools"
              onClick={() => setMenuOpen(false)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 1.5,
                py: 1,
                mb: 0.5,
                textDecoration: "none",
                color: "#1a1a2e",
                borderRadius: 2,
                "&:hover": { bgcolor: "#f0fdf4" },
              }}
            >
              <Icon icon="mdi:tools" width={20} height={20} color="#4CAF50" />
              <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>
                Все HR-инструменты
              </Typography>
              <Icon icon="mdi:arrow-right" width={16} height={16} style={{ marginLeft: "auto", opacity: 0.5 }} />
            </Box>

            {toolGroups.map((group, gi) => (
              <Box key={gi}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1.5,
                    pt: gi === 0 ? 0.5 : 1.5,
                    pb: 0.5,
                  }}
                >
                  <Icon icon={group.icon} width={14} height={14} color={group.color} />
                  <Typography
                    sx={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      color: group.color,
                      textTransform: "uppercase",
                      letterSpacing: 0.8,
                    }}
                  >
                    {group.label}
                  </Typography>
                </Box>
                {group.tools.map((tool) => (
                  <Box
                    key={tool.href}
                    component={Link}
                    href={tool.href}
                    onClick={() => setMenuOpen(false)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      px: 1.5,
                      py: 0.75,
                      borderRadius: 2,
                      textDecoration: "none",
                      color: "#334155",
                      transition: "all 0.15s",
                      "&:hover": {
                        bgcolor: `${tool.color}0D`,
                        "& .tool-icon-bg": { transform: "scale(1.1)" },
                      },
                    }}
                  >
                    <Box
                      className="tool-icon-bg"
                      sx={{
                        width: 32,
                        height: 32,
                        minWidth: 32,
                        borderRadius: 1.5,
                        bgcolor: `${tool.color}14`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "transform 0.2s",
                      }}
                    >
                      <Icon icon={tool.icon} width={18} height={18} color={tool.color} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, lineHeight: 1.3 }}>
                        {tool.title}
                      </Typography>
                      <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8", lineHeight: 1.2 }}>
                        {tool.sub}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            ))}

            <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8", textAlign: "center", pt: 1.5, pb: 0.5 }}>
              Все инструменты бесплатны
            </Typography>
          </Box>
        );

        if (isMobile) {
          return (
            <Drawer
              anchor="bottom"
              open={menuOpen}
              onClose={() => setMenuOpen(false)}
              PaperProps={{
                sx: {
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                  maxHeight: "80vh",
                },
              }}
            >
              <Box sx={{ width: 40, height: 4, bgcolor: "#cbd5e1", borderRadius: 2, mx: "auto", mt: 1.5 }} />
              {menuContent}
            </Drawer>
          );
        }

        return menuOpen ? (
          <Paper
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            elevation={8}
            sx={{
              position: "absolute",
              bottom: 72,
              right: 0,
              width: 320,
              maxHeight: "70vh",
              overflowY: "auto",
              borderRadius: 3,
              animation: "fadeInUp 0.25s ease-out",
              "@keyframes fadeInUp": {
                from: { opacity: 0, transform: "translateY(12px)" },
                to: { opacity: 1, transform: "translateY(0)" },
              },
            }}
          >
            {menuContent}
          </Paper>
        ) : null;
      })()}

      {/* Expanding label (before interaction) */}
      <Box
        onClick={openMenu}
        onMouseEnter={openMenu}
        onMouseLeave={scheduleClose}
        sx={{
          position: "absolute",
          right: { xs: 64, md: 72 },
          bottom: 0,
          display: "flex",
          alignItems: "center",
          gap: 1,
          bgcolor: "#4CAF50",
          color: "#fff",
          px: 2.5,
          py: 1.5,
          borderRadius: 3,
          textDecoration: "none",
          boxShadow: "0 8px 24px rgba(76, 175, 80, 0.4)",
          cursor: "pointer",
          opacity: showLabel && !menuOpen ? 1 : 0,
          transform: showLabel && !menuOpen ? "translateX(0) scale(1)" : "translateX(20px) scale(0.8)",
          visibility: showLabel && !menuOpen ? "visible" : "hidden",
          transition: "all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
          pointerEvents: showLabel && !menuOpen ? "auto" : "none",
          "&:hover": {
            bgcolor: "#43A047",
            transform: "translateX(0) scale(1.02)",
            boxShadow: "0 12px 32px rgba(76, 175, 80, 0.5)",
          },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", whiteSpace: "nowrap" }}>
          <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", lineHeight: 1.2 }}>
            HR-инструменты
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", opacity: 0.95, fontWeight: 500 }}>
            Бесплатно
          </Typography>
        </Box>
        <Icon
          icon="mdi:arrow-right"
          width={20}
          height={20}
          style={{ opacity: 0.9, transition: "transform 0.3s ease" }}
        />
      </Box>

      {/* FAB */}
      <Tooltip
        title={menuOpen || showLabel ? "" : "Бесплатные HR-инструменты"}
        placement="left"
        arrow
      >
        <Fab
          component={Link}
          href="/hr-tools"
          onClick={handleFabClick}
          onMouseEnter={openMenu}
          onMouseLeave={scheduleClose}
          sx={{
            bgcolor: menuOpen ? "#43A047" : "#4CAF50",
            color: "#fff",
            width: { xs: 56, md: 64 },
            height: { xs: 56, md: 64 },
            boxShadow: "0 8px 24px rgba(76, 175, 80, 0.4)",
            transition: "all 0.3s ease",
            "&:hover": {
              bgcolor: "#43A047",
              transform: "scale(1.1)",
              boxShadow: "0 12px 32px rgba(76, 175, 80, 0.5)",
            },
            animation: !hasInteracted && showLabel ? "pulse-green 2s ease-in-out infinite" : "none",
            "@keyframes pulse-green": {
              "0%, 100%": { boxShadow: "0 8px 24px rgba(76,175,80,0.4)" },
              "50%": { boxShadow: "0 8px 32px rgba(76,175,80,0.7)" },
            },
          }}
        >
          <Icon icon={menuOpen ? "mdi:close" : "mdi:tools"} width={28} height={28} />
        </Fab>
      </Tooltip>
    </Box>
  );
}
