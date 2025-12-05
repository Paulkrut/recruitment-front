/**
 * Минимальная система отслеживания ошибок фронтенда
 * Отправляет ошибки на бекенд → Telegram
 */

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test';

interface ErrorContext {
  user?: {
    email?: string;
    id?: string;
  };
  company?: string;
  page?: string;
  [key: string]: any;
}

interface ErrorReport {
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  timestamp: string;
  context?: ErrorContext;
}

/**
 * Отправить отчёт об ошибке на сервер
 */
async function sendErrorReport(report: ErrorReport): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/public/report-error`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(report),
    });
  } catch (e) {
    // Игнорируем ошибки при отправке (чтобы не создавать бесконечный цикл)
    console.error('Failed to report error:', e);
  }
}

/**
 * Получить контекст пользователя
 */
function getUserContext(): ErrorContext {
  const context: ErrorContext = {};

  try {
    // Пытаемся получить данные пользователя из localStorage
    const token = localStorage.getItem('recruitment_token');
    if (token) {
      // Можно декодировать JWT для получения email/id
      // Пока просто отмечаем что пользователь залогинен
      context.user = { id: 'logged_in' };
    }

    const company = localStorage.getItem('current_company');
    if (company) {
      context.company = company;
    }

    // Добавляем текущую страницу
    context.page = window.location.pathname;
  } catch (e) {
    // Игнорируем ошибки получения контекста
  }

  return context;
}

/**
 * Репортить ошибку
 */
export async function reportError(
  error: Error,
  additionalContext?: Record<string, any>
): Promise<void> {
  const report: ErrorReport = {
    message: error.message,
    stack: error.stack,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    context: {
      ...getUserContext(),
      ...additionalContext,
    },
  };

  await sendErrorReport(report);
}

/**
 * Инициализировать глобальные обработчики ошибок
 */
export function initErrorReporter(): void {
  if (typeof window === 'undefined') {
    return; // Не работает на сервере
  }

  // Обработчик для всех необработанных ошибок
  window.addEventListener('error', (event) => {
    reportError(
      new Error(event.message),
      {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      }
    );
  });

  // Обработчик для необработанных Promise rejection
  window.addEventListener('unhandledrejection', (event) => {
    reportError(
      new Error(`Unhandled Promise Rejection: ${event.reason}`),
      {
        promiseRejection: true,
      }
    );
  });

  console.log('✅ Error reporter initialized');
}

/**
 * Обёртка для try-catch блоков
 */
export function withErrorReport<T>(
  fn: () => T,
  context?: Record<string, any>
): T | undefined {
  try {
    return fn();
  } catch (error) {
    if (error instanceof Error) {
      reportError(error, context);
    }
    throw error; // Пробрасываем дальше
  }
}

/**
 * Обёртка для async функций
 */
export async function withErrorReportAsync<T>(
  fn: () => Promise<T>,
  context?: Record<string, any>
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof Error) {
      reportError(error, context);
    }
    throw error; // Пробрасываем дальше
  }
}

