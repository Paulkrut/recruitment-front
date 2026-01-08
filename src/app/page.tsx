"use client";
import * as React from "react";
import { Box, AppBar, Toolbar, IconButton, Menu, MenuItem, Button, Typography, Tooltip, Fab } from "@mui/material";
import { Icon } from "@iconify/react";
import Link from "next/link";

// Секции лендинга
import HeroSection from "./sections/HeroSection";
import SocialProofBar from "./sections/SocialProofBar";
import HhIntegrationSection from "./sections/HhIntegrationSection";
import AiInterviewSection from "./sections/AiInterviewSection";
import FullFeaturesSection from "./sections/FullFeaturesSection";
import ScreenshotsSection from "./sections/ScreenshotsSection";
import CasesSection from "./sections/CasesSection";
import TestimonialsSection from "./sections/TestimonialsSection";
import PricingSection from "./sections/PricingSection";
import RegulationsSection from "./sections/RegulationsSection";
import PartnersSection from "./sections/PartnersSection";
import CtaSection from "./sections/CtaSection";
import FooterSection from "./sections/FooterSection";
import ContactModal from "./components/ContactModal";

export default function HomePage() {
  const [mobileMenuAnchor, setMobileMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [activeInterviews, setActiveInterviews] = React.useState(12);
  const [rotatingWord, setRotatingWord] = React.useState(0);
  const [invitationType, setInvitationType] = React.useState<'ai' | 'regular'>('ai');
  const [candidatesPerMonth, setCandidatesPerMonth] = React.useState(50);
  const [animationStep, setAnimationStep] = React.useState(0);
  const [contactModalOpen, setContactModalOpen] = React.useState(false);

  const menuItems = [
    { label: 'AI-интервью', href: '#ai-interview' },
    { label: 'Функционал', href: '#features' },
    { label: 'Интеграция HH', href: '#hh-integration' },
    { label: 'Отзывы', href: '#testimonials' },
    { label: 'Тарифы', href: '#pricing' },
  ];

  // Ротация слов в заголовке
  const rotatingWords = ['на автопилоте', 'с помощью AI', 'экономя время', 'за 15 минут'];
  
  // Имитация изменения количества активных интервью
  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveInterviews(prev => prev + Math.floor(Math.random() * 3) - 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Анимация потока HH
  React.useEffect(() => {
    const interval = setInterval(() => {
      setAnimationStep((prev) => (prev + 1) % 7);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Ротация слов в заголовке с задержкой для плавной анимации
  React.useEffect(() => {
    const interval = setInterval(() => {
      setRotatingWord(prev => (prev + 1) % rotatingWords.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [rotatingWords.length]);

  // Плавный скроллинг к якорям
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        const offsetTop = targetElement.offsetTop - 80; // 80px отступ для navbar
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    }
  };

  return (
    <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh' }}>
      {/* Navbar */}
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#fafafa', borderBottom: '1px solid #e5e5e5' }}>
        <Box sx={{ maxWidth: 'lg', width: '100%', mx: 'auto', px: 3 }}>
          <Toolbar disableGutters sx={{ py: 1 }}>
            <Typography variant="h5" component={Link} href="/" sx={{ fontWeight: 900, color: '#1a1a1a', textDecoration: 'none', letterSpacing: -0.5, mr: 'auto' }}>
              SofiHR
            </Typography>

            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 4, mr: 4 }}>
              {menuItems.map((item) => (
                <Link 
                  key={item.label} 
                  href={item.href} 
                  onClick={(e) => handleSmoothScroll(e, item.href)}
                  style={{ textDecoration: 'none', color: '#666', fontSize: '0.9rem', fontWeight: 500 }}
                >
                  {item.label}
                </Link>
              ))}
            </Box>

            <IconButton sx={{ display: { xs: 'flex', md: 'none' }, mr: 2 }} onClick={(e) => setMobileMenuAnchor(e.currentTarget)}>
              <Icon icon="mdi:menu" width={24} height={24} />
            </IconButton>

            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              {/* Кнопка "Связаться" в Navbar */}
              <Button 
                onClick={() => setContactModalOpen(true)}
                size="small" 
                sx={{ 
                  display: { xs: 'none', lg: 'inline-flex' },
                  borderColor: '#2196F3', 
                  color: '#2196F3', 
                  textTransform: 'none', 
                  fontWeight: 600, 
                  fontSize: '0.85rem',
                  border: '1px solid #2196F3',
                  '&:hover': { 
                    bgcolor: '#2196F3', 
                    color: '#fff',
                    borderColor: '#2196F3'
                  } 
                }}
                startIcon={<Icon icon="mdi:headset" width={18} height={18} />}
              >
                Связаться
              </Button>

              <Button variant="outlined" href="/auth/register" size="small" sx={{ display: { xs: 'none', sm: 'inline-flex' }, borderColor: '#e5e5e5', color: '#666', textTransform: 'none', fontWeight: 600, fontSize: '0.85rem', '&:hover': { borderColor: '#1a1a1a', color: '#1a1a1a' } }}>
                Регистрация
              </Button>
              <Button variant="contained" href="/auth/login" size="small" sx={{ bgcolor: '#1a1a1a', color: '#fff', textTransform: 'none', fontWeight: 600, fontSize: '0.85rem', boxShadow: 'none', '&:hover': { bgcolor: '#333', boxShadow: 'none' } }}>
                Войти
              </Button>
              
              {/* Кнопка HH OAuth */}
              <Tooltip title="Войти через HeadHunter" arrow placement="bottom">
                <IconButton
                  onClick={() => {
                    window.location.href = `${process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test'}/api/auth/hh`;
                  }}
                  sx={{
                    width: 38,
                    height: 38,
                    border: '2px solid #D6001C',
                    borderRadius: 1,
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
                      fontSize: '0.9rem',
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
        </Box>

        <Menu anchorEl={mobileMenuAnchor} open={Boolean(mobileMenuAnchor)} onClose={() => setMobileMenuAnchor(null)}>
          {menuItems.map((item) => (
            <MenuItem 
              key={item.label} 
              component={Link} 
              href={item.href} 
              onClick={(e) => {
                handleSmoothScroll(e, item.href);
                setMobileMenuAnchor(null);
              }}
            >
              {item.label}
            </MenuItem>
          ))}
        </Menu>
      </AppBar>

      {/* Hero Section */}
      <HeroSection 
        activeInterviews={activeInterviews}
        rotatingWord={rotatingWord}
        rotatingWords={rotatingWords}
        onContactClick={() => setContactModalOpen(true)}
      />

      {/* Social Proof Bar - белый */}
      <SocialProofBar />

      {/* AI Interview Section - серый */}
      <Box id="ai-interview">
        <AiInterviewSection />
      </Box>

      {/* Full Features Section - белый */}
      <Box id="features">
        <FullFeaturesSection />
      </Box>

      {/* HH Integration Section - серый */}
      <Box id="hh-integration">
        <HhIntegrationSection
          invitationType={invitationType}
          setInvitationType={setInvitationType}
          candidatesPerMonth={candidatesPerMonth}
          setCandidatesPerMonth={setCandidatesPerMonth}
          animationStep={animationStep}
        />
      </Box>

      {/* Screenshots Section - белый */}
      <Box id="screenshots">
        <ScreenshotsSection />
      </Box>

      {/* Cases Section - серый */}
      <Box id="cases">
        <CasesSection />
      </Box>

      {/* Testimonials Section - белый */}
      <Box id="testimonials">
        <TestimonialsSection />
      </Box>

      {/* Pricing Section - серый */}
      <Box id="pricing">
        <PricingSection />
      </Box>

      {/* Regulations Section - белый */}
      <RegulationsSection />

      {/* Partners Section - серый */}
      <Box id="partners">
        <PartnersSection onOpenContact={() => setContactModalOpen(true)} />
      </Box>

      {/* CTA Section - белый */}
      <CtaSection />

      {/* Footer Section */}
      <FooterSection onContactClick={() => setContactModalOpen(true)} />

      {/* Contact Modal */}
      <ContactModal open={contactModalOpen} onClose={() => setContactModalOpen(false)} />

      {/* Floating Contact Button */}
      <Fab
        color="primary"
        onClick={() => setContactModalOpen(true)}
        sx={{
          position: 'fixed',
          bottom: { xs: 16, md: 24 },
          right: { xs: 16, md: 24 },
          bgcolor: '#E91E63',
          width: { xs: 56, md: 64 },
          height: { xs: 56, md: 64 },
          boxShadow: '0 8px 24px rgba(233, 30, 99, 0.4)',
          '&:hover': {
            bgcolor: '#C2185B',
            transform: 'scale(1.1)',
            boxShadow: '0 12px 32px rgba(233, 30, 99, 0.5)',
          },
          transition: 'all 0.3s ease',
          zIndex: 1000,
        }}
      >
        <Icon icon="mdi:headset" width={28} height={28} color="#fff" />
      </Fab>

    </Box>
  );
}
