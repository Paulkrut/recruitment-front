"use client";
import * as React from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Collapse,
  Chip,
  Snackbar,
} from "@mui/material";
import { Icon } from "@iconify/react";
import Link from "next/link";
import ToolLayout from "../components/ToolLayout";
import ResultDisplay from "../components/ResultDisplay";
import HrToolConsent from "../components/HrToolConsent";
import {
  useInterviewScorecard,
  ScorecardCriterion,
  ScorecardResponse,
} from "../hooks/useHrTool";

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

const levels = [
  { id: "junior", name: "Junior (начинающий)" },
  { id: "middle", name: "Middle (опытный)" },
  { id: "senior", name: "Senior (эксперт)" },
  { id: "lead", name: "Lead (руководитель)" },
];

const interviewTypes = [
  { id: "universal", name: "Универсальное (HR + technical + soft skills)" },
  { id: "hr", name: "HR-интервью (культура, мотивация)" },
  { id: "technical", name: "Техническое интервью (hard skills)" },
  { id: "final", name: "Финальное (комплексная оценка)" },
];

const categoryMeta: Record<
  string,
  { label: string; color: string; bgcolor: string }
> = {
  hard_skills: { label: "Hard Skills", color: "#1565C0", bgcolor: "#e3f2fd" },
  soft_skills: { label: "Soft Skills", color: "#6A1B9A", bgcolor: "#f3e5f5" },
  motivation:  { label: "Мотивация",   color: "#E65100", bgcolor: "#fff3e0" },
  culture:     { label: "Культура",    color: "#1B5E20", bgcolor: "#e8f5e9" },
};

const recommendationMeta: Record<
  string,
  { color: string; bgcolor: string; icon: string }
> = {
  hire:    { color: "#1B5E20", bgcolor: "#e8f5e9", icon: "mdi:check-circle" },
  consider:{ color: "#E65100", bgcolor: "#fff3e0", icon: "mdi:alert-circle" },
  doubt:   { color: "#BF360C", bgcolor: "#fbe9e7", icon: "mdi:help-circle" },
  reject:  { color: "#B71C1C", bgcolor: "#ffebee", icon: "mdi:close-circle" },
};

function formatScorecardAsText(data: ScorecardResponse): string {
  let text = `ОЦЕНОЧНЫЙ ЛИСТ КАНДИДАТА\n`;
  text += `Должность: ${data.position}\n`;
  text += `Тип интервью: ${data.interviewType}\n\n`;
  text += `${data.summary}\n\n`;
  text += `${"=".repeat(50)}\n`;
  text += `КРИТЕРИИ ОЦЕНКИ\n`;
  text += `${"=".repeat(50)}\n\n`;

  data.criteria.forEach((c) => {
    const cat = categoryMeta[c.category];
    text += `${c.id}. ${c.name} [${cat?.label ?? c.category}] — макс. ${c.maxScore} баллов\n`;
    text += `Что проверяем: ${c.description}\n`;
    text += `✓ Сильный сигнал: ${c.strongSignal}\n`;
    text += `✗ Слабый сигнал: ${c.weakSignal}\n`;
    text += `Оценка: ______ / ${c.maxScore}\n\n`;
  });

  text += `${"=".repeat(50)}\n`;
  text += `RED FLAGS\n`;
  text += `${"=".repeat(50)}\n`;
  data.redFlags.forEach((f) => { text += `• ${f}\n`; });

  text += `\n${"=".repeat(50)}\n`;
  text += `ИТОГ\n`;
  text += `${"=".repeat(50)}\n`;
  text += `Сумма баллов: ______ / ${data.finalSection.totalMaxScore}\n\n`;
  data.finalSection.legend.forEach((l) => {
    text += `${l.range} баллов — ${l.label}\n`;
  });
  text += `\nРекомендация: ________________________\n`;
  text += `Комментарий: ________________________\n`;

  return text;
}

