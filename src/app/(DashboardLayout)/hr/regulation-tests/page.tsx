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
        <Link href="/hr/regulation-tests/create" passHref legacyBehavior>
          <Button
            component="a"
            variant="contained"
            startIcon={<AddIcon />}
          >
            <Trans>Создать тест</Trans>
          </Button>
        </Link>
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
                <TableCell><Trans>Режим генерации</Trans></TableCell>
                <TableCell><Trans>Прогресс</Trans></TableCell>
                <TableCell><Trans>Средний балл</Trans></TableCell>
                <TableCell><Trans>Статус</Trans></TableCell>
                <TableCell align="right"><Trans>Действия</Trans></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary"><Trans>Загрузка...</Trans></Typography>
                  </TableCell>
                </TableRow>
              ) : filteredTests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
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
                      <>
                        <Typography color="text.secondary"><Trans>Тесты не созданы</Trans></Typography>
                        <Link href="/hr/regulation-tests/create" passHref legacyBehavior>
                          <Button
                            component="a"
                            variant="outlined"
                            startIcon={<AddIcon />}
                            sx={{ mt: 2 }}
                          >
                            <Trans>Создать первый тест</Trans>
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
                        label={test.regulationsCount + ' ' +  _(msg`шт.`)}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={test.questionGenerationMode === 'pre_generated' ? _(msg`Заранее`) : _(msg`При старте`)}
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
                        label={test.isActive ? _(msg`Активен`) : _(msg`Неактивен`)}
                        size="small"
                        color={test.isActive ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title={_(msg`Результаты`)}>
                        <Link href={`/hr/regulation-tests/${test.id}/results`} passHref legacyBehavior>
                          <IconButton
                            component="a"
                            size="small"
                          >
                            <AssessmentIcon fontSize="small" />
                          </IconButton>
                        </Link>
                      </Tooltip>
                      <Tooltip title={_(msg`Приглашения`)}>
                        <Link href={`/hr/regulation-tests/${test.id}/invitations`} passHref legacyBehavior>
                          <IconButton
                            component="a"
                            size="small"
                          >
                            <LinkIcon fontSize="small" />
                          </IconButton>
                        </Link>
                      </Tooltip>
                      <Tooltip title={_(msg`Редактировать`)}>
                        <Link href={`/hr/regulation-tests/${test.id}/edit`} passHref legacyBehavior>
                          <IconButton
                            component="a"
                            size="small"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Link>
                      </Tooltip>
                      <Tooltip title={_(msg`Удалить`)}>
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

