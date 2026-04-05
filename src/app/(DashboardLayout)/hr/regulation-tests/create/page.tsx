'use client';

import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Breadcrumbs,
  Link,
  TextField,
  FormControlLabel,
  Switch,
  Grid,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Divider,
  Slider,
  FormHelperText,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
} from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/utils/api';
import DescriptionIcon from '@mui/icons-material/Description';
import FolderIcon from '@mui/icons-material/Folder';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RefreshIcon from '@mui/icons-material/Refresh';
import LockClockIcon from '@mui/icons-material/LockClock';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import { useLingui } from '@lingui/react';
import { msg, Trans } from '@lingui/macro';


const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test';

const QuestionCard = memo(({
  question,
  index,
  maxTimePerQuestion,
  onUpdate,
  onDelete
}: {
  question: GeneratedQuestion;
  index: number;
  maxTimePerQuestion: number;
  onUpdate: (index: number, field: keyof GeneratedQuestion, value: any) => void;
  onDelete: (index: number) => void;
}) => {
  const { _ } = useLingui();

  const difficultyColor = question.difficulty === 1 ? 'success' : question.difficulty === 3 ? 'error' : 'warning';
  const difficultyLabel = question.difficulty === 1 ? _(msg`Легкий`) : question.difficulty === 3 ? _(msg`Сложный`) : _(msg`Средний`);

  return (
    <Card sx={{ mb: 2, border: '1px solid', borderColor: 'divider' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip label={`${index + 1}`} size="small" color="primary" sx={{ minWidth: 32 }} />
            <Chip label={question.regulationTitle} size="small" variant="outlined" color="secondary" />
            <Chip label={difficultyLabel} size="small" variant="outlined" color={difficultyColor} />
          </Box>
          <IconButton size="small" color="error" onClick={() => onDelete(index)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>

        <TextField
          fullWidth
          multiline
          rows={2}
          label={_(msg`Вопрос`)}
          value={question.text}
          onChange={(e) => onUpdate(index, 'text', e.target.value)}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          multiline
          rows={2}
          label={_(msg`Ожидаемый ответ (для AI проверки)`)}
          value={question.expectedAnswer}
          onChange={(e) => onUpdate(index, 'expectedAnswer', e.target.value)}
        />
      </CardContent>
    </Card>
  );
});

QuestionCard.displayName = 'QuestionCard';

interface RegulationFolder {
  id: number;
  name: string;
  description: string | null;
  regulationsCount: number;
}

interface Regulation {
  id: number;
  title: string;
  description: string | null;
  version: string;
  folderId: number | null;
  folderName: string | null;
}

interface GeneratedQuestion {
  text: string;
  type: 'text' | 'multiple_choice';
  expectedAnswer: string;
  difficulty: number;
  maxTime?: number;
  regulationId: number;
  regulationTitle: string;
}

export default function CreateTestPage() {
  const { _ } = useLingui();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Basic info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Generation mode
  const [questionGenerationMode, setQuestionGenerationMode] = useState<'pre_generated' | 'on_start'>('pre_generated');
  const [questionsPerRegulation, setQuestionsPerRegulation] = useState(5);
  const [maxTimePerQuestion, setMaxTimePerQuestion] = useState(120);

  // Regulations
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [folders, setFolders] = useState<RegulationFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [selectedRegulations, setSelectedRegulations] = useState<number[]>([]);
  const [preselectedFromUrl, setPreselectedFromUrl] = useState(false);

  // Questions
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);

  // Deadline / reminders
  const [deadlineAt, setDeadlineAt] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderDaysBefore, setReminderDaysBefore] = useState(3);

  // Submission
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadRegulations();
  }, []);

  useEffect(() => {
    const regulationIdParam = searchParams.get('regulationId');
    if (regulationIdParam && regulations.length > 0 && !preselectedFromUrl) {
      const id = parseInt(regulationIdParam);
      if (!isNaN(id) && regulations.some(r => r.id === id)) {
        setSelectedRegulations([id]);
        setPreselectedFromUrl(true);
      }
    }
  }, [searchParams, regulations, preselectedFromUrl]);

  const loadRegulations = async () => {
    try {
      const regulationsResponse = await apiFetch(`${API_BASE}/api/regulations`);
      const regulationsData = await regulationsResponse.json();
      setRegulations(Array.isArray(regulationsData) ? regulationsData : []);

      try {
        const foldersResponse = await apiFetch(`${API_BASE}/api/regulations/folders`);
        const foldersData = await foldersResponse.json();
        setFolders(Array.isArray(foldersData) ? foldersData : []);
      } catch {
        setFolders([]);
      }
    } catch {
      setRegulations([]);
      setFolders([]);
    }
  };

  const handleToggleRegulation = (id: number) => {
    setSelectedRegulations(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
    // При изменении регламентов сбрасываем сгенерированные вопросы
    setGeneratedQuestions([]);
  };

  const handlePreviewQuestions = async () => {
    if (selectedRegulations.length === 0) return;

    setGeneratingQuestions(true);
    try {
      const response = await apiFetch(`${API_BASE}/api/regulation-tests/preview-questions`, {
        method: 'POST',
        body: JSON.stringify({
          regulationIds: selectedRegulations,
          questionsPerRegulation,
          maxTimePerQuestion,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedQuestions(data.questions || []);
      } else {
        const error = await response.json();
        alert(error.error || _(msg`Ошибка при генерации вопросов`));
      }
    } catch {
      alert(_(msg`Ошибка при генерации вопросов`));
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const handleUpdateQuestion = useCallback((index: number, field: keyof GeneratedQuestion, value: any) => {
    setGeneratedQuestions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, []);

  const handleDeleteQuestion = useCallback((index: number) => {
    setGeneratedQuestions(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = async () => {
    if (!title.trim() || selectedRegulations.length === 0) return;
    if (questionGenerationMode === 'pre_generated' && generatedQuestions.length === 0) return;

    setSubmitting(true);
    try {
      const body: any = {
        title,
        description: description || null,
        questionGenerationMode,
        questionsPerRegulation,
        maxTimePerQuestion,
        isActive: true,
        regulationIds: selectedRegulations,
        deadlineAt: deadlineAt || null,
        reminderEnabled,
        reminderDaysBefore,
      };

      if (questionGenerationMode === 'pre_generated' && generatedQuestions.length > 0) {
        body.questions = generatedQuestions;
      }

      const response = await apiFetch(`${API_BASE}/api/regulation-tests`, {
        method: 'POST',
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/hr/regulation-tests/${data.id}/invitations?new=1`);
      } else {
        const error = await response.json();
        alert(error.error || _(msg`Ошибка при создании теста`));
      }
    } catch {
      alert(_(msg`Ошибка при создании теста`));
    } finally {
      setSubmitting(false);
    }
  };

  const displayedRegulations = useMemo(() =>
    selectedFolderId
      ? regulations.filter(r => r.folderId === selectedFolderId)
      : regulations.filter(r => r.folderId === null),
    [regulations, selectedFolderId]
  );

  const totalQuestions = selectedRegulations.length * questionsPerRegulation;
  const estimatedMinutes = Math.ceil((totalQuestions * maxTimePerQuestion) / 60);

  const isReadyToSubmit =
    title.trim() !== '' &&
    selectedRegulations.length > 0 &&
    (questionGenerationMode === 'on_start' || generatedQuestions.length > 0);

  const questionsNeedGeneration =
    questionGenerationMode === 'pre_generated' &&
    selectedRegulations.length > 0 &&
    generatedQuestions.length === 0;

  return (
    <PageContainer title={_(msg`Создать тест`)} description="Конструктор теста на знание регламентов">
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link href="/hr" underline="hover" color="inherit"><Trans>Главная</Trans></Link>
        <Link href="/hr/regulation-tests" underline="hover" color="inherit"><Trans>Тесты</Trans></Link>
        <Typography color="text.primary"><Trans>Создать тест</Trans></Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

        {/* СЕКЦИЯ 1: Основное */}
        <Card>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6"><Trans>Основное</Trans></Typography>
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

        {/* СЕКЦИЯ 2: Регламенты */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}><Trans>Регламенты</Trans></Typography>

            {preselectedFromUrl && selectedRegulations.length > 0 && (
              <Alert severity="success" sx={{ mb: 2 }}>
                <Trans>Регламент "{regulations.find(r => r.id === selectedRegulations[0])?.title}" был автоматически выбран.</Trans>
              </Alert>
            )}

            {selectedFolderId && (
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={() => setSelectedFolderId(null)}
                  size="small"
                >
                  <Trans>Назад</Trans>
                </Button>
                <Typography variant="body2" color="text.secondary">
                  / {folders.find(f => f.id === selectedFolderId)?.name}
                </Typography>
              </Box>
            )}

            {regulations.length === 0 ? (
              <Alert severity="warning">
                <Trans>Регламенты не созданы. Сначала</Trans>{' '}
                <Link href="/hr/regulations"><Trans>создайте регламенты</Trans></Link>.
              </Alert>
            ) : (
              <List disablePadding>
                {!selectedFolderId && Array.isArray(folders) && folders.map((folder) => (
                  <ListItem
                    key={`folder-${folder.id}`}
                    button
                    onClick={() => setSelectedFolderId(folder.id)}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <ListItemIcon>
                      <FolderIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={folder.name}
                      secondary={_(msg`Регламентов`) + `: ${folder.regulationsCount}`}
                    />
                  </ListItem>
                ))}

                {displayedRegulations.map((regulation) => (
                  <ListItem
                    key={regulation.id}
                    button
                    onClick={() => handleToggleRegulation(regulation.id)}
                    sx={{
                      border: '1px solid',
                      borderColor: selectedRegulations.includes(regulation.id) ? 'primary.main' : 'divider',
                      borderRadius: 1,
                      mb: 1,
                      bgcolor: selectedRegulations.includes(regulation.id) ? 'primary.light' : 'background.paper',
                    }}
                  >
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={selectedRegulations.includes(regulation.id)}
                        tabIndex={-1}
                        disableRipple
                      />
                    </ListItemIcon>
                    <ListItemIcon>
                      <DescriptionIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={regulation.title}
                      secondary={
                        <Box component="span" sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                          <Chip label={`v${regulation.version}`} size="small" />
                          {regulation.folderName && (
                            <Chip label={regulation.folderName} size="small" variant="outlined" />
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}

                {selectedFolderId && displayedRegulations.length === 0 && (
                  <Alert severity="info"><Trans>В этой папке пока нет регламентов</Trans></Alert>
                )}
              </List>
            )}

            {selectedRegulations.length > 0 && (
              <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {selectedRegulations.map(id => {
                  const reg = regulations.find(r => r.id === id);
                  return reg ? (
                    <Chip
                      key={id}
                      label={reg.title}
                      onDelete={() => handleToggleRegulation(id)}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  ) : null;
                })}
              </Box>
            )}
          </CardContent>
        </Card>

        {/* СЕКЦИЯ 3: Настройки генерации */}
        <Card>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6"><Trans>Настройки</Trans></Typography>

            <Box>
              <Typography variant="subtitle2" gutterBottom><Trans>Режим генерации вопросов</Trans></Typography>
              <ToggleButtonGroup
                value={questionGenerationMode}
                exclusive
                onChange={(_, val) => {
                  if (val) {
                    setQuestionGenerationMode(val);
                    setGeneratedQuestions([]);
                  }
                }}
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
                  <Trans>Вопросы генерируются при старте теста — каждый сотрудник получит уникальный набор. Защита от списывания. ИИ генерирует ~30–120 сек при старте.</Trans>
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
                  onChange={(_, value) => {
                    setQuestionsPerRegulation(value as number);
                    setGeneratedQuestions([]);
                  }}
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

            {selectedRegulations.length > 0 && (
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

        {/* СЕКЦИЯ 4: Вопросы (только для pre_generated) */}
        {questionGenerationMode === 'pre_generated' && selectedRegulations.length > 0 && (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6"><Trans>Вопросы</Trans></Typography>
                {generatedQuestions.length > 0 && (
                  <Button
                    startIcon={generatingQuestions ? <CircularProgress size={16} /> : <RefreshIcon />}
                    onClick={handlePreviewQuestions}
                    disabled={generatingQuestions}
                    size="small"
                    variant="outlined"
                  >
                    <Trans>Перегенерировать</Trans>
                  </Button>
                )}
              </Box>

              {generatedQuestions.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <AutoAwesomeIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography color="text.secondary" sx={{ mb: 3 }}>
                    <Trans>Система сгенерирует {totalQuestions} вопросов на основе выбранных регламентов с помощью AI. Вы сможете отредактировать их перед сохранением.</Trans>
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={generatingQuestions ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
                    onClick={handlePreviewQuestions}
                    disabled={generatingQuestions}
                  >
                    {generatingQuestions ? _(msg`Генерация...`) : _(msg`Сгенерировать вопросы`)}
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    <Trans>Сгенерировано {generatedQuestions.length} вопросов. Вы можете отредактировать их ниже.</Trans>
                  </Alert>
                  {generatedQuestions.map((question, index) => (
                    <QuestionCard
                      key={index}
                      question={question}
                      index={index}
                      maxTimePerQuestion={maxTimePerQuestion}
                      onUpdate={handleUpdateQuestion}
                      onDelete={handleDeleteQuestion}
                    />
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {/* СЕКЦИЯ 4 для on_start: инфо */}
        {questionGenerationMode === 'on_start' && (
          <Alert severity="info" icon={<ShuffleIcon />}>
            <Typography variant="subtitle2" gutterBottom><Trans>Динамическая генерация</Trans></Typography>
            <Typography variant="body2">
              <Trans>Вопросы будут генерироваться в момент старта теста каждым сотрудником индивидуально. Это предотвращает списывание, но требует работающего AI при прохождении теста.</Trans>
            </Typography>
          </Alert>
        )}

        {/* СЕКЦИЯ 5: Дополнительно (Accordion) */}
        <Accordion>
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
            {questionsNeedGeneration && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Trans>Для режима "Заранее" необходимо сначала сгенерировать вопросы.</Trans>
              </Alert>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button variant="outlined" onClick={() => router.push('/hr/regulation-tests')}>
                <Trans>Отмена</Trans>
              </Button>

              <Button
                variant="contained"
                size="large"
                onClick={handleSubmit}
                disabled={submitting || !isReadyToSubmit}
                startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : undefined}
              >
                {submitting ? _(msg`Создание...`) : _(msg`Создать тест`)}
              </Button>
            </Box>
          </CardContent>
        </Card>

      </Box>
    </PageContainer>
  );
}
