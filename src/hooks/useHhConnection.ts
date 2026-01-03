import { useState } from 'react';
import { apiFetch } from '@/utils/api';

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test';

export function useHhConnection() {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startOAuth = async () => {
    try {
      setConnecting(true);
      setError(null);
      const response = await apiFetch(`${API_BASE}/api/hh-integration/start-oauth`);
      const data = await response.json();
      
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        throw new Error('Не удалось получить URL авторизации');
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка запуска авторизации');
      setConnecting(false);
    }
  };

  const handleCallback = async (code: string, state: string) => {
    try {
      setConnecting(true);
      setError(null);
      const response = await apiFetch(`${API_BASE}/api/hh-integration/oauth-callback`, {
        method: 'POST',
        body: JSON.stringify({ code, state }),
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Ошибка авторизации');
      }

      return data;
    } catch (err: any) {
      setError(err.message || 'Ошибка обработки авторизации');
      throw err;
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = async () => {
    try {
      setConnecting(true);
      setError(null);
      const response = await apiFetch(`${API_BASE}/api/hh-integration/disconnect`, {
        method: 'POST',
      });
      await response.json();
      return true;
    } catch (err: any) {
      setError(err.message || 'Ошибка отключения');
      throw err;
    } finally {
      setConnecting(false);
    }
  };

  return {
    connecting,
    error,
    startOAuth,
    handleCallback,
    disconnect,
  };
}

