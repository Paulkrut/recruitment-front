"use client";
import { Box, Typography } from "@mui/material";
import { Icon } from "@iconify/react";

interface StepCardProps {
  icon: string;
  title: string;
  description: string;
}

export function HeroBadge() {
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1,
        px: 2,
        py: 1,
        bgcolor: "#e8f5e9",
        border: "1px solid #a5d6a7",
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
  );
}

export function StepCard({ icon, title, description }: StepCardProps) {
  return (
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
        <Icon icon={icon} width={32} height={32} color="#E91E63" />
      </Box>
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: "1.1rem",
          color: "#1a1a2e",
          mb: 1,
        }}
      >
        {title}
      </Typography>
      <Typography
        sx={{
          fontSize: "0.95rem",
          color: "#666",
          lineHeight: 1.6,
        }}
      >
        {description}
      </Typography>
    </Box>
  );
}

