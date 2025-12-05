/**
 * Утилиты для работы с международными телефонными номерами
 */

/**
 * Нормализует номер телефона для отправки на backend
 * react-phone-input-2 возвращает номер в формате "79267228855" (без +)
 * Эта функция добавляет + если его нет
 * 
 * @param phone - номер телефона от react-phone-input-2
 * @returns номер в формате +XXXXXXXXXXX
 */
export function normalizePhoneForBackend(phone: string): string {
  if (!phone) return '';
  
  const trimmed = phone.trim();
  if (!trimmed) return '';
  
  // Если уже есть +, возвращаем как есть
  if (trimmed.startsWith('+')) {
    return trimmed;
  }
  
  // Добавляем + в начало
  return `+${trimmed}`;
}

/**
 * Валидация международного номера телефона
 * Проверяет что номер соответствует формату E.164
 * 
 * @param phone - номер телефона
 * @returns true если валидный
 */
export function isValidInternationalPhone(phone: string): boolean {
  if (!phone) return false;
  
  // Нормализуем номер
  const normalized = normalizePhoneForBackend(phone);
  
  // Убираем все кроме цифр и +
  const clean = normalized.replace(/[^\d+]/g, '');
  
  // Формат E.164: +XXXXXXXXXXX (от 8 до 15 цифр после +)
  // 8 цифр - минимум для некоторых стран
  // 15 цифр - максимум по стандарту ITU-T E.164
  return /^\+\d{8,15}$/.test(clean);
}

/**
 * Форматирует номер для отображения
 * 
 * @param phone - номер в формате +XXXXXXXXXXX
 * @returns форматированный номер для отображения
 */
export function formatPhoneForDisplay(phone: string): string {
  if (!phone) return '';
  
  const normalized = normalizePhoneForBackend(phone);
  
  // Простое форматирование для отображения
  // Можно улучшить используя libphonenumber-js
  return normalized;
}

/**
 * Очищает номер от всего кроме цифр
 * 
 * @param phone - любой номер телефона
 * @returns только цифры
 */
export function cleanPhoneDigits(phone: string): string {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
}

