"use client";
import * as React from "react";
import { Box, Container, Typography, Tabs, Tab } from "@mui/material";
import { Icon } from "@iconify/react";

export default function FullFeaturesSection() {
  const [activeTab, setActiveTab] = React.useState(0);

  const categories = [
    {
      id: 'vacancies',
      name: 'Вакансии',
      icon: 'mdi:briefcase',
      color: '#2196F3',
      features: [
        { icon: 'mdi:plus-circle', title: 'Создание и управление', desc: 'Создавайте вакансии вручную или загружайте из HH' },
        { icon: 'mdi:file-document-multiple', title: 'Шаблоны интервью', desc: 'Готовые шаблоны для любых должностей' },
        { icon: 'mdi:robot-excited', title: 'AI-генерация вопросов', desc: 'ИИ создаёт релевантные вопросы за 30 секунд' },
        { icon: 'mdi:sync', title: 'Интеграция с HH', desc: 'Автоматическая синхронизация вакансий' },
        { icon: 'mdi:archive', title: 'Архивирование', desc: 'Упорядочивайте закрытые вакансии' },
        { icon: 'mdi:chart-bar', title: 'Статистика по вакансиям', desc: 'Отслеживайте эффективность найма' },
      ]
    },
    {
      id: 'candidates',
      name: 'Кандидаты',
      icon: 'mdi:account-group',
      color: '#4CAF50',
      features: [
        { icon: 'mdi:view-column', title: 'Канбан-доска', desc: 'Визуальное управление с кастомными стадиями' },
        { icon: 'mdi:brain', title: 'AI-оценка', desc: 'Автоматическая оценка и ранжирование' },
        { icon: 'mdi:filter', title: 'Умные фильтры', desc: 'По статусу, источнику, оценке, дате' },
        { icon: 'mdi:compare', title: 'Сравнение кандидатов', desc: 'Side-by-side до 10 кандидатов' },
        { icon: 'mdi:video', title: 'Видео/аудио ответы', desc: 'Просмотр записей интервью' },
        { icon: 'mdi:history', title: 'История действий', desc: 'Полный лог всех операций с кандидатом' },
        { icon: 'mdi:export', title: 'Экспорт данных', desc: 'Выгрузка в Excel для дальнейшего анализа' },
        { icon: 'mdi:database', title: 'Источники: HH, API, ручной ввод', desc: 'Работайте со всеми каналами' },
      ]
    },
    {
      id: 'automation',
      name: 'Автоматизация',
      icon: 'mdi:robot',
      color: '#D6001C',
      features: [
        { icon: 'mdi:sync-circle', title: 'Автосинхронизация HH', desc: 'Вакансии и кандидаты загружаются сами' },
        { icon: 'mdi:email-fast', title: 'Умные приглашения', desc: 'AI персонализирует каждое приглашение' },
        { icon: 'mdi:bell-ring', title: 'Автонапоминания', desc: 'Напоминаем кандидатам через 7 дней' },
        { icon: 'mdi:cancel', title: 'Автоотказы', desc: 'Вежливые отказы через 14 дней неактивности' },
        { icon: 'mdi:swap-horizontal', title: 'Синхронизация статусов', desc: 'Изменения отправляются обратно в HH' },
        { icon: 'mdi:cog', title: 'Гибкие настройки', desc: 'На уровне компании и каждой вакансии' },
        { icon: 'mdi:message-text', title: 'Отправка сообщений', desc: 'Общайтесь с кандидатами прямо в HH' },
        { icon: 'mdi:chart-timeline', title: 'История автоматизации', desc: 'Отслеживайте все автоматические действия' },
      ]
    },
    {
      id: 'analytics',
      name: 'Аналитика',
      icon: 'mdi:chart-line',
      color: '#FF9800',
      features: [
        { icon: 'mdi:view-dashboard', title: 'Дашборды', desc: 'Визуализация всех ключевых метрик' },
        { icon: 'mdi:file-chart', title: 'Детальные отчёты', desc: 'По вакансиям, кандидатам, интервью' },
        { icon: 'mdi:calculator', title: 'ROI калькулятор', desc: 'Считайте экономию времени и денег' },
        { icon: 'mdi:clock-fast', title: 'Экономия времени', desc: 'Смотрите сколько часов HR сэкономили' },
        { icon: 'mdi:file-excel', title: 'Экспорт отчетов', desc: 'Excel/PDF для дальнейшего анализа' },
        { icon: 'mdi:currency-usd', title: 'Финансовая аналитика', desc: 'Расходы, транзакции, прогнозы' },
      ]
    },
    {
      id: 'regulations',
      name: 'Регламенты',
      icon: 'mdi:file-document-check',
      color: '#9C27B0',
      features: [
        { icon: 'mdi:upload', title: 'Загрузка документов', desc: 'PDF, DOCX — любые регламенты' },
        { icon: 'mdi:robot-happy', title: 'AI-генерация тестов', desc: 'ИИ создаёт вопросы из ваших документов' },
        { icon: 'mdi:school', title: 'Тесты для сотрудников', desc: 'Проверьте знание внутренних правил' },
        { icon: 'mdi:email-multiple', title: 'Массовые рассылки', desc: 'Отправьте тест всем сотрудникам сразу' },
        { icon: 'mdi:chart-box', title: 'Отслеживание прохождения', desc: 'Кто прошёл, кто нет, результаты' },
        { icon: 'mdi:clipboard-check', title: 'Результаты по сотрудникам', desc: 'Детальная статистика по каждому' },
      ]
    },
    {
      id: 'team',
      name: 'Команда',
      icon: 'mdi:account-supervisor',
      color: '#00BCD4',
      features: [
        { icon: 'mdi:office-building', title: 'Мультикомпанийность', desc: 'Работайте с несколькими компаниями' },
        { icon: 'mdi:account-multiple-plus', title: 'Добавление сотрудников', desc: 'Пригласите команду в платформу' },
        { icon: 'mdi:shield-account', title: 'Роли и права', desc: 'Гибкая система доступа к функциям' },
        { icon: 'mdi:email-check', title: 'Приглашения по email', desc: 'Удобная отправка приглашений' },
        { icon: 'mdi:swap-vertical', title: 'Переключение компаний', desc: 'Быстро переключайтесь между проектами' },
        { icon: 'mdi:wallet', title: 'Раздельные балансы', desc: 'У каждой компании свой баланс' },
      ]
    },
  ];

  return (
    <Box sx={{ bgcolor: '#fafafa', py: { xs: 6, md: 8 } }}>
      <Container maxWidth="lg">

        {/* Hero */}
        <Box sx={{ mb: 5, textAlign: 'center' }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#FF9800' }} />
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#999' }}>
              Всё что нужно для найма
            </Typography>
          </Box>

          <Typography sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 800, lineHeight: 1.1, mb: 1.5 }}>
            Полный <Box component="span" sx={{ color: '#FF9800' }}>функционал платформы</Box>
          </Typography>

          <Typography sx={{ fontSize: { xs: '0.95rem', md: '1.05rem' }, color: '#666', maxWidth: 650, mx: 'auto', mb: 3 }}>
            От создания вакансий до найма — всё в одной платформе. Автоматизация, аналитика, интеграции.
          </Typography>
        </Box>

        {/* Табы */}
        <Box sx={{ mb: 4 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              bgcolor: '#fff',
              borderRadius: 2,
              border: '1px solid #e5e5e5',
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '0.9rem',
                fontWeight: 600,
                minHeight: 56,
                transition: 'all 0.2s ease',
              }
            }}
          >
            {categories.map((cat, index) => (
              <Tab
                key={cat.id}
                icon={<Icon icon={cat.icon} width={22} height={22} />}
                iconPosition="start"
                label={cat.name}
                sx={{
                  color: activeTab === index ? cat.color : '#666',
                  '& .MuiSvgIcon-root': { color: cat.color },
                  '&.Mui-selected': { color: cat.color }
                }}
              />
            ))}
          </Tabs>
        </Box>

        {/* Контент активной вкладки */}
        <Box sx={{ bgcolor: '#fff', border: '1px solid #e5e5e5', borderRadius: 2, p: { xs: 3, md: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: `${categories[activeTab].color}22`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Icon icon={categories[activeTab].icon} width={28} height={28} color={categories[activeTab].color} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.7rem', color: '#999', textTransform: 'uppercase', letterSpacing: 1 }}>
                Модуль
              </Typography>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#1a1a1a' }}>
                {categories[activeTab].name}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2.5 }}>
            {categories[activeTab].features.map((feature, index) => (
              <Box
                key={index}
                sx={{
                  border: '1px solid #e5e5e5',
                  borderRadius: 1.5,
                  p: 2.5,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: categories[activeTab].color,
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 12px ${categories[activeTab].color}33`,
                  }
                }}
              >
                <Box sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1,
                  bgcolor: `${categories[activeTab].color}22`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1.5
                }}>
                  <Icon icon={feature.icon} width={20} height={20} color={categories[activeTab].color} />
                </Box>
                <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, mb: 0.8, color: '#1a1a1a' }}>
                  {feature.title}
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#666', lineHeight: 1.5 }}>
                  {feature.desc}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Дополнительные преимущества */}
        <Box sx={{ mt: 5 }}>
          <Typography sx={{ fontSize: '0.65rem', color: '#aaa', letterSpacing: 1.5, textTransform: 'uppercase', mb: 3, textAlign: 'center' }}>
            И это ещё не всё
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3 }}>
            {[
              { icon: 'mdi:shield-check', title: '152-ФЗ', desc: 'Соответствие законодательству', color: '#4CAF50' },
              { icon: 'mdi:clock-time-four', title: '24/7', desc: 'Работаем круглосуточно', color: '#2196F3' },
              { icon: 'mdi:database-lock', title: 'Безопасность', desc: 'Шифрование всех данных', color: '#9C27B0' },
              { icon: 'mdi:headset', title: 'Поддержка', desc: 'Быстрая помощь клиентам', color: '#FF9800' },
            ].map((item, i) => (
              <Box key={i} sx={{ textAlign: 'center', p: 2.5, bgcolor: '#fff', border: '1px solid #e5e5e5', borderRadius: 1.5 }}>
                <Icon icon={item.icon} width={32} height={32} color={item.color} style={{ marginBottom: 12 }} />
                <Typography sx={{ fontSize: '1rem', fontWeight: 700, mb: 0.5, color: '#1a1a1a' }}>
                  {item.title}
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#666' }}>
                  {item.desc}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

      </Container>
    </Box>
  );
}

