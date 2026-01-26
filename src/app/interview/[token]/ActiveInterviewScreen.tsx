"use client";

/**
 * ActiveInterviewScreen - компонент активного интервью с AI
 * 
 * Это основной экран где кандидат отвечает на вопросы в режиме реального времени.
 * Включает чат, вебкамеру, управление записью, таймеры.
 * Поддерживает как видео/аудио ответы, так и текстовые (typing).
 */

import { RefObject, useRef, useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  CircularProgress,
  Paper,
  TextField,
} from "@mui/material";
import { Trans } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { keyframes } from "@mui/system";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SendIcon from "@mui/icons-material/Send";
import { TypingTracker } from "./utils/TypingTracker";

interface ActiveInterviewScreenProps {
  question: any;
  total: number;
  timeLeft: number | null;
  paused: boolean;
  recording: boolean;
  recordedBlob: Blob | null;
  messages: { role: "bot" | "user"; text: string; video?: string; timestamp?: number }[];
  userInputText: string;
  isMobile: boolean;
  cameraEnabled: boolean;
  mediaStream: MediaStream | null;
  interviewProgress: any;
  canContinue: boolean;
  loadingNextQuestion: boolean;
  stepperComp?: React.ReactNode;
  chatRef: RefObject<HTMLDivElement>;
  chatScrollRef: RefObject<HTMLDivElement>;
  
  // Handlers
  onStartRecording: () => void;
  onStopRecording: () => void;
  onSubmitAnswer: () => void;
  onSubmitTextAnswer?: (data: {
    text_answer: string;
    typing_start_time: string;
    typing_end_time: string;
    typing_metadata: string;
  }) => void;
  onSkipQuestion: () => void;
  onPauseInterview: () => void;
  onUserInputChange: (value: string) => void;
  onCameraToggle: (enabled: boolean) => void;
  onStreamReady?: (stream: MediaStream) => void;
  onRecordingComplete?: (blob: Blob) => void;
  
  // Utils
  getQuestionNumber: (pos: number) => number;
  formatMessageTime: (timestamp?: number) => string;
}

