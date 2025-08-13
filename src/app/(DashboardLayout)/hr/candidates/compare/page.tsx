"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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

  const ids = searchParams.get('ids')?.split(',').map(id => parseInt(id)).filter(Boolean) || [];

  // Стабильная ссылка на ids для useEffect
  const stableIds = useMemo(() => ids, [ids.join(',')]);

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
    if (isLoadingBasic) {
      console.log('⏳ Базовое сравнение уже загружается, пропускаем');
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
      if (isMounted) {
        setCandidates(data.candidates || []);
      }
    } catch (err) {
      console.error('❌ Ошибка загрузки базового сравнения:', err);
      if (isMounted) {
        setError('Не удалось загрузить данные кандидатов');
      }
    } finally {
      if (isMounted) {
        setIsLoadingBasic(false);
      }
    }
  };

  // Запуск AI-анализа
  const startAiAnalysis = async () => {
    if (isLoadingAi) {
      console.log('⏳ AI-анализ уже запускается, пропускаем');
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
      if (isMounted) {
        setAiAnalysisHash(data.hash);
        
        if (data.status === 'pending') {
          startPolling(data.hash);
        } else {
          setComparisonData(data);
        }
      }
    } catch (err) {
      console.error('❌ Ошибка запуска AI-анализа:', err);
      if (isMounted) {
        setError('Не удалось запустить AI-анализ');
      }
    } finally {
      if (isMounted) {
        setIsLoadingAi(false);
      }
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
      if (isMounted) {
        setComparisonData(data);
        
        if (data.status === 'done' || data.status === 'error') {
          console.log('🏁 AI-анализ завершен, останавливаем поллинг');
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }
        }
      }
    } catch (err) {
      console.error('❌ Ошибка проверки статуса AI:', err);
    }
  };

  // Поллинг статуса
  const startPolling = (hash: string) => {
    // Очищаем предыдущий интервал если он есть
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    
    const interval = setInterval(() => {
      if (isMounted) {
        checkAiStatus(hash);
      } else {
        clearInterval(interval);
      }
    }, 3000);
    
    setPollingInterval(interval);
  };

  useEffect(() => {
    if (stableIds.length < 2) {
      setError('Необходимо выбрать минимум 2 кандидатов');
      setLoading(false);
      return;
    }

    // Проверяем, не загружаются ли уже данные
    if (isLoadingBasic || isLoadingAi) {
      console.log('⏳ Данные уже загружаются, пропускаем useEffect');
      return;
    }

    let isMounted = true;

    const init = async () => {
      if (!isMounted) return;
      
      try {
        await loadBasicComparison();
        if (!isMounted) return;
        
        await startAiAnalysis();
        if (!isMounted) return;
        
        setLoading(false);
      } catch (err) {
        if (isMounted) {
          setError('Ошибка инициализации');
          setLoading(false);
        }
      }
    };

    init();

    return () => {
      isMounted = false;
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
    };
  }, [stableIds, isLoadingBasic, isLoadingAi]); // Добавляем флаги загрузки в зависимости

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

      {/* AI-анализ */}
      {comparisonData && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <IconBrain size={24} />
              <Typography variant="h6">AI-анализ</Typography>
            </Box>
            
            {comparisonData.status === 'pending' && (
              <>
                <LinearProgress sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Анализируем кандидатов с помощью искусственного интеллекта...
                </Typography>
              </>
            )}
            
            {comparisonData.status === 'done' && comparisonData.result && (
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
                                  {candidate.name}
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
            
            {comparisonData.status === 'error' && (
              <Alert severity="error">
                Ошибка анализа: {comparisonData.error}
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Таблица сравнения */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📊 Детальное сравнение
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
                          {candidate.name}
                        </Typography>
                      </Box>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><strong>Email</strong></TableCell>
                  {candidates.map(candidate => (
                    <TableCell key={candidate.id} align="center">
                      {candidate.email || '-'}
                    </TableCell>
                  ))}
                </TableRow>
                
                <TableRow>
                  <TableCell><strong>Телефон</strong></TableCell>
                  {candidates.map(candidate => (
                    <TableCell key={candidate.id} align="center">
                      {candidate.phone || '-'}
                    </TableCell>
                  ))}
                </TableRow>
                
                <TableRow>
                  <TableCell><strong>Общая оценка</strong></TableCell>
                  {candidates.map(candidate => (
                    <TableCell key={candidate.id} align="center">
                      {candidate.score ? (
                        <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
                          <Typography variant="body2" fontWeight={600}>
                            {candidate.score}/10
                          </Typography>
                          <Rating value={candidate.score / 2} readOnly size="small" />
                        </Box>
                      ) : '-'}
                    </TableCell>
                  ))}
                </TableRow>
                
                <TableRow>
                  <TableCell><strong>Количество навыков</strong></TableCell>
                  {candidates.map(candidate => (
                    <TableCell key={candidate.id} align="center">
                      <Chip 
                        label={candidate.skills?.length || 0}
                        color="primary"
                        size="small"
                      />
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