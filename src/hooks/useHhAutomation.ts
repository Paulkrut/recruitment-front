import { useState } from 'react';
import { apiFetch } from '@/utils/api';
import type { HhAutomationSettings } from '@/components/hr/hh-integration/types';

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test';

export function useHhAutomation() {
  const [settings, setSettings] = useState<HhAutomationSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFetch(`${API_BASE}/api/hh-integration/settings`);
      const data = await response.json();
      
      console.log('🌐 API response:', data);
      
      if (data.success) {
        console.log('✅ Setting settings to:', data.settings, 'Type:', typeof data.settings, 'Is array:', Array.isArray(data.settings));
        setSettings(data.settings);
      } else {
        throw new Error(data.message || 'Ошибка загрузки настроек');
      }
    } catch (err: any) {
      console.error('❌ Load settings error:', err);
      setError(err.message || 'Ошибка загрузки настроек автоматизации');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<HhAutomationSettings>) => {
    try {
      setSaving(true);
      setError(null);
      const response = await apiFetch(`${API_BASE}/api/hh-integration/settings`, {
        method: 'PUT',
        body: JSON.stringify(newSettings),
      });
      const data = await response.json();

      if (data.success) {
        setSettings(data.settings);
        return true;
      } else {
        throw new Error(data.message || 'Ошибка сохранения настроек');
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка сохранения настроек');
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    settings,
    loading,
    saving,
    error,
    loadSettings,
    updateSettings,
  };
}

