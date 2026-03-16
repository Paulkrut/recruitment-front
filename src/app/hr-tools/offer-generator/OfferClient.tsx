"use client";

import * as React from "react";
import {
  Alert, Box, Button, CircularProgress, Collapse, FormControl,
  MenuItem, Paper, Select, Snackbar, TextField, Typography,
} from "@mui/material";
import { Icon } from "@iconify/react";
import ToolLayout from "../components/ToolLayout";
import ResultDisplay from "../components/ResultDisplay";
import { OfferResponse, useOfferGenerator } from "../hooks/useHrTool";

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function TemplatePreview({ data }: { data: OfferResponse }) {
  return (
    <Paper elevation={0} sx={{ mt: 3, p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px dashed #b8cfe8", bgcolor: "#fafcff" }}>
      <Typography sx={{ fontWeight: 700, color: "#1a1a2e", mb: 1 }}>Готовый шаблон документа</Typography>
      <Typography sx={{ fontSize: "0.87rem", color: "#64748b", mb: 2 }}>Этот шаблон уходит в Word-экспорт. Можно скачать и доработать на фирменном бланке.</Typography>
      <Box sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 2, border: "1px solid #dbe6f3", bgcolor: "#fff", whiteSpace: "pre-wrap", fontSize: "0.9rem", lineHeight: 1.7, color: "#334155" }}>
        {data.fullText}
      </Box>
    </Paper>
  );
}

