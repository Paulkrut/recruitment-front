'use client';
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from '@mui/material';
import { IconCheck, IconX, IconCreditCard, IconSparkles } from '@tabler/icons-react';
import PageContainer from '@/app/components/container/PageContainer';
import DashboardCard from '@/app/components/shared/DashboardCard';
import { apiFetch } from '@/utils/api';

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test';

interface Plan {
  id: number;
  code: string;
  name: string;
  description: string | null;
  price: number;
  interviews_included: number;
  is_free: boolean;
  features: Record<string, any>;
  price_per_interview: number;
}

export default function BillingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(`${API_BASE}/api/billing/plans`);
      const data = await response.json();
      if (data.success) {
        setPlans(data.plans);
      }
    } catch (err: any) {
      setError(err.message || 'Не удалось загрузить тарифы');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPlan) return;

    try {
      setPurchasing(true);
      setError(null);

      const response = await apiFetch(`${API_BASE}/api/billing/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_code: selectedPlan.code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Ошибка при создании платежа');
      }

      if (data.success) {
        if (selectedPlan.is_free) {
          // Бесплатный тариф - просто показываем успех
          alert(`Успешно! ${data.message}`);
          setPurchaseDialogOpen(false);
          // Перезагружаем страницу или обновляем баланс
          window.location.reload();
        } else {
          // Платный тариф - открываем виджет ЮKassa
          const confirmationToken = data.payment.confirmation_token;
          if (confirmationToken) {
            // Загружаем и открываем виджет ЮKassa
            openYookassaWidget(confirmationToken, data.payment.id);
          } else {
            throw new Error('Не получен токен подтверждения от ЮKassa');
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка при создании платежа');
    } finally {
      setPurchasing(false);
    }
  };

  const openYookassaWidget = (confirmationToken: string, paymentId: number) => {
    // Загружаем скрипт виджета ЮKassa
    const script = document.createElement('script');
    script.src = 'https://yookassa.ru/checkout-widget/v1/checkout-widget.js';
    script.async = true;
    script.onload = () => {
      // @ts-ignore
      const checkout = new window.YooMoneyCheckoutWidget({
        confirmation_token: confirmationToken,
        return_url: `${window.location.origin}/hr/billing/payment-success?payment_id=${paymentId}`,
        error_callback: (error: any) => {
          console.error('ЮKassa error:', error);
          setError('Ошибка при открытии формы оплаты');
        },
      });

      checkout.render('yookassa-widget-container');
    };
    document.body.appendChild(script);

    // Открываем диалог с виджетом
    setPurchaseDialogOpen(false);
    setShowPaymentWidget(true);
  };

  const [showPaymentWidget, setShowPaymentWidget] = useState(false);

  const renderFeatures = (features: Record<string, any>) => {
    const featuresList = [
      { key: 'ai_questions', label: 'AI генерация вопросов', icon: features?.ai_questions },
      { key: 'video_answers', label: 'Видео-ответы', icon: features?.video_answers },
      { key: 'screenings', label: 'Скрининги AI - безлимит', icon: true, highlight: true }, // Всегда бесплатно
      { key: 'regulation_tests', label: 'Тесты сотрудников - безлимит', icon: true, highlight: true }, // Всегда бесплатно
      { key: 'full_analytics', label: 'Полная аналитика', icon: features?.full_analytics || features?.basic_analytics },
      { key: 'priority_support', label: 'Приоритетная поддержка', icon: features?.priority_support },
    ];

    return (
      <List dense>
        {featuresList.map((feature) => (
          <ListItem key={feature.key} disablePadding>
            <ListItemIcon sx={{ minWidth: 32 }}>
              {feature.icon ? (
                <IconCheck size={20} color={feature.highlight ? '#4caf50' : 'green'} />
              ) : (
                <IconX size={20} color="gray" />
              )}
            </ListItemIcon>
            <ListItemText 
              primary={feature.label}
              primaryTypographyProps={{
                color: feature.icon ? 'text.primary' : 'text.disabled',
                fontWeight: feature.highlight ? 600 : 400,
              }}
            />
          </ListItem>
        ))}
      </List>
    );
  };

  if (loading) {
    return (
      <PageContainer title="Тарифы и оплата" description="Управление подпиской">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Тарифы и оплата" description="Выберите подходящий тариф">
      <DashboardCard title="Тарифные планы">
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {plans.map((plan) => (
            <Grid item xs={12} md={6} lg={3} key={plan.id}>
              <Card
                elevation={plan.is_free ? 1 : 3}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: plan.is_free ? '2px dashed #ccc' : '2px solid',
                  borderColor: plan.is_free ? 'grey.300' : 'primary.main',
                  position: 'relative',
                }}
              >
                {plan.is_free && (
                  <Chip
                    label="БЕСПЛАТНО"
                    color="success"
                    size="small"
                    sx={{ position: 'absolute', top: 16, right: 16 }}
                  />
                )}

                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" gutterBottom>
                    {plan.name}
                  </Typography>

                  {plan.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {plan.description}
                    </Typography>
                  )}

                  <Box sx={{ my: 3 }}>
                    <Typography variant="h3" component="div">
                      {plan.price.toLocaleString('ru-RU')}₽
                    </Typography>
                    {!plan.is_free && (
                      <Typography variant="caption" color="text.secondary">
                        {plan.price_per_interview}₽ за интервью
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ mb: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                    <Typography variant="h4" align="center">
                      {plan.interviews_included}
                    </Typography>
                    <Typography variant="caption" align="center" display="block">
                      интервью
                    </Typography>
                  </Box>

                  {plan.features && renderFeatures(plan.features)}
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    variant={plan.is_free ? 'outlined' : 'contained'}
                    fullWidth
                    startIcon={plan.is_free ? <IconSparkles size={20} /> : <IconCreditCard size={20} />}
                    onClick={() => {
                      setSelectedPlan(plan);
                      setPurchaseDialogOpen(true);
                    }}
                  >
                    {plan.is_free ? 'Получить бесплатно' : 'Купить'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </DashboardCard>

      {/* Диалог подтверждения покупки */}
      <Dialog open={purchaseDialogOpen} onClose={() => !purchasing && setPurchaseDialogOpen(false)}>
        <DialogTitle>Подтверждение покупки</DialogTitle>
        <DialogContent>
          {selectedPlan && (
            <Box>
              <Typography gutterBottom>
                Вы собираетесь приобрести тариф <strong>{selectedPlan.name}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Количество интервью: <strong>{selectedPlan.interviews_included}</strong>
              </Typography>
              <Typography variant="h5" sx={{ mt: 2 }}>
                К оплате: {selectedPlan.price.toLocaleString('ru-RU')}₽
              </Typography>

              {selectedPlan.is_free && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Бесплатный тариф доступен только один раз для каждой компании
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPurchaseDialogOpen(false)} disabled={purchasing}>
            Отмена
          </Button>
          <Button
            onClick={handlePurchase}
            variant="contained"
            disabled={purchasing}
            startIcon={purchasing && <CircularProgress size={20} />}
          >
            {purchasing ? 'Обработка...' : selectedPlan?.is_free ? 'Получить' : 'Перейти к оплате'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог с виджетом ЮKassa */}
      <Dialog
        open={showPaymentWidget}
        onClose={() => setShowPaymentWidget(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Оплата</DialogTitle>
        <DialogContent>
          <Box id="yookassa-widget-container" sx={{ minHeight: 400 }} />
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

