"use client";
import * as React from "react";
import { Box, Container, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import Link from "next/link";

export default function HrToolsBanner() {
  return (
    <Box
      sx={{
        bgcolor: "linear-gradient(90deg, #f0f9ff 0%, #f9fbe7 100%)",
        py: 1.5,
        borderTop: "1px solid #e0e0e0",
        borderBottom: "1px solid #e0e0e0",
        background: "linear-gradient(90deg, #f0f9ff 0%, #f9fbe7 100%)",
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: { xs: 1.5, md: 2.5 },
            flexWrap: "wrap",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 24,
                height: 24,
                borderRadius: "50%",
                bgcolor: "rgba(76, 175, 80, 0.15)",
              }}
            >
              <Icon icon="mdi:gift-outline" width={16} height={16} color="#4CAF50" />
            </Box>
            <Typography
              sx={{
                fontSize: { xs: "0.85rem", md: "0.95rem" },
                color: "#555",
                fontWeight: 500,
              }}
            >
              <Box component="span" sx={{ fontWeight: 700, color: "#1a1a1a" }}>
                Бонус:
              </Box>{" "}
              Бесплатные AI-инструменты для HR
            </Typography>
          </Box>

          <Box
            component={Link}
            href="/hr-tools"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              px: 2,
              py: 0.75,
              bgcolor: "#4CAF50",
              color: "#fff",
              borderRadius: 1.5,
              textDecoration: "none",
              fontSize: "0.85rem",
              fontWeight: 600,
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: "#43A047",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
              },
            }}
          >
            <span>Попробовать</span>
            <Icon icon="mdi:arrow-right" width={16} height={16} />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

