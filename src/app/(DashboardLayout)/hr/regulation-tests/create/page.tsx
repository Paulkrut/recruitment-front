'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
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
} from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/utils/api';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test';

const steps = ['Основные настройки', 'Выбор регламентов', 'Генерация вопросов', 'Создание приглашений'];

interface Regulation {
  id: number;
  title: string;
  description: string | null;
  version: string;
  folderName: string | null;
}

interface Invitation {
  type: 'named' | 'general';
  employeeId?: number;
  email?: string;
  expiresInDays?: number;
}

export default function CreateTestPage() {
  const router = useRouter();
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
  const [selectedRegulations, setSelectedRegulations] = useState<number[]>([]);

  // Step 3: Questions (for pre_generated mode)
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [questionsGenerated, setQuestionsGenerated] = useState(false);

  // Step 4: Invitations
  const [invitationType, setInvitationType] = useState<'named' | 'general'>('named');
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [invitationEmail, setInvitationEmail] = useState('');

  useEffect(() => {
    loadRegulations();
  }, []);

  const loadRegulations = async () => {
    try {
      const response = await apiFetch(`${API_BASE}/api/regulations`);
      const data = await response.json();
      setRegulations(data);
    } catch (error) {
      console.error('Error loading regulations:', error);
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
      alert('Ошибка при создании теста');
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
        setQuestionsGenerated(true);
      } else {
        const error = await response.json();
        alert(error.error || 'Ошибка при генерации вопросов');
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      alert('Ошибка при генерации вопросов');
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const handleAddInvitation = () => {
    if (!invitationEmail) return;

    setInvitations([
      ...invitations,
      {
        type: invitationType,
        email: invitationEmail,
        expiresInDays: 30,
      },
    ]);
    setInvitationEmail('');
  };

  const handleCreateTest = async () => {
    if (!testId) {
      alert('Тест не создан');
      return;
    }

    // Если есть приглашения, создаём их
    if (invitations.length > 0) {
      try {
        await apiFetch(`${API_BASE}/api/regulation-tests/${testId}/invitations`, {
          method: 'POST',
          body: JSON.stringify({
            invitations: invitations.map((inv) => ({
              type: inv.type,
              email: inv.email,
              expiresInDays: inv.expiresInDays || 30,
            })),
          }),
        });
      } catch (error) {
        console.error('Error creating invitations:', error);
      }
    }

    // Переходим к списку тестов или к странице теста
    router.push(`/hr/regulation-tests`);
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0:
        return title.trim() !== '';
      case 1:
        return selectedRegulations.length > 0;
      case 2:
        return questionGenerationMode === 'on_start' || questionsGenerated;
      case 3:
        return true; // Invitations are optional
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
              label="Название теста"
              fullWidth
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Тест на знание политики безопасности"
            />

            <TextField
              label="Описание"
              fullWidth
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Краткое описание теста для сотрудников"
            />

            <FormControl fullWidth>
              <InputLabel>Режим генерации вопросов</InputLabel>
              <Select
                value={questionGenerationMode}
                label="Режим генерации вопросов"
                onChange={(e) => setQuestionGenerationMode(e.target.value as 'pre_generated' | 'on_start')}
              >
                <MenuItem value="pre_generated">
                  Заранее (вопросы генерируются при создании теста)
                </MenuItem>
                <MenuItem value="on_start">
                  При старте (вопросы генерируются для каждого сотрудника индивидуально)
                </MenuItem>
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
              <FormHelperText>Каждый вопрос должен быть отвечен в течение указанного времени</FormHelperText>
            </Box>

            <FormControlLabel
              control={<Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />}
              label="Тест активен"
            />
          </Box>
        );

      case 1:
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              Выберите регламенты, по которым будет проводиться тестирование. Будет создано{' '}
              <strong>{questionsPerRegulation} вопросов</strong> на каждый регламент.
            </Alert>

            {regulations.length === 0 ? (
              <Alert severity="warning">
                Регламенты не созданы. Сначала{' '}
                <Link href="/hr/regulations">создайте регламенты</Link>.
              </Alert>
            ) : (
              <List>
                {regulations.map((regulation) => (
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
            {questionGenerationMode === 'pre_generated' ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                {!questionsGenerated ? (
                  <>
                    <Typography variant="h6" gutterBottom>
                      Генерация вопросов
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                      Система создаст {selectedRegulations.length * questionsPerRegulation} вопросов на основе
                      выбранных регламентов с помощью AI.
                    </Typography>

                    <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Что будет сгенерировано:
                      </Typography>
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
                    <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Вопросы успешно сгенерированы!
                    </Typography>
                    <Typography color="text.secondary">
                      Создано {selectedRegulations.length * questionsPerRegulation} вопросов
                    </Typography>
                  </Box>
                )}
              </Box>
            ) : (
              <Alert severity="info">
                <Typography variant="subtitle2" gutterBottom>
                  Динамическая генерация вопросов
                </Typography>
                <Typography variant="body2">
                  Вопросы будут автоматически генерироваться при старте теста для каждого сотрудника
                  индивидуально. Это обеспечит уникальность заданий и предотвратит списывание.
                </Typography>
              </Alert>
            )}
          </Box>
        );

      case 3:
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Создайте приглашения для сотрудников или сгенерируйте общую ссылку для самостоятельной
              регистрации.
            </Alert>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Тип приглашения</InputLabel>
              <Select
                value={invitationType}
                label="Тип приглашения"
                onChange={(e) => setInvitationType(e.target.value as 'named' | 'general')}
              >
                <MenuItem value="named">Именное (для конкретного сотрудника)</MenuItem>
                <MenuItem value="general">Общее (для самостоятельной регистрации)</MenuItem>
              </Select>
            </FormControl>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={9}>
                <TextField
                  fullWidth
                  label="Email сотрудника"
                  value={invitationEmail}
                  onChange={(e) => setInvitationEmail(e.target.value)}
                  placeholder="employee@company.com"
                />
              </Grid>
              <Grid item xs={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleAddInvitation}
                  sx={{ height: '56px' }}
                >
                  Добавить
                </Button>
              </Grid>
            </Grid>

            {invitations.length > 0 && (
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Приглашения ({invitations.length}):
                </Typography>
                <List dense>
                  {invitations.map((inv, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={inv.email}
                        secondary={`Тип: ${inv.type === 'named' ? 'Именное' : 'Общее'} • Срок: ${
                          inv.expiresInDays
                        } дней`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}

            <Alert severity="warning" sx={{ mt: 2 }}>
              Вы можете создать тест без приглашений и добавить их позже.
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <PageContainer title="Создать тест" description="Конструктор теста на знание регламентов">
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link href="/hr" underline="hover" color="inherit">
          Главная
        </Link>
        <Link href="/hr/regulation-tests" underline="hover" color="inherit">
          Тесты
        </Link>
        <Typography color="text.primary">Создать тест</Typography>
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
          <Button onClick={handleBack} disabled={activeStep === 0}>
            Назад
          </Button>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" onClick={() => router.push('/hr/regulation-tests')}>
              Отмена
            </Button>

            {activeStep === steps.length - 1 ? (
              <Button variant="contained" onClick={handleCreateTest}>
                Создать тест
              </Button>
            ) : (
              <Button variant="contained" onClick={handleNext} disabled={!isStepValid(activeStep)}>
                Далее
              </Button>
            )}
          </Box>
        </Box>
      </Card>
    </PageContainer>
  );
}

