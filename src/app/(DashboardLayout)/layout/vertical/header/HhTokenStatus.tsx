"use client";
import React, { useState, useEffect } from 'react';
import { Chip, Tooltip, CircularProgress } from '@mui/material';
import { Icon } from '@iconify/react';
import { apiFetch } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';


const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test';

interface HhTokenStatusData {
  connected: boolean;
  tokenValid: boolean;
  status: string; // 'valid', 'expired', 'invalid', 'not_connected'
  message?: string;
  warning?: boolean;
  expiresIn?: number;
  action?: string;
  reconnectUrl?: string;
}

const HhTokenStatus = () => {
  const { _ } = useLingui();

  const [status, setStatus] = useState<HhTokenStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchStatus = async () => {
    try {
      const response = await apiFetch(`${API_BASE}/api/hh-integration/token-status`);
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Error fetching HH token status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Первая загрузка
    fetchStatus();

    // Опрос каждые 5 минут (300000 мс)
    const interval = setInterval(fetchStatus, 5 * 60 * 1000);

    // Обновляем при возврате фокуса на окно (пользователь вернулся)
    const handleFocus = () => {
      fetchStatus();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Не показываем ничего если загружается или не подключено
  if (loading || !status?.connected) {
    return null;
  }

  // Определяем цвет и иконку
  const getChipProps = () => {
    if (status.status === 'expired' || status.status === 'invalid') {
      return {
        color: 'error' as const,
        icon: <Icon icon="solar:shield-warning-bold" width="18" />,
        label: _(msg`HH.ru требует авторизации`),
      };
    }
    
    if (status.warning) {
      return {
        color: 'warning' as const,
        icon: <Icon icon="solar:clock-circle-bold" width="18" />,
        label: _(msg`HH.ru токен истекает`),
      };
    }

    // Валидный токен - зелёная иконка
    return {
      color: 'success' as const,
      icon: <Icon icon="logos:headhunter" width="18" />,
      label: 'HH.ru',
    };
  };

  const chipProps = getChipProps();

  return (
    <Tooltip 
      title={status.message || _(msg`Статус интеграции HH.ru`)}
      arrow
      placement="bottom"
    >
      <Chip
        {...chipProps}
        size="small"
        variant="filled"
        onClick={() => {
          if (status.reconnectUrl) {
            router.push(status.reconnectUrl);
          }
        }}
        sx={{
          cursor: 'pointer',
          fontWeight: 600,
          height: 32,
          '& .MuiChip-icon': {
            fontSize: 18,
          },
          '&:hover': {
            opacity: 0.8,
          },
        }}
      />
    </Tooltip>
  );
};

export default HhTokenStatus;

