'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Stack,
  Skeleton,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  IconWallet,
  IconPlus,
  IconTrendingUp,
  IconUsers,
  IconFileText,
} from '@tabler/icons-react';
import { apiFetch } from '@/utils/api';
import { Trans } from '@lingui/react';
import { useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';



const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test';

interface Balance {
  interviews: number;
  regulation_tests: number;
  total_interviews_purchased: number;
  total_interviews_used: number;
  total_regulation_tests_purchased: number;
  total_regulation_tests_used: number;
}

export default function BalanceWidget() {
  const { _ } = useLingui();

  const router = useRouter();
  const [balance, setBalance] = useState<Balance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(`${API_BASE}/api/billing/balance`);
      const data = await response.json();

      if (data.success) {
        setBalance(data.balance);
      } else {
        setError(_(msg`Не удалось загрузить баланс`));
      }
    } catch (err: any) {
      setError(err.message || _(msg`Ошибка загрузки баланса`));
    } finally {
      setLoading(false);
    }
  };

  const getBalanceColor = (count: number) => {
    if (count === 0) return 'error';
    if (count < 10) return 'warning';
    return 'success';
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Skeleton variant="text" width="60%" height={30} />
            <Skeleton variant="rectangular" height={80} />
            <Skeleton variant="rectangular" height={80} />
          </Stack>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  const interviewsUsagePercent = balance?.total_interviews_purchased
    ? Math.round((balance.total_interviews_used / balance.total_interviews_purchased) * 100)
    : 0;

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <IconWallet size={24} />
            <Typography variant="h6"><Trans>Баланс</Trans></Typography>
          </Box>
          <Button
            variant="contained"
            size="small"
            startIcon={<IconPlus size={18} />}
            onClick={() => router.push('/hr/billing')}
          >
            Пополнить
          </Button>
        </Box>

        {/* Баланс интервью */}
        <Box
          sx={{
            p: 2,
            mb: 2,
            borderRadius: 2,
            bgcolor: 'primary.light',
            border: '1px solid',
            borderColor: 'primary.main',
          }}
        >
          <Stack spacing={1}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center" gap={1}>
                <IconUsers size={20} />
                <Typography variant="body2" color="text.secondary"><Trans>Интервью кандидатов</Trans></Typography>
              </Box>
              <Chip
                label={balance?.interviews === 0 ? _(msg`Нет интервью`) : `${balance?.interviews} шт.`}
                color={getBalanceColor(balance?.interviews || 0)}
                size="small"
              />
            </Box>

            <Typography variant="h3">{balance?.interviews || 0}</Typography>

            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="caption" color="text.secondary">
                Использовано: {balance?.total_interviews_used || 0} из {balance?.total_interviews_purchased || 0}
              </Typography>
              {balance?.total_interviews_purchased && balance.total_interviews_purchased > 0 && (
                <Chip label={`${interviewsUsagePercent}%`} size="small" variant="outlined" />
              )}
            </Box>
          </Stack>
        </Box>

        {/* Баланс тестов по регламентам */}
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: 'secondary.light',
            border: '1px solid',
            borderColor: 'secondary.main',
          }}
        >
          <Stack spacing={1}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center" gap={1}>
                <IconFileText size={20} />
                <Typography variant="body2" color="text.secondary"><Trans>Тесты по регламентам</Trans></Typography>
              </Box>
              <Chip
                label={balance?.regulation_tests === 0 ? _(msg`Нет тестов`) : `${balance?.regulation_tests} шт.`}
                color={getBalanceColor(balance?.regulation_tests || 0)}
                size="small"
              />
            </Box>

            <Typography variant="h3">{balance?.regulation_tests || 0}</Typography>

            <Typography variant="caption" color="text.secondary">
              Использовано: {balance?.total_regulation_tests_used || 0} из {balance?.total_regulation_tests_purchased || 0}
            </Typography>
          </Stack>
        </Box>

        {/* Предупреждение о низком балансе */}
        {(balance?.interviews || 0) < 5 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2"><Trans>У вас осталось мало интервью. Рекомендуем пополнить баланс.</Trans></Typography>
          </Alert>
        )}

        {/* Кнопка статистики */}
        <Box mt={2}>
          <Button
            fullWidth
            variant="outlined"
            size="small"
            startIcon={<IconTrendingUp size={18} />}
            onClick={() => router.push('/hr/billing/transactions')}
          >
            История и статистика
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

