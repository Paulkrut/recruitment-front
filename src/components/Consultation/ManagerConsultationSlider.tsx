import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, Typography, Button, IconButton, Slide } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PhoneIcon from '@mui/icons-material/Phone';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { apiFetch } from '@/utils/api';
import ConsultationBookingForm from './ConsultationBookingForm';

interface ManagerConsultationSliderProps {
  managerPhone?: string;
}
const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test';

const ManagerConsultationSlider: React.FC<ManagerConsultationSliderProps> = ({
  managerPhone = '+7 962 940-74-73',
}) => {
  const [show, setShow] = useState(false);
  const [checking, setChecking] = useState(true);
  const [bookingFormOpen, setBookingFormOpen] = useState(false);
  const [topPosition, setTopPosition] = useState<number>(60);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Вычисляем позицию относительно ManagerInfo
  const calculatePosition = () => {
    const managerInfoButton = document.getElementById('manager-info-button');
    if (managerInfoButton) {
      const rect = managerInfoButton.getBoundingClientRect();
      // Позиция = высота элемента + отступ
      setTopPosition(rect.bottom + 10);
    }
  };

  // Проверка статуса и автоматическое показывание
  const checkStatus = async () => {
    try {
      const response = await apiFetch(`${API_BASE}/api/manager-consultation/status`);
      const data = await response.json();

      if (data.success) {
        const { should_show_slider, is_company_fully_setup } = data.status;

        // Если компания полностью настроена - больше не показываем
        if (is_company_fully_setup) {
          setShow(false);
          setChecking(false);
          return;
        }

        if (should_show_slider) {
          const lastShown = localStorage.getItem('consultation_slider_last_shown');
          const now = Date.now();

          // Показываем раз в день
          if (!lastShown || now - parseInt(lastShown) > 24 * 60 * 60 * 1000) {
            calculatePosition();
            setTimeout(() => {
              setShow(true);
              localStorage.setItem('consultation_slider_last_shown', now.toString());
            }, 2000); // Задержка 2 сек после загрузки страницы
          }
        }
      }
    } catch (error) {
      console.error('Failed to check consultation status:', error);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkStatus();

    // Пересчитываем позицию при изменении размера окна
    const handleResize = () => {
      if (show) {
        calculatePosition();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, []);

  const handleClose = async () => {
    setShow(false);

    try {
      await apiFetch('/api/manager-consultation/dismiss', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Failed to dismiss slider:', error);
    }
  };

  const handleCallNow = () => {
    window.open(`tel:${managerPhone}`);
  };

  const handleBookOnline = () => {
    setBookingFormOpen(true);
  };

  const handleBookingSuccess = () => {
    setShow(false);
    setBookingFormOpen(false);
  };

  if (checking || !show) return null;

  return (
    <>
      <Slide direction="down" in={show} mountOnEnter unmountOnExit>
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            top: `${topPosition}px`,
            right: 20,
            width: 380,
            maxWidth: 'calc(100vw - 40px)',
            p: 2,
            zIndex: 1300,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 2,
          }}
        >
          <IconButton
            size="small"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'white',
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>

          <Box sx={{ pr: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
              🎁 Получите 5 бесплатных интервью!
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.95 }}>
              Запишитесь на короткую консультацию с персональным менеджером. Мы расскажем о возможностях платформы и ответим на ваши вопросы.
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<CalendarMonthIcon />}
                onClick={handleBookOnline}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  flex: 1,
                  minWidth: 140,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  },
                }}
              >
                Записаться онлайн
              </Button>
              <Button
                variant="outlined"
                startIcon={<PhoneIcon />}
                onClick={handleCallNow}
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  color: 'white',
                  flex: 1,
                  minWidth: 120,
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Позвонить
              </Button>
            </Box>
          </Box>
        </Paper>
      </Slide>

      <ConsultationBookingForm
        open={bookingFormOpen}
        onClose={() => setBookingFormOpen(false)}
        onSuccess={handleBookingSuccess}
      />
    </>
  );
};

export default ManagerConsultationSlider;

