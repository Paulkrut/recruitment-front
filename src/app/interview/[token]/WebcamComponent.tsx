'use client';

import React, { useRef, useCallback, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { Box, Typography, Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';

import { useLingui } from '@lingui/react';
import { msg, Trans } from '@lingui/macro';



interface WebcamComponentProps {
  cameraEnabled: boolean;
  onCameraToggle: () => void;
  onStreamReady: (stream: MediaStream | null) => void;
  onMicReady: (ready: boolean) => void;
  onError: (error: string) => void;
}

const WebcamComponent: React.FC<WebcamComponentProps> = ({
  cameraEnabled,
  onCameraToggle,
  onStreamReady,
  onMicReady,
  onError
}) => {
  const { _ } = useLingui();

  const webcamRef = useRef<Webcam>(null);
  const [isReady, setIsReady] = useState(false);

  // Настройки для веб-камеры
  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: 'user'
  };

  // Обработка успешного подключения камеры
  const handleUserMedia = useCallback((stream: MediaStream) => {
    console.log('✅ Webcam connected successfully');
    setIsReady(true);
    onStreamReady(stream);
    
    // Проверяем наличие аудио трека
    const hasAudio = stream.getAudioTracks().length > 0;
    onMicReady(hasAudio);
    
    onError(_(msg`✅ Камера и микрофон подключены успешно!`));
  }, [onStreamReady, onMicReady, onError]);

  // Обработка ошибок
  const handleUserMediaError = useCallback((error: string | DOMException) => {
    console.error('❌ Webcam error:', error);
    setIsReady(false);
    onStreamReady(null);
    onMicReady(false);
    
    const errorMessage = typeof error === 'string' ? error : error.message;
    onError(_(msg`❌ Ошибка камеры: ${errorMessage}`));
  }, [onStreamReady, onMicReady, onError]);

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
        {cameraEnabled ? (
          <Webcam
            ref={webcamRef}
            audio={true}
            width="100%"
            height="100%"
            videoConstraints={videoConstraints}
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
            <VideocamOffIcon sx={{ fontSize: 64, mb: 2, opacity: 0.7 }} />
            <Typography variant="h6" sx={{ opacity: 0.7 }}><Trans>Камера отключена</Trans></Typography>
          </Box>
        )}

        {/* Кнопка переключения камеры */}
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
        </Box>
      </Box>

      {/* Статус подключения */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {cameraEnabled ? (
            <VideocamIcon color={isReady ? "success" : "error"} />
          ) : (
            <VideocamOffIcon sx={{ color: 'warning.main' }} />
          )}
          <Typography variant="body2" sx={{ fontSize: '14px' }}>
            {cameraEnabled
              ? (isReady ? _(msg`Камера подключена`) : _(msg`Подключение камеры...`))
              : _(msg`Камера отключена`)
            }
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MicIcon color={isReady ? "success" : "error"} />
          <Typography variant="body2" sx={{ fontSize: '14px' }}>
            {isReady ? _(msg`Микрофон подключен`) : _(msg`Подключение микрофона...`)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default WebcamComponent; 