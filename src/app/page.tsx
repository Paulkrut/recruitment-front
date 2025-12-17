"use client";
import * as React from "react";
import {
  AppBar, Box, Toolbar, IconButton, Typography, Menu, Container, Button, MenuItem, Chip, Avatar, AvatarGroup, Paper, Select, LinearProgress, Grid, AccordionSummary, AccordionDetails, Stack, CardContent, Accordion, Card, useTheme, useMediaQuery, Link, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemIcon, ListItemText, Divider, Alert, Slider, Tabs, Tab, Table, TableBody, TableRow, TableCell, TableHead, Tooltip,
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
import PricingSection from "./components/landing/PricingSection";
import ROICalculator from "./components/landing/ROICalculator";
import PricingFAQ from "./components/landing/PricingFAQ";

import { useLingui } from '@lingui/react';
import { msg, Trans } from '@lingui/macro';



const { useMemo } = React;

// Определяем регион
const isUS = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_REGION === 'US';

// Функция для форматирования цены в зависимости от региона
const formatPrice = (price: number) => {
  if (isUS) {
    // Цена уже в долларах
    return `$${price.toLocaleString('en-US')}`;
  }
  return `${price.toLocaleString('ru-RU')}₽`;
};

// Технические ID для навигации (не переводятся)
const PAGE_IDS = {
  HOME: 'home',
  ADVANTAGES: 'advantages',
  HOW_IT_WORKS: 'how-it-works',
  TESTIMONIALS: 'testimonials',
  PRICING: 'pricing',
  CONTACTS: 'contacts',
} as const;

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  interviewCount: string;
  pricePerInterview: string;
  discount?: string;
  color: string;
  popular?: boolean;
  features: string[];
  detailedFeatures: Array<{ text: string; included: boolean }>;
  targetAudience: string; // Для кого подходит
}

