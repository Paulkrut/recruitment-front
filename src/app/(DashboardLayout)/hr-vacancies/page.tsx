"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextareaAutosize,
} from "@mui/material";
import {
  IconPlus,
  IconBriefcase,
  IconSearch,
  IconEye,
  IconEdit,
  IconTrash,
  IconUsers,
  IconTarget,
  IconCheck,
} from "@tabler/icons-react";
import PageContainer from "@/app/components/container/PageContainer";
import { apiFetch } from "@/utils/api";

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

interface VacancyRow {
  id: number;
  title: string;
  description?: string;
  templateId?: number | null;
  candidatesTotal?: number;
  candidatesFinished?: number;
  candidatesInProgress?: number;
}

interface Template {
  id: number;
  title: string;
}

export default function HRVacanciesPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [rows, setRows] = useState<VacancyRow[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [search, setSearch] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newVacancy, setNewVacancy] = useState({
    title: "",
    description: "",
    templateId: "",
  });

  useEffect(() => {
    const t = localStorage.getItem("recruitment_token");
    if (t) setToken(t);
  }, []);

  useEffect(() => {
    if (!token) return;
    fetchVacancies();
    fetchTemplates();
  }, [token]);

  async function fetchVacancies() {
    const res = await apiFetch(`${API_BASE}/api/admin/vacancies`);
    if (res.ok) {
      const data = await res.json();
      setRows(data);
    }
  }

  async function fetchTemplates() {
    const res = await apiFetch(`${API_BASE}/api/admin/templates?limit=1000`);
    if (res.ok) {
      const data = await res.json();
      setTemplates(Array.isArray(data) ? data : data.items || []);
    }
  }

  async function createVacancy() {
    if (!token || !newVacancy.title) return;
    
    let templateId = newVacancy.templateId ? parseInt(newVacancy.templateId) : null;
    
    // Если шаблон не выбран, создаем новый с базовыми вопросами
    if (!templateId) {
      const basicQuestions = [
        {
          text: "Расскажите о своем опыте работы",
          type: "text",
          maxTime: 120,
          allowFollowups: false,
          followupsMax: 0,
          position: 0
        },
        {
          text: "Почему вы хотите работать в нашей компании?",
          type: "text", 
          maxTime: 120,
          allowFollowups: false,
          followupsMax: 0,
          position: 1
        },
        {
          text: "Какие у вас сильные стороны?",
          type: "text",
          maxTime: 120,
          allowFollowups: false,
          followupsMax: 0,
          position: 2
        }
      ];

      const templateRes = await apiFetch(`${API_BASE}/api/admin/templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Тест для вакансии: ${newVacancy.title}`,
          description: `Автоматически созданный тест для вакансии "${newVacancy.title}"`,
          questions: basicQuestions
        }),
      });

      if (templateRes.ok) {
        const templateData = await templateRes.json();
        templateId = templateData.id;
      } else {
        console.error("Ошибка создания шаблона");
        return;
      }
    }
    
    const res = await apiFetch(`${API_BASE}/api/admin/vacancies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newVacancy.title,
        description: newVacancy.description,
        templateId: templateId,
      }),
    });

    if (res.ok) {
      setShowCreateDialog(false);
      setNewVacancy({ title: "", description: "", templateId: "" });
      fetchVacancies();
      fetchTemplates(); // Обновляем список шаблонов
    }
  }

  const getProgressColor = (percent: number) => {
    if (percent >= 80) return "success";
    if (percent >= 50) return "warning";
    return "error";
  };

  const getProgressLabel = (percent: number) => {
    if (percent >= 80) return "Отлично";
    if (percent >= 50) return "Хорошо";
    if (percent >= 20) return "В процессе";
    return "Начато";
  };

  if (!token) {
    return (
      <PageContainer title="Вакансии" description="Управление вакансиями">
        <Box sx={{ p: 4 }}>
          <Typography>Нет доступа</Typography>
        </Box>
      </PageContainer>
    );
  }

  const filtered = rows.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageContainer title="Вакансии" description="Управление вакансиями">
      <Box>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <IconBriefcase size={32} color="#2196f3" />
            <Typography variant="h4" fontWeight="600">
              Вакансии
            </Typography>
            <Chip label={rows.length} color="primary" />
          </Box>
          <Button
            variant="contained"
            startIcon={<IconPlus size={20} />}
            onClick={() => setShowCreateDialog(true)}
          >
            Создать вакансию
          </Button>
        </Box>

        {/* Search */}
        <Box mb={3}>
          <TextField
            fullWidth
            placeholder="Поиск вакансий..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconSearch size={20} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Vacancies Grid */}
        <Grid container spacing={3}>
          {filtered.map((vacancy) => {
            const total = vacancy.candidatesTotal || 0;
            const finished = vacancy.candidatesFinished || 0;
            const inProgress = vacancy.candidatesInProgress || 0;
            const percent = total > 0 ? Math.round((finished / total) * 100) : 0;

            return (
              <Grid item xs={12} sm={6} md={4} key={vacancy.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "all 0.2s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                      <Typography variant="h6" fontWeight="600" sx={{ flexGrow: 1 }}>
                        {vacancy.title}
                      </Typography>
                      <Box display="flex" gap={1}>
                        <Tooltip title="Просмотреть">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => window.open(`/hr/vacancies/${vacancy.id}`, "_blank")}
                          >
                            <IconEye size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Редактировать">
                          <IconButton 
                            size="small" 
                            color="warning"
                            onClick={() => router.push(`/hr-vacancy-edit/${vacancy.id}`)}
                          >
                            <IconEdit size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Удалить">
                          <IconButton size="small" color="error">
                            <IconTrash size={16} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    {vacancy.description && (
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{
                          mb: 2,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {vacancy.description}
                      </Typography>
                    )}

                    <Box mb={2}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <IconUsers size={16} color="#666" />
                        <Typography variant="body2" color="textSecondary">
                          Кандидаты: {finished}/{total}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={percent}
                        color={getProgressColor(percent) as any}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                        <Chip
                          label={getProgressLabel(percent)}
                          size="small"
                          color={getProgressColor(percent) as any}
                          variant="outlined"
                        />
                        <Typography variant="caption" color="textSecondary">
                          {percent}%
                        </Typography>
                      </Box>
                    </Box>

                    {vacancy.templateId && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <IconTarget size={16} color="#666" />
                        <Typography variant="body2" color="textSecondary">
                          Тест: {templates.find(t => t.id === vacancy.templateId)?.title || vacancy.templateId}
                        </Typography>
                      </Box>
                    )}

                    {inProgress > 0 && (
                      <Box display="flex" alignItems="center" gap={1} mt={1}>
                        <IconCheck size={16} color="#4caf50" />
                        <Typography variant="body2" color="success.main">
                          {inProgress} в процессе
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {filtered.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {search ? "Вакансии не найдены" : "Нет вакансий"}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {search ? "Попробуйте изменить поисковый запрос" : "Создайте первую вакансию, чтобы начать работу"}
            </Typography>
          </Box>
        )}

        {/* Create Vacancy Dialog */}
        <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Создать вакансию с тестом</DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Информация о вакансии
              </Typography>
              <TextField
                label="Название вакансии"
                fullWidth
                sx={{ mb: 2, mt: 1 }}
                value={newVacancy.title}
                onChange={(e) => setNewVacancy({ ...newVacancy, title: e.target.value })}
              />
              <TextField
                label="Описание вакансии"
                fullWidth
                multiline
                rows={3}
                sx={{ mb: 2 }}
                value={newVacancy.description}
                onChange={(e) => setNewVacancy({ ...newVacancy, description: e.target.value })}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Тест для кандидатов
              </Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Выберите существующий шаблон или создайте новый</InputLabel>
                <Select
                  value={newVacancy.templateId}
                  onChange={(e) => setNewVacancy({ ...newVacancy, templateId: e.target.value })}
                  label="Выберите существующий шаблон или создайте новый"
                >
                  <MenuItem value="">
                    <em>Создать новый шаблон</em>
                  </MenuItem>
                  {templates.map((template) => (
                    <MenuItem key={template.id} value={template.id}>
                      {template.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {!newVacancy.templateId && (
                <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Будет создан новый шаблон теста с базовыми вопросами
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setShowCreateDialog(false);
                      router.push("/hr-vacancy-create");
                    }}
                  >
                    Расширенное создание
                  </Button>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowCreateDialog(false)}>Отмена</Button>
            <Button
              variant="contained"
              onClick={createVacancy}
              disabled={!newVacancy.title}
            >
              Создать вакансию с тестом
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageContainer>
  );
} 