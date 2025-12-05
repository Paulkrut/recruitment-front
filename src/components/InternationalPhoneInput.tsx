'use client';

import React, { useState, useEffect } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';
import './InternationalPhoneInput.css'; // Кастомные стили
import { FormControl, FormHelperText, FormLabel, Box } from '@mui/material';
import { useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';
import { useTheme } from '@mui/material/styles';

interface InternationalPhoneInputProps {
  value: string;
  onChange: (phone: string) => void;
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * Определяет код страны по локали браузера
 */
function detectUserCountry(): string {
  if (typeof navigator === 'undefined') return 'ru'; // SSR fallback
  
  // Получаем язык браузера (например: 'ru-RU', 'en-US', 'be-BY')
  const locale = navigator.language || 'ru-RU';
  
  // Маппинг локалей на коды стран для PhoneInput
  const localeToCountry: Record<string, string> = {
    'ru': 'ru', 'ru-RU': 'ru', 'ru-BY': 'ru', 'ru-KZ': 'ru',
    'be': 'by', 'be-BY': 'by',
    'kk': 'kz', 'kk-KZ': 'kz',
    'uk': 'ua', 'uk-UA': 'ua',
    'en': 'us', 'en-US': 'us', 'en-GB': 'gb',
    'ar': 'sa', 'ar-SA': 'sa',
    'fr': 'fr', 'fr-FR': 'fr',
    'de': 'de', 'de-DE': 'de',
    'es': 'es', 'es-ES': 'es',
    'it': 'it', 'it-IT': 'it',
    'pt': 'pt', 'pt-PT': 'pt', 'pt-BR': 'br',
    'zh': 'cn', 'zh-CN': 'cn',
    'ja': 'jp', 'ja-JP': 'jp',
  };
  
  // Ищем точное совпадение
  if (localeToCountry[locale]) {
    return localeToCountry[locale];
  }
  
  // Ищем по первым двум символам (язык без региона)
  const lang = locale.split('-')[0];
  if (localeToCountry[lang]) {
    return localeToCountry[lang];
  }
  
  // Fallback на Россию
  return 'ru';
}

export default function InternationalPhoneInput({
  value,
  onChange,
  label,
  error,
  required = false,
  disabled = false,
  placeholder,
}: InternationalPhoneInputProps) {
  const { _ } = useLingui();
  const theme = useTheme();
  const [defaultCountry, setDefaultCountry] = useState<string>('ru');

  // Автоопределение страны при монтировании компонента
  useEffect(() => {
    const detectedCountry = detectUserCountry();
    setDefaultCountry(detectedCountry);
  }, []);

  return (
    <FormControl fullWidth error={!!error} sx={{ mb: 2 }}>
      {label && (
        <FormLabel 
          required={required} 
          sx={{ 
            mb: 1,
            fontSize: '0.875rem',
            fontWeight: 500,
            color: error ? 'error.main' : 'text.secondary',
            '&.Mui-focused': {
              color: error ? 'error.main' : 'primary.main',
            },
          }}
        >
          {label}
        </FormLabel>
      )}
      <Box className={error ? 'error' : ''}>
        <PhoneInput
          country={defaultCountry} // Автоопределение страны по локали
          value={value}
          onChange={onChange}
          disabled={disabled}
          enableSearch
          searchPlaceholder={_(msg`Поиск страны...`)}
          placeholder={placeholder} // Библиотека сама подставит правильный placeholder для выбранной страны
          specialLabel="" // Убираем встроенный label библиотеки
          inputStyle={{
            width: '100%',
            height: '44px', // Меньше стандартного 56px, как в вашем дизайне (12px + 14px padding * 2)
            fontSize: '14px', // Немного меньше для компактности
            fontFamily: theme.typography.fontFamily,
            borderRadius: '7px', // Менее закругленные углы (вместо стандартных 4px)
            borderColor: error 
              ? theme.palette.error.main 
              : theme.palette.mode === 'dark' 
                ? theme.palette.grey[200] 
                : theme.palette.grey[300],
            borderWidth: '1px',
            borderStyle: 'solid',
            paddingLeft: '48px',
            paddingTop: '12px',
            paddingBottom: '12px',
            paddingRight: '14px',
            transition: 'border-color 0.2s',
            backgroundColor: disabled ? theme.palette.action.disabledBackground : theme.palette.background.paper,
            color: theme.palette.text.primary,
          }}
          buttonStyle={{
            borderColor: error 
              ? theme.palette.error.main 
              : theme.palette.mode === 'dark' 
                ? theme.palette.grey[200] 
                : theme.palette.grey[300],
            borderWidth: '1px',
            borderStyle: 'solid',
            borderRadius: '7px 0 0 7px', // Соответствует input
            backgroundColor: disabled ? theme.palette.action.disabledBackground : 'transparent',
            height: '44px',
            width: '46px',
            borderRight: 'none',
          }}
          containerStyle={{
            width: '100%',
          }}
          dropdownStyle={{
            maxHeight: '200px',
            borderRadius: '7px',
            boxShadow: theme.shadows[8],
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          }}
          searchStyle={{
            padding: '10px',
            backgroundColor: theme.palette.background.paper,
            borderRadius: '7px',
            borderColor: theme.palette.divider,
          }}
          // Приоритетные страны (показываются сверху)
          preferredCountries={['ru', 'by', 'kz', 'ua', 'us', 'sa']}
          // Локализация
          localization={{
            Russia: 'Россия',
            Belarus: 'Беларусь',
            Kazakhstan: 'Казахстан',
            Ukraine: 'Украина',
            'United States': 'США',
            'Saudi Arabia': 'Саудовская Аравия',
            // Можно добавить больше
          }}
        />
      </Box>
      {error && (
        <FormHelperText error sx={{ mx: '14px', mt: '4px' }}>
          {error}
        </FormHelperText>
      )}
    </FormControl>
  );
}

