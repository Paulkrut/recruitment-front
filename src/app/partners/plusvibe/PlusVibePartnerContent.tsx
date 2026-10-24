"use client";
import * as React from "react";
import { Box, Container, Typography, Button, Grid } from "@mui/material";
import { Icon } from "@iconify/react";
import Link from "next/link";
import SofiHRLogo from "@/components/shared/SofiHRLogo";
import FooterSection from "@/app/sections/FooterSection";

export default function PlusVibePartnerContent() {
  return (
    <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh' }}>
      {/* Шапка */}
      <AppBar />

      {/* Hero */}
      <Box sx={{ bgcolor: '#fff', py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#2196F3' }} />
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#999' }}>
                Технологическое партнёрство · 2026
              </Typography>
            </Box>

            <Typography sx={{ fontSize: { xs: '2rem', md: '2.75rem' }, fontWeight: 800, lineHeight: 1.15, mb: 2 }}>
              PlusVibe — технологический <Box component="span" sx={{ color: '#2196F3' }}>партнёр SofiHR</Box>
            </Typography>

            <Typography sx={{ fontSize: { xs: '1rem', md: '1.15rem' }, color: '#666', maxWidth: 760, mx: 'auto', lineHeight: 1.7 }}>
              Сильный продукт начинается с сильных партнёров. Благодарим команду PlusVibe за поддержку,
              которая помогла SofiHR сделать важный шаг в развитии и качестве алгоритмов оценки кандидатов.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* История партнёрства */}
      <Box sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <SectionTitle
            kicker="История партнёрства"
            title={<>SofiHR создаётся, чтобы найм стал <Accent>точнее и быстрее</Accent></>}
          />
          <Box sx={{ maxWidth: 760, mx: 'auto' }}>
            <Paragraph>
              SofiHR — платформа AI-рекрутинга: система проводит интервью с кандидатами, оценивает ответы,
              замечает тревожные сигналы и помогает HR принимать решения быстрее. В основе такой системы —
              не только удобный интерфейс, но и алгоритмы, которым можно доверять: оценка кандидата должна
              быть точной, стабильной и предсказуемой в самых разных сценариях.
            </Paragraph>
            <Paragraph>
              Прежде чем доверить алгоритмам живые интервью, их нужно серьёзно проверить. Не десятком
              примеров, а масштабной серией тестов: тысячи ситуаций, пограничные случаи, сравнение поведения
              модели на однотипных ответах. Такая работа требует значительных вычислительных ресурсов —
              и делать её «на коленке» нельзя.
            </Paragraph>
          </Box>

          {/* Три карточки */}
          <Grid container spacing={4} sx={{ mt: 4 }}>
            {[
              {
                icon: 'mdi:database',
                color: '#2196F3',
                title: 'Большой массив тестов',
                text: 'Точность алгоритмов проверяется системной серией испытаний, а не выборочными примерами.',
              },
              {
                icon: 'mdi:tune-vertical',
                color: '#9C27B0',
                title: 'Глубокая проверка',
                text: 'Важен каждый крайний случай: однотипные ответы, спорные формулировки, пограничные оценки.',
              },
              {
                icon: 'mdi:target',
                color: '#4CAF50',
                title: 'Практическая польза',
                text: 'Результат тестов — это уверенность HR в том, что оценка кандидата обоснованна.',
              },
            ].map((card) => (
              <Grid item xs={12} md={4} key={card.title}>
                <Box
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    border: `2px solid ${card.color}30`,
                    bgcolor: '#fff',
                    p: 4,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: `0 12px 32px ${card.color}30`,
                      borderColor: card.color,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      bgcolor: `${card.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                    }}
                  >
                    <Icon icon={card.icon} width={28} height={28} color={card.color} />
                  </Box>
                  <Typography sx={{ fontSize: '1.15rem', fontWeight: 700, mb: 1, color: card.color }}>
                    {card.title}
                  </Typography>
                  <Typography sx={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.6 }}>
                    {card.text}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Вклад партнёра */}
      <Box sx={{ bgcolor: '#fff', py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <SectionTitle
            kicker="Вклад партнёра"
            title={<>PlusVibe предоставил <Accent>вычислительные мощности</Accent></>}
          />
          <Box sx={{ maxWidth: 760, mx: 'auto' }}>
            <Paragraph>
              На этапе активной доводки алгоритмов команду SofiHR поддержала компания PlusVibe —
              российский провайдер AI-инфраструктуры с собственными GPU-серверами на территории РФ.
              Партнёр предоставил вычислительные мощности, которые позволили провести масштабное
              тестирование наших алгоритмов и не откладывать развитие продукта.
            </Paragraph>
            <Paragraph>
              Для нас это не формальная строка в списке партнёров. Это возможность проверить важные
              технологические гипотезы в нужном масштабе, ускорить доводку алгоритмов и уделить больше
              внимания качеству продукта. Благодаря такой помощи тесты шли на полном объёме данных —
              так, как они того заслуживают.
            </Paragraph>
          </Box>

          <Box
            sx={{
              maxWidth: 760,
              mx: 'auto',
              mt: 5,
              p: 4,
              borderRadius: 3,
              bgcolor: '#f8fafc',
              borderLeft: `4px solid #2196F3`,
            }}
          >
            <Typography sx={{ fontSize: { xs: '1.05rem', md: '1.2rem' }, fontWeight: 600, lineHeight: 1.6, color: '#1a1a1a' }}>
              «Когда партнёр помогает ресурсом в самый сложный момент, технологическая идея получает
              шанс стать работающим продуктом».
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Почему это важно для пользователей */}
      <Box sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <SectionTitle
            kicker="Польза для пользователей"
            title={<>Почему это важно для <Accent>пользователей SofiHR</Accent></>}
          />
          <Box sx={{ maxWidth: 760, mx: 'auto' }}>
            <Paragraph>
              Качественный AI-продукт строится не на громких обещаниях, а на проверенных алгоритмах.
              Чем масштабнее и тщательнее тестирование, тем увереннее система оценивает ответы кандидатов
              и тем меньше сомнений у HR при принятии решения.
            </Paragraph>
          </Box>

          <Box sx={{ maxWidth: 760, mx: 'auto', mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              'Точнее оценка кандидатов — алгоритмы проверены на тысячах реалистичных сценариев',
              'Стабильные результаты — система одинаково справедлива к разным типам ответов',
              'Быстрее развитие продукта — тестирование не тормозит выпуск улучшений',
              'Соответствие требованиям — инфраструктура партнёра размещена в России',
            ].map((item) => (
              <Box key={item} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Icon icon="mdi:check-circle" width={20} height={20} color="#4CAF50" style={{ marginTop: 2, flexShrink: 0 }} />
                <Typography sx={{ fontSize: '0.95rem', color: '#444', lineHeight: 1.6 }}>
                  {item}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Спасибо + CTA */}
      <Box sx={{ bgcolor: '#fff', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', maxWidth: 760, mx: 'auto' }}>
            <SectionTitle
              kicker="Спасибо за доверие"
              title={<>Благодарим команду <Accent>PlusVibe</Accent></>}
            />
            <Paragraph>
              Мы искренне благодарны команде PlusVibe за участие, доверие к идее SofiHR и предоставленные
              возможности. Для молодой технологической компании такая поддержка особенно ценна: она помогает
              пройти сложный этап, сосредоточиться на качестве и быстрее двигаться к цели — создать один из
              самых полезных сервисов для найма.
            </Paragraph>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                href="/auth/register"
                sx={{ bgcolor: '#2196F3', px: 4, py: 1.5, fontSize: '1rem', fontWeight: 600, borderRadius: 2, textTransform: 'none', '&:hover': { bgcolor: '#1976D2' } }}
              >
                Попробовать SofiHR
              </Button>
              <Button
                variant="outlined"
                component={Link}
                href="/"
                sx={{ borderColor: '#e5e5e5', color: '#666', px: 4, py: 1.5, fontSize: '1rem', fontWeight: 600, borderRadius: 2, textTransform: 'none', '&:hover': { borderColor: '#1a1a1a', color: '#1a1a1a' } }}
              >
                На главную
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      <FooterSection />
    </Box>
  );
}

function AppBar() {
  return (
    <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #e5e5e5', py: 1.5 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <SofiHRLogo width={120} height={35} href="/" priority />
          <Button
            variant="outlined"
            href="/auth/register"
            size="small"
            sx={{ borderColor: '#e5e5e5', color: '#666', textTransform: 'none', fontWeight: 600, fontSize: '0.85rem', '&:hover': { borderColor: '#1a1a1a', color: '#1a1a1a' } }}
          >
            Регистрация
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

function SectionTitle({ kicker, title }: { kicker: string; title: React.ReactNode }) {
  return (
    <Box sx={{ textAlign: 'center', mb: 4 }}>
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#2196F3' }} />
        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#999' }}>
          {kicker}
        </Typography>
      </Box>
      <Typography sx={{ fontSize: { xs: '1.6rem', md: '2.1rem' }, fontWeight: 800, lineHeight: 1.2 }}>
        {title}
      </Typography>
    </Box>
  );
}

function Accent({ children }: { children: React.ReactNode }) {
  return <Box component="span" sx={{ color: '#2196F3' }}>{children}</Box>;
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return (
    <Typography sx={{ fontSize: { xs: '0.95rem', md: '1.05rem' }, color: '#555', lineHeight: 1.8, mb: 2.5 }}>
      {children}
    </Typography>
  );
}