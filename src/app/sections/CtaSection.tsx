"use client";
import * as React from "react";
import { Box, Container, Typography, Button, Grid } from "@mui/material";
import { Icon } from "@iconify/react";

export default function CtaSection() {
  return (
    <Box sx={{ bgcolor: '#fff', py: { xs: 8, md: 12 }, position: 'relative', overflow: 'hidden' }}>
      {/* Декоративные элементы */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          bgcolor: 'rgba(233, 30, 99, 0.05)',
          filter: 'blur(60px)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -80,
          left: -80,
          width: 250,
          height: 250,
          borderRadius: '50%',
          bgcolor: 'rgba(33, 150, 243, 0.05)',
          filter: 'blur(60px)',
        }}
      />

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center' }}>
          {/* Hero */}
          <Typography sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' }, fontWeight: 800, lineHeight: 1.1, mb: 2 }}>
            Готовы автоматизировать найм?
          </Typography>

          <Typography sx={{ fontSize: { xs: '1.05rem', md: '1.2rem' }, color: '#666', mb: 4, maxWidth: 600, mx: 'auto' }}>
            Присоединяйтесь к HR-специалистам, которые используют AI для эффективного найма
          </Typography>

          {/* Статистика */}
          <Grid container spacing={3} justifyContent="center" sx={{ mb: 5 }}>
            <Grid item xs={12} sm={4}>
              <Box>
                <Typography sx={{ fontSize: '2.5rem', fontWeight: 800, color: '#E91E63', lineHeight: 1 }}>
                  50,000+
                </Typography>
                <Typography sx={{ fontSize: '0.9rem', color: '#666', mt: 0.5 }}>
                  Интервью проведено
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box>
                <Typography sx={{ fontSize: '2.5rem', fontWeight: 800, color: '#2196F3', lineHeight: 1 }}>
                  75,000+
                </Typography>
                <Typography sx={{ fontSize: '0.9rem', color: '#666', mt: 0.5 }}>
                  Кандидатов оценено
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box>
                <Typography sx={{ fontSize: '2.5rem', fontWeight: 800, color: '#4CAF50', lineHeight: 1 }}>
                  95%
                </Typography>
                <Typography sx={{ fontSize: '0.9rem', color: '#666', mt: 0.5 }}>
                  Довольных клиентов
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* CTA Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 4 }}>
            <Button
              variant="contained"
              size="large"
              href="/auth/register"
              sx={{
                bgcolor: '#E91E63',
                px: 5,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 700,
                borderRadius: 2,
                textTransform: 'none',
                boxShadow: '0 8px 24px rgba(233, 30, 99, 0.3)',
                '&:hover': {
                  bgcolor: '#C2185B',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 32px rgba(233, 30, 99, 0.4)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Начать бесплатно
            </Button>

            <Button
              variant="outlined"
              size="large"
              href="/auth/login"
              sx={{
                borderColor: '#E91E63',
                color: '#E91E63',
                px: 5,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 700,
                borderRadius: 2,
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#E91E63',
                  bgcolor: 'rgba(233, 30, 99, 0.05)',
                },
              }}
            >
              Войти
            </Button>
          </Box>

          {/* Преимущества */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, justifyContent: 'center', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Icon icon="mdi:check-circle" color="#4CAF50" width={20} height={20} />
              <Typography sx={{ fontSize: '0.9rem', color: '#666' }}>
                10 интервью бесплатно
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Icon icon="mdi:check-circle" color="#4CAF50" width={20} height={20} />
              <Typography sx={{ fontSize: '0.9rem', color: '#666' }}>
                Без кредитной карты
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Icon icon="mdi:check-circle" color="#4CAF50" width={20} height={20} />
              <Typography sx={{ fontSize: '0.9rem', color: '#666' }}>
                Настройка за 5 минут
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

