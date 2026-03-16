"use client";

import * as React from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Collapse,
  FormControl,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { Icon } from "@iconify/react";
import ToolLayout from "../components/ToolLayout";
import ResultDisplay from "../components/ResultDisplay";
import { AdditionalAgreementResponse, useAdditionalAgreementGenerator } from "../hooks/useHrTool";

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

const CHANGE_TYPE_OPTIONS = [
  { value: "salary", label: "Изменение оклада / зарплаты" },
  { value: "position", label: "Изменение должности" },
  { value: "schedule", label: "Изменение графика работы" },
  { value: "remote", label: "Перевод на удалёнку" },
  { value: "department", label: "Перевод в другой отдел" },
  { value: "extension", label: "Продление срока действия договора" },
] as const;

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

function TemplatePreview({ data }: { data: AdditionalAgreementResponse }) {
  return (
    <Paper elevation={0} sx={{ mt: 3, p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px dashed #c4b5d4", bgcolor: "#faf5ff" }}>
      <Typography sx={{ fontWeight: 700, color: "#1a1a2e", mb: 1 }}>Готовый шаблон документа</Typography>
      <Typography sx={{ fontSize: "0.87rem", color: "#64748b", mb: 2 }}>Этот шаблон уходит в Word-экспорт. Можно скачать и доработать на фирменном бланке.</Typography>
      <Box sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 2, border: "1px solid #d1c4e9", bgcolor: "#fff", whiteSpace: "pre-wrap", fontSize: "0.9rem", lineHeight: 1.7, color: "#334155" }}>
        {data.fullText}
      </Box>
    </Paper>
  );
}

