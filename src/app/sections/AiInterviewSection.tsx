"use client";
import * as React from "react";
import { Box, Container, Typography, Button, Chip } from "@mui/material";
import { Icon } from "@iconify/react";

export default function AiInterviewSection() {
  const [activeFeature, setActiveFeature] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 6);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const features = [
    { 
      icon: 'mdi:lightbulb-on', 
      title: 'Генерация вопросов', 
      desc: 'ИИ создаёт релевантные вопросы за 1 клик',
      color: '#2196F3',
      stat: '< 30 сек'
    },
    { 
      icon: 'mdi:video', 
      title: 'Видео-интервью', 
      desc: 'Кандидат отвечает голосом в своё время',
      color: '#4CAF50',
      stat: '24/7'
    },
    { 
      icon: 'mdi:brain', 
      title: 'AI-анализ', 
      desc: 'Автоматическая оценка и транскрипция',
      color: '#FF9800',
      stat: '95% точность'
    },
    { 
      icon: 'mdi:chart-line', 
      title: 'Ранжирование', 
      desc: 'Сортировка по релевантности',
      color: '#9C27B0',
      stat: 'Авто'
    },
    { 
      icon: 'mdi:compare', 
      title: 'Сравнение', 
      desc: 'Side-by-side кандидатов с экспортом',
      color: '#E91E63',
      stat: 'До 10'
    },
    { 
      icon: 'mdi:file-document', 
      title: 'Отчёты', 
      desc: 'Детальная аналитика по каждому',
      color: '#00BCD4',
      stat: 'PDF/Excel'
    },
  ];

  const processSteps = [
    { label: 'Описание вакансии', icon: 'mdi:file-edit' },
    { label: 'AI генерирует вопросы', icon: 'mdi:robot' },
    { label: 'Отправка ссылки', icon: 'mdi:send' },
    { label: 'Кандидат проходит', icon: 'mdi:account-voice' },
    { label: 'AI анализирует', icon: 'mdi:brain' },
    { label: 'Готовый отчёт', icon: 'mdi:check-circle' },
  ];

  return (
    <Box sx={{ bgcolor: '#fafafa', py: { xs: 6, md: 8 } }}>
      <Container maxWidth="lg">

        {/* Hero */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#2196F3' }} />
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#999' }}>
              Ядро платформы
            </Typography>
          </Box>

          <Typography sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 800, lineHeight: 1.1, mb: 1.5 }}>
            AI-интервью: <Box component="span" sx={{ color: '#2196F3' }}>автопилот найма</Box>
          </Typography>

          <Typography sx={{ fontSize: { xs: '0.95rem', md: '1.05rem' }, color: '#666', maxWidth: 580, mb: 2 }}>
            ИИ сам генерирует вопросы, проводит интервью, анализирует ответы и ранжирует кандидатов. Вы получаете готовые отчёты.
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Chip
              icon={<Icon icon="mdi:robot" width={14} height={14} />}
              label="Полностью автоматизировано"
              size="small"
              sx={{
                bgcolor: 'rgba(33, 150, 243, 0.1)',
                color: '#2196F3',
                fontWeight: 600,
                fontSize: '0.75rem',
                border: '1px solid rgba(33, 150, 243, 0.2)'
              }}
            />
            <Chip
              icon={<Icon icon="mdi:clock-fast" width={14} height={14} />}
              label="Экономия 5+ часов/день"
              size="small"
              sx={{
                bgcolor: 'rgba(76, 175, 80, 0.1)',
                color: '#4CAF50',
                fontWeight: 600,
                fontSize: '0.75rem',
                border: '1px solid rgba(76, 175, 80, 0.2)'
              }}
            />
          </Box>
        </Box>

        {/* Главный контент - 2 колонки */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4, mb: 5 }}>

          {/* Левая колонка */}
          <Box>
            {/* Как это работает - процесс */}
            <Box sx={{ mb: 4 }}>
              <Typography sx={{ fontSize: '0.65rem', color: '#aaa', letterSpacing: 1.5, textTransform: 'uppercase', mb: 2 }}>
                Как это работает
              </Typography>
              <Box sx={{ bgcolor: '#fafafa', border: '1px solid #e5e5e5', borderRadius: 1.5, p: 2.5 }}>
                {processSteps.map((step, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      mb: index < processSteps.length - 1 ? 2 : 0,
                      pb: index < processSteps.length - 1 ? 2 : 0,
                      borderBottom: index < processSteps.length - 1 ? '1px dashed #e5e5e5' : 'none'
                    }}
                  >
                    <Box sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: index <= 2 ? 'rgba(33, 150, 243, 0.1)' : 'rgba(76, 175, 80, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Icon icon={step.icon} width={16} height={16} color={index <= 2 ? '#2196F3' : '#4CAF50'} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: '0.75rem', color: '#999', mb: 0.3 }}>
                        Шаг {index + 1}
                      </Typography>
                      <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#1a1a1a' }}>
                        {step.label}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Статистика */}
            <Box sx={{ bgcolor: '#fafafa', border: '1px solid #e5e5e5', borderRadius: 1.5, p: 2.5 }}>
              <Typography sx={{ fontSize: '0.65rem', color: '#aaa', letterSpacing: 1.5, textTransform: 'uppercase', mb: 2 }}>
                Результаты
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                {[
                  { value: '8,500+', label: 'Интервью', color: '#2196F3' },
                  { value: '40%', label: 'Качество найма ↑', color: '#4CAF50' },
                  { value: '17x', label: 'Быстрее найм', color: '#FF9800' },
                  { value: '24/7', label: 'Работает всегда', color: '#9C27B0' },
                ].map((stat, i) => (
                  <Box key={i} sx={{ textAlign: 'center', p: 1.5, bgcolor: '#fff', borderRadius: 1 }}>
                    <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: stat.color, lineHeight: 1 }}>
                      {stat.value}
                    </Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: '#888', mt: 0.5 }}>{stat.label}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {/* Правая колонка */}
          <Box>
            {/* Основные возможности - интерактивные карточки */}
            <Box sx={{ mb: 4 }}>
              <Typography sx={{ fontSize: '0.65rem', color: '#aaa', letterSpacing: 1.5, textTransform: 'uppercase', mb: 2 }}>
                Возможности
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                {features.map((feature, index) => (
                  <Box
                    key={index}
                    sx={{
                      bgcolor: activeFeature === index ? 'rgba(33, 150, 243, 0.05)' : '#fff',
                      border: activeFeature === index ? `2px solid ${feature.color}` : '1px solid #e5e5e5',
                      borderRadius: 1.5,
                      p: 2,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: feature.color,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${feature.color}33`,
                      }
                    }}
                    onClick={() => setActiveFeature(index)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Icon icon={feature.icon} width={20} height={20} color={feature.color} />
                      <Chip
                        label={feature.stat}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          bgcolor: `${feature.color}22`,
                          color: feature.color,
                          border: 'none'
                        }}
                      />
                    </Box>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, mb: 0.5, color: '#1a1a1a' }}>
                      {feature.title}
                    </Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: '#666', lineHeight: 1.4 }}>
                      {feature.desc}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Детальное описание активной функции */}
            <Box sx={{ bgcolor: '#fafafa', border: '1px solid #e5e5e5', borderRadius: 1.5, p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: `${features[activeFeature].color}22`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon icon={features[activeFeature].icon} width={24} height={24} color={features[activeFeature].color} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.65rem', color: '#999', textTransform: 'uppercase' }}>
                    Детали
                  </Typography>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a1a' }}>
                    {features[activeFeature].title}
                  </Typography>
                </Box>
              </Box>
              <Typography sx={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.6, mb: 2 }}>
                {activeFeature === 0 && 'ИИ анализирует описание вакансии и автоматически генерирует релевантные вопросы за 30 секунд. Вы можете отредактировать их или использовать как есть.'}
                {activeFeature === 1 && 'Кандидат получает ссылку и проходит интервью в любое удобное время. Отвечает голосом на камеру — никаких HR-менеджеров, всё автоматически.'}
                {activeFeature === 2 && 'ИИ автоматически транскрибирует речь, анализирует ответы, оценивает релевантность и формирует детальный отчёт по каждому кандидату.'}
                {activeFeature === 3 && 'Система автоматически сортирует кандидатов по релевантности на основе анализа ИИ. Лучшие кандидаты всегда наверху списка.'}
                {activeFeature === 4 && 'Сравнивайте до 10 кандидатов side-by-side в одной таблице. Видите все ответы, оценки и сильные стороны. Экспортируйте в Excel.'}
                {activeFeature === 5 && 'Получайте детальные отчёты по каждому кандидату: оценка, сильные/слабые стороны, рекомендации ИИ, транскрипция всех ответов.'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {activeFeature === 0 && (
                  <>
                    <Chip size="small" label="За 30 сек" sx={{ bgcolor: '#fff' }} />
                    <Chip size="small" label="Любая вакансия" sx={{ bgcolor: '#fff' }} />
                    <Chip size="small" label="Редактируемые" sx={{ bgcolor: '#fff' }} />
                  </>
                )}
                {activeFeature === 1 && (
                  <>
                    <Chip size="small" label="24/7 доступ" sx={{ bgcolor: '#fff' }} />
                    <Chip size="small" label="Видео/аудио" sx={{ bgcolor: '#fff' }} />
                    <Chip size="small" label="Любое устройство" sx={{ bgcolor: '#fff' }} />
                  </>
                )}
                {activeFeature === 2 && (
                  <>
                    <Chip size="small" label="95% точность" sx={{ bgcolor: '#fff' }} />
                    <Chip size="small" label="Авто-оценка" sx={{ bgcolor: '#fff' }} />
                    <Chip size="small" label="Транскрипция" sx={{ bgcolor: '#fff' }} />
                  </>
                )}
                {activeFeature === 3 && (
                  <>
                    <Chip size="small" label="Автоматически" sx={{ bgcolor: '#fff' }} />
                    <Chip size="small" label="По AI-оценке" sx={{ bgcolor: '#fff' }} />
                    <Chip size="small" label="Всегда актуально" sx={{ bgcolor: '#fff' }} />
                  </>
                )}
                {activeFeature === 4 && (
                  <>
                    <Chip size="small" label="До 10 человек" sx={{ bgcolor: '#fff' }} />
                    <Chip size="small" label="Side-by-side" sx={{ bgcolor: '#fff' }} />
                    <Chip size="small" label="Экспорт Excel" sx={{ bgcolor: '#fff' }} />
                  </>
                )}
                {activeFeature === 5 && (
                  <>
                    <Chip size="small" label="PDF/Excel" sx={{ bgcolor: '#fff' }} />
                    <Chip size="small" label="Детальная оценка" sx={{ bgcolor: '#fff' }} />
                    <Chip size="small" label="Рекомендации AI" sx={{ bgcolor: '#fff' }} />
                  </>
                )}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* CTA */}
        <Box sx={{ textAlign: 'center', bgcolor: '#fafafa', borderRadius: 2, p: 4 }}>
          <Typography sx={{ fontSize: '1.3rem', fontWeight: 700, mb: 1 }}>
            Попробуйте AI-интервью бесплатно
          </Typography>
          <Typography sx={{ fontSize: '0.9rem', color: '#666', mb: 3, maxWidth: 500, mx: 'auto' }}>
            Первые 10 интервью — в подарок. Убедитесь, что ИИ работает лучше HR-менеджера.
          </Typography>
          <Button
            variant="contained"
            href="/auth/register"
            sx={{
              bgcolor: '#2196F3',
              color: '#fff',
              px: 4,
              py: 1.3,
              fontSize: '0.95rem',
              fontWeight: 600,
              borderRadius: 1.5,
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#1976D2', boxShadow: 'none' }
            }}
          >
            Начать бесплатно
          </Button>
          <Typography sx={{ fontSize: '0.7rem', color: '#999', mt: 1.5 }}>
            Без кредитной карты • Настройка за 5 минут
          </Typography>
        </Box>

      </Container>
    </Box>
  );
}

