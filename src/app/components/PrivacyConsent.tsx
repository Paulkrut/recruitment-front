'use client';

import { Trans } from '@lingui/macro';
import React from 'react';


import {
  Box, Checkbox, Typography, Link
} from '@mui/material';

interface PrivacyConsentProps {
  value: boolean;
  onChange: (checked: boolean) => void;
  required?: boolean;
  error?: boolean;
  helperText?: string;
}

export default function PrivacyConsent({ 
  value, 
  onChange, 
  required = true, 
  error = false,
  helperText
}: PrivacyConsentProps) {
  return (
    <Box sx={{ 
      mb: 3, 
      p: 2, 
      bgcolor: error ? '#fff5f5' : '#f8f9fa', 
      borderRadius: 2, 
      border: `1px solid ${error ? '#feb2b2' : '#e9ecef'}` 
    }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Checkbox
          required={required}
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          color="primary"
          sx={{ mt: 0.5 }}
        />
        <Box>
          <Typography variant="body2" sx={{ mb: 1 }}><Trans>
            Я подтверждаю согласие с{' '}
            </Trans><Link 
              href="/terms-of-service" 
              target="_blank"
              style={{ color: 'primary.main', textDecoration: 'none' }}
            >
              <Trans>Офертой</Trans>
            </Link><Trans>, </Trans><Link 
              href="/privacy-policy" 
              target="_blank"
              style={{ color: 'primary.main', textDecoration: 'none' }}
            >
              <Trans>Политикой конфиденциальности</Trans>
            </Link><Trans>{' '}и{' '}</Trans><Link 
              href="/personal-data-consent" 
              target="_blank"
              style={{ color: 'primary.main', textDecoration: 'none' }}
            >
              <Trans>Согласием на обработку персональных данных</Trans>
            </Link>
          </Typography>
          <Typography variant="caption" color="text.secondary"><Trans>Полные формулировки о передаче данных российским технологическим партнёрам и ИИ-обработке содержатся в этих документах. Согласие можно отозвать в любое время.</Trans></Typography>
          {helperText && (
            <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
              {helperText}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
} 