'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  Typography,
  Breadcrumbs,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Paper,
  Grid,
  Divider,
  Alert,
} from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { apiFetch } from '@/utils/api';
import RegulationTestTabs from '../components/RegulationTestTabs';

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test';

interface TestResult {
  sessionId: number;
  employeeName: string | null;
  employeeEmail: string | null;
  employeeDepartment: string | null;
  status: string;
  score: number | null;
  startedAt: string;
  finishedAt: string | null;
}

interface TestDetails {
  id: number;
  title: string;
  description: string;
}

interface SessionDetail {
  sessionId: number;
  test: {
    title: string;
  };
  employee: {
    name: string | null;
    email: string | null;
    department: string | null;
  };
  status: string;
  score: number | null;
  startedAt: string;
  finishedAt: string | null;
  answers: Array<{
    questionText: string;
    answerText: string;
    videoFilename: string | null;
    audioFilename: string | null;
    transcription: string | null;
    processingStatus: string;
    score: number;
    aiComment: string;
    regulation: {
      title: string;
    };
  }>;
}

export default function TestResultsPage() {
  const params = useParams();
  const router = useRouter();
  const testId = parseInt(params.id as string);

  const [loading, setLoading] = useState(true);
  const [testDetails, setTestDetails] = useState<TestDetails | null>(null);
  const [results, setResults] = useState<TestResult[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionDetail | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [testId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Загружаем тест
      const testResponse = await apiFetch(`${API_BASE}/api/regulation-tests/${testId}`);
      const testData = await testResponse.json();
      setTestDetails(testData);

      // Загружаем результаты
      const resultsResponse = await apiFetch(`${API_BASE}/api/regulation-tests/${testId}/results`);
      const resultsData = await resultsResponse.json();
      setResults(resultsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (sessionId: number) => {
    try {
      const response = await apiFetch(`${API_BASE}/api/regulation-tests/results/${sessionId}`);
      const data = await response.json();
      setSelectedSession(data);
      setDetailsDialogOpen(true);
    } catch (error) {
      console.error('Error loading session details:', error);
    }
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'default' => {
    switch (status) {
      case 'finished':
        return 'success';
      case 'started':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'finished':
        return 'Завершён';
      case 'started':
        return 'В процессе';
      default:
        return 'Новый';
    }
  };

  const finishedResults = results.filter((r) => r.status === 'finished');
  const avgScore =
    finishedResults.length > 0
      ? Math.round(finishedResults.reduce((sum, r) => sum + (r.score || 0), 0) / finishedResults.length)
      : 0;

  return (
    <PageContainer title="Результаты теста" description="Просмотр результатов тестирования">
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link href="/hr" underline="hover" color="inherit">
          Главная
        </Link>
        <Link href="/hr/regulation-tests" underline="hover" color="inherit">
          Тесты
        </Link>
        <Typography color="text.primary">Результаты</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">📊 Результаты тестирования</Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/hr/regulation-tests')}
        >
          Назад к тестам
        </Button>
      </Box>

      {/* Tabs navigation */}
      <RegulationTestTabs testId={testId} />

      {testDetails && (
        <Card sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {testDetails.title}
          </Typography>
          {testDetails.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {testDetails.description}
            </Typography>
          )}

          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light' }}>
                <Typography variant="h4">{results.length}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Всего сессий
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light' }}>
                <Typography variant="h4">{finishedResults.length}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Завершено
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light' }}>
                <Typography variant="h4">{avgScore}%</Typography>
                <Typography variant="caption" color="text.secondary">
                  Средний балл
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Card>
      )}

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Сотрудник</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Отдел</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Балл</TableCell>
                <TableCell>Начало</TableCell>
                <TableCell>Окончание</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">Загрузка...</Typography>
                  </TableCell>
                </TableRow>
              ) : results.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">Результаты отсутствуют</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                results.map((result) => (
                  <TableRow key={result.sessionId} hover>
                    <TableCell>
                      <Typography variant="subtitle2">{result.employeeName || '—'}</Typography>
                    </TableCell>
                    <TableCell>{result.employeeEmail || '—'}</TableCell>
                    <TableCell>{result.employeeDepartment || '—'}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(result.status)}
                        size="small"
                        color={getStatusColor(result.status)}
                      />
                    </TableCell>
                    <TableCell>
                      {result.score !== null ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={`${result.score}%`}
                            size="small"
                            color="primary"
                          />
                          {result.status === 'finished' && (
                            <Box sx={{ width: 100 }}>
                              <LinearProgress
                                variant="determinate"
                                value={result.score}
                                color="primary"
                                sx={{ height: 6, borderRadius: 1 }}
                              />
                            </Box>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          —
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{new Date(result.startedAt).toLocaleString('ru-RU')}</TableCell>
                    <TableCell>
                      {result.finishedAt ? new Date(result.finishedAt).toLocaleString('ru-RU') : '—'}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Детали">
                        <IconButton size="small" onClick={() => handleViewDetails(result.sessionId)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Dialog с деталями сессии */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Детали результата
        </DialogTitle>
        <DialogContent>
          {selectedSession && (
            <Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Сотрудник
                </Typography>
                <Typography variant="body1">
                  {selectedSession.employee.name} ({selectedSession.employee.email})
                </Typography>
                {selectedSession.employee.department && (
                  <Typography variant="body2" color="text.secondary">
                    Отдел: {selectedSession.employee.department}
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Итоговый балл
                </Typography>
                <Typography variant="h4" color="primary.main">
                  {selectedSession.score}%
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
                Ответы на вопросы:
              </Typography>

              {selectedSession.answers.map((answer, index) => (
                <Card key={index} sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Chip label={answer.regulation.title} size="small" variant="outlined" />
                    <Chip
                      label={`${answer.score}%`}
                      size="small"
                      color={answer.score >= 70 ? 'success' : 'error'}
                    />
                  </Box>

                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Вопрос:
                  </Typography>
                  <Typography variant="body2">{answer.questionText}</Typography>

                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Ответ сотрудника:
                  </Typography>
                  
                  {/* Видео/Аудио ответ */}
                  {(answer.videoFilename || answer.audioFilename) && (
                    <Box sx={{ mb: 2 }}>
                      {answer.videoFilename ? (
                        <video
                          controls
                          style={{ width: '100%', maxHeight: '400px', borderRadius: '8px' }}
                          src={`${API_BASE}/uploads/${answer.videoFilename}`}
                        />
                      ) : answer.audioFilename ? (
                        <audio
                          controls
                          style={{ width: '100%' }}
                          src={`${API_BASE}/uploads/${answer.audioFilename}`}
                        />
                      ) : null}
                      
                      {answer.processingStatus === 'transcribing' && (
                        <Alert severity="info" sx={{ mt: 1 }}>
                          Идёт распознавание речи...
                        </Alert>
                      )}
                      {answer.processingStatus === 'failed' && (
                        <Alert severity="error" sx={{ mt: 1 }}>
                          Ошибка при распознавании речи
                        </Alert>
                      )}
                    </Box>
                  )}

                  {/* Транскрипция */}
                  {answer.transcription && (
                    <Paper sx={{ p: 2, bgcolor: 'background.paper', mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                        Транскрипция:
                      </Typography>
                      <Typography variant="body2">{answer.transcription}</Typography>
                    </Paper>
                  )}

                  {/* Текстовый ответ (если есть) */}
                  {answer.answerText && !answer.transcription && (
                    <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
                      <Typography variant="body2">{answer.answerText}</Typography>
                    </Paper>
                  )}

                  {answer.aiComment && (
                    <>
                      <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                        Комментарий AI:
                      </Typography>
                      <Alert severity={answer.score >= 70 ? 'success' : 'warning'} sx={{ mt: 1 }}>
                        {answer.aiComment}
                      </Alert>
                    </>
                  )}
                </Card>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}

