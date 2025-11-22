"use client";
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  CircularProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Trans } from '@lingui/react';
import { useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';



interface BulkActionsPanelProps {
  selectedCount: number;
  selectedAllInColumns: { columnId: string; count: number }[]; // Колонки где выбраны ВСЕ кандидаты
  onCancel: () => void;
  onBulkMove: (newStatus: string) => Promise<void>;
  statusTriggers: Record<string, string[]>;
  hhLimits?: {
    left: { resumeView: number };
    limits: { resumeView: number };
    spend: { resumeView: number };
  } | null;
  resumeQueueCount?: number;
}

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

export default function BulkActionsPanel({
  selectedCount,
  selectedAllInColumns,
  onCancel,
  onBulkMove,
  statusTriggers,
  hhLimits,
  resumeQueueCount,
}: BulkActionsPanelProps) {
  const { _ } = useLingui();

  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Подсчитываем общее количество кандидатов (индивидуально выбранные + все из колонок)
  const totalSelectedCount = selectedCount + selectedAllInColumns.reduce((sum, col) => sum + col.count, 0);

  // Подсчёт дней для AI скрининга если выбран статус screening
  const isScreening = selectedStatus === 'screening';
  const daysNeeded = isScreening && hhLimits?.left?.resumeView
    ? Math.ceil(totalSelectedCount / hhLimits.left.resumeView)
    : 0;

  const handleMoveClick = () => {
    if (!selectedStatus) return;
    setConfirmDialogOpen(true);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onBulkMove(selectedStatus);
      setConfirmDialogOpen(false);
      setSelectedStatus('');
    } catch (error) {
      console.error('Error moving candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggers = selectedStatus ? statusTriggers[selectedStatus] || [] : [];

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
        </Paper>
      </Box>

      {/* Диалог подтверждения */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => !loading && setConfirmDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Trans>Переместить</Trans> {' '} {totalSelectedCount} {totalSelectedCount === 1 ? _(msg`кандидата`) : _(msg`кандидатов`)}?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            <Trans>Переместить в стадию</Trans>: <strong>{STATUS_LABELS[selectedStatus]}</strong>
          </Typography>

          {selectedAllInColumns.length > 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2" fontWeight="bold"><Trans>Выбраны ВСЕ кандидаты из колонок:</Trans></Typography>
              {selectedAllInColumns.map(col => (
                <Typography key={col.columnId} variant="body2">
                  • {STATUS_LABELS[col.columnId]}: {col.count} <Trans>кандидатов</Trans>
                </Typography>
              ))}
            </Alert>
          )}

          {triggers.length > 0 && (
            <>
              <Alert severity="info" sx={{ mt: 2, mb: 2 }}><Trans>Будет автоматически выполнено:</Trans></Alert>
              <List dense>
                {triggers.map((trigger, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={trigger} />
                  </ListItem>
                ))}
              </List>
            </>
          )}

          {/* Информация о лимитах HH при AI скрининге */}
          {isScreening && hhLimits && (
            <Alert
              severity={daysNeeded > 3 ? "warning" : daysNeeded > 1 ? "info" : "success"}
              sx={{ mt: 2 }}
            >
              <Typography variant="body2" fontWeight="bold" gutterBottom><Trans>📊 Лимиты HeadHunter.ru (менеджер):</Trans></Typography>
              <Typography variant="body2">
                • <Trans>Осталось сегодня</Trans>: <strong>{hhLimits.left.resumeView}</strong><Trans> из {hhLimits.limits.resumeView}
              </Trans></Typography>
              <Typography variant="body2">
                • <Trans>Выбрано кандидатов</Trans>: <strong>{totalSelectedCount}</strong>
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {daysNeeded === 0 ? (
                  <>⚠️ <strong><Trans>Недостаточно лимита</Trans>!</strong> <Trans>Кандидаты будут обрабатываться по мере обновления лимита</Trans>.</>
                ) : daysNeeded === 1 ? (
                  <>✅ <Trans>AI скрининг будет выполнен</Trans> <strong><Trans>сегодня</Trans></strong></>
                ) : (
                  <>⏳ <Trans>AI скрининг займёт примерно <strong>{daysNeeded}</strong> дней</Trans></>
                )}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}><Trans>ℹ️ Лимит общий для всех вакансий, обнуляется в 00:00. Скрининг требует загрузки резюме из HH.</Trans></Typography>

              {resumeQueueCount !== undefined && resumeQueueCount > 0 && (
                <Typography variant="caption" color="warning.main" display="block" sx={{ mt: 1 }}>
                  ⚠️ <Trans>Уже в очереди на загрузку резюме</Trans>: <strong>{resumeQueueCount}</strong> {resumeQueueCount === 1 ? _(msg`кандидат`) : resumeQueueCount < 5 ? _(msg`кандидата`) : _(msg`кандидатов`)} <Trans>по всем вакансиям</Trans>
                </Typography>
              )}
            </Alert>
          )}

          {totalSelectedCount > 50 && !isScreening && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Trans>⚠️ Обработка {totalSelectedCount} кандидатов может занять несколько минут.
            </Trans></Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} disabled={loading}>
            <Trans>Отмена</Trans>
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading && <CircularProgress size={16} />}
          >
            {loading ? _(msg`Перемещение...`) : _(msg`Подтвердить`)}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

