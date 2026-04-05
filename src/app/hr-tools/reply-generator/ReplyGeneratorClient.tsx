"use client";
import * as React from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Collapse,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { Icon } from "@iconify/react";
import Link from "next/link";
import ToolLayout from "../components/ToolLayout";
import ResultDisplay from "../components/ResultDisplay";
import HrToolConsent from "../components/HrToolConsent";
import { useReplyGenerator } from "../hooks/useHrTool";

export default function ReplyGeneratorClient() {
  const [type, setType] = React.useState<"accept" | "reject">("accept");
  const [context, setContext] = React.useState("");

  const { data, loading, error, execute } = useReplyGenerator();

  const handleSubmit = async () => {
    await execute({
      type,
      context: context.trim() || undefined,
    });
  };

  const handleRegenerate = async () => {
    await execute({
      type,
      context: context.trim() || undefined,
    });
  };

  const formatReplyAsText = (): string => {
    if (!data) return "";
    return `Тема: ${data.subject}\n\n${data.body}`;
  };

  return (
    <ToolLayout
      title="Генератор ответа кандидату"
      description="Создайте профессиональный ответ кандидату — приглашение или вежливый отказ. За 10 секунд."
      icon="mdi:email-edit"
      iconColor="#9C27B0"
      ctaLabel="Хотите автоматизировать найм целиком?"
      ctaTitle="SofiHR — платформа для найма от заявки до оффера"
      ctaDescription="Вся коммуникация с кандидатами, этапы найма, AI-интервью и аналитика — в одном месте. Первые 10 интервью бесплатно."
      ctaButtonText="Начать бесплатно →"
      ctaFeatures={[
        { icon: "mdi:email-multiple", text: "История переписки с кандидатами" },
        { icon: "mdi:robot", text: "AI-интервью" },
        { icon: "mdi:chart-timeline-variant", text: "Этапы и воронка найма" },
        { icon: "mdi:headhunter", text: "Интеграция с HeadHunter" },
        { icon: "mdi:chart-bar", text: "Аналитика по вакансии" },
      ]}
    >
      {/* Input form */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          border: "1px solid #b8cfe8",
          bgcolor: "#fff",
          mb: 4,
        }}
      >
        {/* Type toggle */}
        <Box sx={{ mb: 4 }}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "0.9rem",
              color: "#1a1a2e",
              mb: 2,
            }}
          >
            Тип ответа
          </Typography>
          <ToggleButtonGroup
            value={type}
            exclusive
            onChange={(_, newType) => newType && setType(newType)}
            sx={{
              width: { xs: "100%", sm: "auto" },
              "& .MuiToggleButton-root": {
                textTransform: "none",
                px: { xs: 2, sm: 4 },
                py: { xs: 1, sm: 1.5 },
                fontSize: { xs: "0.875rem", sm: "1rem" },
                fontWeight: 600,
                flex: { xs: 1, sm: "initial" },
                "&.Mui-selected": {
                  color: "#fff",
                },
              },
            }}
          >
            <ToggleButton
              value="accept"
              sx={{
                "&.Mui-selected": {
                  bgcolor: "#4CAF50 !important",
                  "&:hover": { bgcolor: "#388E3C !important" },
                },
              }}
            >
              <Icon icon="mdi:check-circle" width={18} height={18} style={{ marginRight: 6 }} />
              Приглашение
            </ToggleButton>
            <ToggleButton
              value="reject"
              sx={{
                "&.Mui-selected": {
                  bgcolor: "#f44336 !important",
                  "&:hover": { bgcolor: "#d32f2f !important" },
                },
              }}
            >
              <Icon icon="mdi:close-circle" width={18} height={18} style={{ marginRight: 6 }} />
              Отказ
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Context */}
        <Box sx={{ mb: 4 }}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "0.9rem",
              color: "#1a1a2e",
              mb: 1,
            }}
          >
            Контекст (опционально)
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder={
              type === "accept"
                ? "Детали интервью: должность, дата/время, формат (онлайн/офис), что взять с собой..."
                : "Причина отказа: выбрали другого кандидата, недостаточно опыта, заморозили вакансию..."
            }
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
          <Typography
            sx={{
              mt: 0.5,
              fontSize: "0.8rem",
              color: context.length > 500 ? "#f44336" : "#999",
            }}
          >
            {context.length} / 500 символов
          </Typography>
        </Box>

        {/* Tips */}
        <Box
          sx={{
            mb: 4,
            p: 2,
            bgcolor: type === "accept" ? "#e8f5e9" : "#ffebee",
            borderRadius: 2,
          }}
        >
          <Typography
            sx={{
              fontSize: "0.85rem",
              color: type === "accept" ? "#2e7d32" : "#c62828",
              display: "flex",
              alignItems: "flex-start",
              gap: 1,
            }}
          >
            <Icon
              icon="mdi:lightbulb"
              width={18}
              height={18}
              style={{ marginTop: 2, flexShrink: 0 }}
            />
            {type === "accept"
              ? "Совет: укажите конкретные детали (дату, время, формат) для более персонализированного письма."
              : "Совет: если укажете причину отказа, письмо будет более персонализированным и уважительным."}
          </Typography>
        </Box>

        {/* Submit button */}
        <HrToolConsent />
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={loading || context.length > 500}
          startIcon={
            loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <Icon icon="mdi:auto-fix" />
            )
          }
          sx={{
            bgcolor: "#9C27B0",
            color: "#fff",
            textTransform: "none",
            fontWeight: 600,
            px: 4,
            py: 1.5,
            fontSize: "1rem",
            borderRadius: 2,
            "&:hover": { bgcolor: "#7B1FA2" },
            "&:disabled": { bgcolor: "#ccc" },
          }}
        >
          {loading ? "Генерация..." : "Сгенерировать письмо"}
        </Button>
      </Paper>

      {/* Error */}
      <Collapse in={!!error}>
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          {error}
        </Alert>
      </Collapse>

      {/* Inline nudge */}
      {!!data && (
        <Box
          sx={{
            mb: 2,
            p: { xs: 2.5, md: 3 },
            borderRadius: 3,
            border: "1px solid #e1bee7",
            bgcolor: "#fdf3ff",
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, flex: 1, minWidth: 0 }}>
            <Box sx={{ mt: 0.25, width: 36, height: 36, borderRadius: 2, bgcolor: "#9C27B0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon icon="mdi:email-check" width={20} height={20} color="#fff" />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#1a1a2e", lineHeight: 1.3 }}>
                Письмо готово — следующий шаг
              </Typography>
              <Typography sx={{ fontSize: "0.83rem", color: "#555", mt: 0.4, lineHeight: 1.5 }}>
                В SofiHR вся коммуникация с кандидатами в одном месте: этапы, история, AI-интервью
              </Typography>
            </Box>
          </Box>
          <Button component={Link} href="/auth/register" variant="contained" size="small"
            sx={{ bgcolor: "#9C27B0", color: "#fff", textTransform: "none", fontWeight: 600, px: 2.5, py: 1, borderRadius: 2, flexShrink: { xs: 1, sm: 0 }, alignSelf: { xs: "stretch", sm: "auto" }, "&:hover": { bgcolor: "#7B1FA2" } }}>
            Организовать найм в SofiHR →
          </Button>
        </Box>
      )}

      {/* Result */}
      {data && (
        <ResultDisplay
          title={type === "accept" ? "Приглашение готово" : "Письмо с отказом готово"}
          copyText={formatReplyAsText()}
          downloadText={formatReplyAsText()}
          downloadFilename={type === "accept" ? "invitation.txt" : "rejection.txt"}
          onRegenerate={handleRegenerate}
          regenerating={loading}
        >
          <Box>
            {/* Subject */}
            <Box sx={{ mb: 3 }}>
              <Typography
                sx={{
                  fontSize: "0.8rem",
                  color: "#999",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  mb: 0.5,
                }}
              >
                Тема письма
              </Typography>
              <Typography
                sx={{
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: "#1a1a2e",
                  p: 2,
                  bgcolor: "#f5f5f5",
                  borderRadius: 2,
                }}
              >
                {data.subject}
              </Typography>
            </Box>

            {/* Body */}
            <Box>
              <Typography
                sx={{
                  fontSize: "0.8rem",
                  color: "#999",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  mb: 0.5,
                }}
              >
                Текст письма
              </Typography>
              <Box
                sx={{
                  p: 3,
                  bgcolor: "#fafafa",
                  borderRadius: 2,
                  border: "1px solid #e0e0e0",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "1rem",
                    color: "#333",
                    lineHeight: 1.8,
                    whiteSpace: "pre-line",
                  }}
                >
                  {data.body}
                </Typography>
              </Box>
            </Box>

            {/* Placeholders note */}
            <Box
              sx={{
                mt: 3,
                p: 2,
                bgcolor: "#fff3e0",
                borderRadius: 2,
                display: "flex",
                alignItems: "flex-start",
                gap: 1,
              }}
            >
              <Icon
                icon="mdi:information"
                width={18}
                height={18}
                color="#FF9800"
                style={{ marginTop: 2, flexShrink: 0 }}
              />
              <Typography sx={{ fontSize: "0.85rem", color: "#e65100" }}>
                Замените плейсхолдеры [Компания], [Ваше имя], [Контакт] и [Имя кандидата] на
                реальные данные перед отправкой.
              </Typography>
            </Box>
          </Box>
        </ResultDisplay>
      )}
    </ToolLayout>
  );
}

