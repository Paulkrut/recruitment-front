"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Box,
  Button,
  Typography,
  TextField,
  Card,
  CardContent,
  Stack,
  Divider,
  IconButton,
  Tooltip,
  Breadcrumbs,
  CircularProgress,
  Chip,
  Slider,
  Switch,
  Alert,
  MenuItem
} from "@mui/material";
import Link from "next/link";
import { IconBriefcase, IconArrowLeft, IconDeviceFloppy, IconWand, IconPlus, IconFileText } from "@tabler/icons-react";
import PageContainer from "@/app/components/container/PageContainer";
import CustomFormLabel from "@/app/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/app/components/forms/theme-elements/CustomTextField";
import { apiFetch } from "@/utils/api";
import GenerateQuestionsDialog from "@/components/GenerateQuestionsDialog";
import { useLingui } from '@lingui/react';
import { msg, Trans } from '@lingui/macro';
import RichTextEditor from "@/components/RichTextEditor";
import VacancyHhAutomationSettings from '@/components/hr/hh-integration/VacancyHhAutomationSettings';
import QuestionFormItem, { QuestionDraft } from "@/components/QuestionFormItem";

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

interface VacancyData {
  id: number;
  title: string;
  description: string;
  companyVideoUrl?: string;
  template?: {
    id: number;
    title: string;
    description: string;
  };
  questions: QuestionDraft[];
}

