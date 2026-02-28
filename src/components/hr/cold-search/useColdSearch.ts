import { useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch } from '@/utils/api';
import { ColdCandidate, ColdSearchJob } from './types';

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test';
const API_URL = (path: string) => `${API_BASE}${path}`;

const RUNNING_STATUSES = ['pending', 'searching', 'prescoring', 'scoring'];

export function useColdSearch(vacancyId: number) {
  const [job, setJob] = useState<ColdSearchJob | null>(null);
  const [candidates, setCandidates] = useState<ColdCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await apiFetch(API_URL(`/api/cold-search/vacancy/${vacancyId}/status`));
      const data = await res.json();
      if (data.success) {
        setJob(data.job ?? null);
        setCandidates(data.candidates ?? []);
        // Если job завершён — останавливаем polling
        if (!data.job || !RUNNING_STATUSES.includes(data.job.status)) {
          stopPolling();
        }
      }
    } catch {
      setError('Ошибка загрузки статуса');
    } finally {
      setLoading(false);
    }
  }, [vacancyId, stopPolling]);

  // Polling каждые 5 секунд — fallback и обновление кандидатов пока идёт поиск
  const startPolling = useCallback(() => {
    stopPolling();
    pollTimerRef.current = setInterval(fetchStatus, 5000);
  }, [fetchStatus, stopPolling]);

  const connectSse = useCallback((jobId: number) => {
    eventSourceRef.current?.close();

    const token = typeof window !== 'undefined'
      ? localStorage.getItem('recruitment_token') || ''
      : '';

    const url = `${API_BASE}/api/cold-search/job/${jobId}/stream?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.addEventListener('progress', (e) => {
      const data = JSON.parse(e.data);
      setJob((prev) => prev ? { ...prev, ...data } : prev);
    });

    es.addEventListener('complete', (e) => {
      const data = JSON.parse(e.data);
      setJob((prev) => prev ? { ...prev, ...data } : prev);
      es.close();
      stopPolling();
      // Финальная загрузка кандидатов после завершения
      fetchStatus();
    });

    es.addEventListener('error', () => {
      // SSE упал (таймаут/сеть) — EventSource сам переподключится через retry мс.
      // Polling подхватит обновления пока SSE восстанавливается.
    });
  }, [fetchStatus, stopPolling]);

  // Начальная загрузка
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Если job running — SSE + polling
  useEffect(() => {
    if (!job) return;

    const isRunning = RUNNING_STATUSES.includes(job.status);

    if (isRunning) {
      connectSse(job.id);
      startPolling();
    } else {
      eventSourceRef.current?.close();
      stopPolling();
    }

    return () => {
      eventSourceRef.current?.close();
      stopPolling();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job?.id, job?.status]);

  const startSearch = useCallback(async (searchHints: string) => {
    setStarting(true);
    setError(null);
    try {
      const res = await apiFetch(API_URL(`/api/cold-search/vacancy/${vacancyId}/start`), {
        method: 'POST',
        body: JSON.stringify({ search_hints: searchHints }),
      });
      const data = await res.json();
      if (data.success) {
        setJob(data.job);
        connectSse(data.job.id);
        startPolling();
      } else {
        setError(data.error || 'Не удалось запустить поиск');
      }
    } catch {
      setError('Ошибка запуска поиска');
    } finally {
      setStarting(false);
    }
  }, [vacancyId, connectSse, startPolling]);

  return {
    job,
    candidates,
    loading,
    starting,
    error,
    startSearch,
    refetch: fetchStatus,
  };
}
