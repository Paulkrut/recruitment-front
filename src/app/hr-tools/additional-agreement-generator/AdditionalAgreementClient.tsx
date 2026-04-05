"use client";

import * as React from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Collapse,
  Divider,
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
import HrToolConsent from "../components/HrToolConsent";
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

const inputSx = { "& .MuiOutlinedInput-root": { borderRadius: 2 } };
const grid2 = { display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 };

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

function renderWithTokenHighlights(text: string) {
  const parts = text.split(/({{manual:[a-zA-Z]+}})/g);
  return parts.map((part, i) =>
    /^{{manual:[a-zA-Z]+}}$/.test(part) ? (
      <mark key={i} style={{ background: "#fef08a", borderRadius: 3, padding: "0 3px", fontWeight: 600 }}>
        {part}
      </mark>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
}

function SectionHeader({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
      <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: "#EDE7F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon icon={icon} width={18} height={18} color="#7B1FA2" />
      </Box>
      <Box>
        <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#1a1a2e", lineHeight: 1.2 }}>{title}</Typography>
        {subtitle && <Typography sx={{ fontSize: "0.78rem", color: "#64748b" }}>{subtitle}</Typography>}
      </Box>
    </Box>
  );
}

function FormField({ label, helper, children }: { label: string; helper?: string; children: React.ReactNode }) {
  return (
    <Box>
      <Typography sx={{ fontWeight: 600, fontSize: "0.88rem", color: "#1a1a2e", mb: 0.5 }}>{label}</Typography>
      {helper && <Typography sx={{ fontSize: "0.77rem", color: "#94a3b8", mb: 0.7 }}>{helper}</Typography>}
      {children}
    </Box>
  );
}

function AgreementPreview({ data }: { data: AdditionalAgreementResponse }) {
  const hasManual = (data.manualFields?.length ?? 0) > 0;
  return (
    <Paper elevation={0} sx={{ mt: 3, p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px dashed #c4b5d4", bgcolor: "#faf5ff" }}>
      <Typography sx={{ fontWeight: 700, color: "#1a1a2e", mb: 1 }}>Готовый шаблон документа</Typography>
      {hasManual && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2, fontSize: "0.82rem" }}>
          Жёлтым выделено <strong>{data.manualFields!.length}</strong> мест для ручного заполнения — они будут подсвечены в Word-файле.
        </Alert>
      )}
      <Box sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 2, border: "1px solid #d1c4e9", bgcolor: "#fff", fontSize: "0.9rem", lineHeight: 1.7, color: "#334155" }}>
        <Typography component="div" sx={{ whiteSpace: "pre-wrap", fontSize: "inherit", lineHeight: "inherit", color: "inherit" }}>
          {renderWithTokenHighlights(data.fullText)}
        </Typography>
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
  const [mainContractDate, setMainContractDate] = React.useState("");
  const [mainContractNumber, setMainContractNumber] = React.useState("");
  const [employerSignerName, setEmployerSignerName] = React.useState("");
  const [employerSignerPosition, setEmployerSignerPosition] = React.useState("");
  const [employerSignerAuthority, setEmployerSignerAuthority] = React.useState("");
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
      mainContractDate: mainContractDate.trim() || undefined,
      mainContractNumber: mainContractNumber.trim() || undefined,
      employerSignerName: employerSignerName.trim() || undefined,
      employerSignerPosition: employerSignerPosition.trim() || undefined,
      employerSignerAuthority: employerSignerAuthority.trim() || undefined,
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

        {/* Секция 1: Основное */}
        <Box sx={{ p: 2.5, borderRadius: 2, border: "1px solid #ede7f6", bgcolor: "#faf5ff", mb: 3 }}>
          <SectionHeader icon="mdi:account-edit-outline" title="Сотрудник и тип изменения" />
          <Box sx={grid2}>
            <FormField label="Тип изменения *">
              <FormControl fullWidth>
                <Select value={changeType} onChange={(e) => setChangeType(String(e.target.value))} displayEmpty sx={{ borderRadius: 2 }}>
                  <MenuItem value="">Выберите тип</MenuItem>
                  {CHANGE_TYPE_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </FormField>
            <FormField label="ФИО работника *">
              <TextField fullWidth value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} placeholder="Иванов Иван Иванович" sx={inputSx} />
            </FormField>
            <FormField label="Текущая должность">
              <TextField fullWidth value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Менеджер по продажам" sx={inputSx} />
            </FormField>
            <FormField label="Дата вступления в силу">
              <TextField fullWidth value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} placeholder="1 апреля 2026 г." sx={inputSx} />
            </FormField>
          </Box>
          <Box sx={{ mt: 3 }}>
            <FormField label="Текущие условия (до изменений)">
              <TextField fullWidth multiline rows={2} value={currentConditions} onChange={(e) => setCurrentConditions(e.target.value)} placeholder="Оклад 120 000 руб., офис 5/2..." sx={inputSx} />
            </FormField>
          </Box>
          <Box sx={{ mt: 2 }}>
            <FormField label="Новые условия *">
              <TextField fullWidth multiline rows={4} value={newConditions} onChange={(e) => setNewConditions(e.target.value)} placeholder="Оклад 150 000 руб. с 1 апреля 2026 г. / Удалённая работа / Новая должность: старший менеджер..." sx={inputSx} />
            </FormField>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Секция 2: Реквизиты */}
        <Box sx={{ p: 2.5, borderRadius: 2, border: "1px solid #e2e8f0", bgcolor: "#f8fafc", mb: 3 }}>
          <SectionHeader icon="mdi:office-building-outline" title="Реквизиты" subtitle="Необязательно — пустые поля будут выделены жёлтым в Word-файле" />
          <Box sx={grid2}>
            <FormField label="Название компании">
              <TextField fullWidth value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder='ООО «Компания»' sx={inputSx} />
            </FormField>
            <FormField label="№ основного трудового договора" helper="Напр.: 42/2023">
              <TextField fullWidth value={mainContractNumber} onChange={(e) => setMainContractNumber(e.target.value)} placeholder="42/2023" sx={inputSx} />
            </FormField>
            <FormField label="Дата основного договора">
              <TextField fullWidth value={mainContractDate} onChange={(e) => setMainContractDate(e.target.value)} placeholder="15 января 2023 г." sx={inputSx} />
            </FormField>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Секция 3: Подписант */}
        <Box sx={{ p: 2.5, borderRadius: 2, border: "1px solid #e2e8f0", bgcolor: "#f8fafc", mb: 3 }}>
          <SectionHeader icon="mdi:pen-lock" title="Подписант от работодателя" subtitle="Необязательно — пустые поля будут выделены жёлтым в Word-файле" />
          <Box sx={grid2}>
            <FormField label="ФИО подписанта">
              <TextField fullWidth value={employerSignerName} onChange={(e) => setEmployerSignerName(e.target.value)} placeholder="Петров Пётр Петрович" sx={inputSx} />
            </FormField>
            <FormField label="Должность подписанта">
              <TextField fullWidth value={employerSignerPosition} onChange={(e) => setEmployerSignerPosition(e.target.value)} placeholder="Генеральный директор" sx={inputSx} />
            </FormField>
            <FormField label="Основание полномочий">
              <TextField fullWidth value={employerSignerAuthority} onChange={(e) => setEmployerSignerAuthority(e.target.value)} placeholder="Устава" sx={inputSx} />
            </FormField>
          </Box>
        </Box>

        <HrToolConsent />
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={loading || !canSubmit}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Icon icon="mdi:auto-fix" />}
          sx={{
            mt: 1,
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
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>{error}</Alert>
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
                <Typography sx={{ fontSize: "0.95rem", color: "#334155", lineHeight: 1.7 }}>{renderWithTokenHighlights(data.preamble)}</Typography>
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
                    <Typography sx={{ fontSize: "0.93rem", color: "#334155", lineHeight: 1.6 }}>{renderWithTokenHighlights(clause)}</Typography>
                  </Box>
                ))}
              </Paper>
            )}
            {data.effectiveDate && (
              <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px solid #dbe6f3", bgcolor: "#fff" }}>
                <Typography sx={{ fontWeight: 700, color: "#1a1a2e", mb: 0.5 }}>Дата вступления в силу</Typography>
                <Typography sx={{ fontSize: "0.93rem", color: "#334155", lineHeight: 1.6 }}>{renderWithTokenHighlights(data.effectiveDate)}</Typography>
              </Paper>
            )}
            {data.signatures && (
              <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px solid #e0e0e0", bgcolor: "#fafafa" }}>
                <Typography sx={{ fontWeight: 700, color: "#1a1a2e", mb: 0.5 }}>Подписи сторон</Typography>
                <Typography sx={{ fontSize: "0.93rem", color: "#334155", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{renderWithTokenHighlights(data.signatures)}</Typography>
              </Paper>
            )}
            {data.disclaimer && (
              <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px solid #e0e0e0", bgcolor: "#fafafa" }}>
                <Typography sx={{ fontSize: "0.85rem", color: "#64748b", lineHeight: 1.6, fontStyle: "italic" }}>{data.disclaimer}</Typography>
              </Paper>
            )}
            <AgreementPreview data={data} />
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
