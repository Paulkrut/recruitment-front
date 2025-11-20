"use client";
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
} from '@mui/material';
import { HexColorPicker } from 'react-colorful';
import { useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';


interface CustomStageModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, color: string) => void;
  initialName?: string;
  initialColor?: string;
  position: number;
}

export default function CustomStageModal({
  open,
  onClose,
  onSave,
  initialName = '',
  initialColor = '#2196F3',
  position,
}: CustomStageModalProps) {
  const { _ } = useLingui();

  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);

  useEffect(() => {
    if (open) {
      setName(initialName);
      setColor(initialColor);
    }
  }, [open, initialName, initialColor]);

  const handleSave = () => {
    if (!name.trim()) {
      alert(_(msg`Введите название стадии`));
      return;
    }

    onSave(name.trim(), color);
    setName('');
    setColor('#2196F3');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initialName ? _(msg`Редактировать стадию`) : _(msg`Новая кастомная стадия`)}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <TextField
            autoFocus
            label={_(msg`Название стадии`)}
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={_(msg`Например: Техническое собеседование`)}
            sx={{ mb: 3 }}
          />

          <Typography variant="subtitle2" gutterBottom><Trans>Цвет заливки:</Trans></Typography>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1 }}>
              <HexColorPicker color={color} onChange={setColor} />
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <TextField
                label={_(msg`HEX код`)}
                fullWidth
                value={color}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^#[0-9A-F]{0,6}$/i.test(val) || val === '#') {
                    setColor(val);
                  }
                }}
                sx={{ mb: 2 }}
              />
              
              <Box
                sx={{
                  width: '100%',
                  height: 100,
                  bgcolor: color,
                  borderRadius: 1,
                  border: '2px solid',
                  borderColor: 'divider',
                }}
              />
              
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}><Trans>Предпросмотр цвета</Trans></Typography>
            </Box>
          </Box>

          {!initialName && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              Стадия будет добавлена на позицию {position}
            </Typography>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}><Trans>Отмена</Trans></Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          {initialName ? _(msg`Сохранить`) : _(msg`Создать`)}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

