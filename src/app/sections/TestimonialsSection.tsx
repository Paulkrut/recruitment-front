"use client";
import * as React from "react";
import { Box, Container, Typography, Modal, IconButton } from "@mui/material";
import { Icon } from "@iconify/react";

export default function TestimonialsSection() {
  const testimonials = [
    { id: 1, image: '/images/testimonials/photo_1_2025-11-25_20-53-55.jpg' },
    { id: 2, image: '/images/testimonials/photo_2_2025-11-25_20-53-55.jpg' },
    { id: 3, image: '/images/testimonials/2025-11-25_20-44-11.png' },
    { id: 4, image: '/images/testimonials/photo_3_2025-11-25_20-53-55.jpg' },
    { id: 5, image: '/images/testimonials/photo_4_2025-11-25_20-53-55.jpg' },
    { id: 6, image: '/images/testimonials/photo_5_2025-11-25_20-53-55.jpg' },
    { id: 7, image: '/images/testimonials/photo_6_2025-11-25_20-53-55.jpg' },
    { id: 8, image: '/images/testimonials/photo_8_2025-11-25_20-53-55.jpg' },
    { id: 9, image: '/images/testimonials/photo_9_2025-11-25_20-53-55.jpg' },
    { id: 10, image: '/images/testimonials/2025-11-24_21-00-11.png' },
    { id: 11, image: '/images/testimonials/photo_2025-11-25_20-53-27.jpg' },
  ];

  const [fullscreenOpen, setFullscreenOpen] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const openFullscreen = (index: number) => {
    setCurrentIndex(index);
    setFullscreenOpen(true);
  };

  const closeFullscreen = () => {
    setFullscreenOpen(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Keyboard navigation
  React.useEffect(() => {
    if (!fullscreenOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeFullscreen();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullscreenOpen]);

  return (
    <Box sx={{ bgcolor: '#fff', py: { xs: 6, md: 8 } }}>
      <Container maxWidth="lg">

        {/* Hero */}
        <Box sx={{ mb: 5, textAlign: 'center' }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#E91E63' }} />
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#999' }}>
              Отзывы кандидатов
            </Typography>
          </Box>

          <Typography sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 800, lineHeight: 1.1, mb: 1.5 }}>
            Кандидаты <Box component="span" sx={{ color: '#E91E63' }}>в восторге</Box> от процесса
          </Typography>

          <Typography sx={{ fontSize: { xs: '0.95rem', md: '1.05rem' }, color: '#666', maxWidth: 650, mx: 'auto' }}>
            Реальные отзывы из HeadHunter. Без редактуры, как есть.
          </Typography>
        </Box>

        {/* Masonry Grid - CSS Columns для настоящего masonry */}
        <Box
          sx={{
            columnCount: {
              xs: 1,
              sm: 2,
              md: 3,
            },
            columnGap: 2,
          }}
        >
          {testimonials.map((testimonial, index) => (
            <Box
              key={testimonial.id}
              onClick={() => openFullscreen(index)}
              sx={{
                breakInside: 'avoid',
                mb: 2,
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 2,
                border: '1px solid #e5e5e5',
                bgcolor: '#fff',
                cursor: 'pointer',
                transition: 'border-color 0.2s ease',
                '&:hover': {
                  borderColor: '#E91E63',
                },
              }}
            >
              <img
                src={testimonial.image}
                alt={`Отзыв кандидата ${testimonial.id}`}
                loading="lazy"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />
            </Box>
          ))}
        </Box>

        {/* Подпись */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography sx={{ fontSize: '0.85rem', color: '#999', fontStyle: 'italic' }}>
            Скриншоты реальных диалогов с кандидатами в HeadHunter
          </Typography>
        </Box>

      </Container>

      {/* Fullscreen Modal */}
      <Modal
        open={fullscreenOpen}
        onClose={closeFullscreen}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(0, 0, 0, 0.95)',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: { xs: 2, md: 4 },
          }}
        >
          {/* Close Button */}
          <IconButton
            onClick={closeFullscreen}
            sx={{
              position: 'absolute',
              top: { xs: 10, md: 20 },
              right: { xs: 10, md: 20 },
              color: '#fff',
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
              zIndex: 10,
            }}
          >
            <Icon icon="mdi:close" width={28} height={28} />
          </IconButton>

          {/* Previous Button */}
          <IconButton
            onClick={goToPrev}
            sx={{
              position: 'absolute',
              left: { xs: 10, md: 40 },
              color: '#fff',
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
              zIndex: 10,
            }}
          >
            <Icon icon="mdi:chevron-left" width={32} height={32} />
          </IconButton>

          {/* Next Button */}
          <IconButton
            onClick={goToNext}
            sx={{
              position: 'absolute',
              right: { xs: 10, md: 40 },
              color: '#fff',
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
              zIndex: 10,
            }}
          >
            <Icon icon="mdi:chevron-right" width={32} height={32} />
          </IconButton>

          {/* Image */}
          <Box
            sx={{
              maxWidth: '90%',
              maxHeight: '90%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={testimonials[currentIndex].image}
              alt={`Отзыв кандидата ${testimonials[currentIndex].id}`}
              style={{
                maxWidth: '100%',
                maxHeight: '90vh',
                objectFit: 'contain',
              }}
            />
          </Box>

          {/* Counter */}
          <Box
            sx={{
              position: 'absolute',
              bottom: { xs: 10, md: 20 },
              left: '50%',
              transform: 'translateX(-50%)',
              color: '#fff',
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              px: 2,
              py: 0.5,
              borderRadius: 2,
              fontSize: '0.9rem',
            }}
          >
            {currentIndex + 1} / {testimonials.length}
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}

