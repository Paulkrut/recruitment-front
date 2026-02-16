/**
 * 🎯 Компонент для отображения текста вопроса с автоопределением формата
 * 
 * Поддерживает:
 * - Plain text (старые вопросы) — с сохранением переносов строк
 * - HTML (новые вопросы) — с форматированием (жирный, курсив, списки, ссылки)
 * 
 * Автоматически определяет тип контента и применяет соответствующий рендеринг.
 */

import React from 'react';
import { Typography, Box } from '@mui/material';

interface QuestionTextProps {
  text: string | null | undefined;
  variant?: 'body1' | 'body2' | 'h6';
  className?: string;
  sx?: any;
}

/**
 * Проверяет, содержит ли текст HTML теги
 */
function hasHtmlContent(text: string | null | undefined): boolean {
  if (!text) return false;
  return /<(strong|b|em|i|a|br|ul|ol|li|p)\b[^>]*>/i.test(text);
}

const QuestionText: React.FC<QuestionTextProps> = ({ 
  text, 
  variant = 'body1',
  className,
  sx 
}) => {
  // Обработка пустого текста
  if (!text) {
    return (
      <Typography 
        variant={variant}
        className={className}
        sx={{ ...sx, fontStyle: 'italic', color: '#888' }}
      >
        [Текст вопроса отсутствует]
      </Typography>
    );
  }

  const isHtml = hasHtmlContent(text);

  if (isHtml) {
    // HTML режим — рендерим с форматированием
    // TODO: Добавить sanitization через DOMPurify когда будет реализована защита от XSS
    return (
      <Box
        className={className}
        sx={{
          ...sx,
          '& p': {
            margin: 0,
            lineHeight: 1.6
          },
          '& strong, & b': {
            fontWeight: 700
          },
          '& em, & i': {
            fontStyle: 'italic'
          },
          '& ul, & ol': {
            marginTop: '0.5em',
            marginBottom: '0.5em',
            paddingLeft: '1.5em'
          },
          '& li': {
            marginBottom: '0.25em'
          },
          '& a': {
            color: '#1976d2',
            textDecoration: 'underline',
            '&:hover': {
              textDecoration: 'none'
            }
          },
          fontSize: variant === 'body1' ? '1rem' : variant === 'body2' ? '0.875rem' : '1.25rem',
          lineHeight: 1.6
        }}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    );
  } else {
    // Plain text режим — с сохранением переносов (как было раньше)
    return (
      <Typography 
        variant={variant}
        className={className}
        sx={{ 
          ...sx,
          whiteSpace: 'pre-wrap',  // Сохраняем переносы строк
          lineHeight: 1.6
        }}
      >
        {text}
      </Typography>
    );
  }
};

export default QuestionText;
