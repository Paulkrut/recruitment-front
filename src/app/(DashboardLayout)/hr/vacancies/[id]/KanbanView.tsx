"use client";
import React, { useState, useEffect, useCallback, memo, useMemo, startTransition } from 'react';
import {
  Box, Card, Typography, Chip, Avatar, IconButton, CircularProgress, Tooltip, Divider, Link, Button,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Alert, Snackbar
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { apiFetch } from '@/utils/api';
import moment from 'moment';
import 'moment/locale/ru';
import BulkActionsPanel from './BulkActionsPanel';
import AddStageButton from './AddStageButton';
import CustomStageModal from './CustomStageModal';
import StageMenu from './StageMenu';
import DeleteStageDialog from './DeleteStageDialog';
import { useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';


const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

// Настройка moment.js
moment.locale('ru');

// Высота одной карточки кандидата (примерно)
const CARD_HEIGHT = 160; // Уменьшена для компактности (стиль Битрикс)
const CARD_GAP = 8;

// Форматирование даты в стиле Битрикс24
const formatBitrixDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '';

  const date = moment(dateString);
  const now = moment();

  // Сегодня - показываем время
  if (date.isSame(now, 'day')) {
    return _(msg`сегодня, ${date.format('HH:mm')}`);
  }

  // Вчера
  if (date.isSame(now.clone().subtract(1, 'day'), 'day')) {
    return _(msg`вчера, ${date.format('HH:mm')}`);
  }

  // В этом году - без года
  if (date.isSame(now, 'year')) {
    return date.format('D MMM');
  }

  // Старше года - с годом
  return date.format('D MMM YYYY');
};

interface CandidateCard {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  source: string;
  tags: string[];
  createdAt: string;
  unreadMessages: number;
  aiScore: number | null;
  aiComment: string | null;
  aiAnalysisStatus: string | null; // null | loading_resume | analyzing | completed | failed
  score: number | null; // Оценка за прохождение теста (0-10)
  sessionId: number | null;
  sessionStatus: string; // new | started | finished - статус тестирования
  answersCount: number; // Количество отвеченных вопросов
  startedAt: string | null; // Когда начал тест
  finishedAt: string | null; // Когда завершил тест
  lastContactedAt: string | null;
  communicationStatus: string;
}

interface Column {
  value: string;
  label: string;
  color: string;
  icon: string;
  order: number;
  isCustom?: boolean;
  customId?: number;
}

interface KanbanViewProps {
  vacancyId: string;
  filters: {
    source?: string;
    search?: string;
    minScore?: number;
    aiAnalysisStatus?: string;
    hasResume?: string;
    hhStage?: string;
    datePreset?: string;
    dateFrom?: string;
    dateTo?: string;
  };
  selectedCandidates?: number[];
  onSelectedCandidatesChange?: (ids: number[] | ((prev: number[]) => number[])) => void;
}

// Helper-функции для получения цветов колонок
const getColumnBgColor = (column: Column): string => {
  if (column.isCustom) {
    // Для кастомных стадий делаем светлую версию цвета (добавляем прозрачность)
    return column.color + '20'; // 20 = ~12% opacity в HEX
  }

  const colorMap: Record<string, string> = {
    'new': '#E3F2FD',
    'screening': '#E0F2F1',
    'contacted': '#FFF3E0',
    'testing': '#F3E5F5',
    'finalist': '#E8F5E9',
    'offer': '#FFF9C4',
    'hired': '#C8E6C9',
    'deferred': '#F5F5F5',
    'rejected': '#FFEBEE',
  };

  return colorMap[column.value] || '#F5F5F5';
};

const getColumnBorderColor = (column: Column): string => {
  if (column.isCustom) {
    return column.color;
  }

  const colorMap: Record<string, string> = {
    'new': '#1976D2',
    'screening': '#00897B',
    'contacted': '#F57C00',
    'testing': '#7B1FA2',
    'finalist': '#388E3C',
    'offer': '#F9A825',
    'hired': '#2E7D32',
    'deferred': '#757575',
    'rejected': '#D32F2F',
  };

  return colorMap[column.value] || '#757575';
};

const getColumnHoverColor = (column: Column): string => {
  if (column.isCustom) {
    // Для кастомных - делаем чуть темнее оригинального цвета
    return column.color + 'CC'; // CC = ~80% opacity
  }

  const colorMap: Record<string, string> = {
    'new': '#1565C0',
    'screening': '#00695C',
    'contacted': '#E65100',
    'testing': '#6A1B9A',
    'finalist': '#2E7D32',
    'offer': '#F57F17',
    'hired': '#1B5E20',
    'deferred': '#616161',
    'rejected': '#C62828',
  };

  return colorMap[column.value] || '#616161';
};

// Информация о триггерах для каждого статуса
const STATUS_TRIGGERS: Record<string, string[]> = {
  'screening': [
    _(msg`🤖 AI-анализ резюме`),
  ],
  'contacted': [
    _(msg`📧 Отправка приглашения на тестирование`),
    _(msg`🔗 Генерация ссылки на тест`),
  ],
  'testing': [
    _(msg`⏱️ Активация таймера тестирования`),
  ],
  'finalist': [
    _(msg`🔔 Уведомление HR менеджера`),
  ],
  'offer': [],
  'rejected': [
    _(msg`✉️ Отправка письма отказа`),
    _(msg`📁 Добавление в талант-пул`),
  ],
};

// Нативный HTML5 Drag & Drop (БЫСТРО!)
const DraggableCandidateCard = memo(({
  candidate,
  isDragging,
  getSourceIcon,
  selectionMode,
  isSelected,
  onToggleSelect,
  onDragStart,
  onDragEnd,
}: {
  candidate: CandidateCard;
  isDragging: boolean;
  getSourceIcon: (source: string) => string;
  selectionMode: boolean;
  isSelected: boolean;
  onToggleSelect: (id: number, status: string) => void;
  onDragStart: (candidateId: number) => void;
  onDragEnd: (candidateId: number, newStatus: string | null) => void;
}) => {
  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('candidateId', candidate.id.toString());
    e.dataTransfer.setData('currentStatus', candidate.status);
    onDragStart(candidate.id);
  }, [candidate.id, candidate.status, onDragStart]);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    const newStatus = e.dataTransfer.dropEffect === 'none' ? null : e.dataTransfer.getData('targetStatus');
    onDragEnd(candidate.id, newStatus);
  }, [candidate.id, onDragEnd]);

  const style: React.CSSProperties = {
    opacity: isDragging ? 0.5 : 1,
    cursor: selectionMode ? 'pointer' : 'grab',
  };

  // Обработчик открытия карточки
  const handleOpenDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`/hr/candidates/${candidate.id}`, '_blank');
  };

  // Цвет AI Score
  const getAiScoreColor = () => {
    if (!candidate.aiScore) return 'default';
    if (candidate.aiScore >= 90) return 'success';
    if (candidate.aiScore >= 75) return 'info';
    if (candidate.aiScore >= 60) return 'warning';
    return 'error';
  };

  return (
    <div>
      <Card
        draggable={!selectionMode}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        data-candidate-id={candidate.id}
        sx={{
          ...style,
          p: 1.5,
          pl: 2, // Больше отступ слева для полоски
          cursor: 'grab',
          userSelect: 'none',
          position: 'relative',
          minHeight: 140,
          borderRadius: 0, // Без закруглённых углов
          '&:active': { cursor: 'grabbing' },
          '&:hover': {
            boxShadow: 2,
            borderColor: 'primary.main',
          },
          transition: 'all 0.15s',
          border: '1px solid',
          borderColor: 'divider',
          borderLeft: '3px solid',
          borderLeftColor: candidate.status === 'new' ? '#42A5F5' :           // Светло-синий
                           candidate.status === 'screening' ? '#26A69A' :     // Светло-бирюзовый (был голубой)
                           candidate.status === 'contacted' ? '#FFA726' :     // Светло-оранжевый
                           candidate.status === 'testing' ? '#AB47BC' :       // Светло-фиолетовый
                           candidate.status === 'finalist' ? '#66BB6A' :      // Светло-зелёный
                           candidate.status === 'offer' ? '#FFCA28' :         // Светло-жёлтый
                           candidate.status === 'hired' ? '#4CAF50' :         // Зелёный
                           candidate.status === 'deferred' ? '#BDBDBD' :      // Светло-серый
                           candidate.status === 'rejected' ? '#EF5350' : '#BDBDBD',
          mb: 1,
        }}
      >
        {/* Левый верхний угол - чекбокс для выделения */}
        {selectionMode && (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect(candidate.id, candidate.status);
            }}
            sx={{
              position: 'absolute',
              top: 4,
              left: 4,
              bgcolor: 'background.paper',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            {isSelected ? (
              <CheckBoxIcon color="primary" />
            ) : (
              <CheckBoxOutlineBlankIcon />
            )}
          </IconButton>
        )}

        {/* Основная информация - стиль Битрикс24 */}
        <Box sx={{
          pl: selectionMode ? 5 : 0, // Отступ слева для чекбокса в режиме выделения
        }}>
          {/* AI Score крупно (как цена в Битрикс) или статус анализа */}
          {candidate.aiScore !== null ? (
            <Tooltip title={candidate.aiComment || _(msg`AI оценка резюме`)} arrow>
              <Typography
                variant="h6"
                fontWeight="bold"
                color={getAiScoreColor() + '.main'}
                sx={{ mb: 0.5 }}
              >
                AI: {candidate.aiScore}%
              </Typography>
            </Tooltip>
          ) : candidate.aiAnalysisStatus === 'loading_resume' ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <CircularProgress size={16} thickness={6} />
              <Typography variant="caption" color="text.secondary"><Trans>⏳ Загрузка резюме...</Trans></Typography>
            </Box>
          ) : candidate.aiAnalysisStatus === 'analyzing' ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <CircularProgress size={16} thickness={6} />
              <Typography variant="caption" color="text.secondary"><Trans>🤖 AI анализ...</Trans></Typography>
            </Box>
          ) : candidate.aiAnalysisStatus === 'failed' ? (
            <Tooltip title={_(msg`Ошибка при анализе резюме. Попробуйте позже.`)} arrow>
              <Typography variant="caption" color="error.main" sx={{ mb: 0.5 }}><Trans>❌ Ошибка анализа</Trans></Typography>
            </Tooltip>
          ) : null}

          {/* Имя кандидата - ссылка */}
          <Link
            href={`/hr/candidates/${candidate.id}`}
            underline="hover"
            color="text.primary"
            onClick={(e) => { e.stopPropagation(); }}
            sx={{ cursor: 'pointer' }}
          >
            <Typography variant="subtitle2" fontWeight="medium" sx={{ mb: 0.25 }}>
              {candidate.name}
            </Typography>
          </Link>

          {/* Источник */}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            {getSourceIcon(candidate.source)} {candidate.source === 'headhunter' && 'HH.ru'}
            {candidate.source === 'manual' && <Trans>Ручной ввод</Trans>}
            {candidate.source === 'linkedin' && 'LinkedIn'}
          </Typography>

          {/* Блок тестирования (если есть сессия или оценка) */}
          {(candidate.sessionId || candidate.score !== null) && (
            <Box sx={{
              bgcolor: 'grey.50',
              borderRadius: 1,
              p: 1,
              mb: 0.5
            }}>
              <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}><Trans>📝 Тестирование</Trans></Typography>

              {/* Статус */}
              {candidate.sessionId && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                  <Typography variant="caption" color="text.secondary"><Trans>Статус:</Trans></Typography>
                  <Typography variant="caption" fontWeight="500" color={
                    candidate.sessionStatus === 'finished' ? 'success.main' :
                    candidate.sessionStatus === 'started' ? 'info.main' : 'text.secondary'
                  }>
                    {candidate.sessionStatus === 'finished' ? _(msg`✅ Завершён`) :
                     candidate.sessionStatus === 'started' ? _(msg`⏳ В процессе`) : _(msg`⚪ Не начат`)}
                  </Typography>
                </Box>
              )}

              {/* Средний балл */}
              {candidate.score !== null && candidate.score !== undefined && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                  <Typography variant="caption" color="text.secondary"><Trans>Балл:</Trans></Typography>
                  <Typography variant="caption" fontWeight="600" color={
                    candidate.score >= 9 ? 'success.main' :
                    candidate.score >= 7 ? 'success.light' :
                    candidate.score >= 5 ? 'warning.main' :
                    candidate.score >= 3 ? 'warning.dark' : 'error.main'
                  }>
                    {candidate.score}/10
                  </Typography>
                </Box>
              )}

              {/* Количество ответов (если в процессе) */}
              {candidate.sessionStatus === 'started' && candidate.answersCount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                  <Typography variant="caption" color="text.secondary"><Trans>Ответов:</Trans></Typography>
                  <Typography variant="caption" fontWeight="500">
                    {candidate.answersCount}
                  </Typography>
                </Box>
              )}

              {/* Дата завершения (если завершён) */}
              {candidate.sessionStatus === 'finished' && candidate.finishedAt && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary"><Trans>Завершён:</Trans></Typography>
                  <Typography variant="caption" fontWeight="500">
                    {formatBitrixDate(candidate.finishedAt)}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* Разделитель */}
        <Divider sx={{ my: 1 }} />

        {/* Нижняя панель - дата, статус коммуникации и ссылка на карточку */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
          {/* Дата добавления */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary" display="block"><Trans>
              Добавлен: {formatBitrixDate(candidate.createdAt)}
            </Trans></Typography>

            {/* Последний контакт (если есть) */}
            {candidate.lastContactedAt && (
              <Typography variant="caption" color="text.secondary" display="block"><Trans>
                Контакт: {formatBitrixDate(candidate.lastContactedAt)}
              </Trans></Typography>
            )}
          </Box>

          {/* Открыть карточку */}
          <Tooltip title={_(msg`Открыть карточку`)} arrow>
            <IconButton size="small" onClick={handleOpenDetails} sx={{ p: 0.5 }}>
              <PersonIcon fontSize="small" sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Card>
    </div>
  );
}, (prevProps, nextProps) => {
  // Оптимизация: перерисовывать только если изменились нужные пропсы
  return (
    prevProps.candidate.id === nextProps.candidate.id &&
    prevProps.isDragging === nextProps.isDragging &&
    prevProps.selectionMode === nextProps.selectionMode &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.candidate.status === nextProps.candidate.status &&
    prevProps.candidate.aiScore === nextProps.candidate.aiScore &&
    prevProps.candidate.score === nextProps.candidate.score &&
    prevProps.candidate.sessionStatus === nextProps.candidate.sessionStatus &&
    prevProps.candidate.answersCount === nextProps.candidate.answersCount &&
    prevProps.candidate.lastContactedAt === nextProps.candidate.lastContactedAt
  );
});

