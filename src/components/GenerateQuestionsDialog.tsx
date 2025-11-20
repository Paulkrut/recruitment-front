import React, { useCallback, useMemo } from 'react';
import { Trans } from '@lingui/react';
import { useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';


import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Slider,
  CircularProgress,
  Alert
} from '@mui/material';

interface GenerateQuestionsDialogProps {
  open: boolean;
  onClose: () => void;
  genCount: number;
  onGenCountChange: (value: number) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  generationProgress?: {
    status: string;
    elapsed_time?: number;
    message?: string;
  } | null;
  error?: string | null;
}

const GenerateQuestionsDialog = React.memo(({ 
  open, 
  onClose, 
  genCount, 
  onGenCountChange, 
  onGenerate, 
  isGenerating,
  generationProgress,
  error
}: GenerateQuestionsDialogProps) => {
  
  // Мемоизируем кнопки быстрого выбора
  const quickSelectButtons = useMemo(() => {
    const counts = [1, 3, 5, 7, 10, 15, 20];
    return counts.map((count) => (
      <Button
        key={count}
        variant={genCount === count ? "contained" : "outlined"}
        onClick={() => onGenCountChange(count)}
        sx={{
          backgroundColor: genCount === count ? "#e3f2fd" : "#fff",
          color: "#1976d2",
          borderColor: "#1976d2",
          fontWeight: 600,
          minWidth: 'auto',
          px: 2,
          py: 1,
          fontSize: '0.9rem',
          '&:hover': { backgroundColor: "#bbdefb" }
        }}
      >
        {count}
      </Button>
    ));
  }, [genCount, onGenCountChange]);

  // Мемоизируем текст количества вопросов
  const questionText = useMemo(() => {
    return genCount === 1 ? _(msg`вопрос`) : genCount < 5 ? _(msg`вопроса`) : _(msg`вопросов`);
  }, [genCount]);

  // Мемоизируем стили слайдера
  const sliderStyles = useMemo(() => ({
    '& .MuiSlider-track': { backgroundColor: '#1976d2' },
    '& .MuiSlider-thumb': { backgroundColor: '#1976d2' },
    '& .MuiSlider-rail': { backgroundColor: '#eee' }
  }), []);

  // Мемоизируем обработчик слайдера
  const handleSliderChange = useCallback((_, value: number | number[]) => {
    onGenCountChange(value as number);
  }, [onGenCountChange]);

  // Мемоизируем обработчик кнопки генерации
  const handleGenerate = useCallback(() => {
    onGenerate();
  }, [onGenerate]);

  // Мемоизируем обработчик закрытия
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!open) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Сгенерировать вопросы</DialogTitle>
      <DialogContent sx={{ pt: '16px !important' }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="textSecondary" gutterBottom><Trans>Количество вопросов для генерации:</Trans></Typography>
          
          {/* Preset buttons */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', opacity: 0.9, mb: 2 }}><Trans>Быстрый выбор:</Trans></Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {quickSelectButtons}
            </Box>
          </Box>
          
          {/* Slider */}
          <Box sx={{ px: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', opacity: 0.8 }}>
                1
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', opacity: 0.8 }}>
                20
              </Typography>
            </Box>
            <Slider
              value={genCount}
              onChange={handleSliderChange}
              min={1}
              max={20}
              step={1}
              color="primary"
              sx={sliderStyles}
            />
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: 'text.primary', 
                  fontWeight: 700,
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                {genCount}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', opacity: 0.8, mt: 0.5 }}>
                {questionText}
              </Typography>
            </Box>
          </Box>
          
          <Typography variant="body2" sx={{ color: 'text.secondary', opacity: 0.9, mt: 2, textAlign: 'center' }}><Trans>Количество вопросов, которые будут сгенерированы ИИ</Trans></Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {generationProgress && (
          <Box sx={{ mt: 2, p: 2, bgcolor: '#f0f8ff', borderRadius: 2, border: '1px solid #e3f2fd' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {generationProgress.message}
              </Typography>
            </Box>
            {generationProgress.elapsed_time && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Прошло времени: {generationProgress.elapsed_time} секунд
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}><Trans>Отмена</Trans></Button>
        <Button
          variant="contained"
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? _(msg`Генерация...`) : _(msg`Сгенерировать`)}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

GenerateQuestionsDialog.displayName = 'GenerateQuestionsDialog';

export default GenerateQuestionsDialog; 