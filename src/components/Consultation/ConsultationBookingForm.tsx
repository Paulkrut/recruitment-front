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
  Alert,
  CircularProgress,
  Chip,
  Grid,
  Divider,
} from '@mui/material';
import { apiFetch } from '@/utils/api';

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

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

  // Загрузка слотов при открытии
  useEffect(() => {
    if (open && slots.length === 0) {
      loadSlots();
    }
  }, [open]);

  const loadSlots = async () => {
    setLoadingSlots(true);
    setError(null);
    
    try {
      const response = await apiFetch(`${API_BASE}/api/manager-consultation/slots`);
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

  const handleBooking = async () => {
    // Валидация
    if (!clientName.trim()) {
      setError('Введите ваше имя');
      return;
    }
    if (!clientPhone.trim()) {
      setError('Введите ваш телефон');
      return;
    }
    if (!selectedSlot) {
      setError('Выберите время встречи');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiFetch(`${API_BASE}/api/manager-consultation/book`, {
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
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Запись на консультацию
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Получите 5 бесплатных интервью после консультации!
        </Typography>
      </DialogTitle>

      <DialogContent>
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

        <Grid container spacing={3}>
          {/* Левая колонка - форма */}
          <Grid item xs={12} md={5}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Ваши контактные данные
            </Typography>
            
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

            {selectedSlot && (
              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="body2" fontWeight="bold">
                  Выбрано время:
                </Typography>
                <Typography variant="body1">
                  {selectedSlot.day_name}, {new Date(selectedSlot.date).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                  })} в {selectedSlot.time}
                </Typography>
              </Alert>
            )}
          </Grid>

          {/* Разделитель */}
          <Grid item xs={12} md={0.5} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
            <Divider orientation="vertical" flexItem />
          </Grid>

          {/* Правая колонка - календарь */}
          <Grid item xs={12} md={6.5}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Выберите удобное время
            </Typography>

            {loadingSlots ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : slots.length === 0 ? (
              <Alert severity="info">
                К сожалению, нет доступных слотов. Свяжитесь с нами напрямую.
              </Alert>
            ) : (
              <Box sx={{ maxHeight: 400, overflowY: 'auto', pr: 1 }}>
                {Object.entries(groupedSlots).map(([date, dateSlots]) => (
                  <Box key={date} sx={{ mb: 2.5 }}>
                    <Typography variant="subtitle2" fontWeight="bold" color="primary" sx={{ mb: 1 }}>
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
                            minWidth: 70,
                            '&:hover': { 
                              backgroundColor: selectedSlot?.start === slot.start 
                                ? 'primary.dark' 
                                : 'action.hover' 
                            },
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Отмена
        </Button>
        <Button
          onClick={handleBooking}
          variant="contained"
          disabled={loading || success || !selectedSlot || !clientName || !clientPhone}
        >
          {loading ? (
            <CircularProgress size={24} />
          ) : (
            'Забронировать'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConsultationBookingForm;
