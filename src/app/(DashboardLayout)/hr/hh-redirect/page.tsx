"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiFetch } from "@/utils/api";
import { Trans } from '@lingui/react';

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

export default function HhRedirectPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      router.push("/hr/settings/hh-integration?error=" + encodeURIComponent(error));
      return;
    }

    if (!code || !state) {
      router.push("/hr/settings/hh-integration?error=missing_params");
      return;
    }

    handleOAuthCallback(code, state);
  }, [searchParams, router]);

  const handleOAuthCallback = async (code: string, state: string) => {
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

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2><Trans>Обработка авторизации HH.ru...</Trans></h2>
      <p><Trans>Пожалуйста, подождите...</Trans></p>
    </div>
  );
}
