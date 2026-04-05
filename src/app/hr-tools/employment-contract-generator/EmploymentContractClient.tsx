"use client";

import * as React from "react";
import {
  Alert, Box, Button, CircularProgress, Collapse,
  Divider, FormControl, MenuItem, Paper, Select, Snackbar,
  TextField, Typography,
} from "@mui/material";
import { Icon } from "@iconify/react";
import ToolLayout from "../components/ToolLayout";
import ResultDisplay from "../components/ResultDisplay";
import HrToolConsent from "../components/HrToolConsent";
import { EmploymentContractResponse, useEmploymentContractGenerator } from "../hooks/useHrTool";

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

// -----------------------------------------------------------------------
// Утилита для рендера {{manual:X}} токенов с желтым выделением
// -----------------------------------------------------------------------
const MANUAL_LABELS: Record<string, string> = {
  contractNumber: "[№ договора]",
  contractDay: "[число]",
  employeePassport: "[серия, № паспорта]",
  employeePassportIssuedBy: "[кем выдан]",
  employeeRegistrationAddress: "[адрес регистрации]",
  employeeBirthDate: "[дата рождения]",
  employeeSnils: "[СНИЛС]",
  employeeInn: "[ИНН работника]",
  employerRepresentativeName: "[ФИО подписанта]",
  employerRepresentativePosition: "[должность подписанта]",
  employerRepresentativeAuthority: "[основание полномочий]",
  employerInn: "[ИНН работодателя]",
  employerOgrn: "[ОГРН]",
  employerKpp: "[КПП]",
  employerBankAccount: "[расчётный счёт]",
  employerBankName: "[банк]",
  employerKorrAccount: "[корр. счёт]",
  workplaceAddress: "[адрес рабочего места]",
  fixedTermReason: "[основание срочности]",
  fixedTermEndDate: "[дата окончания]",
};

