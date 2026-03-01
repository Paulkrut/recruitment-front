'use client';
import React, { useState } from 'react';
import {
  Box, Button, TextField, Typography, CircularProgress,
  Alert, Tab, Tooltip, IconButton, Chip, Divider,
} from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { IconSearch, IconPlus, IconInfoCircle } from '@tabler/icons-react';
import Link from 'next/link';
import { useColdSearch } from './useColdSearch';
import ColdSearchProgress from './ColdSearchProgress';
import ColdCandidateCard from './ColdCandidateCard';
import CandidateResumeModal from './CandidateResumeModal';
import JobFunnelView from './JobFunnelView';
import { ColdCandidate, ColdSearchJob } from './types';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface Props {
  vacancyId: number;
}

function formatTabLabel(job: ColdSearchJob): string {
  const date = new Date(job.created_at);
  return `Поиск от ${date.toLocaleDateString('ru', { day: '2-digit', month: '2-digit', year: '2-digit' })}`;
}

function JobTooltipContent({ job }: { job: ColdSearchJob }) {
  const filters = job.hh_filters ?? {};

  const rows: { label: string; value: string }[] = [];

  if (job.search_hints) {
    rows.push({ label: 'Условия', value: job.search_hints });
  }
  if (filters.experience) {
    const expMap: Record<string, string> = {
      noExperience: 'без опыта',
      between1And3: '1–3 года',
      between3And6: '3–6 лет',
      moreThan6: '6+ лет',
    };
    rows.push({ label: 'Опыт', value: expMap[filters.experience as string] ?? String(filters.experience) });
  }
  const areaLabels = filters.area_labels as string[] | undefined;
  const areaIds    = filters.area as number[] | undefined;
  if (areaLabels && areaLabels.length > 0) {
    rows.push({ label: 'Город', value: areaLabels.join(', ') });
  } else if (areaIds && areaIds.length > 0 && !(areaIds.length === 1 && areaIds[0] === 113)) {
    rows.push({ label: 'Город (ID)', value: areaIds.join(', ') });
  }
  if (filters.salary) {
    rows.push({ label: 'Зарплата', value: `от ${filters.salary.toLocaleString()} ₽` });
  }
  if (filters.age_from || filters.age_to) {
    const from = filters.age_from ? `от ${filters.age_from}` : '';
    const to = filters.age_to ? `до ${filters.age_to}` : '';
    rows.push({ label: 'Возраст', value: [from, to].filter(Boolean).join(' ') });
  }
  if (filters.period) {
    rows.push({ label: 'Период резюме', value: `последние ${filters.period} дн.` });
  }

  if (rows.length === 0) {
    return <Typography variant="caption">Условия не заданы</Typography>;
  }

  return (
    <Box sx={{ p: 0.5, maxWidth: 320 }}>
      {rows.map(({ label, value }) => (
        <Box key={label} sx={{ mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary">{label}: </Typography>
          <Typography variant="caption">{value}</Typography>
        </Box>
      ))}
    </Box>
  );
}

const RUNNING_STATUSES = ['pending', 'searching', 'prescoring', 'scoring'];

export default function ColdSearchTab({ vacancyId }: Props) {
  const {
    jobs, selectedJob, activeJob, selectedJobId,
    candidates, loading, starting, error,
    startSearch, selectJob,
  } = useColdSearch(vacancyId);

  const [searchHints, setSearchHints] = useState('');
  const [showNewSearch, setShowNewSearch] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<ColdCandidate | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Открытие кандидата по URL параметру ?resume=<id>
  const resumeIdFromUrl = searchParams.get('resume');
  React.useEffect(() => {
    if (resumeIdFromUrl && candidates.length > 0) {
      const found = candidates.find((c) => c.hh_resume_id === resumeIdFromUrl);
      if (found) setSelectedCandidate(found);
    }
  }, [resumeIdFromUrl, candidates]);

  const openCandidate = (c: ColdCandidate) => {
    setSelectedCandidate(c);
    const params = new URLSearchParams(searchParams.toString());
    params.set('resume', c.hh_resume_id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const closeCandidate = () => {
    setSelectedCandidate(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('resume');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleStartSearch = async () => {
    await startSearch(searchHints);
    setShowNewSearch(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Нет ни одного поиска — сразу показываем форму
  if (jobs.length === 0 && !showNewSearch) {
    return (
      <Box sx={{ maxWidth: 640, pt: 2 }}>
        <NewSearchForm
          searchHints={searchHints}
          setSearchHints={setSearchHints}
          onStart={handleStartSearch}
          starting={starting}
          isRunning={false}
          error={error}
        />
      </Box>
    );
  }

  const tabValue = showNewSearch ? 'new' : String(selectedJobId ?? jobs[0]?.id ?? 'new');

  return (
    <Box>
      <TabContext value={tabValue}>
        <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
          <TabList
            onChange={(_, v) => {
              if (v === 'new') {
                setShowNewSearch(true);
              } else {
                setShowNewSearch(false);
                selectJob(Number(v));
              }
            }}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ flex: 1 }}
          >
            {jobs.map((job) => {
              const isRunning = RUNNING_STATUSES.includes(job.status);
              return (
                <Tab
                  key={job.id}
                  value={String(job.id)}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <span>{formatTabLabel(job)}</span>
                      {isRunning && (
                        <CircularProgress size={12} sx={{ ml: 0.5 }} />
                      )}
                      <Tooltip
                        title={<JobTooltipContent job={job} />}
                        arrow
                        placement="bottom"
                      >
                        <IconButton
                          size="small"
                          sx={{ p: 0, ml: 0.25, color: 'text.secondary' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <IconInfoCircle size={14} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                />
              );
            })}
            <Tab
              value="new"
              icon={<IconPlus size={15} />}
              iconPosition="start"
              label="Новый поиск"
              sx={{ minWidth: 140 }}
            />
          </TabList>
        </Box>

        {/* Вкладки сессий */}
        {jobs.map((job) => (
          <TabPanel key={job.id} value={String(job.id)} sx={{ px: 0, pt: 2 }}>
            <SessionPanel
              job={job}
              candidates={candidates}
              onOpenCandidate={openCandidate}
            />
          </TabPanel>
        ))}

        {/* Вкладка нового поиска */}
        <TabPanel value="new" sx={{ px: 0, pt: 2 }}>
          <Box sx={{ maxWidth: 640 }}>
            {activeJob && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Поиск уже выполняется. Дождитесь завершения перед запуском нового.
              </Alert>
            )}
            <NewSearchForm
              searchHints={searchHints}
              setSearchHints={setSearchHints}
              onStart={handleStartSearch}
              starting={starting}
              isRunning={!!activeJob}
              error={error}
            />
          </Box>
        </TabPanel>
      </TabContext>

      <CandidateResumeModal
        candidate={selectedCandidate}
        onClose={closeCandidate}
      />
    </Box>
  );
}

// ─── Панель одной сессии поиска ──────────────────────────────────────────────

function SessionPanel({
  job,
  candidates,
  onOpenCandidate,
}: {
  job: ColdSearchJob;
  candidates: ColdCandidate[];
  onOpenCandidate: (c: ColdCandidate) => void;
}) {
  const isRunning = RUNNING_STATUSES.includes(job.status);

  return (
    <Box>
      {isRunning && <ColdSearchProgress job={job} />}

      {job.params_expanded && !isRunning && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Параметры поиска были расширены — строгие фильтры (опыт, период, зарплата, статус поиска работы) сняты из-за нехватки кандидатов.
        </Alert>
      )}

      {/* Воронка поиска — показываем когда есть данные */}
      {(job.status === 'complete' || (job.queries_log ?? []).length > 0) && (
        <JobFunnelView job={job} />
      )}

      {job.status === 'failed' && job.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {job.error === 'NO_HH_TOKEN' ? (
            <>
              Нет активного токена HH.ru.{' '}
              <Link href="/hr/settings/hh-integration" style={{ color: 'inherit' }}>
                Настроить интеграцию
              </Link>
            </>
          ) : job.error}
        </Alert>
      )}

      {candidates.length === 0 && !isRunning && (
        <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
          {job.status === 'complete' ? (
            <>
              <Typography variant="body1" gutterBottom>Кандидаты не найдены</Typography>
              <Typography variant="body2">Попробуйте расширить параметры или изменить описание вакансии</Typography>
            </>
          ) : (
            <Typography variant="body2">Загрузка кандидатов...</Typography>
          )}
        </Box>
      )}

      {candidates.map((c) => (
        <ColdCandidateCard
          key={c.id}
          candidate={c}
          onClick={() => onOpenCandidate(c)}
        />
      ))}
    </Box>
  );
}

// ─── Форма запуска нового поиска ─────────────────────────────────────────────

function NewSearchForm({
  searchHints,
  setSearchHints,
  onStart,
  starting,
  isRunning,
  error,
}: {
  searchHints: string;
  setSearchHints: (v: string) => void;
  onStart: () => void;
  starting: boolean;
  isRunning: boolean;
  error: string | null;
}) {
  return (
    <>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        Холодный поиск кандидатов
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        Система проанализирует вакансию, составит поисковые запросы для HH.ru и оценит найденных кандидатов с помощью AI.
      </Typography>

      <TextField
        fullWidth
        multiline
        minRows={3}
        maxRows={8}
        label="Дополнительные требования (необязательно)"
        placeholder="Например: от 3 лет опыта, удалённо или Москва, обязательно React и TypeScript, до 200к, без джунов"
        value={searchHints}
        onChange={(e) => setSearchHints(e.target.value)}
        disabled={isRunning}
        sx={{ mb: 2 }}
        helperText="Укажите что важно и не отражено в вакансии: опыт, регион, стек, зарплату, формат работы"
      />

      {error && (
        error === 'NO_HH_TOKEN' ? (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={
              <Button
                component={Link}
                href="/hr/settings/hh-integration"
                size="small"
                color="inherit"
                variant="outlined"
              >
                Настроить HH
              </Button>
            }
          >
            Нет активного токена HH.ru — необходимо авторизоваться в интеграции.
          </Alert>
        ) : (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )
      )}

      <Button
        variant="contained"
        size="large"
        startIcon={starting ? <CircularProgress size={18} color="inherit" /> : <IconSearch size={18} />}
        onClick={onStart}
        disabled={isRunning || starting}
        fullWidth
      >
        {starting ? 'Запускаем...' : isRunning ? 'Поиск выполняется...' : 'Запустить поиск'}
      </Button>
    </>
  );
}
