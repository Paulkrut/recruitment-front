'use client';
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  IconArrowUp,
  IconArrowDown,
  IconCoin,
  IconReceipt,
} from '@tabler/icons-react';
import PageContainer from '@/app/components/container/PageContainer';
import DashboardCard from '@/app/components/shared/DashboardCard';
import { apiFetch } from '@/utils/api';
import { useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';


const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test';

interface Transaction {
  id: number;
  type: 'credit' | 'debit';
  category: string;
  amount: number | null;
  interviews_changed: number;
  regulation_tests_changed: number;
  description: string | null;
  is_gifted: boolean;
  gift_value: number | null;
  created_at: string;
  created_by: {
    id: number;
    email: string;
  } | null;
}

interface Payment {
  id: number;
  status: string;
  amount: number;
  description: string | null;
  plan: {
    id: number;
    name: string;
    code: string;
  } | null;
  paid_at: string | null;
  created_at: string;
}

interface Stats {
  current_balance: {
    interviews: number;
    regulation_tests: number;
  };
  lifetime: {
    interviews_purchased: number;
    interviews_used: number;
    regulation_tests_purchased: number;
    regulation_tests_used: number;
    total_spent: string;
  };
  usage_rate: number;
}

export default function TransactionsPage() {
  const { _ } = useLingui();

  const [tabValue, setTabValue] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [transactionsRes, paymentsRes, statsRes] = await Promise.all([
        apiFetch(`${API_BASE}/api/billing/transactions`),
        apiFetch(`${API_BASE}/api/billing/payments`),
        apiFetch(`${API_BASE}/api/billing/stats`),
      ]);

      const transactionsData = await transactionsRes.json();
      const paymentsData = await paymentsRes.json();
      const statsData = await statsRes.json();

      if (transactionsData.success) setTransactions(transactionsData.transactions);
      if (paymentsData.success) setPayments(paymentsData.payments);
      if (statsData.success) setStats(statsData.stats);
    } catch (err: any) {
      setError(err.message || _(msg`Не удалось загрузить данные`));
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (category: string, isGifted: boolean) => {
    if (isGifted) return _(msg`🎁 Бонус`);
    
    const labels: Record<string, string> = {
      purchase: _(msg`Покупка`),
      interview_usage: _(msg`Использование интервью`),
      interview_gifted: _(msg`🎁 Подарок`),
      test_usage: _(msg`Использование теста`),
      refund: _(msg`Возврат`),
      bonus: _(msg`Бонус`),
    };
    return labels[category] || category;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
      succeeded: 'success',
      pending: 'warning',
      waiting_for_capture: 'warning',
      canceled: 'error',
      failed: 'error',
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      succeeded: _(msg`Успешно`),
      pending: _(msg`В обработке`),
      waiting_for_capture: _(msg`Ожидает подтверждения`),
      canceled: _(msg`Отменён`),
      failed: _(msg`Ошибка`),
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <PageContainer title={_(msg`История и статистика`)} description="Просмотр транзакций">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer title={_(msg`История и статистика`)} description="Просмотр всех операций">
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Статистика */}
      {stats && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <IconCoin size={20} color="green" />
                  <Typography variant="h6"><Trans>Текущий баланс</Trans></Typography>
                </Box>
                <Typography variant="h4">{stats.current_balance.interviews}</Typography>
                <Typography variant="caption" color="text.secondary"><Trans>интервью</Trans></Typography>
                <Typography variant="body2" sx={{ mt: 1 }}><Trans>
                  {stats.current_balance.regulation_tests} тестов по регламентам
                </Trans></Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <IconReceipt size={20} color="blue" />
                  <Typography variant="h6"><Trans>Всего потрачено</Trans></Typography>
                </Box>
                <Typography variant="h4">
                  {parseFloat(stats.lifetime.total_spent).toLocaleString('ru-RU')}₽
                </Typography>
                <Typography variant="caption" color="text.secondary"><Trans>за всё время</Trans></Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Typography variant="h6"><Trans>Использование</Trans></Typography>
                </Box>
                <Typography variant="h4">{stats.usage_rate}%</Typography>
                <Typography variant="caption" color="text.secondary"><Trans>
                  {stats.lifetime.interviews_used} из {stats.lifetime.interviews_purchased} интервью
                </Trans></Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <DashboardCard title="">
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
          <Tab label={_(msg`Транзакции`)} />
          <Tab label={_(msg`Платежи`)} />
        </Tabs>

        {/* Таблица транзакций */}
        {tabValue === 0 && (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><Trans>Дата</Trans></TableCell>
                  <TableCell><Trans>Операция</Trans></TableCell>
                  <TableCell><Trans>Описание</Trans></TableCell>
                  <TableCell align="right"><Trans>Интервью</Trans></TableCell>
                  <TableCell align="right"><Trans>Тесты</Trans></TableCell>
                  <TableCell align="right"><Trans>Сумма</Trans></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary"><Trans>Нет транзакций</Trans></Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {new Date(transaction.created_at).toLocaleDateString('ru-RU', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getCategoryLabel(transaction.category, transaction.is_gifted)}
                          size="small"
                          color={
                            transaction.is_gifted
                              ? 'warning'
                              : transaction.type === 'credit'
                              ? 'success'
                              : 'default'
                          }
                          icon={
                            transaction.type === 'credit' ? (
                              <IconArrowUp size={16} />
                            ) : (
                              <IconArrowDown size={16} />
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{transaction.description}</Typography>
                        {transaction.is_gifted && transaction.gift_value && (
                          <Typography variant="caption" color="warning.main"><Trans>
                            (стоимость {transaction.gift_value.toLocaleString('ru-RU')}₽)
                          </Trans></Typography>
                        )}
                        {transaction.created_by && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {transaction.created_by.email}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {transaction.interviews_changed !== 0 && (
                          <Typography
                            variant="body2"
                            color={transaction.interviews_changed > 0 ? 'success.main' : 'error.main'}
                          >
                            {transaction.interviews_changed > 0 ? '+' : ''}
                            {transaction.interviews_changed}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {transaction.regulation_tests_changed !== 0 && (
                          <Typography
                            variant="body2"
                            color={transaction.regulation_tests_changed > 0 ? 'success.main' : 'error.main'}
                          >
                            {transaction.regulation_tests_changed > 0 ? '+' : ''}
                            {transaction.regulation_tests_changed}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {transaction.amount && (
                          <Typography variant="body2" fontWeight="medium">
                            {parseFloat(transaction.amount.toString()).toLocaleString('ru-RU')}₽
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Таблица платежей */}
        {tabValue === 1 && (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><Trans>Дата создания</Trans></TableCell>
                  <TableCell><Trans>Тариф</Trans></TableCell>
                  <TableCell><Trans>Статус</Trans></TableCell>
                  <TableCell><Trans>Дата оплаты</Trans></TableCell>
                  <TableCell align="right"><Trans>Сумма</Trans></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary"><Trans>Нет платежей</Trans></Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {new Date(payment.created_at).toLocaleDateString('ru-RU', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell>
                        {payment.plan ? (
                          <Box>
                            <Typography variant="body2">{payment.plan.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {payment.description}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2">{payment.description}</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(payment.status)}
                          size="small"
                          color={getStatusColor(payment.status)}
                        />
                      </TableCell>
                      <TableCell>
                        {payment.paid_at
                          ? new Date(payment.paid_at).toLocaleDateString('ru-RU', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—'}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium">
                          {payment.amount.toLocaleString('ru-RU')}₽
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DashboardCard>
    </PageContainer>
  );
}

