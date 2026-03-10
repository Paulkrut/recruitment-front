"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  IconButton,
  Tooltip,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  CircularProgress,
} from "@mui/material";
import CustomTextField from "@/app/components/forms/theme-elements/CustomTextField";
import CustomFormLabel from "@/app/components/forms/theme-elements/CustomFormLabel";
import RichTextEditor from "@/components/RichTextEditor";
import {
  IconPlus,
  IconBriefcase,
  IconFileText,
  IconWand,
  IconSettings,
  IconEye,
  IconArrowLeft,
} from "@tabler/icons-react";
import PageContainer from "@/app/components/container/PageContainer";
import { apiFetch } from "@/utils/api";
import { useLingui } from '@lingui/react';
import { msg, Trans } from '@lingui/macro';
import QuestionFormItem from "@/components/QuestionFormItem";
import type { QuestionDraft } from "@/types/question";
import { validateQuestions } from "@/types/question";
import QuestionTimeSettings from "@/components/vacancy/QuestionTimeSettings";


const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

// Функция для получения embed URL из различных видеохостингов
function getVideoEmbedUrl(url: string): string | null {
  if (!url) return null;

  // YouTube
  const youtubeMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  // Rutube
  const rutubeMatch = url.match(/rutube\.ru\/video\/([a-zA-Z0-9]+)/);
  if (rutubeMatch) {
    return `https://rutube.ru/play/embed/${rutubeMatch[1]}`;
  }

  // VK Video
  const vkMatch = url.match(/vk\.com\/video(-?\d+_\d+)/);
  if (vkMatch) {
    return `https://vk.com/video_ext.php?oid=${vkMatch[1].split('_')[0]}&id=${vkMatch[1].split('_')[1]}&hd=2`;
  }

  return null;
}

