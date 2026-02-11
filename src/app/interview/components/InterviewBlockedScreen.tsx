"use client";

import { Box, Card, Typography, Divider } from '@mui/material';
import { Trans } from '@lingui/macro';

interface InterviewBlockedScreenProps {
  isMobile?: boolean;
}

export default function InterviewBlockedScreen({ isMobile }: InterviewBlockedScreenProps) {
  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      p: isMobile ? 2 : 4,
    }}>
      <Card sx={{ maxWidth: 600, textAlign: 'center', p: 4 }}>
        <Box sx={{ color: 'primary.main', mb: 3 }}>
          <Typography variant="h1" component="div" sx={{ fontSize: '4rem' }}>
            📅
          </Typography>
        </Box>
        <Typography variant="h4" gutterBottom fontWeight="bold" color="primary.main">
          <Trans>Ваше резюме на рассмотрении</Trans>
        </Typography>
        <Divider sx={{ my: 3 }} />
        <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
          <Trans>Мы получили ваш отклик и сейчас рассматриваем кандидатов по этой вакансии.</Trans>
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
          <Trans>Прохождение интервью временно приостановлено — мы вернёмся к вам, как только процесс будет продолжен.</Trans>
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
          <Trans>Спасибо за интерес к вакансии и ваше терпение.</Trans>
        </Typography>
        <Box
          sx={{
            mt: 3,
            p: 2,
            bgcolor: 'info.lighter',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'info.main',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            <Trans>💡 Если у вас есть вопросы, вы можете связаться с представителем компании.</Trans>
          </Typography>
        </Box>
      </Card>
    </Box>
  );
}
