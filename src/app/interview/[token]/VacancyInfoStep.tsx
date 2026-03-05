"use client";
import { useEffect, useState } from "react";
import { Box, Button, Typography, Paper, Chip, Stack, Divider, Collapse, IconButton } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { Icon } from "@iconify/react";
import { Trans, msg } from "@lingui/macro";
import { useLingui } from "@lingui/react";

function getVideoEmbedUrl(url: string): string | null {
  if (!url) return null;

  const youtubeMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  const rutubeMatch = url.match(/rutube\.ru\/video\/([a-zA-Z0-9]+)/);
  if (rutubeMatch) return `https://rutube.ru/play/embed/${rutubeMatch[1]}`;

  const vkMatch = url.match(/vk\.com\/video(-?\d+_\d+)/);
  if (vkMatch) return `https://vk.com/video_ext.php?oid=${vkMatch[1].split('_')[0]}&id=${vkMatch[1].split('_')[1]}&hd=2`;

  return null;
}

interface VacancyInfoStepProps {
  vacancy: {
    title?: string;
    company?: string;
    description?: string;
    companyVideoUrl?: string;
    descriptionExpandedByDefault?: boolean;
  } | null;
  candidate: {
    firstName?: string;
    lastName?: string;
  } | null;
  total?: number;
  durationSec?: number;
  questionTypes?: { audio: number; text: number; choice: number };
  onContinue: () => void;
}

