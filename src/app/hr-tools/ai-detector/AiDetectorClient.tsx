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
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import { Icon } from "@iconify/react";
import ToolLayout from "../components/ToolLayout";
import ResultDisplay from "../components/ResultDisplay";
import { useAiDetector, AiDetectorResponse } from "../hooks/useHrTool";

export default function AiDetectorClient() {
  const [resumeText, setResumeText] = React.useState("");
  const { data: rawData, loading, error, execute } = useAiDetector();

  // Нормализуем данные: если suspiciousFragments - массив строк, преобразуем в объекты
  const data = React.useMemo(() => {
    if (!rawData) return null;

    const normalized = { ...rawData };
    
    if (normalized.suspiciousFragments && normalized.suspiciousFragments.length > 0) {
      const firstFragment = normalized.suspiciousFragments[0];
      if (typeof firstFragment === 'string') {
        // AI вернул массив строк - преобразуем в объекты
        normalized.suspiciousFragments = (normalized.suspiciousFragments as string[]).map((text: string) => ({
          text: text,
          reason: 'Требует дополнительной проверки'
        }));
      }
    }

    return normalized as AiDetectorResponse & { 
      suspiciousFragments: Array<{ text: string; reason: string }> 
    };
  }, [rawData]);

  const handleSubmit = async () => {
    if (!resumeText.trim() || resumeText.length < 100) {
      return;
    }
    const result = await execute({ resumeText });
    if (result) {
      console.log('AI Detector Response:', result);
      console.log('Suspicious Fragments:', result.suspiciousFragments);
      
      // Fallback: если AI вернул массив строк вместо объектов - преобразуем
      if (result.suspiciousFragments && result.suspiciousFragments.length > 0) {
        const firstFragment = result.suspiciousFragments[0];
        if (typeof firstFragment === 'string') {
          console.warn('AI returned strings instead of objects, converting...');
          result.suspiciousFragments = result.suspiciousFragments.map((text: string) => ({
            text: text,
            reason: 'Подозрительный фрагмент (AI не указал причину)'
          }));
        }
      }
    }
  };

  const handleRegenerate = async () => {
    if (!resumeText.trim()) return;
    await execute({ resumeText });
  };

  const formatResultAsText = (): string => {
    if (!data) return "";

    let text = `ДЕТЕКТОР AI В РЕЗЮМЕ\n\n`;
    text += `ВЕРОЯТНОСТЬ AI: ${data.probability}%\n`;
    text += `ВЕРДИКТ: ${data.verdict}\n`;
    text += `УВЕРЕННОСТЬ: ${data.confidence}\n\n`;

    text += `ИТОГ:\n${data.summary}\n\n`;

    if (data.suspiciousFragments?.length) {
      text += `ПОДОЗРИТЕЛЬНЫЕ ФРАГМЕНТЫ:\n`;
      data.suspiciousFragments.forEach((f, i) => {
        text += `${i + 1}. "${f.text}"\n   ${f.reason}\n`;
      });
      text += "\n";
    }

    if (data.aiSignals?.length) {
      text += `ПРИЗНАКИ AI:\n`;
      data.aiSignals.forEach((s) => (text += `• ${s}\n`));
      text += "\n";
    }

    if (data.humanSignals?.length) {
      text += `ПРИЗНАКИ ЧЕЛОВЕКА:\n`;
      data.humanSignals.forEach((s) => (text += `• ${s}\n`));
      text += "\n";
    }

    text += `РЕКОМЕНДАЦИЯ:\n${data.recommendation}\n\n`;

    if (data.disclaimer) {
      text += `⚠️ ${data.disclaimer}`;
    }

    return text;
  };

  const getProbabilityColor = (probability: number): string => {
    if (probability >= 80) return "#f44336";
    if (probability >= 60) return "#FF9800";
    if (probability >= 40) return "#FFC107";
    return "#4CAF50";
  };

  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case "высокая":
        return <Icon icon="mdi:shield-check" width={20} height={20} color="#4CAF50" />;
      case "средняя":
        return <Icon icon="mdi:shield-half-full" width={20} height={20} color="#FF9800" />;
      default:
        return <Icon icon="mdi:shield-alert" width={20} height={20} color="#999" />;
    }
  };

  return (
    <ToolLayout
      title="Детектор AI в резюме"
      description="Проверьте, было ли резюме создано с помощью ChatGPT или других AI-ассистентов"
      icon="mdi:robot-confused"
      iconColor="#9C27B0"
    >
      {/* Input form */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          border: "1px solid #e0e0e0",
          bgcolor: "#fff",
          mb: 4,
        }}
      >
        {/* Resume text */}
        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "0.9rem",
              color: "#1a1a2e",
              mb: 1,
            }}
          >
            Текст резюме для проверки *
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={12}
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Вставьте текст резюме кандидата (минимум 100 символов)..."
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
              color: resumeText.length > 10000 ? "#f44336" : resumeText.length < 100 ? "#FF9800" : "#999",
            }}
          >
            {resumeText.length} / 10000 символов {resumeText.length < 100 && `(минимум 100)`}
          </Typography>
        </Box>

        {/* Submit button */}
        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={handleSubmit}
          disabled={loading || !resumeText.trim() || resumeText.length < 100 || resumeText.length > 10000}
          sx={{
            py: 1.5,
            borderRadius: 2,
            fontWeight: 600,
            textTransform: "none",
            fontSize: "1rem",
            bgcolor: "#9C27B0",
            "&:hover": {
              bgcolor: "#7B1FA2",
            },
          }}
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1, color: "#fff" }} />
              Анализирую резюме...
            </>
          ) : (
            <>
              <Icon icon="mdi:magnify" width={20} height={20} style={{ marginRight: 8 }} />
              Проверить на AI
            </>
          )}
        </Button>

        {/* Warning */}
        <Alert severity="info" sx={{ mt: 2, mb: 1 }}>
          <Typography sx={{ fontSize: "0.85rem", mb: 1 }}>
            ⚠️ Это вероятностная оценка, не абсолютная истина. Используйте результат как дополнительный индикатор.
          </Typography>
          <Typography sx={{ fontSize: "0.85rem" }}>
            💡 <strong>Важно:</strong> Резюме может быть написано реальным человеком, но потом улучшено через ChatGPT. 
            В таком случае детектор покажет высокую вероятность AI.
          </Typography>
        </Alert>
      </Paper>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Results */}
      {data && (
        <ResultDisplay
          result={formatResultAsText()}
          onRegenerate={handleRegenerate}
          loading={loading}
        >
          {/* Probability Badge */}
          <Box
            sx={{
              textAlign: "center",
              py: 4,
              borderRadius: 3,
              bgcolor: "#f8f9fa",
              mb: 3,
            }}
          >
            <Box sx={{ position: "relative", display: "inline-flex" }}>
              <CircularProgress
                variant="determinate"
                value={data.probability}
                size={140}
                thickness={5}
                sx={{
                  color: getProbabilityColor(data.probability),
                }}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: "absolute",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "2rem",
                    fontWeight: 800,
                    color: getProbabilityColor(data.probability),
                  }}
                >
                  {data.probability}%
                </Typography>
              </Box>
            </Box>
            <Typography sx={{ fontSize: "1.2rem", fontWeight: 700, mt: 2, color: "#1a1a2e" }}>
              {data.verdict}
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 1 }}>
              <Chip
                icon={getConfidenceIcon(data.confidence)}
                label={`Уверенность: ${data.confidence}`}
                size="small"
                sx={{ fontWeight: 600 }}
              />
            </Box>
          </Box>

          {/* Summary */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: "1px solid #e0e0e0",
              mb: 3,
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", mb: 1, color: "#1a1a2e" }}>
              Итог
            </Typography>
            <Typography sx={{ color: "#666", lineHeight: 1.7 }}>
              {data.summary}
            </Typography>
          </Paper>

          {/* Suspicious Fragments */}
          {data.suspiciousFragments && data.suspiciousFragments.length > 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: "1px solid #e0e0e0",
                mb: 3,
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", mb: 2, color: "#1a1a2e" }}>
                <Icon icon="mdi:alert" width={20} height={20} style={{ marginRight: 8, verticalAlign: "middle" }} />
                Подозрительные фрагменты
              </Typography>
              <List disablePadding>
                {data.suspiciousFragments.map((fragment, index) => (
                  <Box key={index}>
                    {index > 0 && <Divider sx={{ my: 2 }} />}
                    <Box>
                      <Typography
                        sx={{
                          fontSize: "0.9rem",
                          fontStyle: "italic",
                          color: "#666",
                          bgcolor: "#fff3e0",
                          p: 1.5,
                          borderRadius: 1,
                          mb: 1,
                        }}
                      >
                        "{fragment.text}"
                      </Typography>
                      <Typography sx={{ fontSize: "0.85rem", color: "#999", pl: 1 }}>
                        💡 {fragment.reason}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </List>
            </Paper>
          )}

          {/* AI Signals */}
          {data.aiSignals && data.aiSignals.length > 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: "1px solid #e0e0e0",
                mb: 3,
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", mb: 2, color: "#1a1a2e" }}>
                <Icon icon="mdi:robot" width={20} height={20} style={{ marginRight: 8, verticalAlign: "middle", color: "#f44336" }} />
                Признаки AI-генерации
              </Typography>
              <List disablePadding>
                {data.aiSignals.map((signal, index) => (
                  <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Icon icon="mdi:close-circle" width={20} height={20} color="#f44336" />
                    </ListItemIcon>
                    <ListItemText
                      primary={signal}
                      primaryTypographyProps={{
                        sx: { fontSize: "0.9rem", color: "#666" },
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          {/* Human Signals */}
          {data.humanSignals && data.humanSignals.length > 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: "1px solid #e0e0e0",
                mb: 3,
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", mb: 2, color: "#1a1a2e" }}>
                <Icon icon="mdi:account-check" width={20} height={20} style={{ marginRight: 8, verticalAlign: "middle", color: "#4CAF50" }} />
                Признаки человеческого текста
              </Typography>
              <List disablePadding>
                {data.humanSignals.map((signal, index) => (
                  <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Icon icon="mdi:check-circle" width={20} height={20} color="#4CAF50" />
                    </ListItemIcon>
                    <ListItemText
                      primary={signal}
                      primaryTypographyProps={{
                        sx: { fontSize: "0.9rem", color: "#666" },
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          {/* Recommendation */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: "2px solid #2196F3",
              bgcolor: "#e3f2fd",
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", mb: 1, color: "#1a1a2e" }}>
              <Icon icon="mdi:lightbulb" width={20} height={20} style={{ marginRight: 8, verticalAlign: "middle", color: "#2196F3" }} />
              Рекомендация
            </Typography>
            <Typography sx={{ color: "#666", lineHeight: 1.7 }}>
              {data.recommendation}
            </Typography>
          </Paper>
        </ResultDisplay>
      )}
    </ToolLayout>
  );
}

