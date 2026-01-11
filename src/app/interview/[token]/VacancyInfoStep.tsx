"use client";
import { useEffect } from "react";
import { Box, Button, Typography, Paper, Chip, Stack, Divider } from "@mui/material";
import { Icon } from "@iconify/react";
import { Trans, msg } from "@lingui/macro";
import { useLingui } from "@lingui/react";

interface VacancyInfoStepProps {
  vacancy: {
    title: string;
    description?: string;
    company?: string;
    location?: string;
    salary?: string;
    requirements?: string[];
    responsibilities?: string[];
  };
  candidate: {
    firstName: string;
    lastName: string;
    email?: string;
  };
  onContinue: () => void;
}

export default function VacancyInfoStep({
  vacancy,
  candidate,
  onContinue,
}: VacancyInfoStepProps) {
  const { _ } = useLingui();

  // Логируем что получили
  useEffect(() => {
    console.log('📋 VacancyInfoStep rendered with:', {
      vacancy,
      candidate,
      hasTitle: !!vacancy?.title,
      hasFirstName: !!candidate?.firstName
    });
  }, [vacancy, candidate]);

  // Убрали автоматический skip - всегда показываем экран

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#fafafa",
        p: { xs: 2, md: 4 },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: 800,
          width: "100%",
          p: { xs: 3, md: 5 },
          borderRadius: 3,
          border: "1px solid #e0e0e0",
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Chip
            icon={<Icon icon="mdi:briefcase-outline" width={18} height={18} />}
            label={_(msg`Информация о вакансии`)}
            sx={{
              mb: 2,
              bgcolor: "#e3f2fd",
              color: "#1976d2",
              fontWeight: 600,
            }}
          />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: "#1a1a1a",
              mb: 1,
            }}
          >
            {vacancy.title}
          </Typography>
          {vacancy.company && (
            <Typography
              variant="subtitle1"
              sx={{
                color: "#666",
                fontWeight: 500,
              }}
            >
              {vacancy.company}
            </Typography>
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Candidate Info */}
        {candidate?.firstName ? (
          <Box
            sx={{
              mb: 4,
              p: 2,
              bgcolor: "#f5f5f5",
              borderRadius: 2,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                color: "#666",
                mb: 0.5,
                fontSize: "0.85rem",
              }}
            >
              <Trans>Кандидат:</Trans>
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: "#1a1a1a",
              }}
            >
              {candidate.firstName} {candidate.lastName}
            </Typography>
            {candidate.email && (
              <Typography
                variant="body2"
                sx={{
                  color: "#666",
                  mt: 0.5,
                }}
              >
                {candidate.email}
              </Typography>
            )}
          </Box>
        ) : (
          <Box
            sx={{
              mb: 4,
              p: 2,
              bgcolor: "#fff3e0",
              borderRadius: 2,
              border: "1px solid #ffe0b2",
            }}
          >
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
              <Icon
                icon="mdi:information-outline"
                width={22}
                height={22}
                style={{ color: "#f57c00", flexShrink: 0, marginTop: 2 }}
              />
              <Typography variant="body2" sx={{ color: "#e65100", lineHeight: 1.6 }}>
                <Trans>
                  Информация о кандидате будет доступна во время прохождения интервью.
                </Trans>
              </Typography>
            </Box>
          </Box>
        )}

        {/* Vacancy Details */}
        <Stack spacing={3} sx={{ mb: 4 }}>
          {/* Location & Salary */}
          {(vacancy.location || vacancy.salary) && (
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              {vacancy.location && (
                <Chip
                  icon={<Icon icon="mdi:map-marker" width={16} height={16} />}
                  label={vacancy.location}
                  variant="outlined"
                  size="small"
                />
              )}
              {vacancy.salary && (
                <Chip
                  icon={<Icon icon="mdi:cash" width={16} height={16} />}
                  label={vacancy.salary}
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>
          )}

          {/* Description */}
          {vacancy.description && (
            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  color: "#1a1a1a",
                  mb: 1,
                }}
              >
                <Trans>Описание</Trans>
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#555",
                  lineHeight: 1.7,
                  whiteSpace: "pre-line",
                }}
              >
                {vacancy.description}
              </Typography>
            </Box>
          )}

          {/* Responsibilities */}
          {vacancy.responsibilities && vacancy.responsibilities.length > 0 && (
            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  color: "#1a1a1a",
                  mb: 1,
                }}
              >
                <Trans>Обязанности</Trans>
              </Typography>
              <Stack spacing={0.5}>
                {vacancy.responsibilities.map((item, index) => (
                  <Box
                    key={index}
                    sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}
                  >
                    <Icon
                      icon="mdi:check-circle"
                      width={18}
                      height={18}
                      style={{ color: "#4caf50", marginTop: 2, flexShrink: 0 }}
                    />
                    <Typography variant="body2" sx={{ color: "#555" }}>
                      {item}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {/* Requirements */}
          {vacancy.requirements && vacancy.requirements.length > 0 && (
            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  color: "#1a1a1a",
                  mb: 1,
                }}
              >
                <Trans>Требования</Trans>
              </Typography>
              <Stack spacing={0.5}>
                {vacancy.requirements.map((item, index) => (
                  <Box
                    key={index}
                    sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}
                  >
                    <Icon
                      icon="mdi:star"
                      width={18}
                      height={18}
                      style={{ color: "#ff9800", marginTop: 2, flexShrink: 0 }}
                    />
                    <Typography variant="body2" sx={{ color: "#555" }}>
                      {item}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
        </Stack>

        {/* Info Alert */}
        <Box
          sx={{
            p: 2,
            bgcolor: "#e8f5e9",
            borderRadius: 2,
            mb: 4,
            border: "1px solid #c8e6c9",
          }}
        >
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
            <Icon
              icon="mdi:information-outline"
              width={22}
              height={22}
              style={{ color: "#2e7d32", flexShrink: 0, marginTop: 2 }}
            />
            <Typography variant="body2" sx={{ color: "#2e7d32", lineHeight: 1.6 }}>
              <Trans>
                Сейчас вы перейдёте к проверке оборудования и началу интервью. Убедитесь,
                что у вас есть время для прохождения интервью.
              </Trans>
            </Typography>
          </Box>
        </Box>

        {/* Continue Button */}
        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={onContinue}
          endIcon={<Icon icon="mdi:arrow-right" width={20} height={20} />}
          sx={{
            py: 1.5,
            bgcolor: "#2196f3",
            color: "#fff",
            fontWeight: 600,
            fontSize: "1rem",
            textTransform: "none",
            borderRadius: 2,
            boxShadow: "0 4px 12px rgba(33, 150, 243, 0.3)",
            "&:hover": {
              bgcolor: "#1976d2",
              boxShadow: "0 6px 16px rgba(33, 150, 243, 0.4)",
            },
          }}
        >
          <Trans>Перейти к интервью</Trans>
        </Button>
      </Paper>
    </Box>
  );
}

