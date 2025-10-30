"use client";
import React from 'react';
import { Box, Container, Typography, Grid, Button, Paper } from '@mui/material';
import { Icon } from '@iconify/react';

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  interviewCount: string;
  pricePerInterview: string;
  discount?: string;
  color: string;
  popular?: boolean;
  features: string[];
  targetAudience: string;
}

interface PricingSectionProps {
  plans: PricingPlan[];
}

const PricingSection: React.FC<PricingSectionProps> = ({ plans }) => {
  return (
    <Box id="pricing-section" sx={{ py: 12, bgcolor: 'white', position: 'relative', zIndex: 2, scrollMarginTop: '80px' }}>
      <Container maxWidth="lg">
        {/* Заголовок */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            fontWeight={800}
            sx={{
              background: 'linear-gradient(45deg, #2196F3, #9C27B0)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}
          >
            Выберите подходящий тариф
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Гибкие планы для компаний любого размера. Начните с бесплатного пробного периода
          </Typography>
        </Box>

        {/* Тарифные планы */}
        <Grid container spacing={4} justifyContent="center">
          {plans.map((plan) => (
            <Grid item xs={12} md={3} key={plan.id}>
              <Box
                sx={{
                  bgcolor: 'white',
                  p: 4,
                  borderRadius: 4,
                  border: plan.popular ? `2px solid ${plan.color}` : '2px solid #e0e0e0',
                  position: 'relative',
                  transform: plan.popular ? 'scale(1.05)' : 'scale(1)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Бейдж для пробного / популярного */}
                {(plan.id === 'trial' || plan.popular) && (
                  <Box sx={{
                    position: 'absolute',
                    top: -12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bgcolor: plan.id === 'trial' ? '#4CAF50' : '#FF9800',
                    color: 'white',
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    whiteSpace: 'nowrap'
                  }}>
                    {plan.id === 'trial' ? '🎁 Бесплатно' : '⭐ Популярный'}
                  </Box>
                )}

                <Box sx={{ textAlign: 'center', mb: 3, flexGrow: 0 }}>
                  <Typography variant="h5" fontWeight={700} mb={2}>{plan.name}</Typography>
                  <Typography variant="h3" fontWeight={800} color={plan.color} mb={1}>
                    {plan.price}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    {plan.interviewCount}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ 
                      bgcolor: `${plan.color}10`, 
                      px: 2, 
                      py: 0.5, 
                      borderRadius: 1, 
                      display: 'inline-block',
                      mb: 2
                    }}
                  >
                    {plan.discount ? `${plan.pricePerInterview} • ${plan.discount}` : plan.pricePerInterview}
                  </Typography>
                  
                  {/* Целевая аудитория */}
                  <Box sx={{ 
                    bgcolor: `${plan.color}05`, 
                    p: 2, 
                    borderRadius: 2,
                    border: `1px dashed ${plan.color}40`,
                    mt: 2
                  }}>
                    <Typography variant="caption" color={plan.color} fontWeight={600} display="block" mb={0.5}>
                      💼 Для кого:
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {plan.targetAudience}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 4, flexGrow: 1 }}>
                  {plan.features.map((feature, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Icon icon="mdi:check-circle" color={plan.color} width={20} height={20} />
                      <Typography variant="body2" sx={{ ml: 2 }}>{feature}</Typography>
                    </Box>
                  ))}
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  href="/auth/register"
                  sx={{
                    py: 1.5,
                    fontWeight: 600,
                    bgcolor: plan.color,
                    '&:hover': {
                      bgcolor: plan.color,
                      filter: 'brightness(0.9)'
                    }
                  }}
                >
                  {plan.id === 'trial' ? 'Попробовать' : 'Выбрать тариф'}
                </Button>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Дополнительная информация */}
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="h6" fontWeight={600} mb={3}>
            Все планы включают
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <Icon icon="mdi:shield-check" color="#4caf50" width={24} height={24} />
                <Typography variant="body2">Безопасность данных</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <Icon icon="mdi:headphones" color="#2196F3" width={24} height={24} />
                <Typography variant="body2">Техподдержка 24/7</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <Icon icon="mdi:update" color="#FF9800" width={24} height={24} />
                <Typography variant="body2">Регулярные обновления</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <Icon icon="mdi:school" color="#9C27B0" width={24} height={24} />
                <Typography variant="body2">Обучение команды</Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default PricingSection;

