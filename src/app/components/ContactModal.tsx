"use client";
import * as React from "react";
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  IconButton,
  Tabs,
  Tab,
  Alert
} from "@mui/material";
import { Icon } from "@iconify/react";

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ContactModal({ open, onClose }: ContactModalProps) {
  const [activeTab, setActiveTab] = React.useState(0);
  const [formData, setFormData] = React.useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    comment: '',
  });
  const [submitted, setSubmitted] = React.useState(false);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const type = activeTab === 0 ? 'callback' : 'presentation';
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test'}/api/landing/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          type,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          onClose();
          setFormData({ name: '', phone: '', email: '', company: '', comment: '' });
        }, 3000);
      } else {
        alert(data.error || 'Произошла ошибка при отправке заявки');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Произошла ошибка при отправке заявки. Попробуйте позже.');
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        }
      }}
    >
      {/* Close Button */}
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: '#999',
        }}
      >
        <Icon icon="mdi:close" width={24} height={24} />
      </IconButton>

      <DialogTitle sx={{ pb: 0 }}>
        <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, textAlign: 'center', mt: 1 }}>
          Свяжитесь с нами
        </Typography>
        <Typography sx={{ fontSize: '0.95rem', color: '#666', textAlign: 'center', mt: 0.5 }}>
          Мы ответим в течение 1 часа
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {submitted ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            Спасибо! Мы свяжемся с вами в ближайшее время.
          </Alert>
        ) : (
          <>
            {/* Tabs */}
            <Tabs 
              value={activeTab} 
              onChange={(e, v) => setActiveTab(v)}
              centered
              sx={{ mb: 3, borderBottom: '1px solid #e5e5e5' }}
            >
              <Tab 
                label="Обратный звонок" 
                icon={<Icon icon="mdi:phone" width={20} height={20} />}
                iconPosition="start"
                sx={{ textTransform: 'none', fontSize: '0.95rem', fontWeight: 600 }}
              />
              <Tab 
                label="Презентация" 
                icon={<Icon icon="mdi:presentation" width={20} height={20} />}
                iconPosition="start"
                sx={{ textTransform: 'none', fontSize: '0.95rem', fontWeight: 600 }}
              />
            </Tabs>

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit}>
              {activeTab === 0 ? (
                // Обратный звонок
                <Box>
                  <Typography sx={{ fontSize: '0.9rem', color: '#666', mb: 2, textAlign: 'center' }}>
                    Оставьте ваш номер телефона и мы перезвоним в течение часа
                  </Typography>

                  <TextField
                    fullWidth
                    label="Ваше имя"
                    required
                    value={formData.name}
                    onChange={handleChange('name')}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="Телефон"
                    required
                    type="tel"
                    placeholder="+7 (___) ___-__-__"
                    value={formData.phone}
                    onChange={handleChange('phone')}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="Email (опционально)"
                    type="email"
                    value={formData.email}
                    onChange={handleChange('email')}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="Комментарий (опционально)"
                    multiline
                    rows={2}
                    placeholder="Что вас интересует?"
                    value={formData.comment}
                    onChange={handleChange('comment')}
                    sx={{ mb: 3 }}
                  />
                </Box>
              ) : (
                // Презентация
                <Box>
                  <Typography sx={{ fontSize: '0.9rem', color: '#666', mb: 2, textAlign: 'center' }}>
                    Запишитесь на онлайн-презентацию платформы (30 минут)
                  </Typography>

                  <TextField
                    fullWidth
                    label="Ваше имя"
                    required
                    value={formData.name}
                    onChange={handleChange('name')}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="Компания"
                    value={formData.company}
                    onChange={handleChange('company')}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="Телефон"
                    required
                    type="tel"
                    placeholder="+7 (___) ___-__-__"
                    value={formData.phone}
                    onChange={handleChange('phone')}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="Email"
                    required
                    type="email"
                    value={formData.email}
                    onChange={handleChange('email')}
                    sx={{ mb: 2 }}
                  />

                  <Alert severity="info" icon={<Icon icon="mdi:calendar" width={20} height={20} />} sx={{ mb: 2 }}>
                    После отправки заявки мы свяжемся с вами для согласования времени
                  </Alert>
                </Box>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{
                  bgcolor: '#E91E63',
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 700,
                  borderRadius: 2,
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: '#C2185B',
                  },
                }}
              >
                {activeTab === 0 ? 'Жду звонка' : 'Записаться на презентацию'}
              </Button>

              {/* Privacy Note */}
              <Typography sx={{ fontSize: '0.75rem', color: '#999', textAlign: 'center', mt: 2 }}>
                Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности
              </Typography>
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

