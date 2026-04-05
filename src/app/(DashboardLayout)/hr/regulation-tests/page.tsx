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
import AssessmentIcon from '@mui/icons-material/Assessment';
import QuizIcon from '@mui/icons-material/Quiz';
import ClearIcon from '@mui/icons-material/Clear';
import { apiFetch } from '@/utils/api';
import { useLingui } from '@lingui/react';
import { msg, Trans } from '@lingui/macro';


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
  const { _ } = useLingui();

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
      setTests(Array.isArray(testsData) ? testsData : []);

      // Загружаем список всех регламентов для фильтра
      const regulationsResponse = await apiFetch(`${API_BASE}/api/regulations`);
      const regulationsData = await regulationsResponse.json();
      setRegulations(Array.isArray(regulationsData) ? regulationsData : []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(_(msg`Удалить тест? Все связанные данные (приглашения, результаты) будут удалены.`))) return;

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
    <PageContainer title={_(msg`Тесты на знание регламентов`)} description="Управление тестами">
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <MuiLink href="/hr" underline="hover" color="inherit">
          <Trans>Главная</Trans>
        </MuiLink>
        <Typography color="text.primary"><Trans>Тесты</Trans></Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4"><Trans>📋 Тесты на знание регламентов</Trans></Typography>
        <Button
          component={Link}
          href="/hr/regulation-tests/create"
          variant="contained"
          startIcon={<AddIcon />}
        >
          <Trans>Создать тест</Trans>
        </Button>
      </Box>

      {/* Filter */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 300 }}>
            <InputLabel><Trans>Фильтр по регламенту</Trans></InputLabel>
            <Select
              value={selectedRegulationId || ''}
              label={_(msg`Фильтр по регламенту`)}
              onChange={(e) => setSelectedRegulationId(e.target.value ? Number(e.target.value) : null)}
            >
              <MenuItem value="">
                <em><Trans>Все тесты</Trans></em>
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
              <Trans>Сбросить фильтр</Trans>
            </Button>
          )}

          {selectedRegulationId && (
            <Typography variant="body2" color="text.secondary">
              <Trans>Найдено тестов</Trans>: {filteredTests.length}
            </Typography>
          )}
        </Box>
      </Card>

      {/* Active Filter Alert */}
      {selectedRegulationId && selectedRegulation && (
        <Alert severity="info" sx={{ mb: 3 }}><Trans>
          Показаны тесты, использующие регламент: <strong>{selectedRegulation.title}</strong>
        </Trans></Alert>
      )}

      {/* Tests Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><Trans>Название</Trans></TableCell>
                <TableCell><Trans>Регламенты</Trans></TableCell>
                <TableCell><Trans>Прогресс</Trans></TableCell>
                <TableCell><Trans>Средний балл</Trans></TableCell>
                <TableCell><Trans>Статус</Trans></TableCell>
                <TableCell align="right"><Trans>Действия</Trans></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary"><Trans>Загрузка...</Trans></Typography>
                  </TableCell>
                </TableRow>
              ) : filteredTests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    {selectedRegulationId ? (
                      <>
                        <Typography color="text.secondary" gutterBottom><Trans>Нет тестов для выбранного регламента</Trans></Typography>
                        <Button
                          variant="outlined"
                          startIcon={<ClearIcon />}
                          onClick={handleClearFilter}
                          sx={{ mt: 2 }}
                        >
                          <Trans>Сбросить фильтр</Trans>
                        </Button>
                      </>
                    ) : (
                      <Box>
                        <QuizIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                        <Typography color="text.secondary" gutterBottom><Trans>Тесты не созданы</Trans></Typography>
                        <Typography variant="caption" color="text.disabled" display="block" sx={{ mb: 2 }}>
                          <Trans>Создайте тест, чтобы проверить знания сотрудников по регламентам</Trans>
                        </Typography>
                        <Button
                          component={Link}
                          href="/hr/regulation-tests/create"
                          variant="contained"
                          startIcon={<AddIcon />}
                        >
                          <Trans>Создать первый тест</Trans>
                        </Button>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTests.map((test) => (
                  <TableRow key={test.id} hover sx={{ cursor: 'pointer' }} onClick={() => router.push(`/hr/regulation-tests/${test.id}/results`)}>
                    <TableCell>
                      <Box>
                        <MuiLink
                          component={Link}
                          href={`/hr/regulation-tests/${test.id}/results`}
                          underline="hover"
                          color="inherit"
                          sx={{ fontWeight: 600 }}
                          onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        >
                          {test.title}
                        </MuiLink>
                        {test.description && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {test.description}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {test.regulations.slice(0, 3).map((reg) => (
                          <Chip
                            key={reg.id}
                            label={reg.title}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                        {test.regulations.length > 3 && (
                          <Chip
                            label={`+${test.regulations.length - 3}`}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        )}
                      </Box>
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
                          color={test.avgScore >= 70 ? 'success' : test.avgScore >= 40 ? 'warning' : 'error'}
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          —
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={test.isActive ? _(msg`Активен`) : _(msg`Неактивен`)}
                        size="small"
                        color={test.isActive ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <Tooltip title={_(msg`Участники`)}>
                        <IconButton
                          component={Link}
                          href={`/hr/regulation-tests/${test.id}/results`}
                          size="small"
                        >
                          <AssessmentIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={_(msg`Редактировать`)}>
                        <IconButton
                          component={Link}
                          href={`/hr/regulation-tests/${test.id}/edit`}
                          size="small"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={_(msg`Удалить`)}>
                        <IconButton size="small" color="error" onClick={() => handleDelete(test.id)}>
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

