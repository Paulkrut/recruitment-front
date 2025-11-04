'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import PageContainer from '@/app/components/container/PageContainer';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LinkIcon from '@mui/icons-material/Link';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ClearIcon from '@mui/icons-material/Clear';
import { apiFetch } from '@/utils/api';

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test';

interface RegulationTest {
  id: number;
  title: string;
  description: string | null;
  questionGenerationMode: string;
  questionsPerRegulation: number;
  isActive: boolean;
  regulationsCount: number;
  regulations: Array<{
    id: number;
    title: string;
    position: number;
  }>;
  invitationsCount: number;
  sessionsTotal: number;
  sessionsFinished: number;
  avgScore: number | null;
  createdAt: string;
}

interface Regulation {
  id: number;
  title: string;
}

export default function RegulationTestsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const regulationIdParam = searchParams.get('regulationId');

  const [tests, setTests] = useState<RegulationTest[]>([]);
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegulationId, setSelectedRegulationId] = useState<number | null>(
    regulationIdParam ? parseInt(regulationIdParam) : null
  );

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Обновляем URL при изменении фильтра
    if (selectedRegulationId) {
      router.replace(`/hr/regulation-tests?regulationId=${selectedRegulationId}`);
    } else {
      router.replace('/hr/regulation-tests');
    }
  }, [selectedRegulationId, router]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Загружаем тесты
      const testsResponse = await apiFetch(`${API_BASE}/api/regulation-tests`);
      const testsData = await testsResponse.json();
      setTests(testsData);

      // Загружаем список всех регламентов для фильтра
      const regulationsResponse = await apiFetch(`${API_BASE}/api/regulations`);
      const regulationsData = await regulationsResponse.json();
      setRegulations(regulationsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить тест? Все связанные данные (приглашения, результаты) будут удалены.')) return;

    try {
      const response = await apiFetch(`${API_BASE}/api/regulation-tests/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadData();
      }
    } catch (error) {
      console.error('Error deleting test:', error);
    }
  };

  const getCompletionRate = (test: RegulationTest): number => {
    if (test.sessionsTotal === 0) return 0;
    return Math.round((test.sessionsFinished / test.sessionsTotal) * 100);
  };

  // Фильтруем тесты по выбранному регламенту
  const filteredTests = selectedRegulationId
    ? tests.filter((test) =>
        test.regulations.some((reg) => reg.id === selectedRegulationId)
      )
    : tests;

  // Находим название выбранного регламента
  const selectedRegulation = regulations.find((reg) => reg.id === selectedRegulationId);

  const handleClearFilter = () => {
    setSelectedRegulationId(null);
  };

  return (
    <PageContainer title="Тесты на знание регламентов" description="Управление тестами">
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <MuiLink href="/hr" underline="hover" color="inherit">
          Главная
        </MuiLink>
        <Typography color="text.primary">Тесты</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">📋 Тесты на знание регламентов</Typography>
        <Link href="/hr/regulation-tests/create" passHref legacyBehavior>
          <Button
            component="a"
            variant="contained"
            startIcon={<AddIcon />}
          >
            Создать тест
          </Button>
        </Link>
      </Box>

      {/* Filter */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 300 }}>
            <InputLabel>Фильтр по регламенту</InputLabel>
            <Select
              value={selectedRegulationId || ''}
              label="Фильтр по регламенту"
              onChange={(e) => setSelectedRegulationId(e.target.value ? Number(e.target.value) : null)}
            >
              <MenuItem value="">
                <em>Все тесты</em>
              </MenuItem>
              {regulations.map((regulation) => (
                <MenuItem key={regulation.id} value={regulation.id}>
                  {regulation.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedRegulationId && (
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClearFilter}
            >
              Сбросить фильтр
            </Button>
          )}

          {selectedRegulationId && (
            <Typography variant="body2" color="text.secondary">
              Найдено тестов: {filteredTests.length}
            </Typography>
          )}
        </Box>
      </Card>

      {/* Active Filter Alert */}
      {selectedRegulationId && selectedRegulation && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Показаны тесты, использующие регламент: <strong>{selectedRegulation.title}</strong>
        </Alert>
      )}

      {/* Tests Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Название</TableCell>
                <TableCell>Регламенты</TableCell>
                <TableCell>Режим генерации</TableCell>
                <TableCell>Прогресс</TableCell>
                <TableCell>Средний балл</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">Загрузка...</Typography>
                  </TableCell>
                </TableRow>
              ) : filteredTests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    {selectedRegulationId ? (
                      <>
                        <Typography color="text.secondary" gutterBottom>
                          Нет тестов для выбранного регламента
                        </Typography>
                        <Button
                          variant="outlined"
                          startIcon={<ClearIcon />}
                          onClick={handleClearFilter}
                          sx={{ mt: 2 }}
                        >
                          Сбросить фильтр
                        </Button>
                      </>
                    ) : (
                      <>
                        <Typography color="text.secondary">Тесты не созданы</Typography>
                        <Link href="/hr/regulation-tests/create" passHref legacyBehavior>
                          <Button
                            component="a"
                            variant="outlined"
                            startIcon={<AddIcon />}
                            sx={{ mt: 2 }}
                          >
                            Создать первый тест
                          </Button>
                        </Link>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTests.map((test) => (
                  <TableRow key={test.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {test.title}
                        </Typography>
                        {test.description && (
                          <Typography variant="caption" color="text.secondary">
                            {test.description}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${test.regulationsCount} шт.`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={test.questionGenerationMode === 'pre_generated' ? 'Заранее' : 'При старте'}
                        size="small"
                        color={test.questionGenerationMode === 'on_start' ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ minWidth: 120 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption">
                            {test.sessionsFinished} / {test.sessionsTotal}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {getCompletionRate(test)}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={getCompletionRate(test)}
                          sx={{ height: 6, borderRadius: 1 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      {test.avgScore !== null ? (
                        <Chip
                          label={`${test.avgScore.toFixed(1)}%`}
                          size="small"
                          color="primary"
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          —
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={test.isActive ? 'Активен' : 'Неактивен'}
                        size="small"
                        color={test.isActive ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Результаты">
                        <Link href={`/hr/regulation-tests/${test.id}/results`} passHref legacyBehavior>
                          <IconButton
                            component="a"
                            size="small"
                          >
                            <AssessmentIcon fontSize="small" />
                          </IconButton>
                        </Link>
                      </Tooltip>
                      <Tooltip title="Приглашения">
                        <Link href={`/hr/regulation-tests/${test.id}/invitations`} passHref legacyBehavior>
                          <IconButton
                            component="a"
                            size="small"
                          >
                            <LinkIcon fontSize="small" />
                          </IconButton>
                        </Link>
                      </Tooltip>
                      <Tooltip title="Редактировать">
                        <Link href={`/hr/regulation-tests/${test.id}/edit`} passHref legacyBehavior>
                          <IconButton
                            component="a"
                            size="small"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Link>
                      </Tooltip>
                      <Tooltip title="Удалить">
                        <IconButton size="small" onClick={() => handleDelete(test.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </PageContainer>
  );
}

