"use client";
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/macro';
import { CANDIDATE_STATUS_LABELS, CANDIDATE_STATUS_ORDER } from './constants';
import { countHhCandidates, extractHhCandidateIds } from './candidateUtils';

interface Candidate {
  id: number;
  hhCandidateId?: number | string | null;
  [key: string]: any;
}

interface BulkActionsToolbarProps {
  /** Количество выбранных кандидатов */
  selectedCount: number;
  
  /** Массив выбранных кандидатов (для подсчета HH) */
  selectedCandidates: Candidate[];
  
  /** Callback при отмене выбора */
  onCancel: () => void;
  
  /** Callback при изменении статуса */
  onStatusChange: (newStatus: string) => Promise<void>;
  
  /** Callback при отправке приглашений */
  onSendInvitations?: (hhCandidateIds: (number | string)[]) => Promise<void>;
  
  /** Источник вакансии (для показа кнопки приглашений) */
  vacancySource?: string;
  
  /** Флаг отправки приглашений в процессе */
  sendingInProgress?: boolean;
  
  /** Стиль отображения: inline (над таблицей) или floating (внизу экрана) */
  variant?: 'inline' | 'floating';
  
  /** Дополнительная информация для floating панели */
  selectedAllInColumns?: { columnId: string; count: number }[];
  
  /** Информация о HH кандидатах (для "Выбрать все") */
  hhCandidatesInfo?: { isAll: boolean; count?: number };
}

export default function BulkActionsToolbar({
  selectedCount,
  selectedCandidates,
  onCancel,
  onStatusChange,
  onSendInvitations,
  vacancySource,
  sendingInProgress = false,
  variant = 'inline',
  selectedAllInColumns = [],
  hhCandidatesInfo,
}: BulkActionsToolbarProps) {
  const { _ } = useLingui();
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Подсчитываем HH кандидатов
  const hhCandidatesCount = hhCandidatesInfo?.isAll 
    ? null  // Если выбраны ВСЕ - не показываем число (неизвестно точное количество HH)
    : (hhCandidatesInfo?.count ?? countHhCandidates(selectedCandidates));
  
  // Показываем кнопку отправки приглашений только для HH вакансий
  const showInvitationButton = vacancySource === 'headhunter' && onSendInvitations;

  // Общее количество (для floating панели с выбором всех в колонке)
  const totalSelectedCount = selectedCount + selectedAllInColumns.reduce((sum, col) => sum + col.count, 0);

  const handleStatusChange = async () => {
    if (!selectedStatus) return;
    
    setLoading(true);
    try {
      await onStatusChange(selectedStatus);
      setSelectedStatus('');
    } catch (error) {
      console.error('Error changing status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvitations = async () => {
    if (!onSendInvitations) return;
    
    const hhCandidateIds = extractHhCandidateIds(selectedCandidates);
    if (hhCandidateIds.length === 0) return;
    
    await onSendInvitations(hhCandidateIds);
  };

  // Стили для inline варианта (над таблицей)
  const inlineStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    mb: 2,
    p: 2,
    bgcolor: 'primary.light',
    borderRadius: 1,
    flexWrap: 'wrap',
  };

  // Стили для floating варианта (внизу экрана)
  const floatingWrapperStyles = {
    position: 'fixed',
    bottom: 24,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1300,
    width: 'auto',
    maxWidth: '90%',
  };

  const floatingPaperStyles = {
    p: 2,
    display: 'flex',
    gap: 2,
    alignItems: 'center',
    borderRadius: 2,
    border: '2px solid',
    borderColor: 'primary.main',
  };

  // Контент панели (одинаковый для обоих вариантов)
  const content = (
    <>
      {/* Информация о выборе */}
      <Box>
        <Typography variant={variant === 'floating' ? 'subtitle1' : 'body1'} fontWeight={600}>
          <Trans>Выбрано: {variant === 'floating' ? totalSelectedCount : selectedCount}</Trans>
        </Typography>
        
        {/* Дополнительная инфо для floating панели */}
        {variant === 'floating' && selectedAllInColumns.length > 0 && (
          <Typography variant="caption" color="text.secondary">
            {selectedAllInColumns.map(col =>
              `${_(CANDIDATE_STATUS_LABELS[col.columnId as keyof typeof CANDIDATE_STATUS_LABELS])}: ${col.count}`
            ).join(', ')}
          </Typography>
        )}
      </Box>

      {/* Селект статуса */}
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <Select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          displayEmpty
        >
          <MenuItem value="" disabled><Trans>Переместить в...</Trans></MenuItem>
          {CANDIDATE_STATUS_ORDER.map((status) => (
            <MenuItem key={status} value={status}>
              {_(CANDIDATE_STATUS_LABELS[status])}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Кнопка применить */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleStatusChange}
        disabled={!selectedStatus || loading}
        size={variant === 'floating' ? 'small' : 'medium'}
      >
        <Trans>{variant === 'floating' ? 'Переместить' : 'Применить'}</Trans>
      </Button>

      {/* Кнопка отправки приглашений */}
      {showInvitationButton && (
        <Button
          variant="contained"
          color="success"
          onClick={handleSendInvitations}
          startIcon={<MailOutlineIcon />}
          disabled={sendingInProgress || hhCandidatesCount === 0}
          size={variant === 'floating' ? 'small' : 'medium'}
        >
          {hhCandidatesCount === null ? (
            <Trans>📤 Отправить приглашения</Trans>
          ) : (
            <Trans>📤 Отправить приглашения ({hhCandidatesCount})</Trans>
          )}
        </Button>
      )}

      {/* Кнопка отмены */}
      <Button
        variant="outlined"
        onClick={onCancel}
        size={variant === 'floating' ? 'small' : 'medium'}
      >
        <Trans>{variant === 'floating' ? 'Отменить выделение' : 'Отменить'}</Trans>
      </Button>
    </>
  );

  // Рендер в зависимости от варианта
  if (variant === 'floating') {
    return (
      <Box sx={floatingWrapperStyles}>
        <Paper elevation={8} sx={floatingPaperStyles}>
          {content}
        </Paper>
      </Box>
    );
  }

  // Inline вариант
  return <Box sx={inlineStyles}>{content}</Box>;
}

