"use client";
import { useEffect } from "react";
import { Box, Button, Typography, Paper, Chip, Stack, Divider } from "@mui/material";
import { Icon } from "@iconify/react";
import { Trans, msg } from "@lingui/macro";
import { useLingui } from "@lingui/react";

// Функция для получения embed URL из различных видеохостингов
function getVideoEmbedUrl(url: string): string | null {
  if (!url) return null;

  // YouTube
  const youtubeMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  // Rutube
  const rutubeMatch = url.match(/rutube\.ru\/video\/([a-zA-Z0-9]+)/);
  if (rutubeMatch) {
    return `https://rutube.ru/play/embed/${rutubeMatch[1]}`;
  }

  // VK Video
  const vkMatch = url.match(/vk\.com\/video(-?\d+_\d+)/);
  if (vkMatch) {
    return `https://vk.com/video_ext.php?oid=${vkMatch[1].split('_')[0]}&id=${vkMatch[1].split('_')[1]}&hd=2`;
  }

  return null;
}

interface VacancyInfoStepProps {
  vacancy: {
    title?: string;
    company?: string;
    description?: string;
    companyVideoUrl?: string;
  } | null;
  candidate: {
    firstName?: string;
    lastName?: string;
  } | null;
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

  // Получаем embed URL для видео
  const videoEmbedUrl = vacancy?.companyVideoUrl ? getVideoEmbedUrl(vacancy.companyVideoUrl) : null;

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
            {vacancy?.title || <Trans>Вакансия</Trans>}
          </Typography>
          {vacancy?.company && (
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

        {/* Vacancy Description */}
        {vacancy?.description && (
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: "#1a1a1a",
                mb: 1.5,
              }}
            >
              <Trans>Описание вакансии</Trans>
            </Typography>
            <Box
              sx={{
                color: "#555",
                lineHeight: 1.7,
                fontSize: "0.875rem",
                '& p': { margin: '0 0 1em 0' },
                '& ul, & ol': { margin: '0 0 1em 0', paddingLeft: '1.5em' },
                '& li': { marginBottom: '0.5em' },
                '& strong': { fontWeight: 600 },
                '& a': { color: '#1976d2', textDecoration: 'none' },
                '& a:hover': { textDecoration: 'underline' },
              }}
              dangerouslySetInnerHTML={{ __html: vacancy.description }}
            />
          </Box>
        )}

        {/* Company Video */}
        {videoEmbedUrl && (
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: "#1a1a1a",
                mb: 1.5,
              }}
            >
              <Trans>Видео о компании</Trans>
            </Typography>
            <Box
              sx={{
                position: "relative",
                paddingBottom: "56.25%", // 16:9 aspect ratio
                height: 0,
                overflow: "hidden",
                borderRadius: 2,
                bgcolor: "#000",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              <iframe
                src={videoEmbedUrl}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={_(msg`Видео о компании`)}
              />
            </Box>
          </Box>
        )}

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