export default function InterviewScorecardClient() {
  const [position, setPosition] = React.useState("");
  const [level, setLevel] = React.useState("middle");
  const [interviewType, setInterviewType] = React.useState("universal");
  const [competencies, setCompetencies] = React.useState("");
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [jobDescription, setJobDescription] = React.useState("");
  const [docxDownloaded, setDocxDownloaded] = React.useState(false);
  const [docxError, setDocxError] = React.useState("");

  const { data, loading, error, execute } = useInterviewScorecard();
  const [downloadingDocx, setDownloadingDocx] = React.useState(false);

  const canSubmit = position.trim().length >= 2;

  const handleDownloadDocx = async () => {
    if (!data) return;
    setDownloadingDocx(true);
    setDocxError("");
    try {
      const response = await fetch(`${API_BASE}/api/public/hr-tools/export/scorecard-docx`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Не удалось сформировать DOCX");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `scorecard-${data.position.slice(0, 40).replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDocxDownloaded(true);
    } catch (err) {
      console.error("DOCX download failed:", err);
      setDocxError("Не удалось скачать Word-файл. Попробуйте ещё раз.");
    } finally {
      setDownloadingDocx(false);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await execute({
      position: position.trim(),
      level,
      interviewType,
      competencies: competencies.trim() || undefined,
      jobDescription: jobDescription.trim() || undefined,
    });
  };

  return (
    <ToolLayout
      title="Генератор оценочного листа"
      description="AI создаёт структурированный scorecard: критерии, сигналы, red flags и шкалу баллов — под вашу вакансию."
      icon="mdi:clipboard-check-multiple"
      iconColor="#009688"
      ctaLabel="Хотите оценивать кандидатов системно?"
      ctaTitle="SofiHR — платформа для структурированного найма"
      ctaDescription="Проводите AI-интервью, храните оценки по каждому кандидату и сравнивайте их между собой. Воронка, аналитика и рейтинг — в одном месте."
      ctaButtonText="Начать бесплатно →"
      ctaFeatures={[
        { icon: "mdi:clipboard-check",          text: "Scorecard в каждом интервью" },
        { icon: "mdi:robot",                    text: "AI-интервью" },
        { icon: "mdi:chart-bar",                text: "Рейтинг кандидатов" },
        { icon: "mdi:flag",                     text: "Красные флаги" },
        { icon: "mdi:account-multiple-check",   text: "Сравнение кандидатов" },
      ]}
    >
      {/* Форма */}
      <Paper
        elevation={0}
        sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, border: "1px solid #b8cfe8", bgcolor: "#fff", mb: 4 }}
      >
        {/* Должность */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a2e", mb: 1 }}>
            Должность <span style={{ color: "#f44336" }}>*</span>
          </Typography>
          <TextField
            fullWidth
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="Например: Frontend Developer, HR-менеджер, Product Manager"
            inputProps={{ maxLength: 100 }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
        </Box>

        {/* Уровень + тип интервью в ряд */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mb: 3 }}>
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a2e", mb: 1 }}>
              Уровень кандидата
            </Typography>
            <FormControl fullWidth>
              <Select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                {levels.map((l) => (
                  <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a2e", mb: 1 }}>
              Тип интервью
            </Typography>
            <FormControl fullWidth>
              <Select
                value={interviewType}
                onChange={(e) => setInterviewType(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                {interviewTypes.map((t) => (
                  <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Ключевые компетенции */}
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a2e", mb: 0.5 }}>
            Ключевые компетенции <Typography component="span" sx={{ fontSize: "0.8rem", color: "#999" }}>(опционально)</Typography>
          </Typography>
          <TextField
            fullWidth
            value={competencies}
            onChange={(e) => setCompetencies(e.target.value)}
            placeholder="React, TypeScript, командная работа, клиентоориентированность..."
            inputProps={{ maxLength: 500 }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
          <Typography sx={{ mt: 0.5, fontSize: "0.78rem", color: "#999" }}>
            Укажите, что важно проверить. AI учтёт это при формировании критериев.
          </Typography>
        </Box>

        {/* Дополнительно — вакансия */}
        <Box sx={{ mb: 3 }}>
          <Button
            size="small"
            onClick={() => setShowAdvanced((v) => !v)}
            startIcon={<Icon icon={showAdvanced ? "mdi:chevron-up" : "mdi:chevron-down"} width={16} />}
            sx={{ color: "#666", textTransform: "none", fontSize: "0.85rem", p: 0, minWidth: 0 }}
          >
            {showAdvanced ? "Скрыть описание вакансии" : "Добавить описание вакансии"}
          </Button>
          <Collapse in={showAdvanced}>
            <TextField
              fullWidth
              multiline
              rows={5}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Вставьте описание вакансии — AI учтёт обязанности и требования при генерации критериев..."
              inputProps={{ maxLength: 5000 }}
              sx={{ mt: 1.5, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
            <Typography sx={{ mt: 0.5, fontSize: "0.78rem", color: jobDescription.length > 4500 ? "#f44336" : "#999" }}>
              {jobDescription.length} / 5000
            </Typography>
          </Collapse>
        </Box>

        {/* Кнопка */}
        <HrToolConsent />
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={loading || !canSubmit}
          startIcon={
            loading
              ? <CircularProgress size={20} color="inherit" />
              : <Icon icon="mdi:auto-fix" />
          }
          sx={{
            bgcolor: "#009688",
            color: "#fff",
            textTransform: "none",
            fontWeight: 600,
            px: 4,
            py: 1.5,
            fontSize: "1rem",
            borderRadius: 2,
            "&:hover": { bgcolor: "#00796B" },
            "&:disabled": { bgcolor: "#ccc" },
          }}
        >
          {loading ? "Генерация scorecard..." : "Создать оценочный лист"}
        </Button>
      </Paper>

      {/* Ошибка */}
      <Collapse in={!!error}>
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>{error}</Alert>
      </Collapse>

      {/* Inline nudge — после получения результата */}
      {!!data && (
        <Box
          sx={{
            mb: 2,
            p: { xs: 2.5, md: 3 },
            borderRadius: 3,
            border: "1px solid #b2dfdb",
            bgcolor: "#e0f2f1",
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, flex: 1, minWidth: 0 }}>
            <Box sx={{
              mt: 0.25, width: 36, height: 36, borderRadius: 2, bgcolor: "#009688",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Icon icon="mdi:clipboard-account" width={20} height={20} color="#fff" />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#1a1a2e", lineHeight: 1.3 }}>
                Scorecard готов — используйте его в AI-интервью
              </Typography>
              <Typography sx={{ fontSize: "0.83rem", color: "#555", mt: 0.4, lineHeight: 1.5 }}>
                В SofiHR кандидат сам проходит интервью, система заполняет scorecard автоматически и даёт итоговую оценку
              </Typography>
            </Box>
          </Box>
          <Button
            component={Link}
            href="/auth/register"
            variant="contained"
            size="small"
            sx={{
              bgcolor: "#009688",
              color: "#fff",
              textTransform: "none",
              fontWeight: 600,
              px: 2.5,
              py: 1,
              borderRadius: 2,
              flexShrink: { xs: 1, sm: 0 },
              alignSelf: { xs: "stretch", sm: "auto" },
              whiteSpace: "nowrap",
              "&:hover": { bgcolor: "#00796B" },
            }}
          >
            Запустить AI-интервью →
          </Button>
        </Box>
      )}

      {/* Результат */}
      {!!data && (
        <ResultDisplay
          title={`Готово: scorecard для ${data.position}`}
          copyText={formatScorecardAsText(data)}
          onDownloadDocx={handleDownloadDocx}
          downloadingDocx={downloadingDocx}
          onRegenerate={handleSubmit}
          regenerating={loading}
        >
          {/* Саммари */}
          <Box sx={{ p: 2.5, mb: 3, bgcolor: "#f0fafa", borderRadius: 2, border: "1px solid #b2dfdb" }}>
            <Typography sx={{ fontSize: "0.9rem", color: "#004D40", lineHeight: 1.6 }}>
              {data.summary}
            </Typography>
          </Box>

          {/* Критерии */}
          <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#1a1a2e", mb: 2 }}>
            Критерии оценки
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
            {data.criteria.map((criterion: ScorecardCriterion) => {
              const cat = categoryMeta[criterion.category] ?? categoryMeta.hard_skills;
              return (
                <Paper
                  key={criterion.id}
                  elevation={0}
                  sx={{ p: 2.5, border: "1px solid #e0e0e0", borderRadius: 2, borderLeft: `4px solid ${cat.color}` }}
                >
                  {/* Заголовок критерия */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5, flexWrap: "wrap" }}>
                    <Box sx={{
                      width: 26, height: 26, borderRadius: "50%", bgcolor: cat.color,
                      color: "#fff", display: "flex", alignItems: "center",
                      justifyContent: "center", fontWeight: 700, fontSize: "0.8rem", flexShrink: 0,
                    }}>
                      {criterion.id}
                    </Box>
                    <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#1a1a2e", flex: 1 }}>
                      {criterion.name}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Chip
                        label={cat.label}
                        size="small"
                        sx={{ bgcolor: cat.bgcolor, color: cat.color, fontWeight: 600, fontSize: "0.73rem" }}
                      />
                      <Typography sx={{ fontSize: "0.8rem", color: "#666", whiteSpace: "nowrap" }}>
                        макс. {criterion.maxScore} б.
                      </Typography>
                    </Box>
                  </Box>

                  {/* Что проверяем */}
                  <Typography sx={{ fontSize: "0.85rem", color: "#444", lineHeight: 1.5, mb: 1.5 }}>
                    {criterion.description}
                  </Typography>

                  {/* Сигналы */}
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
                    <Box sx={{ p: 1.5, bgcolor: "#f1f8e9", borderRadius: 1.5, border: "1px solid #c8e6c9" }}>
                      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.75 }}>
                        <Icon icon="mdi:check-circle" width={16} height={16} color="#388E3C" style={{ marginTop: 2, flexShrink: 0 }} />
                        <Box>
                          <Typography sx={{ fontSize: "0.73rem", fontWeight: 700, color: "#1B5E20", mb: 0.25 }}>
                            Сильный сигнал
                          </Typography>
                          <Typography sx={{ fontSize: "0.82rem", color: "#2E7D32", lineHeight: 1.4 }}>
                            {criterion.strongSignal}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ p: 1.5, bgcolor: "#fce4ec", borderRadius: 1.5, border: "1px solid #f8bbd9" }}>
                      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.75 }}>
                        <Icon icon="mdi:close-circle" width={16} height={16} color="#c62828" style={{ marginTop: 2, flexShrink: 0 }} />
                        <Box>
                          <Typography sx={{ fontSize: "0.73rem", fontWeight: 700, color: "#B71C1C", mb: 0.25 }}>
                            Слабый сигнал
                          </Typography>
                          <Typography sx={{ fontSize: "0.82rem", color: "#C62828", lineHeight: 1.4 }}>
                            {criterion.weakSignal}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              );
            })}
          </Box>

          {/* Red flags */}
          <Box sx={{ mb: 3, p: 2.5, bgcolor: "#fff8e1", borderRadius: 2, border: "1px solid #ffe082" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <Icon icon="mdi:flag" width={20} height={20} color="#F57F17" />
              <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#E65100" }}>
                Red flags — сигналы тревоги
              </Typography>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
              {data.redFlags.map((flag: string, i: number) => (
                <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                  <Icon icon="mdi:alert" width={15} height={15} color="#F57F17" style={{ marginTop: 3, flexShrink: 0 }} />
                  <Typography sx={{ fontSize: "0.88rem", color: "#5D4037", lineHeight: 1.5 }}>
                    {flag}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Итоговая шкала */}
          <Box sx={{ p: 2.5, bgcolor: "#fafafa", borderRadius: 2, border: "1px solid #e0e0e0" }}>
            <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#1a1a2e", mb: 1.5 }}>
              Итог: макс. {data.finalSection.totalMaxScore} баллов
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {data.finalSection.legend.map((item, i) => {
                const meta = recommendationMeta[item.recommendation] ?? recommendationMeta.consider;
                return (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      p: 1.25,
                      bgcolor: meta.bgcolor,
                      borderRadius: 1.5,
                    }}
                  >
                    <Icon icon={meta.icon} width={18} height={18} color={meta.color} style={{ flexShrink: 0 }} />
                    <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: meta.color, minWidth: 70 }}>
                      {item.range} б.
                    </Typography>
                    <Typography sx={{ fontSize: "0.85rem", color: "#444", lineHeight: 1.4 }}>
                      {item.label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </ResultDisplay>
      )}

      <Snackbar
        open={docxDownloaded}
        autoHideDuration={2500}
        onClose={() => setDocxDownloaded(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          Word-файл скачан
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!docxError}
        autoHideDuration={3500}
        onClose={() => setDocxError("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" sx={{ width: "100%" }}>
          {docxError}
        </Alert>
      </Snackbar>
    </ToolLayout>
  );
}
