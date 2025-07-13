"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
  IconDeviceFloppy,
  IconArrowLeft,
} from "@tabler/icons-react";
import PageContainer from "@/app/components/container/PageContainer";
import { apiFetch } from "@/utils/api";

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

interface QuestionDraft {
  id?: number;
  text: string;
  type: string;
  maxTime: number;
  allowFollowups: boolean;
  followupsMax: number;
  position?: number;
}

interface VacancyData {
  id: number;
  title: string;
  description: string;
  template?: {
    id: number;
    title: string;
    description: string;
  };
  questions: QuestionDraft[];
}

export default function HRVacancyEditPage() {
  const router = useRouter();
  const params = useParams();
  const vacancyId = params.id as string;
  
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [genOpen, setGenOpen] = useState(false);
  const [genCount, setGenCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);

  // Vacancy data
  const [vacancyData, setVacancyData] = useState<VacancyData>({
    id: 0,
    title: "",
    description: "",
    template: undefined,
    questions: [],
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

  useEffect(() => {
    if (token && vacancyId) {
      loadVacancyData();
    }
  }, [token, vacancyId]);

  const loadVacancyData = async () => {
    if (!token || !vacancyId) return;
    
    setIsLoadingData(true);
    setError(null);

    try {
      const response = await apiFetch(`${API_BASE}/api/admin/vacancies/${vacancyId}/full`);
      
      if (!response.ok) {
        throw new Error("Ошибка загрузки данных вакансии");
      }

      const data = await response.json();
      
      setVacancyData(data);
      setQuestions(data.questions || []);
      
      // Устанавливаем время на вопрос на основе первого вопроса или по умолчанию
      if (data.questions && data.questions.length > 0) {
        setTemplateData({
          questionTime: data.questions[0].maxTime || 180,
          allowFollowups: data.questions[0].allowFollowups || false,
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
          templateTitle: vacancyData.template?.title || `Тест для вакансии: ${vacancyData.title}`,
          templateDescription: vacancyData.template?.description || `Тест для вакансии "${vacancyData.title}"`,
          questions: questions,
        }),
      });

      if (!response.ok) {
        throw new Error("Ошибка обновления вакансии с тестом");
      }

      const result = await response.json();
      
      // Перенаправляем на страницу вакансий
      router.push(`/hr-vacancies`);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
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
      <PageContainer title="Редактирование вакансии" description="Редактирование вакансии с тестом">
        <Box sx={{ p: 4 }}>
          <Typography>Нет доступа</Typography>
        </Box>
      </PageContainer>
    );
  }

  if (isLoadingData) {
    return (
      <PageContainer title="Редактирование вакансии" description="Редактирование вакансии с тестом">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Редактирование вакансии" description="Редактирование вакансии с тестом">
      <Box>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
          <Box display="flex" alignItems="center" gap={2}>
            <Box sx={{
              p: 2,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}>
              <IconBriefcase size={32} />
            </Box>
            <Box>
              <Typography variant="h3" fontWeight="700" sx={{ mb: 1 }}>
                Редактирование вакансии
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Обновите информацию о вакансии и тесте
              </Typography>
            </Box>
          </Box>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<IconArrowLeft size={20} />}
              onClick={() => router.push("/hr-vacancies")}
              sx={{
                fontSize: '1rem',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                borderWidth: 2
              }}
            >
              Назад к списку
            </Button>
            <Button
              variant="contained"
              startIcon={<IconDeviceFloppy size={20} />}
              onClick={updateVacancyWithTemplate}
              disabled={isSaving || !vacancyData.title || questions.length === 0}
              sx={{
                fontSize: '1rem',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                }
              }}
            >
              {isSaving ? "Сохранение..." : "Сохранить изменения"}
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Vacancy Information */}
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box sx={{
              position: 'absolute',
              top: -20,
              right: -20,
              width: 120,
              height: 120,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              zIndex: 0
            }} />
            <CardContent sx={{ position: 'relative', zIndex: 1, p: 4 }}>
              <Box display="flex" alignItems="center" gap={2} mb={4}>
                <Box sx={{
                  p: 2,
                  borderRadius: 2,
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <IconBriefcase size={32} color="white" />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="700" sx={{ mb: 1 }}>
                    Информация о вакансии
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Обновите привлекательное описание для кандидатов
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ mb: 4 }}>
                <CustomFormLabel 
                  htmlFor="vacancy-title"
                  sx={{ 
                    color: 'white', 
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    mb: 2
                  }}
                >
                  Название вакансии
                </CustomFormLabel>
                <CustomTextField
                  id="vacancy-title"
                  variant="outlined"
                  fullWidth
                  value={vacancyData.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVacancyData({ ...vacancyData, title: e.target.value })}
                  helperText="Введите название вакансии, которое будет видно кандидатам"
                  FormHelperTextProps={{
                    sx: { color: 'white', opacity: 0.9 }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      borderRadius: 2,
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,1)',
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'white',
                      }
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
                  sx={{ 
                    color: 'white', 
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    mb: 2
                  }}
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVacancyData({ ...vacancyData, description: e.target.value })}
                  helperText="Опишите требования, обязанности и условия работы"
                  FormHelperTextProps={{
                    sx: { color: 'white', opacity: 0.9 }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      borderRadius: 2,
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,1)',
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'white',
                      }
                    },
                    '& .MuiInputBase-input': {
                      fontSize: '1.1rem',
                      padding: '16px 20px'
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>

          {/* Test Settings */}
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box sx={{
              position: 'absolute',
              bottom: -30,
              left: -30,
              width: 150,
              height: 150,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              zIndex: 0
            }} />
            <CardContent sx={{ position: 'relative', zIndex: 1, p: 4 }}>
              <Box display="flex" alignItems="center" gap={2} mb={4}>
                <Box sx={{
                  p: 2,
                  borderRadius: 2,
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <IconSettings size={32} color="white" />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="700" sx={{ mb: 1 }}>
                    Настройки теста
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Настройте параметры тестирования кандидатов
                  </Typography>
                </Box>
              </Box>
              
              <Box>
                <CustomFormLabel 
                  sx={{ 
                    color: 'white', 
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    mb: 2
                  }}
                >
                  Время на один вопрос
                </CustomFormLabel>
                
                {/* Preset buttons */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ color: 'white', opacity: 0.9, mb: 2 }}>
                    Быстрый выбор:
                  </Typography>
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
                          minWidth: 'auto',
                          px: 2,
                          py: 1,
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          backgroundColor: templateData.questionTime === time 
                            ? 'rgba(255,255,255,0.3)' 
                            : 'rgba(255,255,255,0.1)',
                          color: 'white',
                          border: '1px solid rgba(255,255,255,0.3)',
                          '&:hover': {
                            backgroundColor: templateData.questionTime === time 
                              ? 'rgba(255,255,255,0.4)' 
                              : 'rgba(255,255,255,0.2)',
                          },
                          '&.MuiButton-contained': {
                            backgroundColor: 'rgba(255,255,255,0.3)',
                            '&:hover': {
                              backgroundColor: 'rgba(255,255,255,0.4)',
                            }
                          }
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
                    <Typography variant="body2" sx={{ color: 'white', opacity: 0.8 }}>
                      1 мин
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'white', opacity: 0.8 }}>
                      5 мин
                    </Typography>
                  </Box>
                  <Slider
                    value={templateData.questionTime}
                    onChange={(_, value) => {
                      setTemplateData({ ...templateData, questionTime: value as number });
                      // Обновляем время для всех вопросов
                      setQuestions(questions.map(q => ({ ...q, maxTime: value as number })));
                    }}
                    min={60}
                    max={300}
                    step={30}
                    sx={{
                      '& .MuiSlider-track': {
                        backgroundColor: 'rgba(255,255,255,0.8)',
                        border: 'none',
                      },
                      '& .MuiSlider-rail': {
                        backgroundColor: 'rgba(255,255,255,0.3)',
                      },
                      '& .MuiSlider-thumb': {
                        backgroundColor: 'white',
                        border: '2px solid rgba(255,255,255,0.8)',
                        '&:hover': {
                          boxShadow: '0 0 0 8px rgba(255,255,255,0.2)',
                        },
                        '&.Mui-focusVisible': {
                          boxShadow: '0 0 0 8px rgba(255,255,255,0.2)',
                        },
                      },
                    }}
                  />
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        color: 'white', 
                        fontWeight: 700,
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                      }}
                    >
                      {Math.floor(templateData.questionTime / 60)}:{(templateData.questionTime % 60).toString().padStart(2, '0')}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'white', opacity: 0.8, mt: 0.5 }}>
                      {templateData.questionTime} секунд
                    </Typography>
                  </Box>
                </Box>
                
                <Typography variant="body2" sx={{ color: 'white', opacity: 0.9, mt: 2, textAlign: 'center' }}>
                  Время, отведенное на ответ на каждый вопрос
                </Typography>
              </Box>

              <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.3)' }} />

              <Box>
                <CustomFormLabel 
                  sx={{ 
                    color: 'white', 
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
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setTemplateData({ ...templateData, allowFollowups: e.target.checked });
                        // Обновляем настройки для всех вопросов
                        setQuestions(questions.map(q => ({ 
                          ...q, 
                          allowFollowups: e.target.checked,
                          followupsMax: e.target.checked ? 3 : 0
                        })));
                      }}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: 'white',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: 'rgba(255,255,255,0.5)',
                        },
                      }}
                    />
                    <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                      Разрешить дополнительные вопросы
                    </Typography>
                  </Box>
                  
                  {templateData.allowFollowups && (
                    <Box sx={{ 
                      p: 3, 
                      backgroundColor: 'rgba(255,255,255,0.1)', 
                      borderRadius: 2,
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                      <Typography variant="body2" sx={{ color: 'white', opacity: 0.9, mb: 2 }}>
                        <strong>Как это работает:</strong>
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'white', opacity: 0.8, mb: 1 }}>
                        • Максимум 3 дополнительных вопроса на каждый основной вопрос
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'white', opacity: 0.8, mb: 1 }}>
                        • Дополнительные вопросы задаются автоматически, если кандидат ответил неполно
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'white', opacity: 0.8 }}>
                        • Вопросы генерируются AI на основе ответа кандидата
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Questions */}
          <Card sx={{ 
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box sx={{
              position: 'absolute',
              top: -20,
              right: -20,
              width: 120,
              height: 120,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              zIndex: 0
            }} />
            <CardContent sx={{ position: 'relative', zIndex: 1, p: 4 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box sx={{
                    p: 2,
                    borderRadius: 2,
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <IconFileText size={32} color="white" />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight="700" sx={{ mb: 1 }}>
                      Вопросы теста
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Редактируйте вопросы для оценки навыков кандидатов
                    </Typography>
                  </Box>
                  <Chip 
                    label={questions.length} 
                    sx={{ 
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      height: 32
                    }} 
                  />
                </Box>
                <Box display="flex" gap={2}>
                  <Button
                    variant="contained"
                    startIcon={<IconWand size={24} />}
                    onClick={() => setGenOpen(true)}
                    sx={{
                      background: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.3)',
                      fontSize: '1rem',
                      fontWeight: 600,
                      px: 3,
                      py: 1.5,
                      '&:hover': {
                        background: 'rgba(255,255,255,0.3)',
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
                      background: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.3)',
                      fontSize: '1rem',
                      fontWeight: 600,
                      px: 3,
                      py: 1.5,
                      '&:hover': {
                        background: 'rgba(255,255,255,0.3)',
                      }
                    }}
                  >
                    Добавить вопрос
                  </Button>
                </Box>
              </Box>

              {questions.length === 0 ? (
                <Box textAlign="center" py={6}>
                  <Typography variant="h5" sx={{ color: 'white', mb: 2, opacity: 0.9 }}>
                    Нет вопросов
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'white', opacity: 0.7, mb: 3 }}>
                    Добавьте вопросы вручную или сгенерируйте их автоматически
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<IconPlus size={20} />}
                    onClick={addQuestion}
                    sx={{
                      background: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.3)',
                      fontSize: '1rem',
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                      '&:hover': {
                        background: 'rgba(255,255,255,0.3)',
                      }
                    }}
                  >
                    Добавить первый вопрос
                  </Button>
                </Box>
              ) : (
                <Box>
                  {questions.map((question, qIndex) => (
                    <Paper key={qIndex} sx={{ 
                      p: 3, 
                      mb: 3, 
                      background: 'rgba(255,255,255,0.95)',
                      borderRadius: 3,
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                      <Box display="flex" alignItems="center" gap={2} mb={3}>
                        <Chip 
                          label={`Вопрос ${qIndex + 1}`} 
                          sx={{ 
                            backgroundColor: 'rgba(255,255,255,0.3)',
                            color: 'white',
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
                          sx={{ 
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            mb: 2
                          }}
                        >
                          Текст вопроса
                        </CustomFormLabel>
                        <CustomTextField
                          variant="outlined"
                          fullWidth
                          multiline
                          rows={3}
                          value={question.text}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuestion(qIndex, "text", e.target.value)}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: 'rgba(255,255,255,0.9)',
                              borderRadius: 2,
                              '&:hover': {
                                backgroundColor: 'rgba(255,255,255,1)',
                              },
                              '&.Mui-focused': {
                                backgroundColor: 'white',
                              }
                            },
                            '& .MuiInputBase-input': {
                              fontSize: '1rem',
                              padding: '16px 20px'
                            }
                          }}
                        />
                      </Box>


                    </Paper>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Generate Questions Dialog */}
        <Dialog open={genOpen} onClose={() => setGenOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Сгенерировать вопросы</DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Количество вопросов для генерации:
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {[3, 5, 7, 10].map((count) => (
                  <Button
                    key={count}
                    variant={genCount === count ? "contained" : "outlined"}
                    size="small"
                    onClick={() => setGenCount(count)}
                  >
                    {count}
                  </Button>
                ))}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setGenOpen(false)}>Отмена</Button>
            <Button
              variant="contained"
              onClick={generateQuestions}
              disabled={isGenerating}
            >
              {isGenerating ? "Генерация..." : "Сгенерировать"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Save/Cancel Buttons */}
        <Card sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          mt: 4
        }}>
          <Box sx={{
            position: 'absolute',
            bottom: -30,
            right: -30,
            width: 150,
            height: 150,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            zIndex: 0
          }} />
          <CardContent sx={{ position: 'relative', zIndex: 1, p: 4 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3, backgroundColor: 'rgba(255,255,255,0.9)' }}>
                {error}
              </Alert>
            )}
            <Box display="flex" gap={3} justifyContent="flex-end" alignItems="center">
              <Button
                variant="outlined"
                onClick={() => router.push("/hr-vacancies")}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.5)',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  px: 4,
                  py: 2,
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  }
                }}
              >
                Отмена
              </Button>
              <Button
                variant="contained"
                onClick={updateVacancyWithTemplate}
                disabled={!vacancyData.title || isSaving}
                startIcon={<IconDeviceFloppy size={24} />}
                sx={{
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  border: '2px solid rgba(255,255,255,0.3)',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  px: 5,
                  py: 2.5,
                  '&:hover': {
                    background: 'rgba(255,255,255,0.3)',
                    border: '2px solid rgba(255,255,255,0.5)',
                  },
                  '&:disabled': {
                    background: 'rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.5)',
                  }
                }}
              >
                {isSaving ? "Сохранение..." : "Сохранить изменения"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </PageContainer>
  );
} 