'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import { IconCheck, IconX } from '@tabler/icons-react';
import PageContainer from '@/app/components/container/PageContainer';
import { apiFetch } from '@/utils/api';
import { useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';


const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test';

export default function PaymentSuccessPage() {
  const { _ } = useLingui();

  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentId = searchParams?.get('payment_id');

  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (paymentId) {
      checkPaymentStatus();
    } else {
      setError(_(msg`Не указан ID платежа`));
      setLoading(false);
    }
  }, [paymentId]);

  const checkPaymentStatus = async () => {
    try {
      const response = await apiFetch(`${API_BASE}/api/billing/payment/${paymentId}/status`);
      const data = await response.json();

      if (data.success) {
        setPayment(data.payment);
      } else {
        setError(_(msg`Не удалось получить информацию о платеже`));
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка при проверке статуса платежа');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageContainer title={_(msg`Проверка платежа`)} description="Пожалуйста, подождите">
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="50vh">
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6"><Trans>Проверяем статус платежа...</Trans></Typography>
        </Box>
      </PageContainer>
    );
  }

  const isSuccess = payment?.status === 'succeeded';
  const isPending = payment?.status === 'pending' || payment?.status === 'waiting_for_capture';

  return (
    <PageContainer title={_(msg`Результат оплаты`)} description="">
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Card sx={{ maxWidth: 600, width: '100%' }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            {error ? (
              <>
                <IconX size={80} color="red" style={{ marginBottom: 16 }} />
                <Typography variant="h4" gutterBottom color="error"><Trans>Ошибка</Trans></Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  {error}
                </Typography>
                <Button variant="contained" onClick={() => router.push('/hr/billing')}>
                  Вернуться к тарифам
                </Button>
              </>
            ) : isSuccess ? (
              <>
                <IconCheck size={80} color="green" style={{ marginBottom: 16 }} />
                <Typography variant="h4" gutterBottom color="success.main"><Trans>Оплата прошла успешно!</Trans></Typography>
                <Typography variant="body1" color="text.secondary" paragraph><Trans>Интервью зачислены на ваш баланс. Теперь вы можете создавать кандидатов и проводить интервью.</Trans></Typography>
                <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary"><Trans>Сумма платежа</Trans></Typography>
                  <Typography variant="h5">
                    {payment.amount.toLocaleString('ru-RU')}₽
                  </Typography>
                </Box>
                <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button variant="outlined" onClick={() => router.push('/hr/billing/transactions')}>
                    История платежей
                  </Button>
                  <Button variant="contained" onClick={() => router.push('/hr/candidates')}>
                    К кандидатам
                  </Button>
                </Box>
              </>
            ) : isPending ? (
              <>
                <CircularProgress size={60} sx={{ mb: 2 }} />
                <Typography variant="h5" gutterBottom><Trans>Платёж обрабатывается</Trans></Typography>
                <Typography variant="body1" color="text.secondary" paragraph><Trans>Пожалуйста, подождите. Обычно это занимает несколько секунд.</Trans></Typography>
                <Button variant="outlined" onClick={checkPaymentStatus}><Trans>Обновить статус</Trans></Button>
              </>
            ) : (
              <>
                <IconX size={80} color="orange" style={{ marginBottom: 16 }} />
                <Typography variant="h5" gutterBottom color="warning.main"><Trans>Платёж отменён</Trans></Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Статус: {payment?.status}
                </Typography>
                <Button variant="contained" onClick={() => router.push('/hr/billing')}>
                  Попробовать снова
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </Box>
    </PageContainer>
  );
}

