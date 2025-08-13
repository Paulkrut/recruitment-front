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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Stack,
  Avatar,
  Rating,
  Switch,
  FormControlLabel,
  Checkbox,
  Fab,
} from "@mui/material";
import {
  IconPlus,
  IconSearch,
  IconEye,
  IconUsers,
  IconTarget,
  IconCheck,
  IconCards,
  IconTable,
  IconBriefcase,
  IconSortAscending,
  IconSortDescending,
  IconFilter,
  IconRefresh,
  IconDownload,
  IconMail,
  IconPhone,
  IconCalendar,
  IconArrowsDiff,
  IconBuilding,
  IconClock,
} from "@tabler/icons-react";
import PageContainer from "@/app/components/container/PageContainer";
import { apiFetch } from "@/utils/api";

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

interface CandidateRow {
  id: number;
  name: string;
  token: string;
  sessionId: number;
  status: string;
  startedAt?: string;
  finishedAt?: string;
  email?: string;
  phone?: string;
  createdAt: string;
  score?: number;
  summary?: string;
  answersCount: number;
  vacancy?: {
    id: number;
    title: string;
  };
}

interface VacancyOption {
  id: number;
  title: string;
}

type SortField = 'name' | 'createdAt' | 'finishedAt' | 'score' | 'status' | 'vacancy';
type SortOrder = 'asc' | 'desc';

interface SortConfig {
  field: SortField;
  order: SortOrder;
}

