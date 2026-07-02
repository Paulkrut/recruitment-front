/** Токены интервью/самозаписи: bin2hex(random_bytes(32)) = 64 hex-символа */
export const INTERVIEW_TOKEN_LENGTH = 64;
const INTERVIEW_TOKEN_PATTERN = /^[a-f0-9]{64}$/i;
const INTERVIEW_TOKEN_EXTRACT = /^([a-f0-9]{64})/i;

/**
 * Извлекает валидный 64-символьный hex-токен из «грязной» строки.
 * iOS/HH иногда склеивают к URL следующее русское слово без пробела.
 */
export function sanitizeInterviewToken(raw: string | null | undefined): string | null {
  if (!raw) {
    return null;
  }

  const decoded = tryDecodeURIComponent(raw.trim());
  const match = decoded.match(INTERVIEW_TOKEN_EXTRACT);

  return match ? match[1].toLowerCase() : null;
}

export function isValidInterviewToken(token: string | null | undefined): boolean {
  return token != null && INTERVIEW_TOKEN_PATTERN.test(token);
}

function tryDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
