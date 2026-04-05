'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
  TextField,
  FormControlLabel,
  Switch,
  Grid,
  Chip,
  Slider,
  FormHelperText,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import Link from 'next/link';
import PageContainer from '@/app/components/container/PageContainer';
import { useRouter, useParams } from 'next/navigation';
import { apiFetch } from '@/utils/api';
import RegulationTestTabs from '../components/RegulationTestTabs';
import DescriptionIcon from '@mui/icons-material/Description';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LockClockIcon from '@mui/icons-material/LockClock';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import { useLingui } from '@lingui/react';
import { msg, Trans } from '@lingui/macro';

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test';

interface RegulationInfo {
  id: number;
  title: string;
  description: string | null;
}

interface RegulationTest {
  id: number;
  title: string;
  description: string | null;
  questionGenerationMode: string;
  questionsPerRegulation: number;
  maxTimePerQuestion: number;
  isActive: boolean;
  deadlineAt: string | null;
  reminderEnabled: boolean;
  reminderDaysBefore: number;
  regulations?: RegulationInfo[];
}

export default function EditTestPage() {
  const { _ } = useLingui();
  const router = useRouter();
  const params = useParams();
  const testId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questionGenerationMode, setQuestionGenerationMode] = useState<'pre_generated' | 'on_start'>('pre_generated');
  const [questionsPerRegulation, setQuestionsPerRegulation] = useState(5);
  const [maxTimePerQuestion, setMaxTimePerQuestion] = useState(120);
  const [isActive, setIsActive] = useState(true);
  const [deadlineAt, setDeadlineAt] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderDaysBefore, setReminderDaysBefore] = useState(3);
  const [regulations, setRegulations] = useState<RegulationInfo[]>([]);

  useEffect(() => {
    if (testId) loadTest();
  }, [testId]);

  const loadTest = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch(`${API_BASE}/api/regulation-tests/${testId}`);
      if (response.ok) {
        const data: RegulationTest = await response.json();
        setTitle(data.title);
        setDescription(data.description || '');
        setQuestionGenerationMode(data.questionGenerationMode as 'pre_generated' | 'on_start');
        setQuestionsPerRegulation(data.questionsPerRegulation);
        setMaxTimePerQuestion(data.maxTimePerQuestion);
        setIsActive(data.isActive);
        setDeadlineAt(data.deadlineAt || '');
        setReminderEnabled(data.reminderEnabled ?? false);
        setReminderDaysBefore(data.reminderDaysBefore ?? 3);
        setRegulations(data.regulations || []);
      } else {
        setError(_(msg`Тест не найден`));
      }
    } catch (err) {
      console.error('Error loading test:', err);
      setError(_(msg`Ошибка при загрузке теста`));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert(_(msg`Введите название теста`));
      return;
    }

    setSaving(true);
    try {
      const response = await apiFetch(`${API_BASE}/api/regulation-tests/${testId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title,
          description: description || null,
          questionGenerationMode,
          questionsPerRegulation,
          maxTimePerQuestion,
          isActive,
          deadlineAt: deadlineAt || null,
          reminderEnabled,
          reminderDaysBefore,
        }),
      });

      if (response.ok) {
        router.push('/hr/regulation-tests');
      } else {
        const errorData = await response.json();
        alert(errorData.error || _(msg`Ошибка при сохранении`));
      }
    } catch (err) {
      console.error('Error saving test:', err);
      alert(_(msg`Ошибка при сохранении теста`));
    } finally {
      setSaving(false);
    }
  };

  const totalQuestions = regulations.length * questionsPerRegulation;
  const estimatedMinutes = Math.ceil((totalQuestions * maxTimePerQuestion) / 60);

  if (loading) {
    return (
      <PageContainer title={_(msg`Редактировать тест`)} description="">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title={_(msg`Редактировать тест`)} description="">
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        <Button component={Link} href="/hr/regulation-tests" variant="outlined"><Trans>Вернуться к списку</Trans></Button>
      </PageContainer>
    );
  }

  return (
    <PageContainer title={_(msg`Редактировать тест`)} description={_(msg`Изменение настроек теста`)}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <MuiLink href="/hr" underline="hover" color="inherit"><Trans>Главная</Trans></MuiLink>
        <MuiLink href="/hr/regulation-tests" underline="hover" color="inherit"><Trans>Тесты</Trans></MuiLink>
        <Typography color="text.primary">{title || _(msg`Редактировать`)}</Typography>
      </Breadcrumbs>

      <RegulationTestTabs testId={testId} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

        {/* СЕКЦИЯ 1: Основное */}
        <Card>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6"><Trans>Основное</Trans></Typography>
              <FormControlLabel
                control={<Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />}
                label={isActive ? _(msg`Тест активен`) : _(msg`Тест неактивен`)}
                sx={{ mr: 0 }}
              />
            </Box>
            <TextField
              label={_(msg`Название теста`)}
              fullWidth
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={_(msg`Например: Тест на знание политики безопасности`)}
            />
            <TextField
              label={_(msg`Описание`)}
              fullWidth
              multiline
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={_(msg`Краткое описание теста для сотрудников (необязательно)`)}
            />
          </CardContent>
        </Card>

        {/* СЕКЦИЯ 2: Регламенты (read-only) */}
        {regulations.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}><Trans>Регламенты</Trans></Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {regulations.map((reg) => (
                  <Chip
                    key={reg.id}
                    icon={<DescriptionIcon />}
                    label={reg.title}
                    variant="outlined"
                    color="primary"
                  />
                ))}
              </Box>
              <FormHelperText sx={{ mt: 1 }}>
                <Trans>Набор регламентов задаётся при создании теста и не может быть изменён.</Trans>
              </FormHelperText>
            </CardContent>
          </Card>
        )}

        {/* СЕКЦИЯ 3: Настройки */}
        <Card>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6"><Trans>Настройки</Trans></Typography>

            <Box>
              <Typography variant="subtitle2" gutterBottom><Trans>Режим генерации вопросов</Trans></Typography>
              <ToggleButtonGroup
                value={questionGenerationMode}
                exclusive
                onChange={(_, val) => { if (val) setQuestionGenerationMode(val); }}
                fullWidth
              >
                <ToggleButton value="pre_generated" sx={{ flexDirection: 'column', py: 1.5 }}>
                  <LockClockIcon sx={{ mb: 0.5 }} />
                  <Typography variant="body2" fontWeight="bold"><Trans>Заранее</Trans></Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                    <Trans>Одинаковые вопросы для всех</Trans>
                  </Typography>
                </ToggleButton>
                <ToggleButton value="on_start" sx={{ flexDirection: 'column', py: 1.5 }}>
                  <ShuffleIcon sx={{ mb: 0.5 }} />
                  <Typography variant="body2" fontWeight="bold"><Trans>При старте</Trans></Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                    <Trans>Уникальные вопросы для каждого</Trans>
                  </Typography>
                </ToggleButton>
              </ToggleButtonGroup>
              {questionGenerationMode === 'on_start' && (
                <FormHelperText sx={{ mt: 1 }}>
                  <Trans>Вопросы генерируются при старте теста — каждый сотрудник получит уникальный набор. Защита от списывания.</Trans>
                </FormHelperText>
              )}
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography gutterBottom>
                  <Trans>Вопросов на регламент: <strong>{questionsPerRegulation}</strong></Trans>
                </Typography>
                <Slider
                  value={questionsPerRegulation}
                  onChange={(_, value) => setQuestionsPerRegulation(value as number)}
                  min={3}
                  max={20}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography gutterBottom>
                  <Trans>Время на вопрос: <strong>{maxTimePerQuestion} сек</strong></Trans>
                </Typography>
                <Slider
                  value={maxTimePerQuestion}
                  onChange={(_, value) => setMaxTimePerQuestion(value as number)}
                  min={30}
                  max={300}
                  step={10}
                  marks={[
                    { value: 30, label: '30с' },
                    { value: 60, label: '1м' },
                    { value: 120, label: '2м' },
                    { value: 180, label: '3м' },
                    { value: 300, label: '5м' },
                  ]}
                  valueLabelDisplay="auto"
                />
              </Grid>
            </Grid>

            {regulations.length > 0 && (
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip
                  icon={<DescriptionIcon />}
                  label={_(msg`Вопросов: ${totalQuestions}`)}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label={_(msg`~${estimatedMinutes} мин`)}
                  variant="outlined"
                />
              </Box>
            )}
          </CardContent>
        </Card>

        {/* СЕКЦИЯ 4: Дополнительно (Accordion) */}
        <Accordion defaultExpanded={!!deadlineAt}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6"><Trans>Дополнительные настройки</Trans></Typography>
              {deadlineAt && (
                <Chip label={_(msg`Дедлайн задан`)} size="small" color="warning" />
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label={_(msg`Дедлайн прохождения`)}
              type="datetime-local"
              fullWidth
              value={deadlineAt}
              onChange={(e) => {
                setDeadlineAt(e.target.value);
                if (!e.target.value) setReminderEnabled(false);
              }}
              InputLabelProps={{ shrink: true }}
              helperText={_(msg`Оставьте пустым для бессрочного теста. После дедлайна тест блокируется.`)}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={reminderEnabled}
                  onChange={(e) => setReminderEnabled(e.target.checked)}
                  disabled={!deadlineAt}
                />
              }
              label={_(msg`Отправлять email-напоминания`)}
            />

            {reminderEnabled && deadlineAt && (
              <TextField
                label={_(msg`Напоминание за (дней)`)}
                type="number"
                fullWidth
                value={reminderDaysBefore}
                onChange={(e) => setReminderDaysBefore(parseInt(e.target.value) || 1)}
                InputProps={{ inputProps: { min: 1, max: 30 } }}
                helperText={_(msg`За сколько дней до дедлайна отправить напоминание`)}
              />
            )}
          </AccordionDetails>
        </Accordion>

        {/* Кнопки */}
        <Card>
          <CardContent>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Trans>Изменение настроек не влияет на уже начатые тесты.</Trans>
            </Alert>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button variant="outlined" onClick={() => router.push('/hr/regulation-tests')}>
                <Trans>Отмена</Trans>
              </Button>
              <Button
                variant="contained"
                size="large"
                onClick={handleSave}
                disabled={saving || !title.trim()}
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : undefined}
              >
                {saving ? _(msg`Сохранение...`) : _(msg`Сохранить изменения`)}
              </Button>
            </Box>
          </CardContent>
        </Card>

      </Box>
    </PageContainer>
  );
}
