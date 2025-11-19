"use client";
import React from 'react';
import { Box, Container, Typography, Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemIcon, ListItemText, Grid, Paper, Alert } from '@mui/material';
import { Icon } from '@iconify/react';
import { Trans } from '@lingui/react';


const PricingFAQ: React.FC = () => {
  return (
    <Box sx={{ py: 12, bgcolor: 'white', position: 'relative', zIndex: 2 }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h2"
            fontWeight={800}
            sx={{
              background: 'linear-gradient(45deg, #9C27B0, #2196F3)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}
          ><Trans>❓ Частые вопросы о тарифах</Trans></Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}><Trans>Ответы на популярные вопросы о ценах и возможностях</Trans></Typography>
        </Box>

        <Box sx={{ maxWidth: 900, mx: 'auto' }}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<Icon icon="mdi:chevron-down" />}>
              <Typography fontWeight={600} variant="h6"><Trans>Сгорают ли интервью после покупки?</Trans></Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" color="text.secondary">
                Нет, интервью <strong>не сгорают и действуют бессрочно</strong>. Вы можете использовать их в любое время, 
                без ограничений по срокам. Купили 100 интервью — они будут доступны, пока вы их не израсходуете.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<Icon icon="mdi:chevron-down" />}>
              <Typography fontWeight={600} variant="h6"><Trans>Можно ли перейти на другой тариф?</Trans></Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" color="text.secondary"><Trans>Да, вы можете в любой момент докупить любой пакет интервью. Неиспользованные интервью остаются на балансе. 
                При переходе на более высокий тариф вы сразу получаете доступ ко всем его функциям (кастомные шаблоны, 
                детальные отчеты, мультикомпанийность и т.д.).</Trans></Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<Icon icon="mdi:chevron-down" />}>
              <Typography fontWeight={600} variant="h6"><Trans>Что включено в поддержку разных тарифов?</Trans></Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                <ListItem>
                  <ListItemIcon><Icon icon="mdi:gift" color="#4CAF50" width={24} /></ListItemIcon>
                  <ListItemText 
                    primary={<Typography fontWeight={600}><Trans>Пробный тариф</Trans></Typography>}
                    secondary="Поддержка по email (ответ в течение 48 часов). Доступ к базе знаний и документации."
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Icon icon="mdi:rocket" color="#2196F3" width={24} /></ListItemIcon>
                  <ListItemText 
                    primary={<Typography fontWeight={600}><Trans>Старт</Trans></Typography>}
                    secondary="Поддержка по email (ответ в течение 24 часов). Доступ к базе знаний, документации и видео-инструкциям."
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Icon icon="mdi:briefcase" color="#2196F3" width={24} /></ListItemIcon>
                  <ListItemText 
                    primary={<Typography fontWeight={600}><Trans>Бизнес (рекомендуем)</Trans></Typography>}
                    secondary="Приоритетная поддержка (ответ в течение 4 часов в рабочее время). Email, чат и телефон. Помощь с настройкой интеграций."
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Icon icon="mdi:crown" color="#9C27B0" width={24} /></ListItemIcon>
                  <ListItemText 
                    primary={<Typography fontWeight={600}><Trans>Премиум</Trans></Typography>}
                    secondary="Персональный менеджер 24/7. Мгновенная поддержка по любым каналам. Помощь с настройкой, обучение команды, консультации по оптимизации процессов."
                  />
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<Icon icon="mdi:chevron-down" />}>
              <Typography fontWeight={600} variant="h6"><Trans>Как происходит оплата?</Trans></Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" color="text.secondary" paragraph>
                Оплата производится онлайн через <strong>ЮKassa</strong>:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><Icon icon="mdi:credit-card" color="#2196F3" width={24} /></ListItemIcon>
                  <ListItemText primary="Банковские карты (Visa, Mastercard, МИР)" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Icon icon="mdi:bank" color="#2196F3" width={24} /></ListItemIcon>
                  <ListItemText primary="Система быстрых платежей (СБП)" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Icon icon="mdi:wallet" color="#2196F3" width={24} /></ListItemIcon>
                  <ListItemText primary="Электронные кошельки (ЮMoney, Qiwi)" />
                </ListItem>
              </List>
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Для юридических лиц</strong> доступна оплата по счёту. После оплаты интервью сразу 
                  зачисляются на ваш баланс.
                </Typography>
              </Alert>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<Icon icon="mdi:chevron-down" />}>
              <Typography fontWeight={600} variant="h6"><Trans>Безопасны ли данные кандидатов?</Trans></Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" color="text.secondary" paragraph>
                Да, <strong>безопасность данных — наш приоритет</strong>:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: '#e8f5e9' }}>
                    <Icon icon="mdi:shield-check" color="#4caf50" width={32} height={32} />
                    <Typography variant="body2" fontWeight={600} mt={1}><Trans>Соответствие 152-ФЗ</Trans></Typography>
                    <Typography variant="caption" color="text.secondary"><Trans>Полное соответствие закону "О персональных данных"</Trans></Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: '#e3f2fd' }}>
                    <Icon icon="mdi:server-security" color="#2196f3" width={32} height={32} />
                    <Typography variant="body2" fontWeight={600} mt={1}><Trans>Серверы в России</Trans></Typography>
                    <Typography variant="caption" color="text.secondary"><Trans>Все данные хранятся на защищённых серверах в РФ</Trans></Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: '#f3e5f5' }}>
                    <Icon icon="mdi:lock" color="#9c27b0" width={32} height={32} />
                    <Typography variant="body2" fontWeight={600} mt={1}><Trans>Шифрование SSL/TLS</Trans></Typography>
                    <Typography variant="caption" color="text.secondary"><Trans>Защищённая передача данных по HTTPS</Trans></Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: '#fff3e0' }}>
                    <Icon icon="mdi:certificate" color="#ff9800" width={32} height={32} />
                    <Typography variant="body2" fontWeight={600} mt={1}><Trans>Регулярные аудиты</Trans></Typography>
                    <Typography variant="caption" color="text.secondary"><Trans>Проходим аудит безопасности каждые 6 месяцев</Trans></Typography>
                  </Paper>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<Icon icon="mdi:chevron-down" />}>
              <Typography fontWeight={600} variant="h6"><Trans>Какой тариф выбрать для моей компании?</Trans></Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" color="text.secondary" paragraph><Trans>Выбор тарифа зависит от интенсивности найма:</Trans></Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, border: '1px solid #4CAF50' }}>
                    <Typography variant="body1" fontWeight={600} color="#4CAF50" mb={1}><Trans>🎁 Пробный</Trans></Typography>
                    <Typography variant="caption" color="text.secondary"><Trans>Для тестирования платформы без финансовых вложений. 10 бесплатных интервью для знакомства с функционалом.</Trans></Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, border: '1px solid #2196F3' }}>
                    <Typography variant="body1" fontWeight={600} color="#2196F3" mb={1}><Trans>🚀 Старт</Trans></Typography>
                    <Typography variant="caption" color="text.secondary"><Trans>Для небольших компаний и стартапов до 10 найма/месяц. Базовый функционал для начала автоматизации.</Trans></Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, border: '2px solid #2196F3', bgcolor: '#e3f2fd' }}>
                    <Typography variant="body1" fontWeight={600} color="#2196F3" mb={1}><Trans>⭐ Бизнес (рекомендуем!)</Trans></Typography>
                    <Typography variant="caption" color="text.secondary"><Trans>Для средних компаний с активным процессом найма. Оптимальный баланс функций и стоимости. Экономия 20%!</Trans></Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, border: '1px solid #9C27B0' }}>
                    <Typography variant="body1" fontWeight={600} color="#9C27B0" mb={1}><Trans>👑 Премиум</Trans></Typography>
                    <Typography variant="caption" color="text.secondary"><Trans>Для крупных компаний и HR-агентств с высокой нагрузкой. Максимум функций и персональная поддержка 24/7.</Trans></Typography>
                  </Paper>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Container>
    </Box>
  );
};

export default PricingFAQ;

