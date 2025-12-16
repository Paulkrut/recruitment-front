"use client";
import { Trans } from '@lingui/macro';

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiFetch } from "@/utils/api";

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

export default function HhRedirectPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasProcessed = useRef(false); // ← Защита от двойного вызова

  useEffect(() => {
    // Если уже обрабатывали - выходим
    if (hasProcessed.current) {
      return;
    }

    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const type = searchParams.get("type"); // 'oauth' для авторизации пользователя

    if (error) {
      // Если это OAuth авторизация пользователя
      if (type === "oauth") {
        router.push("/auth/login?error=" + encodeURIComponent(error));
      } else {
        // HH API Integration (вакансии)
        router.push("/hr/settings/hh-integration?error=" + encodeURIComponent(error));
      }
      return;
    }

    if (!code || !state) {
      if (type === "oauth") {
        router.push("/auth/login?error=hh_no_code");
      } else {
        router.push("/hr/settings/hh-integration?error=missing_params");
      }
      return;
    }

    // Помечаем что начали обработку
    hasProcessed.current = true;

    // Обработка в зависимости от типа
    if (type === "oauth") {
      handleUserOAuthCallback(code, state);
    } else {
      handleApiIntegrationCallback(code, state);
    }
  }, [searchParams, router]);

  // HH OAuth - авторизация пользователя
  const handleUserOAuthCallback = async (code: string, state: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/hh/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`, {
        method: "GET",
      });

      const data = await response.json();

      if (data.success && data.token) {
        // Сохраняем НАШ JWT токен (точно так же как при обычной авторизации)
        localStorage.setItem("recruitment_token", data.token);
        localStorage.removeItem("current_company"); // Очищаем компанию для выбора
        
        // Полная перезагрузка страницы (как в обычной авторизации)
        window.location.href = "/hr/";
      } else if (data.error) {
        // Ошибка
        const errorCode = data.error || "hh_callback_failed";
        const email = data.email || "";
        router.push(`/auth/login?error=${errorCode}${email ? '&email=' + encodeURIComponent(email) : ''}`);
      } else {
        // Неожиданный формат ответа
        console.error('Unexpected response format:', data);
        router.push("/auth/login?error=hh_callback_failed");
      }
    } catch (err: any) {
      console.error("HH OAuth callback error:", err);
      router.push("/auth/login?error=hh_callback_failed");
    }
  };

  // HH API Integration - вакансии компании (существующая логика)
  const handleApiIntegrationCallback = async (code: string, state: string) => {
    try {
      const response = await apiFetch(`${API_BASE}/api/hh-integration/oauth-callback`, {
        method: "POST",
        body: JSON.stringify({ code, state }),
      });
      const data = await response.json();
      if (data.success) {
        router.push("/hr/settings/hh-integration?success=true");
      } else {
        router.push("/hr/settings/hh-integration?error=" + encodeURIComponent(data.message || "Unknown error"));
      }
    } catch (err: any) {
      router.push("/hr/settings/hh-integration?error=" + encodeURIComponent(err.message || "Network error"));
    }
  };

  const type = searchParams.get("type");
  const isOAuth = type === "oauth";

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>
        {isOAuth ? (
          <Trans>Завершаем авторизацию...</Trans>
        ) : (
          <Trans>Обработка авторизации HH.ru...</Trans>
        )}
      </h2>
      <p><Trans>Пожалуйста, подождите...</Trans></p>
    </div>
  );
}
