'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
  Alert,
  CircularProgress,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import Link from 'next/link';
import PageContainer from '@/app/components/container/PageContainer';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/utils/api';
import RegulationTestTabs from '../components/RegulationTestTabs';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useLingui } from '@lingui/react';
import { msg, Trans } from '@lingui/macro';


const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test';

interface Question {
  id: number;
  text: string;
  type: string;
  expectedAnswer: string;
  difficulty: number;
  maxTime: number;
  regulationId: number;
  regulationTitle: string;
}

export default function TestQuestionsPage() {
  const { _ } = useLingui();

  const params = useParams();
  const testId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [testTitle, setTestTitle] = useState<string>('');

  useEffect(() => {
    if (testId) {
      loadQuestions();
      loadTest();
    }
  }, [testId]);

  const loadTest = async () => {
    try {
      const response = await apiFetch(`${API_BASE}/api/regulation-tests/${testId}`);
      if (response.ok) {
        const data = await response.json();
        setTestTitle(data.title);
      }
    } catch (error) {
      console.error('Error loading test:', error);
    }
  };

  const loadQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch(`${API_BASE}/api/regulation-tests/${testId}/questions`);
      if (response.ok) {
        const data: Question[] = await response.json();
        setQuestions(data);
      } else {
        setError(_(msg`Не удалось загрузить вопросы`));
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      setError(_(msg`Ошибка при загрузке вопросов`));
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyLabel = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return _(msg`Простой`);
      case 2:
        return _(msg`Средний`);
      case 3:
        return _(msg`Сложный`);
      default:
        return _(msg`Неизвестно`);
    }
  };

  const getDifficultyColor = (difficulty: number): "default" | "success" | "warning" | "error" => {
    switch (difficulty) {
      case 1:
        return 'success';
      case 2:
        return 'warning';
      case 3:
        return 'error';
      default:
        return 'default';
    }
  };

  // Группируем вопросы по регламентам
  const questionsByRegulation = questions.reduce((acc, question) => {
    const key = question.regulationId;
    if (!acc[key]) {
      acc[key] = {
        regulationId: question.regulationId,
        regulationTitle: question.regulationTitle,
        questions: [],
      };
    }
    acc[key].questions.push(question);
    return acc;
  }, {} as Record<number, { regulationId: number; regulationTitle: string; questions: Question[] }>);

  if (loading) {
    return (
      <PageContainer title={_(msg`Вопросы теста`)} description="Загрузка...">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer title={_(msg`Вопросы теста`)} description={_(msg`Список сгенерированных вопросов`)}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <MuiLink href="/hr" underline="hover" color="inherit">
          <Trans>Главная</Trans>
        </MuiLink>
        <MuiLink href="/hr/regulation-tests" underline="hover" color="inherit">
          <Trans>Тесты</Trans>
        </MuiLink>
        <Typography color="text.primary">{testTitle || _(msg`Тест`)}</Typography>
        <Typography color="text.primary"><Trans>Вопросы</Trans></Typography>
      </Breadcrumbs>

      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        <Trans>Вопросы теста</Trans>
      </Typography>

      {/* Tabs navigation */}
      <RegulationTestTabs testId={testId} />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {questions.length === 0 ? (
        <Alert severity="info">
          <Typography variant="body1">
            <Trans>Вопросы ещё не сгенерированы для этого теста.</Trans>
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            <Trans>
              Вопросы будут созданы автоматически в зависимости от режима генерации:
            </Trans>
          </Typography>
          <ul>
            <li><Trans><strong>Заранее:</strong> при создании теста</Trans></li>
            <li><Trans><strong>При старте:</strong> когда сотрудник начнёт прохождение</Trans></li>
          </ul>
        </Alert>
      ) : (
        <Box>
          <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
            <Chip
              label={`${_(msg`Всего вопросов`)}: ${questions.length}`}
              color="primary"
              variant="outlined"
            />
            <Chip
              label={`${_(msg`Регламентов`)}: ${Object.keys(questionsByRegulation).length}`}
              color="secondary"
              variant="outlined"
            />
          </Box>

          {Object.values(questionsByRegulation).map((group) => (
            <Card key={group.regulationId} sx={{ mb: 3 }}>
              <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
                <Typography variant="h6" fontWeight={600}>
                  {group.regulationTitle}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {_(msg`Вопросов`)}: {group.questions.length}
                </Typography>
              </Box>

              <Box sx={{ p: 2 }}>
                {group.questions.map((question, index) => (
                  <Accordion key={question.id} sx={{ mb: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                        <Chip
                          label={`#${index + 1}`}
                          size="small"
                          color="default"
                          sx={{ minWidth: 50 }}
                        />
                        <Typography sx={{ flex: 1 }}>{question.text}</Typography>
                        <Chip
                          label={getDifficultyLabel(question.difficulty)}
                          size="small"
                          color={getDifficultyColor(question.difficulty)}
                        />
                        <Chip
                          label={`${question.maxTime}${_(msg`с`)}`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        <Trans>Эталонный ответ:</Trans>
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          p: 2,
                          bgcolor: '#f9f9f9',
                          borderRadius: 1,
                          border: '1px solid #e0e0e0',
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {question.expectedAnswer}
                      </Typography>
                      
                      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          <Trans>Тип:</Trans> {question.type}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          <Trans>ID:</Trans> {question.id}
                        </Typography>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            </Card>
          ))}
        </Box>
      )}
    </PageContainer>
  );
}