export default function LandingPage() {
  const { _ } = useLingui();

  // Массив страниц меню с переводами
  const pages = React.useMemo(() => [
    { id: PAGE_IDS.HOME, label: _(msg`Главная`) },
    { id: PAGE_IDS.ADVANTAGES, label: _(msg`Преимущества`) },
    { id: PAGE_IDS.HOW_IT_WORKS, label: _(msg`Как это работает`) },
    { id: PAGE_IDS.TESTIMONIALS, label: _(msg`Отзывы`) },
    { id: PAGE_IDS.PRICING, label: _(msg`Тарифы`) },
    { id: PAGE_IDS.CONTACTS, label: _(msg`Контакты`) },
  ], [_]);

  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [hiresPerMonth, setHiresPerMonth] = React.useState(10); // Для калькулятора

  const handlePrevSlide = () => setCurrentSlide((prev) => prev === 0 ? testimonials.length - 1 : prev - 1);
  const handleNextSlide = () => setCurrentSlide((prev) => prev === testimonials.length - 1 ? 0 : prev + 1);
  const calculateSavings = (plan: PricingPlan, hires: number) => {
    const traditionalCostPerHire = 15000;
    const traditionalTime = 40;
    const hrHourlyCost = 1500;

    const totalTraditionalCost = hires * traditionalCostPerHire;
    const totalTraditionalTime = hires * traditionalTime;
    const totalTraditionalTimeCost = totalTraditionalTime * hrHourlyCost;

    // Безопасное извлечение числа из цены
    let platformPrice = 0;
    if (typeof plan.price === 'string') {
      if (plan.price === _(msg`Бесплатно`)) {
        platformPrice = 0;
      } else {
        const numericValue = plan.price.replace(/[^\d]/g, '');
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
  };

  // Функция плавной прокрутки к секциям
  const scrollToSection = React.useCallback((pageId: string) => {
    const sectionMap: { [key: string]: string } = {
      [PAGE_IDS.HOME]: "hero-section",
      [PAGE_IDS.ADVANTAGES]: "advantages-section",
      [PAGE_IDS.HOW_IT_WORKS]: "how-it-works-section",
      [PAGE_IDS.TESTIMONIALS]: "testimonials-section",
      [PAGE_IDS.PRICING]: "pricing-section",
      [PAGE_IDS.CONTACTS]: "cta-section",
    };

    const sectionId = sectionMap[pageId];
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
    { icon: "mdi:account-tie", title: _(msg`Экспертная поддержка`), description: _(msg`HR-автоматизация и консультации от экспертов.`), iconBg: "#FFF1F0" },
    { icon: "mdi:bank", title: _(msg`Интеграции`), description: _(msg`Интеграция с мессенджерами, job-сайтами и корпоративными сервисами.`), iconBg: "#E3F2FD" },
    { icon: "mdi:calculator", title: _(msg`Гибкие тарифы`), description: _(msg`Доступно для команд любого размера.`), iconBg: "#E6F7F0" },
    { icon: "mdi:chart-line", title: _(msg`Аналитика`), description: _(msg`Вся статистика по вакансиям и кандидатам в одном месте.`), iconBg: "#FFF4E5" },
  ];
  const features1 = [
    { icon: "mdi:account-group", title: _(msg`Командная работа`), isActive: true },
    { icon: "mdi:bank", title: _(msg`Платежи`), isActive: false },
    { icon: "mdi:code-brackets", title: _(msg`Встраивание`), isActive: false },
    { icon: "mdi:workflow", title: _(msg`Автоматизация`), isActive: false },
  ];
  const accordionItems = [
    { title: _(msg`Внешние коллеги`), content: _(msg`Можно приглашать подрядчиков и консультантов в процессы найма.`) },
    { title: _(msg`Объединение расписаний`), content: _(msg`Автоматическое согласование времени для всех участников интервью.`), expanded: true },
    { title: _(msg`Ротация кандидатов`), content: _(msg`Гибкие сценарии распределения кандидатов между HR-менеджерами.`) },
  ];
  const testimonials = [
    {
      text: _(msg`SofiHR полностью изменил наш процесс найма. Теперь мы тратим в 5 раз меньше времени на первичные интервью и получаем более качественных кандидатов.`),
      name: _(msg`Екатерина Иванова`),
      position: "HR Lead, TechCorp",
      avatar: "/images/profile/user-9.jpg"
    },
    {
      text: _(msg`ИИ-интервью помогли нам обработать в 10 раз больше кандидатов при том же количестве HR-специалистов. ROI проекта составил 400%.`),
      name: _(msg`Андрей Смирнов`),
      position: "HR Director, SalesForce",
      avatar: user2.src
    },
    {
      text: _(msg`Автоматизация интервью позволила нам масштабировать бизнес в 3 раза. Теперь мы можем обрабатывать в 5 раз больше вакансий.`),
      name: _(msg`Мария Петрова`),
      position: "CEO, RecruitPro",
      avatar: "/images/profile/user3.jpg"
    }
  ];
  const companies = [ { name: "Intel" }, { name: "Oracle" }, { name: "Dell" }, { name: "Samsung" }, { name: "Infosys" }, { name: "Capgemini" } ];
  const sections = [
    { title: _(msg`Возможности`), links: [_(msg`Вакансии`), _(msg`Кандидаты`), _(msg`Интервью`), _(msg`Аналитика`), _(msg`Интеграции`)] },
    { title: _(msg`Документация`), links: [_(msg`API`), _(msg`FAQ`), _(msg`Поддержка`)] },
    { title: _(msg`Компания`), links: [_(msg`О нас`), _(msg`Блог`), _(msg`Контакты`)] },
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

  // Тарифные планы
  const pricingPlans: PricingPlan[] = [
    {
      id: 'trial',
      name: _(msg`Пробный`),
      price: _(msg`Бесплатно`),
      interviewCount: _(msg`10 интервью`),
      pricePerInterview: isUS ? '$0' : '0₽',
      color: '#607D8B',
      targetAudience: _(msg`Для тестирования платформы без финансовых вложений`),
      features: [
        _(msg`10 AI-интервью бесплатно`),
        _(msg`Базовый анализ ИИ`),
        _(msg`Ранжирование кандидатов`),
        _(msg`Видео и аудио запись`),
        _(msg`Базовые шаблоны`),
        _(msg`Поддержка по email`)
      ],
      detailedFeatures: [
        { text: _(msg`10 AI-интервью для тестирования платформы`), included: true },
        { text: _(msg`Базовый анализ ответов с помощью ИИ`), included: true },
        { text: _(msg`Автоматическое ранжирование кандидатов`), included: true },
        { text: _(msg`Запись видео и аудио ответов`), included: true },
        { text: _(msg`Доступ к базовым шаблонам интервью`), included: true },
        { text: _(msg`Поддержка по email (ответ в течение 48 часов)`), included: true },
        { text: _(msg`Детальные отчеты`), included: false },
        { text: _(msg`Кастомные шаблоны`), included: false },
        { text: _(msg`Мультикомпанийность`), included: false },
        { text: _(msg`API доступ`), included: false }
      ]
    },
    {
      id: 'start',
      name: _(msg`Старт`),
      price: formatPrice(isUS ? 999 : 13500),
      interviewCount: _(msg`100 интервью`),
      pricePerInterview: formatPrice(isUS ? 10 : 135), // $0.10 или 135₽ за интервью
      color: '#4CAF50',
      targetAudience: _(msg`Для небольших компаний и стартапов до 10 найма/месяц`),
      features: [
        _(msg`100 AI-интервью`),
        _(msg`Полный анализ ответов ИИ`),
        _(msg`Ранжирование кандидатов`),
        _(msg`Видео и аудио запись`),
        _(msg`Базовые шаблоны`),
        _(msg`Поддержка по email`)
      ],
      detailedFeatures: [
        { text: _(msg`100 AI-интервью`), included: true },
        { text: _(msg`Полный анализ ответов с помощью ИИ`), included: true },
        { text: _(msg`Автоматическое ранжирование кандидатов`), included: true },
        { text: _(msg`Запись видео и аудио ответов`), included: true },
        { text: _(msg`Базовые шаблоны интервью`), included: true },
        { text: _(msg`Поддержка по email`), included: true },
        { text: _(msg`Экспорт базовых отчетов`), included: true },
        { text: _(msg`Детальные отчеты`), included: false },
        { text: _(msg`Кастомные шаблоны`), included: false },
        { text: _(msg`Мультикомпанийность`), included: false }
      ]
    },
    {
      id: 'business',
      name: _(msg`Бизнес`),
      price: formatPrice(isUS ? 3999 : 54000),
      interviewCount: _(msg`500 интервью`),
      pricePerInterview: formatPrice(isUS ? 7.99 : 108),
      discount: _(msg`Экономия 20%`),
      color: '#2196F3',
      popular: true,
      targetAudience: _(msg`Для средних компаний с активным процессом найма`),
      features: [
        _(msg`500 AI-интервью`),
        _(msg`Расширенный анализ ИИ`),
        _(msg`Детальные отчеты`),
        _(msg`Кастомные шаблоны`),
        _(msg`Мультикомпанийность`),
        _(msg`Приоритетная поддержка`),
        _(msg`Экспорт данных`)
      ],
      detailedFeatures: [
        { text: _(msg`500 AI-интервью`), included: true },
        { text: _(msg`Расширенный анализ ответов с помощью ИИ`), included: true },
        { text: _(msg`Детальные отчеты по всем кандидатам`), included: true },
        { text: _(msg`Создание кастомных шаблонов интервью`), included: true },
        { text: _(msg`Работа с несколькими компаниями`), included: true },
        { text: _(msg`Приоритетная поддержка (ответ в течение 4 часов)`), included: true },
        { text: _(msg`Экспорт данных в различных форматах`), included: true },
        { text: _(msg`Интеграции с внешними системами`), included: true },
        { text: _(msg`Персональный менеджер`), included: false },
        { text: _(msg`API доступ`), included: false }
      ]
    },
    {
      id: 'premium',
      name: _(msg`Премиум`),
      price: formatPrice(isUS ? 6999 : 90000),
      interviewCount: _(msg`1000 интервью`),
      pricePerInterview: formatPrice(isUS ? 6.99 : 90),
      discount: _(msg`Экономия 33%`),
      color: '#9C27B0',
      targetAudience: _(msg`Для крупных компаний и HR-агентств с высокой нагрузкой`),
      features: [
        _(msg`1000 AI-интервью`),
        _(msg`AI-генерация вопросов`),
        _(msg`Сравнение кандидатов`),
        _(msg`Неограниченные шаблоны`),
        _(msg`Аналитика и дашборды`),
        _(msg`Персональный менеджер`),
        _(msg`API доступ`)
      ],
      detailedFeatures: [
        { text: _(msg`1000 AI-интервью`), included: true },
        { text: _(msg`AI-генерация вопросов на основе вакансии`), included: true },
        { text: _(msg`Детальное сравнение кандидатов`), included: true },
        { text: _(msg`Неограниченное количество шаблонов`), included: true },
        { text: _(msg`Продвинутая аналитика и дашборды`), included: true },
        { text: _(msg`Персональный менеджер (24/7)`), included: true },
        { text: _(msg`Полный API доступ`), included: true },
        { text: _(msg`Интеграции с любыми системами`), included: true },
        { text: _(msg`Приоритетная разработка функций`), included: true },
        { text: _(msg`SLA гарантия 99.9%`), included: true }
      ]
    }
  ];

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
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    href="/auth/register"
                    sx={{ display: { xs: 'none', md: 'inline-flex' } }}
                  ><Trans>Регистрация</Trans></Button>
                  
                  <Button variant="contained" color="primary" href="/auth/login"><Trans>Войти</Trans></Button>
                  
                  {/* Компактная кнопка HH OAuth */}
                  <Tooltip title={_(msg`Войти через HeadHunter`)} arrow placement="bottom">
                    <IconButton
                      onClick={() => {
                        window.location.href = `${process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test'}/api/auth/hh`;
                      }}
                      sx={{
                        width: 40,
                        height: 40,
                        border: '2px solid #D6001C',
                        borderRadius: 1.5,
                        bgcolor: '#FFF',
                        transition: 'all 0.2s ease-in-out',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: '#D6001C',
                          borderColor: '#D6001C',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(214, 0, 28, 0.3)',
                          '& .hh-text': {
                            color: '#FFF',
                          },
                        },
                      }}
                    >
                      <Typography 
                        className="hh-text"
                        sx={{ 
                          color: '#D6001C', 
                          fontSize: '1rem',
                          fontWeight: 700,
                          lineHeight: 1,
                          transition: 'color 0.2s',
                        }}
                      >
                        hh
                      </Typography>
                    </IconButton>
                  </Tooltip>
                </Box>
              </Toolbar>
            </AppBar>
          </Container>
        </Box>
        {/* Контент Hero поверх */}
        <Container maxWidth="lg" id="hero-section" sx={{ pt: { xs: 4, sm: 3, md: 2 }, position: 'relative', zIndex: 1, bgcolor: 'transparent', flex: 1, display: 'flex', alignItems: 'center' }}>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: "center", gap: 4 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h1" sx={{ fontSize: { xs: "2.2rem", md: "3rem" }, fontWeight: 700, mb: 1.5, lineHeight: 1.2 }}><Trans>HR-платформа для автоматизации найма и интервью</Trans></Typography>
              <Typography variant="h5" color="text.secondary" mb={2.5} sx={{ fontSize: { xs: "1.1rem", md: "1.25rem" } }}><Trans>Платформа для собеседований, генерации вопросов, оценки кандидатов с помощью ИИ.</Trans></Typography>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <AvatarGroup max={3} sx={{ mr: 2 }}>
                  <Avatar alt="User 1" src={user1.src} />
                  <Avatar alt="User 2" src={user2.src} />
                  <Avatar alt="User 3" src={user3.src} />
                </AvatarGroup>
                <Typography variant="body1" color="text.secondary"                ><Trans>
                  {totalClients.toLocaleString()}+ HR и компаний уже с нами
                </Trans></Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mb: 2.5, flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Typography variant="body1">📝</Typography>
                  <Typography variant="body1"><Trans>Генерировать вопросы для любой вакансии за 1 клик</Trans></Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Typography variant="body1">🎥</Typography>
                  <Typography variant="body1"><Trans>Проводить видеоинтервью с помощью ИИ, без ваших усилий</Trans></Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Typography variant="body1">📊</Typography>
                  <Typography variant="body1"><Trans>Получать объективную оценку и сравнение кандидатов</Trans></Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Typography variant="body1">🔍</Typography>
                  <Typography variant="body1"><Trans>Проверять знание регламентов и внутренних правил</Trans></Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Typography variant="body1">⚡</Typography>
                  <Typography variant="body1"><Trans>Обрабатывать большой поток вакансий и кандидатов качественно в сжатые сроки</Trans></Typography>
                </Box>
                <Box sx={{ 
                  mt: 1.5, 
                  p: 1.5, 
                  borderRadius: 1, 
                  bgcolor: 'primary.50',
                  border: '1px solid',
                  borderColor: 'primary.200'
                }}>
                  <Typography variant="body1" fontWeight={600} sx={{ color: 'primary.main' }}>
                    <Trans>Первые 10 интервью бесплатно — попробуйте, как это работает.</Trans>
                  </Typography>
                </Box>
              </Box>
              {/* Блок интеграции с HH.ru */}
              <Paper 
                elevation={0}
                sx={{ 
                  display: "inline-flex", 
                  alignItems: "center", 
                  gap: 2, 
                  p: 2,
                  mb: 3,
                  bgcolor: 'rgba(214, 0, 28, 0.04)',
                  border: '2px solid rgba(214, 0, 28, 0.2)',
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(214, 0, 28, 0.08)',
                    borderColor: 'rgba(214, 0, 28, 0.4)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 20px rgba(214, 0, 28, 0.15)',
                  }
                }}
              >
                <Box sx={{ 
                  width: 56, 
                  height: 56, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  bgcolor: '#D6001C',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(214, 0, 28, 0.3)',
                }}>
                  <Icon icon="mdi:briefcase-check" width={32} height={32} style={{ color: '#FFF' }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#D6001C', mb: 0.5 }}>
                    <Trans>Интеграция с HeadHunter</Trans>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <Trans>Автоматическая загрузка вакансий и кандидатов из HH.ru</Trans>
                  </Typography>
                </Box>
                <Box sx={{ ml: 'auto', display: { xs: 'none', sm: 'block' } }}>
                  <Icon icon="mdi:check-circle" width={28} height={28} style={{ color: '#4CAF50' }} />
                </Box>
              </Paper>
            </Box>
            {/* Dashboard Preview */}
            <Box sx={{ flex: 1, display: { xs: "none", lg: "block" } }}>
              <Paper elevation={3} sx={{ p: 3, borderRadius: 2, bgcolor: "background.paper" }}>
                <Typography variant="h6" gutterBottom><Trans>Автоматизация собеседований</Trans></Typography>
                <Typography variant="body2" color="text.secondary" mb={3}><Trans>Работаем с вашими кандидатами — проводим интервью и оцениваем</Trans></Typography>
                <Grid container spacing={2} mb={2}>
                  <Grid item xs={6}>
                    <Typography variant="h5" fontWeight={700}>{totalInterviews.toLocaleString()}</Typography>
                    <Typography variant="body2" color="text.secondary"><Trans>Интервью проведено</Trans></Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h5" fontWeight={700}>{totalCandidates.toLocaleString()}</Typography>
                    <Typography variant="body2" color="text.secondary"><Trans>Кандидатов оценено</Trans></Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h5" fontWeight={700}>24/7</Typography>
                    <Typography variant="body2" color="text.secondary"><Trans>Работаем круглосуточно</Trans></Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h5" fontWeight={700}>17x</Typography>
                    <Typography variant="body2" color="text.secondary"><Trans>Быстрее отбор</Trans></Typography>
                  </Grid>
                </Grid>
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary"><Trans>⚡ Автоматическая генерация вопросов</Trans></Typography>
                  <Typography variant="body2" color="text.secondary"><Trans>🤖 ИИ проводит интервью за вас</Trans></Typography>
                  <Typography variant="body2" color="text.secondary"><Trans>📊 Объективная оценка каждого кандидата</Trans></Typography>
                </Box>
                <Box mb={3}>
                  <Typography variant="body2" color="text.secondary" mb={1}><Trans>Интеграции:</Trans></Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Icon icon="logos:telegram" width={24} height={24} />
                    <Icon icon="logos:whatsapp-icon" width={24} height={24} />
                    <Icon icon="logos:1c" width={24} height={24} />
                    <Icon icon="logos:excel" width={24} height={24} />
                  </Box>
                </Box>
                <Button variant="contained" color="primary" size="large" href="/auth/register" sx={{
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
                }}><Trans>Попробовать бесплатно</Trans></Button>
              </Paper>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Второй экран - Преимущества */}
      <Box id="advantages-section" sx={{ bgcolor: "white", py: 8, position: 'relative', zIndex: 2, scrollMarginTop: '80px' }}>
        <Container maxWidth="lg">

          {/* Заголовок раздела */}
          <Typography variant="h3" align="center" fontWeight={700} mb={2}><Trans>AI-интервью: революция в найме</Trans></Typography>
          <Typography variant="h6" align="center" color="text.secondary" mb={6}><Trans>Автоматизируйте весь процесс интервью с помощью искусственного интеллекта</Trans></Typography>

          {/* Основные функции AI-интервью */}
          <Grid container spacing={4} mb={8}>
            <Grid item xs={12} sm={6} md={4}>
              <Paper sx={{ p: 4, borderRadius: 3, height: '100%', border: '1px solid #e0e0e0' }} elevation={0}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ width: 56, height: 56, borderRadius: 2, bgcolor: '#E3F2FD', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                    <Icon icon="mdi:robot" color="#2196F3" width={32} height={32} />
                  </Box>
                  <Typography variant="h6" fontWeight={600}><Trans>Автоматические интервью</Trans></Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={3}><Trans>ИИ проводит интервью без участия интервьюера. Адаптивные вопросы на основе предыдущих ответов.</Trans></Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Icon icon="mdi:check-circle" color="#4caf50" width={16} height={16} />
                  <Typography variant="caption"><Trans>15 минут на интервью</Trans></Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Paper sx={{ p: 4, borderRadius: 3, height: '100%', border: '1px solid #e0e0e0' }} elevation={0}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ width: 56, height: 56, borderRadius: 2, bgcolor: '#E8F5E8', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                    <Icon icon="mdi:brain" color="#4CAF50" width={32} height={32} />
                  </Box>
                  <Typography variant="h6" fontWeight={600}><Trans>Анализ каждого ответа</Trans></Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={3}><Trans>ИИ оценивает качество, полноту и релевантность каждого ответа кандидата.</Trans></Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Icon icon="mdi:check-circle" color="#4caf50" width={16} height={16} />
                  <Typography variant="caption"><Trans>Детальная оценка</Trans></Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Paper sx={{ p: 4, borderRadius: 3, height: '100%', border: '1px solid #e0e0e0' }} elevation={0}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ width: 56, height: 56, borderRadius: 2, bgcolor: '#FFF3E0', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                    <Icon icon="mdi:chart-line" color="#FF9800" width={32} height={32} />
                  </Box>
                  <Typography variant="h6" fontWeight={600}><Trans>Ранжирование кандидатов</Trans></Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={3}><Trans>Автоматическая сортировка кандидатов по релевантности и качеству ответов.</Trans></Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Icon icon="mdi:check-circle" color="#4caf50" width={16} height={16} />
                  <Typography variant="caption"><Trans>Умная сортировка</Trans></Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Paper sx={{ p: 4, borderRadius: 3, height: '100%', border: '1px solid #e0e0e0' }} elevation={0}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ width: 56, height: 56, borderRadius: 2, bgcolor: '#F3E5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                    <Icon icon="mdi:comment-question" color="#9C27B0" width={32} height={32} />
                  </Box>
                  <Typography variant="h6" fontWeight={600}><Trans>Дополнительные вопросы</Trans></Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={3}><Trans>ИИ автоматически задаёт уточняющие вопросы на основе контекста ответов.</Trans></Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Icon icon="mdi:check-circle" color="#4caf50" width={16} height={16} />
                  <Typography variant="caption"><Trans>Адаптивные вопросы</Trans></Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Paper sx={{ p: 4, borderRadius: 3, height: '100%', border: '1px solid #e0e0e0' }} elevation={0}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ width: 56, height: 56, borderRadius: 2, bgcolor: '#E1F5FE', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                    <Icon icon="mdi:file-document" color="#00BCD4" width={32} height={32} />
                  </Box>
                  <Typography variant="h6" fontWeight={600}><Trans>Развёрнутый отчёт</Trans></Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={3}><Trans>Сравнение выбранных кандидатов с анализом сильных и слабых сторон.</Trans></Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Icon icon="mdi:check-circle" color="#4caf50" width={16} height={16} />
                  <Typography variant="caption"><Trans>Детальный анализ</Trans></Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Paper sx={{ p: 4, borderRadius: 3, height: '100%', border: '1px solid #e0e0e0' }} elevation={0}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ width: 56, height: 56, borderRadius: 2, bgcolor: '#FCE4EC', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                    <Icon icon="mdi:video" color="#E91E63" width={32} height={32} />
                  </Box>
                  <Typography variant="h6" fontWeight={600}><Trans>Видео и аудио запись</Trans></Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={3}><Trans>Запись интервью в реальном времени с возможностью просмотра и анализа.</Trans></Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Icon icon="mdi:check-circle" color="#4caf50" width={16} height={16} />
                  <Typography variant="caption"><Trans>Полная запись</Trans></Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Дополнительные функции управления */}
          <Typography variant="h4" align="center" fontWeight={700} mb={4}><Trans>Дополнительные возможности</Trans></Typography>

          <Grid container spacing={3} mb={6}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                <Icon icon="mdi:domain" color="#2196F3" width={24} height={24} />
                <Typography variant="body2"><Trans>Мультикомпанийность</Trans></Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                <Icon icon="mdi:account-group" color="#4CAF50" width={24} height={24} />
                <Typography variant="body2"><Trans>Управление сотрудниками</Trans></Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                <Icon icon="mdi:shield-account" color="#FF9800" width={24} height={24} />
                <Typography variant="body2"><Trans>Система прав доступа</Trans></Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                <Icon icon="mdi:briefcase" color="#9C27B0" width={24} height={24} />
                <Typography variant="body2"><Trans>Управление вакансиями</Trans></Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                <Icon icon="mdi:file-document-outline" color="#00BCD4" width={24} height={24} />
                <Typography variant="body2"><Trans>Шаблоны интервью</Trans></Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                <Icon icon="mdi:tune" color="#E91E63" width={24} height={24} />
                <Typography variant="body2"><Trans>Настройка критериев</Trans></Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                <Icon icon="mdi:download" color="#795548" width={24} height={24} />
                <Typography variant="body2"><Trans>Экспорт данных</Trans></Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                <Icon icon="mdi:bell" color="#607D8B" width={24} height={24} />
                <Typography variant="body2"><Trans>Уведомления</Trans></Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Статистика эффективности */}
          <Box sx={{ bgcolor: '#f8fafc', p: 4, borderRadius: 3, mb: 6 }}>
            <Typography variant="h5" align="center" fontWeight={600} mb={4}><Trans>Эффективность AI-интервью</Trans></Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="primary" fontWeight={700}>
                    100%
                  </Typography>
                  <Typography variant="body2" color="text.secondary"><Trans>Интервью автоматизировано</Trans></Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="primary" fontWeight={700}>
                    17x
                  </Typography>
                  <Typography variant="body2" color="text.secondary"><Trans>Быстрее найм</Trans></Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="primary" fontWeight={700}>
                    5x
                  </Typography>
                  <Typography variant="body2" color="text.secondary"><Trans>Дешевле интервью</Trans></Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="primary" fontWeight={700}>
                    24/7
                  </Typography>
                  <Typography variant="body2" color="text.secondary"><Trans>Доступность системы</Trans></Typography>
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
            <Typography variant="h3" align="center" fontWeight={700} mb={2}><Trans>Как это работает?</Trans></Typography>
            <Typography variant="h6" align="center" color="text.secondary" mb={6}><Trans>Простой процесс автоматизации найма за 4 шага</Trans></Typography>

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
                      <Typography variant="h5" fontWeight={600}><Trans>Создаёте вакансию</Trans></Typography>
                      <Typography variant="body2" color="text.secondary"><Trans>ИИ генерирует вопросы на основе описания</Trans></Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Icon icon="mdi:check-circle" color="#4caf50" width={20} height={20} />
                    <Typography variant="body2"><Trans>Заполняете требования к позиции</Trans></Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Icon icon="mdi:check-circle" color="#4caf50" width={20} height={20} />
                    <Typography variant="body2"><Trans>ИИ создаёт адаптивные вопросы</Trans></Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Icon icon="mdi:check-circle" color="#4caf50" width={20} height={20} />
                    <Typography variant="body2"><Trans>Настраиваете критерии оценки</Trans></Typography>
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
                      <Typography variant="h5" fontWeight={600}><Trans>ИИ проводит интервью</Trans></Typography>
                      <Typography variant="body2" color="text.secondary"><Trans>Кандидат проходит автоматическое интервью</Trans></Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Icon icon="mdi:check-circle" color="#4caf50" width={20} height={20} />
                    <Typography variant="body2"><Trans>Запись видео и аудио в реальном времени</Trans></Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Icon icon="mdi:check-circle" color="#4caf50" width={20} height={20} />
                    <Typography variant="body2"><Trans>Адаптивные вопросы на основе ответов</Trans></Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Icon icon="mdi:check-circle" color="#4caf50" width={20} height={20} />
                    <Typography variant="body2"><Trans>15 минут вместо 4 часов</Trans></Typography>
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
                      <Typography variant="h5" fontWeight={600}><Trans>ИИ анализирует ответы</Trans></Typography>
                      <Typography variant="body2" color="text.secondary"><Trans>Детальный анализ каждого ответа</Trans></Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Icon icon="mdi:check-circle" color="#4caf50" width={20} height={20} />
                    <Typography variant="body2"><Trans>Оценка качества и полноты ответов</Trans></Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Icon icon="mdi:check-circle" color="#4caf50" width={20} height={20} />
                    <Typography variant="body2"><Trans>Ранжирование кандидатов</Trans></Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Icon icon="mdi:check-circle" color="#4caf50" width={20} height={20} />
                    <Typography variant="body2"><Trans>Выявление сильных и слабых сторон</Trans></Typography>
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
                      <Typography variant="h5" fontWeight={600}><Trans>Получаете готовый отчёт</Trans></Typography>
                      <Typography variant="body2" color="text.secondary"><Trans>Детальные рекомендации для принятия решения</Trans></Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Icon icon="mdi:check-circle" color="#4caf50" width={20} height={20} />
                    <Typography variant="body2"><Trans>Сравнение кандидатов</Trans></Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Icon icon="mdi:check-circle" color="#4caf50" width={20} height={20} />
                    <Typography variant="body2"><Trans>Рекомендации по найму</Trans></Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Icon icon="mdi:check-circle" color="#4caf50" width={20} height={20} />
                    <Typography variant="body2"><Trans>Экспорт данных в любом формате</Trans></Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            {/* Дополнительная информация */}
            <Box sx={{ bgcolor: 'white', p: 4, borderRadius: 3, border: '1px solid #e0e0e0' }}>
              <Typography variant="h5" fontWeight={600} mb={3} align="center"><Trans>Преимущества процесса</Trans></Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Icon icon="mdi:clock-fast" color="#4CAF50" width={24} height={24} />
                    <Typography variant="body2"><Trans>Экономия времени HR</Trans></Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Icon icon="mdi:currency-usd" color="#FF9800" width={24} height={24} />
                    <Typography variant="body2"><Trans>Снижение затрат на найм</Trans></Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Icon icon="mdi:chart-line" color="#2196F3" width={24} height={24} />
                    <Typography variant="body2"><Trans>Объективная оценка</Trans></Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Icon icon="mdi:shield-check" color="#9C27B0" width={24} height={24} />
                    <Typography variant="body2"><Trans>Безопасность данных</Trans></Typography>
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
            ><Trans>Реальные результаты клиентов</Trans></Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}><Trans>Истории успеха и конкретные цифры экономии от реальных компаний</Trans></Typography>
          </Box>

          {/* Кейсы клиентов - карточки с градиентами */}
          <Box sx={{ mb: 10 }}>
            <Typography variant="h3" align="center" fontWeight={700} mb={6}><Trans>Истории успеха</Trans></Typography>
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
                      <Typography variant="h6" fontWeight={700}><Trans>IT-компания</Trans></Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>TechCorp</Typography>
                    </Box>
                  </Box>
                  <Typography variant="body1" mb={4} sx={{ lineHeight: 1.6, position: 'relative', zIndex: 1 }}><Trans>Автоматизировали найм разработчиков. Сократили время закрытия вакансии с 45 до 7 дней.</Trans></Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'white' }} />
                      <Typography variant="body2"><Trans>Экономия: 85% времени HR</Trans></Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'white' }} />
                      <Typography variant="body2"><Trans>Сокращение затрат: 5x</Trans></Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'white' }} />
                      <Typography variant="body2"><Trans>Улучшение качества найма: 40%</Trans></Typography>
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
                      <Typography variant="h6" fontWeight={700}><Trans>Производственная компания</Trans></Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>SalesForce</Typography>
                    </Box>
                  </Box>
                  <Typography variant="body1" mb={4} sx={{ lineHeight: 1.6, position: 'relative', zIndex: 1 }}><Trans>Внедрили для найма специалистов по продажам. Обработали 500+ кандидатов за месяц.</Trans></Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'white' }} />
                      <Typography variant="body2"><Trans>Обработано кандидатов: 500+</Trans></Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'white' }} />
                      <Typography variant="body2"><Trans>Экономия бюджета: 300,000₽</Trans></Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'white' }} />
                      <Typography variant="body2"><Trans>Скорость найма: 3x быстрее</Trans></Typography>
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
                      <Typography variant="h6" fontWeight={700}><Trans>HR-агентство</Trans></Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>RecruitPro</Typography>
                    </Box>
                  </Box>
                  <Typography variant="body1" mb={4} sx={{ lineHeight: 1.6, position: 'relative', zIndex: 1 }}><Trans>Используют для клиентов из разных отраслей. Масштабировали бизнес в 3 раза.</Trans></Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'white' }} />
                      <Typography variant="body2"><Trans>Рост клиентов: 3x</Trans></Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'white' }} />
                      <Typography variant="body2"><Trans>Экономия времени: 70%</Trans></Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'white' }} />
                      <Typography variant="body2"><Trans>Увеличение прибыли: 250%</Trans></Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Отзывы клиентов - рабочий слайдер */}
          <Box sx={{ mb: 8 }}>
            <Typography variant="h3" align="center" fontWeight={700} mb={6}><Trans>Что говорят наши клиенты</Trans></Typography>

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
            <Typography variant="h4" align="center" fontWeight={700} mb={6}><Trans>Результаты внедрения SofiHR</Trans></Typography>
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
                  <Typography variant="body2" color="text.secondary"><Trans>Клиентов рекомендуют SofiHR</Trans></Typography>
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
                  <Typography variant="body2" color="text.secondary"><Trans>Экономия времени HR</Trans></Typography>
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
                  <Typography variant="body2" color="text.secondary"><Trans>Снижение затрат на найм</Trans></Typography>
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
                  <Typography variant="body2" color="text.secondary"><Trans>Улучшение качества найма</Trans></Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>


        </Container>
      </Box>


      {/* Пятый экран - Тарифы и цены */}
      <PricingSection plans={pricingPlans} />

      {/* Калькулятор экономии */}
      <ROICalculator plans={pricingPlans} />

      {/* FAQ по тарифам */}
      <PricingFAQ />

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
            ><Trans>Готовы автоматизировать найм?</Trans></Typography>

            {/* Подзаголовок */}
            <Typography variant="h5" color="text.secondary" sx={{ mb: 6, maxWidth: 700, mx: 'auto' }}><Trans>Присоединяйтесь к тысячам HR-специалистов, которые уже используют SofiHR для эффективного найма</Trans></Typography>

            {/* Статистика */}
            <Grid container spacing={4} justifyContent="center" sx={{ mb: 8 }}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" fontWeight={700} color="#2196F3">500+</Typography>
                  <Typography variant="body1" color="text.secondary"><Trans>Компаний</Trans></Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" fontWeight={700} color="#4CAF50">10,000+</Typography>
                  <Typography variant="body1" color="text.secondary"><Trans>Интервью</Trans></Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" fontWeight={700} color="#FF9800">95%</Typography>
                  <Typography variant="body1" color="text.secondary"><Trans>Довольных клиентов</Trans></Typography>
                </Box>
              </Grid>
            </Grid>

            {/* CTA кнопки */}
            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                href="/hr"
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
              ><Trans>Перейти в HR панель</Trans></Button>

              <Button
                variant="outlined"
                size="large"
                href="/auth/register"
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
              ><Trans>Попробовать бесплатно</Trans></Button>
            </Box>

            {/* Дополнительная информация */}
            <Box sx={{ mt: 6 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}><Trans>Без кредитной карты • 14 дней бесплатно • Отмена в любое время</Trans></Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <Icon icon="mdi:shield-check" color="#4caf50" width={20} height={20} />
                <Typography variant="body2" color="text.secondary"><Trans>Безопасность данных гарантирована</Trans></Typography>
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
              <Typography variant="body2" color="grey.500" mb={2}><Trans>© 2025 SofiHR. Все права защищены.</Trans></Typography>
              <Typography variant="body2" color="grey.500"><Trans>Система соответствует требованиям 152-ФЗ "О персональных данных"</Trans></Typography>
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
                  <Trans>Политика конфиденциальности</Trans>
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
                  <Trans>Условия использования</Trans>
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
                  <Trans>Удалить мои данные</Trans>
                </Link>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
