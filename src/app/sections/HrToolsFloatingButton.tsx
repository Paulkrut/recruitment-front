"use client";
import * as React from "react";
import { Fab, Box, Typography, Tooltip } from "@mui/material";
import { Icon } from "@iconify/react";
import Link from "next/link";

export default function HrToolsFloatingButton() {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [hasInteracted, setHasInteracted] = React.useState(false);

  React.useEffect(() => {
    // Показываем кнопку через 2 секунды после загрузки
    const showTimer = setTimeout(() => setIsVisible(true), 2000);
    
    // Автоматически раскрываем через 1 секунду после появления (только если не было взаимодействия)
    const expandTimer = setTimeout(() => {
      if (!hasInteracted) {
        setIsExpanded(true);
      }
    }, 3000);
    
    // Сворачиваем через 7 секунд после раскрытия
    const collapseTimer = setTimeout(() => {
      if (!hasInteracted) {
        setIsExpanded(false);
      }
    }, 10000);
    
    return () => {
      clearTimeout(showTimer);
      clearTimeout(expandTimer);
      clearTimeout(collapseTimer);
    };
  }, [hasInteracted]);

  const handleMouseEnter = () => {
    setIsExpanded(true);
    setHasInteracted(true);
  };

  const handleMouseLeave = () => {
    setIsExpanded(false);
  };

  if (!isVisible) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: { xs: 80, md: 100 },
        right: { xs: 16, md: 24 },
        zIndex: 1001,
        display: "flex",
        alignItems: "center",
        gap: 1.5,
      }}
    >
      {/* Основная кнопка */}
      <Tooltip
        title={isExpanded ? "" : "Бесплатные HR-инструменты"}
        placement="left"
        arrow
      >
        <Fab
          component={Link}
          href="/hr-tools"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          sx={{
            bgcolor: "#4CAF50",
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
            // Пульсирующая анимация при первом появлении
            animation: !hasInteracted && isExpanded ? "pulse-green 2s ease-in-out infinite" : "none",
            "@keyframes pulse-green": {
              "0%, 100%": {
                boxShadow: "0 8px 24px rgba(76, 175, 80, 0.4)",
              },
              "50%": {
                boxShadow: "0 8px 32px rgba(76, 175, 80, 0.7)",
              },
            },
          }}
        >
          <Icon icon="mdi:tools" width={28} height={28} />
        </Fab>
      </Tooltip>

      {/* Раскрывающаяся панель с текстом */}
      <Box
        component={Link}
        href="/hr-tools"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        sx={{
          position: "absolute",
          right: { xs: 64, md: 72 },
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
          // Плавная анимация появления/исчезновения
          opacity: isExpanded ? 1 : 0,
          transform: isExpanded ? "translateX(0) scale(1)" : "translateX(20px) scale(0.8)",
          visibility: isExpanded ? "visible" : "hidden",
          transition: "all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
          pointerEvents: isExpanded ? "auto" : "none",
          "&:hover": {
            bgcolor: "#43A047",
            transform: "translateX(0) scale(1.02)",
            boxShadow: "0 12px 32px rgba(76, 175, 80, 0.5)",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            whiteSpace: "nowrap",
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "0.95rem",
              lineHeight: 1.2,
            }}
          >
            HR-инструменты
          </Typography>
          <Typography
            sx={{
              fontSize: "0.75rem",
              opacity: 0.95,
              fontWeight: 500,
            }}
          >
            Бесплатно
          </Typography>
        </Box>
        <Icon 
          icon="mdi:arrow-right" 
          width={20} 
          height={20}
          style={{ 
            opacity: 0.9,
            transition: "transform 0.3s ease"
          }}
        />
      </Box>
    </Box>
  );
}
