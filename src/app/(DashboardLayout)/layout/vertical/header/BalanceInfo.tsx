'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  Menu,
  MenuItem,
  Stack,
  Typography,
  LinearProgress,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';


const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test';

interface BalanceData {
  current_balance: {
    interviews: number;
    regulation_tests: number | null;
    screenings: number | null;
  };
  lifetime: {
    interviews_purchased: number;
    interviews_used: number;
    regulation_tests_purchased: number;
    regulation_tests_used: number;
    total_spent: string;
  };
  usage_rate: number;
  is_screenings_free: boolean;
  is_tests_free: boolean;
  free_until: string | null;
}

const BalanceInfo = () => {
  const { _ } = useLingui();

  const router = useRouter();
  const { currentCompany } = useUser();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const open = Boolean(anchorEl);

  // Загрузка баланса при изменении компании
  useEffect(() => {
    if (currentCompany) {
      loadBalance();
    } else {
      setBalance(null);
      setLoading(false);
    }
  }, [currentCompany]);

  const loadBalance = async () => {
    if (!currentCompany) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('recruitment_token');

      if (!token) {
        setError(_(msg`Не авторизован`));
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/api/billing/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Company-ID': currentCompany.id.toString(),
        },
      });

      if (!response.ok) {
        throw new Error(_(msg`Ошибка загрузки баланса`));
      }

      const data = await response.json();
      // API возвращает данные в обёртке { success: true, stats: {...} }
      setBalance(data.stats || data);
      setLoading(false);
    } catch (err: any) {
      console.error('Error loading balance:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNavigateToBilling = () => {
    handleClose();
    router.push('/hr/billing');
  };

  const handleNavigateToTransactions = () => {
    handleClose();
    router.push('/hr/billing/transactions');
  };

  const handleNavigateToAnalytics = () => {
    handleClose();
    router.push('/hr/billing/analytics');
  };

  // Определяем цвет индикатора баланса
  const getBalanceColor = (current: number, total: number) => {
    const percentage = total > 0 ? (current / total) * 100 : 0;
    if (percentage <= 20) return 'error';
    if (percentage <= 50) return 'warning';
    return 'success';
  };

  const getBalanceIcon = (current: number, total: number) => {
    const percentage = total > 0 ? (current / total) * 100 : 0;
    if (percentage <= 20) return 'solar:danger-triangle-bold-duotone';
    if (percentage <= 50) return 'solar:danger-bold-duotone';
    return 'solar:check-circle-bold-duotone';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={20} />
      </Box>
    );
  }

  if (error) {
    return (
      <Chip
        label={_(msg`Ошибка`)}
        color="error"
        size="small"
        icon={<Icon icon="solar:danger-bold-duotone" />}
      />
    );
  }

  if (!balance) {
    return null; // Не показываем ничего, если нет данных
  }

  const interviewsTotal = balance.lifetime.interviews_purchased;
  const interviewsCurrent = balance.current_balance.interviews;
  const testsTotal = balance.lifetime.regulation_tests_purchased;
  const testsCurrent = balance.current_balance.regulation_tests;
  
  const isTestsFree = balance.is_tests_free;
  const isScreeningsFree = balance.is_screenings_free;

  const interviewsColor = getBalanceColor(interviewsCurrent, interviewsTotal);
  const testsColor = isTestsFree ? 'success' : getBalanceColor(testsCurrent || 0, testsTotal);

  // Проверяем, заканчивается ли баланс (только для платных ресурсов)
  const isLowBalance = interviewsCurrent <= 2 || (!isTestsFree && testsCurrent !== null && testsCurrent <= 5);

  return (
    <>
      <Button
        onClick={handleClick}
        color="inherit"
        sx={{
          borderRadius: '10px',
          px: 2,
          py: 1,
          textTransform: 'none',
          border: '1px solid',
          borderColor: isLowBalance ? 'error.main' : 'divider',
          backgroundColor: isLowBalance ? 'error.lighter' : 'background.paper',
          '&:hover': {
            backgroundColor: isLowBalance ? 'error.light' : 'action.hover',
          },
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          {isLowBalance && (
            <Icon icon="solar:danger-triangle-bold-duotone" width={20} style={{ color: '#f44336' }} />
          )}
          <Stack direction="row" spacing={1} alignItems="center">
            <Icon icon="solar:case-round-bold-duotone" width={20} style={{ color: '#2196f3' }} />
            <Typography variant="body2" fontWeight={600}>
              {interviewsCurrent}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Icon icon="solar:clipboard-list-bold-duotone" width={20} style={{ color: '#9c27b0' }} />
            <Typography variant="body2" fontWeight={600}>
              {isTestsFree ? '∞' : testsCurrent}
            </Typography>
          </Stack>
          {isScreeningsFree && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Icon icon="solar:document-text-bold-duotone" width={20} style={{ color: '#ff9800' }} />
              <Typography variant="body2" fontWeight={600}>
                ∞
              </Typography>
            </Stack>
          )}
          <Icon icon={open ? 'solar:alt-arrow-up-bold' : 'solar:alt-arrow-down-bold'} width={16} />
        </Stack>
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 3,
          sx: {
            width: 350,
            mt: 1.5,
            borderRadius: '12px',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" mb={2}><Trans>Ваш баланс</Trans></Typography>

          {/* Интервью */}
          <Box mb={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Icon icon="solar:case-round-bold-duotone" width={20} style={{ color: '#2196f3' }} />
                <Typography variant="body2"><Trans>Интервью</Trans></Typography>
              </Stack>
              <Chip
                label={_(msg`${interviewsCurrent} из ${interviewsTotal}`)}
                size="small"
                color={interviewsColor}
                icon={<Icon icon={getBalanceIcon(interviewsCurrent, interviewsTotal)} />}
              />
            </Stack>
            <LinearProgress
              variant="determinate"
              value={interviewsTotal > 0 ? (interviewsCurrent / interviewsTotal) * 100 : 0}
              color={interviewsColor}
              sx={{ height: 8, borderRadius: 1 }}
            />
          </Box>

          {/* Тесты */}
          <Box mb={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Icon icon="solar:clipboard-list-bold-duotone" width={20} style={{ color: '#9c27b0' }} />
                <Typography variant="body2"><Trans>Тесты по регламентам</Trans></Typography>
              </Stack>
              {isTestsFree ? (
                <Chip
                  label={_(msg`∞ Безлимит`)}
                  size="small"
                  color="success"
                  icon={<Icon icon="solar:gift-bold-duotone" />}
                />
              ) : (
                <Chip
                  label={_(msg`${testsCurrent} из ${testsTotal}`)}
                  size="small"
                  color={testsColor}
                  icon={<Icon icon={getBalanceIcon(testsCurrent || 0, testsTotal)} />}
                />
              )}
            </Stack>
            {!isTestsFree && (
              <LinearProgress
                variant="determinate"
                value={testsTotal > 0 ? ((testsCurrent || 0) / testsTotal) * 100 : 0}
                color={testsColor}
                sx={{ height: 8, borderRadius: 1 }}
              />
            )}
          </Box>

          {/* Скрининги (если включены) */}
          {isScreeningsFree && (
            <Box mb={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Icon icon="solar:document-text-bold-duotone" width={20} style={{ color: '#ff9800' }} />
                  <Typography variant="body2"><Trans>Скрининги AI</Trans></Typography>
                </Stack>
                <Chip
                  label={_(msg`∞ Безлимит`)}
                  size="small"
                  color="success"
                  icon={<Icon icon="solar:gift-bold-duotone" />}
                />
              </Stack>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Статистика */}
          <Typography variant="subtitle2" mb={1} color="text.secondary"><Trans>За всё время:</Trans></Typography>
          <Stack spacing={1} mb={2}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary"><Trans>Проведено интервью:</Trans></Typography>
              <Typography variant="body2" fontWeight={600}>
                {balance.lifetime.interviews_used}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary"><Trans>Проведено тестов:</Trans></Typography>
              <Typography variant="body2" fontWeight={600}>
                {balance.lifetime.regulation_tests_used}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary"><Trans>Потрачено:</Trans></Typography>
              <Typography variant="body2" fontWeight={600} color="primary">
                {parseFloat(balance.lifetime.total_spent).toLocaleString('ru-RU')} ₽
              </Typography>
            </Stack>
          </Stack>

          {/* Предупреждение о низком балансе */}
          {isLowBalance && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2"><Trans>Баланс заканчивается! Пополните счёт.</Trans></Typography>
            </Alert>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Кнопки действий */}
          <Stack spacing={1}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<Icon icon="solar:wallet-bold-duotone" />}
              onClick={handleNavigateToBilling}
            >
              <Trans>Пополнить баланс</Trans>
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Icon icon="solar:chart-2-bold-duotone" />}
              onClick={handleNavigateToAnalytics}
            >
              <Trans>Аналитика</Trans>
            </Button>
            <Button
              fullWidth
              variant="text"
              startIcon={<Icon icon="solar:document-text-bold-duotone" />}
              onClick={handleNavigateToTransactions}
            >
              <Trans>История операций</Trans>
            </Button>
          </Stack>
        </Box>
      </Menu>
    </>
  );
};

export default BalanceInfo;

