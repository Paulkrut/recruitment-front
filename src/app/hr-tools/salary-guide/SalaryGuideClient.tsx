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
  { id: "remote", name: "Remote (удалённо)" },
  { id: "other", name: "Другой город" },
];

const levels = [
  { id: "junior", name: "Junior (начинающий)" },
  { id: "middle", name: "Middle (опытный)" },
  { id: "senior", name: "Senior (эксперт)" },
  { id: "lead", name: "Lead (руководитель)" },
];

export default function SalaryGuideClient() {
  const [position, setPosition] = React.useState("");
  const [city, setCity] = React.useState("moscow");
  const [level, setLevel] = React.useState("middle");
  const [experience, setExperience] = React.useState<number | null>(null);

  const { data, loading, error, execute } = useSalaryGuide();

  const handleSubmit = async () => {
    if (!position.trim()) return;
    await execute({
      position,
      city,
      level,
      experience: experience ?? undefined,
    });
  };

  const handleRegenerate = async () => {
    if (!position.trim()) return;
    await execute({
      position,
      city,
      level,
      experience: experience ?? undefined,
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
    text += `Уровень: ${data.level}\n\n`;

    text += `ЗАРПЛАТНАЯ ВИЛКА (${data.salary.type}):\n`;
    text += `Минимум: ${formatSalary(data.salary.min)}\n`;
    text += `Медиана: ${formatSalary(data.salary.median)}\n`;
    text += `Максимум: ${formatSalary(data.salary.max)}\n\n`;

    text += `ТРЕНД: ${data.trend.direction === "growing" ? "Растёт" : data.trend.direction === "stable" ? "Стабильно" : "Снижается"} (${data.trend.percentChange > 0 ? "+" : ""}${data.trend.percentChange}% за ${data.trend.period})\n\n`;

    text += `СРАВНЕНИЕ ПО ГОРОДАМ:\n`;
    data.cityComparison?.forEach((c) => {
      text += `• ${c.city}: ${formatSalary(c.median)} (${c.diffPercent > 0 ? "+" : ""}${c.diffPercent}%)\n`;
    });

    text += `\nФАКТОРЫ ВЛИЯНИЯ:\n`;
    data.factors?.forEach((f) => {
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

  return (
    <ToolLayout
      title="Зарплатный гид"
      description="Узнайте актуальный уровень зарплат для любой позиции. Данные по рынку труда России 2025-2026."
      icon="mdi:cash-multiple"
      iconColor="#E91E63"
    >
      {/* Input form */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          border: "1px solid #e0e0e0",
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
              Город
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
            {data.factors && data.factors.length > 0 && (
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
                  <Icon icon="mdi:chart-areaspline" width={18} height={18} color="#FF9800" />
                  Факторы влияния на зарплату
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {data.factors.map((f, index) => (
                    <Chip
                      key={index}
                      label={`${f.name}: ${f.impact}`}
                      sx={{
                        bgcolor: "#fff3e0",
                        color: "#e65100",
                        fontWeight: 500,
                      }}
                    />
                  ))}
                </Box>
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

