"use client";
import React from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
} from "@mui/material";
import {
  IconAlertTriangle,
  IconSettings,
  IconX,
  IconEye,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useLingui } from '@lingui/react';
import { msg, Trans } from '@lingui/macro';

interface SetupReminderBannerProps {
  vacanciesWithoutQuestions: Array<{
    id: number;
    title: string;
  }>;
  onClose?: () => void;
}

export default function SetupReminderBanner({ 
  vacanciesWithoutQuestions,
  onClose 
}: SetupReminderBannerProps) {
  const { _ } = useLingui();
  const router = useRouter();

  if (vacanciesWithoutQuestions.length === 0) {
    return null;
  }

  const count = vacanciesWithoutQuestions.length;
  const firstVacancy = vacanciesWithoutQuestions[0];

  const handleSetupClick = () => {
    router.push(`/hr/vacancy-edit/${firstVacancy.id}`);
  };

  const handleViewAll = () => {
    router.push('/hr/vacancies');
  };

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'rgba(255, 152, 0, 0.3)',
        background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.08) 0%, rgba(255, 167, 38, 0.08) 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Icon */}
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.15) 0%, rgba(255, 167, 38, 0.15) 100%)',
              flexShrink: 0,
            }}
          >
            <IconAlertTriangle size={18} color="#ed6c02" />
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="subtitle2" 
              fontWeight={600} 
              sx={{ color: 'text.primary', mb: 0.5 }}
            >
              {count === 1 ? (
                <Trans>Требуется настройка интервью</Trans>
              ) : (
                <Trans>Требуется настройка {count} вакансий</Trans>
              )}
            </Typography>
            
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.secondary', 
                display: 'block',
                lineHeight: 1.4,
              }}
            >
              {count === 1 ? (
                <Trans>
                  У вакансии "{firstVacancy.title}" не настроены вопросы для интервью
                </Trans>
              ) : (
                <Trans>
                  У вас {count} {count === 2 ? 'вакансии' : 'вакансий'} без вопросов для интервью
                </Trans>
              )}
            </Typography>
          </Box>

          {/* Buttons */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}>
            <Button
              size="small"
              variant="contained"
              color="warning"
              onClick={handleSetupClick}
              sx={{ 
                fontWeight: 600,
                textTransform: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {count === 1 ? (
                <Trans>Настроить</Trans>
              ) : (
                <Trans>Настроить</Trans>
              )}
            </Button>

            {count > 1 && (
              <Button
                size="small"
                variant="text"
                color="warning"
                onClick={handleViewAll}
                sx={{ 
                  fontWeight: 600,
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                <Trans>Все ({count})</Trans>
              </Button>
            )}

            {/* Close button */}
            {onClose && (
              <IconButton
                size="small"
                onClick={onClose}
                sx={{
                  color: 'text.secondary',
                  ml: 0.5,
                }}
              >
                <IconX size={16} />
              </IconButton>
            )}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}

