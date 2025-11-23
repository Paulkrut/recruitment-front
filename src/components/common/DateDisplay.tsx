import React from 'react';
import { Typography, TypographyProps, Tooltip } from '@mui/material';
import { formatDateToLocal, getTimeAgo, formatDateOnly, formatTimeOnly, getUserTimezone } from '@/utils/dateUtils';

interface DateDisplayProps extends Omit<TypographyProps, 'children'> {
  /** UTC дата из базы данных */
  utcDate: string | null | undefined;
  /** Формат отображения */
  format?: 'full' | 'date' | 'time' | 'relative';
  /** Показывать ли тултип с дополнительной информацией */
  showTooltip?: boolean;
  /** Показывать ли часовой пояс в тултипе */
  showTimezone?: boolean;
  /** Текст по умолчанию для пустых дат */
  placeholder?: string;
}

/**
 * Компонент для отображения UTC дат в местном времени пользователя
 */
export const DateDisplay: React.FC<DateDisplayProps> = ({
  utcDate,
  format = 'full',
  showTooltip = true,
  showTimezone = false,
  placeholder = '-',
  ...typographyProps
}) => {
  if (!utcDate) {
    return (
      <Typography {...typographyProps}>
        {placeholder}
      </Typography>
    );
  }

  // Получаем отформатированную дату
  const getDisplayText = () => {
    switch (format) {
      case 'date':
        return formatDateOnly(utcDate);
      case 'time':
        return formatTimeOnly(utcDate);
      case 'relative':
        return getTimeAgo(utcDate);
      case 'full':
      default:
        return formatDateToLocal(utcDate);
    }
  };

  const displayText = getDisplayText();

  // Подготавливаем тултип
  const getTooltipContent = () => {
    if (!showTooltip) return null;

    const fullDate = formatDateToLocal(utcDate);
    const relativeTime = getTimeAgo(utcDate);
    const timezone = getUserTimezone();

    let content = '';
    
    if (format === 'relative') {
      content = fullDate;
    } else {
      content = relativeTime;
    }

    if (showTimezone) {
      content += _(msg`\nЧасовой пояс: ${timezone}`);
    }

    return content;
  };

  const tooltipContent = getTooltipContent();

  const dateElement = (
    <Typography {...typographyProps}>
      {displayText}
    </Typography>
  );

  // Возвращаем с тултипом или без
  if (showTooltip && tooltipContent) {
    return (
      <Tooltip 
        title={tooltipContent} 
        arrow
        placement="top"
        style={{ whiteSpace: 'pre-line' }}
      >
        <span style={{ cursor: 'help' }}>
          {dateElement}
        </span>
      </Tooltip>
    );
  }

  return dateElement;
};

export default DateDisplay; 