"use client";
import * as React from "react";
import { Box, Container, Typography, Button } from "@mui/material";
import { Icon } from "@iconify/react";

export default function ComparisonSection() {
  return (
    <Box sx={{ bgcolor: '#fafafa', py: { xs: 6, md: 10 }, position: 'relative', overflow: 'hidden' }}>
      <Container maxWidth="lg">
        {/* Заголовок */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#4CAF50' }} />
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#999' }}>
              Честная модель оплаты
            </Typography>
          </Box>
          <Typography sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 800, lineHeight: 1.1, mb: 2 }}>
            Платите только за <Box component="span" sx={{ color: '#4CAF50' }}>результат</Box>
          </Typography>
          <Typography sx={{ fontSize: { xs: '0.95rem', md: '1.05rem' }, color: '#666', maxWidth: 800, mx: 'auto', mb: 1 }}>
            Сценарий: вы отправили 100 приглашений откликнувшимся из HeadHunter
          </Typography>
          <Typography sx={{ fontSize: { xs: '0.85rem', md: '0.95rem' }, color: '#999', maxWidth: 700, mx: 'auto' }}>
            35 кандидатов откликнулись, 25 проходят интервью
          </Typography>
        </Box>

        {/* Сравнение */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, alignItems: 'stretch' }}>
          
          {/* ЛЕВАЯ СТОРОНА - КОНКУРЕНТЫ (черно-белая, грустная) */}
          <Box sx={{ 
            flex: 1,
            position: 'relative',
            filter: 'grayscale(100%)',
            opacity: 0.7,
            transition: 'all 0.3s ease',
            '&:hover': {
              opacity: 0.85,
            }
          }}>
            <Box sx={{
              bgcolor: '#f5f5f5',
              border: '2px solid #e0e0e0',
              borderRadius: 3,
              p: 4,
              height: '100%',
              position: 'relative',
            }}>
              {/* Стикер "Типичный конкурент" */}
              <Box sx={{
                position: 'absolute',
                top: -12,
                left: 20,
                bgcolor: '#9e9e9e',
                color: '#fff',
                px: 2,
                py: 0.5,
                borderRadius: 10,
                fontSize: '0.75rem',
                fontWeight: 700,
              }}>
                😰 Типичный конкурент
              </Box>

              <Typography sx={{ fontSize: '1.3rem', fontWeight: 700, mb: 3, color: '#666', textAlign: 'center' }}>
                Оплата за приглашения
              </Typography>

              {/* Схема */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box sx={{ 
                    width: 60, 
                    height: 60, 
                    borderRadius: '50%', 
                    bgcolor: '#bdbdbd', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '1.5rem'
                  }}>
                    📧
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#666' }}>100 приглашений</Typography>
                    <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, color: '#d32f2f' }}>10,000₽</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, opacity: 0.5 }}>
                  <Box sx={{ 
                    width: 60, 
                    height: 60, 
                    borderRadius: '50%', 
                    bgcolor: '#e0e0e0', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '1.5rem'
                  }}>
                    👤
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#999' }}>35 откликнулись</Typography>
                    <Typography sx={{ fontSize: '0.85rem', color: '#999' }}>но вы уже заплатили</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, opacity: 0.5 }}>
                  <Box sx={{ 
                    width: 60, 
                    height: 60, 
                    borderRadius: '50%', 
                    bgcolor: '#f5f5f5', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '1.5rem'
                  }}>
                    ✅
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#999' }}>25 проходят интервью</Typography>
                    <Typography sx={{ fontSize: '0.85rem', color: '#999' }}>но вы уже заплатили</Typography>
                  </Box>
                </Box>
              </Box>

              {/* Итого */}
              <Box sx={{ 
                bgcolor: '#e0e0e0', 
                p: 2.5, 
                borderRadius: 2, 
                textAlign: 'center',
                border: '2px solid #d32f2f'
              }}>
                <Typography sx={{ fontSize: '0.75rem', color: '#666', mb: 0.5, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Итого за 25 интервью
                </Typography>
                <Typography sx={{ fontSize: '2.5rem', fontWeight: 900, color: '#d32f2f', lineHeight: 1 }}>
                  10,000₽
                </Typography>
                <Typography sx={{ fontSize: '0.85rem', color: '#999', mt: 1 }}>
                  + переплата за 75 неактивных кандидатов
                </Typography>
              </Box>

              {/* Минусы */}
              <Box sx={{ mt: 3 }}>
                {[
                  'Платите за всех приглашенных',
                  'Нет контроля расходов',
                  'Только интервью, без доп. функций',
                ].map((text, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Icon icon="mdi:close-circle" width={20} height={20} color="#d32f2f" />
                    <Typography sx={{ fontSize: '0.85rem', color: '#666' }}>{text}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {/* ЦЕНТР - VS */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            minWidth: { xs: 'auto', md: 80 },
            my: { xs: 2, md: 0 }
          }}>
            <Box sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              bgcolor: '#E91E63',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(233, 30, 99, 0.3)',
              '@keyframes pulse': {
                '0%, 100%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.1)' },
              },
              animation: 'pulse 2s ease-in-out infinite',
            }}>
              <Typography sx={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff' }}>VS</Typography>
            </Box>
          </Box>

          {/* ПРАВАЯ СТОРОНА - SOFIHR (яркая, красочная, счастливая) */}
          <Box sx={{ 
            flex: 1,
            position: 'relative',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
            }
          }}>
            <Box sx={{
              background: 'linear-gradient(135deg, #E3F2FD 0%, #F3E5F5 50%, #FFF9C4 100%)',
              border: '3px solid',
              borderColor: '#4CAF50',
              borderRadius: 3,
              p: 4,
              height: '100%',
              position: 'relative',
              boxShadow: '0 8px 32px rgba(76, 175, 80, 0.2)',
            }}>
              {/* Стикер "SofiHR" */}
              <Box sx={{
                position: 'absolute',
                top: -12,
                left: 20,
                background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
                color: '#fff',
                px: 2,
                py: 0.5,
                borderRadius: 10,
                fontSize: '0.75rem',
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
              }}>
                🎉 SofiHR — выгодно
              </Box>

              <Typography sx={{ fontSize: '1.3rem', fontWeight: 700, mb: 3, color: '#1a1a1a', textAlign: 'center' }}>
                Оплата за результат
              </Typography>

              {/* Схема */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, opacity: 0.5 }}>
                  <Box sx={{ 
                    width: 60, 
                    height: 60, 
                    borderRadius: '50%', 
                    bgcolor: 'rgba(158, 158, 158, 0.2)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '1.5rem'
                  }}>
                    📧
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#666' }}>100 приглашений</Typography>
                    <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#4CAF50' }}>0₽ — бесплатно!</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, opacity: 0.5 }}>
                  <Box sx={{ 
                    width: 60, 
                    height: 60, 
                    borderRadius: '50%', 
                    bgcolor: 'rgba(33, 150, 243, 0.2)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '1.5rem'
                  }}>
                    👤
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#666' }}>35 откликнулись</Typography>
                    <Typography sx={{ fontSize: '0.85rem', color: '#666' }}>не платите за них</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    width: 60, 
                    height: 60, 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                  }}>
                    ✅
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#1a1a1a' }}>25 проходят интервью</Typography>
                    <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, color: '#4CAF50' }}>2,500₽</Typography>
                  </Box>
                </Box>
              </Box>

              {/* Итого */}
              <Box sx={{ 
                background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
                p: 2.5, 
                borderRadius: 2, 
                textAlign: 'center',
                boxShadow: '0 4px 16px rgba(76, 175, 80, 0.3)',
              }}>
                <Typography sx={{ fontSize: '0.75rem', color: '#fff', mb: 0.5, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.9 }}>
                  Итого за 25 интервью
                </Typography>
                <Typography sx={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                  2,500₽
                </Typography>
                <Typography sx={{ fontSize: '0.85rem', color: '#fff', mt: 1, opacity: 0.9 }}>
                  = 100₽ за каждое проходящее интервью
                </Typography>
              </Box>

              {/* Плюсы */}
              <Box sx={{ mt: 3 }}>
                {[
                  'Платите только за результат',
                  'Полный контроль расходов',
                  'Полный функционал: Канбан, аналитика, тесты',
                ].map((text, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Icon icon="mdi:check-circle" width={20} height={20} color="#4CAF50" />
                    <Typography sx={{ fontSize: '0.85rem', color: '#1a1a1a', fontWeight: 500 }}>{text}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Дополнительное преимущество */}
        <Box sx={{ 
          mt: 6, 
          p: 4, 
          background: 'linear-gradient(135deg, #4CAF50 10%, #66BB6A 100%)',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(76, 175, 80, 0.3)',
        }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, alignItems: 'center' }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ 
                display: 'inline-block',
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                px: 2,
                py: 0.5,
                borderRadius: 10,
                mb: 2,
              }}>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', letterSpacing: 1 }}>
                  ⚡ ЭКОНОМИЯ В 4 РАЗА
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, mb: 1, color: '#fff' }}>
                10,000₽ vs 2,500₽
              </Typography>
              <Typography sx={{ fontSize: '1rem', color: '#fff', lineHeight: 1.7, opacity: 0.95 }}>
                Не переплачивайте за кандидатов, которые не дошли до интервью. Платите только за реальные результаты — проходящие интервью с оценкой от ИИ.
              </Typography>
            </Box>
            <Button
              variant="contained"
              href="/auth/register"
              sx={{
                bgcolor: '#fff',
                color: '#4CAF50',
                px: 4,
                py: 1.8,
                fontSize: '1.1rem',
                fontWeight: 700,
                borderRadius: 2,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(255, 255, 255, 0.3)',
                whiteSpace: 'nowrap',
                '&:hover': {
                  bgcolor: '#f1f1f1',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(255, 255, 255, 0.4)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              Начать экономить →
            </Button>
          </Box>
        </Box>

      </Container>
    </Box>
  );
}

