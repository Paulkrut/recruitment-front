'use client';
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  Stack,
} from '@mui/material';
import {
  IconGift,
  IconShoppingCart,
  IconChecks,
  IconSparkles,
} from '@tabler/icons-react';
import PageContainer from '@/app/components/container/PageContainer';
import { apiFetch } from '@/utils/api';
import { useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';


const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test';

interface DetailedStats {
  purchased: number;
  used: {
    paid: number;
    gifted: number;
    total: number;
  };
  balance: number;
  gifts: {
    count: number;
    value: number;
  };
}

export default function BillingAnalyticsPage() {
  const { _ } = useLingui();

  const [stats, setStats] = useState<DetailedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(`${API_BASE}/api/billing/detailed-stats`);
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      } else {
        setError(_(msg`Не удалось загрузить статистику`));
      }
    } catch (err: any) {
      setError(err.message || _(msg`Ошибка загрузки данных`));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageContainer title={_(msg`Аналитика`)} description="Детальная статистика">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title={_(msg`Аналитика`)} description="Детальная статистика">
        <Alert severity="error">{error}</Alert>
      </PageContainer>
    );
  }

  if (!stats) return null;

  return (
    <PageContainer title={_(msg`Аналитика использования`)} description="Детальная статистика интервью">
      <Grid container spacing={3}>
        {/* Куплено */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <IconShoppingCart size={32} color="white" />
              </Box>
              <Typography variant="h3" color="white">
                {stats.purchased}
              </Typography>
              <Typography variant="body1" color="white" sx={{ opacity: 0.9 }}><Trans>Куплено интервью</Trans></Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Использовано оплаченных */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <IconChecks size={32} color="white" />
              </Box>
              <Typography variant="h3" color="white">
                {stats.used.paid}
              </Typography>
              <Typography variant="body1" color="white" sx={{ opacity: 0.9 }}><Trans>Использовано оплаченных</Trans></Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Подарено */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <IconGift size={32} color="white" />
              </Box>
              <Typography variant="h3" color="white">
                {stats.gifts.count}
              </Typography>
              <Typography variant="body1" color="white" sx={{ opacity: 0.9 }}><Trans>🎁 Бонусных интервью</Trans></Typography>
              {stats.gifts.value > 0 && (
                <Typography variant="caption" color="white" sx={{ opacity: 0.8 }}><Trans>
                  на сумму {stats.gifts.value.toLocaleString('ru-RU')}₽
                </Trans></Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Текущий баланс */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <IconSparkles size={32} color="white" />
              </Box>
              <Typography variant="h3" color="white">
                {stats.balance}
              </Typography>
              <Typography variant="body1" color="white" sx={{ opacity: 0.9 }}><Trans>Текущий баланс</Trans></Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Детальная разбивка */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" mb={3}><Trans>📊 Использование интервью</Trans></Typography>

              <Stack spacing={3}>
                {/* Оплаченные */}
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body1" color="text.secondary"><Trans>Оплаченные интервью</Trans></Typography>
                    <Typography variant="h6">
                      {stats.used.paid} / {stats.purchased}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: '100%',
                      height: 8,
                      bgcolor: 'grey.200',
                      borderRadius: 1,
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        width: `${stats.purchased > 0 ? (stats.used.paid / stats.purchased) * 100 : 0}%`,
                        height: '100%',
                        bgcolor: 'primary.main',
                      }}
                    />
                  </Box>
                </Box>

                <Divider />

                {/* Подарочные */}
                {stats.gifts.count > 0 && (
                  <>
                    <Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body1" color="warning.main"><Trans>🎁 Бонусные интервью</Trans></Typography>
                        <Typography variant="h6" color="warning.main">
                          {stats.gifts.count}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Стоимость: {stats.gifts.value.toLocaleString('ru-RU')}₽
                      </Typography>
                    </Box>

                    <Divider />
                  </>
                )}

                {/* Итого */}
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="h6"><Trans>Всего проведено интервью</Trans></Typography>
                    <Typography variant="h5" color="success.main">
                      {stats.used.total}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Из них {stats.used.paid} оплаченных
                    {stats.gifts.count > 0 && ` и ${stats.gifts.count} бонусных`}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Благодарность за подарки */}
        {stats.gifts.count > 0 && (
          <Grid item xs={12}>
            <Alert severity="success" icon={<IconGift size={24} />}>
              <Typography variant="body1" fontWeight="medium"><Trans>Спасибо за использование нашей платформы! 🎁</Trans></Typography>
              <Typography variant="body2">
                <Trans>Вы получили {stats.gifts.count} бонусных интервью благодаря нашей системе защиты от одновременных запусков. Мы ценим ваше доверие!</Trans>
              </Typography>
            </Alert>
          </Grid>
        )}
      </Grid>
    </PageContainer>
  );
}




