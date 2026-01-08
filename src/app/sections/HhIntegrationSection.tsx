"use client";
import * as React from "react";
import { Box, Container, Typography, Button, ToggleButtonGroup, ToggleButton, Slider } from "@mui/material";
import { Icon } from "@iconify/react";

interface HhIntegrationSectionProps {
  invitationType: 'ai' | 'regular';
  setInvitationType: (type: 'ai' | 'regular') => void;
  candidatesPerMonth: number;
  setCandidatesPerMonth: (value: number) => void;
  animationStep: number;
}

export default function HhIntegrationSection({ 
  invitationType, 
  setInvitationType, 
  candidatesPerMonth, 
  setCandidatesPerMonth,
  animationStep 
}: HhIntegrationSectionProps) {
  const timePerCandidateManual = 15;
  const timeSaved = (candidatesPerMonth * timePerCandidateManual) / 60;
  const moneySaved = Math.round(timeSaved * 1500);

  const flowSteps = [
    { icon: 'mdi:account-arrow-right', label: 'Отклик', color: '#2196F3' },
    { icon: 'mdi:robot', label: 'AI анализ', color: '#D6001C' },
    { icon: 'mdi:email-fast', label: 'Приглашение', color: '#D6001C' },
    { icon: 'mdi:video', label: 'Интервью', color: '#4CAF50' },
    { icon: 'mdi:sync', label: 'Статус', color: '#4CAF50' },
    { icon: 'mdi:bell-ring', label: 'Напоминание', color: '#FF9800' },
    { icon: 'mdi:cancel', label: 'Отказ', color: '#9C27B0' },
  ];

  return (
    <Box sx={{ bgcolor: '#fafafa', color: '#1a1a1a', py: { xs: 6, md: 8 } }}>
      <Container maxWidth="lg">

        {/* Hero */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#D6001C' }} />
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#999' }}>
              HeadHunter • Официальное API
            </Typography>
          </Box>

          <Typography sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 800, lineHeight: 1.1, mb: 1.5 }}>
            Полная автоматизация <Box component="span" sx={{ color: '#D6001C' }}>работы с HH</Box>
          </Typography>

          <Typography sx={{ fontSize: { xs: '0.95rem', md: '1.05rem' }, color: '#666', maxWidth: 580, mb: 2 }}>
            От синхронизации вакансий до автоматических отказов — система берёт на себя всю рутину.
          </Typography>

          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 2, bgcolor: '#fff', border: '1px solid #e5e5e5', borderRadius: 1.5, px: 2, py: 1 }}>
            <Icon icon="mdi:account-group" width={16} height={16} color="#4CAF50" />
            <Typography sx={{ fontSize: '0.8rem', color: '#666' }}>
              <Box component="span" sx={{ fontWeight: 700, color: '#1a1a1a' }}>50,000+</Box> интервью через HH
            </Typography>
          </Box>
        </Box>

        {/* Главный контент - 2 колонки */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4, mb: 5 }}>

          {/* Левая колонка */}
          <Box>
            {/* До/После компактно */}
            <Box sx={{ mb: 4 }}>
              <Typography sx={{ fontSize: '0.65rem', color: '#aaa', letterSpacing: 1.5, textTransform: 'uppercase', mb: 2 }}>
                До / После
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box sx={{ bgcolor: '#fff', border: '1px solid #e5e5e5', borderRadius: 1.5, p: 2 }}>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#999', mb: 1.5 }}>Ручная</Typography>
                  {['Заходите в HH каждый день', 'Шаблонные приглашения', 'Забываете напомнить'].map((text, i) => (
                      <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <Icon icon="mdi:close" width={14} height={14} color="#f44336" style={{ marginTop: 2 }} />
                        <Typography sx={{ fontSize: '0.75rem', color: '#888', lineHeight: 1.5 }}>{text}</Typography>
                      </Box>
                  ))}
                  <Typography sx={{ fontSize: '1.3rem', fontWeight: 800, color: '#f44336', mt: 2 }}>5ч/день</Typography>
                </Box>
                <Box sx={{ bgcolor: '#fff', border: '2px solid #4CAF50', borderRadius: 1.5, p: 2 }}>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, mb: 1.5 }}>С SofiHR</Typography>
                  {['Автосинхронизация', 'AI персонализация', 'Авто-напоминания'].map((text, i) => (
                      <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <Icon icon="mdi:check" width={14} height={14} color="#4CAF50" style={{ marginTop: 2 }} />
                        <Typography sx={{ fontSize: '0.75rem', color: '#333', lineHeight: 1.5 }}>{text}</Typography>
                      </Box>
                  ))}
                  <Typography sx={{ fontSize: '1.3rem', fontWeight: 800, color: '#4CAF50', mt: 2 }}>0 мин/день</Typography>
                </Box>
              </Box>
            </Box>

            {/* Анимация потока */}
            <Box sx={{ mb: 4 }}>
              <Typography sx={{ fontSize: '0.65rem', color: '#aaa', letterSpacing: 1.5, textTransform: 'uppercase', mb: 2 }}>
                Полный цикл
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                {flowSteps.map((step, index) => (
                    <React.Fragment key={index}>
                      <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        opacity: animationStep === index ? 1 : 0.3,
                        transition: 'all 0.3s ease'
                      }}>
                        <Box sx={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          bgcolor: animationStep === index ? step.color : '#f5f5f5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 0.5,
                          transition: 'all 0.3s ease'
                        }}>
                          <Icon icon={step.icon} width={18} height={18} color={animationStep === index ? '#fff' : '#ccc'} />
                        </Box>
                        <Typography sx={{ fontSize: '0.65rem', color: animationStep === index ? step.color : '#999' }}>
                          {step.label}
                        </Typography>
                      </Box>
                      {index < flowSteps.length - 1 && (
                          <Box sx={{ width: 8, height: 2, bgcolor: animationStep > index ? step.color : '#e5e5e5' }} />
                      )}
                    </React.Fragment>
                ))}
              </Box>
            </Box>

            {/* Кейс */}
            <Box sx={{ bgcolor: '#fff', border: '1px solid #e5e5e5', borderRadius: 1.5, p: 2.5 }}>
              <Typography sx={{ fontSize: '0.65rem', color: '#aaa', letterSpacing: 1.5, textTransform: 'uppercase', mb: 1 }}>
                Кейс
              </Typography>
              <Typography sx={{ fontSize: '1.05rem', fontWeight: 700, mb: 1, lineHeight: 1.3 }}>
                IT-стартап: <Box component="span" sx={{ color: '#f44336' }}>45</Box> → <Box component="span" sx={{ color: '#4CAF50' }}>7 дней</Box>
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#666', lineHeight: 1.5, mb: 2 }}>
                10 разработчиков/месяц. Конверсия в интервью +40%.
              </Typography>
              <Box sx={{ display: 'flex', gap: 3 }}>
                {[
                  { value: '150+', label: 'кандидатов' },
                  { value: '400К₽', label: 'экономия' },
                ].map((stat, i) => (
                    <Box key={i}>
                      <Typography sx={{ fontSize: '1.3rem', fontWeight: 800, color: '#4CAF50', lineHeight: 1 }}>{stat.value}</Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: '#888' }}>{stat.label}</Typography>
                    </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {/* Правая колонка */}
          <Box>
            {/* Интерактивный пример */}
            <Box sx={{ mb: 4 }}>
              <Typography sx={{ fontSize: '0.65rem', color: '#aaa', letterSpacing: 1.5, textTransform: 'uppercase', mb: 2 }}>
                AI vs Обычное
              </Typography>
              <ToggleButtonGroup
                  value={invitationType}
                  exclusive
                  onChange={(_, val) => val && setInvitationType(val)}
                  size="small"
                  sx={{ mb: 2 }}
              >
                <ToggleButton value="regular" sx={{ px: 2, py: 0.5, fontSize: '0.8rem', textTransform: 'none' }}>
                  Обычное
                </ToggleButton>
                <ToggleButton value="ai" sx={{ px: 2, py: 0.5, fontSize: '0.8rem', textTransform: 'none' }}>
                  <Icon icon="mdi:sparkles" width={14} height={14} style={{ marginRight: 4 }} />
                  AI
                </ToggleButton>
              </ToggleButtonGroup>

              <Box sx={{ bgcolor: '#fff', border: '1px solid #e5e5e5', borderRadius: 1.5, p: 2.5 }}>
                {invitationType === 'regular' ? (
                    <>
                      <Typography sx={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.6 }}>
                        Здравствуйте! Спасибо за отклик на вакансию «Product Manager». Приглашаем пройти интервью: [ссылка]
                      </Typography>
                      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #f0f0f0', display: 'flex', gap: 1 }}>
                        <Icon icon="mdi:information" width={16} height={16} color="#999" />
                        <Typography sx={{ fontSize: '0.7rem', color: '#999' }}>Шаблонный текст</Typography>
                      </Box>
                    </>
                ) : (
                    <>
                      <Typography sx={{ fontSize: '0.85rem', color: '#333', lineHeight: 1.6 }}>
                        Здравствуйте! Спасибо за отклик.<br />
                        <Box component="span" sx={{ bgcolor: 'rgba(214, 0, 28, 0.08)', px: 0.5, borderRadius: 0.5, fontWeight: 600 }}>
                          Посмотрел ваш профиль — откликнулся опыт с B2B-продуктами. Именно такой подход нам важен.
                        </Box><br />
                        Приглашаем пройти интервью: [ссылка]
                      </Typography>
                      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #f0f0f0', display: 'flex', gap: 1 }}>
                        <Icon icon="mdi:sparkles" width={16} height={16} color="#FFD700" />
                        <Typography sx={{ fontSize: '0.7rem', color: '#D6001C', fontWeight: 600 }}>Персонально для каждого</Typography>
                      </Box>
                    </>
                )}
              </Box>
            </Box>

            {/* Калькулятор */}
            <Box sx={{ bgcolor: '#fff', border: '1px solid #e5e5e5', borderRadius: 1.5, p: 2.5 }}>
              <Typography sx={{ fontSize: '0.65rem', color: '#aaa', letterSpacing: 1.5, textTransform: 'uppercase', mb: 1.5 }}>
                Калькулятор
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#666', mb: 1.5 }}>
                Откликов из HH в месяц:
              </Typography>
              <Box sx={{ px: 1, mb: 2 }}>
                <Slider
                    value={candidatesPerMonth}
                    onChange={(_, val) => setCandidatesPerMonth(val as number)}
                    min={10}
                    max={200}
                    step={10}
                    size="small"
                    valueLabelDisplay="on"
                />
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#4CAF50', lineHeight: 1 }}>
                    {timeSaved.toFixed(0)}ч
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: '#888' }}>экономия/месяц</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#D6001C', lineHeight: 1 }}>
                    {(moneySaved/1000).toFixed(0)}К₽
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: '#888' }}>деньгами</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Функции в строку */}
        <Box sx={{ bgcolor: '#fff', border: '1px solid #e5e5e5', borderRadius: 1.5, p: 3, mb: 4 }}>
          <Typography sx={{ fontSize: '0.65rem', color: '#aaa', letterSpacing: 1.5, textTransform: 'uppercase', mb: 2 }}>
            Полный функционал
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
            {[
              { icon: 'mdi:sync', title: 'Автосинхронизация', desc: 'Вакансии и кандидаты', color: '#2196F3' },
              { icon: 'mdi:robot', title: 'AI приглашения', desc: 'Персональные для всех', color: '#D6001C' },
              { icon: 'mdi:bell-ring', title: 'Напоминания', desc: 'Через 7 дней', color: '#FF9800' },
              { icon: 'mdi:cancel', title: 'Автоотказы', desc: 'Через 14 дней', color: '#9C27B0' },
            ].map((item, i) => (
                <Box key={i}>
                  <Icon icon={item.icon} width={20} height={20} color={item.color} style={{ marginBottom: 8 }} />
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', mb: 0.3 }}>{item.title}</Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#888' }}>{item.desc}</Typography>
                </Box>
            ))}
          </Box>
        </Box>

        {/* CTA */}
        <Box sx={{ textAlign: 'center' }}>
          <Button
              variant="contained"
              href="/auth/register"
              sx={{
                bgcolor: '#D6001C',
                color: '#fff',
                px: 4,
                py: 1.3,
                fontSize: '0.95rem',
                fontWeight: 600,
                borderRadius: 1.5,
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#b8001a', boxShadow: 'none' }
              }}
          >
            Подключить HH бесплатно
          </Button>
          <Typography sx={{ fontSize: '0.75rem', color: '#999', mt: 1 }}>
            10 интервью бесплатно • 5 мин настройки
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

