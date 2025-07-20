"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

// Новый компонент карточки вакансии
function VacancyCard({ vacancy, templates, onEdit, onDelete }: {
  vacancy: VacancyRow;
  templates: Template[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const router = useRouter();
  const total = vacancy.candidatesTotal || 0;
  const finished = vacancy.candidatesFinished || 0;
  const inProgress = vacancy.candidatesInProgress || 0;
  const percent = total > 0 ? Math.round((finished / total) * 100) : 0;
  const templateTitle = vacancy.templateId ? (templates.find(t => t.id === vacancy.templateId)?.title || vacancy.templateId) : null;

  const getProgressColor = (percent: number) => {
    if (percent === 0) return "info"; // Было 'default', теперь 'info' для совместимости с MUI
    if (percent >= 80) return "success";
    if (percent >= 50) return "warning";
    return "error";
  };
  const getProgressLabel = (percent: number) => {
    if (percent === 0) return "Не начато";
    if (percent >= 80) return "Отлично";
    if (percent >= 50) return "Хорошо";
    if (percent >= 20) return "В процессе";
    return "Начато";
  };

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        p: 2,
        transition: "all 0.2s",
        '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
      }}
    >
      {/* Верхняя часть: название и статус */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Link href={`/hr/vacancies/${vacancy.id}`} passHref style={{ textDecoration: 'none', flexGrow: 1 }}>
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{
              flexGrow: 1,
              cursor: 'pointer',
              color: 'primary.main',
              transition: 'color 0.2s',
              '&:hover': { color: 'primary.dark', textDecoration: 'underline' },
            }}
          >
            {vacancy.title}
          </Typography>
        </Link>
        <Chip
          label={getProgressLabel(percent)}
          size="small"
          color={getProgressColor(percent) as any}
          sx={{ fontWeight: 600 }}
        />
      </Box>

      {/* Метрики */}
      <Box mb={1}>
        <Grid container spacing={1}>
          <Grid item xs={4}>
            <Box textAlign="center">
              <Typography variant="h5" fontWeight={700}>{total}</Typography>
              <Typography variant="caption" color="textSecondary">Всего</Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box textAlign="center">
              <Typography variant="h5" fontWeight={700} color="success.main">{finished}</Typography>
              <Typography variant="caption" color="textSecondary">Завершили</Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box textAlign="center">
              <Typography variant="h5" fontWeight={700} color="warning.main">{inProgress}</Typography>
              <Typography variant="caption" color="textSecondary">В процессе</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Прогресс */}
      <Box mb={1}>
        <LinearProgress
          variant="determinate"
          value={percent}
          color={getProgressColor(percent) as any}
          sx={{ height: 8, borderRadius: 4 }}
        />
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
          <Typography variant="caption" color="textSecondary">Прогресс</Typography>
          <Typography variant="caption" color="textSecondary">{percent}%</Typography>
        </Box>
      </Box>

      {/* Тест/шаблон */}
      {templateTitle && (
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <IconTarget size={16} color="#666" />
          <Typography variant="body2" color="textSecondary">
            Тест: {templateTitle}
          </Typography>
        </Box>
      )}

      {/* Описание */}
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

      {/* Кнопки действий */}
      <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
        <Tooltip title="Просмотреть">
          <Link href={`/hr/vacancies/${vacancy.id}`} passHref legacyBehavior>
            <IconButton size="small" color="primary" component="a">
              <IconEye size={18} />
            </IconButton>
          </Link>
        </Tooltip>
        <Tooltip title="Редактировать">
          <Link href={`/hr/vacancy-edit/${vacancy.id}`} passHref legacyBehavior>
            <IconButton size="small" color="warning" component="a">
              <IconEdit size={18} />
            </IconButton>
          </Link>
        </Tooltip>
        <Tooltip title="Удалить">
          <IconButton size="small" color="error" onClick={() => onDelete(vacancy.id)}>
            <IconTrash size={18} />
          </IconButton>
        </Tooltip>
      </Box>
    </Card>
  );
}

export default function HRVacanciesPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [rows, setRows] = useState<VacancyRow[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [search, setSearch] = useState("");

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
          <Link href="/hr/vacancy-create" passHref legacyBehavior>
            <Button
              variant="contained"
              startIcon={<IconPlus size={20} />}
              component="a"
            >
              Создать вакансию
            </Button>
          </Link>
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
          {filtered.map((vacancy) => (
            <Grid item xs={12} sm={6} md={4} key={vacancy.id}>
              <VacancyCard
                vacancy={vacancy}
                templates={templates}
                onEdit={(id) => router.push(`/hr/vacancy-edit/${id}`)}
                onDelete={(id) => {/* TODO: реализовать удаление */}}
              />
            </Grid>
          ))}
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
      </Box>
    </PageContainer>
  );
}