export default function VacancyInfoStep({
  vacancy,
  candidate,
  total,
  durationSec,
  questionTypes,
  onContinue,
}: VacancyInfoStepProps) {
  const { _ } = useLingui();
  const [descriptionExpanded, setDescriptionExpanded] = useState(true);

  useEffect(() => {
    if (vacancy?.descriptionExpandedByDefault !== undefined) {
      setDescriptionExpanded(vacancy.descriptionExpandedByDefault);
    }
  }, [vacancy?.descriptionExpandedByDefault]);

  const videoEmbedUrl = vacancy?.companyVideoUrl ? getVideoEmbedUrl(vacancy.companyVideoUrl) : null;

  // Вычисляем примерное время (2/3 от максимального)
  const estimatedMinutes = durationSec ? Math.ceil((durationSec * (2 / 3)) / 60) : null;

  // Формируем описание типов вопросов
  const typeItems: { icon: string; label: string }[] = [];
  const hasAudio = (questionTypes?.audio ?? 0) > 0;

  if (questionTypes) {
    if (questionTypes.audio > 0) {
      typeItems.push({
        icon: 'mdi:video-outline',
        label: `${questionTypes.audio} ${nQuestions(questionTypes.audio)} с видеоответом`,
      });
    }
    if (questionTypes.text > 0) {
      typeItems.push({
        icon: 'mdi:pencil-outline',
        label: `${questionTypes.text} текстовых ${nQuestions(questionTypes.text)}`,
      });
    }
    if (questionTypes.choice > 0) {
      typeItems.push({
        icon: 'mdi:checkbox-marked-outline',
        label: `${questionTypes.choice} ${nQuestions(questionTypes.choice)} с выбором ответа`,
      });
    }
  } else if (total) {
    typeItems.push({ icon: 'mdi:help-circle-outline', label: `${total} ${nQuestions(total)}` });
  }

  if (estimatedMinutes) {
    typeItems.push({ icon: 'mdi:clock-outline', label: `~${estimatedMinutes} минут` });
  }

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
          {candidate?.firstName ? (
            <>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#1a1a1a", mb: 1 }}>
                Здравствуйте, {candidate.firstName}!
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#333", mb: 0.5 }}>
                {vacancy?.title || <Trans>Вакансия</Trans>}
              </Typography>
              {vacancy?.company && (
                <Typography variant="body2" sx={{ color: "#888", mb: 2 }}>
                  {vacancy.company}
                </Typography>
              )}
              <Typography variant="body1" sx={{ color: "#555", lineHeight: 1.7, maxWidth: 540, mx: "auto" }}>
                Ваше резюме нас заинтересовало — осталось совсем немного. Ответьте на несколько вопросов, чтобы мы смогли быстро принять решение по вашей кандидатуре.{" "}
                <Box component="span" sx={{ color: "#1976d2", fontWeight: 600 }}>
                  {estimatedMinutes ? `Займёт ~${estimatedMinutes} минут.` : "Займёт всего несколько минут."}
                </Box>
              </Typography>
            </>
          ) : (
            <>
              <Chip
                icon={<Icon icon="mdi:briefcase-outline" width={18} height={18} />}
                label={_(msg`Информация о вакансии`)}
                sx={{ mb: 2, bgcolor: "#e3f2fd", color: "#1976d2", fontWeight: 600 }}
              />
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#1a1a1a", mb: 1 }}>
                {vacancy?.title || <Trans>Вакансия</Trans>}
              </Typography>
              {vacancy?.company && (
                <Typography variant="subtitle1" sx={{ color: "#666", fontWeight: 500 }}>
                  {vacancy.company}
                </Typography>
              )}
            </>
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Company Video */}
        {videoEmbedUrl && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1a1a1a", mb: 1.5 }}>
              <Trans>Видео о компании</Trans>
            </Typography>
            <Box sx={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: 2, bgcolor: "#000", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
              <iframe
                src={videoEmbedUrl}
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={_(msg`Видео о компании`)}
              />
            </Box>
          </Box>
        )}

        {/* Что вас ждёт */}
        {typeItems.length > 0 && (
          <Box
            sx={{
              p: 2.5,
              bgcolor: "#f8f9ff",
              borderRadius: 2,
              mb: 3,
              border: "1px solid #e8eaf6",
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#3949ab", mb: 1.5 }}>
              <Trans>Как всё устроено:</Trans>
            </Typography>
            <Stack spacing={1}>
              {typeItems.map((item, idx) => (
                <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Icon icon={item.icon} width={20} height={20} style={{ color: "#5c6bc0", flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ color: "#333" }}>
                    {item.label}
                  </Typography>
                </Box>
              ))}
              {hasAudio && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Icon icon="mdi:refresh" width={20} height={20} style={{ color: "#5c6bc0", flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ color: "#333" }}>
                    <Trans>Можно переснять ответ, если не понравился</Trans>
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>
        )}

        {/* Continue Button */}
        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={onContinue}
          sx={{
            py: 1.5,
            bgcolor: "#2196f3",
            color: "#fff",
            fontWeight: 700,
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
          <Trans>Я готов, начинаем →</Trans>
        </Button>

        {/* Vacancy Description — под кнопкой, для тех кто хочет перечитать */}
        {vacancy?.description && (
          <Box sx={{ mt: 3 }}>
            <Box
              sx={{
                p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider',
                bgcolor: 'background.paper', cursor: 'pointer', transition: 'all 0.2s',
                '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main', boxShadow: 1 },
              }}
              onClick={() => setDescriptionExpanded(!descriptionExpanded)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: descriptionExpanded ? 2 : 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    <Trans>Описание вакансии</Trans>
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    ({descriptionExpanded ? _(msg`свернуть`) : _(msg`развернуть`)})
                  </Typography>
                </Box>
                <IconButton size="small" sx={{ pointerEvents: 'none' }}>
                  {descriptionExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                </IconButton>
              </Box>
              {!descriptionExpanded && (
                <Typography
                  variant="body2" color="text.disabled"
                  sx={{ mt: 0.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.8rem' }}
                  dangerouslySetInnerHTML={{ __html: vacancy.description.replace(/<[^>]*>/g, ' ').substring(0, 150) + '...' }}
                />
              )}
              <Collapse in={descriptionExpanded}>
                <Box
                  sx={{
                    color: '#666', lineHeight: 1.7, fontSize: '0.875rem',
                    '& p': { margin: '0 0 1em 0' },
                    '& ul, & ol': { margin: '0 0 1em 0', paddingLeft: '1.5em' },
                    '& li': { marginBottom: '0.5em' },
                    '& strong': { fontWeight: 600 },
                    '& a': { color: '#1976d2', textDecoration: 'none' },
                    '& a:hover': { textDecoration: 'underline' },
                  }}
                  dangerouslySetInnerHTML={{ __html: vacancy.description }}
                />
              </Collapse>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

function nQuestions(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return 'вопрос';
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return 'вопроса';
  return 'вопросов';
}
