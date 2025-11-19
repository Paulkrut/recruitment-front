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
  Stepper,
  Step,
  StepLabel,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  Paper,
  Divider,
  Slider,
  FormHelperText,
  IconButton,
  Dialog,
} from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/utils/api';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FolderIcon from '@mui/icons-material/Folder';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import { useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';


const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test';

const steps = [_(msg`Основные настройки`), _(msg`Выбор регламентов`), _(msg`Генерация вопросов`)];

// Мемоизированный компонент карточки вопроса для предотвращения ненужных перерендеров
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
  return (
    <Card sx={{ mb: 2, border: '1px solid', borderColor: 'divider' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Chip 
            label={`Вопрос ${index + 1}`} 
            size="small" 
            color="primary" 
            sx={{ mr: 1 }}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip 
              label={`Сложность: ${question.difficulty}`} 
              size="small" 
              variant="outlined"
            />
            <Chip 
              label={question.regulationTitle} 
              size="small" 
              variant="outlined"
              color="secondary"
            />
            <IconButton 
              size="small" 
              color="error"
              onClick={() => onDelete(index)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
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
          rows={3}
          label={_(msg`Ожидаемый ответ (для AI проверки)`)}
          value={question.expectedAnswer}
          onChange={(e) => onUpdate(index, 'expectedAnswer', e.target.value)}
          sx={{ mb: 2 }}
        />

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              type="number"
              label={_(msg`Время на ответ (сек)`)}
              value={question.maxTime || maxTimePerQuestion}
              onChange={(e) => onUpdate(index, 'maxTime', parseInt(e.target.value))}
              inputProps={{ min: 30, max: 600 }}
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel><Trans>Сложность</Trans></InputLabel>
              <Select
                value={question.difficulty}
                label={_(msg`Сложность`)}
                onChange={(e) => onUpdate(index, 'difficulty', e.target.value as number)}
              >
                <MenuItem value={1}><Trans>Легкий</Trans></MenuItem>
                <MenuItem value={2}><Trans>Средний</Trans></MenuItem>
                <MenuItem value={3}><Trans>Сложный</Trans></MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
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

interface Invitation {
  type: 'named' | 'general';
  employeeId?: number;
  email?: string;
  expiresInDays?: number;
}

interface GeneratedQuestion {
  id?: number;
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
  const [activeStep, setActiveStep] = useState(0);
  const [testId, setTestId] = useState<number | null>(null);

  // Step 1: Basic settings
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questionGenerationMode, setQuestionGenerationMode] = useState<'pre_generated' | 'on_start'>('pre_generated');
  const [questionsPerRegulation, setQuestionsPerRegulation] = useState(5);
  const [maxTimePerQuestion, setMaxTimePerQuestion] = useState(120); // Время на вопрос в секундах
  const [isActive, setIsActive] = useState(true);

  // Step 2: Select regulations
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [folders, setFolders] = useState<RegulationFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [selectedRegulations, setSelectedRegulations] = useState<number[]>([]);
  const [preselectedFromUrl, setPreselectedFromUrl] = useState(false);

  // Step 3: Questions (for pre_generated mode)
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [questionsGenerated, setQuestionsGenerated] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);

  // Success dialog
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  useEffect(() => {
    loadRegulations();
  }, []);

  useEffect(() => {
    // Если передан regulationId в URL и регламенты загружены - предвыбираем
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
      // Загружаем регламенты
      const regulationsResponse = await apiFetch(`${API_BASE}/api/regulations`);
      const regulationsData = await regulationsResponse.json();
      setRegulations(Array.isArray(regulationsData) ? regulationsData : []);

      // Загружаем папки
      try {
        const foldersResponse = await apiFetch(`${API_BASE}/api/regulations/folders`);
        const foldersData = await foldersResponse.json();
        setFolders(Array.isArray(foldersData) ? foldersData : []);
      } catch (folderError) {
        console.error('Error loading folders:', folderError);
        setFolders([]); // Устанавливаем пустой массив если папки не загрузились
      }
    } catch (error) {
      console.error('Error loading regulations:', error);
      setRegulations([]);
      setFolders([]);
    }
  };

  const handleNext = async () => {
    // После шага 1 (выбор регламентов) создаём тест
    if (activeStep === 1 && !testId) {
      await createTest();
    }
    setActiveStep((prev) => prev + 1);
  };

  const createTest = async () => {
    try {
      const response = await apiFetch(`${API_BASE}/api/regulation-tests`, {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          questionGenerationMode,
          questionsPerRegulation,
          maxTimePerQuestion,
          isActive,
          regulationIds: selectedRegulations,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTestId(data.id);
      }
    } catch (error) {
      console.error('Error creating test:', error);
      alert(_(msg`Ошибка при создании теста`));
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleToggleRegulation = (id: number) => {
    setSelectedRegulations((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const handleGenerateQuestions = async () => {
    if (!testId) return;

    setGeneratingQuestions(true);
    try {
      const response = await apiFetch(`${API_BASE}/api/regulation-tests/${testId}/generate-questions`, {
        method: 'POST',
      });

      if (response.ok) {
        // Загружаем сгенерированные вопросы
        const questionsResponse = await apiFetch(`${API_BASE}/api/regulation-tests/${testId}/questions`);
        if (questionsResponse.ok) {
          const questions = await questionsResponse.json();
          setGeneratedQuestions(questions);
        setQuestionsGenerated(true);
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Ошибка при генерации вопросов');
      }
    } catch (error) {
      console.error('Error generating questions:', error);
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

  const handleFinishTestCreation = () => {
    // Показываем диалог успешного создания
    setShowSuccessDialog(true);
  };

  const handleGenerateGeneralLink = async () => {
    if (!testId) return;

    try {
      const response = await apiFetch(`${API_BASE}/api/regulation-tests/${testId}/invitations`, {
          method: 'POST',
          body: JSON.stringify({
          invitations: [{
            type: 'general',
            expiresInDays: 30,
          }],
          }),
        });

      if (response.ok) {
        router.push(`/hr/regulation-tests/${testId}/invitations`);
      }
    } catch (error) {
      console.error('Error creating general invitation:', error);
      alert(_(msg`Ошибка при создании общей ссылки`));
    }
  };

  const handleGoToInvitations = () => {
    if (!testId) return;
    router.push(`/hr/regulation-tests/${testId}/invitations`);
  };

  // Вычисляем список регламентов для отображения (с учётом выбранной папки)
  const displayedRegulations = selectedFolderId
    ? regulations.filter(r => r.folderId === selectedFolderId)
    : regulations.filter(r => r.folderId === null); // Показываем регламенты без папки в корне

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0:
        return title.trim() !== '';
      case 1:
        return selectedRegulations.length > 0;
      case 2:
        return questionGenerationMode === 'on_start' || questionsGenerated;
      default:
        return false;
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
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
              <Typography gutterBottom>Время на один вопрос: {maxTimePerQuestion} секунд</Typography>
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
              <FormHelperText>Время отведенное на один вопрос. За это время надо прочитать вопрос и дать на него ответ.</FormHelperText>
            </Box>

            <FormControlLabel
              control={<Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />}
              label={_(msg`Тест активен`)}
            />
          </Box>
        );

      case 1:
        return (
          <Box>
            {preselectedFromUrl && selectedRegulations.length > 0 && (
              <Alert severity="success" sx={{ mb: 2 }}>
                ✅ Регламент "{regulations.find(r => r.id === selectedRegulations[0])?.title}" был автоматически выбран. 
                Вы можете добавить дополнительные регламенты ниже.
              </Alert>
            )}
            
            <Alert severity="info" sx={{ mb: 2 }}>
              Выберите регламенты, по которым будет проводиться тестирование. Будет создано{' '}
              <strong>{questionsPerRegulation} вопросов</strong> на каждый регламент.
            </Alert>

            {/* Breadcrumbs для навигации */}
            {selectedFolderId && (
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={() => setSelectedFolderId(null)}
                  size="small"
                >
                  Назад к корню
                </Button>
                <Typography variant="body2" color="text.secondary">
                  / {folders.find(f => f.id === selectedFolderId)?.name}
                </Typography>
              </Box>
            )}

            {regulations.length === 0 ? (
              <Alert severity="warning">
                Регламенты не созданы. Сначала{' '}
                <Link href="/hr/regulations">создайте регламенты</Link>.
              </Alert>
            ) : (
              <List>
                {/* Показываем папки в корне */}
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
                      bgcolor: 'background.paper',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemIcon>
                      <FolderIcon color="primary" sx={{ fontSize: 40 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="h6">
                          📁 {folder.name}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          {folder.description && (
                            <Typography variant="caption" display="block">
                              {folder.description}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary">
                            Регламентов: {folder.regulationsCount}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}

                {/* Показываем регламенты */}
                {displayedRegulations.map((regulation) => (
                  <ListItem
                    key={regulation.id}
                    button
                    onClick={() => handleToggleRegulation(regulation.id)}
                    sx={{
                      border: '1px solid',
                      borderColor: selectedRegulations.includes(regulation.id)
                        ? 'primary.main'
                        : 'divider',
                      borderRadius: 1,
                      mb: 1,
                      bgcolor: selectedRegulations.includes(regulation.id)
                        ? 'primary.light'
                        : 'background.paper',
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
                        <Box>
                          {regulation.description && (
                            <Typography variant="caption" display="block">
                              {regulation.description}
                            </Typography>
                          )}
                          <Box sx={{ mt: 0.5 }}>
                            <Chip label={`v${regulation.version}`} size="small" sx={{ mr: 1 }} />
                            {regulation.folderName && (
                              <Chip label={regulation.folderName} size="small" variant="outlined" />
                            )}
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}

                {/* Сообщение если папка пустая */}
                {selectedFolderId && displayedRegulations.length === 0 && (
                  <Alert severity="info"><Trans>В этой папке пока нет регламентов</Trans></Alert>
                )}
              </List>
            )}

            {selectedRegulations.length > 0 && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Выбрано регламентов: <strong>{selectedRegulations.length}</strong>
                <br />
                Всего вопросов: <strong>{selectedRegulations.length * questionsPerRegulation}</strong>
              </Alert>
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            {/* Выбор режима генерации */}
            <FormControl fullWidth sx={{ mb: 3 }}>
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

            {questionGenerationMode === 'pre_generated' ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                {!questionsGenerated ? (
                  <>
                    <Typography variant="h6" gutterBottom><Trans>Генерация вопросов</Trans></Typography>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                      Система создаст {selectedRegulations.length * questionsPerRegulation} вопросов на основе
                      выбранных регламентов с помощью AI.
                    </Typography>

                    <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
                      <Typography variant="subtitle2" gutterBottom><Trans>Что будет сгенерировано:</Trans></Typography>
                      <ul style={{ margin: 0, paddingLeft: 20 }}>
                        <li>Текстовые вопросы по содержанию регламентов</li>
                        <li>Вопросы с вариантами ответов</li>
                        <li>Эталонные ответы для проверки AI</li>
                        <li>Распределение по уровням сложности</li>
                      </ul>
                    </Alert>

                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleGenerateQuestions}
                      disabled={generatingQuestions}
                    >
                      {generatingQuestions ? 'Генерация...' : 'Сгенерировать вопросы'}
                    </Button>
                  </>
                ) : (
                  <Box>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main', mb: 1 }} />
                    <Typography variant="h6" gutterBottom><Trans>Вопросы успешно сгенерированы!</Trans></Typography>
                    <Typography color="text.secondary">
                        Создано {generatedQuestions.length} вопросов. Вы можете отредактировать их ниже.
                    </Typography>
                    </Box>

                    {/* Список вопросов с редактированием */}
                    <Box>
                      {generatedQuestions.map((question, index) => (
                        <QuestionCard
                          key={question.id || index}
                          question={question}
                          index={index}
                          maxTimePerQuestion={maxTimePerQuestion}
                          onUpdate={handleUpdateQuestion}
                          onDelete={handleDeleteQuestion}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            ) : (
              <Alert severity="info">
                <Typography variant="subtitle2" gutterBottom><Trans>Динамическая генерация вопросов</Trans></Typography>
                <Typography variant="body2"><Trans>Вопросы будут автоматически генерироваться при старте теста для каждого сотрудника
                  индивидуально. Это обеспечит уникальность заданий и предотвратит списывание.</Trans></Typography>
              </Alert>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <PageContainer title={_(msg`Создать тест`)} description="Конструктор теста на знание регламентов">
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link href="/hr" underline="hover" color="inherit">
          Главная
        </Link>
        <Link href="/hr/regulation-tests" underline="hover" color="inherit">
          Тесты
        </Link>
        <Typography color="text.primary"><Trans>Создать тест</Trans></Typography>
      </Breadcrumbs>

      <Card sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ minHeight: 400 }}>{renderStepContent(activeStep)}</Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={handleBack} disabled={activeStep === 0}><Trans>Назад</Trans></Button>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" onClick={() => router.push('/hr/regulation-tests')}>
              Отмена
            </Button>

            {activeStep === steps.length - 1 ? (
              <Button variant="contained" onClick={handleFinishTestCreation} disabled={!isStepValid(activeStep)}><Trans>Завершить создание</Trans></Button>
            ) : (
              <Button variant="contained" onClick={handleNext} disabled={!isStepValid(activeStep)}><Trans>Далее</Trans></Button>
            )}
          </Box>
        </Box>
      </Card>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onClose={() => setShowSuccessDialog(false)} maxWidth="sm" fullWidth>
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom><Trans>Тест успешно создан!</Trans></Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}><Trans>Что вы хотите сделать дальше?</Trans></Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleGenerateGeneralLink}
              sx={{ py: 2 }}
            >
              🔗 Сгенерировать общую ссылку
              <Typography variant="caption" display="block" sx={{ mt: 0.5, opacity: 0.8 }}><Trans>Для самостоятельной регистрации сотрудников</Trans></Typography>
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={handleGoToInvitations}
              sx={{ py: 2 }}
            >
              ✉️ Отправить приглашения конкретным сотрудникам
              <Typography variant="caption" display="block" sx={{ mt: 0.5, opacity: 0.8 }}><Trans>Создать именные приглашения по email</Trans></Typography>
            </Button>

            <Divider sx={{ my: 1 }} />

            <Button
              variant="text"
              onClick={() => router.push('/hr/regulation-tests')}
            >
              Вернуться к списку тестов
            </Button>
          </Box>
        </Box>
      </Dialog>
    </PageContainer>
  );
}

