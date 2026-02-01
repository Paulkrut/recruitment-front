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
  LinearProgress,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import QrCodeIcon from '@mui/icons-material/QrCode';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import Link from 'next/link';
import { apiFetch } from '@/utils/api';
import moment from 'moment';
import { useLingui } from '@lingui/react';
import { msg, Trans } from '@lingui/macro';
import BulkActionsToolbar from './BulkActionsToolbar';
import { extractHhCandidateIds } from './candidateUtils';


const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

interface CandidatesListProps {
  vacancyId: string;
  filters: any;
  onSnackbar: (message: string) => void;
  onShowQR: (url: string) => void;
  selectedCandidates?: number[];
  onSelectedCandidatesChange?: (ids: number[] | ((prev: number[]) => number[])) => void;
  vacancySource?: string; // Источник вакансии (headhunter, manual, etc.)
  refreshTrigger?: number; // Триггер для принудительного обновления
  onBulkStatusChangeRequest?: (candidateIds: number[], targetStatus: string) => Promise<void>; // Callback для массового изменения из parent
  // Новые пропсы для floating панели
  onFloatingPanelData?: (data: {
    selectedCandidates: any[];
    selectAllByFilter: boolean;
    total: number;
    hhCandidatesInfo: { isAll: boolean; count?: number };
    onStatusChange: (newStatus: string) => Promise<void>;
    onSendInvitations: () => Promise<void>;
    onCancel: () => void;
  }) => void;
}

