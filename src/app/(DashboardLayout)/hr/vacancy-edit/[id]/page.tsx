"use client";
import React, { useState, useEffect, useCallback, memo, useRef, useMemo } from "react";
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
  Paper,
  IconButton,
  Tooltip,
  Breadcrumbs,
  CircularProgress,
  Chip,
  Slider,
  Switch,
  Alert,
  MenuItem,
} from "@mui/material";
import Link from "next/link";
import { IconBriefcase, IconArrowLeft, IconDeviceFloppy, IconWand, IconPlus, IconArrowUp, IconArrowDown, IconTrash, IconFileText } from "@tabler/icons-react";
import PageContainer from "@/app/components/container/PageContainer";
import CustomFormLabel from "@/app/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/app/components/forms/theme-elements/CustomTextField";
import { apiFetch } from "@/utils/api";
import GenerateQuestionsDialog from "@/components/GenerateQuestionsDialog";

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
  const [genCount, setGenCount] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);

  // Vacancy data
  const [vacancyData, setVacancyData] = useState<VacancyData>({
    id: 0,
    title: "",
    description: "",
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
          followupsMax: templateData.allowFollowups ? templateData.followupsMax : 0,
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
  }, [token, vacancyData.title, vacancyData.description, genCount, templateData.questionTime, templateData.allowFollowups, questions.length]);

  // Обновляем dialogRef.current.onGenerate после объявления generateQuestions
  useEffect(() => {
    dialogRef.current.onGenerate = generateQuestions;
  }, [generateQuestions]);

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
        {/* Breadcrumbs и Header */}
        <Stack spacing={2} mb={4}>
          <Breadcrumbs aria-label="breadcrumb">
            <Link href="/hr/vacancies" style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 500 }}>Вакансии</Link>
            <Typography color="text.primary">Редактирование</Typography>
          </Breadcrumbs>
          <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <IconBriefcase size={40} color="#1976d2" />
              <Typography variant="h3" fontWeight={800} sx={{ color: 'text.primary' }}>
                Редактирование вакансии
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
                startIcon={<IconDeviceFloppy size={24} />}
                onClick={updateVacancyWithTemplate}
                disabled={isSaving || !vacancyData.title || questions.length === 0}
                sx={{ fontWeight: 700, fontSize: '1.1rem', px: 4, py: 1.5 }}
              >
                {isSaving ? <CircularProgress size={22} color="inherit" sx={{ mr: 1 }} /> : null}
                {isSaving ? "Сохранение..." : "Сохранить"}
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
                    Название вакансии
                  </CustomFormLabel>
                  <CustomTextField
                    id="vacancy-title"
                    inputRef={titleInputRef}
                    variant="outlined"
                    fullWidth
                    value={vacancyData.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVacancyData({ ...vacancyData, title: e.target.value })}
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVacancyData({ ...vacancyData, description: e.target.value })}
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
                  {/* IconSettings and IconEye are not imported, assuming they are available or will be added */}
                  {/* <IconSettings size={32} color="#1976d2" /> */}
                  {/* <IconEye size={20} color="#1976d2" /> */}
                  <Typography variant="h4" fontWeight={700} sx={{ color: 'text.primary' }}>
                    Настройки теста
                  </Typography>
                  <Tooltip title="Здесь вы можете задать параметры теста для кандидатов" placement="right">
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
                  
                  <Typography variant="body2" sx={{ color: 'text.secondary', opacity: 0.9, mt: 2, textAlign: 'center' }}>
                    Время, отведенное на ответ на каждый вопрос
                  </Typography>
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
                    Дополнительные вопросы
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
                      <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 600 }}>
                        Разрешить дополнительные вопросы
                      </Typography>
                      {templateData.allowFollowups && (
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" color="textSecondary">
                            Количество:
                          </Typography>
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
                        <Typography variant="body2" sx={{ color: 'text.secondary', opacity: 0.8 }}>
                      Если включено, ИИ сможет задавать дополнительные вопросы на основе ответов кандидата
                        </Typography>
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
                  <Typography variant="h4" fontWeight={700} sx={{ color: 'text.primary' }}>
                    Вопросы теста
                  </Typography>
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
                    Добавить вопрос
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<IconWand size={24} />}
                    onClick={() => setGenOpen(true)}
                    sx={{ background: '#f5f5f5', color: '#1976d2', fontWeight: 600, px: 3, py: 1.5, '&:hover': { background: '#e3e3e3' } }}
                  >
                    Сгенерировать AI
                  </Button>
                </Stack>
                {questions.length === 0 ? (
                  <Box textAlign="center" py={6}>
                    <Typography variant="h5" sx={{ color: 'text.primary', mb: 2, opacity: 0.9 }}>
                      Нет вопросов
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', opacity: 0.7, mb: 3 }}>
                      Добавьте вопросы вручную или сгенерируйте их автоматически
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={3}>
                    {questions.map((question, qIndex) => (
                      <Paper 
                        key={qIndex} 
                        sx={{ 
                          p: 3, 
                          mb: 0, 
                          background: '#f7f7f7', 
                          borderRadius: 3, 
                          border: '1px solid #eee',
                          '&.highlight-question': {
                            backgroundColor: '#e3f2fd',
                            borderColor: '#1976d2',
                            boxShadow: '0 0 10px rgba(25, 118, 210, 0.5)',
                          }
                        }}
                        data-question-id={question.id || qIndex}
                      >
                        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                          <Box sx={{ width: 36, height: 36, borderRadius: '50%', background: '#1976d2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem' }}>{qIndex + 1}</Box>
                          <Typography variant="subtitle1" fontWeight={700} color="text.primary">Вопрос {qIndex + 1}</Typography>
                          <Box flexGrow={1} />
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="Вверх"><span><IconButton size="small" onClick={() => moveQuestion(qIndex, "up")} disabled={qIndex === 0}><IconArrowUp size={18} /></IconButton></span></Tooltip>
                            <Tooltip title="Вниз"><span><IconButton size="small" onClick={() => moveQuestion(qIndex, "down")} disabled={qIndex === questions.length - 1}><IconArrowDown size={18} /></IconButton></span></Tooltip>
                            <Tooltip title="Удалить"><span><IconButton size="small" onClick={() => removeQuestion(qIndex)}><IconTrash size={18} color="#e53935" /></IconButton></span></Tooltip>
                          </Stack>
                        </Stack>
                        <Box>
                          <CustomFormLabel sx={{ fontSize: '1.1rem', fontWeight: 600, mb: 1 }}>Текст вопроса</CustomFormLabel>
                          <CustomTextField
                            variant="outlined"
                            fullWidth
                            multiline
                            rows={3}
                            value={question.text}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuestion(qIndex, "text", e.target.value)}
                            placeholder="Введите текст вопроса"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                backgroundColor: '#fff',
                                borderRadius: 2,
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
        />

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
                Назад
              </Button>
              <Button
                variant="contained"
                startIcon={<IconDeviceFloppy size={24} />}
                onClick={updateVacancyWithTemplate}
                disabled={!vacancyData.title || isSaving}
                sx={{ fontWeight: 700, fontSize: '1.1rem', px: 4, py: 1.5 }}
              >
                {isSaving ? <CircularProgress size={22} color="inherit" sx={{ mr: 1 }} /> : null}
                {isSaving ? "Сохранение..." : "Сохранить"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </PageContainer>
  );
} 