// Компонент улучшенной таблицы кандидатов
function EnhancedCandidateTable({ 
  candidates, 
  sortConfig, 
  onSort,
  statusFilter,
  onStatusFilterChange,
  scoreFilter,
  onScoreFilterChange,
  compareMode,
  selectedCandidates,
  onCandidateSelect,
  onSelectAll,
}: { 
  candidates: CandidateRow[];
  sortConfig: SortConfig;
  onSort: (field: SortField) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  scoreFilter: string;
  onScoreFilterChange: (score: string) => void;
  compareMode: boolean;
  selectedCandidates: number[];
  onCandidateSelect: (id: number) => void;
  onSelectAll: () => void;
}) {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "finished":
        return "success";
      case "in_progress":
        return "warning";
      case "pending":
        return "info";
      case "failed":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "finished":
        return "Завершено";
      case "in_progress":
        return "В процессе";
      case "pending":
        return "Ожидает";
      case "failed":
        return "Ошибка";
      default:
        return status;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "success";
    if (score >= 6) return "warning";
    return "error";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return "Отлично";
    if (score >= 6) return "Хорошо";
    if (score >= 4) return "Удовлетворительно";
    return "Неудовлетворительно";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getShortName = (fullName: string) => {
    const parts = fullName.split(" ");
    if (parts.length >= 2) {
      return `${parts[0]} ${parts[1][0]}.`;
    }
    return fullName;
  };

  const getInitials = (fullName: string) => {
    const parts = fullName.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) return `${diffDays} дн. назад`;
    if (diffHours > 0) return `${diffHours} ч. назад`;
    if (diffMinutes > 0) return `${diffMinutes} мин. назад`;
    return "Только что";
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableCell 
      sx={{ 
        cursor: 'pointer',
        userSelect: 'none',
        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
      }}
      onClick={() => onSort(field)}
    >
      <Box display="flex" alignItems="center" gap={1}>
        {children}
        {sortConfig.field === field && (
          sortConfig.order === 'asc' ? 
            <IconSortAscending size={16} /> : 
            <IconSortDescending size={16} />
        )}
      </Box>
    </TableCell>
  );

  return (
    <TableContainer component={Paper} sx={{ mt: 2, boxShadow: 2, borderRadius: 2 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'primary.main' }}>
            {compareMode && (
              <TableCell sx={{ color: 'white', fontWeight: 'bold', width: 50 }}>
                <Checkbox
                  checked={selectedCandidates.length === candidates.length && candidates.length > 0}
                  indeterminate={selectedCandidates.length > 0 && selectedCandidates.length < candidates.length}
                  onChange={onSelectAll}
                  sx={{ color: 'white' }}
                />
              </TableCell>
            )}
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
              Кандидат
            </TableCell>
            <SortableHeader field="vacancy">
              <Typography sx={{ color: 'white', fontWeight: 'bold' }}>
                Вакансия
              </Typography>
            </SortableHeader>
            <SortableHeader field="status">
              <Typography sx={{ color: 'white', fontWeight: 'bold' }}>
                Статус
              </Typography>
            </SortableHeader>
            <SortableHeader field="score">
              <Typography sx={{ color: 'white', fontWeight: 'bold' }}>
                Оценка
              </Typography>
            </SortableHeader>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
              Ответов
            </TableCell>
            <SortableHeader field="createdAt">
              <Typography sx={{ color: 'white', fontWeight: 'bold' }}>
                Дата создания
              </Typography>
            </SortableHeader>
            <SortableHeader field="finishedAt">
              <Typography sx={{ color: 'white', fontWeight: 'bold' }}>
                Дата завершения
              </Typography>
            </SortableHeader>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
              Действия
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {candidates.map((candidate) => (
            <TableRow 
              key={candidate.id} 
              hover
              sx={{ 
                '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.04)' },
                transition: 'background-color 0.2s'
              }}
            >
              {compareMode && (
                <TableCell>
                  <Checkbox
                    checked={selectedCandidates.includes(candidate.id)}
                    onChange={() => onCandidateSelect(candidate.id)}
                  />
                </TableCell>
              )}
              <TableCell>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar 
                    sx={{ 
                      bgcolor: 'primary.main',
                      width: 40,
                      height: 40,
                      fontSize: '0.875rem'
                    }}
                  >
                    {getInitials(candidate.name)}
                  </Avatar>
                  <Box>
                    <Link href={`/hr/candidates/${candidate.id}`} style={{ textDecoration: 'none' }}>
                      <Typography 
                        variant="subtitle2" 
                        fontWeight="bold"
                        sx={{ 
                          cursor: 'pointer',
                          color: 'text.primary',
                          '&:hover': { 
                            color: 'primary.main',
                            textDecoration: 'underline' 
                          }
                        }}
                      >
                      {getShortName(candidate.name)}
                    </Typography>
                    </Link>
                    <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                      {candidate.email && (
                        <Tooltip title={candidate.email}>
                          <IconMail size={14} color="#666" />
                        </Tooltip>
                      )}
                      {candidate.phone && (
                        <Tooltip title={candidate.phone}>
                          <IconPhone size={14} color="#666" />
                        </Tooltip>
                      )}
                      <Typography variant="caption" color="text.secondary">
                        {getTimeAgo(candidate.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                {candidate.vacancy ? (
                  <Link href={`/hr/vacancies/${candidate.vacancy.id}`} style={{ textDecoration: 'none' }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <IconBriefcase size={16} color="#1976d2" />
                      <Typography 
                        variant="body2" 
                        color="primary" 
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                      >
                        {candidate.vacancy.title}
                      </Typography>
                    </Box>
                  </Link>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Не указана
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Chip
                  label={getStatusLabel(candidate.status)}
                  color={getStatusColor(candidate.status) as any}
                  size="small"
                  sx={{ fontWeight: 'bold' }}
                />
              </TableCell>
              <TableCell>
                {candidate.score !== null && candidate.score !== undefined ? (
                  <Box>
                    <Chip
                      label={`${candidate.score}/10`}
                      color={getScoreColor(candidate.score) as any}
                      size="small"
                      sx={{ mb: 0.5 }}
                    />
                    <Typography variant="caption" color="text.secondary" display="block">
                      {getScoreLabel(candidate.score)}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    -
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2" fontWeight="bold">
                    {candidate.answersCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ответов
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    {formatDate(candidate.createdAt)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {getTimeAgo(candidate.createdAt)}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                {candidate.finishedAt ? (
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {formatDate(candidate.finishedAt)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getTimeAgo(candidate.finishedAt)}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    -
                  </Typography>
                )}
              </TableCell>
              <TableCell align="center">
                <Tooltip title="Просмотреть детали">
                  <IconButton
                    size="small"
                    onClick={() => router.push(`/hr/candidates/${candidate.id}`)}
                    sx={{ 
                      color: 'primary.main',
                      '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                    }}
                  >
                    <IconEye size={16} />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// Компонент карточек кандидатов
function CandidateCard({ candidate }: { candidate: CandidateRow }) {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "finished":
        return "success";
      case "in_progress":
        return "warning";
      case "pending":
        return "info";
      case "failed":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "finished":
        return "Завершено";
      case "in_progress":
        return "В процессе";
      case "pending":
        return "Ожидает";
      case "failed":
        return "Ошибка";
      default:
        return status;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "success";
    if (score >= 6) return "warning";
    return "error";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getShortName = (fullName: string) => {
    const parts = fullName.split(" ");
    if (parts.length >= 2) {
      return `${parts[0]} ${parts[1][0]}.`;
    }
    return fullName;
  };

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Link href={`/hr/candidates/${candidate.id}`} style={{ textDecoration: 'none' }}>
              <Typography 
                variant="h6" 
                fontWeight="bold" 
                gutterBottom
                sx={{ 
                  cursor: 'pointer',
                  color: 'text.primary',
                  '&:hover': { 
                    color: 'primary.main',
                    textDecoration: 'underline' 
                  }
                }}
              >
              {getShortName(candidate.name)}
            </Typography>
            </Link>
            {candidate.email && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {candidate.email}
              </Typography>
            )}
            {candidate.phone && (
              <Typography variant="body2" color="text.secondary">
                {candidate.phone}
              </Typography>
            )}
          </Box>
          <Chip
            label={getStatusLabel(candidate.status)}
            color={getStatusColor(candidate.status) as any}
            size="small"
          />
        </Box>

        {candidate.vacancy && (
          <Box mb={2}>
            <Link href={`/hr/vacancies/${candidate.vacancy.id}`} style={{ textDecoration: 'none' }}>
              <Typography 
                variant="body2" 
                color="primary" 
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                <IconBriefcase size={14} style={{ marginRight: 4 }} />
                {candidate.vacancy.title}
              </Typography>
            </Link>
          </Box>
        )}

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Ответов: {candidate.answersCount}
            </Typography>
            {candidate.score !== null && candidate.score !== undefined && (
              <Chip
                label={`Оценка: ${candidate.score}/10`}
                color={getScoreColor(candidate.score) as any}
                size="small"
                sx={{ mt: 1 }}
              />
            )}
          </Box>
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="text.secondary">
            Создан: {formatDate(candidate.createdAt)}
          </Typography>
          <Tooltip title="Просмотреть детали">
            <IconButton
              size="small"
              onClick={() => router.push(`/hr/candidates/${candidate.id}`)}
            >
              <IconEye size={16} />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function HRCandidatesPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<CandidateRow[]>([]);
  const [vacancies, setVacancies] = useState<VacancyOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'createdAt', order: 'desc' });
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [scoreFilter, setScoreFilter] = useState<string>('');
  const [vacancyFilter, setVacancyFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Состояния для сравнения кандидатов
  const [selectedCandidates, setSelectedCandidates] = useState<number[]>([]);
  const [compareMode, setCompareMode] = useState(false);

  useEffect(() => {
    fetchCandidates();
    fetchVacancies();
  }, []);

  async function fetchVacancies() {
    try {
      const response = await fetch(`${API_BASE}/api/admin/vacancies`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('recruitment_token')}`,
          'X-Company-ID': localStorage.getItem('current_company') || '',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setVacancies(data);
      }
    } catch (err) {
      console.error('Ошибка загрузки вакансий:', err);
    }
  }

  async function fetchCandidates() {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        sort: `${sortConfig.field}:${sortConfig.order}`,
        status: statusFilter,
        score: scoreFilter,
        search: searchTerm,
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });
      const response = await fetch(`${API_BASE}/api/admin/candidates/all?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('recruitment_token')}`,
          'X-Company-ID': localStorage.getItem('current_company') || '',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCandidates(data);
      } else {
        setError("Ошибка загрузки кандидатов");
      }
    } catch (err) {
      setError("Ошибка загрузки кандидатов");
    } finally {
      setLoading(false);
    }
  }

  // Функции для сравнения кандидатов
  const handleCandidateSelect = (candidateId: number) => {
    setSelectedCandidates(prev => 
      prev.includes(candidateId) 
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCandidates.length === paginatedCandidates.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(paginatedCandidates.map(c => c.id));
    }
  };

  const handleCompare = () => {
    if (selectedCandidates.length >= 2) {
      router.push(`/hr/candidates/compare?ids=${selectedCandidates.join(',')}`);
    }
  };

  const filteredCandidates = candidates.filter((candidate) => {
    // Поиск по тексту
    const searchMatch = 
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (candidate.email && candidate.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (candidate.phone && candidate.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (candidate.vacancy && candidate.vacancy.title.toLowerCase().includes(searchTerm.toLowerCase()));

    // Фильтр по статусу
    const statusMatch = !statusFilter || candidate.status === statusFilter;

    // Фильтр по оценке
    let scoreMatch = true;
    if (scoreFilter) {
      if (scoreFilter === 'no-score') {
        scoreMatch = candidate.score === null || candidate.score === undefined;
      } else {
        const [min, max] = scoreFilter.split('-').map(Number);
        if (candidate.score !== null && candidate.score !== undefined) {
          scoreMatch = candidate.score >= min && candidate.score <= max;
        } else {
          scoreMatch = false;
        }
      }
    }

    // Фильтр по вакансии
    const vacancyMatch = !vacancyFilter || 
      (candidate.vacancy && candidate.vacancy.id.toString() === vacancyFilter);

    return searchMatch && statusMatch && scoreMatch && vacancyMatch;
  }).sort((a, b) => {
    let aValue: any, bValue: any;

    switch (sortConfig.field) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      case 'finishedAt':
        aValue = a.finishedAt ? new Date(a.finishedAt).getTime() : 0;
        bValue = b.finishedAt ? new Date(b.finishedAt).getTime() : 0;
        break;
      case 'score':
        aValue = a.score ?? 0;
        bValue = b.score ?? 0;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'vacancy':
        aValue = a.vacancy?.title ?? '';
        bValue = b.vacancy?.title ?? '';
        break;
      default:
        return 0;
    }

    if (sortConfig.order === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Пагинация
  const paginatedCandidates = filteredCandidates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <PageContainer title="Кандидаты" description="Список всех кандидатов">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Кандидаты" description="Список всех кандидатов">
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={fetchCandidates} variant="contained">
          Попробовать снова
        </Button>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Кандидаты" description="Список всех кандидатов">
      <Box sx={{ mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" fontWeight="bold">
            Кандидаты ({candidates.length})
          </Typography>
          <Box display="flex" gap={1}>
            <Tooltip title={compareMode ? "Выйти из режима сравнения" : "Режим сравнения"}>
              <IconButton
                onClick={() => {
                  setCompareMode(!compareMode);
                  setSelectedCandidates([]);
                }}
                color={compareMode ? "primary" : "default"}
              >
                <IconArrowsDiff size={20} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Таблица">
              <IconButton
                onClick={() => setViewMode("table")}
                color={viewMode === "table" ? "primary" : "default"}
              >
                <IconTable size={20} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Карточки">
              <IconButton
                onClick={() => setViewMode("cards")}
                color={viewMode === "cards" ? "primary" : "default"}
              >
                <IconCards size={20} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Индикатор режима сравнения */}
        {compareMode && (
          <Alert 
            severity="info" 
            sx={{ mb: 2 }}
            action={
              selectedCandidates.length >= 2 && (
                <Button
                  color="inherit"
                  size="small"
                  onClick={handleCompare}
                  startIcon={<IconArrowsDiff />}
                >
                  Сравнить ({selectedCandidates.length})
                </Button>
              )
            }
          >
            Режим сравнения активен. Выбрано кандидатов: {selectedCandidates.length}
            {selectedCandidates.length < 2 && " (минимум 2 для сравнения)"}
          </Alert>
        )}

        <TextField
          fullWidth
          placeholder="Поиск по имени, email, телефону или вакансии..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconSearch size={20} />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {/* Панель фильтров */}
        <Card sx={{ mb: 2, p: 2 }}>
          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Статус</InputLabel>
              <Select
                value={statusFilter}
                label="Статус"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">Все статусы</MenuItem>
                <MenuItem value="finished">Завершено</MenuItem>
                <MenuItem value="in_progress">В процессе</MenuItem>
                <MenuItem value="pending">Ожидает</MenuItem>
                <MenuItem value="failed">Ошибка</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Оценка</InputLabel>
              <Select
                value={scoreFilter}
                label="Оценка"
                onChange={(e) => setScoreFilter(e.target.value)}
              >
                <MenuItem value="">Все оценки</MenuItem>
                <MenuItem value="8-10">Отлично (8-10)</MenuItem>
                <MenuItem value="6-7">Хорошо (6-7)</MenuItem>
                <MenuItem value="4-5">Удовлетворительно (4-5)</MenuItem>
                <MenuItem value="0-3">Неудовлетворительно (0-3)</MenuItem>
                <MenuItem value="no-score">Без оценки</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Вакансия</InputLabel>
              <Select
                value={vacancyFilter}
                label="Вакансия"
                onChange={(e) => {
                  setVacancyFilter(e.target.value);
                  setCurrentPage(1);
                }}
                startAdornment={
                  <InputAdornment position="start">
                    <IconBuilding size={16} />
                  </InputAdornment>
                }
              >
                <MenuItem value="">Все вакансии</MenuItem>
                {vacancies.map((vacancy) => (
                  <MenuItem key={vacancy.id} value={vacancy.id.toString()}>
                    {vacancy.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={<IconRefresh size={16} />}
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("");
                setScoreFilter("");
                setVacancyFilter("");
                setSortConfig({ field: 'createdAt', order: 'desc' });
                setCurrentPage(1);
              }}
              size="small"
            >
              Сбросить
            </Button>

            <Box sx={{ ml: 'auto' }}>
              <Typography variant="body2" color="text.secondary">
                Найдено: {filteredCandidates.length} кандидатов
              </Typography>
            </Box>
          </Box>
        </Card>

        {filteredCandidates.length === 0 ? (
          <Box textAlign="center" py={4}>
            <IconUsers size={48} color="#ccc" />
            <Typography variant="h6" color="text.secondary" mt={2}>
              {searchTerm || statusFilter || scoreFilter || vacancyFilter ? "Кандидаты не найдены" : "Кандидаты отсутствуют"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm || statusFilter || scoreFilter || vacancyFilter ? "Попробуйте изменить фильтры" : "Кандидаты появятся после прохождения интервью"}
            </Typography>
          </Box>
        ) : viewMode === "table" ? (
          <>
            <EnhancedCandidateTable 
              candidates={paginatedCandidates} 
              sortConfig={sortConfig} 
              onSort={(field) => {
                setSortConfig(prev => {
                  if (prev.field === field) {
                    return { ...prev, order: prev.order === 'asc' ? 'desc' : 'asc' };
                  }
                  return { field, order: 'asc' };
                });
              }}
              statusFilter={statusFilter}
              onStatusFilterChange={(status) => {
                setStatusFilter(status);
                setCurrentPage(1);
              }}
              scoreFilter={scoreFilter}
              onScoreFilterChange={(score) => {
                setScoreFilter(score);
                setCurrentPage(1);
              }}
              compareMode={compareMode}
              selectedCandidates={selectedCandidates}
              onCandidateSelect={handleCandidateSelect}
              onSelectAll={handleSelectAll}
            />
            
            {/* Пагинация */}
            {filteredCandidates.length > itemsPerPage && (
              <Box display="flex" justifyContent="center" mt={3}>
                <Pagination
                  count={Math.ceil(filteredCandidates.length / itemsPerPage)}
                  page={currentPage}
                  onChange={(_, page) => setCurrentPage(page)}
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </>
        ) : (
          <Grid container spacing={2}>
            {paginatedCandidates.map((candidate) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={candidate.id}>
                <CandidateCard candidate={candidate} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
      
      {/* Плавающая кнопка сравнения */}
      {compareMode && selectedCandidates.length >= 2 && (
        <Fab
          color="primary"
          onClick={handleCompare}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000,
          }}
        >
          <IconArrowsDiff />
        </Fab>
      )}
    </PageContainer>
  );
} 