"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  Alert,
  IconButton,
  Tooltip,
  Chip,
  Grid,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  Slider,
  Stack,
  CircularProgress,
} from "@mui/material";
import CustomTextField from "@/app/components/forms/theme-elements/CustomTextField";
import CustomFormLabel from "@/app/components/forms/theme-elements/CustomFormLabel";
import {
  IconPlus,
  IconTrash,
  IconArrowUp,
  IconArrowDown,
  IconBriefcase,
  IconFileText,
  IconWand,
  IconSettings,
  IconEye,
  IconArrowsShuffle,
  IconArrowLeft,
} from "@tabler/icons-react";
import PageContainer from "@/app/components/container/PageContainer";
import { apiFetch } from "@/utils/api";

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

interface QuestionDraft {
  text: string;
  type: string;
  maxTime: number;
  allowFollowups: boolean;
  followupsMax: number;
  position?: number;
}

export default function HRVacancyCreatePage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [genOpen, setGenOpen] = useState(false);
  const [genCount, setGenCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);

  // Vacancy data
  const [vacancyData, setVacancyData] = useState({
    title: "",
    description: "",
  });

  // Template data
  const [templateData, setTemplateData] = useState({
    questionTime: 180, // время на один вопрос в секундах
    allowFollowups: false, // разрешить дополнительные вопросы
  });

  // Questions
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);

  useEffect(() => {
    const t = localStorage.getItem("recruitment_token");
    if (t) setToken(t);
  }, []);

  const addQuestion = () => {
    const newQuestion: QuestionDraft = {
      text: "",
      type: "text",
      maxTime: templateData.questionTime,
      allowFollowups: templateData.allowFollowups,
      followupsMax: templateData.allowFollowups ? 3 : 0,
      position: questions.length,
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions.map((q, i) => ({ ...q, position: i })));
  };

  const updateQuestion = (index: number, field: keyof QuestionDraft, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

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

  const createVacancyWithTemplate = async () => {
    if (!token || !vacancyData.title) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Создаем вакансию с тестом в одном запросе
      const response = await apiFetch(`${API_BASE}/api/admin/vacancies/with-template`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: vacancyData.title,
          description: vacancyData.description,
          templateTitle: `Тест для вакансии: ${vacancyData.title}`,
          templateDescription: `Тест для вакансии "${vacancyData.title}"`,
          questions: questions,
        }),
      });

      if (!response.ok) {
        throw new Error("Ошибка создания вакансии с тестом");
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
      setError("Сначала заполните название вакансии");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Генерируем вопросы напрямую
      const count = Math.max(1, Math.min(20, genCount));
      const suggestRes = await apiFetch(`${API_BASE}/api/admin/templates/generate-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          count: count,
          vacancyTitle: vacancyData.title,
          vacancyDescription: vacancyData.description,
        }),
      });

      if (suggestRes.ok) {
        const data = await suggestRes.json();
        const newQuestions = (data.questions || []).map((text: string, i: number) => ({
          text: text,
          type: "text",
          maxTime: templateData.questionTime,
          allowFollowups: templateData.allowFollowups,
          followupsMax: templateData.allowFollowups ? 3 : 0,
          position: questions.length + i,
        }));
        
        setQuestions([...questions, ...newQuestions]);
        setGenOpen(false);
      } else {
        throw new Error("Ошибка генерации вопросов");
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!token) {
    return (
      <PageContainer title="Создание вакансии" description="Создание новой вакансии с тестом">
        <Box sx={{ p: 4 }}>
          <Typography>Нет доступа</Typography>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Создание вакансии" description="Создание новой вакансии с тестом">
      <Box>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2} mb={4}>
          <Box display="flex" alignItems="center" gap={2}>
            <IconBriefcase size={40} color="#1976d2" />
            <Typography variant="h3" fontWeight={800} sx={{ color: 'text.primary' }}>
              Создание вакансии
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<IconArrowLeft size={20} />}
              onClick={() => router.push("/hr/vacancies")}
              sx={{ fontWeight: 500, borderWidth: 2 }}
            >
              Назад
            </Button>
            <Button
              variant="contained"
              startIcon={<IconPlus size={24} />}
              onClick={createVacancyWithTemplate}
              disabled={isLoading || !vacancyData.title || questions.length === 0}
              sx={{ fontWeight: 700, fontSize: '1.1rem', px: 4, py: 1.5 }}
            >
              {isLoading ? <CircularProgress size={22} color="inherit" sx={{ mr: 1 }} /> : null}
              {isLoading ? "Создание..." : "Создать вакансию"}
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
                    Название вакансии
                  </CustomFormLabel>
                  <CustomTextField
                    id="vacancy-title"
                    variant="outlined"
                    fullWidth
                    value={vacancyData.title}
                    onChange={(e: any) =>
                      setVacancyData({ ...vacancyData, title: e.target.value })
                    }
                    placeholder="Например: Frontend-разработчик"
                    error={!vacancyData.title}
                    helperText={!vacancyData.title ? "Название обязательно" : "Введите название вакансии, которое будет видно кандидатам"}
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
                    Описание вакансии
                  </CustomFormLabel>
                  <CustomTextField
                    id="vacancy-description"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={5}
                    value={vacancyData.description}
                    onChange={(e: any) =>
                      setVacancyData({ ...vacancyData, description: e.target.value })
                    }
                    placeholder="Опишите требования, обязанности и условия работы"
                    helperText="Опишите требования, обязанности и условия работы"
                    FormHelperTextProps={{ sx: { color: 'text.secondary', opacity: 0.9 } }}
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
              </Stack>
            </CardContent>
          </Card>
          <Divider sx={{ my: 0 }} />
          {/* Test Settings */}
          <Card sx={{ background: '#fff', color: 'text.primary', position: 'relative', overflow: 'hidden' }}>
            <CardContent sx={{ position: 'relative', zIndex: 1, p: 4 }}>
              <Stack spacing={3}>
                <Box display="flex" alignItems="center" gap={2}>
                  <IconSettings size={32} color="#1976d2" />
                  <Typography variant="h4" fontWeight={700} sx={{ color: 'text.primary' }}>
                    Настройки теста
                  </Typography>
                  <Tooltip title="Здесь вы можете задать параметры теста для кандидатов" placement="right">
                    <IconButton size="small"><IconEye size={20} color="#1976d2" /></IconButton>
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
                    Время на один вопрос
                  </CustomFormLabel>
                  
                  {/* Preset buttons */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', opacity: 0.9, mb: 2 }}>
                      Быстрый выбор:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {[60, 90, 120, 150, 180, 210, 240, 270, 300].map((time) => (
                        <Button
                          key={time}
                          variant={templateData.questionTime === time ? "contained" : "outlined"}
                          onClick={() => setTemplateData({ ...templateData, questionTime: time })}
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
                          {time} сек
                        </Button>
                      ))}
                    </Box>
                  </Box>
                  
                  {/* Slider */}
                  <Box sx={{ px: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary', opacity: 0.8 }}>
                        1 мин
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', opacity: 0.8 }}>
                        5 мин
                      </Typography>
                    </Box>
                    <Slider
                      value={templateData.questionTime}
                      onChange={(_, value) => setTemplateData({ ...templateData, questionTime: value as number })}
                      min={60}
                      max={300}
                      step={30}
                      color="primary"
                      sx={{
                        '& .MuiSlider-track': { backgroundColor: '#1976d2' },
                        '& .MuiSlider-thumb': { backgroundColor: '#1976d2' },
                        '& .MuiSlider-rail': { backgroundColor: '#eee' }
                      }}
                    />
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          color: 'text.primary', 
                          fontWeight: 700,
                        }}
                      >
                        {Math.floor(templateData.questionTime / 60)}:{(templateData.questionTime % 60).toString().padStart(2, '0')}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', opacity: 0.8, mt: 0.5 }}>
                        {templateData.questionTime} секунд
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" sx={{ color: 'text.secondary', opacity: 0.9, mt: 2, textAlign: 'center' }}>
                    Время, отведенное на ответ на каждый вопрос
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box>
                  <CustomFormLabel 
                    sx={{ 
                      color: 'text.primary', 
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      mb: 2
                    }}
                  >
                    Дополнительные вопросы
                  </CustomFormLabel>
                  
                  <Box sx={{ mb: 3 }}>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Switch
                        checked={templateData.allowFollowups}
                        onChange={(e: any) => {
                          setTemplateData({ ...templateData, allowFollowups: e.target.checked });
                          // Обновляем настройки для всех вопросов
                          setQuestions(questions.map(q => ({ 
                            ...q, 
                            allowFollowups: e.target.checked,
                            followupsMax: e.target.checked ? 3 : 0
                          })));
                        }}
                        color="primary"
                      />
                      <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 600 }}>
                        Разрешить дополнительные вопросы
                      </Typography>
                    </Box>
                    
                    {templateData.allowFollowups && (
                      <Box sx={{ 
                        p: 3, 
                        backgroundColor: '#f5f5f5', 
                        borderRadius: 2,
                        border: '1px solid #e0e0e0'
                      }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                          <strong>Как это работает:</strong>
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                          • Максимум 3 дополнительных вопроса на каждый основной вопрос
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                          • Дополнительные вопросы задаются автоматически, если кандидат ответил неполно
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          • Вопросы генерируются AI на основе ответа кандидата
                        </Typography>
                      </Box>
                    )}
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
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center" gap={2}>
                    <IconFileText size={32} color="#1976d2" />
                    <Typography variant="h4" fontWeight={700} sx={{ color: 'text.primary' }}>
                      Вопросы теста
                    </Typography>
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
                  <Box display="flex" gap={2}>
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
                      Сгенерировать AI
                    </Button>
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
                      Добавить вопрос
                    </Button>
                  </Box>
                </Box>

                {questions.map((question, qIndex) => (
                  <Paper key={qIndex} sx={{ 
                    p: 3, 
                    background: '#fafafa',
                    borderRadius: 2,
                    border: '1px solid #e0e0e0'
                  }}>
                    <Box display="flex" alignItems="center" gap={2} mb={3}>
                      <Chip 
                        label={`Вопрос ${qIndex + 1}`} 
                        sx={{ 
                          backgroundColor: '#e3f2fd',
                          color: '#1976d2',
                          fontSize: '1rem',
                          fontWeight: 600,
                          height: 28
                        }} 
                      />
                      <Box flexGrow={1} />
                      <Tooltip title="Переместить вверх">
                        <IconButton
                          size="large"
                          onClick={() => moveQuestion(qIndex, "up")}
                          disabled={qIndex === 0}
                          sx={{
                            color: '#1976d2',
                            backgroundColor: '#fff',
                            border: '1px solid #1976d2',
                            '&:hover': {
                              backgroundColor: '#1976d2',
                              color: '#fff',
                            },
                            mr: 1
                          }}
                        >
                          <IconArrowUp size={20} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Переместить вниз">
                        <IconButton
                          size="large"
                          onClick={() => moveQuestion(qIndex, "down")}
                          disabled={qIndex === questions.length - 1}
                          sx={{
                            color: '#1976d2',
                            backgroundColor: '#fff',
                            border: '1px solid #1976d2',
                            '&:hover': {
                              backgroundColor: '#1976d2',
                              color: '#fff',
                            },
                            mr: 1
                          }}
                        >
                          <IconArrowDown size={20} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Удалить вопрос">
                        <IconButton
                          size="large"
                          onClick={() => removeQuestion(qIndex)}
                          sx={{
                            color: '#e53935',
                            backgroundColor: '#fff',
                            border: '1px solid #e53935',
                            '&:hover': {
                              backgroundColor: '#e53935',
                              color: '#fff',
                            }
                          }}
                        >
                          <IconTrash size={20} />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <CustomFormLabel 
                        htmlFor={`question-${qIndex}-text`}
                        sx={{ 
                          color: '#333', 
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          mb: 2
                        }}
                      >
                        Текст вопроса
                      </CustomFormLabel>
                      <CustomTextField
                        id={`question-${qIndex}-text`}
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={3}
                        value={question.text}
                        onChange={(e: any) =>
                          updateQuestion(qIndex, "text", e.target.value)
                        }
                        placeholder="Введите вопрос, на который должен ответить кандидат"
                        helperText="Введите вопрос, на который должен ответить кандидат"
                        FormHelperTextProps={{
                          sx: { color: '#333', opacity: 0.9 }
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: '#fff',
                            borderRadius: 2,
                            '&:hover': {
                              backgroundColor: '#fafafa',
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
                  </Paper>
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
                    <Typography variant="h5" sx={{ color: 'text.primary', mb: 2, fontWeight: 600 }}>
                      Нет вопросов
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, textAlign: "center", opacity: 0.9, maxWidth: 400 }}>
                      Добавьте вопросы для тестирования кандидатов. Вы можете создать их вручную или использовать AI для генерации.
                    </Typography>
                    <Box display="flex" gap={3}>
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
                        Сгенерировать AI
                      </Button>
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
                        Добавить вопрос
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
                      Сгенерировать AI
                    </Button>
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
                      Добавить вопрос
                    </Button>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Stack>

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
                <Typography variant="h5" fontWeight="700" sx={{ color: 'text.primary' }}>
                  Сгенерировать вопросы с помощью AI
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  AI создаст релевантные вопросы для вашей вакансии
                </Typography>
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
                Количество вопросов
              </CustomFormLabel>
              <CustomTextField
                id="gen-count"
                type="number"
                variant="outlined"
                fullWidth
                value={genCount}
                onChange={(e: any) => setGenCount(Number(e.target.value))}
                inputProps={{ min: 1, max: 20 }}
                helperText="Выберите количество вопросов от 1 до 20"
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
              Отмена
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
              {isGenerating ? "Генерация..." : "Сгенерировать"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageContainer>
  );
} 