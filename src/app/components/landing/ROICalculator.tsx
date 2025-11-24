"use client";
import React, { useMemo, useState } from 'react';
import { Box, Container, Typography, Paper, Slider, Grid, Alert } from '@mui/material';

import { useLingui } from '@lingui/react';
import { msg, Trans } from '@lingui/macro';



interface PricingPlan {
  id: string;
  name: string;
  price: string;
  interviewCount: string;
  pricePerInterview: string;
  color: string;
}

interface ROICalculatorProps {
  plans: PricingPlan[];
}

const ROICalculator: React.FC<ROICalculatorProps> = ({ plans }) => {
  const { _ } = useLingui();

  const [hiresPerMonth, setHiresPerMonth] = useState(10);

  // Оптимальный тариф с мемоизацией
  const optimalPlan = useMemo(() => {
    return hiresPerMonth <= 10 ? plans[1] :
           hiresPerMonth <= 40 ? plans[2] :
           plans[3];
  }, [hiresPerMonth, plans]);

  // Расчёт экономии с мемоизацией
  const savings = useMemo(() => {
    // Реалистичные затраты на традиционный найм
    const traditionalCostPerHire = 25000; // Средняя стоимость найма: объявления, агентства, проверки
    const traditionalTime = 10; // Среднее время HR-специалиста на одного кандидата (часов)
    const hrHourlyCost = 1500; // Стоимость часа работы HR-специалиста

    const totalTraditionalCost = hiresPerMonth * traditionalCostPerHire;
    const totalTraditionalTime = hiresPerMonth * traditionalTime;
    const totalTraditionalTimeCost = totalTraditionalTime * hrHourlyCost;

    let platformPrice = 0;
    if (typeof optimalPlan.price === 'string') {
      if (optimalPlan.price === _(msg`Бесплатно`)) {
        platformPrice = 0;
      } else {
        const numericValue = optimalPlan.price.replace(/[^\d]/g, '');
        platformPrice = parseInt(numericValue, 10) || 0;
      }
    }

    const timeSaved = Math.round(totalTraditionalTime * 0.7);
    const timeSavedCost = Math.round(timeSaved * hrHourlyCost);

    const totalSavings = Math.round(totalTraditionalCost + totalTraditionalTimeCost - platformPrice);
    const roi = platformPrice > 0 ? Math.round((totalSavings / platformPrice) * 100) : 0;

    return {
      traditionalCost: totalTraditionalCost,
      traditionalTime: totalTraditionalTime,
      traditionalTimeCost: totalTraditionalTimeCost,
      platformPrice,
      timeSaved,
      timeSavedCost,
      totalSavings,
      roi
    };
  }, [optimalPlan, hiresPerMonth]);

  return (
    <Box sx={{ py: 12, bgcolor: '#f8fafc', position: 'relative', zIndex: 2 }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h2"
            fontWeight={800}
            sx={{
              background: 'linear-gradient(45deg, #4CAF50, #2196F3)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}
          ><Trans>💰 Рассчитайте вашу экономию</Trans></Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}><Trans>Узнайте, сколько вы сэкономите на автоматизации найма с SofiHR</Trans></Typography>
        </Box>

        <Paper sx={{ p: 4, borderRadius: 4, maxWidth: 900, mx: 'auto' }}>
          <Typography variant="h6" mb={3} textAlign="center"><Trans>Сколько сотрудников вы планируете нанять в месяц?</Trans></Typography>
          <Slider
            value={hiresPerMonth}
            onChange={(e, value) => setHiresPerMonth(value as number)}
            min={1}
            max={50}
            marks={[
              { value: 1, label: '1' },
              { value: 10, label: '10' },
              { value: 25, label: '25' },
              { value: 50, label: '50' }
            ]}
            valueLabelDisplay="on"
            sx={{
              color: '#2196F3',
              mb: 6,
              '& .MuiSlider-valueLabel': {
                bgcolor: '#2196F3'
              }
            }}
          />

          <Typography variant="body1" color="text.secondary" textAlign="center" mb={4}><Trans>
            Рекомендуемый тариф: <strong style={{ color: optimalPlan.color }}>{optimalPlan.name}</strong>
          </Trans></Typography>

          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, bgcolor: '#fff3e0', border: '2px solid #ff9800', height: '100%' }}>
                <Typography variant="body2" color="text.secondary" mb={1}><Trans>Традиционный метод найма</Trans></Typography>
                <Typography variant="h5" fontWeight={600} color="#ff9800" mb={0.5}>
                  {savings.traditionalCost.toLocaleString()}₽
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={1}><Trans>
                  + {savings.traditionalTime} часов ({savings.traditionalTimeCost.toLocaleString()}₽)
                </Trans></Typography>
                <Box sx={{ borderTop: '1px solid #ff9800', pt: 1, mt: 1 }}>
                  <Typography variant="h4" fontWeight={700} color="#ff9800">
                    {(savings.traditionalCost + savings.traditionalTimeCost).toLocaleString()}₽
                  </Typography>
                  <Typography variant="caption" color="text.secondary"><Trans>Полная стоимость</Trans></Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" display="block" mt={2}><Trans>Средняя стоимость: 25,000₽ на кандидата + 10 часов работы HR @ 1,500₽/час</Trans></Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, bgcolor: `${optimalPlan.color}10`, border: `2px solid ${optimalPlan.color}`, height: '100%' }}>
                <Typography variant="body2" color="text.secondary" mb={1}><Trans>
                  С SofiHR ({optimalPlan.name})
                </Trans></Typography>
                <Typography variant="h4" fontWeight={700} color={optimalPlan.color} mb={2}>
                  {savings.platformPrice.toLocaleString()}₽
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <Trans>Экономия {savings.timeSaved} часов ({savings.timeSavedCost.toLocaleString()}₽)
                </Trans></Typography>
                <Typography variant="caption" color="text.secondary" display="block" mt={2}>
                  {optimalPlan.interviewCount} • {optimalPlan.pricePerInterview}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Paper sx={{ p: 4, bgcolor: '#e8f5e9', border: '2px solid #4caf50', textAlign: 'center' }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="h4" fontWeight={700} color="#4caf50" mb={1}>
                  💰 {savings.totalSavings.toLocaleString()}₽
                </Typography>
                <Typography variant="body1" color="text.secondary" fontWeight={600}><Trans>Ваша экономия в месяц</Trans></Typography>
                <Typography variant="caption" color="text.secondary"><Trans>
                  При {hiresPerMonth} {_(msg`наймах`)}
                </Trans></Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h4" fontWeight={700} color="#4caf50" mb={1}>
                  📈 {savings.roi}%
                </Typography>
                <Typography variant="body1" color="text.secondary" fontWeight={600}><Trans>ROI (окупаемость)</Trans></Typography>
                <Typography variant="caption" color="text.secondary"><Trans>Возврат инвестиций</Trans></Typography>
              </Grid>
            </Grid>
          </Paper>

          <Alert severity="success" sx={{ mt: 3 }}>
            <Typography variant="body2" fontWeight={600} mb={1}><Trans>🎯 Почему SofiHR выгоднее традиционного найма?</Trans></Typography>
            <Typography variant="body2">
              • <strong><Trans>Автоматизация</Trans></strong> — экономия до 70% времени HR-специалистов<br/><Trans>
              • <strong>ИИ-анализ</strong> — снижение ошибок при найме на 60%</Trans><br/>
              • <strong><Trans>Масштабируемость</Trans></strong> — обрабатывайте в 10 раз больше кандидатов<br/>
              • <strong><Trans>Единая платформа</Trans></strong> — не нужно несколько дорогих инструментов
            </Typography>
          </Alert>
        </Paper>
      </Container>
    </Box>
  );
};

export default ROICalculator;

