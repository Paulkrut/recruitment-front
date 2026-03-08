"use client";
import * as React from "react";
import { Box, Typography, Card, CardActionArea } from "@mui/material";
import { Icon } from "@iconify/react";
import Link from "next/link";

interface ToolCardProps {
  id: string;
  icon: string;
  iconColor: string;
  title: string;
  description: string;
  href: string;
  comingSoon?: boolean;
}

export default function ToolCard({
  id,
  icon,
  iconColor,
  title,
  description,
  href,
  comingSoon = false,
}: ToolCardProps) {
  return (
    <Card
      sx={{
        height: "100%",
        border: "1px solid #d0d0d0",
        borderRadius: 3,
        transition: "all 0.3s ease",
        opacity: comingSoon ? 0.6 : 1,
        "&:hover": comingSoon
          ? {}
          : {
              borderColor: iconColor,
              transform: "translateY(-4px)",
              boxShadow: `0 8px 24px ${iconColor}20`,
            },
      }}
    >
      <CardActionArea
        component={comingSoon ? "div" : Link}
        href={comingSoon ? undefined : href}
        sx={{
          height: "100%",
          p: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          cursor: comingSoon ? "default" : "pointer",
        }}
      >
        {/* Icon */}
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            bgcolor: `${iconColor}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2,
          }}
        >
          <Icon icon={icon} width={28} height={28} color={iconColor} />
        </Box>

        {/* Title */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: "1.1rem",
            mb: 1,
            color: "#1a1a2e",
          }}
        >
          {title}
          {comingSoon && (
            <Box
              component="span"
              sx={{
                ml: 1,
                px: 1,
                py: 0.25,
                bgcolor: "#f5f5f5",
                borderRadius: 1,
                fontSize: "0.65rem",
                fontWeight: 600,
                color: "#999",
                textTransform: "uppercase",
              }}
            >
              Скоро
            </Box>
          )}
        </Typography>

        {/* Description */}
        <Typography
          sx={{
            fontSize: "0.9rem",
            color: "#666",
            lineHeight: 1.5,
            flex: 1,
          }}
        >
          {description}
        </Typography>

        {/* Arrow */}
        {!comingSoon && (
          <Box
            sx={{
              mt: 2,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              color: iconColor,
              fontWeight: 600,
              fontSize: "0.85rem",
            }}
          >
            Открыть
            <Icon icon="mdi:arrow-right" width={18} height={18} />
          </Box>
        )}
      </CardActionArea>
    </Card>
  );
}

