"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  LinearProgress,
  Alert,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Divider,
  Stack,
  CircularProgress,
  Rating,
} from "@mui/material";
import {
  IconArrowLeft,
  IconTrophy,
  IconMedal,
  IconCrown,
  IconUser,
  IconBrain,
} from "@tabler/icons-react";
import PageContainer from "@/app/components/container/PageContainer";
import { apiFetch } from "@/utils/api";

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

interface Candidate {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  score?: number;
  skills?: any[];
  status?: string;
  sessionsCount?: number;
  createdAt?: string;
}

interface ComparisonResult {
  winnerId: number;
  rank: number[];
  reasoning: string;
}

interface ComparisonData {
  status: string;
  result?: ComparisonResult;
  error?: string;
}

export default function ComparePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiAnalysisHash, setAiAnalysisHash] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [isMounted, setIsMounted] = useState(true);
  const [isLoadingBasic, setIsLoadingBasic] = useState(false);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  const ids = searchParams.get('ids')?.split(',').map(id => parseInt(id)).filter(Boolean) || [];

  // Стабильная ссылка на ids для useEffect
  const stableIds = useMemo(() => ids, [ids.join(',')]);



  // Сброс флага инициализации при изменении ID кандидатов
  useEffect(() => {
    setHasInitialized(false);
    setLoading(true);
    setError(null);
    setCandidates([]);
    setComparisonData(null);
    setAiAnalysisHash(null);

    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  }, [stableIds.join(',')]);

  // Проверка авторизации
  useEffect(() => {
    const token = localStorage.getItem("recruitment_token");
    if (!token) {
      router.push("/auth/phone");
      return;
    }
  }, [router]);

  // Проверка наличия ID кандидатов
  useEffect(() => {
    if (stableIds.length < 2) {
      setError('Необходимо выбрать минимум 2 кандидата для сравнения');
      setLoading(false);
      return;
    }
  }, [stableIds]);

  // Установка флага монтирования
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Загрузка базового сравнения
  const loadBasicComparison = async () => {
    if (isLoadingBasic || hasInitialized) {
      console.log('⏳ Базовое сравнение уже загружается или уже загружено, пропускаем');
      return;
    }
    
    console.log('🔄 Загружаем базовое сравнение для ID:', stableIds);
    setIsLoadingBasic(true);
    
    try {
      const response = await apiFetch(`${API_BASE}/api/admin/candidates/compare`, {
        method: 'POST',
        body: JSON.stringify({ ids: stableIds }),
      });

      if (response.status === 401) {
        console.log('❌ 401 Unauthorized, перенаправляем на авторизацию');
        router.push("/auth/phone");
        return;
      }

      if (!response.ok) throw new Error('Ошибка загрузки данных');
      
      const data = await response.json();
      console.log('✅ Базовое сравнение загружено:', data);
        setCandidates(data.candidates || []);
    } catch (err) {
      console.error('❌ Ошибка загрузки базового сравнения:', err);
        setError('Не удалось загрузить данные кандидатов');
    } finally {
        setIsLoadingBasic(false);
    }
  };

  // Запуск AI-анализа
  const startAiAnalysis = async () => {
    if (isLoadingAi || hasInitialized) {
      console.log('⏳ AI-анализ уже запускается или уже запущен, пропускаем');
      return;
    }
    
    console.log('🤖 Запускаем AI-анализ для ID:', stableIds);
    setIsLoadingAi(true);
    
    try {
      const response = await apiFetch(`${API_BASE}/api/admin/candidates/compare/ai`, {
        method: 'POST',
        body: JSON.stringify({ ids: stableIds }),
      });

      if (response.status === 401) {
        console.log('❌ 401 Unauthorized, перенаправляем на авторизацию');
        router.push("/auth/phone");
        return;
      }

      if (!response.ok) throw new Error('Ошибка запуска AI-анализа');
      
      const data = await response.json();
      console.log('✅ AI-анализ запущен:', data);
      setAiAnalysisHash(data.hash);
      
      if (data.status === 'pending') {
        console.log('⏳ AI-анализ в процессе, запускаем поллинг');
        startPolling(data.hash);
      } else if (data.status === 'done') {
        console.log('✅ AI-анализ уже завершен, загружаем результаты');
        // Если анализ уже завершен, загружаем результаты сразу
        const resultResponse = await apiFetch(`${API_BASE}/api/admin/candidates/compare/ai/${data.hash}`);
        if (resultResponse.ok) {
          const resultData = await resultResponse.json();
          console.log('📊 Результаты AI-анализа загружены:', resultData);
          setComparisonData(resultData);
        }
      } else if (data.status === 'error') {
        console.log('❌ AI-анализ завершился с ошибкой');
        setComparisonData(data);
      } else {
        console.log('❓ Неизвестный статус AI-анализа:', data.status);
        setComparisonData(data);
      }
    } catch (err) {
      console.error('❌ Ошибка запуска AI-анализа:', err);
        setError('Не удалось запустить AI-анализ');
    } finally {
        setIsLoadingAi(false);
    }
  };

  // Проверка статуса AI-анализа
  const checkAiStatus = async (hash: string) => {
    console.log('🔍 Проверяем статус AI для hash:', hash);
    try {
      const response = await apiFetch(`${API_BASE}/api/admin/candidates/compare/ai/${hash}`);
      
      if (response.status === 401) {
        console.log('❌ 401 Unauthorized, перенаправляем на авторизацию');
        router.push("/auth/phone");
        return;
      }
      
      if (!response.ok) throw new Error('Ошибка проверки статуса');
      
      const data = await response.json();
      console.log('📊 Статус AI:', data.status, data);
        setComparisonData(data);
        
        if (data.status === 'done' || data.status === 'error') {
          console.log('🏁 AI-анализ завершен, останавливаем поллинг');
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          console.log('🛑 Поллинг остановлен');
        }
      }
    } catch (err) {
      console.error('❌ Ошибка проверки статуса AI:', err);
    }
  };

  // Поллинг статуса
  const startPolling = (hash: string) => {
    console.log('🔄 Запускаем поллинг для hash:', hash);
    
    // Очищаем предыдущий интервал если он есть
    if (pollingInterval) {
      console.log('🧹 Очищаем предыдущий интервал поллинга');
      clearInterval(pollingInterval);
    }
    
    const interval = setInterval(() => {
      console.log('⏰ Поллинг: проверяем статус для hash:', hash);
        checkAiStatus(hash);
    }, 3000);
    
    setPollingInterval(interval);
    console.log('✅ Поллинг запущен, интервал:', interval);
  };



  useEffect(() => {
    if (stableIds.length < 2) {
      setError('Необходимо выбрать минимум 2 кандидатов');
      setLoading(false);
      return;
    }

    // Проверяем, не инициализировались ли уже
    if (hasInitialized) {
      console.log('✅ Уже инициализированы, пропускаем useEffect');
      return;
    }

    // Проверяем, не загружаются ли уже данные
    if (isLoadingBasic || isLoadingAi) {
      console.log('⏳ Данные уже загружаются, пропускаем useEffect');
      return;
    }

    const init = async () => {
      try {
        await loadBasicComparison();
        

        // Запускаем AI-анализ
        await startAiAnalysis();
        
        setLoading(false);
        setHasInitialized(true); // Отмечаем что инициализация завершена
      } catch (err) {
        setError('Ошибка инициализации');
        setLoading(false);
      }
    };

    init();

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
    };
  }, [stableIds]); // Убираем isLoadingBasic и isLoadingAi из зависимостей

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return <IconCrown size={24} color="#FFD700" />;
      case 2: return <IconMedal size={24} color="#C0C0C0" />;
      case 3: return <IconTrophy size={24} color="#CD7F32" />;
      default: return <IconUser size={24} color="#666" />;
    }
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1: return 'success';
      case 2: return 'warning';
      case 3: return 'info';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <PageContainer title="Сравнение кандидатов" description="Анализ и сравнение кандидатов">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Сравнение кандидатов" description="Анализ и сравнение кандидатов">
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          startIcon={<IconArrowLeft />} 
          onClick={() => router.back()}
        >
          Назад
        </Button>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Сравнение кандидатов" description="Анализ и сравнение кандидатов">
      <Box sx={{ mb: 3 }}>
        <Button 
          startIcon={<IconArrowLeft />} 
          onClick={() => router.back()}
          sx={{ mb: 2 }}
        >
          Назад
        </Button>
        
        <Typography variant="h4" gutterBottom>
          Сравнение кандидатов
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Детальный анализ и сравнение {candidates.length} кандидатов
        </Typography>
      </Box>

      {/* Информация о базовом сравнении */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            �� Базовое сравнение
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {candidates.map((candidate) => (
              <Grid item xs={12} sm={6} md={4} key={candidate.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2} mb={1}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                        {candidate.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontSize="1rem">
                          <Link 
                            href={`/hr/candidates/${candidate.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ 
                              textDecoration: 'none', 
                              color: 'inherit',
                              cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                              (e.target as HTMLElement).style.color = '#1976d2';
                              (e.target as HTMLElement).style.textDecoration = 'underline';
                            }}
                            onMouseLeave={(e) => {
                              (e.target as HTMLElement).style.color = 'inherit';
                              (e.target as HTMLElement).style.textDecoration = 'none';
                            }}
                          >
                            {candidate.name}
                          </Link>
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {candidate.id}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        📧 {candidate.email || 'Email не указан'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        📱 {candidate.phone || 'Телефон не указан'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        📅 Создан: {new Date(candidate.createdAt).toLocaleDateString('ru-RU')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        🎯 Статус: {candidate.status}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        📝 Сессий: {candidate.sessionsCount}
                      </Typography>
                      {candidate.score ? (
                        <Typography variant="body2" color="success.main" fontWeight="600">
                          ⭐ Оценка: {candidate.score}/10
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="warning.main">
                          ⚠️ Оценка не доступна
                        </Typography>
                      )}
                      {candidate.skills && candidate.skills.length > 0 ? (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            🚀 Навыки: {candidate.skills.length}
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                            {candidate.skills.slice(0, 3).map((skill, index) => (
                              <Chip 
                                key={index} 
                                label={typeof skill === 'string' ? skill : skill.skill} 
                                size="small" 
                                variant="outlined"
                                color="primary"
                              />
                            ))}
                            {candidate.skills.length > 3 && (
                              <Chip 
                                label={`+${candidate.skills.length - 3}`} 
                                size="small" 
                                variant="outlined"
                                color="default"
                              />
                            )}
                          </Box>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="warning.main">
                          ⚠️ Навыки не оценены
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {/* Предупреждение о недостатке данных */}
          {candidates.every(c => !c.score && c.skills.length === 0) && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                ⚠️ <strong>Внимание:</strong> У выбранных кандидатов недостаточно данных для AI-анализа
              </Typography>
              <Typography variant="body2" component="ul" sx={{ mt: 1, pl: 2 }}>
                <li>Нет оценок по интервью</li>
                <li>Не оценены навыки</li>
                <li>AI-анализ может быть неточным</li>
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                💡 <strong>Рекомендация:</strong> Дождитесь завершения интервью кандидатами для получения более точного анализа
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* AI-анализ */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <IconBrain size={24} />
              <Typography variant="h6">AI-анализ</Typography>
            {aiAnalysisHash && (
              <Chip 
                label={`Hash: ${aiAnalysisHash.substring(0, 8)}...`} 
                size="small" 
                variant="outlined"
                sx={{ ml: 'auto' }}
              />
            )}
            </Box>
            
          {comparisonData?.status === 'pending' && (
              <>
                <LinearProgress sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Анализируем кандидатов с помощью искусственного интеллекта...
                </Typography>
              </>
            )}
            
          {comparisonData?.status === 'done' && comparisonData.result && (
              <>
                <Alert severity="success" sx={{ mb: 2 }}>
                  Анализ завершен
                </Alert>
                
                {/* Рейтинг кандидатов */}
                <Typography variant="h6" gutterBottom>
                  🏆 Рейтинг кандидатов
                </Typography>
                
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {comparisonData.result.rank.map((candidateId, index) => {
                    const candidate = candidates.find(c => c.id === candidateId);
                    if (!candidate) return null;
                    
                    const position = index + 1;
                    const isWinner = candidateId === comparisonData.result?.winnerId;
                    
                    return (
                      <Grid item xs={12} sm={6} md={4} key={candidateId}>
                        <Card 
                          variant={isWinner ? "outlined" : "elevation"}
                          sx={{ 
                            border: isWinner ? '2px solid' : '1px solid',
                            borderColor: isWinner ? 'success.main' : 'divider',
                            bgcolor: isWinner ? 'success.50' : 'background.paper'
                          }}
                        >
                          <CardContent>
                            <Box display="flex" alignItems="center" gap={2} mb={2}>
                              {getPositionIcon(position)}
                              <Box>
                                <Typography variant="h6" fontSize="1rem">
                                  <Link 
                                    href={`/hr/candidates/${candidate.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ 
                                      textDecoration: 'none', 
                                      color: 'inherit',
                                      cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => {
                                      (e.target as HTMLElement).style.color = '#1976d2';
                                      (e.target as HTMLElement).style.textDecoration = 'underline';
                                    }}
                                    onMouseLeave={(e) => {
                                      (e.target as HTMLElement).style.color = 'inherit';
                                      (e.target as HTMLElement).style.textDecoration = 'none';
                                    }}
                                  >
                                    {candidate.name}
                                  </Link>
                                </Typography>
                                <Chip 
                                  label={`${position} место`}
                                  color={getPositionColor(position) as any}
                                  size="small"
                                />
                              </Box>
                            </Box>
                            
                            {isWinner && (
                              <Chip 
                                label="🏆 Лучший кандидат" 
                                color="success" 
                                variant="filled"
                                size="small"
                              />
                            )}
                            
                            {candidate.score && (
                              <Box mt={1}>
                                <Typography variant="body2" color="text.secondary">
                                  Оценка: {candidate.score}/10
                                </Typography>
                                <Rating 
                                  value={candidate.score / 2} 
                                  readOnly 
                                  size="small" 
                                />
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
                
                {/* Обоснование */}
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  📝 Обоснование выбора
                </Typography>
                <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, borderLeft: '4px solid', borderColor: 'primary.main' }}>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {comparisonData.result.reasoning}
                  </Typography>
                </Box>
              </>
            )}
            
          {comparisonData?.status === 'error' && (
            <>
              <Alert severity="error" sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  ❌ Ошибка AI-анализа
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Не удалось провести анализ кандидатов с помощью искусственного интеллекта.
                </Typography>
                {comparisonData.error && (
                  <Box sx={{ mt: 1, p: 1, bgcolor: 'error.50', borderRadius: 1, border: '1px solid', borderColor: 'error.200' }}>
                    <Typography variant="caption" color="error.dark" sx={{ fontFamily: 'monospace' }}>
                      <strong>Детали ошибки:</strong><br />
                      {comparisonData.error}
                    </Typography>
                  </Box>
                )}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    💡 <strong>Возможные причины:</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" component="ul" sx={{ mt: 1, pl: 2 }}>
                    <li>Недостаточно данных для анализа</li>
                    <li>Проблемы с AI-сервисом</li>
                    <li>Ошибка в обработке данных</li>
                  </Typography>
                </Box>
              </Alert>
              
              {/* Кнопка повторной попытки */}
              <Button
                variant="outlined"
                color="primary"
                onClick={startAiAnalysis}
                disabled={isLoadingAi}
                startIcon={isLoadingAi ? <CircularProgress size={16} /> : <IconBrain size={16} />}
                sx={{ mt: 1 }}
              >
                {isLoadingAi ? 'Повторная попытка...' : 'Повторить AI-анализ'}
              </Button>
            </>
          )}
          
          {/* Если AI-анализ еще не запускался */}
          {!comparisonData && !isLoadingAi && (
            <Box textAlign="center" py={2}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                AI-анализ еще не запущен
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={startAiAnalysis}
                disabled={isLoadingAi}
                startIcon={isLoadingAi ? <CircularProgress size={16} /> : <IconBrain size={16} />}
              >
                {isLoadingAi ? 'Запуск...' : 'Запустить AI-анализ'}
              </Button>
            </Box>
            )}
          </CardContent>
        </Card>

      {/* Таблица сравнения */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📊 Сравнительная таблица
          </Typography>
          
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Параметр</strong></TableCell>
                  {candidates.map(candidate => (
                    <TableCell key={candidate.id} align="center">
                      <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                          {candidate.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" fontWeight={600}>
                          <Link 
                            href={`/hr/candidates/${candidate.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ 
                              textDecoration: 'none', 
                              color: 'inherit',
                              cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                              (e.target as HTMLElement).style.color = '#1976d2';
                              (e.target as HTMLElement).style.textDecoration = 'underline';
                            }}
                            onMouseLeave={(e) => {
                              (e.target as HTMLElement).style.color = 'inherit';
                              (e.target as HTMLElement).style.textDecoration = 'none';
                            }}
                          >
                            {candidate.name}
                          </Link>
                        </Typography>
                      </Box>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><strong>Статус</strong></TableCell>
                  {candidates.map(candidate => (
                    <TableCell key={candidate.id} align="center">
                      <Chip 
                        label={candidate.status === 'new' ? 'Новый' : candidate.status}
                        color={candidate.status === 'finished' ? 'success' : 'default'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                  ))}
                </TableRow>
                
                <TableRow>
                  <TableCell><strong>Количество сессий</strong></TableCell>
                  {candidates.map(candidate => (
                    <TableCell key={candidate.id} align="center">
                      <Chip 
                        label={candidate.sessionsCount}
                        color={candidate.sessionsCount > 0 ? 'primary' : 'default'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                  ))}
                </TableRow>
                
                <TableRow>
                  <TableCell><strong>Дата создания</strong></TableCell>
                  {candidates.map(candidate => (
                    <TableCell key={candidate.id} align="center">
                      <Typography variant="body2" color="text.secondary">
                        {new Date(candidate.createdAt).toLocaleDateString('ru-RU')}
                          </Typography>
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </PageContainer>
  );
} 