DraggableCandidateCard.displayName = 'DraggableCandidateCard';

// Droppable колонка для нативного HTML5 DnD
const DroppableColumn = ({
  id,
  children,
  onDrop,
}: {
  id: string;
  children: React.ReactNode;
  onDrop: (candidateId: number, newStatus: string) => void;
}) => {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);

    const candidateId = parseInt(e.dataTransfer.getData('candidateId'));
    if (candidateId) {
      e.dataTransfer.setData('targetStatus', id);
      onDrop(candidateId, id);
    }
  }, [id, onDrop]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        minHeight: '600px',
        minWidth: '320px',
        backgroundColor: isOver ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
        borderRadius: isOver ? '8px' : '0',
        transition: 'background-color 0.2s',
      }}
    >
      {children}
    </div>
  );
};

export default function KanbanView({
  vacancyId,
  filters,
  selectedCandidates: externalSelectedCandidates = [],
  onSelectedCandidatesChange
}: KanbanViewProps) {
  const { _ } = useLingui();

  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<number | null>(null);

  // Новая структура: состояние для каждой колонки с пагинацией
  const [columnData, setColumnData] = useState<Record<string, {
    candidates: CandidateCard[];
    page: number;
    hasMore: boolean;
    loading: boolean;
    total: number;
  }>>({});

  // Счётчики для колонок (загружаются отдельным запросом)
  const [stats, setStats] = useState<Record<string, number>>({});

  // Состояние для массового выделения
  const [selectionMode, setSelectionMode] = useState(false);

  // Используем внешнее состояние для выбранных кандидатов (для синхронизации с главной страницей)
  const selectedCandidatesSet = useMemo(() => new Set(externalSelectedCandidates), [externalSelectedCandidates]);

  const updateSelectedCandidates = useCallback((newSet: Set<number>) => {
    if (onSelectedCandidatesChange) {
      onSelectedCandidatesChange(Array.from(newSet));
    }
  }, [onSelectedCandidatesChange]);

  // Состояние для выбора ВСЕХ кандидатов в колонке (включая не загруженные)
  const [selectedAllInColumn, setSelectedAllInColumn] = useState<Set<string>>(new Set());

  // Состояние для модалки кастомных стадий
  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [stageModalPosition, setStageModalPosition] = useState<number>(0);
  const [editingStage, setEditingStage] = useState<{id: number, name: string, color: string} | null>(null);

  // Состояние для удаления стадии
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingStage, setDeletingStage] = useState<{id: number, name: string, value: string} | null>(null);
  const [deleteCandidatesCount, setDeleteCandidatesCount] = useState(0);

  // Состояние для лимитов HH
  const [hhLimits, setHhLimits] = useState<{
    left: { resumeView: number };
    limits: { resumeView: number };
    spend: { resumeView: number };
  } | null>(null);
  const [resumeQueueCount, setResumeQueueCount] = useState<number>(0);

  // Состояние для HH Token Required Dialog
  const [hhTokenDialogOpen, setHhTokenDialogOpen] = useState(false);
  const [hhTokenError, setHhTokenError] = useState<{
    candidateName?: string;
    message?: string;
  } | null>(null);

  // Состояние для Snackbar (сводка ошибок при пакетной операции)
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'warning' | 'error'>('success');

  // Обработчик переключения выделения кандидата
  const handleToggleSelect = useCallback((candidateId: number, candidateStatus: string) => {
    // Если в этой колонке был выбран чекбокс "все" - снимаем его
    if (selectedAllInColumn.has(candidateStatus)) {
      setSelectedAllInColumn(prev => {
        const newSet = new Set(prev);
        newSet.delete(candidateStatus);
        return newSet;
      });
    }

    // Используем функциональное обновление, чтобы получить актуальное состояние
    if (onSelectedCandidatesChange) {
      onSelectedCandidatesChange(prev => {
        const newSet = new Set(prev);
        if (newSet.has(candidateId)) {
          newSet.delete(candidateId);
        } else {
          newSet.add(candidateId);
        }
        return Array.from(newSet);
      });
    }
  }, [selectedAllInColumn, onSelectedCandidatesChange]);

  // Обработчик выбора ВСЕХ кандидатов в колонке (включая не загруженные)
  const handleToggleSelectAllInColumn = useCallback((columnId: string) => {
    setSelectedAllInColumn(prev => {
      const newSet = new Set(prev);
      if (newSet.has(columnId)) {
        // Снимаем выбор ВСЕХ в колонке
        newSet.delete(columnId);
      } else {
        // Выбираем ВСЕХ в колонке
        newSet.add(columnId);

        // Очищаем индивидуально выбранных кандидатов из этой колонки
        // (чтобы не было двойного подсчёта)
        const data = columnData[columnId];
        if (data && onSelectedCandidatesChange) {
          onSelectedCandidatesChange(prev => {
            const newSelected = new Set(prev);
            data.candidates.forEach(c => newSelected.delete(c.id));
            return Array.from(newSelected);
          });
        }
      }
      return newSet;
    });
  }, [columnData, onSelectedCandidatesChange]);

  // Обработчик открытия модалки добавления кастомной стадии
  const handleAddStage = useCallback((position: number) => {
    setStageModalPosition(position);
    setStageModalOpen(true);
  }, []);

  // Обработчик редактирования стадии
  const handleEditStage = useCallback((customId: number) => {
    const stage = columns.find(col => col.customId === customId);
    if (stage) {
      setEditingStage({
        id: customId,
        name: stage.label,
        color: stage.color,
      });
      setStageModalOpen(true);
    }
  }, [columns]);

  // Обработчик удаления стадии
  const handleDeleteStage = useCallback(async (customId: number) => {
    const stage = columns.find(col => col.customId === customId);
    if (!stage) return;

    try {
      // Проверяем есть ли кандидаты
      const response = await apiFetch(`${API_BASE}/api/custom-stages/${customId}/check-candidates`);

      if (response.ok) {
        const result = await response.json();
        setDeletingStage({
          id: customId,
          name: stage.label,
          value: stage.value,
        });
        setDeleteCandidatesCount(result.candidatesCount);
        setDeleteDialogOpen(true);
      }
    } catch (error) {
      console.error('Error checking candidates:', error);
      alert(_(msg`Произошла ошибка при проверке кандидатов`));
    }
  }, [columns]);

  // Подтверждение удаления стадии
  const handleConfirmDelete = useCallback(async (moveToStatus: string) => {
    if (!deletingStage) return;

    try {
      const response = await apiFetch(`${API_BASE}/api/custom-stages/${deletingStage.id}`, {
        method: 'DELETE',
        body: JSON.stringify({ moveToStatus }),
      });

      if (response.ok) {
        const result = await response.json();
        setDeleteDialogOpen(false);

        // Удаляем колонку из списка
        setColumns(prev => prev.filter(col => col.customId !== deletingStage.id));

        // Удаляем данные колонки
        setColumnData(prev => {
          const updated = { ...prev };
          delete updated[deletingStage.value];
          return updated;
        });

        // Удаляем статистику
        setStats(prev => {
          const updated = { ...prev };
          delete updated[deletingStage.value];
          return updated;
        });

        // Если кандидаты были перемещены - перезагружаем данные для целевой колонки
        if (result.movedCandidates > 0) {
          loadCandidatesForStatus(moveToStatus, 1, false);
          fetchStats();
        }

        alert(`Стадия удалена. ${result.movedCandidates > 0 ? `Перемещено кандидатов: ${result.movedCandidates}` : ''}`);
      } else {
        const error = await response.json();
        alert(_(msg`Ошибка: ${error.message || _(msg`Не удалось удалить стадию`)}`));
      }
    } catch (error) {
      console.error('Error deleting stage:', error);
      alert(_(msg`Произошла ошибка при удалении стадии`));
    }
  }, [deletingStage]);

  // Обработчик создания/обновления кастомной стадии
  const handleCreateStage = useCallback(async (name: string, color: string) => {
    try {
      // Если редактируем существующую стадию
      if (editingStage) {
        const response = await apiFetch(`${API_BASE}/api/custom-stages/${editingStage.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ name, color }),
        });

        if (response.ok) {
          const result = await response.json();
          setStageModalOpen(false);
          setEditingStage(null);

          // Обновляем колонку локально
          setColumns(prev => prev.map(col =>
            col.customId === editingStage.id
              ? { ...col, label: result.stage.name, color: result.stage.color }
              : col
          ));
        } else {
          const error = await response.json();
          alert(_(msg`Ошибка: ${error.error || _(msg`Не удалось обновить стадию`)}`));
        }
      }
      // Если создаём новую стадию
      else {
        const response = await apiFetch(`${API_BASE}/api/custom-stages`, {
          method: 'POST',
          body: JSON.stringify({
            name,
            color,
            position: stageModalPosition,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          setStageModalOpen(false);

          // Добавляем новую стадию локально без перезагрузки
          const newColumn = {
            value: `custom_${result.stage.id}`,
            label: result.stage.name,
            color: result.stage.color,
            icon: '⭐',
            order: result.stage.position,
            isCustom: true,
            customId: result.stage.id,
          };

          // Добавляем колонку в список
          setColumns(prev => {
            const updated = [...prev, newColumn];
            // Сортируем по order
            updated.sort((a, b) => a.order - b.order);
            return updated;
          });

          // Инициализируем данные для новой колонки
          setColumnData(prev => ({
            ...prev,
            [newColumn.value]: {
              candidates: [],
              page: 1,
              hasMore: false,
              loading: false,
              total: 0,
            }
          }));

          // Инициализируем статистику
          setStats(prev => ({
            ...prev,
            [newColumn.value]: 0,
          }));
        } else {
          const error = await response.json();
          alert(_(msg`Ошибка: ${error.error || _(msg`Не удалось создать стадию`)}`));
        }
      }
    } catch (error) {
      console.error('Error saving custom stage:', error);
      alert(_(msg`Произошла ошибка при сохранении стадии`));
    }
  }, [stageModalPosition, editingStage]);

  // Используем нативный HTML5 DnD - не нужны sensors!

  // Загрузить статистику (счётчики для колонок)
  const fetchStats = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.source) queryParams.append('source', filters.source);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.minScore) queryParams.append('minScore', filters.minScore.toString());
      if (filters.aiAnalysisStatus) queryParams.append('aiAnalysisStatus', filters.aiAnalysisStatus);
      if (filters.hasResume) queryParams.append('hasResume', filters.hasResume);
      if (filters.hhStage) queryParams.append('hhStage', filters.hhStage);
      if (filters.datePreset) queryParams.append('datePreset', filters.datePreset);
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);

      const response = await apiFetch(
        `${API_BASE}/api/admin/vacancies/${vacancyId}/candidates/stats?${queryParams.toString()}`
      );
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [vacancyId, filters]);

  // Загрузить кандидатов для конкретного статуса (с пагинацией)
  const loadCandidatesForStatus = useCallback(async (status: string, page: number = 1, append: boolean = false) => {
    // Устанавливаем loading для этой колонки
    setColumnData(prev => ({
      ...prev,
      [status]: {
        ...prev[status],
        candidates: prev[status]?.candidates || [],
        page: prev[status]?.page || 1,
        hasMore: prev[status]?.hasMore !== false,
        loading: true,
        total: prev[status]?.total || 0,
      }
    }));

    try {
      const queryParams = new URLSearchParams();
      queryParams.append('status', status);
      queryParams.append('page', page.toString());
      queryParams.append('perPage', '20'); // Пагинация по 20 кандидатов

      if (filters.source) queryParams.append('source', filters.source);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.minScore) queryParams.append('minScore', filters.minScore.toString());
      if (filters.aiAnalysisStatus) queryParams.append('aiAnalysisStatus', filters.aiAnalysisStatus);
      if (filters.hasResume) queryParams.append('hasResume', filters.hasResume);
      if (filters.hhStage) queryParams.append('hhStage', filters.hhStage);
      if (filters.datePreset) queryParams.append('datePreset', filters.datePreset);
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);

      const response = await apiFetch(
        `${API_BASE}/api/admin/vacancies/${vacancyId}/candidates/kanban?${queryParams.toString()}`
      );
      const data = await response.json();

      const statusCandidates = data.candidates[status] || [];

      setColumnData(prev => ({
        ...prev,
        [status]: {
          candidates: append
            ? [...(prev[status]?.candidates || []), ...statusCandidates]
            : statusCandidates,
          page: data.pagination.page,
          hasMore: data.pagination.hasMore,
          loading: false,
          total: data.pagination.total,
        }
      }));
    } catch (error) {
      console.error(`Error loading candidates for ${status}:`, error);
      setColumnData(prev => ({
        ...prev,
        [status]: {
          ...prev[status],
          loading: false,
        }
      }));
    }
  }, [vacancyId, filters]);

  // Инициализация: загрузить колонки, статистику и первую страницу для каждого статуса
  const initializeKanban = useCallback(async () => {
    setLoading(true);
    try {
      // Получаем список колонок из CandidateStatus
      const response = await apiFetch(
        `${API_BASE}/api/admin/vacancies/${vacancyId}/candidates/kanban?perPage=1`
      );
      const data = await response.json();
      setColumns(data.columns || []);

      // Инициализируем пустые данные для всех колонок с loading=true
      const statuses = (data.columns || []).map((col: Column) => col.value);
      const emptyData: Record<string, any> = {};
      statuses.forEach((status: string) => {
        emptyData[status] = {
          candidates: [],
          page: 1,
          hasMore: true,
          loading: true, // Помечаем что загружается
          total: 0,
        };
      });
      setColumnData(emptyData);

      // Сразу показываем структуру канбана
      setLoading(false);

      // Загружаем статистику в фоне
      fetchStats();

      // Загружаем кандидатов для каждой колонки параллельно
      // Не ждём завершения - данные появятся по мере загрузки
      statuses.forEach((status: string) => {
        loadCandidatesForStatus(status, 1, false);
      });

    } catch (error) {
      console.error('Error initializing kanban:', error);
      setLoading(false);
    }
  }, [vacancyId, fetchStats, loadCandidatesForStatus]);

  // Обработчик скролла для infinite loading
  const handleScroll = (status: string, event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;

    // Если прокрутили почти до конца (осталось 50px - загружаем сразу!)
    if (scrollHeight - scrollTop - clientHeight < 50) {
      const data = columnData[status];

      // Загружаем следующую страницу если есть ещё данные и не идёт загрузка
      if (data && data.hasMore && !data.loading) {
        loadCandidatesForStatus(status, data.page + 1, true);
      }
    }
  };

  // Инициализация при монтировании или изменении фильтров
  useEffect(() => {
    initializeKanban();
  }, [initializeKanban]);

  // Загрузка лимитов HH при монтировании компонента
  useEffect(() => {
    const fetchHhLimits = async () => {
      try {
        const response = await apiFetch(`${API_BASE}/api/hh-integration/status`);
        const data = await response.json();
        if (data.hhLimits) {
          setHhLimits(data.hhLimits);
        }
        if (data.resumeQueueCount !== undefined) {
          setResumeQueueCount(data.resumeQueueCount);
        }
      } catch (error) {
        console.error('Error fetching HH limits:', error);
      }
    };

    fetchHhLimits();
  }, []);

  // Умное обновление колонки AI Скрининг (polling только если есть кандидаты в процессе)
  useEffect(() => {
    // Проверяем есть ли в колонке "screening" кандидаты с aiAnalysisStatus в процессе
    const screeningData = columnData['screening'];
    if (!screeningData || screeningData.candidates.length === 0) {
      return; // Нет кандидатов в колонке
    }

    const candidatesInProgress = screeningData.candidates.filter(
      c => c.aiAnalysisStatus === 'loading_resume' || c.aiAnalysisStatus === 'analyzing'
    );

    if (candidatesInProgress.length === 0) {
      return; // Все кандидаты уже обработаны
    }

    // Запускаем polling только если есть кандидаты в процессе
    console.log(`🔄 Starting AI analysis polling for ${candidatesInProgress.length} candidates in screening`);

    const intervalId = setInterval(() => {
      console.log('🔄 Polling screening column for AI analysis updates...');
      loadCandidatesForStatus('screening', 1, false); // Обновляем первую страницу
    }, 15000); // Каждые 15 секунд

    // Cleanup при размонтировании или изменении данных
    return () => {
      console.log('⏹️ Stopping AI analysis polling');
      clearInterval(intervalId);
    };
  }, [columnData, loadCandidatesForStatus]); // Перезапускаем если данные изменились

  // Нативные HTML5 DnD обработчики
  const handleNativeDragStart = useCallback((candidateId: number) => {
    console.time('native-drag-start');
    setActiveId(candidateId);
    console.timeEnd('native-drag-start');
  }, []);

  const handleNativeDragEnd = useCallback((candidateId: number, newStatus: string | null) => {
    setActiveId(null);
  }, []);

  const handleNativeDrop = useCallback((candidateId: number, newStatus: string) => {
    console.time('native-drop-ui');

    // Находим текущий статус кандидата
    let currentStatus: string | null = null;
    for (const [status, data] of Object.entries(columnData)) {
      if (data.candidates.find(c => c.id === candidateId)) {
        currentStatus = status;
        break;
      }
    }

    if (!currentStatus || currentStatus === newStatus) {
      console.timeEnd('native-drop-ui');
      return;
    }

    // МГНОВЕННОЕ оптимистичное обновление UI
    setColumnData((prev) => {
      const updated = { ...prev };

      const candidateToMove = updated[currentStatus]?.candidates.find((c) => c.id === candidateId);
      if (!candidateToMove) {
        return prev;
      }

      // Удаляем из старой колонки
      updated[currentStatus] = {
        ...updated[currentStatus],
        candidates: updated[currentStatus].candidates.filter((c) => c.id !== candidateId),
      };

      // Обновляем статус кандидата
      candidateToMove.status = newStatus;

      // Добавляем в новую колонку (в начало списка)
      if (!updated[newStatus]) {
        updated[newStatus] = {
          candidates: [],
          page: 1,
          hasMore: false,
          loading: false,
          total: 0,
        };
      }
      updated[newStatus] = {
        ...updated[newStatus],
        candidates: [candidateToMove, ...updated[newStatus].candidates],
      };

      return updated;
    });

    console.timeEnd('native-drop-ui');

    // API запрос в фоне (НЕ блокируем UI!)
    // Сохраняем currentStatus в константу для использования в промисах
    const oldStatus = currentStatus;

    apiFetch(
      `${API_BASE}/api/admin/vacancies/${vacancyId}/candidates/${candidateId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      }
    ).then(async response => {
      console.log('API response:', response.status, response.ok);

      if (!response.ok) {
        // Проверяем специфичную ошибку HH token
        if (response.status === 403) {
          const error = await response.json();

          if (error.error === 'hh_token_required') {
            // Откатываем UI
            await loadCandidatesForStatus(oldStatus, 1, false);
            await loadCandidatesForStatus(newStatus, 1, false);
            fetchStats();

            // Показываем модальное окно
            setHhTokenError({
              candidateName: error.candidateName,
              message: error.message || _(msg`Требуется авторизация HH.ru для загрузки резюме`),
            });
            setHhTokenDialogOpen(true);
            return;
          }
        }

        console.error('Failed to update candidate status - rolling back');
        // Откатываем - перезагружаем эти две колонки
        await loadCandidatesForStatus(oldStatus, 1, false);
        await loadCandidatesForStatus(newStatus, 1, false);
        // Обновляем статистику после отката
        fetchStats();
      } else {
        console.log('✅ Candidate status updated successfully on server');

        // Обновляем счётчики в stats
        setStats(prev => ({
          ...prev,
          [oldStatus]: Math.max(0, (prev[oldStatus] || 0) - 1), // Уменьшаем старую колонку
          [newStatus]: (prev[newStatus] || 0) + 1, // Увеличиваем новую колонку
        }));
      }
    }).catch(error => {
      console.error('Error updating candidate status - rolling back:', error);
      // Откатываем
      loadCandidatesForStatus(oldStatus, 1, false);
      loadCandidatesForStatus(newStatus, 1, false);
      // Обновляем статистику после отката
      fetchStats();
    });
  }, [columnData, vacancyId, loadCandidatesForStatus, fetchStats]);

  // Обработчик массового перемещения
  const handleBulkMove = useCallback(async (newStatus: string) => {
    try {
      const payload: {
        candidateIds?: number[];
        selectAllInStatuses?: string[];
        status: string;
      } = {
        status: newStatus,
      };

      // Если выбраны конкретные кандидаты
      if (selectedCandidatesSet.size > 0) {
        payload.candidateIds = Array.from(selectedCandidatesSet);
      }

      // Если выбраны ВСЕ кандидаты в колонках
      if (selectedAllInColumn.size > 0) {
        payload.selectAllInStatuses = Array.from(selectedAllInColumn);
      }

      const response = await apiFetch(
        `${API_BASE}/api/admin/vacancies/${vacancyId}/candidates/bulk-status`,
        {
          method: 'PATCH',
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log('Bulk update result:', result);

        // Проверяем есть ли ошибки HH token
        const hhTokenErrors = result.errors?.filter((e: any) => e.error === 'hh_token_required') || [];

        if (hhTokenErrors.length > 0) {
          // Если есть ошибки HH token - показываем Snackbar
          const successCount = result.updated || 0;
          const totalCount = result.total || 0;
          const errorCount = hhTokenErrors.length;

          setSnackbarMessage(_(msg`${successCount} из ${totalCount} кандидатов переведены. ${errorCount} ${errorCount === 1 ? _(msg`кандидат требует`) : _(msg`кандидатов требуют`)} авторизации HH.ru`)
          );
          setSnackbarSeverity('warning');
          setSnackbarOpen(true);
        } else if (result.updated === result.total) {
          // Все успешно
          setSnackbarMessage(_(msg`✅ Успешно перемещено ${result.updated} ${result.updated === 1 ? _(msg`кандидат`) : _(msg`кандидатов`)}`));
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
        }

        // Обновляем только затронутые колонки
        // 1. Перезагружаем исходные колонки (откуда переносили)
        const sourceStatuses = new Set<string>();

        // Добавляем колонки из selectedAllInColumn
        selectedAllInColumn.forEach(status => sourceStatuses.add(status));

        // Добавляем колонки из индивидуально выбранных кандидатов
        selectedCandidatesSet.forEach(candidateId => {
          for (const [status, data] of Object.entries(columnData)) {
            if (data.candidates.find(c => c.id === candidateId)) {
              sourceStatuses.add(status);
              break;
            }
          }
        });

        // 2. Перезагружаем целевую колонку (куда перенесли)
        sourceStatuses.add(newStatus);

        // 3. Перезагружаем все затронутые колонки параллельно
        const reloadPromises = Array.from(sourceStatuses).map(status =>
          loadCandidatesForStatus(status, 1, false)
        );
        await Promise.all(reloadPromises);

        // 4. Обновляем статистику (счётчики в заголовках колонок)
        await fetchStats();

        // 5. Очищаем выделение и выключаем режим выделения
        updateSelectedCandidates(new Set());
        setSelectedAllInColumn(new Set());
        setSelectionMode(false);
      } else {
        // Обработка ошибок от API
        const error = await response.json();

        // Если это ошибка HH token для одиночной операции - показываем Dialog
        if (response.status === 403 && error.error === 'hh_token_required') {
          setHhTokenError({
            candidateName: error.candidateName,
            message: error.message || _(msg`Требуется авторизация HH.ru для загрузки резюме`),
          });
          setHhTokenDialogOpen(true);
        } else {
          // Остальные ошибки
          setSnackbarMessage(_(msg`Ошибка: ${error.error || error.message || _(msg`Не удалось переместить кандидатов`)}`));
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        }
      }
    } catch (error) {
      console.error('Error in bulk move:', error);
      setSnackbarMessage(_(msg`Произошла ошибка при перемещении кандидатов`));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  }, [vacancyId, selectedCandidatesSet, selectedAllInColumn, columnData, loadCandidatesForStatus, fetchStats]);

  const getSourceIcon = useCallback((source: string) => {
    switch (source) {
      case 'headhunter': return '🎯';
      case 'manual': return '✍️';
      case 'linkedin': return '💼';
      default: return '📥';
    }
  }, []);

  // Получить цвет полоски для карточки по статусу
  const getCardBorderColor = useCallback((status: string) => {
    switch (status) {
      case 'new': return '#42A5F5'; // Светло-синий
      case 'screening': return '#26A69A'; // Светло-бирюзовый (был голубой)
      case 'contacted': return '#FFA726'; // Светло-оранжевый
      case 'testing': return '#AB47BC'; // Светло-фиолетовый
      case 'finalist': return '#66BB6A'; // Светло-зелёный
      case 'offer': return '#FFCA28'; // Светло-жёлтый
      case 'hired': return '#4CAF50'; // Зелёный
      case 'deferred': return '#BDBDBD'; // Светло-серый
      case 'rejected': return '#EF5350'; // Светло-красный
      default: return '#BDBDBD';
    }
  }, []);

  // Удалён VirtualizedRow - больше не нужен для ленивой загрузки

  // Найти активного кандидата для DragOverlay (мемоизируем!)
  // ВАЖНО: useMemo должен быть ДО условного return!
  const activeCandidate: CandidateCard | undefined = useMemo(() => {
    if (!activeId) return undefined;

    // Ищем только в загруженных данных
    for (const data of Object.values(columnData)) {
      const found = data.candidates.find(c => c.id === activeId);
      if (found) return found;
    }
    return undefined;
  }, [activeId, columnData]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {/* Панель управления */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Button
          variant={selectionMode ? 'contained' : 'outlined'}
          startIcon={selectionMode ? <CheckBoxIcon /> : <SelectAllIcon />}
          onClick={() => {
            setSelectionMode(!selectionMode);
            if (selectionMode) {
              // При выключении режима - очищаем выделение
              updateSelectedCandidates(new Set());
            }
          }}
        >
          {selectionMode ? `Режим выделения (${selectedCandidatesSet.size})` : _(msg`Выбрать кандидатов`)}
        </Button>

        {selectionMode && selectedCandidatesSet.size > 0 && (
          <Typography variant="body2" color="text.secondary"><Trans>
            Выбрано: {selectedCandidatesSet.size}
          </Trans></Typography>
        )}
      </Box>

      {/* Нативный HTML5 DnD - без DndContext! */}
      <Box
        sx={{
          display: 'flex',
          gap: 0, // Убираем gap, кнопки сами создадут нужное расстояние
          overflowX: 'auto', // Горизонтальный скролл для колонок
          overflowY: 'hidden', // Убираем вертикальный скролл у родителя
          pb: 2,
          height: '100vh', // Полная высота экрана
        }}
      >
        {columns.map((column, index) => {
        const data = columnData[column.value] || { candidates: [], loading: false, hasMore: false, total: 0 };
        const totalCount = stats[column.value] || 0;

        // Оптимизация: вычисляем это один раз для всей колонки
        const isColumnFullySelected = selectedAllInColumn.has(column.value);

        return (
          <React.Fragment key={column.value}>
          <DroppableColumn
            id={column.value}
            onDrop={handleNativeDrop}
          >
            <Box
              sx={{
                minWidth: '320px',
                maxWidth: '320px',
                height: '100%', // Полная высота родителя
                display: 'flex',
                flexDirection: 'column',
                mr: 1, // Небольшой отступ справа
              }}
            >
              {/* Заголовок колонки с кнопкой добавления */}
              <Card
                sx={{
                  mb: 1,
                  p: 1.5,
                  bgcolor: getColumnBgColor(column),
                  borderLeft: `4px solid`,
                  borderLeftColor: getColumnBorderColor(column),
                  borderRadius: 0, // Без закруглённых углов
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center" gap={1}>
                    {/* Чекбокс для выбора ВСЕХ кандидатов в колонке */}
                    {selectionMode && (
                      <Tooltip
                        title={selectedAllInColumn.has(column.value)
                          ? `Снять выделение со ВСЕХ ${totalCount} кандидатов`
                          : `Выбрать ВСЕХ ${totalCount} кандидатов (включая не загруженные)`
                        }
                        arrow
                      >
                        <IconButton
                          size="small"
                          onClick={() => handleToggleSelectAllInColumn(column.value)}
                          sx={{
                            bgcolor: selectedAllInColumn.has(column.value) ? 'primary.main' : 'background.paper',
                            color: selectedAllInColumn.has(column.value) ? 'white' : 'text.primary',
                            '&:hover': {
                              bgcolor: selectedAllInColumn.has(column.value) ? 'primary.dark' : 'action.hover',
                            },
                          }}
                        >
                          {selectedAllInColumn.has(column.value) ? (
                            <CheckBoxIcon />
                          ) : (
                            <CheckBoxOutlineBlankIcon />
                          )}
                        </IconButton>
                      </Tooltip>
                    )}

                    <Box>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {column.icon} {column.label}
                        </Typography>

                        {/* Иконка автоматизации для AI Скрининг */}
                        {column.value === 'screening' && (
                          <Tooltip
                            title={
                              <Box sx={{ p: 0.5 }}>
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom><Trans>🤖 Автоматизация AI Скрининга</Trans></Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}><Trans>При переносе кандидата на эту стадию автоматически запускается:</Trans></Typography>
                                <Box component="ul" sx={{ m: 0, pl: 2 }}>
                                  <li>
                                    <Typography variant="body2"><Trans>📥 Загрузка резюме из HH.ru (для HH кандидатов)</Trans></Typography>
                                  </li>
                                  <li>
                                    <Typography variant="body2"><Trans>🧠 AI анализ резюме через DeepInfra</Trans></Typography>
                                  </li>
                                  <li>
                                    <Typography variant="body2"><Trans>📊 Оценка соответствия вакансии (0-100%)</Trans></Typography>
                                  </li>
                                  <li>
                                    <Typography variant="body2"><Trans>💬 Генерация комментария с рекомендацией</Trans></Typography>
                                  </li>
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}><Trans>⏱️ Время обработки: 5-30 секунд</Trans></Typography>
                              </Box>
                            }
                            arrow
                            placement="right"
                          >
                            <IconButton size="small" sx={{ ml: 0.5, color: 'warning.main' }}>
                              <AutoAwesomeIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        ({totalCount})
                      </Typography>
                    </Box>
                  </Box>

                  {/* Меню для кастомных стадий */}
                  {column.isCustom && column.customId && (
                    <StageMenu
                      customId={column.customId}
                      stageName={column.label}
                      onEdit={handleEditStage}
                      onDelete={handleDeleteStage}
                    />
                  )}
                </Box>
              </Card>

              {/* Список карточек с ленивой загрузкой - скролится внутри */}
              <Box
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  scrollbarWidth: 'thin',
                }}
                onScroll={(e) => handleScroll(column.value, e)}
              >
              {/* Кнопка добавления кандидата */}
              <Box
                sx={{
                  p: 1,
                  mb: 1,
                }}
              >
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    // TODO: Открыть модалку добавления кандидата
                  }}
                  sx={{
                    borderStyle: 'dashed',
                    borderColor: getColumnBorderColor(column),
                    color: getColumnBorderColor(column),
                    '&:hover': {
                      borderStyle: 'solid',
                      bgcolor: getColumnBgColor(column),
                    },
                  }}
                >
                  <Trans>Добавить кандидата</Trans>
                </Button>
              </Box>

              {data.candidates.length === 0 && !data.loading ? (
                <Box
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    color: 'text.secondary',
                    border: '2px dashed',
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2"><Trans>Нет кандидатов</Trans></Typography>
                </Box>
              ) : (
                <>
                  {data.candidates.map((candidate) => (
                    <DraggableCandidateCard
                      key={candidate.id}
                      candidate={candidate}
                      isDragging={activeId === candidate.id}
                      getSourceIcon={getSourceIcon}
                      selectionMode={selectionMode}
                      isSelected={
                        selectedCandidatesSet.has(candidate.id) ||
                        isColumnFullySelected
                      }
                      onToggleSelect={handleToggleSelect}
                      onDragStart={handleNativeDragStart}
                      onDragEnd={handleNativeDragEnd}
                    />
                  ))}

                  {/* Индикатор загрузки */}
                  {data.loading && (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                      <CircularProgress size={24} />
                      <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}><Trans>Загрузка...</Trans></Typography>
                    </Box>
                  )}

                  {/* Сообщение что все загружены */}
                  {!data.hasMore && data.candidates.length > 0 && !data.loading && (
                    <Typography variant="caption" color="text.secondary" sx={{ p: 2, textAlign: 'center', display: 'block' }}><Trans>Все кандидаты загружены</Trans></Typography>
                  )}
                </>
              )}
              </Box>
            </Box>
          </DroppableColumn>

          {/* Кнопка добавления кастомной стадии после этой колонки */}
          <AddStageButton
            position={
              // Позиция = текущий order + 0.5 (чтобы вставить МЕЖДУ колонками)
              // Например: между order=3 и order=4 будет 3.5
              column.order + 0.5
            }
            onAdd={handleAddStage}
          />
          </React.Fragment>
        );
      })}
      </Box>

    {/* Панель массовых действий */}
    {(selectedCandidatesSet.size > 0 || selectedAllInColumn.size > 0) && (
      <BulkActionsPanel
        selectedCount={selectedCandidatesSet.size}
        selectedAllInColumns={Array.from(selectedAllInColumn).map(columnId => ({
          columnId,
          count: stats[columnId] || 0
        }))}
        onCancel={() => {
          updateSelectedCandidates(new Set());
          setSelectedAllInColumn(new Set());
        }}
        onBulkMove={handleBulkMove}
        statusTriggers={STATUS_TRIGGERS}
        hhLimits={hhLimits}
        resumeQueueCount={resumeQueueCount}
      />
    )}

    {/* Модалка создания/редактирования кастомной стадии */}
    <CustomStageModal
      open={stageModalOpen}
      onClose={() => {
        setStageModalOpen(false);
        setEditingStage(null);
      }}
      onSave={handleCreateStage}
      position={stageModalPosition}
      initialName={editingStage?.name}
      initialColor={editingStage?.color}
    />

    {/* Диалог удаления стадии */}
    {deletingStage && (
      <DeleteStageDialog
        open={deleteDialogOpen}
        stageName={deletingStage.name}
        candidatesCount={deleteCandidatesCount}
        columns={columns}
        currentStageValue={deletingStage.value}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    )}

    {/* Диалог HH Token Required (одиночная операция) */}
    <Dialog
      open={hhTokenDialogOpen}
      onClose={() => setHhTokenDialogOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        🔑 Требуется авторизация HH.ru
      </DialogTitle>
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

    {/* Snackbar для сводки результатов (пакетная операция) */}
    <Snackbar
      open={snackbarOpen}
      autoHideDuration={6000}
      onClose={() => setSnackbarOpen(false)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        onClose={() => setSnackbarOpen(false)}
        severity={snackbarSeverity}
        sx={{ width: '100%' }}
        action={
          snackbarSeverity === 'warning' ? (
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                setSnackbarOpen(false);
                window.location.href = '/hr/settings/hh-integration';
              }}
            >
              Подключить HH.ru
            </Button>
          ) : undefined
        }
      >
        {snackbarMessage}
      </Alert>
    </Snackbar>
    </>
  );
}

