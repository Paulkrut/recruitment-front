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
import {
  EmploymentContractResponse,
  useEmploymentContractGenerator,
} from "../hooks/useHrTool";

const API_BASE =
  process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

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

function TemplatePreview({ data }: { data: EmploymentContractResponse }) {
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
        Этот шаблон уходит в Word-экспорт. Можно скачать и доработать на
        фирменном бланке.
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

export default function EmploymentContractClient() {
  const [employeeName, setEmployeeName] = React.useState("");
  const [position, setPosition] = React.useState("");
  const [salary, setSalary] = React.useState("");
  const [contractType, setContractType] = React.useState("");
  const [workFormat, setWorkFormat] = React.useState("");
  const [schedule, setSchedule] = React.useState("");
  const [probation, setProbation] = React.useState("");
  const [startDate, setStartDate] = React.useState("");
  const [companyName, setCompanyName] = React.useState("");
  const [companyAddress, setCompanyAddress] = React.useState("");
  const [docxDownloaded, setDocxDownloaded] = React.useState(false);
  const [docxError, setDocxError] = React.useState("");
  const [downloadingDocx, setDownloadingDocx] = React.useState(false);

  const { data, loading, error, execute } = useEmploymentContractGenerator();

  const canSubmit =
    employeeName.trim().length >= 2 &&
    position.trim().length >= 2 &&
    salary.trim().length >= 1;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await execute({
      employeeName: employeeName.trim(),
      position: position.trim(),
      salary: salary.trim(),
      contractType: contractType || undefined,
      workFormat: workFormat || undefined,
      schedule: schedule || undefined,
      probation: probation || undefined,
      startDate: startDate.trim() || undefined,
      companyName: companyName.trim() || undefined,
      companyAddress: companyAddress.trim() || undefined,
    });
  };

  const handleDownloadDocx = async () => {
    if (!data) return;
    setDownloadingDocx(true);
    setDocxError("");
    try {
      const response = await fetch(
        `${API_BASE}/api/public/hr-tools/export/employment-contract-docx`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) throw new Error("Не удалось сформировать DOCX");
      const blob = await response.blob();
      downloadBlob(
        blob,
        `trudovoy-dogovor-${position.trim().replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.docx`
      );
      setDocxDownloaded(true);
    } catch {
      setDocxError("Не удалось скачать Word-файл. Попробуйте ещё раз.");
    } finally {
      setDownloadingDocx(false);
    }
  };

  return (
    <ToolLayout
      title="Трудовой договор: образец и AI-генератор"
      description="Создайте трудовой договор по ТК РФ за минуту. Бессрочный, срочный, удалёнка, испытательный срок — всё по шаблону."
      icon="mdi:file-sign"
      iconColor="#1565C0"
      ctaLabel="Договор готов — что дальше?"
      ctaTitle="В SofiHR можно вести весь процесс найма"
      ctaDescription="От вакансии до трудового договора: AI-интервью, оценка кандидатов, рейтинг и аналитика в одной системе."
      ctaButtonText="Попробовать SofiHR бесплатно →"
      ctaFeatures={[
        { icon: "mdi:file-document-edit-outline", text: "Создание вакансии" },
        { icon: "mdi:robot-outline", text: "AI-интервью" },
        { icon: "mdi:chart-line", text: "Рейтинг кандидатов" },
        { icon: "mdi:email-edit-outline", text: "Автоматические приглашения" },
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
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 3,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "0.9rem",
                color: "#1a1a2e",
                mb: 1,
              }}
            >
              ФИО работника *
            </Typography>
            <TextField
              fullWidth
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              placeholder="Иванов Иван Иванович"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Box>
          <Box>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "0.9rem",
                color: "#1a1a2e",
                mb: 1,
              }}
            >
              Должность *
            </Typography>
            <TextField
              fullWidth
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Менеджер по продажам, Frontend-разработчик..."
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Box>
          <Box>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "0.9rem",
                color: "#1a1a2e",
                mb: 1,
              }}
            >
              Оклад / ЗП *
            </Typography>
            <TextField
              fullWidth
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="150 000 руб. gross"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Box>
          <Box>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "0.9rem",
                color: "#1a1a2e",
                mb: 1,
              }}
            >
              Вид договора
            </Typography>
            <FormControl fullWidth>
              <Select
                value={contractType}
                onChange={(e) => setContractType(String(e.target.value))}
                displayEmpty
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Не указывать</MenuItem>
                <MenuItem value="permanent">Бессрочный</MenuItem>
                <MenuItem value="fixed">Срочный</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "0.9rem",
                color: "#1a1a2e",
                mb: 1,
              }}
            >
              Формат работы
            </Typography>
            <FormControl fullWidth>
              <Select
                value={workFormat}
                onChange={(e) => setWorkFormat(String(e.target.value))}
                displayEmpty
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Не указывать</MenuItem>
                <MenuItem value="office">Офис</MenuItem>
                <MenuItem value="remote">Дистанционная работа</MenuItem>
                <MenuItem value="hybrid">Гибридный</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "0.9rem",
                color: "#1a1a2e",
                mb: 1,
              }}
            >
              График работы
            </Typography>
            <FormControl fullWidth>
              <Select
                value={schedule}
                onChange={(e) => setSchedule(String(e.target.value))}
                displayEmpty
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Не указывать</MenuItem>
                <MenuItem value="5_2">5/2 пн-пт</MenuItem>
                <MenuItem value="shift">Сменный</MenuItem>
                <MenuItem value="flexible">Свободный</MenuItem>
                <MenuItem value="part_time">Неполный рабочий день</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "0.9rem",
                color: "#1a1a2e",
                mb: 1,
              }}
            >
              Испытательный срок
            </Typography>
            <FormControl fullWidth>
              <Select
                value={probation}
                onChange={(e) => setProbation(String(e.target.value))}
                displayEmpty
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Не указывать</MenuItem>
                <MenuItem value="none">Без испытательного срока</MenuItem>
                <MenuItem value="1">1 месяц</MenuItem>
                <MenuItem value="2">2 месяца</MenuItem>
                <MenuItem value="3">3 месяца</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "0.9rem",
                color: "#1a1a2e",
                mb: 1,
              }}
            >
              Дата начала работы
            </Typography>
            <TextField
              fullWidth
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="1 апреля 2026 г."
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Box>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "0.9rem",
              color: "#1a1a2e",
              mb: 1,
            }}
          >
            Название компании
          </Typography>
          <TextField
            fullWidth
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="ООО «Компания»"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "0.9rem",
              color: "#1a1a2e",
              mb: 1,
            }}
          >
            Юридический адрес компании
          </Typography>
          <TextField
            fullWidth
            value={companyAddress}
            onChange={(e) => setCompanyAddress(e.target.value)}
            placeholder="г. Москва, ул. Примерная, д. 1"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
        </Box>

        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={loading || !canSubmit}
          startIcon={
            loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <Icon icon="mdi:auto-fix" />
            )
          }
          sx={{
            mt: 4,
            bgcolor: "#1565C0",
            color: "#fff",
            textTransform: "none",
            fontWeight: 600,
            px: 4,
            py: 1.5,
            fontSize: "1rem",
            borderRadius: 2,
            "&:hover": { bgcolor: "#0D47A1" },
            "&:disabled": { bgcolor: "#cbd5e1" },
          }}
        >
          {loading
            ? "Генерируем трудовой договор..."
            : "Сгенерировать трудовой договор"}
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
          downloadFilename="trudovoy-dogovor.txt"
          onRegenerate={handleSubmit}
          regenerating={loading}
          onDownloadDocx={handleDownloadDocx}
          downloadingDocx={downloadingDocx}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {data.preamble && (
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, md: 3 },
                  borderRadius: 3,
                  border: "1px solid #b7e4dd",
                  bgcolor: "#eefbf8",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.95rem",
                    color: "#334155",
                    lineHeight: 1.7,
                  }}
                >
                  {data.preamble}
                </Typography>
              </Paper>
            )}
            {data.sections?.map((section, i) => (
              <Paper
                key={i}
                elevation={0}
                sx={{
                  p: { xs: 2.5, md: 3 },
                  borderRadius: 3,
                  border: "1px solid #dbe6f3",
                  bgcolor: "#fff",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: "#1a1a2e",
                    mb: 1.5,
                    fontSize: "1rem",
                  }}
                >
                  {section.number}. {section.title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.93rem",
                    color: "#334155",
                    lineHeight: 1.7,
                  }}
                >
                  {section.content}
                </Typography>
              </Paper>
            ))}
            {data.signatures && (
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, md: 3 },
                  borderRadius: 3,
                  border: "1px solid #e0e0e0",
                  bgcolor: "#fafafa",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.93rem",
                    color: "#334155",
                    lineHeight: 1.7,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {data.signatures}
                </Typography>
              </Paper>
            )}
            {data.disclaimer && (
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, md: 3 },
                  borderRadius: 3,
                  border: "1px solid #fff3e0",
                  bgcolor: "#fff8e1",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.85rem",
                    color: "#64748b",
                    lineHeight: 1.6,
                    fontStyle: "italic",
                  }}
                >
                  {data.disclaimer}
                </Typography>
              </Paper>
            )}
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
