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
import { GphContractResponse, useGphContractGenerator } from "../hooks/useHrTool";

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

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
      <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: "#FFF3E0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon icon={icon} width={18} height={18} color="#E65100" />
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

function GphPreview({ data }: { data: GphContractResponse }) {
  const hasManual = (data.manualFields?.length ?? 0) > 0;
  return (
    <Paper elevation={0} sx={{ mt: 3, p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px dashed #ffcc80", bgcolor: "#fffbf7" }}>
      <Typography sx={{ fontWeight: 700, color: "#1a1a2e", mb: 1 }}>Готовый шаблон документа</Typography>
      {hasManual && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2, fontSize: "0.82rem" }}>
          Жёлтым выделено <strong>{data.manualFields!.length}</strong> мест для ручного заполнения — они будут подсвечены в Word-файле.
        </Alert>
      )}
      <Box sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 2, border: "1px solid #ffcc80", bgcolor: "#fff", fontSize: "0.9rem", lineHeight: 1.7, color: "#334155" }}>
        <Typography component="div" sx={{ whiteSpace: "pre-wrap", fontSize: "inherit", lineHeight: "inherit", color: "inherit" }}>
          {renderWithTokenHighlights(data.fullText)}
        </Typography>
      </Box>
    </Paper>
  );
}

