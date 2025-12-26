"use client";
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';

import { useLingui } from '@lingui/react';
import { msg, Trans } from '@lingui/macro';



interface BulkActionsPanelProps {
  selectedCount: number;
  selectedAllInColumns: { columnId: string; count: number }[]; // Колонки где выбраны ВСЕ кандидаты
  onCancel: () => void;
  onBulkMove: (newStatus: string) => Promise<void>;
  onBulkSendInvitations?: (candidateIds: number[]) => Promise<void>; // Новый проп для массовой отправки
  statusTriggers: Record<string, string[]>;
  vacancySource?: string; // Источник вакансии (headhunter, manual, etc.)
  selectedCandidates?: any[]; // Список выбранных кандидатов для проверки
  hhLimits?: {
    left: { resumeView: number };
    limits: { resumeView: number };
    spend: { resumeView: number };
  } | null;
  resumeQueueCount?: number;
}


export default function BulkActionsPanel({
  selectedCount,
  selectedAllInColumns,
  onCancel,
  onBulkMove,
  onBulkSendInvitations,
  statusTriggers,
  vacancySource,
  selectedCandidates = [],
  hhLimits,
  resumeQueueCount,
}: BulkActionsPanelProps) {
  const { _ } = useLingui();

  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Подсчитываем общее количество кандидатов (индивидуально выбранные + все из колонок)
  const totalSelectedCount = selectedCount + selectedAllInColumns.reduce((sum, col) => sum + col.count, 0);

  // Подсчитываем количество HH кандидатов
  const hhCandidatesCount = selectedCandidates.filter(c => c.hhCandidateId).length;
  const alreadyInvitedCount = selectedCandidates.filter(c => c.invitationSentAt).length;
  
  // Показываем кнопку отправки приглашений только для HH вакансий
  const showInvitationButton = vacancySource === 'headhunter' && onBulkSendInvitations && hhCandidatesCount > 0;

  // Подсчёт дней для AI скрининга если выбран статус screening
  const isScreening = selectedStatus === 'screening';
  const daysNeeded = isScreening && hhLimits?.left?.resumeView
    ? Math.ceil(totalSelectedCount / hhLimits.left.resumeView)
    : 0;

  const handleMoveClick = async () => {
    if (!selectedStatus) return;
    
    setLoading(true);
    try {
      await onBulkMove(selectedStatus);
      setSelectedStatus('');
    } catch (error) {
      console.error('Error moving candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggers = selectedStatus ? statusTriggers[selectedStatus] || [] : [];
// Лейблы для статусов
  const STATUS_LABELS: Record<string, string> = {
    'new': _(msg`📥 Новые`),
    'screening': _(msg`🤖 AI Скрининг`),
    'contacted': _(msg`📞 На связи`),
    'testing': _(msg`📝 Тестирование`),
    'finalist': _(msg`⭐ Финалист`),
    'offer': _(msg`💼 Оффер`),
    'hired': _(msg`✅ Нанят`),
    'deferred': _(msg`⏸️ Отложен`),
    'rejected': _(msg`❌ Отказ`),
  };

  return (
    <>
      {/* Плавающая панель */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1300,
          width: 'auto',
          maxWidth: '90%',
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 2,
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            borderRadius: 2,
            border: '2px solid',
            borderColor: 'primary.main',
          }}
        >
          <Box>
            <Typography variant="subtitle1" fontWeight="bold"><Trans>
              Выбрано: {totalSelectedCount}
            </Trans></Typography>
            {selectedAllInColumns.length > 0 && (
              <Typography variant="caption" color="text.secondary">
                {selectedAllInColumns.map(col =>
                  `${STATUS_LABELS[col.columnId]}: ${col.count}`
                ).join(', ')}
              </Typography>
            )}
          </Box>

          <Button variant="outlined" onClick={onCancel} size="small"><Trans>Отменить выделение</Trans></Button>

          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            displayEmpty
            size="small"
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="" disabled><Trans>Переместить в...</Trans></MenuItem>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </Select>

          <Button
            variant="contained"
            color="primary"
            onClick={handleMoveClick}
            disabled={!selectedStatus}
            size="small"
          ><Trans>Переместить</Trans></Button>

          {showInvitationButton && (
            <Button
              variant="contained"
              color="success"
              onClick={() => {
                // Извлекаем ID HH кандидатов из выбранных
                const hhCandidateIds = selectedCandidates
                  .filter(c => c.hhCandidateId)
                  .map(c => c.hhCandidateId);
                onBulkSendInvitations!(hhCandidateIds);
              }}
              disabled={loading}
              size="small"
              startIcon={<MailOutlineIcon />}
            >
              <Trans>📤 Отправить приглашения ({hhCandidatesCount})</Trans>
            </Button>
          )}
        </Paper>
      </Box>
    </>
  );
}

