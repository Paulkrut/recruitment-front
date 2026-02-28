import { useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch } from '@/utils/api';
import { ColdCandidate, ColdSearchJob } from './types';

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test';
const API_URL = (path: string) => `${API_BASE}${path}`;

export function useColdSearch(vacancyId: number) {
  const [job, setJob] = useState<ColdSearchJob | null>(null);
  const [candidates, setCandidates] = useState<ColdCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await apiFetch(API_URL(`/api/cold-search/vacancy/${vacancyId}/status`));
      const data = await res.json();
      if (data.success) {
        setJob(data.job ?? null);
        setCandidates(data.candidates ?? []);
      }
    } catch {
      setError('Ошибка загрузки статуса');
    } finally {
      setLoading(false);
    }
  }, [vacancyId]);

  const connectSse = useCallback((jobId: number) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

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
      // После завершения — перезагружаем кандидатов
      fetchStatus();
    });

    es.addEventListener('error', () => {
      es.close();
    });

    es.addEventListener('heartbeat', () => {
      // keep-alive, ничего не делаем
    });
  }, [fetchStatus]);

  // Начальная загрузка
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Если job running — подключаемся к SSE
  useEffect(() => {
    if (!job) return;

    const isRunning = ['pending', 'searching', 'prescoring', 'scoring'].includes(job.status);

    if (isRunning) {
      connectSse(job.id);
    } else {
      eventSourceRef.current?.close();
    }

    return () => {
      eventSourceRef.current?.close();
    };
  }, [job?.id, job?.status, connectSse]);

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
      } else {
        setError(data.error || 'Не удалось запустить поиск');
      }
    } catch {
      setError('Ошибка запуска поиска');
    } finally {
      setStarting(false);
    }
  }, [vacancyId, connectSse]);

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