export default function AdditionalAgreementClient() {
  const [changeType, setChangeType] = React.useState("");
  const [employeeName, setEmployeeName] = React.useState("");
  const [position, setPosition] = React.useState("");
  const [currentConditions, setCurrentConditions] = React.useState("");
  const [newConditions, setNewConditions] = React.useState("");
  const [effectiveDate, setEffectiveDate] = React.useState("");
  const [companyName, setCompanyName] = React.useState("");
  const [docxDownloaded, setDocxDownloaded] = React.useState(false);
  const [docxError, setDocxError] = React.useState("");
  const [downloadingDocx, setDownloadingDocx] = React.useState(false);

  const { data, loading, error, execute } = useAdditionalAgreementGenerator();

  const canSubmit =
    !!changeType &&
    employeeName.trim().length >= 2 &&
    newConditions.trim().length >= 2;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await execute({
      changeType,
      employeeName: employeeName.trim(),
      position: position.trim() || undefined,
      currentConditions: currentConditions.trim() || undefined,
      newConditions: newConditions.trim(),
      effectiveDate: effectiveDate.trim() || undefined,
      companyName: companyName.trim() || undefined,
    });
  };

  const handleDownloadDocx = async () => {
    if (!data) return;
    setDownloadingDocx(true);
    setDocxError("");
    try {
      const response = await fetch(`${API_BASE}/api/public/hr-tools/export/additional-agreement-docx`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Не удалось сформировать DOCX");
      const blob = await response.blob();
      downloadBlob(blob, `dopsoglashenie-${employeeName.trim().replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.docx`);
      setDocxDownloaded(true);
    } catch {
      setDocxError("Не удалось скачать Word-файл. Попробуйте ещё раз.");
    } finally {
      setDownloadingDocx(false);
    }
  };

  return (
    <ToolLayout
      title="Дополнительное соглашение: шаблон и генератор"
      description="Создайте допсоглашение к трудовому договору за минуту."
      icon="mdi:file-document-edit-outline"
      iconColor="#7B1FA2"
      ctaLabel="Допсоглашение готово — что дальше?"
      ctaTitle="В SofiHR можно вести весь цикл найма"
      ctaDescription="От вакансии до допсоглашений: AI-интервью, оценка кандидатов, рейтинг и кадровый учёт в одной системе."
      ctaButtonText="Попробовать SofiHR бесплатно →"
      ctaFeatures={[
        { icon: "mdi:file-document-edit-outline", text: "Создание вакансии" },
        { icon: "mdi:robot-outline", text: "AI-интервью" },
        { icon: "mdi:chart-line", text: "Рейтинг кандидатов" },
        { icon: "mdi:file-document-plus-outline", text: "Кадровые документы" },
      ]}
    >
      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, border: "1px solid #c4b5d4", bgcolor: "#fff", mb: 4 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a2e", mb: 1 }}>Тип изменения *</Typography>
            <FormControl fullWidth>
              <Select
                value={changeType}
                onChange={(e) => setChangeType(String(e.target.value))}
                displayEmpty
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Выберите тип</MenuItem>
                {CHANGE_TYPE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a2e", mb: 1 }}>ФИО работника *</Typography>
            <TextField
              fullWidth
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              placeholder="Иванов Иван Иванович"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a2e", mb: 1 }}>Должность</Typography>
            <TextField
              fullWidth
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Менеджер по продажам, Frontend-разработчик..."
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a2e", mb: 1 }}>Дата вступления в силу</Typography>
            <TextField
              fullWidth
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              placeholder="1 апреля 2026 г."
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Box>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a2e", mb: 1 }}>Текущие условия (до изменений)</Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={currentConditions}
            onChange={(e) => setCurrentConditions(e.target.value)}
            placeholder="Оклад 120 000 руб., офис 5/2, должность менеджер..."
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a2e", mb: 1 }}>Новые условия *</Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={newConditions}
            onChange={(e) => setNewConditions(e.target.value)}
            placeholder="Оклад 150 000 руб. с 1 апреля 2026 г. / Удалённая работа с 1 апреля 2026 г. / Новая должность: старший менеджер..."
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a2e", mb: 1 }}>Название компании</Typography>
          <TextField
            fullWidth
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="ООО «Компания»"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
        </Box>

        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={loading || !canSubmit}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Icon icon="mdi:auto-fix" />}
          sx={{
            mt: 4,
            bgcolor: "#7B1FA2",
            color: "#fff",
            textTransform: "none",
            fontWeight: 600,
            px: 4,
            py: 1.5,
            fontSize: "1rem",
            borderRadius: 2,
            "&:hover": { bgcolor: "#6A1B9A" },
            "&:disabled": { bgcolor: "#cbd5e1" },
          }}
        >
          {loading ? "Генерируем допсоглашение..." : "Сгенерировать допсоглашение"}
        </Button>
      </Paper>

      <Collapse in={!!error}>
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          {error}
        </Alert>
      </Collapse>

      {data && (
        <ResultDisplay
          title={data.title}
          copyText={data.fullText}
          downloadText={data.fullText}
          downloadFilename="dopsoglashenie.txt"
          onRegenerate={handleSubmit}
          regenerating={loading}
          onDownloadDocx={handleDownloadDocx}
          downloadingDocx={downloadingDocx}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {data.preamble && (
              <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px solid #d1c4e9", bgcolor: "#ede7f6" }}>
                <Typography sx={{ fontWeight: 700, color: "#1a1a2e", mb: 1 }}>Преамбула</Typography>
                <Typography sx={{ fontSize: "0.95rem", color: "#334155", lineHeight: 1.7 }}>{data.preamble}</Typography>
              </Paper>
            )}
            {data.clauses?.length > 0 && (
              <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px solid #dbe6f3", bgcolor: "#fff" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "#EDE7F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon icon="mdi:format-list-numbered" width={20} height={20} color="#7B1FA2" />
                  </Box>
                  <Typography sx={{ fontWeight: 700, color: "#1a1a2e" }}>Пункты изменений</Typography>
                </Box>
                {data.clauses.map((clause, i) => (
                  <Box key={i} sx={{ display: "flex", gap: 1, mb: 0.8 }}>
                    <Typography sx={{ color: "#7B1FA2", fontWeight: 700 }}>{i + 1}.</Typography>
                    <Typography sx={{ fontSize: "0.93rem", color: "#334155", lineHeight: 1.6 }}>{clause}</Typography>
                  </Box>
                ))}
              </Paper>
            )}
            {data.effectiveDate && (
              <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px solid #dbe6f3", bgcolor: "#fff" }}>
                <Typography sx={{ fontWeight: 700, color: "#1a1a2e", mb: 0.5 }}>Дата вступления в силу</Typography>
                <Typography sx={{ fontSize: "0.93rem", color: "#334155", lineHeight: 1.6 }}>{data.effectiveDate}</Typography>
              </Paper>
            )}
            {data.signatures && (
              <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px solid #e0e0e0", bgcolor: "#fafafa" }}>
                <Typography sx={{ fontWeight: 700, color: "#1a1a2e", mb: 0.5 }}>Подписи сторон</Typography>
                <Typography sx={{ fontSize: "0.93rem", color: "#334155", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{data.signatures}</Typography>
              </Paper>
            )}
            {data.disclaimer && (
              <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px solid #e0e0e0", bgcolor: "#fafafa" }}>
                <Typography sx={{ fontSize: "0.85rem", color: "#64748b", lineHeight: 1.6, fontStyle: "italic" }}>{data.disclaimer}</Typography>
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
