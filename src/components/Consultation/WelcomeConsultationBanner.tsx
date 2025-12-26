import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, Alert, Chip } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PhoneIcon from '@mui/icons-material/Phone';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ConsultationBookingForm from './ConsultationBookingForm';
import { apiFetch } from '@/utils/api';

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

interface WelcomeConsultationBannerProps {
  managerPhone?: string;
}

interface BookingInfo {
  id: number;
  client_name: string;
  client_phone: string;
  meeting_time: string;
  status: string;
  bonus_activated: boolean;
}

const WelcomeConsultationBanner: React.FC<WelcomeConsultationBannerProps> = ({
  managerPhone = '+79629407473',
}) => {
  const [bookingFormOpen, setBookingFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [existingBooking, setExistingBooking] = useState<BookingInfo | null>(null);

  useEffect(() => {
    checkBookingStatus();
  }, []);

  const checkBookingStatus = async () => {
    try {
      const response = await apiFetch(`${API_BASE}/api/manager-consultation/status`);
      const data = await response.json();

      if (data.success && data.status.has_booking && data.status.booking) {
        setExistingBooking(data.status.booking);
      }
    } catch (error) {
      console.error('Failed to check booking status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSuccess = () => {
    setBookingFormOpen(false);
    // Перезагружаем статус для показа инфы о встрече
    checkBookingStatus();
  };

  if (loading) {
    return null;
  }

  // Если уже есть бронирование - показываем информацию о встрече
  if (existingBooking) {
    const meetingDate = new Date(existingBooking.meeting_time);
    const formattedDate = meetingDate.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const formattedTime = meetingDate.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const statusColors = {
      pending: 'warning',
      scheduled: 'info',
      completed: 'success',
      canceled: 'error',
    } as const;

    const statusLabels = {
      pending: 'Ожидает подтверждения',
      scheduled: 'Запланирована',
      completed: 'Завершена',
      canceled: 'Отменена',
    };

    return (
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          p: 3,
          background: 'linear-gradient(135deg, #48c774 0%, #3273dc 100%)',
          color: 'white',
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CheckCircleIcon sx={{ fontSize: 32, mr: 1 }} />
          <Typography variant="h5" fontWeight="bold">
            Консультация запланирована!
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EventIcon />
            <Box>
              <Typography variant="caption" sx={{ opacity: 0.9, display: 'block' }}>
                Дата
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {formattedDate}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccessTimeIcon />
            <Box>
              <Typography variant="caption" sx={{ opacity: 0.9, display: 'block' }}>
                Время
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {formattedTime}
              </Typography>
            </Box>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ opacity: 0.9, display: 'block' }}>
              Статус
            </Typography>
            <Chip
              label={statusLabels[existingBooking.status as keyof typeof statusLabels] || existingBooking.status}
              color={statusColors[existingBooking.status as keyof typeof statusColors] || 'default'}
              size="small"
              sx={{ mt: 0.5 }}
            />
          </Box>
        </Box>

        <Typography variant="body2" sx={{ mb: 2, opacity: 0.95 }}>
          {existingBooking.bonus_activated
            ? '🎁 Бонус 5 интервью уже начислен!'
            : '🎁 После консультации вы получите 5 бесплатных интервью!'}
        </Typography>

        {existingBooking.status === 'scheduled' && (
          <Alert
            severity="info"
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              '& .MuiAlert-icon': { color: 'white' },
            }}
          >
            Менеджер свяжется с вами по телефону <strong>{existingBooking.client_phone}</strong>
          </Alert>
        )}
      </Paper>
    );
  }

  // Если бронирования нет - показываем предложение записаться
  return (
    <>
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          p: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
          🎉 Добро пожаловать в SofiHR!
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, opacity: 0.95 }}>
          Запишитесь на бесплатную консультацию с персональным менеджером и получите <strong>ещё 5 бесплатных интервью</strong> в подарок!
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
          Мы поможем настроить платформу, расскажем о лучших практиках подбора и ответим на все вопросы.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<CalendarMonthIcon />}
            onClick={() => setBookingFormOpen(true)}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
              },
            }}
          >
            Записаться на консультацию
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<PhoneIcon />}
            onClick={() => window.open(`tel:${managerPhone}`)}
            sx={{
              borderColor: 'rgba(255, 255, 255, 0.5)',
              color: 'white',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Позвонить сейчас
          </Button>
        </Box>
      </Paper>

      <ConsultationBookingForm
        open={bookingFormOpen}
        onClose={() => setBookingFormOpen(false)}
        onSuccess={handleBookingSuccess}
      />
    </>
  );
};

export default WelcomeConsultationBanner;
