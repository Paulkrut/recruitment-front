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
import { useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';


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
  analysis?: string;
  reasoning?: string;
  ranking?: number[];
  winnerId?: number;
  criteria?: {
    general: string[];
    specific: string[];
  };
  comparison?: Array<{
    candidateId: number;
    name: string;
    scores: Record<string, string>;
    overallScore: string;
    recommendation: string;
  }>;
  vacancy?: {
    id: number;
    title: string;
    description?: string;
  };
}

interface ComparisonData {
  status: string;
  result?: ComparisonResult;
  error?: string;
}

export default function ComparePage() {
  const { _ } = useLingui();

  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Добавляем CSS анимацию для прогресс-бара
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
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

  // Расчет примерного времени генерации AI анализа
  const calculateEstimatedTime = (candidatesCount: number, questionsCount: number = 8): string => {
    // Базовое время: 30 секунд на кандидата + 10 секунд на вопрос
    const baseTimePerCandidate = 30;
    const baseTimePerQuestion = 10;
    
    const totalSeconds = (candidatesCount * baseTimePerCandidate) + (questionsCount * baseTimePerQuestion);
    
    if (totalSeconds < 60) {
      return `${totalSeconds} секунд`;
    } else if (totalSeconds < 300) {
      const minutes = Math.ceil(totalSeconds / 60);
      return `до ${minutes} минут`;
    } else {
      const minutes = Math.ceil(totalSeconds / 60);
      return `до ${minutes} минут`;
    }
  };

  // Получаем примерное время для текущего сравнения
  const estimatedTime = useMemo(() => {
    return calculateEstimatedTime(stableIds.length);
  }, [stableIds.length]);


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
      router.push("/auth/login");
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
        router.push("/auth/login");
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
        router.push("/auth/login");
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

  if (loading) {
    return (
      <PageContainer title={_(msg`Сравнение кандидатов`)} description="Анализ и сравнение кандидатов">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title={_(msg`Сравнение кандидатов`)} description="Анализ и сравнение кандидатов">
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
    <PageContainer title={_(msg`Сравнение кандидатов`)} description="Анализ и сравнение кандидатов">
      <Box sx={{ mb: 3 }}>
        <Button 
          startIcon={<IconArrowLeft />} 
          onClick={() => router.back()}
          sx={{ mb: 2 }}
        >
          Назад
        </Button>
        
        <Typography variant="h4" gutterBottom><Trans>Сравнение кандидатов</Trans></Typography>
        <Typography variant="body2" color="text.secondary">
          Детальный анализ и сравнение {candidates.length} кандидатов
        </Typography>
      </Box>

      {/* Информация о базовом сравнении */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom><Trans>�� Базовое сравнение</Trans></Typography>
          
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
                        <Typography variant="body2" color="warning.main"><Trans>⚠️ Оценка не доступна</Trans></Typography>
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
                        <Typography variant="body2" color="warning.main"><Trans>⚠️ Навыки не оценены</Trans></Typography>
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
              <Typography variant="h6"><Trans>AI-анализ</Trans></Typography>
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
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h6" gutterBottom color="primary"><Trans>🤖 AI анализирует кандидатов...</Trans></Typography>
                  <Typography variant="body1" gutterBottom>
                    Обрабатываем {stableIds.length} кандидатов
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    ⏱️ Примерное время: <strong>{estimatedTime}</strong>
                  </Typography>
                <Typography variant="body2" color="text.secondary"><Trans>💡 Чем больше кандидатов и вопросов, тем дольше анализ</Trans></Typography>
                  
                  {/* Прогресс-бар с анимацией */}
                  <Box sx={{ mt: 2, position: 'relative' }}>
                    <LinearProgress 
                      variant="indeterminate" 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        '& .MuiLinearProgress-bar': {
                          background: 'linear-gradient(90deg, #1976d2, #42a5f5, #1976d2)',
                          backgroundSize: '200% 100%',
                          animation: 'shimmer 2s infinite'
                        }
                      }} 
                    />
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        top: '50%', 
                        left: '50%', 
                        transform: 'translate(-50%, -50%)',
                        fontSize: '0.75rem',
                        color: 'text.secondary',
                        fontWeight: 'bold'
                      }}
                    ><Trans>Анализируем...</Trans></Box>
                  </Box>
                  
                  {/* Дополнительная информация */}
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'info.50', borderRadius: 2, border: '1px solid', borderColor: 'info.200' }}>
                    <Typography variant="body2" color="info.dark">
                      💡 <strong>Почему это занимает время?</strong><br />
                      • AI анализирует каждый ответ каждого кандидата<br />
                      • Сравнивает навыки и опыт<br />
                      • Формирует детальные критерии оценки<br />
                      • Дает обоснованные рекомендации
                </Typography>
                  </Box>
                </Box>
              </>
            )}
            
          {comparisonData?.status === 'done' && comparisonData.result && (
              <>
                <Alert severity="success" sx={{ mb: 2 }}><Trans>Анализ завершен</Trans></Alert>
                
                {/* Полный анализ AI */}
                <Typography variant="h6" gutterBottom><Trans>🤖 Анализ кандидатов</Trans></Typography>
                
                <Box sx={{ 
                  bgcolor: 'grey.50', 
                  p: 3, 
                  borderRadius: 2, 
                  border: '1px solid', 
                  borderColor: 'grey.200',
                  fontFamily: 'inherit'
                }}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.6,
                      fontSize: '0.95rem'
                    }}
                  >
                    {comparisonData.result?.analysis || comparisonData.result?.reasoning || 'Анализ недоступен'}
                  </Typography>
                </Box>
                
                {/* Информация о вакансии */}
                {comparisonData.result?.vacancy && (
                  <>
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="h6" gutterBottom><Trans>📋 Информация о вакансии</Trans></Typography>
                    <Box sx={{ 
                      bgcolor: 'primary.50', 
                      p: 2, 
                      borderRadius: 1, 
                      borderLeft: '4px solid', 
                      borderColor: 'primary.main' 
                    }}>
                      <Typography variant="body2">
                        <strong>Должность:</strong> {comparisonData.result.vacancy.title || 'Не указана'}<br />
                        {comparisonData.result.vacancy.description && (
                          <>
                            <strong>Описание:</strong> {comparisonData.result.vacancy.description}
                          </>
                        )}
                      </Typography>
                    </Box>
                  </>
                )}

                {/* Таблица сравнения кандидатов */}
                {comparisonData.result?.comparison && comparisonData.result?.criteria && (
                  <>
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="h6" gutterBottom><Trans>📊 Детальное сравнение по критериям</Trans></Typography>
                    
                    {/* Критерии */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom><Trans>🎯 Общие критерии для позиции</Trans></Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        {comparisonData.result.criteria.general?.map((criterion, index) => (
                                <Chip 
                            key={index} 
                            label={criterion} 
                                  size="small"
                            variant="outlined" 
                            color="primary"
                                />
                        ))}
                            </Box>
                            
                      {comparisonData.result.criteria.specific && comparisonData.result.criteria.specific.length > 0 && (
                        <>
                          <Typography variant="subtitle1" gutterBottom><Trans>🎯 Специфичные критерии для этой вакансии</Trans></Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {comparisonData.result.criteria.specific.map((criterion, index) => (
                              <Chip 
                                key={index} 
                                label={criterion} 
                                size="small"
                                variant="outlined" 
                                color="secondary"
                              />
                            ))}
                          </Box>
                        </>
                      )}
                    </Box>

                    {/* Таблица сравнения */}
                    <TableContainer component={Paper} sx={{ mb: 2 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', minWidth: 150 }}><Trans>Кандидат</Trans></TableCell>
                            {comparisonData.result.criteria.general?.map((criterion, index) => (
                              <TableCell 
                                key={`general-${index}`} 
                                sx={{ 
                                  fontWeight: 'bold', 
                                  minWidth: 120,
                                  bgcolor: 'primary.50',
                                  borderRight: '1px solid',
                                  borderColor: 'divider'
                                }}
                              >
                                {criterion}
                              </TableCell>
                            ))}
                            {comparisonData.result.criteria.specific?.map((criterion, index) => (
                              <TableCell 
                                key={`specific-${index}`} 
                                sx={{ 
                                  fontWeight: 'bold', 
                                  minWidth: 120,
                                  bgcolor: 'secondary.50',
                                  borderRight: '1px solid',
                                  borderColor: 'divider'
                                }}
                              >
                                {criterion}
                              </TableCell>
                            ))}
                            <TableCell sx={{ fontWeight: 'bold', minWidth: 100 }}><Trans>Общая оценка</Trans></TableCell>
                            <TableCell sx={{ fontWeight: 'bold', minWidth: 120 }}><Trans>Рекомендация</Trans></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {comparisonData.result.comparison.map((candidate, index) => {
                            const isWinner = candidate.candidateId === comparisonData.result?.winnerId;
                            return (
                              <TableRow 
                                key={candidate.candidateId}
                                sx={{ 
                                  bgcolor: isWinner ? 'success.50' : 'inherit',
                                  '&:hover': { bgcolor: isWinner ? 'success.100' : 'grey.50' }
                                }}
                              >
                                <TableCell sx={{ fontWeight: 'bold' }}>
                                  <Box display="flex" alignItems="center" gap={1}>
                                    {isWinner && <IconCrown size={16} color="#FFD700" />}
                                    <Link 
                                      href={`/hr/candidates/${candidate.candidateId}`}
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
                                  </Box>
                                </TableCell>
                                
                                {/* Общие критерии */}
                                {comparisonData.result.criteria.general?.map((criterion, critIndex) => (
                                  <TableCell 
                                    key={`general-${critIndex}`}
                                    sx={{ 
                                      borderRight: '1px solid',
                                      borderColor: 'divider'
                                    }}
                                  >
                                    {candidate.scores[criterion] || '-'}
                                  </TableCell>
                                ))}
                                
                                {/* Специфичные критерии */}
                                {comparisonData.result.criteria.specific?.map((criterion, critIndex) => (
                                  <TableCell 
                                    key={`specific-${critIndex}`}
                                    sx={{ 
                                      borderRight: '1px solid',
                                      borderColor: 'divider'
                                    }}
                                  >
                                    {candidate.scores[criterion] || '-'}
                                  </TableCell>
                                ))}
                                
                                <TableCell sx={{ fontWeight: 'bold' }}>
                                  {candidate.overallScore}
                                </TableCell>
                                
                                <TableCell>
                                  <Chip 
                                    label={candidate.recommendation} 
                                  size="small" 
                                    color={
                                      candidate.recommendation?.toLowerCase().includes('брать') ? 'success' :
                                      candidate.recommendation?.toLowerCase().includes('отказать') ? 'error' :
                                      'warning'
                                    }
                                    variant="outlined"
                                  />
                                </TableCell>
                              </TableRow>
                    );
                  })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>
                )}
              </>
            )}
            
          {comparisonData?.status === 'error' && (
            <>
              <Alert severity="error" sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom><Trans>❌ Ошибка AI-анализа</Trans></Typography>
                <Typography variant="body2" gutterBottom><Trans>Не удалось провести анализ кандидатов с помощью искусственного интеллекта.</Trans></Typography>
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
              <Typography variant="body2" color="text.secondary" gutterBottom><Trans>AI-анализ еще не запущен</Trans></Typography>
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
          <Typography variant="h6" gutterBottom><Trans>📊 Сравнительная таблица</Trans></Typography>
          
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