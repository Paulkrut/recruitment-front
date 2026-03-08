"use client";
import { Button, Box, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import Link from "next/link";

interface ClientButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "text" | "outlined" | "contained";
  startIcon?: React.ReactNode;
  sx?: any;
}

export function ClientButton({ href, children, variant = "text", startIcon, sx }: ClientButtonProps) {
  return (
    <Button
      component={Link}
      href={href}
      variant={variant}
      startIcon={startIcon}
      sx={sx}
    >
      {children}
    </Button>
  );
}

export function BackButton() {
  return (
    <Button
      component={Link}
      href="/"
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
        На главную
      </Box>
    </Button>
  );
}

export function RegisterButton() {
  return (
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
  );
}

export function CTAButton() {
  return (
    <ClientButton
      href="/auth/register"
      variant="contained"
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
        "&:hover": { bgcolor: "#C2185B" },
      }}
    >
      Начать бесплатно — 10 интервью в подарок
    </ClientButton>
  );
}

const ctaFeatures = [
  { icon: "mdi:headhunter", text: "Интеграция с HeadHunter" },
  { icon: "mdi:robot", text: "AI-интервью" },
  { icon: "mdi:chart-bar", text: "Рейтинг кандидатов" },
  { icon: "mdi:flag", text: "Красные флаги" },
  { icon: "mdi:microsoft-excel", text: "Экспорт в Excel" },
];

export function HrToolsCTA() {
  return (
    <>
      {/* Feature chips */}
      <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 1.5, mb: 4, maxWidth: 580, mx: "auto" }}>
        {ctaFeatures.map((f, i) => (
          <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 0.75, px: 2, py: 0.75, bgcolor: "rgba(255,255,255,0.08)", borderRadius: 2, border: "1px solid rgba(255,255,255,0.12)" }}>
            <Icon icon={f.icon} width={14} height={14} color="rgba(255,255,255,0.6)" />
            <Typography sx={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
              {f.text}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Buttons */}
      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, justifyContent: "center", alignItems: "center" }}>
        <CTAButton />
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
      <Typography sx={{ mt: 2.5, fontSize: "0.8rem", color: "rgba(255,255,255,0.35)" }}>
        Бесплатные инструменты никуда не денутся
      </Typography>
    </>
  );
}

