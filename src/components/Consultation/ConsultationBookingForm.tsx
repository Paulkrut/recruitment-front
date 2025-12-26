import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
} from '@mui/material';
import { apiFetch } from '@/utils/api';

interface TimeSlot {
  start: string;
  end: string;
  date: string;
  time: string;
  display: string;
  day_name: string;
}

interface ConsultationBookingFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ConsultationBookingForm: React.FC<ConsultationBookingFormProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Данные формы
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  
  // Слоты
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  const steps = ['Ваши данные', 'Выберите время'];

  // Загрузка слотов при открытии второго шага
  useEffect(() => {
    if (activeStep === 1 && open && slots.length === 0) {
      loadSlots();
    }
  }, [activeStep, open]);

  const loadSlots = async () => {
    setLoadingSlots(true);
    setError(null);
    
    try {
      const response = await apiFetch('/api/manager-consultation/slots');
      const data = await response.json();
      
      if (data.success) {
        setSlots(data.slots || []);
      } else {
        setError('Не удалось загрузить доступные слоты');
      }
    } catch (err) {
      console.error('Error loading slots:', err);
      setError('Ошибка при загрузке слотов');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      // Валидация первого шага
      if (!clientName.trim()) {
        setError('Введите ваше имя');
        return;
      }
      if (!clientPhone.trim()) {
        setError('Введите ваш телефон');
        return;
      }
      
      setError(null);
      setActiveStep(1);
    } else if (activeStep === 1) {
      // Бронирование
      if (!selectedSlot) {
        setError('Выберите время встречи');
        return;
      }
      
      handleBooking();
    }
  };

  const handleBack = () => {
    setError(null);
    setActiveStep((prev) => prev - 1);
  };

  const handleBooking = async () => {
    if (!selectedSlot) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiFetch('/api/manager-consultation/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: clientName,
          client_phone: clientPhone,
          meeting_time: selectedSlot.start,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess?.();
          handleClose();
        }, 2000);
      } else {
        setError(data.error === 'slot_not_available' 
          ? 'Этот слот уже занят. Выберите другое время.' 
          : 'Ошибка при бронировании');
      }
    } catch (err) {
      console.error('Booking error:', err);
      setError('Произошла ошибка. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setActiveStep(0);
      setClientName('');
      setClientPhone('');
      setSelectedSlot(null);
      setError(null);
      setSuccess(false);
      setSlots([]);
      onClose();
    }
  };

  // Группировка слотов по дням
  const groupedSlots = slots.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Запись на консультацию
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Получите 5 бесплатных интервью после консультации!
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ pt: 2, pb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            ✅ Встреча успешно забронирована! Мы свяжемся с вами по указанному телефону.
          </Alert>
        )}

        {/* ШАГ 1: Данные клиента */}
        {activeStep === 0 && (
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Ваше имя"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              margin="normal"
              required
              autoFocus
            />
            <TextField
              fullWidth
              label="Телефон"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              margin="normal"
              required
              placeholder="+7 (999) 123-45-67"
            />
          </Box>
        )}

        {/* ШАГ 2: Выбор слота */}
        {activeStep === 1 && (
          <Box sx={{ pt: 2 }}>
            {loadingSlots ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : slots.length === 0 ? (
              <Alert severity="info">
                К сожалению, нет доступных слотов. Свяжитесь с нами напрямую.
              </Alert>
            ) : (
              <Box>
                {Object.entries(groupedSlots).map(([date, dateSlots]) => (
                  <Box key={date} sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                      {dateSlots[0].day_name}, {new Date(date).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                      })}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {dateSlots.map((slot, idx) => (
                        <Chip
                          key={idx}
                          label={slot.time}
                          onClick={() => setSelectedSlot(slot)}
                          color={selectedSlot?.start === slot.start ? 'primary' : 'default'}
                          variant={selectedSlot?.start === slot.start ? 'filled' : 'outlined'}
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': { backgroundColor: 'action.hover' },
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Отмена
        </Button>
        {activeStep > 0 && (
          <Button onClick={handleBack} disabled={loading}>
            Назад
          </Button>
        )}
        <Button
          onClick={handleNext}
          variant="contained"
          disabled={loading || success || (activeStep === 1 && !selectedSlot)}
        >
          {loading ? (
            <CircularProgress size={24} />
          ) : activeStep === steps.length - 1 ? (
            'Забронировать'
          ) : (
            'Далее'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConsultationBookingForm;

