/**
 * Утилиты для работы с датами и временем
 * Все даты в базе хранятся в UTC, конвертируем в местное время пользователя
 */

import { msg } from '@lingui/macro';
import type { I18n } from '@lingui/core';

/**
 * Парсит строку даты как UTC, даже если в ней нет указания часового пояса
 */
const parseUTCDate = (utcDateString: string): Date => {
  let dateString = utcDateString;
  
  // Если строка не содержит 'Z' или '+'/'-' (часовой пояс), считаем её UTC
  if (!dateString.includes('Z') && !dateString.includes('+') && !dateString.includes('-', 10)) {
    // Заменяем пробел на 'T' (ISO формат) и добавляем 'Z' для UTC
    dateString = utcDateString.replace(' ', 'T') + 'Z';
  }
  
  return new Date(dateString);
};

/**
 * Форматирует UTC дату в местное время пользователя
 */
export const formatDateToLocal = (
  utcDateString: string | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string => {
  if (!utcDateString) return "-";
  
  try {
    // Парсим дату как UTC
    const utcDate = parseUTCDate(utcDateString);
    
    // Проверяем валидность даты
    if (isNaN(utcDate.getTime())) {
      console.warn('Invalid date string:', utcDateString);
      return "-";
    }
    
    // Дефолтные опции форматирования
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      ...options
    };
    
    return utcDate.toLocaleString("ru-RU", defaultOptions);
  } catch (error) {
    console.error('Error formatting date:', error, utcDateString);
    return "-";
  }
};

/**
 * Форматирует только дату (без времени)
 */
export const formatDateOnly = (utcDateString: string | null | undefined): string => {
  return formatDateToLocal(utcDateString, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * Форматирует только время
 */
export const formatTimeOnly = (utcDateString: string | null | undefined): string => {
  return formatDateToLocal(utcDateString, {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Получает относительное время ("2 часа назад", "вчера" и т.д.)
 * Принимает i18n для локализации
 */
export const getTimeAgo = (utcDateString: string | null | undefined, i18n: I18n): string => {
  if (!utcDateString) return "-";
  
  try {
    const utcDate = parseUTCDate(utcDateString);
    const now = new Date();
    const diffMs = now.getTime() - utcDate.getTime();
    
    if (isNaN(utcDate.getTime())) {
      return "-";
    }
    
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);
    
    if (diffSeconds < 60) {
      return i18n._(msg`только что`);
    } else if (diffMinutes < 60) {
      return i18n._(msg`${diffMinutes} мин назад`);
    } else if (diffHours < 24) {
      return i18n._(msg`${diffHours} ч назад`);
    } else if (diffDays === 1) {
      return i18n._(msg`вчера`);
    } else if (diffDays < 7) {
      return i18n._(msg`${diffDays} дн назад`);
    } else if (diffWeeks < 4) {
      return i18n._(msg`${diffWeeks} нед назад`);
    } else if (diffMonths < 12) {
      return i18n._(msg`${diffMonths} мес назад`);
    } else {
      return i18n._(msg`${diffYears} г назад`);
    }
  } catch (error) {
    console.error('Error calculating time ago:', error, utcDateString);
    return "-";
  }
};

/**
 * Проверяет, является ли дата сегодняшней
 */
export const isToday = (utcDateString: string | null | undefined): boolean => {
  if (!utcDateString) return false;
  
  try {
    const utcDate = parseUTCDate(utcDateString);
    const today = new Date();
    
    return (
      utcDate.getDate() === today.getDate() &&
      utcDate.getMonth() === today.getMonth() &&
      utcDate.getFullYear() === today.getFullYear()
    );
  } catch {
    return false;
  }
};

/**
 * Проверяет, была ли дата вчера
 */
export const isYesterday = (utcDateString: string | null | undefined): boolean => {
  if (!utcDateString) return false;
  
  try {
    const utcDate = parseUTCDate(utcDateString);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    return (
      utcDate.getDate() === yesterday.getDate() &&
      utcDate.getMonth() === yesterday.getMonth() &&
      utcDate.getFullYear() === yesterday.getFullYear()
    );
  } catch {
    return false;
  }
};

/**
 * Получает пользовательский часовой пояс
 */
export const getUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

/**
 * Конвертирует локальное время в UTC для отправки на сервер
 */
export const convertLocalToUTC = (localDate: Date): string => {
  return localDate.toISOString();
}; 