export default function HRVacancyEditPage() {
  const { _ } = useLingui();

  const router = useRouter();
  const params = useParams();
  const vacancyId = params.id as string;

  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [genOpen, setGenOpen] = useState(false);
  const [genCount, setGenCount] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<{
    status: string;
    elapsed_time?: number;
    message?: string;
  } | null>(null);

  // Vacancy data
  const [vacancyData, setVacancyData] = useState<VacancyData>({
    id: 0,
    title: "",
    description: "",
    companyVideoUrl: "",
    template: undefined,
    questions: [],
  });

  // Получаем параметры из URL для скролла
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setSearchParams(params);
    }
  }, []);

  // Скролл к вопросу после загрузки данных
  useEffect(() => {
    if (vacancyData.questions.length > 0 && searchParams) {
      const scrollToQuestion = searchParams.get('scrollToQuestion');
      if (scrollToQuestion) {
        setTimeout(() => {
          const questionElement = document.querySelector(`[data-question-id="${scrollToQuestion}"]`);
          if (questionElement) {
            questionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            questionElement.classList.add('highlight-question');
            setTimeout(() => {
              questionElement.classList.remove('highlight-question');
            }, 3000);
          }
        }, 500);
      }
    }
  }, [vacancyData.questions, searchParams]);

  // Стабилизированные значения для диалога
  const dialogRef = useRef({
    genCount,
    isGenerating,
    onGenCountChange: (value: number) => setGenCount(value),
    onGenerate: () => {},
    onClose: () => setGenOpen(false)
  });

  // Обновляем ref при изменении значений
  dialogRef.current = {
    genCount,
    isGenerating,
    onGenCountChange: (value: number) => setGenCount(value),
    onGenerate: () => {},
    onClose: () => setGenOpen(false)
  };

  // Оптимизированная функция для изменения количества вопросов
  const handleGenCountChange = useCallback((value: number) => {
    setGenCount(prev => value);
  }, []);

  // Template data
  const [templateData, setTemplateData] = useState({
    questionTime: 180, // время на один вопрос в секундах
    allowFollowups: false, // разрешить дополнительные вопросы
    followupsMax: 1, // количество дополнительных вопросов
  });

  // Questions
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  const titleInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = localStorage.getItem("recruitment_token");
    if (t) setToken(t);
  }, []);

  useEffect(() => {
    if (token && vacancyId) {
      loadVacancyData();
    }
  }, [token, vacancyId]);

  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isLoadingData]);

  const loadVacancyData = async () => {
    if (!token || !vacancyId) return;

    setIsLoadingData(true);
    setError(null);

    try {
      const response = await apiFetch(`${API_BASE}/api/admin/vacancies/${vacancyId}/full`);

      if (!response.ok) {
        throw new Error(_(msg`Ошибка загрузки данных вакансии`));
      }

      const data = await response.json();

      setVacancyData(data);
      setQuestions(data.questions || []);

      // Устанавливаем время на вопрос на основе первого вопроса или по умолчанию
      if (data.questions && data.questions.length > 0) {
        setTemplateData({
          questionTime: data.questions[0].maxTime || 180,
          allowFollowups: data.questions[0].allowFollowups || false,
          followupsMax: data.questions[0].followupsMax || 1,
        });
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoadingData(false);
    }
  };

  const addQuestion = () => {
    const newQuestion: QuestionDraft = {
      text: "",
      type: "text",
      maxTime: templateData.questionTime,
      allowFollowups: templateData.allowFollowups,
      followupsMax: templateData.allowFollowups ? templateData.followupsMax : 0,
      position: questions.length,
    };
    setQuestions([...questions, newQuestion]);
  };

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

  const moveQuestion = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === questions.length - 1)
    ) {
      return;
    }

    const newQuestions = [...questions];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    [newQuestions[index], newQuestions[targetIndex]] = [
      newQuestions[targetIndex],
      newQuestions[index],
    ];

    setQuestions(newQuestions.map((q, i) => ({ ...q, position: i })));
  };

  const updateVacancyWithTemplate = async () => {
    if (!token || !vacancyData.title) return;

    setIsSaving(true);
    setError(null);

    try {
      // Обновляем вакансию с тестом в одном запросе
      const response = await apiFetch(`${API_BASE}/api/admin/vacancies/${vacancyId}/with-template`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: vacancyData.title,
          description: vacancyData.description,
          companyVideoUrl: vacancyData.companyVideoUrl || null,
          templateTitle: vacancyData.template?.title || _(msg`Тест для вакансии: ${vacancyData.title}`),
          templateDescription: vacancyData.template?.description || _(msg`Тест для вакансии "${vacancyData.title}"`),
          questions: questions,
        }),
      });

      if (!response.ok) {
        throw new Error(_(msg`Ошибка обновления вакансии с тестом`));
      }

      const result = await response.json();

      // Перенаправляем на детальную страницу вакансии
      router.push(`/hr/vacancies/${vacancyId}`);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const generateQuestions = useCallback(async () => {
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
              maxTime: templateData.questionTime,
              allowFollowups: templateData.allowFollowups,
              followupsMax: templateData.allowFollowups ? templateData.followupsMax : 0,
              position: questions.length + i,
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
  }, [token, vacancyData.title, vacancyData.description, genCount, templateData.questionTime, templateData.allowFollowups, questions.length]);

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

  // Обновляем dialogRef.current.onGenerate после объявления generateQuestions
  useEffect(() => {
    dialogRef.current.onGenerate = generateQuestions;
  }, [generateQuestions]);

  if (!token) {
    return (
      <PageContainer title={_(msg`Редактирование вакансии`)} description="Редактирование вакансии с тестом">
        <Box sx={{ p: 4 }}>
          <Typography><Trans>Нет доступа</Trans></Typography>
        </Box>
      </PageContainer>
    );
  }

  if (isLoadingData) {
    return (
      <PageContainer title={_(msg`Редактирование вакансии`)} description="Редактирование вакансии с тестом">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer title={_(msg`Редактирование вакансии`)} description="Редактирование вакансии с тестом">
      <Box>
        {/* Breadcrumbs и Header */}
        <Stack spacing={2} mb={4}>
          <Breadcrumbs aria-label="breadcrumb">
            <Link href="/hr/vacancies" style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 500 }}><Trans>Вакансии</Trans></Link>
            <Typography color="text.primary"><Trans>Редактирование</Trans></Typography>
          </Breadcrumbs>
          <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <IconBriefcase size={40} color="#1976d2" />
              <Typography variant="h3" fontWeight={800} sx={{ color: 'text.primary' }}><Trans>Редактирование вакансии</Trans></Typography>
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
                startIcon={<IconDeviceFloppy size={24} />}
                onClick={updateVacancyWithTemplate}
                disabled={isSaving || !vacancyData.title || questions.length === 0}
                sx={{ fontWeight: 700, fontSize: '1.1rem', px: 4, py: 1.5 }}
              >
                {isSaving ? <CircularProgress size={22} color="inherit" sx={{ mr: 1 }} /> : null}
                {isSaving ? _(msg`Сохранение...`) : _(msg`Сохранить`)}
              </Button>
            </Stack>
          </Box>
        </Stack>
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
                    inputRef={titleInputRef}
                    variant="outlined"
                    fullWidth
                    value={vacancyData.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVacancyData({ ...vacancyData, title: e.target.value })}
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
                  <Box sx={{ display: 'none', '& .MuiInputBase-input': {
                        fontSize: '1.1rem',
                        padding: '16px 20px'
                      }
                    }}
                  />
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
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
          <Card sx={{ background: '#fff', color: 'text.primary', position: 'relative', overflow: 'hidden' }}>
            <CardContent sx={{ position: 'relative', zIndex: 1, p: 4 }}>
              <Stack spacing={3}>
                <Box display="flex" alignItems="center" gap={2}>
                  {/* IconSettings and IconEye are not imported, assuming they are available or will be added */}
                  {/* <IconSettings size={32} color="#1976d2" /> */}
                  {/* <IconEye size={20} color="#1976d2" /> */}
                  <Typography variant="h4" fontWeight={700} sx={{ color: 'text.primary' }}><Trans>Настройки теста</Trans></Typography>
                  <Tooltip title={_(msg`Здесь вы можете задать параметры теста для кандидатов`)} placement="right">
                    <IconButton size="small"><IconFileText size={20} color="#1976d2" /></IconButton>
                  </Tooltip>
                </Box>

                <Box>
                  <CustomFormLabel
                    sx={{
                      color: 'text.primary',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      mb: 2
                    }}
                  >
                    <Trans>Время на один вопрос</Trans>
                  </CustomFormLabel>

                  {/* Preset buttons */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', opacity: 0.9, mb: 2 }}><Trans>Быстрый выбор:</Trans></Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {[60, 90, 120, 150, 180, 210, 240, 270, 300].map((time) => (
                        <Button
                          key={time}
                          variant={templateData.questionTime === time ? "contained" : "outlined"}
                          onClick={() => {
                            setTemplateData({ ...templateData, questionTime: time });
                            // Обновляем время для всех вопросов
                            setQuestions(questions.map(q => ({ ...q, maxTime: time })));
                          }}
                          sx={{
                            backgroundColor: templateData.questionTime === time ? "#e3f2fd" : "#fff",
                            color: "#1976d2",
                            borderColor: "#1976d2",
                            fontWeight: 600,
                            minWidth: 'auto',
                            px: 2,
                            py: 1,
                            fontSize: '0.9rem',
                            '&:hover': { backgroundColor: "#bbdefb" }
                          }}
                        >
                          <Trans>{time} сек</Trans>
                        </Button>
                      ))}
                    </Box>
                  </Box>

                  {/* Slider */}
                  <Box sx={{ px: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary', opacity: 0.8 }}><Trans>1 мин</Trans></Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', opacity: 0.8 }}><Trans>5 мин</Trans></Typography>
                    </Box>
                    <Slider
                      value={templateData.questionTime}
                      onChange={(_, value) => {
                        setTemplateData(prev => ({ ...prev, questionTime: value as number }));
                      }}
                      min={60}
                      max={600}
                      step={30}
                      color="primary"
                      sx={{
                        '& .MuiSlider-track': { backgroundColor: '#1976d2' },
                        '& .MuiSlider-thumb': { backgroundColor: '#1976d2' },
                        '& .MuiSlider-rail': { backgroundColor: '#eee' }
                      }}
                    />
                  </Box>

                  <Typography variant="body2" sx={{ color: 'text.secondary', opacity: 0.9, mt: 2, textAlign: 'center' }}><Trans>Время, отведенное на ответ на каждый вопрос</Trans></Typography>
                </Box>

                <Divider sx={{ my: 0, borderColor: '#eee' }} />

                <Box>
                  <CustomFormLabel
                    sx={{
                      color: 'text.primary',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      mb: 2
                    }}
                  >
                    <Trans>Дополнительные вопросы</Trans>
                  </CustomFormLabel>

                  <Box sx={{ mb: 3 }}>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Switch
                        checked={templateData.allowFollowups}
                        onChange={(e) => {
                          setTemplateData(prev => ({ ...prev, allowFollowups: e.target.checked }));
                          // Обновляем настройки для всех вопросов
                          setQuestions(questions.map(q => ({
                            ...q,
                            allowFollowups: e.target.checked,
                            followupsMax: e.target.checked ? 1 : 0
                          })));
                        }}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color: '#1976d2' },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#1976d2' }
                        }}
                      />
                      <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 600 }}><Trans>Разрешить дополнительные вопросы</Trans></Typography>
                      {templateData.allowFollowups && (
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" color="textSecondary"><Trans>Количество:</Trans></Typography>
                          <TextField
                            select
                            value={templateData.followupsMax || 1}
                            onChange={(e) => {
                              const value = Number(e.target.value);
                              setTemplateData(prev => ({ ...prev, followupsMax: value }));
                              // Обновляем настройки для всех вопросов
                              setQuestions(questions.map(q => ({
                                ...q,
                                followupsMax: value
                              })));
                            }}
                            sx={{ width: 80 }}
                            size="small"
                          >
                            <MenuItem value={1}>1</MenuItem>
                            <MenuItem value={2}>2</MenuItem>
                            <MenuItem value={3}>3</MenuItem>
                          </TextField>
                        </Box>
                      )}
                    </Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary', opacity: 0.8 }}><Trans>Если включено, ИИ сможет задавать дополнительные вопросы на основе ответов кандидата</Trans></Typography>
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>
          <Divider sx={{ my: 0 }} />
          {/* Questions */}
          <Card sx={{ background: '#fff', color: 'text.primary', position: 'relative', overflow: 'hidden' }}>
            <CardContent sx={{ position: 'relative', zIndex: 1, p: 4 }}>
              <Stack spacing={3}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <IconFileText size={32} color="#1976d2" />
                  <Typography variant="h4" fontWeight={700} sx={{ color: 'text.primary' }}><Trans>Вопросы теста</Trans></Typography>
                  <Chip
                    label={questions.length}
                    sx={{ backgroundColor: '#f5f5f5', color: '#1976d2', fontSize: '1.1rem', fontWeight: 600, height: 32 }}
                  />
                </Box>
                <Stack direction="row" spacing={2} mb={2}>
                  <Button
                    variant="contained"
                    startIcon={<IconPlus size={24} />}
                    onClick={addQuestion}
                    sx={{ background: '#f5f5f5', color: '#1976d2', fontWeight: 600, px: 3, py: 1.5, '&:hover': { background: '#e3e3e3' } }}
                  >
                    <Trans>Добавить вопрос</Trans>
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<IconWand size={24} />}
                    onClick={() => setGenOpen(true)}
                    sx={{ background: '#f5f5f5', color: '#1976d2', fontWeight: 600, px: 3, py: 1.5, '&:hover': { background: '#e3e3e3' } }}
                  >
                    <Trans>Сгенерировать AI</Trans>
                  </Button>
                </Stack>
                {questions.length === 0 ? (
                  <Box textAlign="center" py={6}>
                    <Typography variant="h5" sx={{ color: 'text.primary', mb: 2, opacity: 0.9 }}><Trans>Нет вопросов</Trans></Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', opacity: 0.7, mb: 3 }}><Trans>Добавьте вопросы вручную или сгенерируйте их автоматически</Trans></Typography>
                  </Box>
                ) : (
                  <Stack spacing={3}>
                    {questions.map((question, qIndex) => (
                      <QuestionFormItem
                        key={question.id || qIndex}
                        question={question}
                        index={qIndex}
                        totalCount={questions.length}
                        onUpdate={updateQuestion}
                        onRemove={removeQuestion}
                        onMoveUp={moveQuestionUp}
                        onMoveDown={moveQuestionDown}
                        showTypeSelector={true}
                        variant="edit"
                      />
                    ))}
                  </Stack>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Stack>

        {/* Generate Questions Dialog */}
        <GenerateQuestionsDialog
          open={genOpen}
          onClose={() => setGenOpen(false)}
          genCount={genCount}
          onGenCountChange={handleGenCountChange}
          onGenerate={generateQuestions}
          isGenerating={isGenerating}
          generationProgress={generationProgress}
          error={error}
        />

        {/* 🤖 АВТОМАТИЗАЦИЯ HH ДЛЯ ЭТОЙ ВАКАНСИИ */}
        <Box mt={4}>
          <VacancyHhAutomationSettings vacancyId={Number(vacancyId)} />
        </Box>

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
                startIcon={<IconDeviceFloppy size={24} />}
                onClick={updateVacancyWithTemplate}
                disabled={!vacancyData.title || isSaving}
                sx={{ fontWeight: 700, fontSize: '1.1rem', px: 4, py: 1.5 }}
              >
                {isSaving ? <CircularProgress size={22} color="inherit" sx={{ mr: 1 }} /> : null}
                {isSaving ? _(msg`Сохранение...`) : _(msg`Сохранить`)}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </PageContainer>
  );
}
