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
  Switch,
  FormControlLabel,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Icon } from "@iconify/react";
import ToolLayout from "../components/ToolLayout";
import ResultDisplay from "../components/ResultDisplay";
import { useResumeAnalyzer, ResumeAnalysisResponse, ResumeMatchResponse } from "../hooks/useHrTool";

export default function ResumeAnalyzerClient() {
  const [resumeText, setResumeText] = React.useState("");
  const [compareWithJob, setCompareWithJob] = React.useState(false);
  const [jobDescription, setJobDescription] = React.useState("");

  const { data, loading, error, execute } = useResumeAnalyzer();

  const handleSubmit = async () => {
    if (!resumeText.trim()) return;
    await execute({
      resumeText,
      jobDescription: compareWithJob && jobDescription.trim() ? jobDescription : undefined,
    });
  };

  const handleRegenerate = async () => {
    if (!resumeText.trim()) return;
    await execute({
      resumeText,
      jobDescription: compareWithJob && jobDescription.trim() ? jobDescription : undefined,
    });
  };

  const isMatchResponse = (d: any): d is ResumeMatchResponse => {
    return d && "matchPercentage" in d;
  };

  const isAnalysisResponse = (d: any): d is ResumeAnalysisResponse => {
    return d && "summary" in d && !("matchPercentage" in d);
  };

  const formatAnalysisAsText = (): string => {
    if (!data) return "";

    if (isMatchResponse(data)) {
      let text = `СООТВЕТСТВИЕ ВАКАНСИИ: ${data.matchPercentage}%\n\n`;
      text += `РЕКОМЕНДАЦИЯ: ${data.recommendationText}\n\n`;
      text += "ТРЕБОВАНИЯ:\n";
      data.requirements?.forEach((r) => {
        const icon = r.status === "matched" ? "✅" : r.status === "partial" ? "⚠️" : "❌";
        text += `${icon} ${r.text}: ${r.evidence}\n`;
      });
      if (data.strengths?.length) {
        text += "\nСИЛЬНЫЕ СТОРОНЫ:\n";
        data.strengths.forEach((s) => (text += `• ${s}\n`));
      }
      if (data.gaps?.length) {
        text += "\nПРОБЕЛЫ:\n";
        data.gaps.forEach((g) => (text += `• ${g}\n`));
      }
      return text;
    }

    if (isAnalysisResponse(data)) {
      let text = `КРАТКОЕ РЕЗЮМЕ:\n${data.summary}\n\n`;
      text += `КЛЮЧЕВЫЕ НАВЫКИ:\n${data.skills?.join(", ")}\n\n`;
      text += `ОПЫТ:\n`;
      text += `• Стаж: ${data.experience?.totalYears} лет\n`;
      text += `• Компании: ${data.experience?.companies}\n`;
      text += `• Рост: ${data.experience?.growth}\n\n`;
      text += `СИЛЬНЫЕ СТОРОНЫ:\n`;
      data.strengths?.forEach((s) => (text += `• ${s}\n`));
      text += `\nРЕКОМЕНДАЦИИ ПО УЛУЧШЕНИЮ:\n`;
      data.improvements?.forEach((i) => (text += `• ${i}\n`));
      text += `\nОЦЕНКА РЕЗЮМЕ: ${data.score}/10`;
      return text;
    }

    return "";
  };

  const getMatchColor = (percentage: number): string => {
    if (percentage >= 80) return "#4CAF50";
    if (percentage >= 60) return "#FF9800";
    return "#f44336";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "matched":
        return <Icon icon="mdi:check-circle" width={20} height={20} color="#4CAF50" />;
      case "partial":
        return <Icon icon="mdi:alert-circle" width={20} height={20} color="#FF9800" />;
      default:
        return <Icon icon="mdi:close-circle" width={20} height={20} color="#f44336" />;
    }
  };

  return (
    <ToolLayout
      title="Анализатор резюме"
      description="Получите AI-анализ резюме кандидата за минуту. Можно сравнить с вакансией и узнать процент соответствия."
      icon="mdi:account-search"
      iconColor="#FF9800"
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
            Текст резюме *
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={10}
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Вставьте текст резюме кандидата..."
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
              color: resumeText.length > 10000 ? "#f44336" : "#999",
            }}
          >
            {resumeText.length} / 10000 символов
          </Typography>
        </Box>

        {/* Compare toggle */}
        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={compareWithJob}
                onChange={(e) => setCompareWithJob(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                  Сравнить с вакансией
                </Typography>
                <Typography sx={{ fontSize: "0.8rem", color: "#666" }}>
                  Получите процент соответствия и детальный анализ
                </Typography>
              </Box>
            }
          />
        </Box>

        {/* Job description (conditional) */}
        <Collapse in={compareWithJob}>
          <Box sx={{ mb: 3 }}>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "0.9rem",
                color: "#1a1a2e",
                mb: 1,
              }}
            >
              Описание вакансии
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={6}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Вставьте описание вакансии для сравнения..."
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
                color: jobDescription.length > 5000 ? "#f44336" : "#999",
              }}
            >
              {jobDescription.length} / 5000 символов
            </Typography>
          </Box>
        </Collapse>

        {/* Submit button */}
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={
            loading ||
            !resumeText.trim() ||
            resumeText.length > 10000 ||
            (compareWithJob && !jobDescription.trim())
          }
          startIcon={
            loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <Icon icon="mdi:magnify" />
            )
          }
          sx={{
            bgcolor: "#FF9800",
            color: "#fff",
            textTransform: "none",
            fontWeight: 600,
            px: 4,
            py: 1.5,
            fontSize: "1rem",
            borderRadius: 2,
            "&:hover": { bgcolor: "#F57C00" },
            "&:disabled": { bgcolor: "#ccc" },
          }}
        >
          {loading ? "Анализ..." : "Проанализировать"}
        </Button>
      </Paper>

      {/* Error */}
      <Collapse in={!!error}>
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          {error}
        </Alert>
      </Collapse>

      {/* Result - Match Response */}
      {data && isMatchResponse(data) && (
        <ResultDisplay
          title="Анализ соответствия"
          copyText={formatAnalysisAsText()}
          downloadText={formatAnalysisAsText()}
          downloadFilename="resume-match-analysis.txt"
          onRegenerate={handleRegenerate}
          regenerating={loading}
        >
          <Box>
            {/* Match percentage */}
            <Box sx={{ mb: 4, textAlign: "center" }}>
              <Typography
                sx={{
                  fontSize: "3rem",
                  fontWeight: 800,
                  color: getMatchColor(data.matchPercentage),
                }}
              >
                {data.matchPercentage}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={data.matchPercentage}
                sx={{
                  height: 12,
                  borderRadius: 2,
                  bgcolor: "#f0f0f0",
                  maxWidth: 400,
                  mx: "auto",
                  mb: 2,
                  "& .MuiLinearProgress-bar": {
                    bgcolor: getMatchColor(data.matchPercentage),
                    borderRadius: 2,
                  },
                }}
              />
              <Chip
                label={data.recommendationText}
                sx={{
                  bgcolor: `${getMatchColor(data.matchPercentage)}15`,
                  color: getMatchColor(data.matchPercentage),
                  fontWeight: 600,
                }}
              />
            </Box>

            {/* Requirements */}
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", mb: 2 }}>
                Требования вакансии
              </Typography>
              <List disablePadding>
                {data.requirements?.map((req, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      bgcolor: "#fafafa",
                      borderRadius: 2,
                      mb: 1,
                      px: 2,
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {getStatusIcon(req.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={req.text}
                      secondary={req.evidence}
                      primaryTypographyProps={{ fontWeight: 600, fontSize: "0.95rem" }}
                      secondaryTypographyProps={{ fontSize: "0.85rem" }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>

            {/* Strengths & Gaps */}
            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              {data.strengths && data.strengths.length > 0 && (
                <Box sx={{ flex: 1, minWidth: 250 }}>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "1rem",
                      mb: 1,
                      color: "#4CAF50",
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <Icon icon="mdi:thumb-up" width={18} height={18} />
                    Сильные стороны
                  </Typography>
                  <List dense disablePadding>
                    {data.strengths.map((s, i) => (
                      <ListItem key={i} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 24 }}>
                          <Icon icon="mdi:plus" width={16} height={16} color="#4CAF50" />
                        </ListItemIcon>
                        <ListItemText
                          primary={s}
                          primaryTypographyProps={{ fontSize: "0.9rem" }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {data.gaps && data.gaps.length > 0 && (
                <Box sx={{ flex: 1, minWidth: 250 }}>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "1rem",
                      mb: 1,
                      color: "#f44336",
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <Icon icon="mdi:alert" width={18} height={18} />
                    Пробелы
                  </Typography>
                  <List dense disablePadding>
                    {data.gaps.map((g, i) => (
                      <ListItem key={i} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 24 }}>
                          <Icon icon="mdi:minus" width={16} height={16} color="#f44336" />
                        </ListItemIcon>
                        <ListItemText
                          primary={g}
                          primaryTypographyProps={{ fontSize: "0.9rem" }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          </Box>
        </ResultDisplay>
      )}

      {/* Result - Analysis Response */}
      {data && isAnalysisResponse(data) && (
        <ResultDisplay
          title="Анализ резюме"
          copyText={formatAnalysisAsText()}
          downloadText={formatAnalysisAsText()}
          downloadFilename="resume-analysis.txt"
          onRegenerate={handleRegenerate}
          regenerating={loading}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {/* Summary */}
            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  mb: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Icon icon="mdi:text-box" width={20} height={20} color="#FF9800" />
                Краткое резюме
              </Typography>
              <Typography sx={{ fontSize: "0.95rem", color: "#333", lineHeight: 1.6 }}>
                {data.summary}
              </Typography>
            </Box>

            {/* Score */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                Оценка резюме:
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  px: 2,
                  py: 0.5,
                  bgcolor: data.score >= 7 ? "#e8f5e9" : data.score >= 5 ? "#fff3e0" : "#ffebee",
                  borderRadius: 2,
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: "1.2rem",
                    color: data.score >= 7 ? "#4CAF50" : data.score >= 5 ? "#FF9800" : "#f44336",
                  }}
                >
                  {data.score}
                </Typography>
                <Typography sx={{ fontSize: "0.9rem", color: "#666" }}>/10</Typography>
              </Box>
            </Box>

            {/* Skills */}
            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Icon icon="mdi:star" width={20} height={20} color="#2196F3" />
                Ключевые навыки
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {data.skills?.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    size="small"
                    sx={{
                      bgcolor: "#e3f2fd",
                      color: "#1976D2",
                      fontWeight: 500,
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Experience */}
            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Icon icon="mdi:briefcase" width={20} height={20} color="#9C27B0" />
                Опыт работы
              </Typography>
              <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                <Box>
                  <Typography sx={{ fontSize: "0.8rem", color: "#999" }}>Стаж</Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
                    {data.experience?.totalYears} лет
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "0.8rem", color: "#999" }}>Компании</Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
                    {data.experience?.companies}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "0.8rem", color: "#999" }}>Рост</Typography>
                  <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                    {data.experience?.growth}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Strengths & Improvements */}
            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "1rem",
                    mb: 1,
                    color: "#4CAF50",
                  }}
                >
                  ✓ Сильные стороны
                </Typography>
                <List dense disablePadding>
                  {data.strengths?.map((s, i) => (
                    <ListItem key={i} disablePadding sx={{ mb: 0.5 }}>
                      <ListItemText
                        primary={`• ${s}`}
                        primaryTypographyProps={{ fontSize: "0.9rem" }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>

              <Box sx={{ flex: 1, minWidth: 250 }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "1rem",
                    mb: 1,
                    color: "#FF9800",
                  }}
                >
                  💡 Рекомендации
                </Typography>
                <List dense disablePadding>
                  {data.improvements?.map((i, idx) => (
                    <ListItem key={idx} disablePadding sx={{ mb: 0.5 }}>
                      <ListItemText
                        primary={`• ${i}`}
                        primaryTypographyProps={{ fontSize: "0.9rem" }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>
          </Box>
        </ResultDisplay>
      )}
    </ToolLayout>
  );
}