export default function CandidatesList({
  vacancyId,
  filters,
  onSnackbar,
  onShowQR,
  selectedCandidates: externalSelectedCandidates = [],
  onSelectedCandidatesChange,
  vacancySource = '',
  refreshTrigger,
  onBulkStatusChangeRequest,
  onFloatingPanelData,
}: CandidatesListProps) {
  const { _ } = useLingui();

  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper для форматирования даты
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return moment(dateString).format('DD.MM.YYYY HH:mm');
  };

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
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  
  // Состояние "Выбрать все по фильтру"
  const [selectAllByFilter, setSelectAllByFilter] = useState(false);

  // Состояние для HH Token Required Dialog
  const [hhTokenDialogOpen, setHhTokenDialogOpen] = useState(false);
  const [hhTokenError, setHhTokenError] = useState<{
    candidateName?: string;
    message?: string;
  } | null>(null);

  // Состояние для прогресса массовой отправки приглашений
  const [sendingInProgress, setSendingInProgress] = useState(false);
  const [sendingJobId, setSendingJobId] = useState<number | null>(null);
  const [sendingProgress, setSendingProgress] = useState({
    total: 0,
    processed: 0,
    succeeded: 0,
    failed: 0,
    progress: 0,
  });
  const [sendingProgressDialogOpen, setSendingProgressDialogOpen] = useState(false);
  const [sendingResults, setSendingResults] = useState<any[] | null>(null);

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
        if (filters.invitationSent) queryParams.append('invitationSent', filters.invitationSent); // Фильтр по приглашениям
        if (filters.redFlag) queryParams.append('redFlag', filters.redFlag); // Фильтр по red flags
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
  }, [vacancyId, filters, page, rowsPerPage, sortBy, sortOrder, refreshTrigger]);

  // Полинг для обновления статусов AI скрининга (loading_resume, analyzing)
  useEffect(() => {
    // Проверяем есть ли кандидаты в процессе AI скрининга
    const hasProcessingCandidates = candidates.some(c => 
      c.aiAnalysisStatus === 'loading_resume' || c.aiAnalysisStatus === 'analyzing'
    );

    if (!hasProcessingCandidates) {
      return; // Нет кандидатов в процессе - полинг не нужен
    }

    // Запускаем полинг каждые 5 секунд
    const pollInterval = setInterval(async () => {
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('page', (page + 1).toString());
        queryParams.append('perPage', rowsPerPage.toString());
        queryParams.append('sortBy', sortBy);
        queryParams.append('sortOrder', sortOrder);
        if (filters.source) queryParams.append('source', filters.source);
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.minScore) queryParams.append('minScore', filters.minScore.toString());
        if (filters.testScore) queryParams.append('testScore', filters.testScore);
        if (filters.invitationSent) queryParams.append('invitationSent', filters.invitationSent);
        if (filters.redFlag) queryParams.append('redFlag', filters.redFlag);
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

        // Обновляем только если есть изменения в статусах AI
        const hasChanges = result.data.some((newCandidate: any, index: number) => {
          const oldCandidate = candidates[index];
          return oldCandidate && (
            oldCandidate.aiAnalysisStatus !== newCandidate.aiAnalysisStatus ||
            oldCandidate.aiScore !== newCandidate.aiScore
          );
        });

        if (hasChanges) {
          setCandidates(result.data || []);
          setTotal(result.total || 0);
        }
      } catch (error) {
        console.error('Error polling candidates:', error);
      }
    }, 5000); // Полинг каждые 5 секунд

    return () => clearInterval(pollInterval);
  }, [candidates, vacancyId, page, rowsPerPage, sortBy, sortOrder, filters]);

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
    if (selectedCandidates.length === candidates.length && !selectAllByFilter) {
      setSelectedCandidates([]);
      setSelectAllByFilter(false);
    } else {
      setSelectedCandidates(candidates.map(c => c.id));
      setSelectAllByFilter(false);
    }
  };
  
  // Выбрать все по фильтру (все кандидаты, соответствующие текущему фильтру)
  const handleSelectAllByFilter = () => {
    setSelectAllByFilter(true);
    // Выбираем всех на текущей странице как индикатор
    setSelectedCandidates(candidates.map(c => c.id));
  };
  
  // Отменить выбор всех
  const handleClearSelection = () => {
    setSelectedCandidates([]);
    setSelectAllByFilter(false);
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

  // Универсальный метод для массового изменения статуса (вызывается из обоих блоков)
  const performBulkStatusChange = async (candidateIds: number[], targetStatus: string) => {
    try {
      // Если выбраны ВСЕ по фильтру - отправляем фильтры вместо ID
      const requestBody = selectAllByFilter ? {
        status: targetStatus,
        applyToAll: true,
        filters: {
          source: filters.source || null,
          status: filters.status || null,
          search: filters.search || null,
          minScore: filters.minScore || null,
        }
      } : {
        candidateIds,
        status: targetStatus,
      };
      
      const response = await apiFetch(
        `${API_BASE}/api/admin/vacancies/${vacancyId}/candidates/bulk-status`,
        {
          method: 'PATCH',
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        const result = await response.json();
        
        // Проверяем есть ли ошибки HH token
        const hhTokenErrors = result.errors?.filter((e: any) => e.type === 'hh_token_invalid') || [];
        
        if (hhTokenErrors.length > 0) {
          setHhTokenError({
            candidateName: hhTokenErrors[0].candidateName,
            message: hhTokenErrors[0].message || _(msg`Требуется авторизация HH.ru для загрузки резюме`),
          });
          setHhTokenDialogOpen(true);
        }
        
        onSnackbar(_(msg`✅ Перемещено ${result.updated} кандидатов`));

        // Обновляем список с правильными параметрами пагинации и фильтрации
        const queryParams = new URLSearchParams();
        queryParams.append('page', (page + 1).toString());
        queryParams.append('perPage', rowsPerPage.toString());
        queryParams.append('sortBy', sortBy);
        queryParams.append('sortOrder', sortOrder);
        if (filters.source) queryParams.append('source', filters.source);
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.minScore) queryParams.append('minScore', filters.minScore.toString());

        const updatedResponse = await apiFetch(`${API_BASE}/api/admin/vacancies/${vacancyId}/candidates?${queryParams.toString()}`);
        const updatedData = await updatedResponse.json();
        setCandidates(updatedData.data || []);
        setTotal(updatedData.total || 0);
        
        // Сбрасываем выбор
        setSelectAllByFilter(false);

        return result;
      } else {
        // Проверяем специфичную ошибку HH token (403)
        if (response.status === 403) {
          const errorData = await response.json();
          if (errorData.error === 'hh.token_invalid') {
            setHhTokenError({
              candidateName: '',
              message: _(msg`Требуется авторизация HH.ru для загрузки резюме`),
            });
            setHhTokenDialogOpen(true);
            return;
          }
        }
        
        onSnackbar(_(msg`❌ Ошибка при перемещении`));
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error in bulk status change:', error);
      onSnackbar(_(msg`❌ Ошибка при перемещении`));
      throw error;
    }
  };

  const handleBulkStatusChange = async () => {
    if (!bulkStatus || selectedCandidates.length === 0) return;

    await performBulkStatusChange(selectedCandidates, bulkStatus);
    setSelectedCandidates([]);
    setBulkStatus('');
  };
  
  // Передаем данные для floating панели в родительский компонент
  useEffect(() => {
    if (onFloatingPanelData && selectedCandidates.length > 0) {
      onFloatingPanelData({
        selectedCandidates: candidates.filter(c => selectedCandidates.includes(c.id)),
        selectAllByFilter,
        total,
        // Для кнопки "Отправить приглашения"
        hhCandidatesInfo: selectAllByFilter 
          ? { isAll: true }  // Выбраны ВСЕ - не показываем число (мы его не знаем)
          : { 
              isAll: false, 
              count: candidates.filter(c => selectedCandidates.includes(c.id) && c.hhCandidateId).length 
            },
        onStatusChange: async (newStatus: string) => {
          await performBulkStatusChange(selectedCandidates, newStatus);
          handleClearSelection();
          setBulkStatus('');
        },
        onSendInvitations: async () => {
          await handleBulkSendInvitations();
        },
        onCancel: handleClearSelection,
      });
    } else if (onFloatingPanelData) {
      // Сбрасываем данные когда ничего не выбрано
      onFloatingPanelData(null as any);
    }
  }, [selectedCandidates, selectAllByFilter, candidates, total, sendingInProgress]);

  // Экспортируем метод для использования из parent component (для floating panel)
  useEffect(() => {
    if (onBulkStatusChangeRequest) {
      // Сохраняем ссылку на метод для вызова извне
      (window as any).__candidatesListBulkChange = performBulkStatusChange;
    }
    return () => {
      delete (window as any).__candidatesListBulkChange;
    };
  }, [vacancyId, page, rowsPerPage, sortBy, sortOrder, filters]);

  // Polling для отслеживания прогресса массовой отправки
  const pollSendingProgress = async (jobId: number) => {
    const maxAttempts = 300; // 5 минут (каждые 2 секунды)
    let attempts = 0;

    const poll = async (): Promise<void> => {
      if (attempts >= maxAttempts) {
        onSnackbar(_(msg`⏱️ Превышено время ожидания`));
        setSendingInProgress(false);
        return;
      }

      attempts++;

      try {
        const response = await apiFetch(`${API_BASE}/api/hh-integration/invitation-job/${jobId}/status`);
        
        if (response.ok) {
          const result = await response.json();
          const job = result.job;

          setSendingProgress({
            total: job.total,
            processed: job.processed,
            succeeded: job.succeeded,
            failed: job.failed,
            progress: job.progress,
          });

          if (job.isCompleted) {
            // Джоба завершена
            setSendingInProgress(false);
            setSendingResults(job.results || []);
            
            if (job.status === 'completed') {
              if (job.succeeded === job.total) {
                onSnackbar(_(msg`✅ Все приглашения отправлены (${job.succeeded}/${job.total})`));
              } else if (job.succeeded > 0) {
                onSnackbar(_(msg`⚠️ Частично отправлено: ${job.succeeded}/${job.total}`));
              } else {
                onSnackbar(_(msg`❌ Не удалось отправить приглашения`));
              }
            } else {
              onSnackbar(_(msg`❌ Ошибка отправки: ${job.errorMessage || 'Unknown error'}`));
            }

            // Обновляем список кандидатов
            const queryParams = new URLSearchParams();
            queryParams.append('page', (page + 1).toString());
            queryParams.append('perPage', rowsPerPage.toString());
            queryParams.append('sortBy', sortBy);
            queryParams.append('sortOrder', sortOrder);
            if (filters.source) queryParams.append('source', filters.source);
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.search) queryParams.append('search', filters.search);
            if (filters.minScore) queryParams.append('minScore', filters.minScore.toString());

            const refreshResponse = await apiFetch(`${API_BASE}/api/admin/vacancies/${vacancyId}/candidates?${queryParams.toString()}`);
            const refreshData = await refreshResponse.json();
            setCandidates(refreshData.data || []);
            setTotal(refreshData.total || 0);

            return;
          }

          // Продолжаем polling через 2 секунды
          setTimeout(() => poll(), 2000);
        } else {
          onSnackbar(_(msg`Ошибка проверки статуса отправки`));
          setSendingInProgress(false);
        }
      } catch (error) {
        console.error('Error polling sending progress:', error);
        onSnackbar(_(msg`Ошибка проверки статуса отправки`));
        setSendingInProgress(false);
      }
    };

    poll();
  };

  // Обработчик массовой отправки приглашений
  const handleBulkSendInvitations = async () => {
    // Debug logging
    console.log('🔍 handleBulkSendInvitations called', {
      selectAllByFilter,
      selectedCandidatesCount: selectedCandidates.length,
      total,
      candidatesOnPage: candidates.length,
    });

    // Если выбраны ВСЕ по фильтру - отправляем applyToAll
    if (selectAllByFilter) {
      console.log('✅ Sending with applyToAll=true');
      try {
        setSendingInProgress(true);
        setSendingProgressDialogOpen(true);
        
        // Не знаем точное количество HH кандидатов, ставим примерное
        setSendingProgress({ total: total, processed: 0, succeeded: 0, failed: 0, progress: 0 });

        const response = await apiFetch(`${API_BASE}/api/hh-integration/vacancy/${vacancyId}/send-bulk-invitations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            applyToAll: true,
            filters: {
              source: filters.source,
              status: filters.status,
              search: filters.search,
              minScore: filters.minScore,
            }
          }),
        });

        if (response.ok) {
          const result = await response.json();
          const jobId = result.jobId;
          setSendingJobId(jobId);
          
          // Запускаем polling
          pollSendingProgress(jobId);
        } else {
          const error = await response.json();
          onSnackbar(error.message || _(msg`Ошибка создания задачи отправки`));
          setSendingInProgress(false);
          setSendingProgressDialogOpen(false);
        }
      } catch (error) {
        console.error('Error starting bulk invitations (all by filter):', error);
        onSnackbar(_(msg`Ошибка отправки приглашений`));
        setSendingInProgress(false);
        setSendingProgressDialogOpen(false);
      }
      return;
    }

    // Обычный режим - только выбранные на странице
    console.log('📋 Sending with candidateIds (page mode)');
    const selectedCandidatesData = candidates.filter(c => selectedCandidates.includes(c.id));
    const hhCandidateIds = selectedCandidatesData
      .filter(c => c.hhCandidateId)
      .map(c => c.hhCandidateId);
    
    console.log('📋 HH Candidate IDs:', hhCandidateIds);
    
    if (hhCandidateIds.length === 0) {
      onSnackbar(_(msg`Среди выбранных нет кандидатов из HH.ru`));
      return;
    }

    try {
      setSendingInProgress(true);
      setSendingProgressDialogOpen(true);
      setSendingProgress({ total: hhCandidateIds.length, processed: 0, succeeded: 0, failed: 0, progress: 0 });

      const response = await apiFetch(`${API_BASE}/api/hh-integration/vacancy/${vacancyId}/send-bulk-invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ candidateIds: hhCandidateIds }),
      });

      if (response.ok) {
        const result = await response.json();
        const jobId = result.jobId;
        setSendingJobId(jobId);
        
        // Запускаем polling
        pollSendingProgress(jobId);
      } else {
        const error = await response.json();
        onSnackbar(error.message || _(msg`Ошибка создания задачи отправки`));
        setSendingInProgress(false);
        setSendingProgressDialogOpen(false);
      }
    } catch (error) {
      console.error('Error starting bulk invitations:', error);
      onSnackbar(_(msg`Ошибка отправки приглашений`));
      setSendingInProgress(false);
      setSendingProgressDialogOpen(false);
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

  const getCandidateStageLabel = (status: string) => {
    switch (status) {
      case 'new': return _(msg`Новый`);
      case 'screening': return _(msg`AI Скрининг`);
      case 'contacted': return _(msg`Связались`);
      case 'testing': return _(msg`Тестирование`);
      case 'finalist': return _(msg`Финалист`);
      case 'offer': return _(msg`Оффер`);
      case 'hired': return _(msg`Принят`);
      case 'rejected': return _(msg`Отклонён`);
      default: return status;
    }
  };

  const getCandidateStageColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status) {
      case 'new': return 'info';
      case 'screening': return 'primary';
      case 'contacted': return 'secondary';
      case 'testing': return 'warning';
      case 'finalist': return 'success';
      case 'offer': return 'success';
      case 'hired': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
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
      {/* Баннер "Выбрать все по фильтру" */}
      {selectedCandidates.length === candidates.length && 
       !selectAllByFilter && 
       total > candidates.length && (
        <Box 
          sx={{ 
            mb: 2, 
            p: 1.5, 
            bgcolor: 'info.light', 
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Typography variant="body2">
            <Trans>Выбрано {candidates.length} кандидатов на этой странице.</Trans>
          </Typography>
          <Button
            size="small" 
            variant="text" 
            onClick={handleSelectAllByFilter}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            <Trans>Выбрать все {total} кандидатов?</Trans>
          </Button>
        </Box>
      )}
      
      {/* Индикатор "Выбраны ВСЕ по фильтру" */}
      {selectAllByFilter && (
        <Box 
          sx={{ 
            mb: 2, 
            p: 1.5, 
            bgcolor: 'success.light', 
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Typography variant="body2" fontWeight={600}>
            <Trans>✓ Выбраны все {total} кандидатов, соответствующих фильтрам</Trans>
          </Typography>
          <Button
            size="small" 
            variant="outlined"
            onClick={handleClearSelection}
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
                    <Trans>📝 Тестирование</Trans>
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'status'}
                    direction={sortBy === 'status' ? sortOrder.toLowerCase() as 'asc' | 'desc' : 'asc'}
                    onClick={() => handleSort('status')}
                  >
                    <Trans>Стадия</Trans>
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
                    <Box display="flex" gap={0.5} alignItems="center">
                    <Chip
                      label={`${getSourceIcon(r.source)} ${ r.hhCandidateId ? 'HH.ru' : r.source === 'manual' ? _(msg`Ручной`) : r.source}`}
                      size="small"
                      variant="outlined"
                    />
                      {r.invitationSentAt && (
                        <Tooltip title={`Приглашение отправлено ${formatDate(r.invitationSentAt)}${r.invitationSentBy ? ` (${r.invitationSentBy})` : ''}`} arrow>
                          <Chip 
                            icon={<MailOutlineIcon sx={{ fontSize: 12 }} />}
                            label="✉️"
                            size="small"
                            color="success"
                            variant="outlined"
                            sx={{ height: 20, fontSize: 10 }}
                          />
                        </Tooltip>
                      )}
                    </Box>
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
                    <Box display="flex" flexDirection="column" gap={0.5} alignItems="center">
                      {/* Оценка - основная */}
                      <Box display="flex" alignItems="center" gap={0.5}>
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
                        {r.redFlagCount > 0 && (
                          <Tooltip title={_(msg`Критических вопросов с красным флагом: ${r.redFlagCount}`)} arrow>
                            <Chip
                              icon={<span style={{fontSize: 14}}>🚩</span>}
                              label={r.redFlagCount}
                              size="small"
                              color="error"
                              sx={{ height: 20, fontSize: 11, fontWeight: 700 }}
                            />
                          </Tooltip>
                        )}
                      </Box>
                      
                      {/* Статус интервью - вторичный, мелким шрифтом */}
                      <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                        {r.interviewStatus === 'ready' && _(msg`⏳ Не начато`)}
                        {r.interviewStatus === 'in_progress' && _(msg`▶️ В процессе`)}
                        {r.interviewStatus === 'finished' && _(msg`✅ Завершено`)}
                        {!r.interviewStatus && _(msg`Не проходили`)}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Стадия */}
                  <TableCell>
                    <Chip
                      label={getCandidateStageLabel(r.candidateStatus)}
                      size="small"
                      color={getCandidateStageColor(r.candidateStatus)}
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
            labelDisplayedRows={({ from, to, count }) => {
              const countText = count !== -1 ? count : _(msg`более ${to}`);
              return _(msg`${from}-${to} из ${countText}`);
            }}
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

      {/* Диалог прогресса массовой отправки */}
      <Dialog
        open={sendingProgressDialogOpen}
        onClose={() => {}}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown
      >
        <DialogTitle>
          {sendingInProgress ? (
            <Trans>📤 Отправка приглашений...</Trans>
          ) : (
            <Trans>✅ Отправка завершена</Trans>
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2">
                <Trans>Прогресс: {sendingProgress.processed} из {sendingProgress.total}</Trans>
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {sendingProgress.progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={sendingProgress.progress}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>

          <Box display="flex" gap={2} mb={2}>
            <Chip
              label={`✅ Успешно: ${sendingProgress.succeeded}`}
              color="success"
              size="small"
            />
            <Chip
              label={`❌ Ошибки: ${sendingProgress.failed}`}
              color="error"
              size="small"
            />
          </Box>

          {!sendingInProgress && sendingResults && sendingResults.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                <Trans>Детали:</Trans>
              </Typography>
              <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                {sendingResults.map((result, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      py: 0.5,
                      borderBottom: '1px solid #eee',
                    }}
                  >
                    <Box sx={{ fontSize: 14 }}>
                      {result.success ? '✅' : '❌'}
                    </Box>
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {result.candidateName || `Кандидат #${result.candidateId}`}
                    </Typography>
                    {!result.success && result.error && (
                      <Tooltip title={result.error} arrow>
                        <Chip label="Ошибка" size="small" color="error" />
                      </Tooltip>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {!sendingInProgress && (
            <Button
              onClick={() => {
                setSendingProgressDialogOpen(false);
                setSendingResults(null);
                setSelectedCandidates([]);
              }}
              variant="contained"
              color="primary"
            >
              <Trans>Закрыть</Trans>
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
