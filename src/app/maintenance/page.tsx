'use client';

import React from 'react';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  Alert,
  Avatar,
  Divider,
  keyframes
} from '@mui/material';
import { Settings, Circle } from '@mui/icons-material';

// Анимация для иконки
const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% {
    transform: translateY(0);
  }
  40%, 43% {
    transform: translateY(-15px);
  }
  70% {
    transform: translateY(-7px);
  }
  90% {
    transform: translateY(-3px);
  }
`;

// Анимация пульсации
const pulse = keyframes`
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.8;
  }
`;

export default function MaintenancePage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Декоративные элементы */}
      <Box
        sx={{
          position: 'fixed',
          top: 80,
          left: 80,
          width: 80,
          height: 80,
          borderRadius: '50%',
          bgcolor: 'primary.light',
          opacity: 0.2,
          animation: `${pulse} 2s infinite`
        }}
      />
      <Box
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 80,
          width: 120,
          height: 120,
          borderRadius: '50%',
          bgcolor: 'secondary.light',
          opacity: 0.2,
          animation: `${pulse} 2s infinite`,
          animationDelay: '1s'
        }}
      />
      <Box
        sx={{
          position: 'fixed',
          top: '50%',
          left: 40,
          width: 60,
          height: 60,
          borderRadius: '50%',
          bgcolor: 'info.light',
          opacity: 0.2,
          animation: `${pulse} 2s infinite`,
          animationDelay: '2s'
        }}
      />

      <Container maxWidth="sm">
        <Paper
          elevation={8}
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)'
          }}
        >
          {/* Иконка с анимацией */}
          <Box sx={{ mb: 3 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mx: 'auto',
                bgcolor: 'primary.main',
                animation: `${bounce} 2s infinite`
              }}
            >
              <Settings sx={{ fontSize: 40 }} />
            </Avatar>
          </Box>

          {/* Заголовок */}
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            Технические работы
          </Typography>

          {/* Описание */}
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary', lineHeight: 1.6 }}>
            Мы проводим плановые технические работы для улучшения качества сервиса. 
            Приносим извинения за временные неудобства.
          </Typography>

          {/* Статус */}
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 3,
              '& .MuiAlert-icon': {
                animation: `${pulse} 1.5s infinite`
              }
            }}
            icon={<Circle />}
          >
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              Работы выполняются
            </Typography>
          </Alert>

          {/* Сообщение о возвращении */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 'semibold', mb: 1 }}>
              Мы скоро вернёмся!
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Ожидаемое время завершения работ: в течение нескольких часов
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Контактная информация */}
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            По вопросам обращайтесь к администратору
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
} 