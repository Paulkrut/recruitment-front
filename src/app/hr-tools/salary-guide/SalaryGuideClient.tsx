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
  Slider,
  CircularProgress,
  Alert,
  Collapse,
  Chip,
} from "@mui/material";
import { Icon } from "@iconify/react";
import Link from "next/link";
import ToolLayout from "../components/ToolLayout";
import ResultDisplay from "../components/ResultDisplay";
import { useSalaryGuide } from "../hooks/useHrTool";

const cities = [
  { id: "moscow", name: "Москва" },
  { id: "spb", name: "Санкт-Петербург" },
  { id: "novosibirsk", name: "Новосибирск" },
  { id: "ekaterinburg", name: "Екатеринбург" },
  { id: "kazan", name: "Казань" },
  { id: "nizhny_novgorod", name: "Нижний Новгород" },
  { id: "krasnodar", name: "Краснодар" },
  { id: "samara", name: "Самара" },
  { id: "ufa", name: "Уфа" },
  { id: "rostov", name: "Ростов-на-Дону" },
  { id: "other", name: "Другой город" },
];

const levels = [
  { id: "junior", name: "Junior (начинающий)" },
  { id: "middle", name: "Middle (опытный)" },
  { id: "senior", name: "Senior (эксперт)" },
  { id: "lead", name: "Lead (руководитель)" },
];

const industries = [
  { id: "", name: "Не уточнять" },
  { id: "it", name: "IT / digital" },
  { id: "finance", name: "Финансы / fintech" },
  { id: "retail", name: "Retail / e-commerce" },
  { id: "manufacturing", name: "Производство / промышленность" },
  { id: "education", name: "Образование" },
  { id: "medicine", name: "Медицина / pharma" },
  { id: "logistics", name: "Логистика / supply chain" },
  { id: "construction", name: "Строительство / недвижимость" },
  { id: "other", name: "Другая сфера" },
];

const workFormats = [
  { id: "", name: "Не уточнять" },
  { id: "office", name: "Офис" },
  { id: "hybrid", name: "Гибрид" },
  { id: "remote", name: "Удалённо" },
];

const companyTypes = [
  { id: "", name: "Не уточнять" },
  { id: "product", name: "Продуктовая компания" },
  { id: "outsource", name: "Аутсорс / аутстафф" },
  { id: "startup", name: "Стартап" },
  { id: "enterprise", name: "Крупная компания" },
  { id: "agency", name: "Агентство / сервисный бизнес" },
];

const responsibilityLevels = [
  { id: "", name: "Не уточнять" },
  { id: "individual", name: "Individual contributor" },
  { id: "teamlead", name: "Есть управление командой" },
  { id: "head", name: "Руководитель направления" },
];

const englishLevels = [
  { id: "", name: "Не уточнять" },
  { id: "a2_b1", name: "A2-B1" },
  { id: "b2", name: "B2" },
  { id: "c1_plus", name: "C1+" },
];

