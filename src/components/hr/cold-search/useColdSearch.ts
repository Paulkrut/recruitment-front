import { useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch } from '@/utils/api';
import { ColdCandidate, ColdSearchJob } from './types';

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test';
const API_URL = (path: string) => `${API_BASE}${path}`;

const RUNNING_STATUSES = ['pending', 'searching', 'prescoring', 'scoring'];

export function useColdSearch(vacancyId: number) {
  const [jobs, setJobs] = useState<ColdSearchJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
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

  // Загрузить кандидатов для конкретного job
  const fetchJobCandidates = useCallback(async (jobId: number) => {
    try {
      const res = await apiFetch(API_URL(`/api/cold-search/job/${jobId}/candidates`));
      const data = await res.json();
      if (data.success) {
        setCandidates(data.candidates ?? []);
        // Обновляем статус job в списке
        setJobs((prev) => prev.map((j) => j.id === jobId ? { ...j, ...data.job } : j));
      }
    } catch {
      // silent
    }
  }, []);

  // Загрузить список всех job для вакансии + кандидатов выбранного
  const fetchJobs = useCallback(async (selectJobId?: number) => {
    try {
      const res = await apiFetch(API_URL(`/api/cold-search/vacancy/${vacancyId}/jobs`));
      const data = await res.json();
      if (data.success && data.jobs) {
        const jobList: ColdSearchJob[] = data.jobs;
        setJobs(jobList);

        if (jobList.length === 0) {
          setLoading(false);
          return;
        }

        // Выбираем job: явно указанный → последний
        const targetId = selectJobId ?? jobList[0].id;
        setSelectedJobId(targetId);
        await fetchJobCandidates(targetId);
      }
    } catch {
      setError('Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }, [vacancyId, fetchJobCandidates]);

  // Переключить активную сессию
  const selectJob = useCallback(async (jobId: number) => {
    setSelectedJobId(jobId);
    setCandidates([]);
    await fetchJobCandidates(jobId);
  }, [fetchJobCandidates]);

  // SSE для отслеживания прогресса запущенного job
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
      setJobs((prev) => prev.map((j) => j.id === jobId ? { ...j, ...data } : j));
    });

    es.addEventListener('complete', () => {
      es.close();
      stopPolling();
      fetchJobCandidates(jobId);
      fetchJobs();
    });

    es.addEventListener('error', () => {
      // EventSource переподключится автоматически по retry
    });
  }, [fetchJobCandidates, fetchJobs, stopPolling]);

  // Polling — обновляет статус и кандидатов пока job работает
  const startPolling = useCallback((jobId: number) => {
    stopPolling();
    pollTimerRef.current = setInterval(async () => {
      await fetchJobCandidates(jobId);
      // Если job завершился — остановить polling
      setJobs((prev) => {
        const job = prev.find((j) => j.id === jobId);
        if (job && !RUNNING_STATUSES.includes(job.status)) {
          stopPolling();
        }
        return prev;
      });
    }, 5000);
  }, [fetchJobCandidates, stopPolling]);

  // Начальная загрузка
  useEffect(() => {
    fetchJobs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vacancyId]);

  // Подключить SSE + polling для running job
  useEffect(() => {
    const runningJob = jobs.find((j) => RUNNING_STATUSES.includes(j.status));

    if (runningJob) {
      // Переключаемся на активный job автоматически
      if (selectedJobId !== runningJob.id) {
        setSelectedJobId(runningJob.id);
        fetchJobCandidates(runningJob.id);
      }
      connectSse(runningJob.id);
      startPolling(runningJob.id);
    } else {
      eventSourceRef.current?.close();
      stopPolling();
    }

    return () => {
      eventSourceRef.current?.close();
      stopPolling();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs.map((j) => `${j.id}:${j.status}`).join(',')]);

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
        // Добавляем новый job в начало списка и выбираем его
        const newJob: ColdSearchJob = data.job;
        setJobs((prev) => [newJob, ...prev]);
        setSelectedJobId(newJob.id);
        setCandidates([]);
        connectSse(newJob.id);
        startPolling(newJob.id);
      } else {
        setError(data.error || 'Не удалось запустить поиск');
      }
    } catch {
      setError('Ошибка запуска поиска');
    } finally {
      setStarting(false);
    }
  }, [vacancyId, connectSse, startPolling]);

  const selectedJob = jobs.find((j) => j.id === selectedJobId) ?? null;
  const activeJob = jobs.find((j) => RUNNING_STATUSES.includes(j.status)) ?? null;

  return {
    jobs,
    selectedJob,
    activeJob,
    selectedJobId,
    candidates,
    loading,
    starting,
    error,
    startSearch,
    selectJob,
    refetch: () => fetchJobs(selectedJobId ?? undefined),
  };
}
