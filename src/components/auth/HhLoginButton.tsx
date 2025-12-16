'use client';

import { Button, ButtonProps } from '@mui/material';

/**
 * Кнопка "Войти через HeadHunter"
 * Изолированный компонент для OAuth авторизации
 */

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test';

interface HhLoginButtonProps {
  /** Вариант кнопки */
  variant?: ButtonProps['variant'];
  /** Размер кнопки */
  size?: ButtonProps['size'];
  /** На всю ширину */
  fullWidth?: boolean;
  /** Дополнительные стили */
  sx?: ButtonProps['sx'];
}

export default function HhLoginButton({
  variant = 'outlined',
  size = 'large',
  fullWidth = true,
  sx = {},
}: HhLoginButtonProps) {
  const handleClick = () => {
    // Редирект на backend, который затем редиректит на HH.ru
    window.location.href = `${API_BASE}/api/auth/hh`;
  };

  return (
    <Button
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      onClick={handleClick}
      startIcon={
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          {/* Логотип HH.ru */}
          <rect width="24" height="24" rx="4" fill="#D6001C" />
          <path
            d="M7 7H9V11H11V7H13V17H11V13H9V17H7V7Z"
            fill="white"
          />
          <path
            d="M15 7H17V11H19V7H21V17H19V13H17V17H15V7Z"
            fill="white"
          />
        </svg>
      }
      sx={{
        borderColor: '#D6001C',
        color: '#D6001C',
        fontWeight: 600,
        textTransform: 'none',
        fontSize: '1rem',
        py: 1.5,
        '&:hover': {
          borderColor: '#B00017',
          backgroundColor: 'rgba(214, 0, 28, 0.04)',
        },
        ...sx,
      }}
    >
      Войти через HeadHunter
    </Button>
  );
}