export default function SalaryGuideClient() {
  const [position, setPosition] = React.useState("");
  const [city, setCity] = React.useState("moscow");
  const [level, setLevel] = React.useState("middle");
  const [experience, setExperience] = React.useState<number | null>(null);
  const [industry, setIndustry] = React.useState("");
  const [workFormat, setWorkFormat] = React.useState("");
  const [companyType, setCompanyType] = React.useState("");
  const [responsibilityLevel, setResponsibilityLevel] = React.useState("");
  const [englishLevel, setEnglishLevel] = React.useState("");
  const [specialization, setSpecialization] = React.useState("");

  const { data, loading, error, execute } = useSalaryGuide();

  const handleSubmit = async () => {
    if (!position.trim()) return;
    await execute({
      position,
      city,
      level,
      experience: experience ?? undefined,
      industry: industry || undefined,
      workFormat: workFormat || undefined,
      companyType: companyType || undefined,
      responsibilityLevel: responsibilityLevel || undefined,
      englishLevel: englishLevel || undefined,
      specialization: specialization.trim() || undefined,
    });
  };

  const handleRegenerate = async () => {
    if (!position.trim()) return;
    await execute({
      position,
      city,
      level,
      experience: experience ?? undefined,
      industry: industry || undefined,
      workFormat: workFormat || undefined,
      companyType: companyType || undefined,
      responsibilityLevel: responsibilityLevel || undefined,
      englishLevel: englishLevel || undefined,
      specialization: specialization.trim() || undefined,
    });
  };

  const formatSalary = (value: number): string => {
    return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
  };

  const formatSalaryAsText = (): string => {
    if (!data) return "";

    let text = `ЗАРПЛАТНЫЙ АНАЛИЗ\n`;
    text += `Должность: ${data.position}\n`;
    text += `Город: ${data.city}\n`;
    text += `Уровень: ${data.level}\n`;
    text += `Уверенность: ${Math.round(data.confidence * 100)}%\n`;
    text += `Интерпретация роли: ${data.roleAnalysis.roleSummary}\n`;
    text += `Сегмент рынка: ${data.roleAnalysis.marketSegment}\n\n`;

    text += `ЗАРПЛАТНАЯ ВИЛКА (${data.salary.type}):\n`;
    text += `Минимум: ${formatSalary(data.salary.min)}\n`;
    text += `Медиана: ${formatSalary(data.salary.median)}\n`;
    text += `Максимум: ${formatSalary(data.salary.max)}\n`;
    if (data.competitiveOfficeMedian) {
      text += `Конкурентная медиана для офиса: ${formatSalary(data.competitiveOfficeMedian)}\n`;
    }
    text += `\nПОЧЕМУ ТАКАЯ ВИЛКА:\n${data.whyThisRange}\n\n`;

    text += `ТРЕНД: ${data.trend.direction === "growing" ? "Растёт" : data.trend.direction === "stable" ? "Стабильно" : "Снижается"} (${data.trend.percentChange > 0 ? "+" : ""}${data.trend.percentChange}% за ${data.trend.period})\n\n`;

    if (data.locationLogic) {
      text += `ВЛИЯНИЕ ЛОКАЦИИ И ФОРМАТА:\n${data.locationLogic}\n\n`;
    }

    text += `СРАВНЕНИЕ ПО ГОРОДАМ:\n`;
    data.cityComparison?.forEach((c) => {
      text += `• ${c.city}: ${formatSalary(c.median)} (${c.diffPercent > 0 ? "+" : ""}${c.diffPercent}%)\n`;
    });

    text += `\nФАКТОРЫ, КОТОРЫЕ МОГУТ ПОВЫСИТЬ ДОХОД:\n`;
    data.higherFactors?.forEach((f) => {
      text += `• ${f.name}: ${f.impact}\n`;
    });
    text += `\nФАКТОРЫ, КОТОРЫЕ МОГУТ СНИЖАТЬ ВИЛКУ:\n`;
    data.lowerFactors?.forEach((f) => {
      text += `• ${f.name}: ${f.impact}\n`;
    });

    text += `\n${data.marketInsight}\n`;
    text += `\n${data.disclaimer}`;

    return text;
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case "growing":
        return <Icon icon="mdi:trending-up" width={24} height={24} color="#4CAF50" />;
      case "declining":
        return <Icon icon="mdi:trending-down" width={24} height={24} color="#f44336" />;
      default:
        return <Icon icon="mdi:trending-neutral" width={24} height={24} color="#FF9800" />;
    }
  };

  const getTrendLabel = (direction: string) => {
    switch (direction) {
      case "growing":
        return "Растёт";
      case "declining":
        return "Снижается";
      default:
        return "Стабильно";
    }
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.75) return "Высокая";
    if (confidence >= 0.5) return "Средняя";
    return "Низкая";
  };

  return (
    <ToolLayout
      title="Зарплатный гид"
      description="Узнайте актуальный уровень зарплат для любой позиции. Данные по рынку труда России 2025-2026."
      icon="mdi:cash-multiple"
      iconColor="#E91E63"
      ctaLabel="Хотите автоматизировать найм целиком?"
      ctaTitle="SofiHR — платформа для найма от заявки до оффера"
      ctaDescription="Открывайте вакансии, собирайте кандидатов с HeadHunter и проводите AI-интервью. Рейтинг, аналитика и экспорт в Excel. Первые 10 интервью бесплатно."
      ctaButtonText="Начать бесплатно →"
      ctaFeatures={[
        { icon: "mdi:headhunter", text: "Интеграция с HeadHunter" },
        { icon: "mdi:robot", text: "AI-интервью" },
        { icon: "mdi:chart-bar", text: "Рейтинг кандидатов" },
        { icon: "mdi:flag", text: "Красные флаги" },
        { icon: "mdi:microsoft-excel", text: "Экспорт в Excel" },
      ]}
    >
      {/* Input form */}
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
        {/* Position */}
        <Box sx={{ mb: 3 }}>
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
            placeholder="Например: Frontend-разработчик, Product Manager, Data Analyst"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </Box>

        {/* City & Level */}
        <Box sx={{ display: "flex", gap: 3, mb: 3, flexWrap: "wrap" }}>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "0.9rem",
                color: "#1a1a2e",
                mb: 1,
              }}
            >
              Город / рынок работодателя
            </Typography>
            <FormControl fullWidth>
              <Select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                {cities.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography sx={{ mt: 1, fontSize: "0.78rem", color: "#64748b", lineHeight: 1.5 }}>
              Для удалённой работы всё равно выберите город, на рынок которого обычно ориентируется компания.
              Например, remote-вакансия московской компании часто платит ближе к Москве, чем к региону кандидата.
            </Typography>
          </Box>

          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "0.9rem",
                color: "#1a1a2e",
                mb: 1,
              }}
            >
              Уровень
            </Typography>
            <FormControl fullWidth>
              <Select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                {levels.map((l) => (
                  <MenuItem key={l.id} value={l.id}>
                    {l.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Experience */}
        <Box sx={{ mb: 4 }}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "0.9rem",
              color: "#1a1a2e",
              mb: 1,
            }}
          >
            Опыт работы (опционально): {experience ?? "—"} лет
          </Typography>
          <Slider
            value={experience ?? 0}
            onChange={(_, value) => setExperience(value as number)}
            min={0}
            max={15}
            marks={[
              { value: 0, label: "0" },
              { value: 5, label: "5" },
              { value: 10, label: "10" },
              { value: 15, label: "15+" },
            ]}
            valueLabelDisplay="auto"
            sx={{
              color: "#E91E63",
              "& .MuiSlider-markLabel": {
                fontSize: "0.75rem",
              },
            }}
          />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "0.95rem",
              color: "#1a1a2e",
              mb: 2,
            }}
          >
            Уточнения для более точной оценки
          </Typography>

          <Box sx={{ display: "flex", gap: 3, mb: 3, flexWrap: "wrap" }}>
            <Box sx={{ flex: 1, minWidth: 220 }}>
              <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a2e", mb: 1 }}>
                Сфера / индустрия
              </Typography>
              <FormControl fullWidth>
                <Select value={industry} onChange={(e) => setIndustry(e.target.value)} sx={{ borderRadius: 2 }}>
                  {industries.map((item) => (
                    <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: 1, minWidth: 220 }}>
              <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a2e", mb: 1 }}>
                Формат работы
              </Typography>
              <FormControl fullWidth>
                <Select value={workFormat} onChange={(e) => setWorkFormat(e.target.value)} sx={{ borderRadius: 2 }}>
                  {workFormats.map((item) => (
                    <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 3, mb: 3, flexWrap: "wrap" }}>
            <Box sx={{ flex: 1, minWidth: 220 }}>
              <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a2e", mb: 1 }}>
                Тип компании
              </Typography>
              <FormControl fullWidth>
                <Select value={companyType} onChange={(e) => setCompanyType(e.target.value)} sx={{ borderRadius: 2 }}>
                  {companyTypes.map((item) => (
                    <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: 1, minWidth: 220 }}>
              <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a2e", mb: 1 }}>
                Формат роли
              </Typography>
              <FormControl fullWidth>
                <Select value={responsibilityLevel} onChange={(e) => setResponsibilityLevel(e.target.value)} sx={{ borderRadius: 2 }}>
                  {responsibilityLevels.map((item) => (
                    <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            <Box sx={{ flex: 1, minWidth: 220 }}>
              <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a2e", mb: 1 }}>
                Английский
              </Typography>
              <FormControl fullWidth>
                <Select value={englishLevel} onChange={(e) => setEnglishLevel(e.target.value)} sx={{ borderRadius: 2 }}>
                  {englishLevels.map((item) => (
                    <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: 2, minWidth: 260 }}>
              <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a2e", mb: 1 }}>
                Специализация / стек
              </Typography>
              <TextField
                fullWidth
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="Например: React + Next.js, B2B sales, нефтегаз, BIM, AML, тяжёлое машиностроение"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Box>
          </Box>
        </Box>

        {/* Submit button */}
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={loading || !position.trim()}
          startIcon={
            loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <Icon icon="mdi:chart-line" />
            )
          }
          sx={{
            bgcolor: "#E91E63",
            color: "#fff",
            textTransform: "none",
            fontWeight: 600,
            px: 4,
            py: 1.5,
            fontSize: "1rem",
            borderRadius: 2,
            "&:hover": { bgcolor: "#C2185B" },
            "&:disabled": { bgcolor: "#ccc" },
          }}
        >
          {loading ? "Анализ..." : "Получить данные"}
        </Button>
      </Paper>

      {/* Error */}
      <Collapse in={!!error}>
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          {error}
        </Alert>
      </Collapse>

      {/* Inline nudge */}
      {!!data && (
        <Box
          sx={{
            mb: 2,
            p: { xs: 2.5, md: 3 },
            borderRadius: 3,
            border: "1px solid #f8bbd0",
            bgcolor: "#fff5f8",
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, flex: 1, minWidth: 0 }}>
            <Box sx={{ mt: 0.25, width: 36, height: 36, borderRadius: 2, bgcolor: "#E91E63", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon icon="mdi:briefcase-search" width={20} height={20} color="#fff" />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#1a1a2e", lineHeight: 1.3 }}>
                Вилка готова — следующий шаг
              </Typography>
              <Typography sx={{ fontSize: "0.83rem", color: "#555", mt: 0.4, lineHeight: 1.5 }}>
                Откройте вакансию в SofiHR, подключите HH и автоматически собирайте кандидатов
              </Typography>
            </Box>
          </Box>
          <Button component={Link} href="/auth/register" variant="contained" size="small"
            sx={{ bgcolor: "#E91E63", color: "#fff", textTransform: "none", fontWeight: 600, px: 2.5, py: 1, borderRadius: 2, flexShrink: { xs: 1, sm: 0 }, alignSelf: { xs: "stretch", sm: "auto" }, "&:hover": { bgcolor: "#C2185B" } }}>
            Открыть вакансию в SofiHR →
          </Button>
        </Box>
      )}

      {/* Result */}
      {data && (
        <ResultDisplay
          title={`${data.position} — ${data.city}`}
          copyText={formatSalaryAsText()}
          downloadText={formatSalaryAsText()}
          downloadFilename="salary-guide.txt"
          onRegenerate={handleRegenerate}
          regenerating={loading}
        >
          <Box>
            <Box
              sx={{
                mb: 4,
                p: 2.5,
                bgcolor: data.confidence >= 0.5 ? "#f5f7ff" : "#fff7ed",
                borderRadius: 2,
                border: data.confidence >= 0.5 ? "1px solid #dbeafe" : "1px solid #fed7aa",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#1a1a2e", mb: 0.75 }}>
                    Как система интерпретировала роль
                  </Typography>
                  <Typography sx={{ fontSize: "0.95rem", color: "#475569", lineHeight: 1.6 }}>
                    {data.roleAnalysis.roleSummary}
                  </Typography>
                </Box>
                <Chip
                  label={`Уверенность: ${getConfidenceLabel(data.confidence)} (${Math.round(data.confidence * 100)}%)`}
                  sx={{
                    bgcolor: data.confidence >= 0.75 ? "#e8f5e9" : data.confidence >= 0.5 ? "#fff8e1" : "#ffebee",
                    color: data.confidence >= 0.75 ? "#2e7d32" : data.confidence >= 0.5 ? "#b26a00" : "#c62828",
                    fontWeight: 700,
                  }}
                />
              </Box>

              {!!data.roleAnalysis.marketSegment && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
                  <Chip label={`Сегмент: ${data.roleAnalysis.marketSegment}`} size="small" />
                </Box>
              )}

              {!!data.roleAnalysis.ambiguities?.length && (
                <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
                  Оценка приблизительная: {data.roleAnalysis.ambiguities.join("; ")}
                </Alert>
              )}
            </Box>

            {/* Salary range */}
            <Box sx={{ mb: 4 }}>
              <Typography
                sx={{
                  fontSize: "0.8rem",
                  color: "#999",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  mb: 2,
                }}
              >
                Зарплатная вилка ({data.salary.type})
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  mb: 2,
                }}
              >
                <Box sx={{ textAlign: "center" }}>
                  <Typography sx={{ fontSize: "0.75rem", color: "#999" }}>Минимум</Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: "1.2rem", color: "#666" }}>
                    {formatSalary(data.salary.min)}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "center" }}>
                  <Typography sx={{ fontSize: "0.75rem", color: "#999" }}>Медиана</Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: "2rem", color: "#E91E63" }}>
                    {formatSalary(data.salary.median)}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "center" }}>
                  <Typography sx={{ fontSize: "0.75rem", color: "#999" }}>Максимум</Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: "1.2rem", color: "#666" }}>
                    {formatSalary(data.salary.max)}
                  </Typography>
                </Box>
              </Box>

              {/* Visual bar */}
              <Box
                sx={{
                  height: 12,
                  borderRadius: 2,
                  background: `linear-gradient(to right, #f5f5f5 0%, #E91E63 50%, #f5f5f5 100%)`,
                  position: "relative",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: -4,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    bgcolor: "#E91E63",
                    border: "3px solid #fff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  }}
                />
              </Box>
            </Box>

            {data.competitiveOfficeMedian && (
              <Alert
                severity="info"
                sx={{ mb: 3, borderRadius: 2, "& .MuiAlert-icon": { alignItems: "center" } }}
              >
                <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", mb: 0.5 }}>
                  Конкурентная медиана для офиса: {formatSalary(data.competitiveOfficeMedian)}
                </Typography>
                <Typography sx={{ fontSize: "0.85rem", color: "#475569" }}>
                  Чтобы привлечь сильного кандидата в офис и конкурировать с удалёнными вакансиями, рекомендуется ставить зарплату на этом уровне или выше.
                </Typography>
              </Alert>
            )}

            {data.locationLogic && (
              <Box sx={{ mb: 3, p: 2, bgcolor: "#f0f4ff", borderRadius: 2 }}>
                <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", mb: 0.5, color: "#1565C0" }}>
                  Влияние локации и формата
                </Typography>
                <Typography sx={{ fontSize: "0.9rem", color: "#475569", lineHeight: 1.6 }}>
                  {data.locationLogic}
                </Typography>
              </Box>
            )}

            <Box
              sx={{
                mb: 4,
                p: 2.5,
                bgcolor: "#fafafa",
                borderRadius: 2,
              }}
            >
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "1rem",
                  mb: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Icon icon="mdi:text-box-search-outline" width={18} height={18} color="#1565C0" />
                Почему получилась такая вилка
              </Typography>
              <Typography sx={{ fontSize: "0.95rem", color: "#475569", lineHeight: 1.7 }}>
                {data.whyThisRange}
              </Typography>
            </Box>

            {/* Trend */}
            <Box
              sx={{
                mb: 4,
                p: 2,
                bgcolor: "#fafafa",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              {getTrendIcon(data.trend.direction)}
              <Box>
                <Typography sx={{ fontWeight: 600, fontSize: "1rem" }}>
                  Тренд: {getTrendLabel(data.trend.direction)}
                </Typography>
                <Typography sx={{ fontSize: "0.85rem", color: "#666" }}>
                  {data.trend.percentChange > 0 ? "+" : ""}
                  {data.trend.percentChange}% за {data.trend.period}
                </Typography>
              </Box>
            </Box>

            {/* City comparison */}
            {data.cityComparison && data.cityComparison.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "1rem",
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Icon icon="mdi:map-marker" width={18} height={18} color="#9C27B0" />
                  Сравнение по городам
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  {data.cityComparison.map((c, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 2,
                        bgcolor: "#f5f5f5",
                        borderRadius: 2,
                        minWidth: 140,
                        textAlign: "center",
                      }}
                    >
                      <Typography sx={{ fontSize: "0.85rem", color: "#666", mb: 0.5 }}>
                        {c.city}
                      </Typography>
                      <Typography sx={{ fontWeight: 700, fontSize: "1rem" }}>
                        {formatSalary(c.median)}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.8rem",
                          color:
                            c.diffPercent > 0
                              ? "#4CAF50"
                              : c.diffPercent < 0
                              ? "#f44336"
                              : "#999",
                        }}
                      >
                        {c.diffPercent > 0 ? "+" : ""}
                        {c.diffPercent}%
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* Factors */}
            {(data.higherFactors.length > 0 || data.lowerFactors.length > 0) && (
              <Box sx={{ mb: 4, display: "flex", gap: 3, flexWrap: "wrap" }}>
                {data.higherFactors.length > 0 && (
                  <Box sx={{ flex: 1, minWidth: 280 }}>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "1rem",
                        mb: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Icon icon="mdi:arrow-up-bold-box" width={18} height={18} color="#2E7D32" />
                      Что повышает зарплату
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {data.higherFactors.map((f, index) => (
                        <Chip
                          key={index}
                          label={`${f.name}: ${f.impact}`}
                          sx={{
                            bgcolor: "#e8f5e9",
                            color: "#1b5e20",
                            fontWeight: 600,
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
                {data.lowerFactors.length > 0 && (
                  <Box sx={{ flex: 1, minWidth: 280 }}>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "1rem",
                        mb: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Icon icon="mdi:arrow-down-bold-box" width={18} height={18} color="#C62828" />
                      Что может снижать вилку
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {data.lowerFactors.map((f, index) => (
                        <Chip
                          key={index}
                          label={`${f.name}: ${f.impact}`}
                          sx={{
                            bgcolor: "#ffebee",
                            color: "#b71c1c",
                            fontWeight: 600,
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            )}

            {/* Market insight */}
            {data.marketInsight && (
              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  bgcolor: "#e3f2fd",
                  borderRadius: 2,
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.9rem",
                    color: "#1565C0",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1,
                  }}
                >
                  <Icon
                    icon="mdi:lightbulb"
                    width={18}
                    height={18}
                    style={{ marginTop: 2, flexShrink: 0 }}
                  />
                  {data.marketInsight}
                </Typography>
              </Box>
            )}

            {/* Disclaimer */}
            <Typography sx={{ fontSize: "0.8rem", color: "#999", fontStyle: "italic" }}>
              {data.disclaimer}
            </Typography>
          </Box>
        </ResultDisplay>
      )}
    </ToolLayout>
  );
}

