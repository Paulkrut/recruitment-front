"use client";

/**
 * ActiveInterviewScreen - компонент активного интервью с AI
 * 
 * Это основной экран где кандидат отвечает на вопросы в режиме реального времени.
 * Включает чат, вебкамеру, управление записью, таймеры.
 */

import { RefObject } from "react";
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
import { keyframes } from "@mui/system";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import VideocamIcon from "@mui/icons-material/Videocam";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import CheckIcon from "@mui/icons-material/Check";
import PauseIcon from "@mui/icons-material/PauseCircleOutline";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ProductionWebcamComponent from "./ProductionWebcamComponent";

interface ActiveInterviewScreenProps {
  question: any;
  total: number;
  timeLeft: number | null;
  paused: boolean;
  recording: boolean;
  recordedBlob: Blob | null;
  messages: any[];
  userInputText: string;
  isMobile: boolean;
  cameraEnabled: boolean;
  mediaStream: MediaStream | null;
  interviewProgress: any;
  canContinue: boolean;
  stepperComp?: React.ReactNode;
  chatRef: RefObject<HTMLDivElement>;
  chatScrollRef: RefObject<HTMLDivElement>;
  
  // Handlers
  onStartRecording: () => void;
  onStopRecording: () => void;
  onSubmitAnswer: () => void;
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
  stepperComp,
  chatRef,
  chatScrollRef,
  onStartRecording,
  onStopRecording,
  onSubmitAnswer,
  onSkipQuestion,
  onPauseInterview,
  onUserInputChange,
  onCameraToggle,
  onStreamReady,
  onRecordingComplete,
  getQuestionNumber,
  formatMessageTime,
}: ActiveInterviewScreenProps) {
  
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
            
            {paused && <PauseIcon sx={{ color: '#666', fontSize: '20px' }} />}
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
            {messages.map((msg, idx) => {
              const isLastAnswer = msg.type === 'answer' && idx === messages.length - 1;
              const showCameraToggle = isLastAnswer && !mediaStream;
              
              return (
                <Box
                  key={idx}
                  sx={{
                    mb: isMobile ? 1 : 1.5,
                    display: 'flex',
                    justifyContent: msg.type === 'question' ? 'flex-start' : 'flex-end',
                    animation: isLastAnswer ? `${fadeOutSlide} 0.5s ease-in-out forwards` : 'none',
                    animationDelay: isLastAnswer ? '1s' : '0s'
                  }}
                >
                  {msg.type === 'question' ? (
                    <Box sx={{ maxWidth: '85%', minWidth: isMobile ? '60%' : 'auto' }}>
                      <Box sx={{
                        bgcolor: '#ffffff',
                        borderRadius: '12px',
                        p: isMobile ? 1.5 : 2,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      }}>
                        <Typography variant="body1" sx={{ fontSize: isMobile ? '14px' : '15px', mb: 0.5 }}>
                          {msg.text}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#667781', fontSize: '11px', display: 'block', textAlign: 'left' }}>
                          {formatMessageTime(msg.timestamp)}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{
                      maxWidth: '85%',
                      bgcolor: '#dcf8c6',
                      borderRadius: '12px',
                      p: isMobile ? 1.5 : 2,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      position: 'relative'
                    }}>
                      {msg.videoUrl ? (
                        <video
                          src={msg.videoUrl}
                          controls
                          style={{
                            width: '100%',
                            maxWidth: '300px',
                            borderRadius: '8px',
                            marginBottom: '8px'
                          }}
                        />
                      ) : msg.audioUrl ? (
                        <audio
                          src={msg.audioUrl}
                          controls
                          style={{
                            width: '100%',
                            marginBottom: '8px'
                          }}
                        />
                      ) : null}
                      
                      {msg.text && (
                        <Typography variant="body1" sx={{ fontSize: isMobile ? '14px' : '15px', mb: 0.5 }}>
                          {msg.text}
                        </Typography>
                      )}
                      
                      <Typography variant="caption" sx={{ color: '#667781', fontSize: '11px', display: 'block', textAlign: 'right' }}>
                        {formatMessageTime(msg.timestamp)}
                      </Typography>

                      {showCameraToggle && (
                        <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                          <Button
                            size="small"
                            startIcon={cameraEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
                            onClick={() => onCameraToggle(!cameraEnabled)}
                            sx={{ fontSize: '12px' }}
                          >
                            {cameraEnabled ? <Trans>Отключить камеру</Trans> : <Trans>Включить камеру</Trans>}
                          </Button>
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>

      {/* Bottom Actions Area */}
      <Box sx={{
        flexShrink: 0,
        bgcolor: '#ffffff',
        borderTop: '1px solid #e0e0e0',
        p: isMobile ? 1.5 : 2,
        boxShadow: '0 -2px 8px rgba(0,0,0,0.05)'
      }}>
        {/* Webcam - если включена камера */}
        {cameraEnabled && (
          <Box sx={{ mb: 2 }}>
            <ProductionWebcamComponent
              cameraEnabled={cameraEnabled}
              onCameraToggle={() => onCameraToggle(!cameraEnabled)}
              onStreamReady={onStreamReady}
              onMicLevelChange={() => {}}
              onMicReady={() => {}}
              onError={() => {}}
            />cc
          </Box>
        )}

        {/* Recording Controls */}
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          alignItems: 'center'
        }}>
          {!recording && !recordedBlob ? (
            <Button
              variant="contained"
              onClick={onStartRecording}
              disabled={paused}
              fullWidth
              size={isMobile ? 'medium' : 'large'}
              sx={{
                bgcolor: '#25d366',
                '&:hover': { bgcolor: '#128c7e' },
                borderRadius: '24px',
                py: 1.5,
                fontSize: isMobile ? '14px' : '16px',
                fontWeight: 600
              }}
              startIcon={<MicIcon />}
            >
              <Trans>🎤 Начать ответ</Trans>
            </Button>
          ) : recording ? (
            <Button
              variant="contained"
              onClick={onStopRecording}
              fullWidth
              size={isMobile ? 'medium' : 'large'}
              sx={{
                bgcolor: '#f44336',
                '&:hover': { bgcolor: '#d32f2f' },
                borderRadius: '24px',
                py: 1.5,
                fontSize: isMobile ? '14px' : '16px',
                fontWeight: 600,
                animation: `${pulse} 1.5s ease-in-out infinite`
              }}
              startIcon={<MicOffIcon />}
            >
              <Trans>⏹️ Остановить запись</Trans>
            </Button>
          ) : recordedBlob ? (
            <>
              <Button
                variant="contained"
                onClick={onSubmitAnswer}
                fullWidth
                size={isMobile ? 'medium' : 'large'}
                sx={{
                  bgcolor: '#25d366',
                  '&:hover': { bgcolor: '#128c7e' },
                  borderRadius: '24px',
                  py: 1.5,
                  fontSize: isMobile ? '14px' : '16px',
                  fontWeight: 600
                }}
                startIcon={<CheckIcon />}
              >
                <Trans>✅ Отправить ответ</Trans>
              </Button>
              <Button
                variant="outlined"
                onClick={onStartRecording}
                fullWidth
                size="small"
                sx={{ borderRadius: '20px' }}
              >
                <Trans>🔄 Записать заново</Trans>
              </Button>
            </>
          ) : null}

          {/* Skip/Pause Buttons */}
          <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
            <Button
              variant="outlined"
              onClick={onSkipQuestion}
              size="small"
              fullWidth
              sx={{
                borderRadius: '20px',
                fontSize: '12px',
                borderColor: '#ff9800',
                color: '#ff9800',
                '&:hover': {
                  bgcolor: '#fff3e0',
                  borderColor: '#f57c00'
                }
              }}
            >
              <Trans>⏭️ Пропустить</Trans>
            </Button>
            <Button
              variant="outlined"
              onClick={onPauseInterview}
              size="small"
              fullWidth
              disabled={paused}
              sx={{
                borderRadius: '20px',
                fontSize: '12px'
              }}
            >
              <Trans>⏸️ Пауза</Trans>
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