function renderWithTokenHighlights(text: string): React.ReactNode {
  const parts = text.split(/(\{\{manual:[a-zA-Z]+\}\})/g);
  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/^\{\{manual:([a-zA-Z]+)\}\}$/);
        if (match) {
          const label = MANUAL_LABELS[match[1]] || `[${match[1]}]`;
          return (
            <mark key={i} style={{ backgroundColor: "#FFD700", padding: "1px 4px", borderRadius: "3px", fontWeight: 700, fontSize: "inherit" }}>
              {label}
            </mark>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

// -----------------------------------------------------------------------
// Компонент поля формы
// -----------------------------------------------------------------------
function FormField({ label, required, helper, children }: {
  label: string; required?: boolean; helper?: string; children: React.ReactNode;
}) {
  return (
    <Box>
      <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a2e", mb: 0.5 }}>
        {label}{required && <span style={{ color: "#e53e3e" }}> *</span>}
      </Typography>
      {children}
      {helper && <Typography sx={{ fontSize: "0.78rem", color: "#94a3b8", mt: 0.5 }}>{helper}</Typography>}
    </Box>
  );
}

// -----------------------------------------------------------------------
// Превью результата с подсветкой токенов
// -----------------------------------------------------------------------
function ContractPreview({ data }: { data: EmploymentContractResponse }) {
  const manualCount = data.manualFields?.length ?? 0;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {manualCount > 0 && (
        <Alert
          severity="warning"
          icon={<Icon icon="mdi:pencil-box-outline" />}
          sx={{ borderRadius: 2 }}
        >
          В документе <strong>{manualCount} мест</strong> для ручного заполнения — выделены жёлтым. Заполните их перед подписанием.
        </Alert>
      )}

      {data.preamble && (
        <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px solid #b7e4dd", bgcolor: "#eefbf8" }}>
          <Typography sx={{ fontSize: "0.95rem", color: "#334155", lineHeight: 1.75 }}>
            {renderWithTokenHighlights(data.preamble)}
          </Typography>
        </Paper>
      )}

      {data.sections?.map((section, i) => (
        <Paper key={i} elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px solid #dbe6f3", bgcolor: "#fff" }}>
          <Typography sx={{ fontWeight: 700, color: "#1a1a2e", mb: 1.5, fontSize: "1rem" }}>
            {section.number}. {section.title}
          </Typography>
          <Typography sx={{ fontSize: "0.93rem", color: "#334155", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>
            {renderWithTokenHighlights(section.content)}
          </Typography>
        </Paper>
      ))}

      {data.signatures && (
        <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px solid #e0e0e0", bgcolor: "#fafafa" }}>
          <Typography sx={{ fontSize: "0.93rem", color: "#334155", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>
            {renderWithTokenHighlights(data.signatures)}
          </Typography>
        </Paper>
      )}

      {data.disclaimer && (
        <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid #fff3e0", bgcolor: "#fff8e1" }}>
          <Typography sx={{ fontSize: "0.82rem", color: "#64748b", fontStyle: "italic" }}>
            {data.disclaimer}
          </Typography>
        </Paper>
      )}
    </Box>
  );
}

// -----------------------------------------------------------------------
// Заголовок секции формы
// -----------------------------------------------------------------------
function SectionHeader({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 2.5 }}>
      <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "#e3f2fd", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, mt: 0.25 }}>
        <Icon icon={icon} width={20} height={20} color="#1565C0" />
      </Box>
      <Box>
        <Typography sx={{ fontWeight: 700, color: "#1a1a2e", fontSize: "1rem" }}>{title}</Typography>
        {subtitle && <Typography sx={{ fontSize: "0.83rem", color: "#64748b", mt: 0.25 }}>{subtitle}</Typography>}
      </Box>
    </Box>
  );
}

// -----------------------------------------------------------------------
// Основной компонент
// -----------------------------------------------------------------------
export default function EmploymentContractClient() {
  // AI поля
  const [employeeName, setEmployeeName] = React.useState("");
  const [position, setPosition] = React.useState("");
  const [salary, setSalary] = React.useState("");
  const [startDate, setStartDate] = React.useState("");
  const [probation, setProbation] = React.useState("");
  const [contractType, setContractType] = React.useState("");
  const [workFormat, setWorkFormat] = React.useState("");
  const [schedule, setSchedule] = React.useState("");
  const [workingHours, setWorkingHours] = React.useState("9:00–18:00");
  const [salaryPaymentDays, setSalaryPaymentDays] = React.useState("15-го и 30-го числа");
  const [companyName, setCompanyName] = React.useState("");
  const [companyAddress, setCompanyAddress] = React.useState("");
  const [department, setDepartment] = React.useState("");
  const [workplaceAddress, setWorkplaceAddress] = React.useState("");
  const [employerSignerName, setEmployerSignerName] = React.useState("");
  const [employerSignerPosition, setEmployerSignerPosition] = React.useState("");
  const [employerSignerAuthority, setEmployerSignerAuthority] = React.useState("Устав");
  // Условные поля — fixed
  const [fixedTermReason, setFixedTermReason] = React.useState("");
  const [fixedTermEndDate, setFixedTermEndDate] = React.useState("");
  // Условные поля — remote/hybrid
  const [equipmentProvision, setEquipmentProvision] = React.useState("");
  const [remoteCompensation, setRemoteCompensation] = React.useState("");
  // Условные поля — hybrid
  const [officeDays, setOfficeDays] = React.useState("");
  const [officeLocation, setOfficeLocation] = React.useState("");

  const [docxError, setDocxError] = React.useState("");
  const [docxDownloaded, setDocxDownloaded] = React.useState(false);
  const [downloadingDocx, setDownloadingDocx] = React.useState(false);

  const { data, loading, error, execute } = useEmploymentContractGenerator();

  const isFixed = contractType === "fixed";
  const isRemote = workFormat === "remote";
  const isHybrid = workFormat === "hybrid";
  const showWorkplace = workFormat === "office" || workFormat === "hybrid";

  const canSubmit = employeeName.trim().length >= 2 && position.trim().length >= 2 && salary.trim().length >= 1;

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
      department: department.trim() || undefined,
      workplaceAddress: workplaceAddress.trim() || undefined,
      salaryPaymentDays: salaryPaymentDays.trim() || undefined,
      workingHours: workingHours.trim() || undefined,
      employerSignerName: employerSignerName.trim() || undefined,
      employerSignerPosition: employerSignerPosition.trim() || undefined,
      employerSignerAuthority: employerSignerAuthority.trim() || undefined,
      fixedTermReason: isFixed ? fixedTermReason.trim() || undefined : undefined,
      fixedTermEndDate: isFixed ? fixedTermEndDate.trim() || undefined : undefined,
      equipmentProvision: (isRemote || isHybrid) ? equipmentProvision.trim() || undefined : undefined,
      remoteCompensation: (isRemote || isHybrid) ? remoteCompensation.trim() || undefined : undefined,
      officeDays: isHybrid ? officeDays.trim() || undefined : undefined,
      officeLocation: isHybrid ? officeLocation.trim() || undefined : undefined,
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
      downloadBlob(blob, `trudovoy-dogovor-${position.trim().replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.docx`);
      setDocxDownloaded(true);
    } catch {
      setDocxError("Не удалось скачать Word-файл. Попробуйте ещё раз.");
    } finally {
      setDownloadingDocx(false);
    }
  };

  const inputSx = { "& .MuiOutlinedInput-root": { borderRadius: 2 } };
  const selectSx = { borderRadius: 2 };
  const grid2 = { display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2.5 };

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
      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, border: "1px solid #b8cfe8", bgcolor: "#fff", mb: 4 }}>

        {/* === Секция 1: Работник === */}
        <SectionHeader icon="mdi:account-outline" title="Работник" subtitle="Обязательные данные" />
        <Box sx={grid2}>
          <FormField label="ФИО работника" required>
            <TextField fullWidth value={employeeName} onChange={(e) => setEmployeeName(e.target.value)}
              placeholder="Иванов Иван Иванович" sx={inputSx} />
          </FormField>
          <FormField label="Должность по штатному расписанию" required helper="Кадровое наименование, напр. «Менеджер по продажам»">
            <TextField fullWidth value={position} onChange={(e) => setPosition(e.target.value)}
              placeholder="PHP-разработчик, Менеджер по продажам..." sx={inputSx} />
          </FormField>
          <FormField label="Оклад / ЗП" required helper="Сумма в рублях, напр. «150 000 руб.» или «150 000 руб. gross»">
            <TextField fullWidth value={salary} onChange={(e) => setSalary(e.target.value)}
              placeholder="150 000 руб." sx={inputSx} />
          </FormField>
          <FormField label="Дата начала работы">
            <TextField fullWidth value={startDate} onChange={(e) => setStartDate(e.target.value)}
              placeholder="1 апреля 2026 г." sx={inputSx} />
          </FormField>
          <FormField label="Испытательный срок">
            <FormControl fullWidth>
              <Select value={probation} onChange={(e) => setProbation(String(e.target.value))} displayEmpty sx={selectSx}>
                <MenuItem value="">Не указывать</MenuItem>
                <MenuItem value="none">Без испытательного срока</MenuItem>
                <MenuItem value="1">1 месяц</MenuItem>
                <MenuItem value="2">2 месяца</MenuItem>
                <MenuItem value="3">3 месяца</MenuItem>
              </Select>
            </FormControl>
          </FormField>
        </Box>

        <Divider sx={{ my: 3.5 }} />

        {/* === Секция 2: Работодатель === */}
        <SectionHeader icon="mdi:office-building-outline" title="Работодатель" subtitle="Данные организации и подписанта" />
        <Box sx={grid2}>
          <FormField label="Название компании">
            <TextField fullWidth value={companyName} onChange={(e) => setCompanyName(e.target.value)}
              placeholder='ООО «Ромашка»' sx={inputSx} />
          </FormField>
          <FormField label="Юридический адрес">
            <TextField fullWidth value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)}
              placeholder="г. Москва, ул. Примерная, д. 1" sx={inputSx} />
          </FormField>
          <FormField label="Структурное подразделение / отдел">
            <TextField fullWidth value={department} onChange={(e) => setDepartment(e.target.value)}
              placeholder="Отдел разработки, Коммерческий отдел..." sx={inputSx} />
          </FormField>
          <FormField label="ФИО подписанта (директора)" helper="Кто подписывает договор со стороны работодателя">
            <TextField fullWidth value={employerSignerName} onChange={(e) => setEmployerSignerName(e.target.value)}
              placeholder="Петров Пётр Петрович" sx={inputSx} />
          </FormField>
          <FormField label="Должность подписанта">
            <TextField fullWidth value={employerSignerPosition} onChange={(e) => setEmployerSignerPosition(e.target.value)}
              placeholder="Генеральный директор" sx={inputSx} />
          </FormField>
          <FormField label="Основание полномочий" helper="Устав, доверенность № ...">
            <TextField fullWidth value={employerSignerAuthority} onChange={(e) => setEmployerSignerAuthority(e.target.value)}
              placeholder="Устав" sx={inputSx} />
          </FormField>
        </Box>

        <Divider sx={{ my: 3.5 }} />

        {/* === Секция 3: Условия === */}
        <SectionHeader icon="mdi:clipboard-text-outline" title="Условия договора" />
        <Box sx={grid2}>
          <FormField label="Вид договора">
            <FormControl fullWidth>
              <Select value={contractType} onChange={(e) => setContractType(String(e.target.value))} displayEmpty sx={selectSx}>
                <MenuItem value="">Бессрочный (по умолчанию)</MenuItem>
                <MenuItem value="permanent">Бессрочный</MenuItem>
                <MenuItem value="fixed">Срочный</MenuItem>
              </Select>
            </FormControl>
          </FormField>
          <FormField label="Формат работы">
            <FormControl fullWidth>
              <Select value={workFormat} onChange={(e) => setWorkFormat(String(e.target.value))} displayEmpty sx={selectSx}>
                <MenuItem value="">Не указывать</MenuItem>
                <MenuItem value="office">Офис</MenuItem>
                <MenuItem value="remote">Дистанционная работа</MenuItem>
                <MenuItem value="hybrid">Гибридный</MenuItem>
              </Select>
            </FormControl>
          </FormField>
          <FormField label="График работы">
            <FormControl fullWidth>
              <Select value={schedule} onChange={(e) => setSchedule(String(e.target.value))} displayEmpty sx={selectSx}>
                <MenuItem value="">Не указывать</MenuItem>
                <MenuItem value="5_2">5/2 пн–пт</MenuItem>
                <MenuItem value="shift">Сменный</MenuItem>
                <MenuItem value="flexible">Свободный (ненормированный)</MenuItem>
                <MenuItem value="part_time">Неполный рабочий день</MenuItem>
              </Select>
            </FormControl>
          </FormField>
          <FormField label="Рабочий день" helper="Например: 9:00–18:00">
            <TextField fullWidth value={workingHours} onChange={(e) => setWorkingHours(e.target.value)}
              placeholder="9:00–18:00" sx={inputSx} />
          </FormField>
          <FormField label="Дни выплаты зарплаты" helper="Два конкретных числа месяца">
            <TextField fullWidth value={salaryPaymentDays} onChange={(e) => setSalaryPaymentDays(e.target.value)}
              placeholder="15-го и 30-го числа" sx={inputSx} />
          </FormField>
        </Box>

        {/* Условные поля: адрес рабочего места */}
        {showWorkplace && (
          <Box sx={{ mt: 2.5 }}>
            <FormField label="Адрес рабочего места" helper="Конкретный адрес офиса, кабинет и т.д.">
              <TextField fullWidth value={workplaceAddress} onChange={(e) => setWorkplaceAddress(e.target.value)}
                placeholder="г. Москва, ул. Ленина, д. 10, оф. 305" sx={inputSx} />
            </FormField>
          </Box>
        )}

        {/* Условные поля: гибридный */}
        {isHybrid && (
          <Box sx={{ ...grid2, mt: 2.5 }}>
            <FormField label="Дней в офисе" helper="Например: 2 дня в неделю">
              <TextField fullWidth value={officeDays} onChange={(e) => setOfficeDays(e.target.value)}
                placeholder="2 дня в неделю (вт, чт)" sx={inputSx} />
            </FormField>
            <FormField label="Адрес офиса для гибрида">
              <TextField fullWidth value={officeLocation} onChange={(e) => setOfficeLocation(e.target.value)}
                placeholder="г. Москва, ул. Ленина, д. 10" sx={inputSx} />
            </FormField>
          </Box>
        )}

        {/* Условные поля: remote / hybrid */}
        {(isRemote || isHybrid) && (
          <Box sx={{ ...grid2, mt: 2.5 }}>
            <FormField label="Обеспечение оборудованием" helper="Кто предоставляет — работодатель или работник">
              <TextField fullWidth value={equipmentProvision} onChange={(e) => setEquipmentProvision(e.target.value)}
                placeholder="Работодатель предоставляет ноутбук" sx={inputSx} />
            </FormField>
            <FormField label="Компенсация расходов" helper="Интернет, электроэнергия и т.д.">
              <TextField fullWidth value={remoteCompensation} onChange={(e) => setRemoteCompensation(e.target.value)}
                placeholder="Компенсация 3 000 руб./мес. за интернет" sx={inputSx} />
            </FormField>
          </Box>
        )}

        {/* Условные поля: срочный договор */}
        {isFixed && (
          <Box sx={{ mt: 2.5, p: 2.5, borderRadius: 2, border: "1px solid #ffd54f", bgcolor: "#fffde7" }}>
            <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#b45309", mb: 2 }}>
              Условия срочного договора (обязательно по ст. 59 ТК РФ)
            </Typography>
            <Box sx={grid2}>
              <FormField label="Основание срочности" helper="Выберите или укажите основание по ст. 59 ТК РФ">
                <TextField fullWidth value={fixedTermReason} onChange={(e) => setFixedTermReason(e.target.value)}
                  placeholder="На время выполнения временных работ (до 2 месяцев)" sx={inputSx} multiline minRows={2} />
              </FormField>
              <FormField label="Дата окончания договора">
                <TextField fullWidth value={fixedTermEndDate} onChange={(e) => setFixedTermEndDate(e.target.value)}
                  placeholder="31 декабря 2026 г." sx={inputSx} />
              </FormField>
            </Box>
          </Box>
        )}

        <HrToolConsent />
        <Button
          variant="contained" size="large" onClick={handleSubmit}
          disabled={loading || !canSubmit}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Icon icon="mdi:auto-fix" />}
          sx={{
            bgcolor: "#1565C0", color: "#fff", textTransform: "none", fontWeight: 600,
            px: 4, py: 1.5, fontSize: "1rem", borderRadius: 2,
            "&:hover": { bgcolor: "#0D47A1" }, "&:disabled": { bgcolor: "#cbd5e1" },
          }}
        >
          {loading ? "Генерируем трудовой договор..." : "Сгенерировать трудовой договор"}
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
          downloadFilename="trudovoy-dogovor.txt"
          onRegenerate={handleSubmit}
          regenerating={loading}
          onDownloadDocx={handleDownloadDocx}
          downloadingDocx={downloadingDocx}
        >
          <ContractPreview data={data} />
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
