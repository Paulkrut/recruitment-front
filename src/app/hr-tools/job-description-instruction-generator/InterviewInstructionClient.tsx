"use client";

import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
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
import Link from "next/link";
import ToolLayout from "../components/ToolLayout";
import ResultDisplay from "../components/ResultDisplay";
import HrToolConsent from "../components/HrToolConsent";
import {
  JobInstructionResponse,
  useJobInstructionGenerator,
} from "../hooks/useHrTool";

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

const levels = [
  { id: "junior", label: "Junior" },
  { id: "middle", label: "Middle" },
  { id: "senior", label: "Senior" },
  { id: "lead", label: "Lead / Руководитель" },
];

const sectionMeta = [
  { key: "responsibilities", title: "Основные обязанности", icon: "mdi:briefcase-check-outline", color: "#1565C0", bg: "#E3F2FD" },
  { key: "functions", title: "Функциональные задачи", icon: "mdi:format-list-bulleted-square", color: "#6A1B9A", bg: "#F3E5F5" },
  { key: "rights", title: "Права сотрудника", icon: "mdi:shield-account-outline", color: "#2E7D32", bg: "#E8F5E9" },
  { key: "responsibilityAreas", title: "Зоны ответственности", icon: "mdi:alert-circle-outline", color: "#E65100", bg: "#FFF3E0" },
  { key: "requirements", title: "Требования к квалификации", icon: "mdi:school-outline", color: "#00838F", bg: "#E0F7FA" },
  { key: "kpis", title: "KPI и показатели результата", icon: "mdi:chart-line", color: "#AD1457", bg: "#FCE4EC" },
  { key: "interactions", title: "Взаимодействие с другими ролями и отделами", icon: "mdi:account-group-outline", color: "#455A64", bg: "#ECEFF1" },
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

function getDownloadFilename(title: string) {
  const safeTitle = title
    .toLowerCase()
    .replace(/[^a-zа-я0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);

  return `job-instruction-${safeTitle || "document"}-${new Date().toISOString().slice(0, 10)}.docx`;
}

function renderItems(items: string[]) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
      {items.map((item, index) => (
        <Box
          key={`${item}-${index}`}
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 1.25,
            p: 1.5,
            borderRadius: 2,
            border: "1px solid #e3e8ef",
            bgcolor: "#fff",
          }}
        >
          <Box
            sx={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              bgcolor: "#f0f7ff",
              color: "#1976d2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.78rem",
              fontWeight: 700,
              flexShrink: 0,
              mt: 0.1,
            }}
          >
            {index + 1}
          </Box>
          <Typography sx={{ fontSize: "0.93rem", color: "#334155", lineHeight: 1.6 }}>
            {item}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

function TemplatePreview({ data }: { data: JobInstructionResponse }) {
  return (
    <Paper
      elevation={0}
      sx={{
        mt: 3,
        p: { xs: 2.5, md: 3 },
        borderRadius: 3,
        border: "1px dashed #b8cfe8",
        bgcolor: "#fafcff",
      }}
    >
      <Typography sx={{ fontWeight: 700, color: "#1a1a2e", mb: 1 }}>
        Готовый шаблон документа
      </Typography>
      <Typography sx={{ fontSize: "0.87rem", color: "#64748b", mb: 2 }}>
        Этот же шаблон уходит в Word-экспорт, поэтому можно быстро скачать и доработать документ уже внутри компании.
      </Typography>
      <Box
        sx={{
          p: { xs: 2, md: 2.5 },
          borderRadius: 2,
          border: "1px solid #dbe6f3",
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

export default function InterviewInstructionClient() {
  const [position, setPosition] = React.useState("");
  const [level, setLevel] = React.useState("middle");
  const [department, setDepartment] = React.useState("");
  const [reportsTo, setReportsTo] = React.useState("");
  const [mainTasks, setMainTasks] = React.useState("");
  const [requirements, setRequirements] = React.useState("");
  const [companyContext, setCompanyContext] = React.useState("");
  const [docxDownloaded, setDocxDownloaded] = React.useState(false);
  const [docxError, setDocxError] = React.useState("");
  const [downloadingDocx, setDownloadingDocx] = React.useState(false);

  const { data, loading, error, execute } = useJobInstructionGenerator();

  const canSubmit = position.trim().length >= 2;

  const requestPayload = React.useMemo(
    () => ({
      position: position.trim(),
      level,
      department: department.trim() || undefined,
      reportsTo: reportsTo.trim() || undefined,
      mainTasks: mainTasks.trim() || undefined,
      requirements: requirements.trim() || undefined,
      companyContext: companyContext.trim() || undefined,
    }),
    [companyContext, department, level, mainTasks, position, reportsTo, requirements]
  );

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await execute(requestPayload);
  };

  const handleDownloadDocx = async () => {
    if (!data) return;

    setDownloadingDocx(true);
    setDocxError("");

    try {
      const response = await fetch(`${API_BASE}/api/public/hr-tools/export/job-instruction-docx`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Не удалось сформировать DOCX");
      }

      const blob = await response.blob();
      downloadBlob(blob, getDownloadFilename(data.title));
      setDocxDownloaded(true);
    } catch (downloadError) {
      console.error("DOCX download failed:", downloadError);
      setDocxError("Не удалось скачать Word-файл. Попробуйте ещё раз.");
    } finally {
      setDownloadingDocx(false);
    }
  };

  return (
    <ToolLayout
      title="Должностная инструкция: шаблон и генератор"
      description="Соберите основу должностной инструкции за несколько минут: обязанности, права, ответственность, требования и KPI под конкретную роль."
      icon="mdi:file-document-multiple-outline"
      iconColor="#0D9488"
      ctaLabel="Нужно превратить документ в реальный найм?"
      ctaTitle="SofiHR помогает перейти от инструкции к вакансии и интервью"
      ctaDescription="На основе роли можно сразу создать вакансию, вопросы для интервью и структурированный процесс оценки кандидатов. Всё в одной системе."
      ctaButtonText="Запустить найм в SofiHR →"
      ctaFeatures={[
        { icon: "mdi:file-document-edit-outline", text: "Вакансия по той же роли" },
        { icon: "mdi:chat-question-outline", text: "Вопросы для интервью" },
        { icon: "mdi:clipboard-check-multiple-outline", text: "Scorecard и критерии" },
        { icon: "mdi:robot-outline", text: "Автоматизированное интервью" },
      ]}
    >
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
        <Box
          sx={{
            mb: 3,
            p: { xs: 2, md: 2.5 },
            borderRadius: 3,
            border: "1px solid #d7eee9",
            bgcolor: "#f4fbf9",
            display: "flex",
            alignItems: "flex-start",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: "#0D9488",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon icon="mdi:lightbulb-on-outline" width={20} height={20} color="#fff" />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#1a1a2e", mb: 0.6 }}>
              Поля ниже нужны как ориентиры для системы
            </Typography>
            <Typography sx={{ fontSize: "0.88rem", color: "#52606d", lineHeight: 1.6 }}>
              Не нужно заранее писать полную должностную инструкцию. Достаточно коротко описать роль,
              задачи и контекст, а система сама соберёт структурированный документ и предложит формулировки.
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.1fr 0.9fr" }, gap: 3 }}>
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a2e", mb: 1 }}>
              Должность *
            </Typography>
            <TextField
              fullWidth
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Например: Менеджер по продажам, HR BP, Frontend-разработчик"
              helperText="Достаточно названия роли. Остальную структуру система достроит сама."
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Box>

          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a2e", mb: 1 }}>
              Уровень роли
            </Typography>
            <FormControl fullWidth>
              <Select value={level} onChange={(e) => setLevel(String(e.target.value))} sx={{ borderRadius: 2 }}>
                {levels.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a2e", mb: 1 }}>
              Подразделение, если хотите уточнить
            </Typography>
            <TextField
              fullWidth
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Например: Отдел продаж, HR, Продуктовая команда"
              helperText="Опционально. Помогает системе точнее выбрать обязанности и взаимодействия."
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Box>

          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a2e", mb: 1 }}>
              Кому подчиняется, если важно
            </Typography>
            <TextField
              fullWidth
              value={reportsTo}
              onChange={(e) => setReportsTo(e.target.value)}
              placeholder="Например: Руководителю отдела продаж"
              helperText="Опционально. Нужен как ориентир по уровню самостоятельности и месту роли в структуре."
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Box>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a2e", mb: 1 }}>
            Основные задачи и зона работы, если хотите направить систему
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={mainTasks}
            onChange={(e) => setMainTasks(e.target.value)}
            placeholder="Какие задачи выполняет сотрудник: продажи, подбор, ведение клиентов, аналитика, разработка, запуск проектов..."
            helperText="Необязательно писать всё подробно. Достаточно 3-5 ориентиров или даже короткого списка через запятую."
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a2e", mb: 1 }}>
            Ключевые требования, если есть
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="Опыт, инструменты, навыки, знание процессов, коммуникация, управление людьми и т.д."
            helperText="Это не готовый раздел документа, а подсказка для системы, какие ожидания учесть."
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a2e", mb: 1 }}>
            Контекст компании или роли, если нужен
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={companyContext}
            onChange={(e) => setCompanyContext(e.target.value)}
            placeholder="B2B/SaaS, производство, агентство, быстрорастущая команда, региональная сеть и т.п."
            helperText="Например: отрасль, формат работы, тип клиентов или специфика команды. Это влияет на формулировки системы."
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
        </Box>

        <Box sx={{ mt: 3, display: "flex", flexWrap: "wrap", gap: 1 }}>
          <Chip label="Обязанности" sx={{ bgcolor: "#E3F2FD", color: "#1565C0", fontWeight: 600 }} />
          <Chip label="Права" sx={{ bgcolor: "#E8F5E9", color: "#2E7D32", fontWeight: 600 }} />
          <Chip label="Ответственность" sx={{ bgcolor: "#FFF3E0", color: "#E65100", fontWeight: 600 }} />
          <Chip label="KPI" sx={{ bgcolor: "#FCE4EC", color: "#AD1457", fontWeight: 600 }} />
          <Chip label="Word-шаблон" sx={{ bgcolor: "#E0F2F1", color: "#0D9488", fontWeight: 600 }} />
        </Box>

        <HrToolConsent />
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={loading || !canSubmit}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Icon icon="mdi:auto-fix" />}
          sx={{
            mt: 4,
            bgcolor: "#0D9488",
            color: "#fff",
            textTransform: "none",
            fontWeight: 600,
            px: 4,
            py: 1.5,
            fontSize: "1rem",
            borderRadius: 2,
            "&:hover": { bgcolor: "#0F766E" },
            "&:disabled": { bgcolor: "#cbd5e1" },
          }}
        >
          {loading ? "Генерируем документ..." : "Сгенерировать должностную инструкцию"}
        </Button>
      </Paper>

      <Collapse in={!!error}>
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          {error}
        </Alert>
      </Collapse>

      {!!data && (
        <Box
          sx={{
            mb: 2,
            p: { xs: 2.5, md: 3 },
            borderRadius: 3,
            border: "1px solid #b7e4dd",
            bgcolor: "#eefbf8",
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, flex: 1 }}>
            <Box
              sx={{
                mt: 0.25,
                width: 36,
                height: 36,
                borderRadius: 2,
                bgcolor: "#0D9488",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon icon="mdi:file-word-outline" width={20} height={20} color="#fff" />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#1a1a2e", lineHeight: 1.3 }}>
                Документ готов, можно перейти к найму
              </Typography>
              <Typography sx={{ fontSize: "0.84rem", color: "#52606d", mt: 0.4, lineHeight: 1.5 }}>
                На основе этой инструкции можно быстро сделать вакансию, вопросы для интервью и системный процесс оценки кандидатов.
              </Typography>
            </Box>
          </Box>
          <Button
            component={Link}
            href="/auth/register"
            variant="contained"
            size="small"
            sx={{
              bgcolor: "#0D9488",
              color: "#fff",
              textTransform: "none",
              fontWeight: 600,
              px: 2.5,
              py: 1,
              borderRadius: 2,
              alignSelf: { xs: "stretch", sm: "auto" },
              "&:hover": { bgcolor: "#0F766E" },
            }}
          >
            Перейти к вакансии и интервью →
          </Button>
        </Box>
      )}

      {data && (
        <ResultDisplay
          title={data.title}
          copyText={data.fullText}
          downloadText={data.fullText}
          downloadFilename="job-instruction-template.txt"
          onRegenerate={handleSubmit}
          regenerating={loading}
          onDownloadDocx={handleDownloadDocx}
          downloadingDocx={downloadingDocx}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: 3,
                border: "1px solid #dbe6f3",
                bgcolor: "#f8fbff",
              }}
            >
              <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: "#64748b", mb: 1 }}>
                Кратко о документе
              </Typography>
              <Typography sx={{ fontSize: "1.02rem", fontWeight: 700, color: "#1a1a2e", mb: 1.5 }}>
                {data.purpose}
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {data.department ? (
                  <Chip icon={<Icon icon="mdi:office-building-outline" />} label={`Подразделение: ${data.department}`} sx={{ bgcolor: "#fff", border: "1px solid #dbe6f3" }} />
                ) : null}
                {data.reportsTo ? (
                  <Chip icon={<Icon icon="mdi:account-tie-outline" />} label={`Подчиняется: ${data.reportsTo}`} sx={{ bgcolor: "#fff", border: "1px solid #dbe6f3" }} />
                ) : null}
              </Box>
              <Typography sx={{ mt: 2, fontSize: "0.9rem", lineHeight: 1.6, color: "#475569" }}>
                {data.summary}
              </Typography>
            </Paper>

            {sectionMeta.map((section) => {
              const items = data[section.key];
              if (!items?.length) return null;

              return (
                <Paper
                  key={section.key}
                  elevation={0}
                  sx={{
                    p: { xs: 2.5, md: 3 },
                    borderRadius: 3,
                    border: "1px solid #dbe6f3",
                    bgcolor: "#fff",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: section.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon icon={section.icon} width={22} height={22} color={section.color} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#1a1a2e" }}>
                        {section.title}
                      </Typography>
                      <Typography sx={{ fontSize: "0.84rem", color: "#64748b" }}>
                        {items.length} пункт{items.length === 1 ? "" : items.length < 5 ? "а" : "ов"}
                      </Typography>
                    </Box>
                  </Box>
                  {renderItems(items)}
                </Paper>
              );
            })}

            <TemplatePreview data={data} />
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
