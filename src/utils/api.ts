export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("recruitment_token") : null;

  const headers = new Headers(options.headers || {});

  // По умолчанию ожидаем и отправляем JSON
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // Добавляем токен авторизации, если есть
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Добавляем текущую компанию (кроме определенных эндпоинтов)
  if (typeof window !== 'undefined') {
    const cid = localStorage.getItem('current_company');
    const urlObj = new URL(url, window.location.origin);
    const path = urlObj.pathname;
    
    // Эндпоинты которые не требуют X-Company-ID
    const excludedPaths = [
      '/api/user/me',
      '/api/user/companies', 
      '/api/user/invites',
      '/api/auth',
      '/api/public',
      '/api/company', // Операции создания/управления компаниями
      '/api/company/invite' // Операции с приглашениями
      // НЕ исключаем /api/hh-integration - ему нужен X-Company-ID
    ];
    
    const shouldExcludeCompanyHeader = excludedPaths.some(excludedPath => 
      path.startsWith(excludedPath)
    );
    
    if (cid && !headers.has('X-Company-ID') && !shouldExcludeCompanyHeader) {
      headers.set('X-Company-ID', cid);
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // чтобы куки тоже отправлялись при необходимости
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("recruitment_token");
      window.location.href = "/auth/login";
    }
    throw new Error("Unauthorized");
  }

  return response;
} 