export default function ActiveInterviewScreen({
  question,
  total,
  timeLeft,
  paused,
  recording,
  recordedBlob,
  messages,
  userInputText,
  isMobile,
  cameraEnabled,
  mediaStream,
  interviewProgress,
  canContinue,
  loadingNextQuestion,
  stepperComp,
  chatRef,
  chatScrollRef,
  onStartRecording,
  onStopRecording,
  onSubmitAnswer,
  onSubmitTextAnswer,
  onSkipQuestion,
  onPauseInterview,
  onUserInputChange,
  onCameraToggle,
  onStreamReady,
  onRecordingComplete,
  getQuestionNumber,
  formatMessageTime,
}: ActiveInterviewScreenProps) {
  const { _ } = useLingui();
  const chatVideoRef = useRef<HTMLVideoElement|null>(null);
  
  // Состояния для текстовых ответов
  const [textAnswer, setTextAnswer] = useState('');
  const tracker = useRef(new TypingTracker());

  // Подключаем stream к video элементу в чате
  useEffect(() => {
    if (chatVideoRef.current) {
      chatVideoRef.current.srcObject = mediaStream || null;
    }
  }, [mediaStream]);
  
  // Анимации
  const blink = keyframes`50%{opacity:0.2}`;
  const pulse = keyframes`0%{opacity:1}50%{opacity:0.5}100%{opacity:1}`;
  const fadeOutSlide = keyframes`
    0% {
      opacity: 1;
      transform: translateX(0) scale(1);
    }
    50% {
      opacity: 0.5;
      transform: translateX(10px) scale(0.95);
    }
    100% {
      opacity: 0;
      transform: translateX(30px) scale(0.8);
    }
  `;

  // Обработчики для текстовых ответов
  const handleTextKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    tracker.current.onKeyPress(e.key, textAnswer.length);
  };
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextAnswer(e.target.value);
  };
  
  const handleTextPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault(); // Запрещаем вставку из буфера обмена
  };
  
  const handleTextSubmit = () => {
    if (textAnswer.trim().length < 10) {
      alert('Ответ слишком короткий. Минимум 10 символов.');
      return;
    }
    
    const metrics = tracker.current.finish();
    
    if (!metrics.startTime || !onSubmitTextAnswer) {
      alert('Пожалуйста, введите ответ');
      return;
    }
    
    onSubmitTextAnswer({
      text_answer: textAnswer.trim(),
      typing_start_time: metrics.startTime.toISOString(),
      typing_end_time: metrics.endTime!.toISOString(),
      typing_metadata: JSON.stringify({
        pauses: metrics.pauses,
        corrections: metrics.corrections,
        timeline: metrics.timeline
      })
    });
    
    // Сбрасываем состояния
    setTextAnswer('');
    tracker.current.reset();
  };
  
  // Сброс при смене вопроса
  useEffect(() => {
    setTextAnswer('');
    tracker.current.reset();
  }, [question?.id]);
  
  // Определяем является ли вопрос текстовым
  const isTypingQuestion = question?.type === 'typing';

  return (
    <Box sx={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: isMobile ? 'visible' : 'hidden',
      maxWidth: '1200px',
      mx: 'auto',
      width: '100%',
      px: { xs: 0, sm: 2, md: 4 }
    }}>
      {/* Fixed Header - WhatsApp Style */}
      <Box sx={{
        p: isMobile ? 2 : 3,
        pb: isMobile ? 1 : 3,
        bgcolor: '#ffffff',
        borderBottom: '1px solid #e0e0e0',
        flexShrink: 0,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        {stepperComp}
        
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              bgcolor: '#25d366',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1
            }}>
              <Typography sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>
                🤖
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={600} sx={{ color: '#000' }}>
                <Trans>Интервью</Trans>
              </Typography>
              <Typography variant="caption" sx={{ color: '#666' }}>
                <Trans>AI-ассистент</Trans>
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {total && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ color: '#666', fontSize: '13px' }}>
                  <Trans>{getQuestionNumber(question.position)} из {total}</Trans>
                </Typography>
              </Box>
            )}
            
            {interviewProgress && canContinue && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ color: '#25d366', fontSize: '13px', fontWeight: 600 }}>
                  <Trans>Продолжение: {interviewProgress.current} из {interviewProgress.total}</Trans>
                </Typography>
              </Box>
            )}
            
            {timeLeft !== null && question?.maxTime && (
              <Box position="relative" display="inline-flex">
                <CircularProgress
                  variant="determinate"
                  value={(timeLeft / (question.maxTime || 1)) * 100}
                  size={32}
                  sx={{ color: '#25d366' }}
                />
                <Box sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Typography variant="caption" component="div" sx={{ color: '#666', fontSize: '10px' }}>
                    {timeLeft}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        {/* Progress Bar */}
        {total && (
          <LinearProgress
            variant="determinate"
            value={interviewProgress && canContinue
              ? interviewProgress.percentage
              : ((question.position + 1) / total) * 100
            }
            sx={{
              mb: 1,
              height: 3,
              borderRadius: 2,
              bgcolor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                bgcolor: '#25d366'
              }
            }}
          />
        )}
        
        {timeLeft !== null && (
          <Typography variant="caption" sx={{ color: '#666', fontSize: '11px' }}>
            <Trans>{timeLeft} сек</Trans>
          </Typography>
        )}

        {/* Interview Progress Notice */}
        {interviewProgress && canContinue && (
          <Box sx={{
            mt: 1,
            p: 2,
            bgcolor: '#e8f5e8',
            border: '1px solid #4caf50',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Box sx={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              bgcolor: '#4caf50',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              ✓
            </Box>
            <Typography variant="body2" sx={{ color: '#2e7d32', fontSize: '13px' }}>
              <Trans>Интервью продолжается с вопроса {interviewProgress.current} из {interviewProgress.total} ({interviewProgress.percentage}% завершено)</Trans>
            </Typography>
          </Box>
        )}
      </Box>

      {/* Chat Area - основной контент */}
      <Box ref={chatRef} sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: '#f0f2f5',
        position: 'relative'
      }}>
        <Box ref={chatScrollRef} sx={{
          maxHeight: '100%',
          overflowY: 'auto',
          p: isMobile ? 1.5 : 2
        }}>
          <Box>
            {messages.map((m, i) => (
              m.text === 'typing' ? (
                <Box key={i} sx={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  mb: 1
                }}>
                  <Box sx={{
                    maxWidth: '70%',
                    bgcolor: '#ffffff',
                    p: 2,
                    borderRadius: '18px 18px 18px 4px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    position: 'relative'
                  }}>
                    <Box component="span" sx={{
                      animation: `${blink} 1s infinite step-start`,
                      fontSize: '20px',
                      color: '#666'
                    }}>
                      •••
                    </Box>
                    <Typography sx={{
                      fontSize: '11px',
                      color: '#999',
                      textAlign: 'left',
                      mt: 0.5
                    }}>
                      {formatMessageTime(m.timestamp)}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box key={i} sx={{
                  display: 'flex',
                  justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
                  mb: 1
                }}>
                  <Box sx={{
                    maxWidth: '70%',
                    bgcolor: m.role === 'user' ? '#dcf8c6' : '#ffffff',
                    p: 2,
                    borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    position: 'relative',
                    wordBreak: 'break-word'
                  }}>
                    {/* Видео сообщение */}
                    {m.video && (
                      <Box sx={{ mb: 1, borderRadius: '8px', overflow: isMobile ? 'visible' : 'hidden' }}>
                        {m.video === "live" ? (
                          // Live-поток во время записи
                          <Box sx={{
                            width: '100%',
                            maxWidth: '280px',
                            height: '160px',
                            bgcolor: '#000',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: '14px',
                            position: 'relative',
                            overflow: isMobile ? 'visible' : 'hidden'
                          }}>
                            {/* Live-видео поток */}
                            {mediaStream ? (
                              <video
                                ref={chatVideoRef}
                                autoPlay
                                muted
                                playsInline
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  borderRadius: '8px'
                                }}
                              />
                            ) : (
                              // Fallback если поток не загрузился
                              <Box sx={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                gap: 1
                              }}>
                                <Typography sx={{ fontSize: '24px' }}>🎥</Typography>
                                <Typography sx={{ fontSize: '12px', opacity: 0.8 }}>
                                  <Trans>Подключение к камере...</Trans>
                                </Typography>
                              </Box>
                            )}
                            {/* Наложение с индикатором записи */}
                            <Box sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              bgcolor: 'rgba(255, 0, 0, 0.8)',
                              color: 'white',
                              px: 1,
                              py: 0.5,
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: 'bold',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              zIndex: 1
                            }}>
                              <Box sx={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                bgcolor: 'white',
                                animation: `${pulse} 1s infinite`
                              }} />
                              REC
                            </Box>
                          </Box>
                        ) : (
                          // Готовое видео
                          <video
                            controls
                            width="100%"
                            style={{
                              maxWidth: '280px',
                              borderRadius: '8px'
                            }}
                            src={m.video}
                          />
                        )}
                      </Box>
                    )}

                    <Typography sx={{
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.5,
                      color: m.role === 'user' ? '#2e7d32' : '#333'
                    }}>
                      {m.text}
                    </Typography>
                    {/* Время сообщения */}
                    <Typography sx={{
                      fontSize: '11px',
                      color: '#999',
                      textAlign: m.role === 'user' ? 'right' : 'left',
                      mt: 0.5
                    }}>
                      {formatMessageTime(m.timestamp)}
                    </Typography>
                  </Box>
                </Box>
              )
            ))}
          </Box>
        </Box>
      </Box>

      {/* Bottom Actions Area */}
      <Box sx={{
        flexShrink: 0,
        bgcolor: '#ffffff',
        borderTop: '1px solid #e0e0e0',
        p: isMobile ? 2 : 3,
        boxShadow: '0 -1px 3px rgba(0,0,0,0.1)',
        position: 'relative'
      }}>
        {/* Индикатор записи ПОВЕРХ кнопок */}
        {recording && (
          <Box sx={{
            position: 'absolute',
            top: -50,
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: 'rgba(255, 255, 255, 0.98)',
            px: 3,
            py: 1.5,
            borderRadius: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            zIndex: 10
          }}>
            <Box sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: '#ff4444',
              animation: `${pulse} 1s ease-in-out infinite`
            }} />
            <Typography sx={{
              fontSize: isMobile ? '14px' : '16px',
              fontWeight: 'bold',
              color: '#ff4444',
              letterSpacing: '0.5px'
            }}>
              {cameraEnabled
                ? <Trans>Идёт запись... Говорите в камеру</Trans>
                : <Trans>Идёт запись... Говорите в микрофон</Trans>
              }
            </Typography>
            <Box sx={{
              display: 'flex',
              gap: 0.5
            }}>
              {[0, 1, 2].map((i) => (
                <Box
                  key={i}
                  sx={{
                    width: 4,
                    height: 16,
                    bgcolor: '#ff4444',
                    borderRadius: '2px',
                    animation: `${pulse} 1s ease-in-out infinite`,
                    animationDelay: `${i * 0.15}s`
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* answer input */}
        <Box sx={{
          display: "flex",
          gap: 2,
          justifyContent: 'flex-start',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'center'
        }}>
          {isTypingQuestion ? (
            /* Текстовое поле для письменного ответа */
            <>
              <TextField
                multiline
                rows={3}
                fullWidth
                value={textAnswer}
                onChange={handleTextChange}
                onKeyDown={handleTextKeyDown}
                onPaste={handleTextPaste}
                placeholder="Введите ваш ответ..."
                disabled={loadingNextQuestion}
                sx={{ 
                  bgcolor: '#fff',
                  borderRadius: '12px',
                  '& .MuiInputBase-root': {
                    fontSize: '14px',
                    lineHeight: 1.5,
                  },
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#25d366',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#25d366',
                    }
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={handleTextSubmit}
                disabled={loadingNextQuestion || textAnswer.trim().length < 10}
                fullWidth={isMobile}
                size={isMobile ? 'large' : 'medium'}
                endIcon={<SendIcon />}
                sx={{
                  fontWeight: 600,
                  bgcolor: '#25d366',
                  '&:hover': {
                    bgcolor: '#128c7e',
                  },
                  '&:disabled': {
                    opacity: 0.6,
                    bgcolor: '#ccc',
                  },
                  borderRadius: '24px',
                  textTransform: 'none',
                  fontSize: '14px',
                  px: 3,
                  minWidth: isMobile ? 'auto' : '140px'
                }}
              >
                {loadingNextQuestion ? <Trans>Отправка...</Trans> : <Trans>Отправить</Trans>}
              </Button>
            </>
          ) : (
            /* Кнопки записи видео/аудио */
            <>
            {!recording && !recordedBlob ? (
            <>
              <Button
                variant="contained"
                onClick={onStartRecording}
                disabled={recording || loadingNextQuestion}
                fullWidth={isMobile}
                size={isMobile ? 'large' : 'medium'}
                sx={{
                  fontWeight: 600,
                  bgcolor: '#25d366',
                  '&:hover': {
                    bgcolor: '#128c7e',
                  },
                  '&:disabled': {
                    opacity: 0.6,
                    bgcolor: '#25d366',
                  },
                  borderRadius: '24px',
                  textTransform: 'none',
                  fontSize: '14px',
                  px: 3
                }}
              >
                {loadingNextQuestion ? <Trans>Обработка ответа...</Trans> : <Trans>🎤 Записать ответ</Trans>}
              </Button>
              <Button
                variant="outlined"
                onClick={onSkipQuestion}
                disabled={recording || loadingNextQuestion}
                color="primary"
                fullWidth={isMobile}
                size={isMobile ? 'large' : 'medium'}
                sx={{
                  borderColor: '#666',
                  color: '#666',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                    borderColor: '#333',
                    color: '#333',
                  },
                  '&:disabled': {
                    opacity: 0.6,
                  },
                  borderRadius: '24px',
                  textTransform: 'none',
                  fontSize: '14px',
                  px: 3
                }}
              >
                <Trans>⏭️ Пропустить</Trans>
              </Button>
            </>
          ) : recording ? (
            <Button
              variant="contained"
              color="error"
              onClick={onStopRecording}
              fullWidth={isMobile}
              size={isMobile ? 'large' : 'medium'}
              sx={{
                bgcolor: '#ff4444',
                '&:hover': {
                  bgcolor: '#cc0000',
                },
                borderRadius: '24px',
                textTransform: 'none',
                fontSize: '14px',
                px: 3
              }}
            >
              <Trans>⏹️ Остановить запись</Trans>
            </Button>
          ) : recordedBlob ? (
            <>
              <Button
                variant="contained"
                color="success"
                size={isMobile ? 'large' : 'medium'}
                onClick={onSubmitAnswer}
                disabled={loadingNextQuestion}
                fullWidth={isMobile}
                startIcon={loadingNextQuestion ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                sx={{
                  bgcolor: '#25d366',
                  '&:hover': {
                    bgcolor: '#128c7e',
                  },
                  '&:disabled': {
                    opacity: 0.6,
                  },
                  borderRadius: '24px',
                  textTransform: 'none',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  px: 3
                }}
              >
                {loadingNextQuestion ? <Trans>Отправка...</Trans> : <Trans>✓ Отправить ответ</Trans>}
              </Button>
              <Button
                variant="outlined"
                size={isMobile ? 'large' : 'medium'}
                onClick={onStartRecording}
                disabled={loadingNextQuestion}
                fullWidth={isMobile}
                sx={{
                  borderColor: '#666',
                  color: '#666',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                    borderColor: '#333',
                    color: '#333',
                  },
                  '&:disabled': {
                    opacity: 0.6,
                  },
                  borderRadius: '24px',
                  textTransform: 'none',
                  fontSize: '14px',
                  px: 3
                }}
              >
                <Trans>🔄 Переписать</Trans>
              </Button>
            </>
          ) : null}
          </>
          )}
        </Box>
      </Box>
    </Box>
  );
}

