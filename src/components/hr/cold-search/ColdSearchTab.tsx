'use client';
import React, { useState } from 'react';
import {
  Box, Button, TextField, Typography, CircularProgress,
  Alert, Tab, Tooltip, IconButton, Divider,
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

const EXP_MAP: Record<string, string> = {
  noExperience: 'без опыта',
  between1And3: '1–3 года',
  between3And6: '3–6 лет',
  moreThan6:    '6+ лет',
};
const STATUS_MAP: Record<string, string> = {
  pending:    'в очереди',
  searching:  'поиск кандидатов',
  prescoring: 'AI прескоринг',
  scoring:    'детальный скоринг',
  complete:   'завершён',
  failed:     'ошибка',
};
const GENDER_MAP: Record<string, string> = {
  male:   'мужской',
  female: 'женский',
};

function TooltipRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', gap: 0.75, mb: 0.5, alignItems: 'flex-start' }}>
      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap', flexShrink: 0 }}>
        {label}:
      </Typography>
      <Typography variant="caption" sx={{ color: '#fff', wordBreak: 'break-word' }}>
        {value}
      </Typography>
    </Box>
  );
}

function JobTooltipContent({ job }: { job: ColdSearchJob }) {
  const filters = job.hh_filters ?? {};
  const p = job.progress;

  const areaLabels = filters.area_labels as string[] | undefined;
  const areaIds    = filters.area as number[] | undefined;
  const expValues  = filters.experience
    ? (Array.isArray(filters.experience) ? filters.experience as string[] : [filters.experience as string])
    : [];
  const gender     = filters.gender as string | undefined;

  const createdDate = new Date(job.created_at);
  const dateStr = createdDate.toLocaleString('ru', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <Box sx={{ p: 0.75, minWidth: 220, maxWidth: 340 }}>
      {/* Дата и статус */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)' }}>
          {dateStr}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: job.status === 'complete' ? '#69d98c' : job.status === 'failed' ? '#ff7b7b' : '#ffd666',
            fontWeight: 600,
          }}
        >
          {STATUS_MAP[job.status] ?? job.status}
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)', mb: 1 }} />

      {/* Условия поиска */}
      {job.search_hints && (
        <TooltipRow label="Запрос" value={job.search_hints} />
      )}
      {expValues.length > 0 && (
        <TooltipRow label="Опыт" value={expValues.map(e => EXP_MAP[e] ?? e).join(', ')} />
      )}
      {areaLabels && areaLabels.length > 0 ? (
        <TooltipRow label="Регион" value={areaLabels.join(', ')} />
      ) : areaIds && areaIds.length > 0 && !(areaIds.length === 1 && String(areaIds[0]) === '113') ? (
        <TooltipRow label="Регион ID" value={areaIds.join(', ')} />
      ) : null}
      {gender && <TooltipRow label="Пол" value={GENDER_MAP[gender] ?? gender} />}
      {(filters.age_from || filters.age_to) && (
        <TooltipRow
          label="Возраст"
          value={[
            filters.age_from ? `от ${filters.age_from}` : '',
            filters.age_to  ? `до ${filters.age_to}`  : '',
          ].filter(Boolean).join(' ')}
        />
      )}
      {filters.salary && (
        <TooltipRow label="Зарплата" value={`от ${Number(filters.salary).toLocaleString('ru')} ₽`} />
      )}
      {filters.period && (
        <TooltipRow label="Период" value={`последние ${filters.period} дн.`} />
      )}

      {/* Результаты */}
      {p && (p.found > 0 || p.scored > 0) && (
        <>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)', my: 1 }} />
          <TooltipRow label="Собрано из HH" value={String(p.found)} />
          {p.prescored > 0 && (
            <TooltipRow label="Прескоринг" value={`${p.prescored} из ${p.found}`} />
          )}
          {p.scored > 0 && (
            <TooltipRow label="Оценено AI" value={String(p.scored)} />
          )}
          {p.skipped > 0 && (
            <TooltipRow label="Пропущено" value={String(p.skipped)} />
          )}
        </>
      )}
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