export default function GphContractClient() {
  const [contractorType, setContractorType] = React.useState("");
  const [contractorName, setContractorName] = React.useState("");
  const [serviceDescription, setServiceDescription] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [deadline, setDeadline] = React.useState("");
  const [startDate, setStartDate] = React.useState("");
  const [companyName, setCompanyName] = React.useState("");
  const [companyAddress, setCompanyAddress] = React.useState("");
  const [companySignerName, setCompanySignerName] = React.useState("");
  const [companySignerPosition, setCompanySignerPosition] = React.useState("");
  const [paymentTerms, setPaymentTerms] = React.useState("");
  const [docxDownloaded, setDocxDownloaded] = React.useState(false);
  const [docxError, setDocxError] = React.useState("");
  const [downloadingDocx, setDownloadingDocx] = React.useState(false);

  const { data, loading, error, execute } = useGphContractGenerator();

  const canSubmit =
    !!contractorType &&
    contractorName.trim().length >= 2 &&
    serviceDescription.trim().length >= 10;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await execute({
      contractorType,
      contractorName: contractorName.trim(),
      serviceDescription: serviceDescription.trim(),
      amount: amount.trim() || undefined,
      deadline: deadline.trim() || undefined,
      startDate: startDate.trim() || undefined,
      companyName: companyName.trim() || undefined,
      companyAddress: companyAddress.trim() || undefined,
      companySignerName: companySignerName.trim() || undefined,
      companySignerPosition: companySignerPosition.trim() || undefined,
      paymentTerms: paymentTerms.trim() || undefined,
    });
  };

  const handleDownloadDocx = async () => {
    if (!data) return;
    setDownloadingDocx(true);
    setDocxError("");
    try {
      const response = await fetch(`${API_BASE}/api/public/hr-tools/export/gph-contract-docx`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Не удалось сформировать DOCX");
      const blob = await response.blob();
      downloadBlob(blob, `gph-contract-${new Date().toISOString().slice(0, 10)}.docx`);
      setDocxDownloaded(true);
    } catch {
      setDocxError("Не удалось скачать Word-файл. Попробуйте ещё раз.");
    } finally {
      setDownloadingDocx(false);
    }
  };

  return (
    <ToolLayout
      title="Договор ГПХ: образец и генератор"
      description="Создайте договор подряда или оказания услуг за минуту. Укажите тип исполнителя и условия."
      icon="mdi:handshake-outline"
      iconColor="#E65100"
      ctaLabel="Договор готов — что дальше?"
      ctaTitle="В SofiHR можно вести весь процесс найма"
      ctaDescription="От вакансии до договора: AI-интервью, оценка кандидатов, рейтинг и аналитика в одной системе."
      ctaButtonText="Попробовать SofiHR бесплатно →"
      ctaFeatures={[
        { icon: "mdi:file-document-edit-outline", text: "Создание вакансии" },
        { icon: "mdi:robot-outline", text: "AI-интервью" },
        { icon: "mdi:chart-line", text: "Рейтинг кандидатов" },
        { icon: "mdi:email-edit-outline", text: "Автоматические приглашения" },
      ]}
    >
      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, border: "1px solid #ffcc80", bgcolor: "#fff", mb: 4 }}>

        {/* Секция 1: Исполнитель */}
        <Box sx={{ p: 2.5, borderRadius: 2, border: "1px solid #fff3e0", bgcolor: "#fffbf7", mb: 3 }}>
          <SectionHeader icon="mdi:account-outline" title="Исполнитель" />
          <Box sx={grid2}>
            <FormField label="Тип исполнителя *">
              <FormControl fullWidth>
                <Select value={contractorType} onChange={(e) => setContractorType(String(e.target.value))} displayEmpty sx={{ borderRadius: 2 }}>
                  <MenuItem value="">Выберите тип</MenuItem>
                  <MenuItem value="individual">Физическое лицо</MenuItem>
                  <MenuItem value="self_employed">Самозанятый (НПД)</MenuItem>
                  <MenuItem value="sole_proprietor">Индивидуальный предприниматель</MenuItem>
                </Select>
              </FormControl>
            </FormField>
            <FormField label="ФИО или наименование ИП *">
              <TextField fullWidth value={contractorName} onChange={(e) => setContractorName(e.target.value)} placeholder="Иванов Иван Иванович / ИП Иванов И.И." sx={inputSx} />
            </FormField>
          </Box>
          <Box sx={{ mt: 3 }}>
            <FormField label="Описание работ или услуг *">
              <TextField fullWidth multiline rows={4} value={serviceDescription} onChange={(e) => setServiceDescription(e.target.value)} placeholder="Опишите объём работ: разработка сайта, консультационные услуги, дизайн логотипа..." sx={inputSx} />
            </FormField>
          </Box>
          <Box sx={{ mt: 3, ...grid2 }}>
            <FormField label="Сумма вознаграждения">
              <TextField fullWidth value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="100 000 руб." sx={inputSx} />
            </FormField>
            <FormField label="Порядок оплаты" helper="Напр.: по факту приёмки, поэтапно, 50% предоплата">
              <TextField fullWidth value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} placeholder="По факту подписания акта" sx={inputSx} />
            </FormField>
            <FormField label="Дата начала работ">
              <TextField fullWidth value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="1 апреля 2026 г." sx={inputSx} />
            </FormField>
            <FormField label="Срок выполнения">
              <TextField fullWidth value={deadline} onChange={(e) => setDeadline(e.target.value)} placeholder="30 календарных дней" sx={inputSx} />
            </FormField>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Секция 2: Заказчик */}
        <Box sx={{ p: 2.5, borderRadius: 2, border: "1px solid #e2e8f0", bgcolor: "#f8fafc", mb: 3 }}>
          <SectionHeader icon="mdi:office-building-outline" title="Заказчик" subtitle="Необязательно — пустые поля будут выделены жёлтым в Word-файле" />
          <Box sx={grid2}>
            <FormField label="Название компании-заказчика">
              <TextField fullWidth value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder='ООО «Заказчик»' sx={inputSx} />
            </FormField>
            <FormField label="Адрес заказчика">
              <TextField fullWidth value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} placeholder="г. Москва, ул. Примерная, д. 1" sx={inputSx} />
            </FormField>
            <FormField label="ФИО подписанта заказчика">
              <TextField fullWidth value={companySignerName} onChange={(e) => setCompanySignerName(e.target.value)} placeholder="Петров Пётр Петрович" sx={inputSx} />
            </FormField>
            <FormField label="Должность подписанта">
              <TextField fullWidth value={companySignerPosition} onChange={(e) => setCompanySignerPosition(e.target.value)} placeholder="Генеральный директор" sx={inputSx} />
            </FormField>
          </Box>
        </Box>

        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={loading || !canSubmit}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Icon icon="mdi:auto-fix" />}
          sx={{
            mt: 1,
            bgcolor: "#E65100",
            color: "#fff",
            textTransform: "none",
            fontWeight: 600,
            px: 4,
            py: 1.5,
            fontSize: "1rem",
            borderRadius: 2,
            "&:hover": { bgcolor: "#BF360C" },
            "&:disabled": { bgcolor: "#cbd5e1" },
          }}
        >
          {loading ? "Генерируем договор..." : "Сгенерировать договор"}
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
          downloadFilename="gph-contract.txt"
          onRegenerate={handleSubmit}
          regenerating={loading}
          onDownloadDocx={handleDownloadDocx}
          downloadingDocx={downloadingDocx}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {data.preamble && (
              <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px solid #ffcc80", bgcolor: "#fffbf7" }}>
                <Typography sx={{ fontWeight: 700, color: "#1a1a2e", mb: 1 }}>Преамбула</Typography>
                <Typography sx={{ fontSize: "0.95rem", color: "#334155", lineHeight: 1.7 }}>{renderWithTokenHighlights(data.preamble)}</Typography>
              </Paper>
            )}
            {data.sections?.length > 0 &&
              data.sections.map((section, i) => (
                <Paper key={i} elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px solid #dbe6f3", bgcolor: "#fff" }}>
                  <Typography sx={{ fontWeight: 700, color: "#1a1a2e", mb: 1.5 }}>
                    {section.number}. {section.title}
                  </Typography>
                  <Typography component="div" sx={{ fontSize: "0.93rem", color: "#334155", lineHeight: 1.7 }}>
                    {renderWithTokenHighlights(section.content)}
                  </Typography>
                </Paper>
              ))}
            {data.signatures && (
              <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px solid #e0e0e0", bgcolor: "#fafafa" }}>
                <Typography sx={{ fontWeight: 700, color: "#1a1a2e", mb: 1 }}>Подписи сторон</Typography>
                <Typography component="div" sx={{ fontSize: "0.93rem", color: "#334155", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                  {renderWithTokenHighlights(data.signatures)}
                </Typography>
              </Paper>
            )}
            {data.disclaimer && (
              <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px solid #e0e0e0", bgcolor: "#f5f5f5" }}>
                <Typography sx={{ fontSize: "0.85rem", color: "#64748b", lineHeight: 1.6 }}>{data.disclaimer}</Typography>
              </Paper>
            )}
            <GphPreview data={data} />
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
