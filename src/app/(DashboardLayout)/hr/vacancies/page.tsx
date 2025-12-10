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
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Alert,
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
  IconCards,
  IconTable,
  IconRestore,
  IconArchive,
} from "@tabler/icons-react";
import PageContainer from "@/app/components/container/PageContainer";
import { formatDateToLocal, formatDateOnly } from "@/utils/dateUtils";
import { apiFetch } from "@/utils/api";
import { useLingui } from '@lingui/react';
import { msg, Trans } from '@lingui/macro';


const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

interface VacancyRow {
  id: number;
  title: string;
  description?: string;
  source?: string; // 'manual' | 'headhunter' | 'linkedin'
  status?: string; // 'active' | 'deleted' | 'archived'
  createdAt: string;
  deletedAt?: string;
  archivedAt?: string;
  createdBy: string;
  candidatesTotal?: number;
  candidatesFinished?: number;
  candidatesInProgress?: number;
}

interface Template {
  id: number;
  title: string;
}

// Компонент таблицы вакансий
function VacancyTable({ vacancies, templates, onEdit, onDelete, onRestore, onArchive }: {
  vacancies: VacancyRow[];
  templates: Template[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onRestore: (id: number) => void;
  onArchive: (id: number) => void;
}) {
  const router = useRouter();
  const { _ } = useLingui();

  const getProgressColor = (percent: number) => {
    if (percent === 0) return "info";
    if (percent >= 80) return "success";
    if (percent >= 50) return "warning";
    return "error";
  };

  const getProgressLabel = (percent: number) => {
    if (percent === 0) return _(msg`Отсутствует`);
    if (percent >= 80) return _(msg`Высокая`);
    if (percent >= 50) return _(msg`Нормальная`);
    if (percent >= 20) return _(msg`Низкая`);
    return _(msg`Низкая`);
  };

  // Функция для сокращения текста
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Функция для обрезки HTML текста (удаляет теги и обрезает)
  const truncateHtml = (html: string, maxLength: number) => {
    if (!html) return '';
    // Удаляем HTML теги
    const text = html.replace(/<[^>]*>/g, '');
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };



  // Функция для получения короткого имени
  const getShortName = (fullName: string) => {
    const parts = fullName.split(' ');
    if (parts.length >= 2) {
      return `${parts[0]} ${parts[1]}`;
    }
    return fullName;
  };

  return (
    <TableContainer component={Paper} sx={{ boxShadow: 1, borderRadius: 2 }}>
      <Table>
        <TableHead>
          <TableRow sx={{
            backgroundColor: 'grey.50',
            borderBottom: '2px solid',
            borderColor: 'primary.main'
          }}>
            <TableCell sx={{
              fontWeight: 600,
              fontSize: '0.875rem',
              color: 'text.secondary',
              width: '35%'
            }}>
              <Box display="flex" alignItems="center" gap={1}>
                <IconBriefcase size={16} />
                <Trans>Название</Trans>
              </Box>
            </TableCell>
            <TableCell sx={{
              fontWeight: 600,
              fontSize: '0.875rem',
              color: 'text.secondary',
              width: '12%'
            }}>
              <Box display="flex" alignItems="center" gap={1}>
                <IconTarget size={16} />
                <Trans>Создано</Trans>
              </Box>
            </TableCell>
            <TableCell sx={{
              fontWeight: 600,
              fontSize: '0.875rem',
              color: 'text.secondary',
              width: '12%'
            }}>
              <Box display="flex" alignItems="center" gap={1}>
                <IconUsers size={16} />
                <Trans>Кто создал</Trans>
              </Box>
            </TableCell>
            <TableCell sx={{
              fontWeight: 600,
              fontSize: '0.875rem',
              color: 'text.secondary',
              width: '18%'
            }}>
              <Tooltip title={_(msg`Показывает общее количество кандидатов, завершивших интервью и находящихся в процессе`)}>
                <Box display="flex" alignItems="center" gap={1}>
                  <IconUsers size={16} />
                  <Trans>Статистика кандидатов</Trans>
                </Box>
              </Tooltip>
            </TableCell>
            <TableCell sx={{
              fontWeight: 600,
              fontSize: '0.875rem',
              color: 'text.secondary',
              width: '8%',
              textAlign: 'center'
            }}><Trans>Действия</Trans></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {vacancies.map((vacancy) => {
            const total = vacancy.candidatesTotal || 0;
            const finished = vacancy.candidatesFinished || 0;
            const inProgress = vacancy.candidatesInProgress || 0;
            const percent = total > 0 ? Math.round((finished / total) * 100) : 0;

            return (
              <TableRow
                key={vacancy.id}
                sx={{
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    transform: 'scale(1.001)',
                    transition: 'all 0.2s ease'
                  }
                }}
              >
                <TableCell>
                  <Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      {vacancy.source === 'headhunter' && (
                        <Tooltip title={_(msg`Вакансия из HH.ru`)}>
                          <Chip
                            label="HH"
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              backgroundColor: '#D6001C',
                              color: 'white',
                              '& .MuiChip-label': { px: 0.75 }
                            }}
                          />
                        </Tooltip>
                      )}
                      {vacancy.status === 'deleted' && (
                        <Chip
                          label="🗑️"
                          size="small"
                          color="error"
                          sx={{
                            height: 20,
                            width: 24,
                            fontSize: '0.75rem',
                            '& .MuiChip-label': { px: 0.5 }
                          }}
                        />
                      )}
                      {vacancy.status === 'archived' && (
                        <Chip
                          label="📦"
                          size="small"
                          color="default"
                          sx={{
                            height: 20,
                            width: 24,
                            fontSize: '0.75rem',
                            '& .MuiChip-label': { px: 0.5 }
                          }}
                        />
                      )}
                      <Typography
                        variant="subtitle2"
                        fontWeight={600}
                        color={vacancy.status === 'active' ? 'primary.main' : 'text.disabled'}
                        sx={{
                          cursor: 'pointer',
                          '&:hover': {
                            color: vacancy.status === 'active' ? 'primary.dark' : 'text.secondary',
                            textDecoration: 'underline'
                          },
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => router.push(`/hr/vacancies/${vacancy.id}`)}
                      >
                        {truncateText(vacancy.title, 50)}
                      </Typography>
                    </Box>
                    {vacancy.description && (
                      <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                        {truncateHtml(vacancy.description, 60)}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="textSecondary">
                    {formatDateOnly(vacancy.createdAt)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="textSecondary">
                    {getShortName(vacancy.createdBy)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" flexDirection="column" gap={0.5}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" fontWeight={600} color="primary.main">
                        {total}
                      </Typography>
                      <Typography variant="caption" color="textSecondary"><Trans>всего</Trans></Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" fontWeight={600} color="success.main">
                        {finished}
                      </Typography>
                      <Typography variant="caption" color="textSecondary"><Trans>завершили</Trans></Typography>
                    </Box>
                    {inProgress > 0 && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" fontWeight={600} color="warning.main">
                          {inProgress}
                        </Typography>
                        <Typography variant="caption" color="textSecondary"><Trans>в процессе</Trans></Typography>
                      </Box>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={0.5} justifyContent="center">
                    <Tooltip title={_(msg`Просмотр`)}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => router.push(`/hr/vacancies/${vacancy.id}`)}
                        sx={{
                          width: 28,
                          height: 28,
                          '&:hover': { backgroundColor: 'primary.light' }
                        }}
                      >
                        <IconEye size={14} />
                      </IconButton>
                    </Tooltip>
                    
                    {vacancy.status === 'active' && (
                      <>
                        <Tooltip title={_(msg`Редактировать`)}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => onEdit(vacancy.id)}
                            sx={{
                              width: 28,
                              height: 28,
                              '&:hover': { backgroundColor: 'primary.light' }
                            }}
                          >
                            <IconEdit size={14} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={_(msg`В архив`)}>
                          <IconButton
                            size="small"
                            color="default"
                            onClick={() => onArchive(vacancy.id)}
                            sx={{
                              width: 28,
                              height: 28,
                              '&:hover': { backgroundColor: 'grey.300' }
                            }}
                          >
                            <IconArchive size={14} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={_(msg`Удалить`)}>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => onDelete(vacancy.id)}
                            sx={{
                              width: 28,
                              height: 28,
                              '&:hover': { backgroundColor: 'error.light' }
                            }}
                          >
                            <IconTrash size={14} />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                    
                    {(vacancy.status === 'deleted' || vacancy.status === 'archived') && (
                      <Tooltip title={_(msg`Восстановить`)}>
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => onRestore(vacancy.id)}
                          sx={{
                            width: 28,
                            height: 28,
                            '&:hover': { backgroundColor: 'success.light' }
                          }}
                        >
                          <IconRestore size={14} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// Новый компонент карточки вакансии
function VacancyCard({ vacancy, templates, onEdit, onDelete, onRestore, onArchive }: {
  vacancy: VacancyRow;
  templates: Template[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onRestore: (id: number) => void;
  onArchive: (id: number) => void;
}) {
  const { _ } = useLingui();
  const router = useRouter();
  const total = vacancy.candidatesTotal || 0;
  const finished = vacancy.candidatesFinished || 0;
  const inProgress = vacancy.candidatesInProgress || 0;
  const percent = total > 0 ? Math.round((finished / total) * 100) : 0;
                const createdDate = formatDateOnly(vacancy.createdAt);

  const getProgressColor = (percent: number) => {
    if (percent === 0) return "info"; // Было 'default', теперь 'info' для совместимости с MUI
    if (percent >= 80) return "success";
    if (percent >= 50) return "warning";
    return "error";
  };
  const getProgressLabel = (percent: number) => {
    if (percent === 0) return _(msg`Отсутствует`);
    if (percent >= 80) return _(msg`Высокая`);
    if (percent >= 50) return _(msg`Нормальная`);
    if (percent >= 20) return _(msg`Низкая`);
    return _(msg`Низкая`);
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
        overflow: "hidden", // Предотвращаем появление скроллбара
        '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
      }}
    >
      {/* Верхняя часть: название и статус */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Box display="flex" alignItems="center" gap={1} flexGrow={1}>
          {vacancy.source === 'headhunter' && (
            <Tooltip title={_(msg`Вакансия из HH.ru`)}>
              <Chip
                label="HH"
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  backgroundColor: '#D6001C',
                  color: 'white',
                  '& .MuiChip-label': { px: 0.75 }
                }}
              />
            </Tooltip>
          )}
          {vacancy.status === 'deleted' && (
            <Chip
              label="🗑️ Удалено"
              size="small"
              color="error"
              sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
            />
          )}
          {vacancy.status === 'archived' && (
            <Chip
              label="📦 Архив"
              size="small"
              color="default"
              sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
            />
          )}
          <Link href={`/hr/vacancies/${vacancy.id}`} passHref style={{ textDecoration: 'none', flexGrow: 1 }}>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{
                flexGrow: 1,
                cursor: 'pointer',
                color: vacancy.status === 'active' ? 'primary.main' : 'text.disabled',
                transition: 'color 0.2s',
                '&:hover': { color: vacancy.status === 'active' ? 'primary.dark' : 'text.secondary', textDecoration: 'underline' },
              }}
            >
              {vacancy.title}
            </Typography>
          </Link>
        </Box>
        <Chip
          label={getProgressLabel(percent)}
          size="small"
          color={getProgressColor(percent) as any}
          sx={{ fontWeight: 600 }}
        />
      </Box>

      {/* Информация о создании */}
      <Box mb={1}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
          <Typography variant="caption" color="textSecondary"><Trans>
            Создано: {createdDate}
          </Trans></Typography>
          <Typography variant="caption" color="textSecondary">
            {vacancy.createdBy}
          </Typography>
        </Box>
      </Box>

      {/* Метрики */}
      <Box mb={1}>
        <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: 'block' }}><Trans>Статистика кандидатов:</Trans></Typography>
        <Grid container spacing={1}>
          <Grid item xs={4}>
            <Box textAlign="center">
              <Typography variant="h5" fontWeight={700} color="primary.main">{total}</Typography>
              <Typography variant="caption" color="textSecondary"><Trans>Всего</Trans></Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box textAlign="center">
              <Typography variant="h5" fontWeight={700} color="success.main">{finished}</Typography>
              <Typography variant="caption" color="textSecondary"><Trans>Завершили</Trans></Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box textAlign="center">
              <Typography variant="h5" fontWeight={700} color="warning.main">{inProgress}</Typography>
              <Typography variant="caption" color="textSecondary"><Trans>В процессе</Trans></Typography>
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
          <Typography variant="caption" color="textSecondary">
            {getProgressLabel(percent)}
          </Typography>
          <Typography variant="caption" fontWeight={600}>
            {percent}%
          </Typography>
        </Box>
      </Box>

      {/* Описание */}
      {vacancy.description && (
        <Typography
          component="div"
          variant="body2"
          color="textSecondary"
          sx={{
            mb: 2,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            wordBreak: "break-word",
            '& p': { margin: 0 },
            '& ul, & ol': { paddingLeft: 2, margin: 0 }
          }}
          dangerouslySetInnerHTML={{ __html: vacancy.description }}
        />
      )}

      {/* Кнопки действий */}
      <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
        <Tooltip title={_(msg`Просмотреть`)}>
          <Link href={`/hr/vacancies/${vacancy.id}`} passHref legacyBehavior>
            <IconButton size="small" color="primary" component="a">
              <IconEye size={18} />
            </IconButton>
          </Link>
        </Tooltip>
        
        {vacancy.status === 'active' && (
          <>
            <Tooltip title={_(msg`Редактировать`)}>
              <Link href={`/hr/vacancy-edit/${vacancy.id}`} passHref legacyBehavior>
                <IconButton size="small" color="warning" component="a">
                  <IconEdit size={18} />
                </IconButton>
              </Link>
            </Tooltip>
            <Tooltip title={_(msg`В архив`)}>
              <IconButton size="small" color="default" onClick={() => onArchive(vacancy.id)}>
                <IconArchive size={18} />
              </IconButton>
            </Tooltip>
            <Tooltip title={_(msg`Удалить`)}>
              <IconButton size="small" color="error" onClick={() => onDelete(vacancy.id)}>
                <IconTrash size={18} />
              </IconButton>
            </Tooltip>
          </>
        )}
        
        {(vacancy.status === 'deleted' || vacancy.status === 'archived') && (
          <Tooltip title={_(msg`Восстановить`)}>
            <IconButton size="small" color="success" onClick={() => onRestore(vacancy.id)}>
              <IconRestore size={18} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Card>
  );
}

export default function HRVacanciesPage() {
  const { _ } = useLingui();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [rows, setRows] = useState<VacancyRow[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<'card' | 'table'>('table');
  const [statusFilter, setStatusFilter] = useState<'active' | 'deleted' | 'archived' | 'all'>('active');
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  useEffect(() => {
    const t = localStorage.getItem("recruitment_token");
    if (t) setToken(t);

    // Загружаем сохраненный режим просмотра
    const savedViewMode = localStorage.getItem("vacancy_view_mode") as 'card' | 'table';
    if (savedViewMode) {
      setViewMode(savedViewMode);
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    fetchVacancies();
    fetchTemplates();
  }, [token, statusFilter]);

  async function fetchVacancies() {
    const res = await apiFetch(`${API_BASE}/api/admin/vacancies?status=${statusFilter}`);
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

  async function handleDelete(id: number) {
    if (!confirm(_(msg`Вы уверены, что хотите удалить эту вакансию? Она будет перемещена в "Удалённые".`))) {
      return;
    }

    const res = await apiFetch(`${API_BASE}/api/admin/vacancies/${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      setSnackbar({ open: true, message: _(msg`Вакансия перемещена в удалённые`), severity: "success" });
      fetchVacancies();
    } else {
      setSnackbar({ open: true, message: _(msg`Ошибка при удалении`), severity: "error" });
    }
  }

  async function handleRestore(id: number) {
    if (!confirm(_(msg`Восстановить вакансию?`))) {
      return;
    }

    const res = await apiFetch(`${API_BASE}/api/admin/vacancies/${id}/restore`, {
      method: 'PATCH',
    });

    if (res.ok) {
      setSnackbar({ open: true, message: _(msg`Вакансия восстановлена`), severity: "success" });
      fetchVacancies();
    } else {
      setSnackbar({ open: true, message: _(msg`Ошибка при восстановлении`), severity: "error" });
    }
  }

  async function handleArchive(id: number) {
    if (!confirm(_(msg`Переместить вакансию в архив?`))) {
      return;
    }

    const res = await apiFetch(`${API_BASE}/api/admin/vacancies/${id}/archive`, {
      method: 'PATCH',
    });

    if (res.ok) {
      setSnackbar({ open: true, message: _(msg`Вакансия перемещена в архив`), severity: "success" });
      fetchVacancies();
    } else {
      setSnackbar({ open: true, message: _(msg`Ошибка при архивации`), severity: "error" });
    }
  }

  if (!token) {
    return (
      <PageContainer title={_(msg`Вакансии`)} description="Управление вакансиями">
        <Box sx={{ p: 4 }}>
          <Typography><Trans>Нет доступа</Trans></Typography>
        </Box>
      </PageContainer>
    );
  }

  const filtered = rows.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageContainer title={_(msg`Вакансии`)} description="Управление вакансиями">
      <Box sx={{
        overflow: "hidden", // Предотвращаем скроллбар на уровне страницы
        "& *": { // Применяем ко всем элементам
          "&::-webkit-scrollbar": { display: "none" }, // Скрываем скроллбар в WebKit браузерах
          "scrollbarWidth": "none", // Скрываем скроллбар в Firefox
          "msOverflowStyle": "none", // Скрываем скроллбар в IE/Edge
        }
      }}>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <IconBriefcase size={32} color="#2196f3" />
            <Typography variant="h4" fontWeight="600"><Trans>Вакансии</Trans></Typography>
            <Chip label={rows.length} color="primary" />
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(event, newViewMode) => {
                if (newViewMode !== null) {
                  setViewMode(newViewMode);
                  localStorage.setItem("vacancy_view_mode", newViewMode);
                }
              }}
              aria-label="vacancy view mode"
            >
              <Tooltip title={_(msg`Карточки`)}>
                <ToggleButton value="card" aria-label="card view">
                  <IconCards size={20} />
                </ToggleButton>
              </Tooltip>
              <Tooltip title={_(msg`Таблица`)}>
                <ToggleButton value="table" aria-label="table view">
                  <IconTable size={20} />
                </ToggleButton>
              </Tooltip>
            </ToggleButtonGroup>
            <Link href="/hr/vacancy-create" passHref legacyBehavior>
              <Button
                variant="contained"
                startIcon={<IconPlus size={20} />}
                component="a"
              >
                <Trans>Создать вакансию</Trans>
              </Button>
            </Link>
          </Box>
        </Box>

        {/* Фильтры */}
        <Box display="flex" gap={2} mb={3}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="status-filter-label"><Trans>Статус вакансии</Trans></InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              label={_(msg`Статус вакансии`)}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <MenuItem value="active">✅ <Trans>Активные</Trans></MenuItem>
              <MenuItem value="deleted">🗑️ <Trans>Удалённые</Trans></MenuItem>
              <MenuItem value="archived">📦 <Trans>Архив</Trans></MenuItem>
              <MenuItem value="all">📋 <Trans>Все</Trans></MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            placeholder={_(msg`Поиск вакансий...`)}
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
        {viewMode === 'card' ? (
          <Grid container spacing={3} sx={{ overflow: "hidden" }}>
            {filtered.map((vacancy) => (
              <Grid item xs={12} sm={6} md={4} key={vacancy.id}>
                <VacancyCard
                  vacancy={vacancy}
                  templates={templates}
                  onEdit={(id) => router.push(`/hr/vacancy-edit/${id}`)}
                  onDelete={handleDelete}
                  onRestore={handleRestore}
                  onArchive={handleArchive}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <VacancyTable
            vacancies={filtered}
            templates={templates}
            onEdit={(id) => router.push(`/hr/vacancy-edit/${id}`)}
            onDelete={handleDelete}
            onRestore={handleRestore}
            onArchive={handleArchive}
          />
        )}

        {filtered.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {search ? _(msg`Вакансии не найдены`) : _(msg`Нет вакансий`)}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {search ? _(msg`Попробуйте изменить поисковый запрос`) : _(msg`Создайте первую вакансию, чтобы начать работу`)}
            </Typography>
          </Box>
        )}
        
        {/* Snackbar для уведомлений */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </PageContainer>
  );
}
