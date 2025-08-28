"use client";
import * as React from "react";
import {
  AppBar, Box, Toolbar, IconButton, Typography, Menu, Container, Button, MenuItem, Chip, Avatar, AvatarGroup, Paper, Select, LinearProgress, Grid, AccordionSummary, AccordionDetails, Stack, CardContent, Accordion, Card, useTheme, useMediaQuery, Link,
} from "@mui/material";
import { Icon } from "@iconify/react";


import user1 from "@/../public/images/profile/user1.jpg";
import user2 from "@/../public/images/profile/user2.jpg";
import user3 from "@/../public/images/profile/user3.jpg";
import {loadFull} from "tsparticles";
import Particles from "@tsparticles/react";
import HeroParticles from "./components/HeroParticles";
import MobileMenu from "./components/MobileMenu";
import DesktopMenu from "./components/DesktopMenu";


const pages = [
  "Главная",
  "Преимущества",
  "Как это работает",
  "Отзывы",
  "Тарифы",
  "Контакты",
];

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = React.useState(0);

  const handlePrevSlide = () => setCurrentSlide((prev) => prev === 0 ? testimonials.length - 1 : prev - 1);
  const handleNextSlide = () => setCurrentSlide((prev) => prev === testimonials.length - 1 ? 0 : prev + 1);

  // Функция плавной прокрутки к секциям
  const scrollToSection = React.useCallback((sectionName: string) => {

    const sectionMap: { [key: string]: string } = {
      "Главная": "hero-section",
      "Преимущества": "advantages-section",
      "Как это работает": "how-it-works-section",
      "Отзывы": "testimonials-section",
      "Тарифы": "pricing-section",
      "Контакты": "cta-section",
    };

    const sectionId = sectionMap[sectionName];
    if (sectionId) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  }, []);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // --- данные ---
  const technologies = [
    { icon: "logos:react", label: "React" },
    { icon: "logos:material-ui", label: "Material-UI" },
    { icon: "logos:nextjs-icon", label: "Next.js" },
    { icon: "logos:typescript-icon", label: "TypeScript" },
    { icon: "logos:redux", label: "Redux" },
    { icon: "vscode-icons:file-type-light-js", label: "JavaScript" },
  ];
  const features = [
    { icon: "mdi:account-tie", title: "Экспертная поддержка", description: "HR-автоматизация и консультации от экспертов.", iconBg: "#FFF1F0" },
    { icon: "mdi:bank", title: "Интеграции", description: "Интеграция с мессенджерами, job-сайтами и корпоративными сервисами.", iconBg: "#E3F2FD" },
    { icon: "mdi:calculator", title: "Гибкие тарифы", description: "Доступно для команд любого размера.", iconBg: "#E6F7F0" },
    { icon: "mdi:chart-line", title: "Аналитика", description: "Вся статистика по вакансиям и кандидатам в одном месте.", iconBg: "#FFF4E5" },
  ];
  const features1 = [
    { icon: "mdi:account-group", title: "Командная работа", isActive: true },
    { icon: "mdi:bank", title: "Платежи", isActive: false },
    { icon: "mdi:code-brackets", title: "Встраивание", isActive: false },
    { icon: "mdi:workflow", title: "Автоматизация", isActive: false },
  ];
  const accordionItems = [
    { title: "Внешние коллеги", content: "Можно приглашать подрядчиков и консультантов в процессы найма." },
    { title: "Объединение расписаний", content: "Автоматическое согласование времени для всех участников интервью.", expanded: true },
    { title: "Ротация кандидатов", content: "Гибкие сценарии распределения кандидатов между HR-менеджерами." },
  ];
  const testimonials = [
    {
      text: "SofiHR полностью изменил наш процесс найма. Теперь мы тратим в 5 раз меньше времени на первичные интервью и получаем более качественных кандидатов.",
      name: "Екатерина Иванова",
      position: "HR Lead, TechCorp",
      avatar: "/images/profile/user-9.jpg"
    },
    {
      text: "ИИ-интервью помогли нам обработать в 10 раз больше кандидатов при том же количестве HR-специалистов. ROI проекта составил 400%.",
      name: "Андрей Смирнов",
      position: "HR Director, SalesForce",
      avatar: user2.src
    },
    {
      text: "Автоматизация интервью позволила нам масштабировать бизнес в 3 раза. Теперь мы можем обрабатывать в 5 раз больше вакансий.",
      name: "Мария Петрова",
      position: "CEO, RecruitPro",
      avatar: "/images/profile/user3.jpg"
    }
  ];
  const companies = [ { name: "Intel" }, { name: "Oracle" }, { name: "Dell" }, { name: "Samsung" }, { name: "Infosys" }, { name: "Capgemini" } ];
  const sections = [
    { title: "Возможности", links: ["Вакансии", "Кандидаты", "Интервью", "Аналитика", "Интеграции"] },
    { title: "Документация", links: ["API", "FAQ", "Поддержка"] },
    { title: "Компания", links: ["О нас", "Блог", "Контакты"] },
  ];
  const socialLinks = [
    { icon: "mdi:facebook", url: "#" },
    { icon: "mdi:twitter", url: "#" },
    { icon: "mdi:instagram", url: "#" },
  ];

  // === Динамические маркетинговые данные ===
  const companyStart = new Date(2024, 0, 1); // январь — месяц 0!
  const now = new Date();
  const months = (now.getFullYear() - companyStart.getFullYear()) * 12 + (now.getMonth() - companyStart.getMonth()) + 1;
  const clientsPerMonth = 24;
  const totalClients = months * clientsPerMonth;
  const soloShare = 0.6;
  const teamShare = 1 - soloShare;
  const soloClients = Math.round(totalClients * soloShare);
  const teamClients = totalClients - soloClients;
  const avgTeamSize = 10;
  const totalUsers = soloClients + teamClients * avgTeamSize;
  const totalVacancies = Math.round(totalClients * 2.5);
  const totalInterviews = totalVacancies * 3;
  const totalCandidates = Math.round(totalInterviews * 1.5);

  return (
    <Box sx={{ width: "100%" }}>
      {/* Hero Section */}
      <Box sx={{ width: "100%", bgcolor: "#E5F3FB", position: 'relative', overflow: 'hidden', height: '100vh', zIndex: 1 }}>
        <HeroParticles />
        {/* Navbar внутри Hero */}
        <Box sx={{ display: "flex", width: "100%", height: 100, alignItems: "center", position: 'relative', zIndex: 2 }}>
          <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
            <AppBar position="static" color="transparent" elevation={0} sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
              <Toolbar disableGutters sx={{ pl: 0, pr: 0 }}>
                {/* Logo - Desktop */}
                <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1 }}>
                  <Typography
                    variant="h4"
                    fontWeight={900}
                    component="a"
                    href="/"
                    sx={{
                      textDecoration: "none",
                      color: "primary.main",
                      letterSpacing: 2,
                      fontFamily: 'Montserrat, Roboto, Arial',
                      textShadow: '0 2px 12px rgba(76, 175, 80, 0.08)',
                      userSelect: 'none',
                    }}
                  >
                    SofiHR
                  </Typography>
                </Box>
                {/* Mobile menu */}
                <MobileMenu pages={pages} onScrollToSection={scrollToSection} />
                {/* Logo - Mobile */}
                <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", gap: 1, flexGrow: 1 }}>
                  <Typography
                    variant="h5"
                    fontWeight={900}
                    component="a"
                    href="/"
                    sx={{
                      textDecoration: "none",
                      color: "primary.main",
                      letterSpacing: 2,
                      fontFamily: 'Montserrat, Roboto, Arial',
                      textShadow: '0 2px 12px rgba(76, 175, 80, 0.08)',
                      userSelect: 'none',
                    }}
                  >
                    SofiHR
                  </Typography>
                </Box>
                {/* Desktop menu */}
                <DesktopMenu pages={pages} onScrollToSection={scrollToSection} />
                {/* Login and Registration buttons */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    href="/auth/phone"
                    sx={{ display: { xs: 'none', md: 'inline-flex' } }}
                  >
                    Регистрация
                  </Button>
                  <Button variant="contained" color="primary" href="/auth/phone">Войти</Button>
                </Box>
              </Toolbar>
            </AppBar>
          </Container>
        </Box>
        {/* Контент Hero поверх */}
        <Container maxWidth="lg" id="hero-section" sx={{ pt: { xs: 12, sm: 10, md: 8 }, position: 'relative', zIndex: 1, bgcolor: 'transparent', flex: 1, display: 'flex', alignItems: 'center' }}>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: "center", gap: 4 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h1" sx={{ fontSize: { xs: "2.5rem", md: "3.5rem" }, fontWeight: 700, mb: 2, lineHeight: 1.2 }}>
                HR-платформа для автоматизации найма и интервью
              </Typography>
              <Typography variant="h5" color="text.secondary" mb={4}>
                Автоматизируйте найм с помощью ИИ. Создавайте вакансии, проводите интервью и нанимайте лучших кандидатов в 3 раза быстрее.
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <AvatarGroup max={3} sx={{ mr: 2 }}>
                  <Avatar alt="User 1" src={user1.src} />
                  <Avatar alt="User 2" src={user2.src} />
                  <Avatar alt="User 3" src={user3.src} />
                </AvatarGroup>
                <Typography variant="body1" color="text.secondary">
                  {totalClients.toLocaleString()}+ HR и компаний уже с нами
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Icon icon="mdi:clock-fast" color="#4CAF50" width={20} height={20} />
                  <Typography variant="body2">В 3 раза быстрее</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Icon icon="mdi:robot" color="#2196F3" width={20} height={20} />
                  <Typography variant="body2">ИИ-интервью</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Icon icon="mdi:shield-check" color="#FF9800" width={20} height={20} />
                  <Typography variant="body2">Безопасность данных</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Icon icon="mdi:chart-line" color="#9C27B0" width={20} height={20} />
                  <Typography variant="body2">Аналитика в реальном времени</Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4, flexWrap: 'wrap' }}>
                {technologies.map((tech) => (
                  <Box key={tech.label} sx={{ width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "background.paper", borderRadius: 1, boxShadow: 1 }}>
                    <Icon icon={tech.icon} width="24" height="24" />
                  </Box>
                ))}
              </Box>
            </Box>
            {/* Dashboard Preview */}
            <Box sx={{ flex: 1, display: { xs: "none", lg: "block" } }}>
              <Paper elevation={3} sx={{ p: 3, borderRadius: 2, bgcolor: "background.paper" }}>
                <Typography variant="h6" gutterBottom>
                  Автоматизация HR-процессов
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Вакансии, кандидаты, интервью — всё в одном месте
                </Typography>
                <Grid container spacing={2} mb={2}>
                  <Grid item xs={6}>
                    <Typography variant="h5" fontWeight={700}>{totalVacancies.toLocaleString()}</Typography>
                    <Typography variant="body2" color="text.secondary">Открытых вакансий</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h5" fontWeight={700}>{totalCandidates.toLocaleString()}</Typography>
                    <Typography variant="body2" color="text.secondary">Кандидатов в процессе</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h5" fontWeight={700}>{totalInterviews.toLocaleString()}</Typography>
                    <Typography variant="body2" color="text.secondary">Проведённых интервью</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h5" fontWeight={700}>{Math.round(totalInterviews/totalVacancies)}x</Typography>
                    <Typography variant="body2" color="text.secondary">Быстрее найм</Typography>
                  </Grid>
                </Grid>
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">Среднее время закрытия вакансии: <b>7 дней</b></Typography>
                  <Typography variant="body2" color="text.secondary">Автоматизировано: <b>80%</b> интервью</Typography>
                </Box>
                <Box mb={3}>
                  <Typography variant="body2" color="text.secondary" mb={1}>Интеграции:</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Icon icon="logos:telegram" width={24} height={24} />
                    <Icon icon="logos:whatsapp-icon" width={24} height={24} />
                    <Icon icon="logos:1c" width={24} height={24} />
                    <Icon icon="logos:excel" width={24} height={24} />
                  </Box>
                </Box>
                <Button variant="contained" color="primary" size="large" href="/auth/phone" sx={{
                  fontSize: '1.1rem',
                  py: 2,
                  px: 4,
                  boxShadow: '0 4px 20px rgba(25, 118, 210, 0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 25px rgba(25, 118, 210, 0.4)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                  width: '100%'
                }}>
                  Попробовать бесплатно
                </Button>
              </Paper>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Второй экран - Преимущества */}
      <Box id="advantages-section" sx={{ bgcolor: "white", py: 8, position: 'relative', zIndex: 2, scrollMarginTop: '80px' }}>
        <Container maxWidth="lg">

          {/* Заголовок раздела */}
          <Typography variant="h3" align="center" fontWeight={700} mb={2}>
            AI-интервью: революция в найме
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" mb={6}>
            Автоматизируйте весь процесс интервью с помощью искусственного интеллекта
          </Typography>

          {/* Основные функции AI-интервью */}
          <Grid container spacing={4} mb={8}>
            <Grid item xs={12} sm={6} md={4}>
              <Paper sx={{ p: 4, borderRadius: 3, height: '100%', border: '1px solid #e0e0e0' }} elevation={0}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ width: 56, height: 56, borderRadius: 2, bgcolor: '#E3F2FD', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                    <Icon icon="mdi:robot" color="#2196F3" width={32} height={32} />
                  </Box>
                  <Typography variant="h6" fontWeight={600}>Автоматические интервью</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  ИИ проводит интервью без участия интервьюера. Адаптивные вопросы на основе предыдущих ответов.
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Icon icon="mdi:check-circle" color="#4caf50" width={16} height={16} />
                  <Typography variant="caption">15 минут на интервью</Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Paper sx={{ p: 4, borderRadius: 3, height: '100%', border: '1px solid #e0e0e0' }} elevation={0}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ width: 56, height: 56, borderRadius: 2, bgcolor: '#E8F5E8', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                    <Icon icon="mdi:brain" color="#4CAF50" width={32} height={32} />
                  </Box>
                  <Typography variant="h6" fontWeight={600}>Анализ каждого ответа</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  ИИ оценивает качество, полноту и релевантность каждого ответа кандидата.
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Icon icon="mdi:check-circle" color="#4caf50" width={16} height={16} />
                  <Typography variant="caption">Детальная оценка</Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Paper sx={{ p: 4, borderRadius: 3, height: '100%', border: '1px solid #e0e0e0' }} elevation={0}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ width: 56, height: 56, borderRadius: 2, bgcolor: '#FFF3E0', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                    <Icon icon="mdi:chart-line" color="#FF9800" width={32} height={32} />
                  </Box>
                  <Typography variant="h6" fontWeight={600}>Ранжирование кандидатов</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Автоматическая сортировка кандидатов по релевантности и качеству ответов.
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Icon icon="mdi:check-circle" color="#4caf50" width={16} height={16} />
                  <Typography variant="caption">Умная сортировка</Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Paper sx={{ p: 4, borderRadius: 3, height: '100%', border: '1px solid #e0e0e0' }} elevation={0}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ width: 56, height: 56, borderRadius: 2, bgcolor: '#F3E5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                    <Icon icon="mdi:comment-question" color="#9C27B0" width={32} height={32} />
                  </Box>
                  <Typography variant="h6" fontWeight={600}>Дополнительные вопросы</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  ИИ автоматически задаёт уточняющие вопросы на основе контекста ответов.
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Icon icon="mdi:check-circle" color="#4caf50" width={16} height={16} />
                  <Typography variant="caption">Адаптивные вопросы</Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Paper sx={{ p: 4, borderRadius: 3, height: '100%', border: '1px solid #e0e0e0' }} elevation={0}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ width: 56, height: 56, borderRadius: 2, bgcolor: '#E1F5FE', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                    <Icon icon="mdi:file-document" color="#00BCD4" width={32} height={32} />
                  </Box>
                  <Typography variant="h6" fontWeight={600}>Развёрнутый отчёт</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Сравнение выбранных кандидатов с анализом сильных и слабых сторон.
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Icon icon="mdi:check-circle" color="#4caf50" width={16} height={16} />
                  <Typography variant="caption">Детальный анализ</Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Paper sx={{ p: 4, borderRadius: 3, height: '100%', border: '1px solid #e0e0e0' }} elevation={0}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ width: 56, height: 56, borderRadius: 2, bgcolor: '#FCE4EC', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                    <Icon icon="mdi:video" color="#E91E63" width={32} height={32} />
                  </Box>
                  <Typography variant="h6" fontWeight={600}>Видео и аудио запись</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Запись интервью в реальном времени с возможностью просмотра и анализа.
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Icon icon="mdi:check-circle" color="#4caf50" width={16} height={16} />
                  <Typography variant="caption">Полная запись</Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Дополнительные функции управления */}
          <Typography variant="h4" align="center" fontWeight={700} mb={4}>
            Дополнительные возможности
          </Typography>

          <Grid container spacing={3} mb={6}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                <Icon icon="mdi:domain" color="#2196F3" width={24} height={24} />
                <Typography variant="body2">Мультикомпанийность</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                <Icon icon="mdi:account-group" color="#4CAF50" width={24} height={24} />
                <Typography variant="body2">Управление сотрудниками</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                <Icon icon="mdi:shield-account" color="#FF9800" width={24} height={24} />
                <Typography variant="body2">Система прав доступа</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                <Icon icon="mdi:briefcase" color="#9C27B0" width={24} height={24} />
                <Typography variant="body2">Управление вакансиями</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                <Icon icon="mdi:file-document-outline" color="#00BCD4" width={24} height={24} />
                <Typography variant="body2">Шаблоны интервью</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                <Icon icon="mdi:tune" color="#E91E63" width={24} height={24} />
                <Typography variant="body2">Настройка критериев</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                <Icon icon="mdi:download" color="#795548" width={24} height={24} />
                <Typography variant="body2">Экспорт данных</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                <Icon icon="mdi:bell" color="#607D8B" width={24} height={24} />
                <Typography variant="body2">Уведомления</Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Статистика эффективности */}
          <Box sx={{ bgcolor: '#f8fafc', p: 4, borderRadius: 3, mb: 6 }}>
            <Typography variant="h5" align="center" fontWeight={600} mb={4}>
              Эффективность AI-интервью
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="primary" fontWeight={700}>
                    100%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Интервью автоматизировано
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="primary" fontWeight={700}>
                    17x
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Быстрее найм
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="primary" fontWeight={700}>
                    5x
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Дешевле интервью
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="primary" fontWeight={700}>
                    24/7
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Доступность системы
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

        </Container>
      </Box>

      {/* Третий экран - Как это работает */}
      <Box id="how-it-works-section" sx={{ bgcolor: '#f8fafc', py: 12, position: 'relative', zIndex: 2, scrollMarginTop: '80px' }}>
        <Box sx={{ py: 8, bgcolor: "#f8fafc", position: 'relative', zIndex: 2 }}>
          <Container maxWidth="lg">
            {/* Заголовок */}
            <Typography variant="h3" align="center" fontWeight={700} mb={2}>
              Как это работает?
            </Typography>
            <Typography variant="h6" align="center" color="text.secondary" mb={6}>
              Простой процесс автоматизации найма за 4 шага
            </Typography>

            {/* Пошаговый процесс */}
            <Grid container spacing={4} mb={6}>
              {/* Шаг 1 */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 4, borderRadius: 3, height: '100%', border: '1px solid #e0e0e0' }} elevation={0}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 3 }}>
                      <Typography variant="h4" color="white" fontWeight={700}>1</Typography>
                    </Box>
                    <Box>
                      <Typography variant="h5" fontWeight={600}>Создаёте вакансию</Typography>
                      <Typography variant="body2" color="text.secondary">ИИ генерирует вопросы на основе описания</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Icon icon="mdi:check-circle" color="#4caf50" width={20} height={20} />
                    <Typography variant="body2">Заполняете требования к позиции</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Icon icon="mdi:check-circle" color="#4caf50" width={20} height={20} />
                    <Typography variant="body2">ИИ создаёт адаптивные вопросы</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Icon icon="mdi:check-circle" color="#4caf50" width={20} height={20} />
                    <Typography variant="body2">Настраиваете критерии оценки</Typography>
                  </Box>
                </Paper>
              </Grid>

              {/* Шаг 2 */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 4, borderRadius: 3, height: '100%', border: '1px solid #e0e0e0' }} elevation={0}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 3 }}>
                      <Typography variant="h4" color="white" fontWeight={700}>2</Typography>
                    </Box>
                    <Box>
                      <Typography variant="h5" fontWeight={600}>ИИ проводит интервью</Typography>
                      <Typography variant="body2" color="text.secondary">Кандидат проходит автоматическое интервью</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Icon icon="mdi:check-circle" color="#4caf50" width={20} height={20} />
                    <Typography variant="body2">Запись видео и аудио в реальном времени</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Icon icon="mdi:check-circle" color="#4caf50" width={20} height={20} />
                    <Typography variant="body2">Адаптивные вопросы на основе ответов</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Icon icon="mdi:check-circle" color="#4caf50" width={20} height={20} />
                    <Typography variant="body2">15 минут вместо 4 часов</Typography>
                  </Box>
                </Paper>
              </Grid>

              {/* Шаг 3 */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 4, borderRadius: 3, height: '100%', border: '1px solid #e0e0e0' }} elevation={0}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 3 }}>
                      <Typography variant="h4" color="white" fontWeight={700}>3</Typography>
                    </Box>
                    <Box>
                      <Typography variant="h5" fontWeight={600}>ИИ анализирует ответы</Typography>
                      <Typography variant="body2" color="text.secondary">Детальный анализ каждого ответа</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Icon icon="mdi:check-circle" color="#4caf50" width={20} height={20} />
                    <Typography variant="body2">Оценка качества и полноты ответов</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Icon icon="mdi:check-circle" color="#4caf50" width={20} height={20} />
                    <Typography variant="body2">Ранжирование кандидатов</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Icon icon="mdi:check-circle" color="#4caf50" width={20} height={20} />
                    <Typography variant="body2">Выявление сильных и слабых сторон</Typography>
                  </Box>
                </Paper>
              </Grid>

              {/* Шаг 4 */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 4, borderRadius: 3, height: '100%', border: '1px solid #e0e0e0' }} elevation={0}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 3 }}>
                      <Typography variant="h4" color="white" fontWeight={700}>4</Typography>
                    </Box>
                    <Box>
                      <Typography variant="h5" fontWeight={600}>Получаете готовый отчёт</Typography>
                      <Typography variant="body2" color="text.secondary">Детальные рекомендации для принятия решения</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Icon icon="mdi:check-circle" color="#4caf50" width={20} height={20} />
                    <Typography variant="body2">Сравнение кандидатов</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Icon icon="mdi:check-circle" color="#4caf50" width={20} height={20} />
                    <Typography variant="body2">Рекомендации по найму</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Icon icon="mdi:check-circle" color="#4caf50" width={20} height={20} />
                    <Typography variant="body2">Экспорт данных в любом формате</Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            {/* Дополнительная информация */}
            <Box sx={{ bgcolor: 'white', p: 4, borderRadius: 3, border: '1px solid #e0e0e0' }}>
              <Typography variant="h5" fontWeight={600} mb={3} align="center">
                Преимущества процесса
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Icon icon="mdi:clock-fast" color="#4CAF50" width={24} height={24} />
                    <Typography variant="body2">Экономия времени HR</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Icon icon="mdi:currency-usd" color="#FF9800" width={24} height={24} />
                    <Typography variant="body2">Снижение затрат на найм</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Icon icon="mdi:chart-line" color="#2196F3" width={24} height={24} />
                    <Typography variant="body2">Объективная оценка</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Icon icon="mdi:shield-check" color="#9C27B0" width={24} height={24} />
                    <Typography variant="body2">Безопасность данных</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Container>
        </Box>
      </Box>

      {/* Четвёртый экран - Кейсы и отзывы клиентов */}
      <Box id="testimonials-section" sx={{ bgcolor: '#f8fafc', py: 12, position: 'relative', zIndex: 2, scrollMarginTop: '80px' }}>
        <Container maxWidth="lg">
          {/* Заголовок с градиентом */}
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
              Реальные результаты клиентов
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Истории успеха и конкретные цифры экономии от реальных компаний
            </Typography>
          </Box>

          {/* Кейсы клиентов - карточки с градиентами */}
          <Box sx={{ mb: 10 }}>
            <Typography variant="h3" align="center" fontWeight={700} mb={6}>
              Истории успеха
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Box sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  p: 4,
                  borderRadius: 4,
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                  }
                }}>
                  <Box sx={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, position: 'relative', zIndex: 1 }}>
                    <Box sx={{ width: 60, height: 60, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 3 }}>
                      <Icon icon="mdi:bank" color="white" width={32} height={32} />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>IT-компания</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>TechCorp</Typography>
                    </Box>
                  </Box>
                  <Typography variant="body1" mb={4} sx={{ lineHeight: 1.6, position: 'relative', zIndex: 1 }}>
                    Автоматизировали найм разработчиков. Сократили время закрытия вакансии с 45 до 7 дней.
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'white' }} />
                      <Typography variant="body2">Экономия: 85% времени HR</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'white' }} />
                      <Typography variant="body2">Сокращение затрат: 5x</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'white' }} />
                      <Typography variant="body2">Улучшение качества найма: 40%</Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box sx={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  p: 4,
                  borderRadius: 4,
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                  }
                }}>
                  <Box sx={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, position: 'relative', zIndex: 1 }}>
                    <Box sx={{ width: 60, height: 60, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 3 }}>
                      <Icon icon="mdi:factory" color="white" width={32} height={32} />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>Производственная компания</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>SalesForce</Typography>
                    </Box>
                  </Box>
                  <Typography variant="body1" mb={4} sx={{ lineHeight: 1.6, position: 'relative', zIndex: 1 }}>
                    Внедрили для найма специалистов по продажам. Обработали 500+ кандидатов за месяц.
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'white' }} />
                      <Typography variant="body2">Обработано кандидатов: 500+</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'white' }} />
                      <Typography variant="body2">Экономия бюджета: 300,000₽</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'white' }} />
                      <Typography variant="body2">Скорость найма: 3x быстрее</Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box sx={{
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  p: 4,
                  borderRadius: 4,
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                  }
                }}>
                  <Box sx={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, position: 'relative', zIndex: 1 }}>
                    <Box sx={{ width: 60, height: 60, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 3 }}>
                      <Icon icon="mdi:school" color="white" width={32} height={32} />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>HR-агентство</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>RecruitPro</Typography>
                    </Box>
                  </Box>
                  <Typography variant="body1" mb={4} sx={{ lineHeight: 1.6, position: 'relative', zIndex: 1 }}>
                    Используют для клиентов из разных отраслей. Масштабировали бизнес в 3 раза.
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'white' }} />
                      <Typography variant="body2">Рост клиентов: 3x</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'white' }} />
                      <Typography variant="body2">Экономия времени: 70%</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'white' }} />
                      <Typography variant="body2">Увеличение прибыли: 250%</Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Отзывы клиентов - рабочий слайдер */}
          <Box sx={{ mb: 8 }}>
            <Typography variant="h3" align="center" fontWeight={700} mb={6}>
              Что говорят наши клиенты
            </Typography>

            <Box sx={{ position: 'relative', maxWidth: 800, mx: 'auto' }}>
              {/* Кнопки навигации */}
              <IconButton
                onClick={handlePrevSlide}
                sx={{
                  position: 'absolute',
                  left: -60,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'white',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  '&:hover': { bgcolor: '#f5f5f5' },
                  zIndex: 2
                }}
              >
                <Icon icon="mdi:chevron-left" width={24} height={24} />
              </IconButton>

              <IconButton
                onClick={handleNextSlide}
                sx={{
                  position: 'absolute',
                  right: -60,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'white',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  '&:hover': { bgcolor: '#f5f5f5' },
                  zIndex: 2
                }}
              >
                <Icon icon="mdi:chevron-right" width={24} height={24} />
              </IconButton>

              <Box sx={{
                bgcolor: 'white',
                p: 6,
                borderRadius: 4,
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                position: 'relative',
                overflow: 'hidden',
                minHeight: 300
              }}>
                <Box sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                }} />
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography variant="h4" sx={{ fontStyle: 'italic', color: '#333', mb: 3 }}>
                    "{testimonials[currentSlide].text}"
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    <Avatar
                      src={testimonials[currentSlide].avatar}
                      alt={testimonials[currentSlide].name}
                      sx={{
                        width: 80,
                        height: 80,
                        border: '4px solid #667eea',
                        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
                      }}
                    />
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography variant="h6" fontWeight={700} color="#333">{testimonials[currentSlide].name}</Typography>
                      <Typography variant="body2" color="text.secondary">{testimonials[currentSlide].position}</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Навигационные точки */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 3 }}>
                {testimonials.map((_, index) => (
                  <Box
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: index === currentSlide ? '#667eea' : '#e0e0e0',
                      cursor: 'pointer',
                      transition: 'background-color 0.3s ease',
                      '&:hover': {
                        bgcolor: index === currentSlide ? '#667eea' : '#c0c0c0'
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>

          {/* Статистика успеха - круговые диаграммы */}
          <Box sx={{ bgcolor: 'white', p: 6, borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
            <Typography variant="h4" align="center" fontWeight={700} mb={6}>
              Результаты внедрения SofiHR
            </Typography>
            <Grid container spacing={6}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', position: 'relative' }}>
                  <Box sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: 'conic-gradient(#4caf50 0deg 342deg, #e0e0e0 342deg 360deg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                    position: 'relative'
                  }}>
                    <Box sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Typography variant="h4" fontWeight={700} color="#4caf50">95%</Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Клиентов рекомендуют SofiHR
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: 'conic-gradient(#2196F3 0deg 288deg, #e0e0e0 288deg 360deg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                    position: 'relative'
                  }}>
                    <Box sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Typography variant="h4" fontWeight={700} color="#2196F3">80%</Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Экономия времени HR
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: 'conic-gradient(#FF9800 0deg 252deg, #e0e0e0 252deg 360deg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                    position: 'relative'
                  }}>
                    <Box sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Typography variant="h4" fontWeight={700} color="#FF9800">70%</Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Снижение затрат на найм
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: 'conic-gradient(#9C27B0 0deg 216deg, #e0e0e0 216deg 360deg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                    position: 'relative'
                  }}>
                    <Box sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Typography variant="h4" fontWeight={700} color="#9C27B0">60%</Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Улучшение качества найма
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>


        </Container>
      </Box>


      {/* Пятый экран - Тарифы и цены */}
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
            {/* Пакет 1 - Старт */}
            <Grid item xs={12} md={4}>
              <Box sx={{
                bgcolor: 'white',
                p: 4,
                borderRadius: 4,
                border: '2px solid #e0e0e0',
                position: 'relative',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  borderColor: '#2196F3'
                }
              }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography variant="h5" fontWeight={700} mb={2}>Старт</Typography>
                  <Typography variant="h3" fontWeight={800} color="#2196F3" mb={1}>2,400₽</Typography>
                  <Typography variant="body2" color="text.secondary">за 20 интервью</Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Icon icon="mdi:check-circle" color="#4caf50" width={20} height={20} />
                    <Typography variant="body2" sx={{ ml: 2 }}>20 AI-интервью</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Icon icon="mdi:check-circle" color="#4caf50" width={20} height={20} />
                    <Typography variant="body2" sx={{ ml: 2 }}>Анализ ответов ИИ</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Icon icon="mdi:check-circle" color="#4caf50" width={20} height={20} />
                    <Typography variant="body2" sx={{ ml: 2 }}>Ранжирование кандидатов</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Icon icon="mdi:check-circle" color="#4caf50" width={20} height={20} />
                    <Typography variant="body2" sx={{ ml: 2 }}>Видео и аудио запись</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Icon icon="mdi:check-circle" color="#4caf50" width={20} height={20} />
                    <Typography variant="body2" sx={{ ml: 2 }}>Базовые шаблоны</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Icon icon="mdi:check-circle" color="#4caf50" width={20} height={20} />
                    <Typography variant="body2" sx={{ ml: 2 }}>Поддержка по email</Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Пакет 2 - Бизнес (рекомендуемый) */}
            <Grid item xs={12} md={4}>
              <Box sx={{
                bgcolor: 'white',
                p: 4,
                borderRadius: 4,
                border: '2px solid #2196F3',
                position: 'relative',
                transition: 'all 0.3s ease',
                transform: 'scale(1.05)',
                '&:hover': {
                  transform: 'scale(1.05) translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(33, 150, 243, 0.2)'
                }
              }}>
                {/* Бейдж "Популярный" */}
                <Box sx={{
                  position: 'absolute',
                  top: -12,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  bgcolor: '#FF9800',
                  color: 'white',
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  fontSize: '0.875rem',
                  fontWeight: 600
                }}>
                  Популярный
                </Box>

                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography variant="h5" fontWeight={700} mb={2}>Бизнес</Typography>
                  <Typography variant="h3" fontWeight={800} color="#2196F3" mb={1}>5,000₽</Typography>
                  <Typography variant="body2" color="text.secondary">за 50 интервью</Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Icon icon="mdi:check-circle" color="#4caf50" width={20} height={20} />
                    <Typography variant="body2" sx={{ ml: 2 }}>50 AI-интервью</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Icon icon="mdi:check-circle" color="#4caf50" width={20} height={20} />
                    <Typography variant="body2" sx={{ ml: 2 }}>Расширенный анализ ИИ</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Icon icon="mdi:check-circle" color="#4caf50" width={20} height={20} />
                    <Typography variant="body2" sx={{ ml: 2 }}>Детальные отчеты</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Icon icon="mdi:check-circle" color="#4caf50" width={20} height={20} />
                    <Typography variant="body2" sx={{ ml: 2 }}>Кастомные шаблоны</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Icon icon="mdi:check-circle" color="#4caf50" width={20} height={20} />
                    <Typography variant="body2" sx={{ ml: 2 }}>Мультикомпанийность</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Icon icon="mdi:check-circle" color="#4caf50" width={20} height={20} />
                    <Typography variant="body2" sx={{ ml: 2 }}>Приоритетная поддержка</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Icon icon="mdi:check-circle" color="#4caf50" width={20} height={20} />
                    <Typography variant="body2" sx={{ ml: 2 }}>Экспорт данных</Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Пакет 3 - Премиум */}
            <Grid item xs={12} md={4}>
              <Box sx={{
                bgcolor: 'white',
                p: 4,
                borderRadius: 4,
                border: '2px solid #e0e0e0',
                position: 'relative',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  borderColor: '#9C27B0'
                }
              }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography variant="h5" fontWeight={700} mb={2}>Премиум</Typography>
                  <Typography variant="h3" fontWeight={800} color="#9C27B0" mb={1}>8,000₽</Typography>
                  <Typography variant="body2" color="text.secondary">за 100 интервью</Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Icon icon="mdi:check-circle" color="#4caf50" width={20} height={20} />
                    <Typography variant="body2" sx={{ ml: 2 }}>100 AI-интервью</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Icon icon="mdi:check-circle" color="#4caf50" width={20} height={20} />
                    <Typography variant="body2" sx={{ ml: 2 }}>AI-генерация вопросов</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Icon icon="mdi:check-circle" color="#4caf50" width={20} height={20} />
                    <Typography variant="body2" sx={{ ml: 2 }}>Сравнение кандидатов</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Icon icon="mdi:check-circle" color="#4caf50" width={20} height={20} />
                    <Typography variant="body2" sx={{ ml: 2 }}>Неограниченные шаблоны</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Icon icon="mdi:check-circle" color="#4caf50" width={20} height={20} />
                    <Typography variant="body2" sx={{ ml: 2 }}>Аналитика и дашборды</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Icon icon="mdi:check-circle" color="#4caf50" width={20} height={20} />
                    <Typography variant="body2" sx={{ ml: 2 }}>Персональный менеджер</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Icon icon="mdi:check-circle" color="#4caf50" width={20} height={20} />
                    <Typography variant="body2" sx={{ ml: 2 }}>API доступ</Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
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

      {/* Шестой экран - CTA */}
      <Box id="cta-section" sx={{ py: 16, bgcolor: '#f8fafc', position: 'relative', zIndex: 2, scrollMarginTop: '80px' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            {/* Заголовок */}
            <Typography
              variant="h2"
              fontWeight={800}
              sx={{
                background: 'linear-gradient(45deg, #2196F3, #9C27B0)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 3
              }}
            >
              Готовы автоматизировать найм?
            </Typography>

            {/* Подзаголовок */}
            <Typography variant="h5" color="text.secondary" sx={{ mb: 6, maxWidth: 700, mx: 'auto' }}>
              Присоединяйтесь к тысячам HR-специалистов, которые уже используют SofiHR для эффективного найма
            </Typography>

            {/* Статистика */}
            <Grid container spacing={4} justifyContent="center" sx={{ mb: 8 }}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" fontWeight={700} color="#2196F3">500+</Typography>
                  <Typography variant="body1" color="text.secondary">Компаний</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" fontWeight={700} color="#4CAF50">10,000+</Typography>
                  <Typography variant="body1" color="text.secondary">Интервью</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" fontWeight={700} color="#FF9800">95%</Typography>
                  <Typography variant="body1" color="text.secondary">Довольных клиентов</Typography>
                </Box>
              </Grid>
            </Grid>

            {/* CTA кнопки */}
            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                href="/hr/dashboard"
                sx={{
                  bgcolor: '#2196F3',
                  px: 6,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 3,
                  '&:hover': {
                    bgcolor: '#1976D2',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(33, 150, 243, 0.3)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Перейти в HR панель
              </Button>

              <Button
                variant="outlined"
                size="large"
                href="/auth/phone"
                sx={{
                  borderColor: '#2196F3',
                  color: '#2196F3',
                  px: 6,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 3,
                  '&:hover': {
                    bgcolor: '#2196F3',
                    color: 'white',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(33, 150, 243, 0.3)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Попробовать бесплатно
              </Button>
            </Box>

            {/* Дополнительная информация */}
            <Box sx={{ mt: 6 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Без кредитной карты • 14 дней бесплатно • Отмена в любое время
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <Icon icon="mdi:shield-check" color="#4caf50" width={20} height={20} />
                <Typography variant="body2" color="text.secondary">
                  Безопасность данных гарантирована
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Футер */}
      <Box sx={{ bgcolor: "#0A1929", color: "white", py: 4, position: 'relative', zIndex: 2 }}>
        <Container maxWidth="lg">
          <Grid container spacing={3} justifyContent="center">
            {/* Основная информация */}
            <Grid item xs={12} md={6} textAlign="center">
              <Typography variant="body2" color="grey.500" mb={2}>
                © 2025 SofiHR. Все права защищены.
              </Typography>
              <Typography variant="body2" color="grey.500">
                Система соответствует требованиям 152-ФЗ "О персональных данных"
              </Typography>
            </Grid>
            
            {/* Ссылки на документы */}
            <Grid item xs={12} md={6} textAlign="center">
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
                <Link
                  href="/privacy-policy"
                  target="_blank"
                  underline="none"
                  sx={{ 
                    color: 'grey.400', 
                    fontSize: '14px',
                    '&:hover': { color: 'white' }
                  }}
                >
                  Политика конфиденциальности
                </Link>
                <Link
                  href="/terms-of-service"
                  target="_blank"
                  underline="none"
                  sx={{ 
                    color: 'grey.400', 
                    fontSize: '14px',
                    '&:hover': { color: 'white' }
                  }}
                >
                  Условия использования
                </Link>
                <Link
                  href="/forget-me"
                  target="_blank"
                  underline="none"
                  sx={{ 
                    color: 'grey.400', 
                    fontSize: '14px',
                    '&:hover': { color: 'white' }
                  }}
                >
                  Удалить мои данные
                </Link>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
