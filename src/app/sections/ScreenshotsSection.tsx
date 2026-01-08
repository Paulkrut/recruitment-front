"use client";
import * as React from "react";
import { Box, Container, Typography, IconButton } from "@mui/material";
import { Icon } from "@iconify/react";
import Image from "next/image";

export default function ScreenshotsSection() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const screenshots = [
    {
      id: 'dashboard',
      title: 'Дашборд вакансий',
      description: 'Управляйте всеми вакансиями в одном месте. Статистика, фильтры, быстрые действия.',
      image: '/images/screenshots/Вакансии широкие.webp',
      type: 'image'
    },
    {
      id: 'kanban',
      title: 'Канбан-доска кандидатов',
      description: 'Визуальное управление кандидатами. Drag & drop между стадиями, AI-оценки на карточках.',
      image: '/images/screenshots/кандидаиы канбан.webp',
      video: '/images/screenshots/Вакансия-Операционный-директор-COO-.webm',
      type: 'both' // есть и картинка и видео
    },
    {
      id: 'hh-automation',
      title: 'Автоматизация HeadHunter',
      description: 'Настройте автоприглашения, напоминания и синхронизацию статусов в пару кликов.',
      image: '/images/screenshots/ХХ импорт.webp',
      type: 'image'
    },
    {
      id: 'candidate-detail',
      title: 'Детальная карточка кандидата',
      description: 'Вся информация о кандидате: резюме, AI-анализ, видео-ответы, оценки, история.',
      image: '/images/screenshots/кандидат.webp',
      type: 'image'
    },
    {
      id: 'comparison',
      title: 'Сравнение кандидатов',
      description: 'Сравнивайте до 10 кандидатов side-by-side. Экспортируйте в Excel одним кликом.',
      image: '/images/screenshots/Сравнение.webp',
      type: 'image'
    },
    {
      id: 'ai-generation',
      title: 'AI-генерация вопросов',
      description: 'ИИ создаёт релевантные вопросы на основе описания вакансии за 30 секунд.',
      image: '/images/screenshots/Генерация вопросов.webp',
      type: 'image'
    },
    {
      id: 'candidate-summary',
      title: 'Аналитика и отчёты',
      description: 'Детальная статистика по каждому кандидату с рекомендациями AI.',
      image: '/images/screenshots/кандидат итог.webp',
      type: 'image'
    },
  ];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? screenshots.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === screenshots.length - 1 ? 0 : prev + 1));
  };

  const handleOpenFullscreen = () => {
    setIsFullscreen(true);
  };

  const handleCloseFullscreen = () => {
    setIsFullscreen(false);
  };

  // Поддержка клавиатуры в полноэкранном режиме
  React.useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseFullscreen();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const currentScreenshot = screenshots[activeIndex];

  return (
    <Box sx={{ bgcolor: '#fff', py: { xs: 6, md: 8 } }}>
      <Container maxWidth="lg">

        {/* Hero */}
        <Box sx={{ mb: 5, textAlign: 'center' }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#9C27B0' }} />
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#999' }}>
              Интерфейс платформы
            </Typography>
          </Box>

          <Typography sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 800, lineHeight: 1.1, mb: 1.5 }}>
            Посмотрите как <Box component="span" sx={{ color: '#9C27B0' }}>это выглядит</Box>
          </Typography>

          <Typography sx={{ fontSize: { xs: '0.95rem', md: '1.05rem' }, color: '#666', maxWidth: 650, mx: 'auto' }}>
            Современный, интуитивный интерфейс. Всё что нужно — на расстоянии одного клика.
          </Typography>
        </Box>

        {/* Главная секция - скриншот с описанием */}
        <Box sx={{ position: 'relative', mb: 4 }}>
          {/* Основной скриншот */}
          <Box sx={{ position: 'relative', mb: 3 }}>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: { xs: 300, sm: 400, md: 500 },
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid #e5e5e5',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                bgcolor: '#fafafa'
              }}
            >
              {currentScreenshot.type === 'both' ? (
                // Для канбана показываем видео, если есть
                <video
                  key={currentScreenshot.id}
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                >
                  <source src={currentScreenshot.video} type="video/webm" />
                  {/* Фоллбэк на изображение если видео не загрузится */}
                  <Image
                    src={currentScreenshot.image}
                    alt={currentScreenshot.title}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </video>
              ) : (
                <Image
                  src={currentScreenshot.image}
                  alt={currentScreenshot.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  priority={activeIndex === 0}
                />
              )}
            </Box>

            {/* Навигационные кнопки */}
            <IconButton
              onClick={handlePrev}
              sx={{
                position: 'absolute',
                left: { xs: 8, md: 16 },
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(255, 255, 255, 0.95)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                '&:hover': {
                  bgcolor: '#fff',
                  transform: 'translateY(-50%) scale(1.1)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <Icon icon="mdi:chevron-left" width={28} height={28} />
            </IconButton>

            <IconButton
              onClick={handleNext}
              sx={{
                position: 'absolute',
                right: { xs: 8, md: 16 },
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(255, 255, 255, 0.95)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                '&:hover': {
                  bgcolor: '#fff',
                  transform: 'translateY(-50%) scale(1.1)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <Icon icon="mdi:chevron-right" width={28} height={28} />
            </IconButton>

            {/* Кнопка полноэкранного просмотра */}
            <IconButton
              onClick={handleOpenFullscreen}
              sx={{
                position: 'absolute',
                right: { xs: 8, md: 16 },
                top: { xs: 8, md: 16 },
                bgcolor: 'rgba(255, 255, 255, 0.95)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                '&:hover': {
                  bgcolor: '#fff',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <Icon icon="mdi:fullscreen" width={24} height={24} />
            </IconButton>
          </Box>

          {/* Описание текущего скриншота */}
          <Box sx={{ textAlign: 'center', px: { xs: 2, md: 8 } }}>
            <Typography sx={{ fontSize: '1.3rem', fontWeight: 700, mb: 1, color: '#1a1a1a' }}>
              {currentScreenshot.title}
            </Typography>
            <Typography sx={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
              {currentScreenshot.description}
            </Typography>
          </Box>
        </Box>

        {/* Превью миниатюр */}
        <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2, px: 1 }}>
          {screenshots.map((screenshot, index) => (
            <Box
              key={screenshot.id}
              onClick={() => setActiveIndex(index)}
              sx={{
                position: 'relative',
                minWidth: { xs: 120, md: 150 },
                height: { xs: 80, md: 100 },
                borderRadius: 1.5,
                overflow: 'hidden',
                border: activeIndex === index ? '3px solid #9C27B0' : '2px solid #e5e5e5',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                opacity: activeIndex === index ? 1 : 0.6,
                '&:hover': {
                  opacity: 1,
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(156, 39, 176, 0.2)',
                }
              }}
            >
              <Image
                src={screenshot.image}
                alt={screenshot.title}
                fill
                style={{ objectFit: 'cover' }}
              />
              {screenshot.type === 'both' && (
                <Box sx={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  bgcolor: 'rgba(0,0,0,0.7)',
                  borderRadius: 0.5,
                  px: 0.8,
                  py: 0.3
                }}>
                  <Icon icon="mdi:play" width={12} height={12} color="#fff" />
                </Box>
              )}
            </Box>
          ))}
        </Box>

        {/* Индикатор */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 3 }}>
          {screenshots.map((_, index) => (
            <Box
              key={index}
              onClick={() => setActiveIndex(index)}
              sx={{
                width: activeIndex === index ? 24 : 8,
                height: 8,
                borderRadius: 10,
                bgcolor: activeIndex === index ? '#9C27B0' : '#e5e5e5',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: activeIndex === index ? '#9C27B0' : '#ccc',
                }
              }}
            />
          ))}
        </Box>

      </Container>

      {/* Полноэкранный просмотр */}
      {isFullscreen && (
        <Box
          onClick={handleCloseFullscreen}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.95)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            '@keyframes fadeIn': {
              from: { opacity: 0 },
              to: { opacity: 1 },
            },
            animation: 'fadeIn 0.2s ease-in',
          }}
        >
          {/* Контейнер для изображения */}
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{
              position: 'relative',
              maxWidth: '95vw',
              maxHeight: '95vh',
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Основное изображение/видео */}
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3
              }}
            >
              {currentScreenshot.type === 'both' ? (
                <video
                  key={currentScreenshot.id}
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                  }}
                >
                  <source src={currentScreenshot.video} type="video/webm" />
                  <Image
                    src={currentScreenshot.image}
                    alt={currentScreenshot.title}
                    width={1920}
                    height={1080}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                </video>
              ) : (
                <Image
                  src={currentScreenshot.image}
                  alt={currentScreenshot.title}
                  width={1920}
                  height={1080}
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '100%', 
                    objectFit: 'contain',
                    borderRadius: '8px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                  }}
                  priority
                />
              )}

              {/* Навигация в полноэкранном режиме */}
              <IconButton
                onClick={handlePrev}
                sx={{
                  position: 'absolute',
                  left: { xs: -40, md: -60 },
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(255, 255, 255, 0.95)',
                  width: { xs: 40, md: 56 },
                  height: { xs: 40, md: 56 },
                  '&:hover': {
                    bgcolor: '#fff',
                    transform: 'translateY(-50%) scale(1.1)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <Icon icon="mdi:chevron-left" width={32} height={32} />
              </IconButton>

              <IconButton
                onClick={handleNext}
                sx={{
                  position: 'absolute',
                  right: { xs: -40, md: -60 },
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(255, 255, 255, 0.95)',
                  width: { xs: 40, md: 56 },
                  height: { xs: 40, md: 56 },
                  '&:hover': {
                    bgcolor: '#fff',
                    transform: 'translateY(-50%) scale(1.1)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <Icon icon="mdi:chevron-right" width={32} height={32} />
              </IconButton>
            </Box>

            {/* Описание внизу */}
            <Box sx={{ textAlign: 'center', maxWidth: 800 }}>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, mb: 1, color: '#fff' }}>
                {currentScreenshot.title}
              </Typography>
              <Typography sx={{ fontSize: '1rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
                {currentScreenshot.description}
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', mt: 2 }}>
                {activeIndex + 1} / {screenshots.length} • Нажмите ESC или кликните вне изображения для выхода
              </Typography>
            </Box>

            {/* Кнопка закрытия */}
            <IconButton
              onClick={handleCloseFullscreen}
              sx={{
                position: 'absolute',
                top: { xs: -10, md: -20 },
                right: { xs: -10, md: -20 },
                bgcolor: 'rgba(255, 255, 255, 0.95)',
                width: { xs: 40, md: 48 },
                height: { xs: 40, md: 48 },
                '&:hover': {
                  bgcolor: '#fff',
                  transform: 'rotate(90deg)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <Icon icon="mdi:close" width={28} height={28} />
            </IconButton>
          </Box>
        </Box>
      )}
    </Box>
  );
}

