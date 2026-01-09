"use client";
import * as React from "react";
import {
  Box,
  Typography,
  TextField,
  Slider,
  Button,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Collapse,
} from "@mui/material";
import { Icon } from "@iconify/react";
import ToolLayout from "../components/ToolLayout";
import ResultDisplay from "../components/ResultDisplay";
import { useQuestionGenerator, Question } from "../hooks/useHrTool";

// Шаблоны вакансий
const templates = [
  { id: "frontend", label: "Frontend (React)", icon: "mdi:react" },
  { id: "backend", label: "Backend (PHP/Node)", icon: "mdi:server" },
  { id: "product_manager", label: "Product Manager", icon: "mdi:clipboard-check" },
  { id: "ux_designer", label: "UX/UI Designer", icon: "mdi:palette" },
  { id: "sales_manager", label: "Sales Manager", icon: "mdi:handshake" },
  { id: "hr_manager", label: "HR Manager", icon: "mdi:account-group" },
  { id: "devops", label: "DevOps Engineer", icon: "mdi:cloud-cog" },
  { id: "qa_engineer", label: "QA Engineer", icon: "mdi:test-tube" },
  { id: "data_analyst", label: "Data Analyst", icon: "mdi:chart-bar" },
  { id: "project_manager", label: "Project Manager", icon: "mdi:calendar-check" },
];

// Шаблоны описаний (сокращённые)
const templateDescriptions: Record<string, string> = {
  frontend: `Frontend-разработчик (React)

Обязанности:
- Разработка пользовательских интерфейсов на React
- Написание чистого, типизированного кода (TypeScript)
- Взаимодействие с API, оптимизация производительности
- Code review, участие в архитектурных решениях

Требования:
- Опыт работы с React от 2 лет
- Знание TypeScript, Redux/MobX
- Понимание принципов REST API
- Опыт работы с Git`,

  backend: `Backend-разработчик (PHP/Node.js)

Обязанности:
- Проектирование и разработка API
- Работа с базами данных (PostgreSQL/MySQL)
- Интеграция с внешними сервисами
- Оптимизация производительности

Требования:
- Опыт коммерческой разработки от 2 лет
- Знание SQL, принципов проектирования БД
- Понимание принципов REST/GraphQL
- Опыт работы с Docker`,

  product_manager: `Product Manager

Обязанности:
- Формирование и приоритизация бэклога
- Проведение исследований пользователей
- Написание требований и user stories
- Работа с метриками продукта

Требования:
- Опыт работы продактом от 2 лет
- Понимание Agile/Scrum методологий
- Навыки работы с аналитикой
- Опыт проведения интервью с пользователями`,

  ux_designer: `UX/UI Designer

Обязанности:
- Проектирование пользовательских интерфейсов
- Создание wireframes и прототипов
- Проведение UX-исследований
- Работа с дизайн-системой

Требования:
- Опыт работы UX/UI дизайнером от 2 лет
- Владение Figma на уровне эксперта
- Портфолио с примерами веб-интерфейсов
- Понимание принципов юзабилити`,

  sales_manager: `Sales Manager (B2B)

Обязанности:
- Привлечение новых клиентов (B2B)
- Проведение презентаций и демонстраций продукта
- Ведение переговоров и закрытие сделок
- Работа с CRM-системой

Требования:
- Опыт в B2B продажах от 2 лет
- Навыки ведения переговоров
- Умение работать с возражениями
- Грамотная устная и письменная речь`,

  hr_manager: `HR Manager / Рекрутер

Обязанности:
- Полный цикл подбора персонала
- Работа с вакансиями на job-сайтах
- Проведение интервью
- Взаимодействие с нанимающими менеджерами

Требования:
- Опыт в рекрутменте от 2 лет
- Опыт подбора IT-специалистов
- Навыки проведения интервью
- Знание рынка труда IT`,

  devops: `DevOps Engineer

Обязанности:
- Настройка и поддержка CI/CD пайплайнов
- Управление инфраструктурой в облаке (AWS/GCP)
- Контейнеризация и оркестрация (Docker, Kubernetes)
- Мониторинг и логирование

Требования:
- Опыт работы DevOps/SRE от 2 лет
- Знание Linux на уровне администратора
- Опыт работы с Docker, Kubernetes
- Понимание принципов CI/CD`,

  qa_engineer: `QA Engineer

Обязанности:
- Разработка тест-кейсов и тестовой документации
- Проведение функционального и регрессионного тестирования
- Автоматизация тестирования
- Работа с баг-трекером

Требования:
- Опыт тестирования от 2 лет
- Понимание методологий тестирования
- Опыт работы с веб-приложениями
- Знание SQL на базовом уровне`,

  data_analyst: `Data Analyst

Обязанности:
- Анализ данных и выявление инсайтов
- Построение дашбордов и отчётов
- Работа с SQL и базами данных
- Подготовка аналитических материалов

Требования:
- Опыт работы аналитиком от 2 лет
- Уверенное владение SQL
- Опыт работы с BI-инструментами
- Знание Excel на продвинутом уровне`,

  project_manager: `Project Manager

Обязанности:
- Планирование и контроль сроков проекта
- Координация работы команды
- Управление рисками и изменениями
- Коммуникация со стейкхолдерами

Требования:
- Опыт управления IT-проектами от 2 лет
- Знание Agile/Scrum методологий
- Навыки работы с Jira, Confluence
- Опыт управления командой 5+ человек`,
};

