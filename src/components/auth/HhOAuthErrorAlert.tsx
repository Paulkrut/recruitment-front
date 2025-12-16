'use client';

import { Alert, AlertTitle, Box, Button, Typography } from '@mui/material';
import Link from 'next/link';

/**
 * Компонент отображения ошибок HH OAuth
 */

interface HhOAuthErrorAlertProps {
  /** Код ошибки из URL параметра */
  error: string | null;
  /** Email из URL параметра (для email_not_verified) */
  email?: string | null;
}

// Типы и сообщения ошибок HH OAuth (инлайн, без отдельного файла)
const HH_OAUTH_ERRORS = {
  email_not_verified: {
    title: 'Email не подтверждён',
    message: 'Для объединения аккаунтов необходимо подтвердить email',
  },
  hh_callback_failed: {
    title: 'Ошибка авторизации HeadHunter',
    message: 'Не удалось завершить авторизацию через HeadHunter. Попробуйте снова.',
  },
  hh_no_code: {
    title: 'Отсутствует код авторизации',
    message: 'HeadHunter не вернул код авторизации. Попробуйте снова.',
  },
  hh_token_exchange_failed: {
    title: 'Ошибка обмена токена',
    message: 'Не удалось обменять код на токен доступа. Попробуйте снова.',
  },
  hh_profile_fetch_failed: {
    title: 'Ошибка получения профиля',
    message: 'Не удалось получить профиль пользователя от HeadHunter.',
  },
} as const;

type HhOAuthErrorCode = keyof typeof HH_OAUTH_ERRORS;

function isHhOAuthError(error: string): error is HhOAuthErrorCode {
  return error in HH_OAUTH_ERRORS;
}

export default function HhOAuthErrorAlert({ error, email }: HhOAuthErrorAlertProps) {
  if (!error || !isHhOAuthError(error)) {
    return null;
  }

  const errorInfo = HH_OAUTH_ERRORS[error];

  // Специальная обработка для email_not_verified
  if (error === 'email_not_verified' && email) {
    return (
      <Box sx={{ mb: 3 }}>
        <Alert severity="warning">
          <AlertTitle sx={{ fontWeight: 600 }}>
            {errorInfo.title}
          </AlertTitle>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Ваш email <strong>{email}</strong> ещё не подтверждён.
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Для объединения с аккаунтом HeadHunter сначала подтвердите email:
          </Typography>
          <ol style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>Проверьте почту {email}</li>
            <li>Перейдите по ссылке из письма подтверждения</li>
            <li>После подтверждения попробуйте войти через HH снова</li>
          </ol>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              color="warning"
              size="small"
              component={Link}
              href="/auth/resend-verification"
            >
              Отправить письмо повторно
            </Button>
          </Box>
        </Alert>
      </Box>
    );
  }

  // Обычные ошибки
  return (
    <Box sx={{ mb: 3 }}>
      <Alert severity="error">
        <AlertTitle sx={{ fontWeight: 600 }}>
          {errorInfo.title}
        </AlertTitle>
        <Typography variant="body2">
          {errorInfo.message}
        </Typography>
      </Alert>
    </Box>
  );
}

