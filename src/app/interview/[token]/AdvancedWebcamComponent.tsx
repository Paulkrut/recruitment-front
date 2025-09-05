import React, { useRef, useCallback, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { Box, Typography, Button, Alert, CircularProgress, Chip } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningIcon from '@mui/icons-material/Warning';

interface AdvancedWebcamComponentProps {
  cameraEnabled: boolean;
  onCameraToggle: () => void;
  onStreamReady: (stream: MediaStream | null) => void;
  onMicLevelChange: (level: number) => void;
  onMicReady: (ready: boolean) => void;
  onError: (error: string) => void;
}

interface DeviceInfo {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
}

interface AttemptConstraints {
  video: boolean | MediaTrackConstraints;
  audio: boolean | MediaTrackConstraints;
  description: string;
}

// Точная копия функции promiseTimeout от BigBlueButton
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

const AdvancedWebcamComponent: React.FC<AdvancedWebcamComponentProps> = ({
  cameraEnabled,
  onCameraToggle,
  onStreamReady,
  onMicLevelChange,
  onMicReady,
  onError
}) => {
  const webcamRef = useRef<Webcam>(null);
  const [isReady, setIsReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [availableDevices, setAvailableDevices] = useState<DeviceInfo[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string>('');
  const [currentAttempt, setCurrentAttempt] = useState<number>(0);
  const [maxAttempts, setMaxAttempts] = useState<number>(0);
  const [lastError, setLastError] = useState<string>('');
  const [hasVideo, setHasVideo] = useState<boolean>(false);
  const [hasAudio, setHasAudio] = useState<boolean>(false);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);

  // Константы по примеру BigBlueButton
  const GUM_TIMEOUT = 20000; // 20 секунд timeout - точно как у BBB

  // Локализованные сообщения об ошибках (точная копия от BigBlueButton)
  const getLocalizedError = (error: any): string => {
    const errorName = error?.name || '';
    const errorMessage = error?.message || '';

    switch (errorName) {
      case 'NotAllowedError':
        return 'Отсутствует разрешение на использование веб-камеры. Проверьте настройки браузера.';
      case 'NotFoundError':
        return 'Не удалось найти веб-камеру. Убедитесь, что она подключена.';
      case 'NotReadableError':
        return 'Не удалось получить видео с веб-камеры. Убедитесь, что другая программа не использует камеру.';
      case 'OverconstrainedError':
        return 'Не найдено устройств-кандидатов, соответствующих запрошенным критериям.';
      case 'SecurityError':
        return 'Поддержка медиа отключена в документе.';
      case 'AbortError':
        return 'Возникла проблема, которая не позволила использовать устройство.';
      case 'TypeError':
        return 'Список указанных ограничений пуст или все ограничения установлены в false.';
      case 'TimeoutError':
        return 'Браузер не ответил вовремя.';
      default:
        return `Произошла неизвестная ошибка с устройством (Ошибка ${errorMessage || 'неизвестна'})`;
    }
  };

  // Перечисление доступных устройств (не блокируется ошибками gUM)
  const enumerateDevices = useCallback(async (): Promise<DeviceInfo[]> => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Камера ${device.deviceId.slice(0, 8)}`,
          kind: device.kind
        }));
      
      const audioDevices = devices
        .filter(device => device.kind === 'audioinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Микрофон ${device.deviceId.slice(0, 8)}`,
          kind: device.kind
        }));

      const allDevices = [...videoDevices, ...audioDevices];
      setAvailableDevices(allDevices);
      
      onError(`🔍 Найдено устройств: ${videoDevices.length} камер, ${audioDevices.length} микрофонов`);
      
      return allDevices;
    } catch (error) {
      console.warn('Не удалось перечислить устройства:', error);
      onError('⚠️ Не удалось получить список устройств');
      return [];
    }
  }, [onError]);

  // Создание различных стратегий получения медиа (улучшенная версия BBB)
  const createAttemptStrategies = useCallback((devices: DeviceInfo[]): AttemptConstraints[] => {
    const videoDevices = devices.filter(d => d.kind === 'videoinput');
    const strategies: AttemptConstraints[] = [];

    if (!cameraEnabled) {
      // Только аудио, если камера отключена
      strategies.push({
        video: false,
        audio: true,
        description: 'Только микрофон (камера отключена)'
      });
      return strategies;
    }

    // Стратегия 1: Базовые настройки (как у BBB)
    strategies.push({
      video: { 
        width: { ideal: 640 }, 
        height: { ideal: 480 }, 
        facingMode: 'user' 
      },
      audio: true,
      description: 'Базовые настройки (640x480, фронтальная)'
    });

    // Стратегия 2: Минимальные настройки видео
    strategies.push({
      video: { facingMode: 'user' },
      audio: true,
      description: 'Минимальные настройки (только фронтальная)'
    });

    // Стратегия 3: Любая камера без ограничений
    strategies.push({
      video: true,
      audio: true,
      description: 'Любая доступная камера'
    });

    // Стратегия 4: Конкретные устройства (если найдены)
    videoDevices.forEach((device, index) => {
      if (device.deviceId && device.deviceId !== 'default') {
        strategies.push({
          video: { deviceId: { exact: device.deviceId } },
          audio: true,
          description: `Конкретная камера: ${device.label}`
        });
      }
    });

    // Стратегия 5: Задняя камера (для мобильных)
    strategies.push({
      video: { facingMode: 'environment' },
      audio: true,
      description: 'Задняя камера (мобильные устройства)'
    });

    // Стратегия 6: Только аудио (fallback)
    strategies.push({
      video: false,
      audio: true,
      description: 'Только микрофон (fallback)'
    });

    return strategies;
  }, [cameraEnabled]);

  // Анализ аудио уровня
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

  // Основная функция инициализации (по точному примеру BigBlueButton)
  const initializeMedia = useCallback(async () => {
    if (isInitializing) return;
    
    setIsInitializing(true);
    setIsReady(false);
    onStreamReady(null);
    onMicReady(false);
    setHasVideo(false);
    setHasAudio(false);

    try {
      // Шаг 1: Перечислить устройства (это всегда работает, даже при ошибках gUM)
      onError('🔄 Поиск доступных устройств...');
      const devices = await enumerateDevices();
      
      // Шаг 2: Создать стратегии попыток
      const strategies = createAttemptStrategies(devices);
      setMaxAttempts(strategies.length);
      
      onError(`🔄 Начинаем ${strategies.length} попыток подключения...`);

      // Шаг 3: Пробуем каждую стратегию по очереди (точно как BBB)
      for (let i = 0; i < strategies.length; i++) {
        setCurrentAttempt(i + 1);
        const strategy = strategies[i];
        
        try {
          onError(`🔄 Попытка ${i + 1}/${strategies.length}: ${strategy.description}`);
          
          // КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: Используем promiseTimeout от BBB
          const gumPromise = navigator.mediaDevices.getUserMedia({
            video: strategy.video,
            audio: strategy.audio
          });
          
          const stream = await promiseTimeout(GUM_TIMEOUT, gumPromise) as MediaStream;

          // Успех! Анализируем что получили
          const videoTracks = stream.getVideoTracks();
          const audioTracks = stream.getAudioTracks();
          
          setHasVideo(videoTracks.length > 0);
          setHasAudio(audioTracks.length > 0);
          
          const videoInfo = videoTracks.length > 0 
            ? `${videoTracks[0].label || 'Неизвестная камера'}` 
            : 'нет';
          const audioInfo = audioTracks.length > 0 
            ? `${audioTracks[0].label || 'Неизвестный микрофон'}` 
            : 'нет';

          // Если нужно видео, но его нет, и это не последняя попытка - продолжаем
          // НО НЕ ОСТАНАВЛИВАЕМСЯ НА ПЕРВОЙ ОШИБКЕ (ключевое исправление BBB)
          if (cameraEnabled && videoTracks.length === 0 && i < strategies.length - 2) {
            onError(`⚠️ Видео: ${videoInfo}, Аудио: ${audioInfo} - ищем видео в следующих попытках...`);
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
          onError(`✅ Успех! Видео: ${videoInfo}, Аудио: ${audioInfo}`);
          
          return;

        } catch (error: any) {
          const localizedError = getLocalizedError(error);
          setLastError(localizedError);
          
          onError(`❌ Попытка ${i + 1} неудачна: ${localizedError}`);
          
          // НЕ ОСТАНАВЛИВАЕМСЯ - продолжаем со следующей стратегией (как BBB)
          console.warn(`Attempt ${i + 1} failed:`, error);
        }
      }

      // Все попытки неудачны
      onError(`❌ Все ${strategies.length} попыток неудачны. Последняя ошибка: ${lastError}`);
      
    } catch (error: any) {
      const localizedError = getLocalizedError(error);
      setLastError(localizedError);
      onError(`❌ Критическая ошибка: ${localizedError}`);
    } finally {
      setIsInitializing(false);
    }
  }, [
    isInitializing, cameraEnabled, enumerateDevices, createAttemptStrategies, 
    setupAudioAnalysis, onStreamReady, onMicReady, onError, lastError
  ]);

  // Принудительный перезапуск
  const forceRestart = useCallback(() => {
    // Останавливаем текущий поток
    if (webcamRef.current?.stream) {
      webcamRef.current.stream.getTracks().forEach(track => track.stop());
    }
    
    // Очищаем анализ аудио
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    analyserRef.current = null;
    
    // Перезапускаем
    setTimeout(() => {
      initializeMedia();
    }, 500);
  }, [initializeMedia]);

  // Инициализация при монтировании и изменении cameraEnabled
  useEffect(() => {
    initializeMedia();
    
    return () => {
      // Cleanup
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [cameraEnabled]);

  // Обработка успешного подключения react-webcam (дополнительная проверка)
  const handleUserMedia = useCallback((stream: MediaStream) => {
    console.log('✅ React-webcam connected successfully');
    // Если react-webcam подключился быстрее нашей логики
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

  // Обработка ошибок react-webcam
  const handleUserMediaError = useCallback((error: string | DOMException) => {
    console.error('❌ React-webcam error:', error);
    // Эта ошибка уже обработана нашей продвинутой логикой
  }, []);

  // Получение потока для записи
  const getStream = useCallback(() => {
    if (webcamRef.current && webcamRef.current.stream) {
      return webcamRef.current.stream;
    }
    return null;
  }, []);

  // Экспортируем функцию получения потока
  useEffect(() => {
    (window as any).getWebcamStream = getStream;
  }, [getStream]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      {/* Информация о процессе инициализации */}
      {isInitializing && (
        <Alert 
          severity="info" 
          icon={<CircularProgress size={20} />}
          sx={{ width: '100%', maxWidth: 600 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">
              Подключение устройств... ({currentAttempt}/{maxAttempts})
            </Typography>
          </Box>
        </Alert>
      )}

      {/* Информация о доступных устройствах */}
      {availableDevices.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
          {availableDevices.filter(d => d.kind === 'videoinput').map((device, index) => (
            <Chip 
              key={device.deviceId}
              size="small"
              icon={<VideocamIcon />}
              label={device.label}
              variant={currentDeviceId === device.deviceId ? "filled" : "outlined"}
            />
          ))}
          {availableDevices.filter(d => d.kind === 'audioinput').map((device, index) => (
            <Chip 
              key={device.deviceId}
              size="small"
              icon={<MicIcon />}
              label={device.label}
              variant="outlined"
            />
          ))}
        </Box>
      )}

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
                <CircularProgress sx={{ color: 'white', mb: 2 }} />
                <Typography variant="h6" sx={{ opacity: 0.7 }}>
                  Подключение устройств...
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.5, mt: 1 }}>
                  Попытка {currentAttempt}/{maxAttempts}
                </Typography>
              </>
            ) : !cameraEnabled ? (
              <>
                <VideocamOffIcon sx={{ fontSize: 64, mb: 2, opacity: 0.7 }} />
                <Typography variant="h6" sx={{ opacity: 0.7 }}>
                  Камера отключена
                </Typography>
              </>
            ) : (
              <>
                <WarningIcon sx={{ fontSize: 64, mb: 2, opacity: 0.7 }} />
                <Typography variant="h6" sx={{ opacity: 0.7, textAlign: 'center' }}>
                  Камера недоступна
                </Typography>
                <Button 
                  startIcon={<RefreshIcon />}
                  onClick={forceRestart}
                  sx={{ mt: 2, color: 'white', borderColor: 'white' }}
                  variant="outlined"
                  size="small"
                >
                  Попробовать снова
                </Button>
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
              onClick={forceRestart}
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

      {/* Детальный статус устройств */}
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
              ? (hasVideo ? 'Камера подключена' : (isInitializing ? 'Подключение камеры...' : 'Камера недоступна'))
              : 'Камера отключена'
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
            {hasAudio ? 'Микрофон подключен' : (isInitializing ? 'Подключение микрофона...' : 'Микрофон недоступен')}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default AdvancedWebcamComponent; 