export default function QuestionGeneratorPage() {
  const [jobDescription, setJobDescription] = React.useState("");
  const [count, setCount] = React.useState(10);
  const [selectedTemplate, setSelectedTemplate] = React.useState<string | null>(null);

  const { data, loading, error, execute, reset } = useQuestionGenerator();

  const handleTemplateClick = (templateId: string) => {
    setSelectedTemplate(templateId);
    setJobDescription(templateDescriptions[templateId] || "");
  };

  const handleSubmit = async () => {
    if (!jobDescription.trim()) return;
    await execute({ jobDescription, count });
  };

  const handleRegenerate = async () => {
    if (!jobDescription.trim()) return;
    await execute({ jobDescription, count });
  };

  const formatQuestionsAsText = (questions: Question[]): string => {
    return questions
      .map((q) => `${q.number}. ${q.text}\n   [Проверяет: ${q.checks}]`)
      .join("\n\n");
  };

  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      hard_skills: "Hard Skills",
      soft_skills: "Soft Skills",
      motivation: "Мотивация",
      situational: "Ситуационный",
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      hard_skills: "#2196F3",
      soft_skills: "#4CAF50",
      motivation: "#FF9800",
      situational: "#9C27B0",
    };
    return colors[category] || "#666";
  };

  return (
    <ToolLayout
      title="Генератор вопросов для интервью"
      description="Создайте профессиональные вопросы для собеседования за 30 секунд. Просто опишите вакансию — AI сгенерирует релевантные вопросы."
      icon="mdi:chat-question"
      iconColor="#2196F3"
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
        {/* Templates */}
        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "0.9rem",
              color: "#1a1a2e",
              mb: 1.5,
            }}
          >
            Готовые шаблоны (нажмите для вставки)
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {templates.map((template) => (
              <Chip
                key={template.id}
                icon={<Icon icon={template.icon} width={16} height={16} />}
                label={template.label}
                onClick={() => handleTemplateClick(template.id)}
                variant={selectedTemplate === template.id ? "filled" : "outlined"}
                sx={{
                  cursor: "pointer",
                  bgcolor: selectedTemplate === template.id ? "#2196F3" : "transparent",
                  color: selectedTemplate === template.id ? "#fff" : "#666",
                  borderColor: selectedTemplate === template.id ? "#2196F3" : "#e0e0e0",
                  "&:hover": {
                    bgcolor: selectedTemplate === template.id ? "#1976D2" : "#f5f5f5",
                  },
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Job description */}
        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "0.9rem",
              color: "#1a1a2e",
              mb: 1,
            }}
          >
            Описание вакансии *
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={8}
            value={jobDescription}
            onChange={(e) => {
              setJobDescription(e.target.value);
              setSelectedTemplate(null);
            }}
            placeholder="Введите описание вакансии: обязанности, требования, технологии..."
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
          <Typography
            sx={{
              mt: 0.5,
              fontSize: "0.8rem",
              color: jobDescription.length > 5000 ? "#f44336" : "#999",
            }}
          >
            {jobDescription.length} / 5000 символов
          </Typography>
        </Box>

        {/* Question count */}
        <Box sx={{ mb: 4 }}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "0.9rem",
              color: "#1a1a2e",
              mb: 1,
            }}
          >
            Количество вопросов: {count}
          </Typography>
          <Slider
            value={count}
            onChange={(_, value) => setCount(value as number)}
            min={5}
            max={15}
            marks
            valueLabelDisplay="auto"
            sx={{
              color: "#2196F3",
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
          disabled={loading || !jobDescription.trim() || jobDescription.length > 5000}
          startIcon={
            loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <Icon icon="mdi:auto-fix" />
            )
          }
          sx={{
            bgcolor: "#2196F3",
            color: "#fff",
            textTransform: "none",
            fontWeight: 600,
            px: 4,
            py: 1.5,
            fontSize: "1rem",
            borderRadius: 2,
            "&:hover": { bgcolor: "#1976D2" },
            "&:disabled": { bgcolor: "#ccc" },
          }}
        >
          {loading ? "Генерация..." : "Сгенерировать вопросы"}
        </Button>
      </Paper>

      {/* Error */}
      <Collapse in={!!error}>
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          {error}
        </Alert>
      </Collapse>

      {/* Result */}
      {data?.questions && data.questions.length > 0 && (
        <ResultDisplay
          title={`Готово! ${data.questions.length} вопросов`}
          copyText={formatQuestionsAsText(data.questions)}
          downloadText={formatQuestionsAsText(data.questions)}
          downloadFilename="interview-questions.txt"
          onRegenerate={handleRegenerate}
          regenerating={loading}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {data.questions.map((question) => (
              <Box
                key={question.number}
                sx={{
                  p: 2,
                  bgcolor: "#fafafa",
                  borderRadius: 2,
                  borderLeft: `4px solid ${getCategoryColor(question.category)}`,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 2,
                    mb: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      bgcolor: getCategoryColor(question.category),
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      flexShrink: 0,
                    }}
                  >
                    {question.number}
                  </Box>
                  <Typography
                    sx={{
                      fontSize: "1rem",
                      color: "#1a1a2e",
                      lineHeight: 1.5,
                      flex: 1,
                    }}
                  >
                    {question.text}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    ml: 5,
                  }}
                >
                  <Chip
                    label={getCategoryLabel(question.category)}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: "0.7rem",
                      bgcolor: `${getCategoryColor(question.category)}15`,
                      color: getCategoryColor(question.category),
                      fontWeight: 600,
                    }}
                  />
                  <Typography sx={{ fontSize: "0.8rem", color: "#999" }}>
                    Проверяет: {question.checks}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </ResultDisplay>
      )}
    </ToolLayout>
  );
}

