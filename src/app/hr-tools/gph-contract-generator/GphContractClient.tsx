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
import { GphContractResponse, useGphContractGenerator } from "../hooks/useHrTool";

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

function TemplatePreview({ data }: { data: GphContractResponse }) {
  return (
    <Paper elevation={0} sx={{ mt: 3, p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px dashed #ffcc80", bgcolor: "#fffbf7" }}>
      <Typography sx={{ fontWeight: 700, color: "#1a1a2e", mb: 1 }}>Готовый шаблон документа</Typography>
      <Typography sx={{ fontSize: "0.87rem", color: "#64748b", mb: 2 }}>Этот шаблон уходит в Word-экспорт. Можно скачать и доработать.</Typography>
      <Box sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 2, border: "1px solid #ffcc80", bgcolor: "#fff", whiteSpace: "pre-wrap", fontSize: "0.9rem", lineHeight: 1.7, color: "#334155" }}>
        {data.fullText}
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
  const [companyName, setCompanyName] = React.useState("");
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
      companyName: companyName.trim() || undefined,
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
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a2e", mb: 1 }}>Тип исполнителя *</Typography>
            <FormControl fullWidth>
              <Select
                value={contractorType}
                onChange={(e) => setContractorType(String(e.target.value))}
                displayEmpty
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Выберите тип</MenuItem>
                <MenuItem value="individual">Физическое лицо</MenuItem>
                <MenuItem value="self_employed">Самозанятый (НПД)</MenuItem>
                <MenuItem value="sole_proprietor">Индивидуальный предприниматель</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a2e", mb: 1 }}>ФИО или наименование ИП *</Typography>
            <TextField
              fullWidth
              value={contractorName}
              onChange={(e) => setContractorName(e.target.value)}
              placeholder="ФИО или наименование ИП"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Box>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a2e", mb: 1 }}>Описание работ или услуг *</Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={serviceDescription}
            onChange={(e) => setServiceDescription(e.target.value)}
            placeholder="Опишите объём работ или услуг: разработка сайта, консультационные услуги, дизайн логотипа..."
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
        </Box>

        <Box sx={{ mt: 3, display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a2e", mb: 1 }}>Сумма вознаграждения</Typography>
            <TextField
              fullWidth
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="100 000 руб."
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a2e", mb: 1 }}>Срок исполнения</Typography>
            <TextField
              fullWidth
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              placeholder="30 календарных дней"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Box>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a2e", mb: 1 }}>Название компании-заказчика</Typography>
          <TextField
            fullWidth
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="ООО «Заказчик»"
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
                <Typography sx={{ fontSize: "0.95rem", color: "#334155", lineHeight: 1.7 }}>{data.preamble}</Typography>
              </Paper>
            )}
            {data.sections?.length > 0 &&
              data.sections.map((section, i) => (
                <Paper key={i} elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px solid #dbe6f3", bgcolor: "#fff" }}>
                  <Typography sx={{ fontWeight: 700, color: "#1a1a2e", mb: 1.5 }}>
                    {section.number}. {section.title}
                  </Typography>
                  <Typography sx={{ fontSize: "0.93rem", color: "#334155", lineHeight: 1.7 }}>{section.content}</Typography>
                </Paper>
              ))}
            {data.signatures && (
              <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px solid #e0e0e0", bgcolor: "#fafafa" }}>
                <Typography sx={{ fontWeight: 700, color: "#1a1a2e", mb: 1 }}>Подписи сторон</Typography>
                <Typography sx={{ fontSize: "0.93rem", color: "#334155", lineHeight: 1.7 }}>{data.signatures}</Typography>
              </Paper>
            )}
            {data.disclaimer && (
              <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px solid #e0e0e0", bgcolor: "#f5f5f5" }}>
                <Typography sx={{ fontSize: "0.85rem", color: "#64748b", lineHeight: 1.6 }}>{data.disclaimer}</Typography>
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
