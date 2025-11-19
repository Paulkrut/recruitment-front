"use client";
import React from 'react';
import { Trans } from '@lingui/react';

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
          <Typography variant="body2" sx={{ mb: 1 }}>
            Я даю согласие на обработку моих персональных данных в соответствии с{' '}
            <Link 
              href="/privacy-policy" 
              target="_blank"
              style={{ color: 'primary.main', textDecoration: 'none' }}
            >
              Политикой конфиденциальности
            </Link>{' '}
            и{' '}
            <Link 
              href="/terms-of-service" 
              target="_blank"
              style={{ color: 'primary.main', textDecoration: 'none' }}
            >
              Условиями использования
            </Link>
          </Typography>
          <Typography variant="caption" color="text.secondary"><Trans>Согласие необходимо для использования системы. Вы можете отозвать согласие в любое время.</Trans></Typography>
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