"use client";
import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Checkbox,
  Chip,
  Avatar,
  Typography,
  Tooltip,
  IconButton,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  TableSortLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import QrCodeIcon from '@mui/icons-material/QrCode';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import Link from 'next/link';
import { apiFetch } from '@/utils/api';
import moment from 'moment';
import { useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';


const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

interface CandidatesListProps {
  vacancyId: string;
  filters: any;
  onSnackbar: (message: string) => void;
  onShowQR: (url: string) => void;
  selectedCandidates?: number[];
  onSelectedCandidatesChange?: (ids: number[] | ((prev: number[]) => number[])) => void;
}

export default function CandidatesList({
  vacancyId,
  filters,
  onSnackbar,
  onShowQR,
  selectedCandidates: externalSelectedCandidates = [],
  onSelectedCandidatesChange
}: CandidatesListProps) {
  const { _ } = useLingui();

  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Используем внешнее состояние для выбранных кандидатов (для синхронизации с главной страницей)
  const selectedCandidates = externalSelectedCandidates;
  const setSelectedCandidates = (ids: number[]) => {
    if (onSelectedCandidatesChange) {
      onSelectedCandidatesChange(ids);
    }
  };
  const [bulkStatus, setBulkStatus] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<string>('aiScore');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  // Состояние для HH Token Required Dialog
  const [hhTokenDialogOpen, setHhTokenDialogOpen] = useState(false);
  const [hhTokenError, setHhTokenError] = useState<{
    candidateName?: string;
    message?: string;
  } | null>(null);

  // Загрузка кандидатов с фильтрами, пагинацией и сортировкой
  useEffect(() => {
    const loadCandidates = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();

        // Пагинация
        queryParams.append('page', (page + 1).toString()); // Backend uses 1-based page
        queryParams.append('perPage', rowsPerPage.toString());

        // Сортировка
        queryParams.append('sortBy', sortBy);
        queryParams.append('sortOrder', sortOrder);

        // Фильтры
        if (filters.source) queryParams.append('source', filters.source);
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.minScore) queryParams.append('minScore', filters.minScore.toString());
        if (filters.testScore) queryParams.append('testScore', filters.testScore); // Новый фильтр
        if (filters.aiAnalysisStatus) queryParams.append('aiAnalysisStatus', filters.aiAnalysisStatus);
        if (filters.hasResume) queryParams.append('hasResume', filters.hasResume);
        if (filters.hhStage) queryParams.append('hhStage', filters.hhStage);
        if (filters.datePreset && filters.datePreset !== 'custom') queryParams.append('datePreset', filters.datePreset);
        if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
        if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);

        const response = await apiFetch(
          `${API_BASE}/api/admin/vacancies/${vacancyId}/candidates?${queryParams.toString()}`
        );
        const result = await response.json();

        setCandidates(result.data || []);
        setTotal(result.total || 0);
      } catch (error) {
        console.error('Error loading candidates:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCandidates();
  }, [vacancyId, filters, page, rowsPerPage, sortBy, sortOrder]);

  // Сброс страницы при изменении фильтров
  useEffect(() => {
    setPage(0);
  }, [filters]);

  // Обработчик сортировки
  const handleSort = (column: string) => {
    if (sortBy === column) {
      // Toggle order
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      // New column, default to DESC for aiScore, ASC for name
      setSortBy(column);
      setSortOrder(column === 'name' ? 'ASC' : 'DESC');
    }
  };

  // Выбрать всех (на текущей странице)
  const handleSelectAll = () => {
    if (selectedCandidates.length === candidates.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(candidates.map(c => c.id));
    }
  };

  // Массовый перенос статуса
  // Обработчик загрузки резюме из HH
  const handleLoadResumeFromHh = async (candidateId: number) => {
    try {
      // Оптимистичное обновление UI - сразу показываем индикатор загрузки
      setCandidates(prev => prev.map(c =>
        c.id === candidateId
          ? { ...c, aiAnalysisStatus: 'loading_resume' }
          : c
      ));

      const response = await apiFetch(`${API_BASE}/api/admin/candidates/${candidateId}/resume/load-from-hh`, {
        method: 'POST',
      });

      if (response.ok) {
        onSnackbar(_(msg`Резюме загружено из HH.ru`));
        // Перезагружаем список кандидатов
        const queryParams = new URLSearchParams();
        queryParams.append('page', (page + 1).toString());
        queryParams.append('perPage', rowsPerPage.toString());
        queryParams.append('sortBy', sortBy);
        queryParams.append('sortOrder', sortOrder);
        if (filters.source) queryParams.append('source', filters.source);
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.minScore) queryParams.append('minScore', filters.minScore.toString());

        const reloadResponse = await apiFetch(`${API_BASE}/api/admin/vacancies/${vacancyId}/candidates?${queryParams.toString()}`);
        const result = await reloadResponse.json();
        setCandidates(result.data || []);
        setTotal(result.total || 0);
      } else {
        const error = await response.json();
        if (error.errorType === 'limit_exceeded') {
          onSnackbar(_(msg`Превышен лимит просмотров резюме на HH.ru`));
        } else {
          onSnackbar(error.error || _(msg`Ошибка загрузки резюме`));
        }
        // Откатываем оптимистичное обновление
        const queryParams = new URLSearchParams();
        queryParams.append('page', (page + 1).toString());
        queryParams.append('perPage', rowsPerPage.toString());
        queryParams.append('sortBy', sortBy);
        queryParams.append('sortOrder', sortOrder);
        if (filters.source) queryParams.append('source', filters.source);
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.minScore) queryParams.append('minScore', filters.minScore.toString());

        const reloadResponse = await apiFetch(`${API_BASE}/api/admin/vacancies/${vacancyId}/candidates?${queryParams.toString()}`);
        const result = await reloadResponse.json();
        setCandidates(result.data || []);
        setTotal(result.total || 0);
      }
    } catch (error) {
      console.error('Error loading resume from HH:', error);
      onSnackbar(_(msg`Ошибка загрузки резюме`));
      // Откатываем оптимистичное обновление
      const queryParams = new URLSearchParams();
      queryParams.append('page', (page + 1).toString());
      queryParams.append('perPage', rowsPerPage.toString());
      queryParams.append('sortBy', sortBy);
      queryParams.append('sortOrder', sortOrder);
      if (filters.source) queryParams.append('source', filters.source);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.minScore) queryParams.append('minScore', filters.minScore.toString());

      const reloadResponse = await apiFetch(`${API_BASE}/api/admin/vacancies/${vacancyId}/candidates?${queryParams.toString()}`);
      const result = await reloadResponse.json();
      setCandidates(result.data || []);
      setTotal(result.total || 0);
    }
  };

  // Обработчик отправки на AI скрининг
  const handleSendToAiScreening = async (candidateId: number) => {
    try {
      // Оптимистичное обновление UI - сразу показываем статус "загрузка резюме"
      setCandidates(prev => prev.map(c =>
        c.id === candidateId
          ? { ...c, status: 'screening', aiAnalysisStatus: 'loading_resume' }
          : c
      ));

      const response = await apiFetch(`${API_BASE}/api/admin/vacancies/${vacancyId}/candidates/bulk-status`, {
        method: 'PATCH',
        body: JSON.stringify({
          candidateIds: [candidateId],
          status: 'screening',
        }),
      });

      if (response.ok) {
        const result = await response.json();

        // Проверяем есть ли ошибки HH token
        const hhTokenErrors = result.errors?.filter((e: any) => e.error === 'hh_token_required') || [];

        if (hhTokenErrors.length > 0 && hhTokenErrors[0]) {
          // Показываем диалог для HH token
          setHhTokenError({
            candidateName: hhTokenErrors[0].candidateName,
            message: hhTokenErrors[0].message || _(msg`Требуется авторизация HH.ru для загрузки резюме`),
          });
          setHhTokenDialogOpen(true);
        } else {
          onSnackbar(_(msg`Кандидат отправлен на AI скрининг`));
        }

        // Перезагружаем список кандидатов для получения актуальных данных
        const queryParams = new URLSearchParams();
        queryParams.append('page', (page + 1).toString());
        queryParams.append('perPage', rowsPerPage.toString());
        queryParams.append('sortBy', sortBy);
        queryParams.append('sortOrder', sortOrder);
        if (filters.source) queryParams.append('source', filters.source);
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.minScore) queryParams.append('minScore', filters.minScore.toString());

        const reloadResponse = await apiFetch(`${API_BASE}/api/admin/vacancies/${vacancyId}/candidates?${queryParams.toString()}`);
        const result2 = await reloadResponse.json();
        setCandidates(result2.data || []);
        setTotal(result2.total || 0);
      } else {
        // Проверяем специфичную ошибку HH token (403)
        if (response.status === 403) {
          const error = await response.json();
          if (error.error === 'hh_token_required') {
            setHhTokenError({
              candidateName: error.candidateName,
              message: error.message || _(msg`Требуется авторизация HH.ru для загрузки резюме`),
            });
            setHhTokenDialogOpen(true);

            // Откатываем оптимистичное обновление
            const queryParams = new URLSearchParams();
            queryParams.append('page', (page + 1).toString());
            queryParams.append('perPage', rowsPerPage.toString());
            queryParams.append('sortBy', sortBy);
            queryParams.append('sortOrder', sortOrder);
            if (filters.source) queryParams.append('source', filters.source);
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.search) queryParams.append('search', filters.search);
            if (filters.minScore) queryParams.append('minScore', filters.minScore.toString());

            const reloadResponse = await apiFetch(`${API_BASE}/api/admin/vacancies/${vacancyId}/candidates?${queryParams.toString()}`);
            const result = await reloadResponse.json();
            setCandidates(result.data || []);
            setTotal(result.total || 0);
            return;
          }
        }

        const error = await response.json();
        onSnackbar(error.error || _(msg`Ошибка отправки на скрининг`));
        // Откатываем оптимистичное обновление
        const queryParams = new URLSearchParams();
        queryParams.append('page', (page + 1).toString());
        queryParams.append('perPage', rowsPerPage.toString());
        queryParams.append('sortBy', sortBy);
        queryParams.append('sortOrder', sortOrder);
        if (filters.source) queryParams.append('source', filters.source);
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.minScore) queryParams.append('minScore', filters.minScore.toString());

        const reloadResponse = await apiFetch(`${API_BASE}/api/admin/vacancies/${vacancyId}/candidates?${queryParams.toString()}`);
        const result = await reloadResponse.json();
        setCandidates(result.data || []);
        setTotal(result.total || 0);
      }
    } catch (error) {
      console.error('Error sending to AI screening:', error);
      onSnackbar(_(msg`Ошибка отправки на скрининг`));
      // Откатываем оптимистичное обновление
      const queryParams = new URLSearchParams();
      queryParams.append('page', (page + 1).toString());
      queryParams.append('perPage', rowsPerPage.toString());
      queryParams.append('sortBy', sortBy);
      queryParams.append('sortOrder', sortOrder);
      if (filters.source) queryParams.append('source', filters.source);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.minScore) queryParams.append('minScore', filters.minScore.toString());

      const reloadResponse = await apiFetch(`${API_BASE}/api/admin/vacancies/${vacancyId}/candidates?${queryParams.toString()}`);
      const result = await reloadResponse.json();
      setCandidates(result.data || []);
      setTotal(result.total || 0);
    }
  };

  const handleBulkStatusChange = async () => {
    if (!bulkStatus || selectedCandidates.length === 0) return;

    try {
      const response = await apiFetch(
        `${API_BASE}/api/admin/vacancies/${vacancyId}/candidates/bulk-status`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            candidateIds: selectedCandidates,
            status: bulkStatus,
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        onSnackbar(`✅ Перемещено ${result.updated} кандидатов`);

        // Обновляем список
        const updatedResponse = await apiFetch(`${API_BASE}/api/admin/vacancies/${vacancyId}/candidates`);
        const updatedData = await updatedResponse.json();
        setCandidates(updatedData);

        setSelectedCandidates([]);
        setBulkStatus('');
      } else {
        onSnackbar(_(msg`❌ Ошибка при перемещении`));
      }
    } catch (error) {
      console.error('Error in bulk status change:', error);
      onSnackbar(_(msg`❌ Ошибка при перемещении`));
    }
  };

  const getAiScoreColor = (score: number | null) => {
    if (score === null) return 'default';
    if (score >= 90) return 'success';
    if (score >= 80) return 'success';
    if (score >= 70) return 'warning';
    return 'error';
  };

  const getTestScoreColor = (score: number | null) => {
    if (score === null) return 'default';
    if (score >= 9) return 'success';
    if (score >= 7) return 'success';
    if (score >= 5) return 'warning';
    if (score >= 3) return 'warning';
    return 'error';
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'headhunter': return '🎯';
      case 'manual': return '✍️';
      case 'linkedin': return '💼';
      default: return '📥';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Панель массовых действий */}
      {selectedCandidates.length > 0 && (
        <Box display="flex" alignItems="center" gap={2} mb={2} p={2} bgcolor="primary.light" borderRadius={1}>
          <Typography variant="body1" fontWeight={600}><Trans>
            Выбрано: {selectedCandidates.length}
          </Trans></Typography>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              displayEmpty
            >
              <MenuItem value="" disabled><Trans>Переместить в...</Trans></MenuItem>
              <MenuItem value="new"><Trans>Новый</Trans></MenuItem>
              <MenuItem value="screening"><Trans>AI Скрининг</Trans></MenuItem>
              <MenuItem value="contacted"><Trans>Связались</Trans></MenuItem>
              <MenuItem value="testing"><Trans>Тестирование</Trans></MenuItem>
              <MenuItem value="finalist"><Trans>Финалист</Trans></MenuItem>
              <MenuItem value="offer"><Trans>Оффер</Trans></MenuItem>
              <MenuItem value="hired"><Trans>Принят</Trans></MenuItem>
              <MenuItem value="rejected"><Trans>Отклонён</Trans></MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            onClick={handleBulkStatusChange}
            disabled={!bulkStatus}
          ><Trans>Применить</Trans></Button>
          <Button
            variant="outlined"
            onClick={() => setSelectedCandidates([])}
          >
            <Trans>Отменить</Trans>
          </Button>
        </Box>
      )}

      {candidates.length === 0 && !loading ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="textSecondary" gutterBottom><Trans>Нет кандидатов</Trans></Typography>
          <Typography variant="body2" color="textSecondary"><Trans>Измените фильтры или добавьте первого кандидата</Trans></Typography>
        </Box>
      ) : (
        <Box sx={{ width: '100%', overflow: 'hidden' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedCandidates.length === candidates.length && candidates.length > 0}
                    indeterminate={selectedCandidates.length > 0 && selectedCandidates.length < candidates.length}
                    onChange={handleSelectAll}
                    size="small"
                    color="primary"
                  />
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'name'}
                    direction={sortBy === 'name' ? sortOrder.toLowerCase() as 'asc' | 'desc' : 'asc'}
                    onClick={() => handleSort('name')}
                  >
                    <Trans>Имя</Trans>
                  </TableSortLabel>
                </TableCell>
                <TableCell><Trans>Источник</Trans></TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'aiScore'}
                    direction={sortBy === 'aiScore' ? sortOrder.toLowerCase() as 'asc' | 'desc' : 'desc'}
                    onClick={() => handleSort('aiScore')}
                  >
                    🤖 AI Score
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'score'}
                    direction={sortBy === 'score' ? sortOrder.toLowerCase() as 'asc' | 'desc' : 'desc'}
                    onClick={() => handleSort('score')}
                  >
                    📝 Тестирование
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'status'}
                    direction={sortBy === 'status' ? sortOrder.toLowerCase() as 'asc' | 'desc' : 'asc'}
                    onClick={() => handleSort('status')}
                  >
                    <Trans>Статус</Trans>
                  </TableSortLabel>
                </TableCell>
                <TableCell><Trans>Контакты</Trans></TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'createdAt'}
                    direction={sortBy === 'createdAt' ? sortOrder.toLowerCase() as 'asc' | 'desc' : 'desc'}
                    onClick={() => handleSort('createdAt')}
                  >
                    <Trans>Дата добавления</Trans>
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right"><Trans>Действия</Trans></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {candidates.map((r: any) => (
                <TableRow key={r.id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedCandidates.includes(r.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCandidates([...selectedCandidates, r.id]);
                        } else {
                          setSelectedCandidates(selectedCandidates.filter(id => id !== r.id));
                        }
                      }}
                      size="small"
                      color="primary"
                    />
                  </TableCell>

                  {/* Имя */}
                  <TableCell>
                    <Link href={`/hr/candidates/${r.id}`} style={{ textDecoration: 'none' }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar sx={{ width: 28, height: 28, bgcolor: '#1976d2', fontWeight: 700, fontSize: '0.75rem' }}>
                          {r.name ? r.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : '?'}
                        </Avatar>
                        <Typography sx={{ color: '#1976d2', fontWeight: 700, fontSize: '0.875rem' }}>
                          {r.name}
                        </Typography>
                      </Box>
                    </Link>
                  </TableCell>

                  {/* Источник */}
                  <TableCell>
                    <Chip
                      label={`${getSourceIcon(r.source)} ${r.source === 'headhunter' ? 'HH.ru' : r.source === 'manual' ? _(msg`Ручной`) : r.source}`}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>

                  {/* AI Score */}
                  <TableCell>
                    {r.aiAnalysisStatus === 'loading_resume' ? (
                      <Tooltip title={_(msg`Загрузка резюме из HH.ru`)} arrow>
                        <Chip
                          icon={<CircularProgress size={12} />}
                          label={_(msg`Загрузка...`)}
                          size="small"
                          color="info"
                        />
                      </Tooltip>
                    ) : r.aiAnalysisStatus === 'analyzing' ? (
                      <Tooltip title={_(msg`AI анализирует резюме`)} arrow>
                        <Chip
                          icon={<CircularProgress size={12} />}
                          label={_(msg`Анализ...`)}
                          size="small"
                          color="warning"
                        />
                      </Tooltip>
                    ) : r.aiScore !== null && r.aiScore !== undefined ? (
                      <Tooltip title={r.aiComment || _(msg`AI оценка`)} arrow>
                        <Chip
                          label={`${r.aiScore}%`}
                          size="small"
                          color={getAiScoreColor(r.aiScore)}
                        />
                      </Tooltip>
                    ) : (
                      <Chip label="—" size="small" variant="outlined" />
                    )}
                  </TableCell>

                  {/* Оценка за тест */}
                  <TableCell>
                    {r.score !== null && r.score !== undefined ? (
                      <Tooltip title={_(msg`Оценка за прохождение теста: ${r.score}/10`)} arrow>
                        <Chip
                          label={`${r.score}/10`}
                          size="small"
                          color={getTestScoreColor(r.score)}
                        />
                      </Tooltip>
                    ) : (
                      <Chip label="—" size="small" variant="outlined" />
                    )}
                  </TableCell>

                  {/* Статус */}
                  <TableCell>
                    <Chip
                      label={r.status}
                      size="small"
                      color="default"
                    />
                  </TableCell>

                  {/* Контакты */}
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                      {r.phone || '-'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                      {r.email || '-'}
                    </Typography>
                  </TableCell>

                  {/* Дата добавления */}
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                      {r.createdAt ? moment(r.createdAt).format('DD.MM.YYYY HH:mm') : '-'}
                    </Typography>
                  </TableCell>

                  {/* Действия */}
                  <TableCell align="right">
                    <Box display="flex" gap={1} alignItems="center" justifyContent="flex-end">
                      {/* Кнопка загрузки резюме из HH (только для кандидатов из HH без резюме) */}
                      {r.source === 'headhunter' && !r.resumeText && r.aiAnalysisStatus !== 'loading_resume' && r.aiAnalysisStatus !== 'analyzing' && (
                        <Tooltip title={_(msg`Загрузить резюме из HH.ru`)}>
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => handleLoadResumeFromHh(r.id)}
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {/* Кнопка отправки на AI скрининг (для кандидатов с резюме, но без AI оценки) */}
                      {r.status !== 'screening' && (r.resumeText || r.source === 'headhunter') && r.aiScore === null && r.aiAnalysisStatus !== 'loading_resume' && r.aiAnalysisStatus !== 'analyzing' && (
                        <Tooltip title={_(msg`Отправить на AI скрининг`)}>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleSendToAiScreening(r.id)}
                          >
                            <SmartToyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      <Tooltip title={_(msg`Скопировать ссылку на интервью`)}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => {
                            const url = `${window.location.origin}/interview/${r.token}`;
                            navigator.clipboard.writeText(url);
                            onSnackbar(_(msg`Ссылка скопирована!`));
                          }}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={_(msg`Показать QR-код`)}>
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={() => onShowQR(`${window.location.origin}/interview/${r.token}`)}
                        >
                          <QrCodeIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={_(msg`Удалить кандидата`)}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={async () => {
                            if (window.confirm(_(msg`Вы уверены, что хотите удалить этого кандидата?`))) {
                              try {
                                const response = await apiFetch(`${API_BASE}/api/admin/candidates/${r.id}`, { method: 'DELETE' });
                                if (response.ok) {
                                  onSnackbar(_(msg`Кандидат удален!`));
                                  // Обновляем список
                                  const updatedResponse = await apiFetch(`${API_BASE}/api/admin/vacancies/${vacancyId}/candidates`);
                                  const updatedData = await updatedResponse.json();
                                  setCandidates(updatedData);
                                } else {
                                  onSnackbar(_(msg`Ошибка удаления`));
                                }
                              } catch (e) {
                                onSnackbar(_(msg`Ошибка удаления`));
                              }
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[25, 50, 100]}
            labelRowsPerPage={_(msg`Строк на странице:`)}
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} ${_(msg`из`)} ${count !== -1 ? count : `${_(msg`более`)} ${to}`}`}
          />
        </Box>
      )}

      {/* Диалог HH Token Required */}
      <Dialog
        open={hhTokenDialogOpen}
        onClose={() => setHhTokenDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Trans>🔑 Требуется авторизация HH.ru
        </Trans></DialogTitle>
        <DialogContent>
          <DialogContentText>
            {hhTokenError?.candidateName && (
              <Box component="span" sx={{ display: 'block', fontWeight: 600, mb: 1 }}><Trans>
                Кандидат: {hhTokenError.candidateName}
              </Trans></Box>
            )}
            {hhTokenError?.message || _(msg`Для загрузки резюме с HeadHunter необходимо обновить токен доступа.`)}
          </DialogContentText>
          <Alert severity="info" sx={{ mt: 2 }}><Trans>Перейдите в настройки интеграции HH.ru и авторизуйтесь заново</Trans></Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHhTokenDialogOpen(false)} color="inherit">
            <Trans>Отмена</Trans>
          </Button>
          <Button
            onClick={() => {
              setHhTokenDialogOpen(false);
              window.open('/hr/settings/hh-integration', '_blank');
            }}
            variant="contained"
            color="primary"
          >
            <Trans>Подключить HH.ru</Trans>
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