export default function HRVacancyCreatePage() {
  const { _ } = useLingui();

  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [genOpen, setGenOpen] = useState(false);
  const [genCount, setGenCount] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<{
    status: string;
    elapsed_time?: number;
    message?: string;
  } | null>(null);

  // Vacancy data
  const [vacancyData, setVacancyData] = useState({
    title: "",
    description: "",
    companyVideoUrl: "",
  });

  // Template data
  const [templateData, setTemplateData] = useState({
    questionTime: 180, // время на один вопрос в секундах
  });

  // Questions
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  
  // Expert mode toggle
  const [expertMode, setExpertMode] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("recruitment_token");
    if (t) setToken(t);
  }, []);

  // 🎯 Мемоизация функций для предотвращения ре-рендера всех вопросов
  const updateQuestion = useCallback((index: number, field: keyof QuestionDraft, value: any) => {
    setQuestions(prev => {
      const newQuestions = [...prev];
      newQuestions[index] = { ...newQuestions[index], [field]: value };
      return newQuestions;
    });
  }, []);

  const removeQuestion = useCallback((index: number) => {
    setQuestions(prev => {
      const newQuestions = prev.filter((_, i) => i !== index);
      return newQuestions.map((q, i) => ({ ...q, position: i }));
    });
  }, []);

  const moveQuestionUp = useCallback((index: number) => {
    if (index === 0) return;
    setQuestions(prev => {
      const newQuestions = [...prev];
      [newQuestions[index], newQuestions[index - 1]] = [newQuestions[index - 1], newQuestions[index]];
      return newQuestions.map((q, i) => ({ ...q, position: i }));
    });
  }, []);

  const moveQuestionDown = useCallback((index: number) => {
    setQuestions(prev => {
      if (index === prev.length - 1) return prev;
      const newQuestions = [...prev];
      [newQuestions[index], newQuestions[index + 1]] = [newQuestions[index + 1], newQuestions[index]];
      return newQuestions.map((q, i) => ({ ...q, position: i }));
    });
  }, []);

  const addQuestion = () => {
    const newQuestion: QuestionDraft = {
      text: "",
      type: "text",
      inputMode: "text",
      questionType: "open",
      allowedAnswerFormats: ["audio_video"],
      maxTime: templateData.questionTime,
      position: questions.length,
      // Всегда создаём один пустой вариант
      variants: [{
        text: "",
        referenceAnswer: null,
        attachments: [],
        options: [],
        position: 1,
      }],
    };
    setQuestions([...questions, newQuestion]);
  };

  const createVacancyWithTemplate = async () => {
    if (!token || !vacancyData.title) return;

    // ✅ Нормализация вопросов - убедиться что у каждого есть variants
    const normalizedQuestions = questions.map(q => {
      // Если вариантов нет - создаём один из существующих данных
      if (!q.variants || q.variants.length === 0) {
        return {
          ...q,
          variants: [{
            text: q.text || "",
            referenceAnswer: q.referenceAnswer || null,
            attachments: q.attachments || [],
            options: q.options || [],
            position: 1,
          }]
        };
      }
      return q;
    });

    // ✅ Валидация вопросов перед сохранением
    const validation = validateQuestions(normalizedQuestions);

    if (!validation.isValid) {
      setError(validation.errorMessage);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Получаем текущую компанию
      const currentCompanyId = localStorage.getItem("current_company");
      if (!currentCompanyId) {
        throw new Error(_(msg`Не выбрана компания`));
      }

      // Создаем вакансию с тестом в одном запросе
      const response = await apiFetch(`${API_BASE}/api/admin/vacancies/with-template`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: vacancyData.title,
          description: vacancyData.description,
          companyVideoUrl: vacancyData.companyVideoUrl || null,
          templateTitle: _(msg`Тест для вакансии: ${vacancyData.title}`),
          templateDescription: _(msg`Тест для вакансии "${vacancyData.title}"`),
          questions: normalizedQuestions,
          companyId: currentCompanyId, // Добавляем ID компании
        }),
      });

      if (!response.ok) {
        throw new Error(_(msg`Ошибка создания вакансии с тестом`));
      }

      const result = await response.json();

      // Перенаправляем на страницу вакансии
      router.push(`/hr/vacancies`);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const generateQuestions = async () => {
    if (!token || !vacancyData.title) {
      setError(_(msg`Сначала заполните название вакансии`));
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGenerationProgress({ status: 'starting', message: _(msg`Запуск генерации...`) });

    try {
      // Запускаем асинхронную генерацию
      const count = Math.max(1, Math.min(20, genCount));
      const startRes = await apiFetch(`${API_BASE}/api/admin/templates/generate-questions-async`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          count: count,
          vacancyTitle: vacancyData.title,
          vacancyDescription: vacancyData.description,
        }),
      });

      if (!startRes.ok) {
        throw new Error(_(msg`Ошибка запуска генерации вопросов`));
      }

      const { jobId } = await startRes.json();

      // Начинаем поллинг статуса
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await apiFetch(`${API_BASE}/api/admin/templates/generate-questions-status/${jobId}`);

          if (!statusRes.ok) {
            throw new Error(_(msg`Ошибка получения статуса генерации`));
          }

          const statusData = await statusRes.json();

          // Обновляем прогресс
          const progressMessage = getProgressMessage(statusData.status, statusData.elapsed_time);
          setGenerationProgress({
            status: statusData.status,
            elapsed_time: statusData.elapsed_time,
            message: progressMessage
          });

          if (statusData.status === 'completed') {
            // Генерация завершена успешно
            clearInterval(pollInterval);

            const newQuestions = (statusData.questions || []).map((text: string, i: number) => ({
              text: text,
              type: "text",
              inputMode: "text",
              questionType: "open",
              options: [],
              maxTime: templateData.questionTime,
              position: questions.length + i,
              affectsKnowledge: true,
              variants: [{
                text: text,
                referenceAnswer: null,
                attachments: [],
                options: [],
                position: 1,
              }],
            }));

            setQuestions([...questions, ...newQuestions]);
            setGenOpen(false);
            setIsGenerating(false);
            setGenerationProgress(null);

          } else if (statusData.status === 'failed') {
            // Генерация завершилась с ошибкой
            clearInterval(pollInterval);
            throw new Error(statusData.error || _(msg`Ошибка генерации вопросов`));
          }

        } catch (pollError: any) {
          clearInterval(pollInterval);
          throw pollError;
        }
      }, 2000); // Проверяем каждые 2 секунды

      // Устанавливаем таймаут на 5 минут
      setTimeout(() => {
        clearInterval(pollInterval);
        if (isGenerating) {
          setError(_(msg`Превышено время ожидания генерации`));
          setIsGenerating(false);
          setGenerationProgress(null);
        }
      }, 300000); // 5 минут

    } catch (err: any) {
      setError(err.message);
      setIsGenerating(false);
      setGenerationProgress(null);
    }
  };

  const getProgressMessage = (status: string, elapsedTime?: number) => {
    const timeStr = elapsedTime ? _(msg` (${elapsedTime}с)`) : '';

    switch (status) {
      case 'pending':
        return _(msg`Ожидание в очереди${timeStr}...`);
      case 'processing':
        return _(msg`Генерация вопросов${timeStr}...`);
      case 'completed':
        return _(msg`Генерация завершена!`);
      case 'failed':
        return _(msg`Ошибка генерации`);
      default:
        return _(msg`Обработка${timeStr}...`);
    }
  };

  if (!token) {
    return (
      <PageContainer title={_(msg`Создание вакансии`)} description="Создание новой вакансии с тестом">
        <Box sx={{ p: 4 }}>
          <Typography><Trans>Нет доступа</Trans></Typography>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer title={_(msg`Создание вакансии`)} description="Создание новой вакансии с тестом">
      <Box>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2} mb={4}>
          <Box display="flex" alignItems="center" gap={2}>
            <IconBriefcase size={40} color="#1976d2" />
            <Typography variant="h3" fontWeight={800} sx={{ color: 'text.primary' }}><Trans>Создание вакансии</Trans></Typography>
            </Box>
          <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
              startIcon={<IconArrowLeft size={20} />}
            onClick={() => router.push("/hr/vacancies")}
              sx={{ fontWeight: 500, borderWidth: 2 }}
          >
              <Trans>Назад</Trans>
          </Button>
            <Button
              variant="contained"
              startIcon={<IconPlus size={24} />}
              onClick={createVacancyWithTemplate}
              disabled={isLoading || !vacancyData.title || questions.length === 0}
              sx={{ fontWeight: 700, fontSize: '1.1rem', px: 4, py: 1.5 }}
            >
              {isLoading ? <CircularProgress size={22} color="inherit" sx={{ mr: 1 }} /> : null}
              {isLoading ? _(msg`Создание...`) : _(msg`Создать вакансию`)}
            </Button>
          </Stack>
        </Box>

        {/* Основной контент */}
        <Stack spacing={4}>
          {/* Vacancy Information */}
          <Card sx={{ background: '#fff', color: 'text.primary', position: 'relative', overflow: 'hidden' }}>
            <CardContent sx={{ position: 'relative', zIndex: 1, p: 4 }}>
              <Stack spacing={3}>
                <Box>
                <CustomFormLabel
                  htmlFor="vacancy-title"
                    sx={{ color: 'text.primary', fontSize: '1.1rem', fontWeight: 600, mb: 1 }}
                >
                  <Trans>Название вакансии</Trans>
                </CustomFormLabel>
                <CustomTextField
                  id="vacancy-title"
                  variant="outlined"
                  fullWidth
                  value={vacancyData.title}
                  onChange={(e: any) =>
                    setVacancyData({ ...vacancyData, title: e.target.value })
                  }
                    placeholder={_(msg`Например: Frontend-разработчик`)}
                    error={!vacancyData.title}
                    helperText={!vacancyData.title ? _(msg`Название обязательно`) : _(msg`Введите название вакансии, которое будет видно кандидатам`)}
                    FormHelperTextProps={{ sx: { color: !vacancyData.title ? 'error.main' : 'text.secondary', opacity: 0.9 } }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                        backgroundColor: '#f7f7f7',
                      borderRadius: 2,
                    },
                    '& .MuiInputBase-input': {
                      fontSize: '1.1rem',
                      padding: '16px 20px'
                    }
                  }}
                />
              </Box>
              <Box>
                <CustomFormLabel
                  htmlFor="vacancy-description"
                    sx={{ color: 'text.primary', fontSize: '1.1rem', fontWeight: 600, mb: 1 }}
                >
                  <Trans>Описание вакансии</Trans>
                </CustomFormLabel>
                <RichTextEditor
                  value={vacancyData.description}
                  onChange={(value) => setVacancyData({ ...vacancyData, description: value })}
                  placeholder={_(msg`Опишите требования, обязанности и условия работы`)}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  <Trans>Используйте форматирование для лучшей читаемости</Trans>
                </Typography>
              </Box>

              {/* Company Video URL */}
              <Box>
                <CustomFormLabel
                  htmlFor="company-video-url"
                  sx={{ color: 'text.primary', fontSize: '1.1rem', fontWeight: 600, mb: 1 }}
                >
                  <Trans>Видео о компании</Trans>
                </CustomFormLabel>
                <CustomTextField
                  id="company-video-url"
                  variant="outlined"
                  fullWidth
                  value={vacancyData.companyVideoUrl || ""}
                  onChange={(e: any) => 
                    setVacancyData({ ...vacancyData, companyVideoUrl: e.target.value })
                  }
                  placeholder={_(msg`https://www.youtube.com/watch?v=... или https://vimeo.com/...`)}
                  helperText={_(msg`Добавьте ссылку на видео о компании. Поддерживаются: YouTube, Vimeo, Rutube, VK Video`)}
                  FormHelperTextProps={{ sx: { color: 'text.secondary', opacity: 0.9 } }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f7f7f7',
                      borderRadius: 2,
                    },
                    '& .MuiInputBase-input': {
                      fontSize: '1rem',
                      padding: '14px 20px'
                    }
                  }}
                />
                
                {/* Video Preview */}
                {vacancyData.companyVideoUrl && (() => {
                  const embedUrl = getVideoEmbedUrl(vacancyData.companyVideoUrl);
                  if (embedUrl) {
                    return (
                      <Box sx={{ mt: 3 }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1, 
                          mb: 1.5,
                          p: 1.5,
                          bgcolor: '#e8f5e9',
                          borderRadius: 1,
                          border: '1px solid #c8e6c9'
                        }}>
                          <Box sx={{ 
                            width: 8, 
                            height: 8, 
                            borderRadius: '50%', 
                            bgcolor: '#4caf50',
                            boxShadow: '0 0 0 2px rgba(76, 175, 80, 0.2)'
                          }} />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                            <Trans>Превью видео (как увидят кандидаты):</Trans>
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            position: "relative",
                            paddingBottom: "56.25%", // 16:9 aspect ratio
                            height: 0,
                            overflow: "hidden",
                            borderRadius: 2,
                            bgcolor: "#000",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                          }}
                        >
                          <iframe
                            src={embedUrl}
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              border: "none",
                            }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={_(msg`Превью видео о компании`)}
                          />
                        </Box>
                      </Box>
                    );
                  } else {
                    return (
                      <Box sx={{ 
                        mt: 2, 
                        p: 1.5, 
                        bgcolor: '#fff3e0', 
                        borderRadius: 1,
                        border: '1px solid #ffe0b2',
                        display: 'flex',
                        gap: 1,
                        alignItems: 'flex-start'
                      }}>
                        <Typography variant="body2" sx={{ color: '#e65100' }}>
                          ⚠️
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#e65100', flex: 1 }}>
                          <Trans>Не удалось распознать ссылку на видео. Проверьте формат URL.</Trans>
                        </Typography>
                      </Box>
                    );
                  }
                })()}
              </Box>
              </Stack>
            </CardContent>
          </Card>
          <Divider sx={{ my: 0 }} />
          
          {/* Test Settings */}
          <QuestionTimeSettings
            value={templateData.questionTime}
            onChange={(newTime) => {
              const oldGlobalTime = templateData.questionTime;
              setTemplateData({ ...templateData, questionTime: newTime });
              
              // 🧠 Умная логика: обновляем только вопросы, которые "следуют" за глобальным временем
              setQuestions(questions.map(q => 
                q.maxTime === oldGlobalTime 
                  ? { ...q, maxTime: newTime }  // ✅ Обновляем "дефолтные"
                  : q                            // ⏸️ Оставляем "кастомные" как есть
              ));
            }}
            showFormattedTime={true}
          />
          
          <Divider sx={{ my: 0 }} />
          {/* Questions */}
          <Card sx={{ background: '#fff', color: 'text.primary', position: 'relative', overflow: 'hidden' }}>
            <CardContent sx={{ position: 'relative', zIndex: 1, p: 4 }}>
              <Stack spacing={3}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={2}>
                    <IconFileText size={32} color="#1976d2" />
                    <Typography variant="h4" fontWeight={700} sx={{ color: 'text.primary' }}><Trans>Вопросы теста</Trans></Typography>
                  <Chip
                    label={questions.length}
                    sx={{
                        backgroundColor: '#e3f2fd',
                        color: '#1976d2',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      height: 32
                    }}
                  />
                </Box>
                <Box display="flex" gap={2} alignItems="center">
                  <Tooltip title={expertMode ? _(msg`Выключить экспертный режим`) : _(msg`Включить экспертный режим (дополнительные настройки вопросов)`)}>
                    <Button
                      variant={expertMode ? "contained" : "outlined"}
                      startIcon={<IconSettings size={20} />}
                      onClick={() => setExpertMode(!expertMode)}
                      sx={{
                        color: expertMode ? '#fff' : '#1976d2',
                        backgroundColor: expertMode ? '#1976d2' : 'transparent',
                        borderColor: '#1976d2',
                        fontWeight: 600,
                        '&:hover': {
                          backgroundColor: expertMode ? '#1565c0' : '#e3f2fd',
                        }
                      }}
                    >
                      {expertMode ? <Trans>Экспертный режим</Trans> : <Trans>Экспертный режим</Trans>}
                    </Button>
                  </Tooltip>
                  <Button
                    variant="contained"
                      startIcon={<IconPlus size={20} />}
                    onClick={addQuestion}
                    sx={{
                        backgroundColor: '#1976d2',
                      fontWeight: 600,
                      '&:hover': {
                          backgroundColor: '#1565c0',
                      }
                    }}
                  >
                    <Trans>Добавить вопрос</Trans>
                  </Button>
                  <Button
                      variant="outlined"
                      startIcon={<IconWand size={20} />}
                    onClick={() => setGenOpen(true)}
                    sx={{
                        color: '#1976d2',
                        borderColor: '#1976d2',
                      fontWeight: 600,
                      '&:hover': {
                          backgroundColor: '#e3f2fd',
                      }
                    }}
                  >
                    <Trans>Сгенерировать</Trans>
                  </Button>
                </Box>
              </Box>

              {questions.map((question, qIndex) => (
                <QuestionFormItem
                  key={qIndex}
                  question={question}
                  index={qIndex}
                  totalCount={questions.length}
                  onUpdate={updateQuestion}
                  onRemove={removeQuestion}
                  onMoveUp={moveQuestionUp}
                  onMoveDown={moveQuestionDown}
                  showTypeSelector={expertMode}
                  variant="create"
                  expertMode={expertMode}
                  globalMaxTime={templateData.questionTime}
                />
              ))}

              {questions.length === 0 && (
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    py={6}
                    px={4}
                    sx={{
                      border: "2px dashed #e0e0e0",
                      borderRadius: 2,
                      backgroundColor: "#fafafa",
                      minHeight: 300
                    }}
                  >
                    <Box sx={{
                      p: 3,
                      borderRadius: 3,
                      background: '#e3f2fd',
                      mb: 3
                    }}>
                      <IconFileText size={64} color="#1976d2" />
                    </Box>
                    <Typography variant="h5" sx={{ color: 'text.primary', mb: 2, fontWeight: 600 }}><Trans>Нет вопросов</Trans></Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, textAlign: "center", opacity: 0.9, maxWidth: 400 }}><Trans>Добавьте вопросы для тестирования кандидатов. Вы можете создать их вручную или использовать AI для генерации.</Trans></Typography>
                    <Box display="flex" gap={3}>
                      <Button
                        variant="contained"
                        startIcon={<IconPlus size={24} />}
                        onClick={addQuestion}
                        sx={{
                          backgroundColor: '#1976d2',
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          px: 4,
                          py: 2,
                          '&:hover': {
                            backgroundColor: '#1565c0',
                          }
                        }}
                      >
                        <Trans>Добавить вопрос</Trans>
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<IconWand size={24} />}
                        onClick={() => setGenOpen(true)}
                        sx={{
                          color: '#1976d2',
                          borderColor: '#1976d2',
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          px: 4,
                          py: 2,
                          '&:hover': {
                            backgroundColor: '#e3f2fd',
                          }
                        }}
                      >
                        <Trans>Сгенерировать</Trans>
                      </Button>
                    </Box>
                  </Box>
                )}

                {/* Bottom controls for questions */}
                {questions.length > 0 && (
                  <Box sx={{
                    mt: 4,
                    pt: 3,
                    borderTop: '1px solid #e0e0e0',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 2
                  }}>
                    <Tooltip title={expertMode ? _(msg`Выключить экспертный режим`) : _(msg`Включить экспертный режим (дополнительные настройки вопросов)`)}>
                      <Button
                        variant={expertMode ? "contained" : "outlined"}
                        startIcon={<IconSettings size={20} />}
                        onClick={() => setExpertMode(!expertMode)}
                        sx={{
                          color: expertMode ? '#fff' : '#1976d2',
                          backgroundColor: expertMode ? '#1976d2' : 'transparent',
                          borderColor: '#1976d2',
                          fontWeight: 600,
                          '&:hover': {
                            backgroundColor: expertMode ? '#1565c0' : '#e3f2fd',
                          }
                        }}
                      >
                        {expertMode ? <Trans>Экспертный режим</Trans> : <Trans>Экспертный режим</Trans>}
                      </Button>
                    </Tooltip>
                    <Button
                      variant="contained"
                      startIcon={<IconPlus size={20} />}
                      onClick={addQuestion}
                      sx={{
                        backgroundColor: '#1976d2',
                        fontWeight: 600,
                        '&:hover': {
                          backgroundColor: '#1565c0',
                        }
                      }}
                    >
                      <Trans>Добавить вопрос</Trans>
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<IconWand size={20} />}
                      onClick={() => setGenOpen(true)}
                      sx={{
                        color: '#1976d2',
                        borderColor: '#1976d2',
                        fontWeight: 600,
                        '&:hover': {
                          backgroundColor: '#e3f2fd',
                        }
                      }}
                    >
                      <Trans>Сгенерировать</Trans>
                    </Button>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Stack>

        {/* Save/Cancel Buttons */}
          <Card sx={{
          background: '#fff',
          color: 'text.primary',
            position: 'relative',
          overflow: 'hidden',
          mt: 4,
          boxShadow: 1
        }}>
            <CardContent sx={{ position: 'relative', zIndex: 1, p: 4 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 3, backgroundColor: 'rgba(255,255,255,0.9)' }}>
                  {error}
                </Alert>
              )}
            <Box display="flex" gap={2} justifyContent="flex-end" alignItems="center">
                <Button
                  variant="outlined"
                startIcon={<IconArrowLeft size={20} />}
                  onClick={() => router.push("/hr/vacancies")}
                sx={{ fontWeight: 500, borderWidth: 2 }}
                >
                <Trans>Назад</Trans>
                </Button>
                <Button
                  variant="contained"
                startIcon={<IconBriefcase size={24} />}
                  onClick={createVacancyWithTemplate}
                  disabled={!vacancyData.title || isLoading}
                sx={{ fontWeight: 700, fontSize: '1.1rem', px: 4, py: 1.5 }}
              >
                {isLoading ? <CircularProgress size={22} color="inherit" sx={{ mr: 1 }} /> : null}
                {isLoading ? _(msg`Создание...`) : _(msg`Создать вакансию`)}
                </Button>
              </Box>
            </CardContent>
          </Card>

        {/* Generate Questions Dialog */}
        <Dialog
          open={genOpen}
          onClose={() => setGenOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              background: '#fff'
            }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Box sx={{
                p: 1.5,
                borderRadius: 2,
                background: '#e3f2fd'
              }}>
                <IconWand size={28} color="#1976d2" />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight="700" sx={{ color: 'text.primary' }}><Trans>Сгенерировать вопросы с помощью AI</Trans></Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}><Trans>AI создаст релевантные вопросы для вашей вакансии</Trans></Typography>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Box sx={{ mb: 3 }}>
              <CustomFormLabel
                htmlFor="gen-count"
                sx={{
                  color: 'text.primary',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  mb: 2
                }}
              >
                <Trans>Количество вопросов</Trans>
              </CustomFormLabel>
              <CustomTextField
                id="gen-count"
                type="number"
                variant="outlined"
                fullWidth
                value={genCount}
                onChange={(e: any) => setGenCount(Number(e.target.value))}
                inputProps={{ min: 1, max: 20 }}
                helperText={_(msg`Выберите количество вопросов от 1 до 20`)}
              FormHelperTextProps={{
                  sx: { color: 'text.secondary', opacity: 0.9 }
              }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#f7f7f7',
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: '#f0f0f0',
                    },
                    '&.Mui-focused': {
                      backgroundColor: '#fff',
                    }
                  },
                  '& .MuiInputBase-input': {
                    fontSize: '1.1rem',
                    padding: '16px 20px'
                  }
                }}
              />
            </Box>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            {generationProgress && (
              <Box sx={{ mt: 2, p: 2, bgcolor: '#f0f8ff', borderRadius: 2, border: '1px solid #e3f2fd' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {generationProgress.message}
                  </Typography>
                </Box>
                {generationProgress.elapsed_time && (
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}><Trans>
                    Прошло времени: {generationProgress.elapsed_time} секунд
                  </Trans></Typography>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button
              onClick={() => setGenOpen(false)}
              disabled={isGenerating}
              sx={{
                color: 'text.secondary',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                }
              }}
            >
              <Trans>Отмена</Trans>
            </Button>
            <Button
              variant="contained"
              onClick={generateQuestions}
              disabled={isGenerating || !vacancyData.title}
              startIcon={<IconWand size={20} />}
              sx={{
                backgroundColor: '#1976d2',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: '#1565c0',
                },
                '&:disabled': {
                  backgroundColor: '#e0e0e0',
                  color: '#9e9e9e',
                }
              }}
            >
              {isGenerating ? _(msg`Генерация...`) : _(msg`Сгенерировать`)}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageContainer>
  );
}
