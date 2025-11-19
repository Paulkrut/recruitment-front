"use client";
import React, { useState } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert } from '@mui/material';
import { useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';


const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

interface ForgetMeAutoProps {
  candidateToken: string;
}

export default function ForgetMeAuto({ candidateToken }: ForgetMeAutoProps) {
  const { _ } = useLingui();

  const [open, setOpen] = useState(false);
  const [confirmed, setConfirmed] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [countdown, setCountdown] = useState(3);

  const handleForgetMe = async () => {
    if (confirmed !== 'УДАЛИТЬ') {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/public/delete-candidate-by-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateToken,
          reason: 'Автоматический запрос через интерфейс интервью'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setSuccessMessage(result.message || 'Ваши данные успешно удалены с платформы');
        setShowSuccess(true);
        setOpen(false);
        
        // Запускаем счетчик обратного отсчета
        let secondsLeft = 3;
        const countdownInterval = setInterval(() => {
          secondsLeft--;
          setCountdown(secondsLeft);
          
          if (secondsLeft <= 0) {
            clearInterval(countdownInterval);
            window.location.href = '/';
          }
        }, 1000);
      } else {
        const errorData = await response.json();
        alert('Ошибка при удалении данных: ' + (errorData.error || 'Неизвестная ошибка'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Ошибка при удалении данных');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Сообщение об успешном удалении */}
      {showSuccess && (
        <Dialog
          open={showSuccess}
          maxWidth="sm"
          fullWidth
          disableEscapeKeyDown
          onClose={() => {}} // Пустая функция для предотвращения закрытия
        >
          <DialogTitle sx={{ textAlign: 'center', color: 'success.main' }}>
            <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
              <Typography variant="h4" fontWeight="bold" color="success.main"><Trans>✅ Данные успешно удалены!</Trans></Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box textAlign="center" py={2}>
              <Typography variant="h6" gutterBottom color="success.main"><Trans>Ваши персональные данные полностью удалены с платформы</Trans></Typography>
              <Typography variant="body1" paragraph>
                {successMessage}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                🕐 Через{' '}
                <Box
                  component="span"
                  sx={{
                    display: 'inline-block',
                    fontWeight: 'bold',
                    color: 'primary.main',
                    fontSize: '1.2em',
                    animation: 'pulse 1s infinite',
                    '@keyframes pulse': {
                      '0%': { transform: 'scale(1)' },
                      '50%': { transform: 'scale(1.1)' },
                      '100%': { transform: 'scale(1)' }
                    }
                  }}
                >
                  {countdown}
                </Box>
                {' '}секунд вы будете перенаправлены на главную страницу...
              </Typography>
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="success"
                  size="large"
                  onClick={() => window.location.href = '/'}
                  sx={{ px: 4 }}
                >
                  Перейти сейчас
                </Button>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>
      )}

      {/* Диалог подтверждения удаления */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>🗑️ Удаление персональных данных</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}><Trans>Внимание! Это действие необратимо. Все ваши данные будут полностью удалены с платформы.</Trans></Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Для подтверждения введите слово <strong>УДАЛИТЬ</strong> в поле ниже:
          </Typography>
          <TextField
            fullWidth
            value={confirmed}
            onChange={(e) => setConfirmed(e.target.value)}
            placeholder={_(msg`Введите УДАЛИТЬ`)}
            variant="outlined"
            size="small"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Отмена</Button>
          <Button 
            onClick={handleForgetMe}
            disabled={confirmed !== 'УДАЛИТЬ' || loading}
            color="error"
            variant="contained"
          >
            {loading ? 'Удаление...' : 'Удалить данные'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Юридический текст и кнопка для открытия диалога */}
      <Box sx={{ 
        mt: 'auto', 
        pt: 3, 
        borderTop: '1px solid #e0e0e0',
        textAlign: 'center',
        opacity: 0.6
      }}>
        <Typography variant="caption" color="text.secondary" sx={{ 
          fontSize: '0.7rem', 
          lineHeight: 1.4,
          display: 'block'
        }}>
          Используя данную платформу, вы соглашаетесь с{' '}
          <Button 
            component="a"
            href="/privacy-policy"
            target="_blank"
            variant="text" 
            size="small" 
            sx={{ 
              p: 0, 
              minWidth: 'auto', 
              textTransform: 'none', 
              textDecoration: 'underline',
              color: 'text.secondary',
              fontSize: '0.7rem',
              opacity: 0.8,
              '&:hover': {
                backgroundColor: 'transparent',
                color: 'text.secondary',
                opacity: 0.8,
                textDecoration: 'underline'
              }
            }}
          ><Trans>политикой конфиденциальности</Trans></Button>
          {' '}и{' '}
          <Button 
            component="a"
            href="/terms-of-service"
            target="_blank"
            variant="text" 
            size="small" 
            sx={{ 
              p: 0, 
              minWidth: 'auto', 
              textTransform: 'none', 
              textDecoration: 'underline',
              color: 'text.secondary',
              fontSize: '0.7rem',
              opacity: 0.8,
              '&:hover': {
                backgroundColor: 'transparent',
                color: 'text.secondary',
                opacity: 0.8,
                textDecoration: 'underline'
              }
            }}
          ><Trans>условиями обработки персональных данных</Trans></Button>
          . В соответствии с Федеральным законом от 27.07.2006 N 152-ФЗ "О персональных данных" вы имеете право на{' '}
          <Button 
            variant="text" 
            size="small" 
            onClick={() => setOpen(true)}
            sx={{ 
              p: 0, 
              minWidth: 'auto', 
              textTransform: 'none', 
              textDecoration: 'underline',
              color: 'text.secondary',
              fontSize: '0.7rem',
              opacity: 0.8,
              '&:hover': {
                backgroundColor: 'transparent',
                color: 'text.secondary',
                opacity: 0.8,
                textDecoration: 'underline'
              }
            }}
          >
            удаление своих персональных данных
          </Button>
          {' '}с платформы в любое время.
        </Typography>
      </Box>
    </>
  );
} 