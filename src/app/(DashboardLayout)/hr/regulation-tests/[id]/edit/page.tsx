'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Slider,
  FormHelperText,
  Alert,
  CircularProgress,
} from '@mui/material';
import Link from 'next/link';
import PageContainer from '@/app/components/container/PageContainer';
import { useRouter, useParams } from 'next/navigation';
import { apiFetch } from '@/utils/api';
import RegulationTestTabs from '../components/RegulationTestTabs';
import { useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';


const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test';

interface RegulationTest {
  id: number;
  title: string;
  description: string | null;
  questionGenerationMode: string;
  questionsPerRegulation: number;
  maxTimePerQuestion: number;
  isActive: boolean;
}

export default function EditTestPage() {
  const { _ } = useLingui();

  const router = useRouter();
  const params = useParams();
  const testId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questionGenerationMode, setQuestionGenerationMode] = useState<'pre_generated' | 'on_start'>('pre_generated');
  const [questionsPerRegulation, setQuestionsPerRegulation] = useState(5);
  const [maxTimePerQuestion, setMaxTimePerQuestion] = useState(120);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (testId) {
      loadTest();
    }
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
      } else {
        setError(_(msg`Тест не найден`));
      }
    } catch (error) {
      console.error('Error loading test:', error);
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
        }),
      });

      if (response.ok) {
        router.push('/hr/regulation-tests');
      } else {
        const errorData = await response.json();
        alert(errorData.error || _(msg`Ошибка при сохранении`));
      }
    } catch (error) {
      console.error('Error saving test:', error);
      alert(_(msg`Ошибка при сохранении теста`));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageContainer title={_(msg`Редактировать тест`)} description="Загрузка...">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title={_(msg`Редактировать тест`)} description="Ошибка">
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Link href="/hr/regulation-tests" passHref legacyBehavior>
          <Button component="a" variant="outlined"><Trans>Вернуться к списку</Trans></Button>
        </Link>
      </PageContainer>
    );
  }

  return (
    <PageContainer title={_(msg`Редактировать тест`)} description="Изменение настроек теста">
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <MuiLink href="/hr" underline="hover" color="inherit">
          Главная
        </MuiLink>
        <MuiLink href="/hr/regulation-tests" underline="hover" color="inherit">
          Тесты
        </MuiLink>
        <Typography color="text.primary"><Trans>Редактировать</Trans></Typography>
      </Breadcrumbs>

      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}><Trans>Редактировать тест</Trans></Typography>

      {/* Tabs navigation */}
      <RegulationTestTabs testId={testId} />

      <Card sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={_(msg`Краткое описание теста для сотрудников`)}
          />

          <FormControl fullWidth>
            <InputLabel><Trans>Режим генерации вопросов</Trans></InputLabel>
            <Select
              value={questionGenerationMode}
              label={_(msg`Режим генерации вопросов`)}
              onChange={(e) => setQuestionGenerationMode(e.target.value as 'pre_generated' | 'on_start')}
            >
              <MenuItem value="pre_generated"><Trans>Заранее (вопросы генерируются при создании теста)</Trans></MenuItem>
              <MenuItem value="on_start"><Trans>При старте (вопросы генерируются для каждого сотрудника индивидуально)</Trans></MenuItem>
            </Select>
            <FormHelperText>
              {questionGenerationMode === 'pre_generated'
                ? 'Все сотрудники получат одинаковые вопросы. Быстрее, но предсказуемее.'
                : 'Каждый сотрудник получит уникальный набор вопросов. Медленнее, но надёжнее.'}
            </FormHelperText>
          </FormControl>

          <Box>
            <Typography gutterBottom>
              Вопросов на каждый регламент: {questionsPerRegulation}
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
          </Box>

          <Box>
            <Typography gutterBottom>
              Время на один вопрос: {maxTimePerQuestion} секунд
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
            <FormHelperText>
              Каждый вопрос должен быть отвечен в течение указанного времени
            </FormHelperText>
          </Box>

          <FormControlLabel
            control={<Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />}
            label={_(msg`Тест активен`)}
          />

          <Alert severity="info">
            <Typography variant="body2">
              <strong>Примечание:</strong> Изменение настроек не влияет на уже начатые тесты. Список регламентов можно изменить только при создании теста.
            </Typography>
          </Alert>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Link href="/hr/regulation-tests" passHref legacyBehavior>
            <Button component="a" variant="outlined"><Trans>Отмена</Trans></Button>
          </Link>

          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || !title.trim()}
          >
            {saving ? 'Сохранение...' : 'Сохранить изменения'}
          </Button>
        </Box>
      </Card>
    </PageContainer>
  );
}




