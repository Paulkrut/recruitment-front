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
import { JobOrderResponse, useJobOrderGenerator } from "../hooks/useHrTool";

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

function TemplatePreview({ data }: { data: JobOrderResponse }) {
  return (
    <Paper elevation={0} sx={{ mt: 3, p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px dashed #a5d6a7", bgcolor: "#f1f8e9" }}>
      <Typography sx={{ fontWeight: 700, color: "#1a1a2e", mb: 1 }}>Готовый шаблон документа</Typography>
      <Typography sx={{ fontSize: "0.87rem", color: "#64748b", mb: 2 }}>
        Этот шаблон уходит в Word-экспорт. Можно скачать и доработать на фирменном бланке.
      </Typography>
      <Box
        sx={{
          p: { xs: 2, md: 2.5 },
          borderRadius: 2,
          border: "1px solid #c8e6c9",
          bgcolor: "#fff",
          whiteSpace: "pre-wrap",
          fontSize: "0.9rem",
          lineHeight: 1.7,
          color: "#334155",
        }}
      >
        {data.fullText}
      </Box>
    </Paper>
  );
}

export default function JobOrderClient() {
  const [employeeName, setEmployeeName] = React.useState("");
  const [position, setPosition] = React.useState("");
  const [department, setDepartment] = React.useState("");
  const [salary, setSalary] = React.useState("");
  const [startDate, setStartDate] = React.useState("");
  const [contractType, setContractType] = React.useState("");
  const [probation, setProbation] = React.useState("");
  const [workFormat, setWorkFormat] = React.useState("");
  const [companyName, setCompanyName] = React.useState("");
  const [docxDownloaded, setDocxDownloaded] = React.useState(false);
  const [docxError, setDocxError] = React.useState("");
  const [downloadingDocx, setDownloadingDocx] = React.useState(false);

  const { data, loading, error, execute } = useJobOrderGenerator();

  const canSubmit = employeeName.trim().length >= 2 && position.trim().length >= 2;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await execute({
      employeeName: employeeName.trim(),
      position: position.trim(),
      department: department.trim() || undefined,
      salary: salary.trim() || undefined,
      startDate: startDate.trim() || undefined,
      contractType: contractType || undefined,
      probation: probation || undefined,
      workFormat: workFormat || undefined,
      companyName: companyName.trim() || undefined,
    });
  };

  const handleDownloadDocx = async () => {
    if (!data) return;
    setDownloadingDocx(true);
    setDocxError("");
    try {
      const response = await fetch(`${API_BASE}/api/public/hr-tools/export/job-order-docx`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Не удалось сформировать DOCX");
      const blob = await response.blob();
      downloadBlob(blob, `prikaz-o-prieme-${position.trim().replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.docx`);
      setDocxDownloaded(true);
    } catch {
      setDocxError("Не удалось скачать Word-файл. Попробуйте ещё раз.");
    } finally {
      setDownloadingDocx(false);
    }
  };

  return (
    <ToolLayout
      title="Приказ о приёме на работу: образец и генератор"
      description="Создайте приказ о приёме (форма Т-1) за минуту."
      icon="mdi:clipboard-text-clock-outline"
      iconColor="#2E7D32"
      ctaLabel="Приказ готов — что дальше?"
      ctaTitle="В SofiHR можно вести весь процесс найма"
      ctaDescription="От вакансии до приказа о приёме: AI-интервью, оценка кандидатов, рейтинг и аналитика в одной системе."
      ctaButtonText="Попробовать SofiHR бесплатно →"
      ctaFeatures={[
        { icon: "mdi:file-document-edit-outline", text: "Создание вакансии" },
        { icon: "mdi:robot-outline", text: "AI-интервью" },
        { icon: "mdi:chart-line", text: "Рейтинг кандидатов" },
        { icon: "mdi:email-edit-outline", text: "Автоматические приглашения" },
      ]}
    >
      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, border: "1px solid #a5d6a7", bgcolor: "#fff", mb: 4 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a2e", mb: 1 }}>ФИО сотрудника *</Typography>
            <TextField fullWidth value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} placeholder="Иванов Иван Иванович" sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a2e", mb: 1 }}>Должность *</Typography>
            <TextField fullWidth value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Менеджер по продажам, Frontend-разработчик..." sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a2e", mb: 1 }}>Структурное подразделение</Typography>
            <TextField fullWidth value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Отдел продаж, IT-департамент" sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a2e", mb: 1 }}>Оклад / ЗП</Typography>
            <TextField fullWidth value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="150 000 руб. gross" sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a2e", mb: 1 }}>Дата начала работы</Typography>
            <TextField fullWidth value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="1 апреля 2026 г." sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a2e", mb: 1 }}>Вид работы</Typography>
            <FormControl fullWidth>
              <Select value={contractType} onChange={(e) => setContractType(String(e.target.value))} displayEmpty sx={{ borderRadius: 2 }}>
                <MenuItem value="">Не указывать</MenuItem>
                <MenuItem value="main">Основная работа</MenuItem>
                <MenuItem value="part_time">Совместительство</MenuItem>
              </Select>
            </FormControl>
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
          <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a2e", mb: 1 }}>Название компании</Typography>
          <TextField fullWidth value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder='ООО «Компания»' sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
        </Box>

        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={loading || !canSubmit}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Icon icon="mdi:auto-fix" />}
          sx={{
            mt: 4,
            bgcolor: "#2E7D32",
            color: "#fff",
            textTransform: "none",
            fontWeight: 600,
            px: 4,
            py: 1.5,
            fontSize: "1rem",
            borderRadius: 2,
            "&:hover": { bgcolor: "#1B5E20" },
            "&:disabled": { bgcolor: "#cbd5e1" },
          }}
        >
          {loading ? "Генерируем приказ..." : "Сгенерировать приказ"}
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
          downloadFilename="prikaz-o-prieme.txt"
          onRegenerate={handleSubmit}
          regenerating={loading}
          onDownloadDocx={handleDownloadDocx}
          downloadingDocx={downloadingDocx}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {data.companyName && (
              <Typography sx={{ fontSize: "1rem", fontWeight: 600, color: "#64748b", textAlign: "center" }}>
                {data.companyName}
              </Typography>
            )}
            <Typography sx={{ fontSize: "1.2rem", fontWeight: 700, color: "#1a1a2e", textAlign: "center", mb: 1 }}>
              {data.title}
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center", mb: 2 }}>
              <Typography sx={{ fontSize: "0.9rem", color: "#334155" }}>
                № {data.orderNumber} от {data.orderDate}
              </Typography>
            </Box>

            <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px solid #c8e6c9", bgcolor: "#fff" }}>
              <Typography sx={{ fontSize: "0.95rem", color: "#334155", lineHeight: 1.7 }}>{data.orderBody}</Typography>
            </Paper>

            {data.conditions?.length > 0 && (
              <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px solid #dbe6f3", bgcolor: "#fff" }}>
                <Typography sx={{ fontWeight: 700, color: "#1a1a2e", mb: 1.5 }}>Условия</Typography>
                {data.conditions.map((c, i) => (
                  <Box key={i} sx={{ display: "flex", gap: 1, mb: 0.8 }}>
                    <Typography sx={{ color: "#2E7D32", fontWeight: 700 }}>
                      •
                    </Typography>
                    <Typography sx={{ fontSize: "0.93rem", color: "#334155", lineHeight: 1.6 }}>{c}</Typography>
                  </Box>
                ))}
              </Paper>
            )}

            {data.basis && (
              <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px solid #e0e0e0", bgcolor: "#fafafa" }}>
                <Typography sx={{ fontSize: "0.93rem", color: "#334155", lineHeight: 1.7, fontStyle: "italic" }}>
                  {data.basis}
                </Typography>
              </Paper>
            )}

            {data.signatures && (
              <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px solid #e0e0e0", bgcolor: "#fafafa" }}>
                <Typography sx={{ fontSize: "0.93rem", color: "#334155", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                  {data.signatures}
                </Typography>
              </Paper>
            )}

            {data.disclaimer && (
              <Typography sx={{ fontSize: "0.8rem", color: "#94a3b8", lineHeight: 1.6, mt: 1 }}>
                {data.disclaimer}
              </Typography>
            )}

            <TemplatePreview data={data} />
          </Box>
        </ResultDisplay>
      )}

      <Snackbar open={docxDownloaded} autoHideDuration={2500} onClose={() => setDocxDownloaded(false)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity="success" sx={{ width: "100%" }}>
          Word-файл скачан
        </Alert>
      </Snackbar>
      <Snackbar open={!!docxError} autoHideDuration={3500} onClose={() => setDocxError("")} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity="error" sx={{ width: "100%" }}>
          {docxError}
        </Alert>
      </Snackbar>
    </ToolLayout>
  );
}
