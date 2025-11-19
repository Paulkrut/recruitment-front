"use client";
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Box,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import { useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';


interface Column {
  value: string;
  label: string;
  icon: string;
  isCustom?: boolean;
  customId?: number;
}

interface DeleteStageDialogProps {
  open: boolean;
  stageName: string;
  candidatesCount: number;
  columns: Column[];
  currentStageValue: string;
  onClose: () => void;
  onConfirm: (moveToStatus: string) => void;
}

export default function DeleteStageDialog({
  open,
  stageName,
  candidatesCount,
  columns,
  currentStageValue,
  onClose,
  onConfirm,
}: DeleteStageDialogProps) {
  const { _ } = useLingui();

  const [moveToStatus, setMoveToStatus] = useState('new');

  const handleConfirm = () => {
    onConfirm(moveToStatus);
    setMoveToStatus('new'); // Reset
  };

  // Фильтруем колонки - убираем текущую удаляемую стадию
  const availableColumns = columns.filter(col => col.value !== currentStageValue);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <WarningIcon color="warning" />
          Удалить стадию "{stageName}"?
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {candidatesCount > 0 ? (
          <>
            <Alert severity="warning" sx={{ mb: 3 }}>
              В этой стадии находится <strong>{candidatesCount}</strong> {
                candidatesCount === 1 ? 'кандидат' :
                candidatesCount < 5 ? 'кандидата' :
                'кандидатов'
              } (во всех вакансиях компании)
            </Alert>

            <Typography variant="body2" gutterBottom sx={{ mb: 2 }}>
              Выберите стадию, в которую будут перемещены все кандидаты:
            </Typography>

            <FormControl fullWidth>
              <InputLabel>Переместить кандидатов в</InputLabel>
              <Select
                value={moveToStatus}
                label={_(msg`Переместить кандидатов в`)}
                onChange={(e) => setMoveToStatus(e.target.value)}
              >
                {availableColumns.map((col) => (
                  <MenuItem key={col.value} value={col.value}>
                    {col.icon} {col.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        ) : (
          <Typography variant="body2">
            Эта стадия не содержит кандидатов и будет удалена безвозвратно.
          </Typography>
        )}

        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Это действие нельзя отменить.
        </Typography>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          Отмена
        </Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained" 
          color="error"
        >
          {candidatesCount > 0 
            ? `Удалить и переместить ${candidatesCount} ${candidatesCount === 1 ? 'кандидата' : candidatesCount < 5 ? 'кандидатов' : 'кандидатов'}`
            : 'Удалить стадию'
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
}



