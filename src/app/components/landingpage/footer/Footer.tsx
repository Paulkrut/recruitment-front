import React from "react";
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { Divider } from '@mui/material';

const Footer = () => {
  return (
    <Box
      sx={{
        borderRadius: 0,
        backgroundColor: (theme) => theme.palette.background.paper,
        padding: "30px 0 30px",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3} justifyContent="center">
          {/* Основная информация */}
          <Grid item xs={12} md={6} textAlign="center">
            <Typography fontSize="14px" color="textSecondary" mt={1}>
              Все права защищены SofiHR. Система подбора персонала.
            </Typography>
          </Grid>
          
          {/* Ссылки на документы */}
          <Grid item xs={12} md={6} textAlign="center">
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Link
                href="/privacy-policy"
                target="_blank"
                underline="none"
                color="primary"
                sx={{ fontSize: '14px' }}
              >
                Политика конфиденциальности
              </Link>
              <Link
                href="/terms-of-service"
                target="_blank"
                underline="none"
                color="primary"
                sx={{ fontSize: '14px' }}
              >
                Условия использования
              </Link>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} textAlign="center">
            <Typography fontSize="12px" color="textSecondary">
              © 2025 SofiHR. Система соответствует требованиям 152-ФЗ "О персональных данных"
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer;
