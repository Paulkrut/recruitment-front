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
import Link from "next/link";
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

export default function QuestionGeneratorClient() {
  const [jobDescription, setJobDescription] = React.useState("");
  const [count, setCount] = React.useState(10);
  const [selectedTemplate, setSelectedTemplate] = React.useState<string | null>(null);
  const [resumeText, setResumeText] = React.useState("");
  const [showResumeField, setShowResumeField] = React.useState(false);

  const { data, loading, error, execute, reset } = useQuestionGenerator();

  const handleTemplateClick = (templateId: string) => {
    setSelectedTemplate(templateId);
    setJobDescription(templateDescriptions[templateId] || "");
  };

  const handleSubmit = async () => {
    if (!jobDescription.trim()) return;
    await execute({ 
      jobDescription, 
      count,
      resumeText: resumeText.trim() || undefined
    });
  };

  const handleRegenerate = async () => {
    if (!jobDescription.trim()) return;
    await execute({ 
      jobDescription, 
      count,
      resumeText: resumeText.trim() || undefined
    });
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
      ctaLabel="Хотите автоматизировать найм целиком?"
      ctaTitle="SofiHR — платформа для найма от заявки до оффера"
      ctaDescription="HeadHunter-интеграция, AI-интервью, рейтинг кандидатов, красные флаги, аналитика по воронке и экспорт в Excel. Первые 10 интервью бесплатно."
      ctaButtonText="Начать бесплатно →"
      ctaFeatures={[
        { icon: "mdi:robot", text: "AI-интервью по вашим вопросам" },
        { icon: "mdi:chart-bar", text: "Автоматический рейтинг кандидатов" },
        { icon: "mdi:flag", text: "Красные флаги в ответах" },
        { icon: "mdi:headhunter", text: "Интеграция с HeadHunter" },
        { icon: "mdi:video", text: "Видеозапись и аналитика" },
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
                  color: selectedTemplate === template.id ? "#fff" : "#555",
                  borderColor: selectedTemplate === template.id ? "#2196F3" : "#aaa",
                  fontWeight: selectedTemplate === template.id ? 600 : 400,
                  "&:hover": {
                    bgcolor: selectedTemplate === template.id ? "#1976D2" : "#e8f0fe",
                    borderColor: selectedTemplate === template.id ? "#1976D2" : "#2196F3",
                    color: selectedTemplate === template.id ? "#fff" : "#1976D2",
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
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#bbb" },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#2196F3" },
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

        {/* Optional resume section */}
        <Box sx={{ mb: 3 }}>
          <Button
            onClick={() => setShowResumeField(!showResumeField)}
            startIcon={
              <Icon 
                icon={showResumeField ? "mdi:chevron-up" : "mdi:chevron-down"} 
                width={20} 
                height={20} 
              />
            }
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: "#2196F3",
              fontSize: "0.9rem",
              mb: showResumeField ? 2 : 0,
              "&:hover": {
                bgcolor: "rgba(33, 150, 243, 0.08)",
              },
            }}
          >
            {showResumeField ? "Скрыть" : "Добавить"} резюме кандидата (опционально)
          </Button>

          <Collapse in={showResumeField}>
            <Box>
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  color: "#1a1a2e",
                  mb: 1,
                }}
              >
                Резюме кандидата
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={6}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Вставьте резюме кандидата для генерации персонализированных вопросов..."
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    bgcolor: "#fafafa",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#bbb" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#2196F3" },
                  },
                }}
              />
              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: "0.8rem",
                  color: resumeText.length > 10000 ? "#f44336" : "#999",
                }}
              >
                {resumeText.length} / 10000 символов
              </Typography>
              <Alert 
                severity="info" 
                icon={<Icon icon="mdi:information-outline" width={20} height={20} />}
                sx={{ 
                  mt: 1.5,
                  borderRadius: 2,
                  bgcolor: "rgba(33, 150, 243, 0.08)",
                  border: "1px solid rgba(33, 150, 243, 0.2)",
                  "& .MuiAlert-icon": {
                    color: "#2196F3",
                  },
                }}
              >
                <Typography sx={{ fontSize: "0.85rem", color: "#555" }}>
                  AI сгенерирует вопросы, которые проверят конкретный опыт и навыки кандидата из его резюме
                </Typography>
              </Alert>
            </Box>
          </Collapse>
        </Box>

        {/* Submit button */}
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={loading || !jobDescription.trim() || jobDescription.length > 5000 || resumeText.length > 10000}
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

      {/* Inline contextual nudge — появляется сразу при получении результата */}
      {data?.questions && data.questions.length > 0 && (
        <Box
          sx={{
            mb: 2,
            p: { xs: 2.5, md: 3 },
            borderRadius: 3,
            border: "1px solid #b8cfe8",
            bgcolor: "#eef6ff",
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                mt: 0.25,
                width: 36,
                height: 36,
                borderRadius: 2,
                bgcolor: "#2196F3",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon icon="mdi:robot-excited" width={20} height={20} color="#fff" />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#1a1a2e", lineHeight: 1.3 }}>
                Вопросы готовы — следующий шаг
              </Typography>
              <Typography sx={{ fontSize: "0.83rem", color: "#555", mt: 0.4, lineHeight: 1.5 }}>
                Запустите AI-интервью в SofiHR: кандидат отвечает сам, система выставляет баллы и подсвечивает красные флаги
              </Typography>
            </Box>
          </Box>
          <Button
            component={Link}
            href="/auth/register"
            variant="contained"
            size="small"
            sx={{
              bgcolor: "#2196F3",
              color: "#fff",
              textTransform: "none",
              fontWeight: 600,
              px: 2.5,
              py: 1,
              borderRadius: 2,
              flexShrink: { xs: 1, sm: 0 },
              alignSelf: { xs: "stretch", sm: "auto" },
              "&:hover": { bgcolor: "#1976D2" },
            }}
          >
            Запустить AI-интервью по этим вопросам →
          </Button>
        </Box>
      )}

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
