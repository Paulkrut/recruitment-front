"use client";
import { Button } from "@mui/material";
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
    <ClientButton
      href="/"
      startIcon={<Icon icon="mdi:arrow-left" />}
      sx={{
        color: "#666",
        textTransform: "none",
        fontWeight: 500,
      }}
    >
      На главную
    </ClientButton>
  );
}

export function RegisterButton() {
  return (
    <ClientButton
      href="/auth/register"
      variant="contained"
      sx={{
        bgcolor: "#E91E63",
        color: "#fff",
        textTransform: "none",
        fontWeight: 600,
        px: 3,
        "&:hover": {
          bgcolor: "#C2185B",
        },
      }}
    >
      Попробовать платформу
    </ClientButton>
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
        "&:hover": { bgcolor: "#C2185B" },
      }}
    >
      Начать бесплатно — 10 интервью в подарок
    </ClientButton>
  );
}

