import { useState, useEffect } from 'react';
import { apiFetch } from '@/utils/api';
import type { HhIntegrationStatus } from '@/components/hr/hh-integration/types';

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test';

export function useHhStatus() {
  const [status, setStatus] = useState<HhIntegrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFetch(`${API_BASE}/api/hh-integration/status`);
      const data = await response.json();
      setStatus(data);
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки статуса интеграции');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return {
    status,
    loading,
    error,
    refresh: fetchStatus,
  };
}

