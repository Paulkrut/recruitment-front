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

  // Вызываем fetch с объединёнными настройками
  return fetch(url, {
    ...options,
    headers,
    credentials: "include", // чтобы куки тоже отправлялись при необходимости
  });
} 