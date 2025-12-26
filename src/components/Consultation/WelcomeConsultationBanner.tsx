import React, { useState } from 'react';
import { Box, Paper, Typography, Button, Alert } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PhoneIcon from '@mui/icons-material/Phone';
import ConsultationBookingForm from './ConsultationBookingForm';

interface WelcomeConsultationBannerProps {
  managerPhone?: string;
}

const WelcomeConsultationBanner: React.FC<WelcomeConsultationBannerProps> = ({
  managerPhone = '+7 962 940-74-73',
}) => {
  const [bookingFormOpen, setBookingFormOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const handleBookingSuccess = () => {
    setBookingSuccess(true);
    setBookingFormOpen(false);
  };

  if (bookingSuccess) {
    return (
      <Alert severity="success" sx={{ mb: 3 }}>
        ✅ Отлично! Ваша встреча забронирована. Мы свяжемся с вами по указанному телефону.
      </Alert>
    );
  }

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
          Запишитесь на бесплатную консультацию с персональным менеджером и получите <strong>5 бесплатных интервью</strong> в подарок!
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

