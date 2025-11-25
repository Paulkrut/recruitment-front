'use client';

import React, { useRef, useCallback, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { Box, Typography, Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningIcon from '@mui/icons-material/Warning';

import { useLingui } from '@lingui/react';
import { msg, Trans } from '@lingui/macro';



interface ProductionWebcamComponentProps {
  cameraEnabled: boolean;
  onCameraToggle: () => void;
  onStreamReady: (stream: MediaStream | null) => void;
  onMicLevelChange: (level: number) => void;
  onMicReady: (ready: boolean) => void;
  onError: (error: string) => void;
}

interface AttemptStrategy {
  video: boolean | MediaTrackConstraints;
  audio: boolean | MediaTrackConstraints;
  description: string;
}

// Timeout функция от BigBlueButton (оставляем)
const promiseTimeout = (ms: number, promise: Promise<any>) => {
  const timeout = new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      const error = {
        name: 'TimeoutError',
        message: 'Promise did not return',
      };
      reject(error);
    }, ms);
  });

  return Promise.race([promise, timeout]);
};

const ProductionWebcamComponent: React.FC<ProductionWebcamComponentProps> = ({
  cameraEnabled,
  onCameraToggle,
  onStreamReady,
  onMicLevelChange,
  onMicReady,
  onError
}) => {
  const { _ } = useLingui();
  const webcamRef = useRef<Webcam>(null);
  const [isReady, setIsReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [hasVideo, setHasVideo] = useState<boolean>(false);
  const [hasAudio, setHasAudio] = useState<boolean>(false);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);

  // Production константы
  const GUM_TIMEOUT = 20000; // 20 секунд как у BigBlueButton

  // Локализованные ошибки (оставляем)
  const getLocalizedError = (error: any): string => {
    const errorName = error?.name || '';

    switch (errorName) {
      case 'NotAllowedError':
        return _(msg`Доступ к камере запрещен. Разрешите доступ в настройках браузера.`);
      case 'NotFoundError':
        return _(msg`Камера не найдена. Проверьте подключение камеры.`);
      case 'NotReadableError':
        return _(msg`Камера занята другим приложением. Закройте все приложения, которые могут её использовать.`);
      case 'OverconstrainedError':
        return _(msg`Настройки камеры не поддерживаются.`);
      case 'TimeoutError':
        return _(msg`Превышено время ожидания подключения камеры.`);
      default:
        const errorMessage = error?.message || _(msg`неизвестная ошибка`);
        return _(msg`Ошибка подключения камеры: ${errorMessage}`);
    }
  };

  // Простые стратегии подключения (оставляем оптимальные)
  const createStrategies = useCallback((): AttemptStrategy[] => {
    if (!cameraEnabled) {
      return [{
        video: false,
        audio: true,
        description: _(msg`Только микрофон`)
      }];
    }

    return [
      // 1. Оптимальные настройки
      {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: true,
        description: _(msg`Стандартные настройки`)
      },
      // 2. Минимальные настройки
      {
        video: { facingMode: 'user' },
        audio: true,
        description: _(msg`Упрощенные настройки`)
      },
      // 3. Любая камера
      {
        video: true,
        audio: true,
        description: _(msg`Любая камера`)
      },
      // 4. Fallback - только аудио
      {
        video: false,
        audio: true,
        description: _(msg`Только микрофон`)
      }
    ];
  }, [cameraEnabled]);

  // Анализ аудио (оставляем)
  const setupAudioAnalysis = useCallback((stream: MediaStream) => {
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();

      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevel = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        const normalizedLevel = Math.min(100, (average / 128) * 100);

        onMicLevelChange(normalizedLevel);
        rafRef.current = requestAnimationFrame(updateLevel);
      };

      updateLevel();
    } catch (error) {
      console.warn('Не удалось настроить анализ аудио:', error);
    }
  }, [onMicLevelChange]);

  // Основная функция инициализации (упрощенная)
  const initializeMedia = useCallback(async () => {
    if (isInitializing) return;

    setIsInitializing(true);
    setIsReady(false);
    onStreamReady(null);
    onMicReady(false);
    setHasVideo(false);
    setHasAudio(false);

    try {
      const strategies = createStrategies();
      onError(_(msg`🔄 Подключение к камере и микрофону...`));

      // Пробуем стратегии по очереди
      for (let i = 0; i < strategies.length; i++) {
        const strategy = strategies[i];

        try {
          const gumPromise = navigator.mediaDevices.getUserMedia({
            video: strategy.video,
            audio: strategy.audio
          });

          const stream = await promiseTimeout(GUM_TIMEOUT, gumPromise) as MediaStream;

          const videoTracks = stream.getVideoTracks();
          const audioTracks = stream.getAudioTracks();

          setHasVideo(videoTracks.length > 0);
          setHasAudio(audioTracks.length > 0);

          // Если нужно видео, но его нет - пробуем дальше
          if (cameraEnabled && videoTracks.length === 0 && i < strategies.length - 1) {
            stream.getTracks().forEach(track => track.stop());
            continue;
          }

          // Настраиваем анализ аудио
          if (audioTracks.length > 0) {
            setupAudioAnalysis(stream);
          }

          // Успех!
          setIsReady(true);
          onStreamReady(stream);
          onMicReady(audioTracks.length > 0);

          const status = videoTracks.length > 0 && audioTracks.length > 0
            ? _(msg`✅ Камера и микрофон подключены`)
            : videoTracks.length > 0
            ? _(msg`✅ Камера подключена`)
            : _(msg`✅ Продолжаем только с микрофоном`);

          onError(status);
          return;

        } catch (error: any) {
          const localizedError = getLocalizedError(error);
          console.warn(`Strategy ${i + 1} failed:`, error);

          // Показываем ошибку только если это последняя попытка
          if (i === strategies.length - 1) {
            onError(`❌ ${localizedError}`);
          }
        }
      }

    } catch (error: any) {
      const localizedError = getLocalizedError(error);
      onError(`❌ ${localizedError}`);
    } finally {
      setIsInitializing(false);
    }
  }, [
    isInitializing, cameraEnabled, createStrategies,
    setupAudioAnalysis, onStreamReady, onMicReady, onError
  ]);

  // Перезапуск
  const handleRestart = useCallback(() => {
    if (webcamRef.current?.stream) {
      webcamRef.current.stream.getTracks().forEach(track => track.stop());
    }

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    analyserRef.current = null;

    setTimeout(() => {
      initializeMedia();
    }, 500);
  }, [initializeMedia]);

  // Инициализация
  useEffect(() => {
    initializeMedia();

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [cameraEnabled]);

  // Обработчики react-webcam
  const handleUserMedia = useCallback((stream: MediaStream) => {
    if (!isReady) {
      const videoTracks = stream.getVideoTracks();
      const audioTracks = stream.getAudioTracks();

      setHasVideo(videoTracks.length > 0);
      setHasAudio(audioTracks.length > 0);
      setIsReady(true);

      if (audioTracks.length > 0) {
        setupAudioAnalysis(stream);
      }

      onStreamReady(stream);
      onMicReady(audioTracks.length > 0);
    }
  }, [isReady, setupAudioAnalysis, onStreamReady, onMicReady]);

  const handleUserMediaError = useCallback((error: string | DOMException) => {
    console.error('React-webcam error:', error);
  }, []);

  // Экспорт функции получения потока
  const getStream = useCallback(() => {
    return webcamRef.current?.stream || null;
  }, []);

  useEffect(() => {
    (window as any).getWebcamStream = getStream;
  }, [getStream]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      {/* Превью камеры */}
      <Box sx={{
        position: 'relative',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        bgcolor: '#000',
        width: { xs: '100%', sm: '480px', md: '560px' },
        height: { xs: '240px', sm: '360px', md: '420px' },
        maxWidth: '90vw'
      }}>
        {cameraEnabled && hasVideo ? (
          <Webcam
            ref={webcamRef}
            audio={true}
            width="100%"
            height="100%"
            videoConstraints={{
              width: { ideal: 640 },
              height: { ideal: 480 },
              facingMode: 'user'
            }}
            onUserMedia={handleUserMedia}
            onUserMediaError={handleUserMediaError}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        ) : (
          <Box sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            {isInitializing ? (
              <>
                <Box sx={{
                  width: 40,
                  height: 40,
                  border: '3px solid rgba(255,255,255,0.3)',
                  borderTop: '3px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  mb: 2,
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                  }
                }} />
                {/* Убираем текст 'Подключение...' */}
              </>
            ) : !cameraEnabled ? (
              <>
                <VideocamOffIcon sx={{ fontSize: 64, mb: 2, opacity: 0.7 }} />
                {/* Убираем текст 'Камера отключена' */}
              </>
            ) : (
              <>
                <WarningIcon sx={{ fontSize: 64, mb: 2, opacity: 0.7 }} />
                {/* Убираем текст 'Камера недоступна' */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                  <Button
                    startIcon={<RefreshIcon />}
                    onClick={handleRestart}
                    sx={{ color: 'white', borderColor: 'white' }}
                    variant="outlined"
                    size="small"
                  >
                    <Trans>Попробовать снова</Trans>
                  </Button>
                  <Button
                    startIcon={<MicIcon />}
                    onClick={onCameraToggle}
                    sx={{ color: 'white', borderColor: 'white' }}
                    variant="outlined"
                    size="small"
                  >
                    <Trans>Продолжить с микрофоном</Trans>
                  </Button>
                </Box>
              </>
            )}
          </Box>
        )}

        {/* Кнопки управления */}
        <Box sx={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          display: 'flex',
          gap: 1
        }}>
          <Box
            onClick={onCameraToggle}
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              bgcolor: cameraEnabled ? 'rgba(255,255,255,0.1)' : '#ea4335',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.2)',
              '&:hover': {
                bgcolor: cameraEnabled ? 'rgba(255,255,255,0.2)' : '#d93025'
              }
            }}
          >
            {cameraEnabled ? (
              <VideocamIcon sx={{ color: 'white' }} />
            ) : (
              <VideocamOffIcon sx={{ color: 'white' }} />
            )}
          </Box>

          {!isInitializing && (
            <Box
              onClick={handleRestart}
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.2)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.2)'
                }
              }}
            >
              <RefreshIcon sx={{ color: 'white' }} />
            </Box>
          )}
        </Box>
      </Box>

      {/* Статус устройств */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {cameraEnabled ? (
            hasVideo ? (
              <VideocamIcon color="success" />
            ) : (
              <VideocamOffIcon color="error" />
            )
          ) : (
            <VideocamOffIcon sx={{ color: 'warning.main' }} />
          )}
          <Typography variant="body2" sx={{ fontSize: '14px' }}>
            {cameraEnabled
              ? (hasVideo ? _(msg`Камера подключена`) : (isInitializing ? _(msg`Подключение камеры...`) : _(msg`Камера недоступна`)))
              : _(msg`Камера отключена`)
            }
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {hasAudio ? (
            <MicIcon color="success" />
          ) : (
            <MicOffIcon color="error" />
          )}
          <Typography variant="body2" sx={{ fontSize: '14px' }}>
            {hasAudio ? _(msg`Микрофон подключен`) : (isInitializing ? _(msg`Подключение микрофона...`) : _(msg`Микрофон недоступен`))}
          </Typography>
        </Box>

        {/* Информация о пользе камеры для интервью */}
        {!cameraEnabled && hasAudio && (
          <Box sx={{
            mt: 2,
            p: 2,
            bgcolor: '#e3f2fd',
            borderRadius: 2,
            border: '1px solid #2196f3',
            maxWidth: '400px',
            textAlign: 'center'
          }}>
            <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 500, mb: 1 }}><Trans>💡 Рекомендация</Trans></Typography>
            <Typography variant="body2" sx={{ color: '#1565c0', fontSize: '13px', lineHeight: 1.4 }}><Trans>Отключение камеры не влияет на возможность прохождения интервью и оценку по обязательным критериям.
              Видео помогает HR лучше увидеть коммуникативные навыки. Видео и аудио не используются для установления личности; биометрические шаблоны не формируются.</Trans></Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ProductionWebcamComponent;