export default function OfferClient() {
  const [candidateName, setCandidateName] = React.useState("");
  const [position, setPosition] = React.useState("");
  const [salary, setSalary] = React.useState("");
  const [startDate, setStartDate] = React.useState("");
  const [probation, setProbation] = React.useState("");
  const [workFormat, setWorkFormat] = React.useState("");
  const [bonuses, setBonuses] = React.useState("");
  const [companyName, setCompanyName] = React.useState("");
  const [docxDownloaded, setDocxDownloaded] = React.useState(false);
  const [docxError, setDocxError] = React.useState("");
  const [downloadingDocx, setDownloadingDocx] = React.useState(false);

  const { data, loading, error, execute } = useOfferGenerator();

  const canSubmit = candidateName.trim().length >= 2 && position.trim().length >= 2;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await execute({
      candidateName: candidateName.trim(),
      position: position.trim(),
      salary: salary.trim() || undefined,
      startDate: startDate.trim() || undefined,
      probation: probation || undefined,
      workFormat: workFormat || undefined,
      bonuses: bonuses.trim() || undefined,
      companyName: companyName.trim() || undefined,
    });
  };

  const handleDownloadDocx = async () => {
    if (!data) return;
    setDownloadingDocx(true);
    setDocxError("");
    try {
      const response = await fetch(`${API_BASE}/api/public/hr-tools/export/offer-docx`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Не удалось сформировать DOCX");
      const blob = await response.blob();
      downloadBlob(blob, `offer-${position.trim().replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.docx`);
      setDocxDownloaded(true);
    } catch {
      setDocxError("Не удалось скачать Word-файл. Попробуйте ещё раз.");
    } finally {
      setDownloadingDocx(false);
    }
  };

  return (
    <ToolLayout
      title="Оффер кандидату: пример и генератор"
      description="Создайте профессиональное письмо-оффер за минуту."
      icon="mdi:email-check-outline"
      iconColor="#009688"
      ctaLabel="Оффер готов — что дальше?"
      ctaTitle="В SofiHR можно вести весь процесс найма"
      ctaDescription="От вакансии до оффера: AI-интервью, оценка кандидатов, рейтинг и аналитика в одной системе."
      ctaButtonText="Попробовать SofiHR бесплатно →"
      ctaFeatures={[
        { icon: "mdi:file-document-edit-outline", text: "Создание вакансии" },
        { icon: "mdi:robot-outline", text: "AI-интервью" },
        { icon: "mdi:chart-line", text: "Рейтинг кандидатов" },
        { icon: "mdi:email-edit-outline", text: "Автоматические приглашения" },
      ]}
    >
      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, border: "1px solid #b8cfe8", bgcolor: "#fff", mb: 4 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a2e", mb: 1 }}>ФИО кандидата *</Typography>
            <TextField fullWidth value={candidateName} onChange={(e) => setCandidateName(e.target.value)} placeholder="Иванов Иван Иванович" sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a2e", mb: 1 }}>Должность *</Typography>
            <TextField fullWidth value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Менеджер по продажам, Frontend-разработчик..." sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a2e", mb: 1 }}>Оклад / ЗП</Typography>
            <TextField fullWidth value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="150 000 руб. gross" sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a2e", mb: 1 }}>Дата выхода</Typography>
            <TextField fullWidth value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="1 апреля 2026 г." sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a2e", mb: 1 }}>Испытательный срок</Typography>
            <FormControl fullWidth>
              <Select value={probation} onChange={(e) => setProbation(String(e.target.value))} displayEmpty sx={{ borderRadius: 2 }}>
                <MenuItem value="">Не указывать</MenuItem>
                <MenuItem value="none">Без испытательного срока</MenuItem>
                <MenuItem value="1">1 месяц</MenuItem>
                <MenuItem value="2">2 месяца</MenuItem>
                <MenuItem value="3">3 месяца</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a2e", mb: 1 }}>Формат работы</Typography>
            <FormControl fullWidth>
              <Select value={workFormat} onChange={(e) => setWorkFormat(String(e.target.value))} displayEmpty sx={{ borderRadius: 2 }}>
                <MenuItem value="">Не указывать</MenuItem>
                <MenuItem value="office">Офис</MenuItem>
                <MenuItem value="remote">Удалённая работа</MenuItem>
                <MenuItem value="hybrid">Гибридный формат</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a2e", mb: 1 }}>Бонусы, ДМС, прочие условия</Typography>
          <TextField fullWidth multiline rows={3} value={bonuses} onChange={(e) => setBonuses(e.target.value)} placeholder="ДМС после испытательного, бонус по результатам квартала, компенсация обедов..." sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a2e", mb: 1 }}>Название компании</Typography>
          <TextField fullWidth value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="ООО «Компания»" sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
        </Box>

        <Button
          variant="contained" size="large" onClick={handleSubmit} disabled={loading || !canSubmit}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Icon icon="mdi:auto-fix" />}
          sx={{ mt: 4, bgcolor: "#009688", color: "#fff", textTransform: "none", fontWeight: 600, px: 4, py: 1.5, fontSize: "1rem", borderRadius: 2, "&:hover": { bgcolor: "#00796b" }, "&:disabled": { bgcolor: "#cbd5e1" } }}
        >
          {loading ? "Генерируем оффер..." : "Сгенерировать оффер"}
        </Button>
      </Paper>

      <Collapse in={!!error}><Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>{error}</Alert></Collapse>

      {data && (
        <ResultDisplay title={data.title} copyText={data.fullText} downloadText={data.fullText} downloadFilename="offer.txt" onRegenerate={handleSubmit} regenerating={loading} onDownloadDocx={handleDownloadDocx} downloadingDocx={downloadingDocx}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {data.introduction && (
              <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px solid #b7e4dd", bgcolor: "#eefbf8" }}>
                <Typography sx={{ fontWeight: 700, color: "#1a1a2e", mb: 1 }}>{data.greeting}</Typography>
                <Typography sx={{ fontSize: "0.95rem", color: "#334155", lineHeight: 1.7 }}>{data.introduction}</Typography>
              </Paper>
            )}
            {data.positionDetails && (
              <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px solid #dbe6f3", bgcolor: "#fff" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "#E3F2FD", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon icon="mdi:briefcase-outline" width={20} height={20} color="#1565C0" />
                  </Box>
                  <Typography sx={{ fontWeight: 700, color: "#1a1a2e" }}>Должность и роль</Typography>
                </Box>
                <Typography sx={{ fontSize: "0.93rem", color: "#334155", lineHeight: 1.7 }}>{data.positionDetails}</Typography>
              </Paper>
            )}
            {data.compensationDetails && (
              <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px solid #dbe6f3", bgcolor: "#fff" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "#E8F5E9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon icon="mdi:cash-multiple" width={20} height={20} color="#2E7D32" />
                  </Box>
                  <Typography sx={{ fontWeight: 700, color: "#1a1a2e" }}>Компенсация</Typography>
                </Box>
                <Typography sx={{ fontSize: "0.93rem", color: "#334155", lineHeight: 1.7 }}>{data.compensationDetails}</Typography>
              </Paper>
            )}
            {data.conditions?.length > 0 && (
              <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px solid #dbe6f3", bgcolor: "#fff" }}>
                <Typography sx={{ fontWeight: 700, color: "#1a1a2e", mb: 1.5 }}>Условия работы</Typography>
                {data.conditions.map((c, i) => (
                  <Box key={i} sx={{ display: "flex", gap: 1, mb: 0.8 }}>
                    <Typography sx={{ color: "#009688", fontWeight: 700 }}>•</Typography>
                    <Typography sx={{ fontSize: "0.93rem", color: "#334155", lineHeight: 1.6 }}>{c}</Typography>
                  </Box>
                ))}
              </Paper>
            )}
            {data.benefits?.length > 0 && (
              <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px solid #dbe6f3", bgcolor: "#fff" }}>
                <Typography sx={{ fontWeight: 700, color: "#1a1a2e", mb: 1.5 }}>Бонусы и льготы</Typography>
                {data.benefits.map((b, i) => (
                  <Box key={i} sx={{ display: "flex", gap: 1, mb: 0.8 }}>
                    <Typography sx={{ color: "#009688", fontWeight: 700 }}>•</Typography>
                    <Typography sx={{ fontSize: "0.93rem", color: "#334155", lineHeight: 1.6 }}>{b}</Typography>
                  </Box>
                ))}
              </Paper>
            )}
            {data.nextSteps?.length > 0 && (
              <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px solid #dbe6f3", bgcolor: "#fff" }}>
                <Typography sx={{ fontWeight: 700, color: "#1a1a2e", mb: 1.5 }}>Следующие шаги</Typography>
                {data.nextSteps.map((s, i) => (
                  <Box key={i} sx={{ display: "flex", gap: 1, mb: 0.8 }}>
                    <Typography sx={{ color: "#1565C0", fontWeight: 700 }}>{i + 1}.</Typography>
                    <Typography sx={{ fontSize: "0.93rem", color: "#334155", lineHeight: 1.6 }}>{s}</Typography>
                  </Box>
                ))}
              </Paper>
            )}
            {data.closing && (
              <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px solid #e0e0e0", bgcolor: "#fafafa" }}>
                <Typography sx={{ fontSize: "0.93rem", color: "#334155", lineHeight: 1.7, fontStyle: "italic" }}>{data.closing}</Typography>
              </Paper>
            )}
            <TemplatePreview data={data} />
          </Box>
        </ResultDisplay>
      )}

      <Snackbar open={docxDownloaded} autoHideDuration={2500} onClose={() => setDocxDownloaded(false)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity="success" sx={{ width: "100%" }}>Word-файл скачан</Alert>
      </Snackbar>
      <Snackbar open={!!docxError} autoHideDuration={3500} onClose={() => setDocxError("")} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity="error" sx={{ width: "100%" }}>{docxError}</Alert>
      </Snackbar>
    </ToolLayout>
  );
}
