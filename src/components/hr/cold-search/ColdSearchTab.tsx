'use client';
import React, { useState } from 'react';
import {
  Box, Button, TextField, Typography, CircularProgress,
  Alert, Tab,
} from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { IconSearch, IconUsers } from '@tabler/icons-react';
import Link from 'next/link';
import { useColdSearch } from './useColdSearch';
import ColdSearchProgress from './ColdSearchProgress';
import ColdCandidateCard from './ColdCandidateCard';
import CandidateResumeModal from './CandidateResumeModal';
import { ColdCandidate } from './types';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Trans } from '@lingui/macro';

interface Props {
  vacancyId: number;
}

export default function ColdSearchTab({ vacancyId }: Props) {
  const { job, candidates, loading, starting, error, startSearch } = useColdSearch(vacancyId);
  const [searchHints, setSearchHints] = useState('');
  const [tab, setTab] = useState('candidates');
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

  const isRunning = job && ['pending', 'searching', 'prescoring', 'scoring'].includes(job.status);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <TabContext value={tab}>
        <TabList onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 0 }}>
          <Tab
            icon={<IconUsers size={18} />}
            iconPosition="start"
            label={<Trans>Кандидаты{candidates.length > 0 ? ` (${candidates.length})` : ''}</Trans>}
            value="candidates"
          />
          <Tab
            icon={<IconSearch size={18} />}
            iconPosition="start"
            label={<Trans>Запустить поиск</Trans>}
            value="search"
          />
        </TabList>

        {/* Вкладка кандидатов */}
        <TabPanel value="candidates" sx={{ px: 0, pt: 2 }}>
          {job && <ColdSearchProgress job={job} />}

          {candidates.length === 0 && !isRunning && (
            <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
              <Typography variant="body1" gutterBottom>
                Кандидаты ещё не найдены
              </Typography>
              <Typography variant="body2">
                Перейдите на вкладку «Запустить поиск» чтобы начать
              </Typography>
            </Box>
          )}

          {job && job.status === 'complete' && candidates.length === 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Поиск завершён, но кандидатов не найдено. Попробуйте расширить параметры поиска или изменить описание вакансии.
            </Alert>
          )}

          {candidates.map((c) => (
            <ColdCandidateCard
              key={c.id}
              candidate={c}
              onClick={() => openCandidate(c)}
            />
          ))}
        </TabPanel>

        {/* Вкладка запуска поиска */}
        <TabPanel value="search" sx={{ px: 0, pt: 2 }}>
          <Box sx={{ maxWidth: 640 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              <Trans>Холодный поиск кандидатов</Trans>
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
              placeholder={"Например: от 3 лет опыта, удалённо или Москва, обязательно React и TypeScript, до 200к, без джунов"}
              value={searchHints}
              onChange={(e) => setSearchHints(e.target.value)}
              disabled={!!isRunning}
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
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )
            )}

            {isRunning && job && (
              <Box sx={{ mb: 2 }}>
                <ColdSearchProgress job={job} />
              </Box>
            )}

            <Button
              variant="contained"
              size="large"
              startIcon={starting ? <CircularProgress size={18} color="inherit" /> : <IconSearch size={18} />}
              onClick={() => startSearch(searchHints)}
              disabled={!!isRunning || starting}
              fullWidth
            >
              {isRunning ? 'Поиск выполняется...' : job ? 'Запустить новый поиск' : 'Запустить поиск'}
            </Button>

            {job && !isRunning && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                Последний запуск: {new Date(job.updated_at).toLocaleString('ru')}
              </Typography>
            )}
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
