import React, { useState, useCallback } from 'react';
import { Box, Button, Typography, Alert, Chip, Divider } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import InfoIcon from '@mui/icons-material/Info';

interface DeviceInfo {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
}

const MediaDevicesTester: React.FC = () => {
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [currentStream, setCurrentStream] = useState<MediaStream | null>(null);

  const addResult = useCallback((message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  }, []);

  const enumerateDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const deviceList = devices.map(device => ({
        deviceId: device.deviceId,
        label: device.label || `${device.kind} ${device.deviceId.slice(0, 8)}`,
        kind: device.kind
      }));
      
      setDevices(deviceList);
      addResult(`Найдено устройств: ${deviceList.length}`);
      
      const videoDevices = deviceList.filter(d => d.kind === 'videoinput');
      const audioDevices = deviceList.filter(d => d.kind === 'audioinput');
      
      addResult(`Камеры: ${videoDevices.length}, Микрофоны: ${audioDevices.length}`);
      
    } catch (error: any) {
      addResult(`Ошибка перечисления устройств: ${error.message}`);
    }
  }, [addResult]);

  const testConstraints = [
    { video: { width: 640, height: 480, facingMode: 'user' }, audio: true, name: 'Базовые настройки' },
    { video: { facingMode: 'user' }, audio: true, name: 'Минимальные настройки' },
    { video: true, audio: true, name: 'Любая камера' },
    { video: false, audio: true, name: 'Только аудио' }
  ];

  const runFullTest = useCallback(async () => {
    if (testing) return;
    
    setTesting(true);
    setResults([]);
    
    addResult('🔄 Начинаем полный тест устройств...');
    
    // Перечисляем устройства
    await enumerateDevices();
    
    // Тестируем различные constraints
    for (let i = 0; i < testConstraints.length; i++) {
      const constraint = testConstraints[i];
      addResult(`\n🔄 Тест ${i + 1}/${testConstraints.length}: ${constraint.name}`);
      
      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('TimeoutError')), 20000);
        });
        
        const gumPromise = navigator.mediaDevices.getUserMedia(constraint);
        
        const stream = await Promise.race([gumPromise, timeoutPromise]);
        
        const videoTracks = stream.getVideoTracks();
        const audioTracks = stream.getAudioTracks();
        
        addResult(`✅ Успех! Видео: ${videoTracks.length > 0 ? videoTracks[0].label : 'нет'}, Аудио: ${audioTracks.length > 0 ? audioTracks[0].label : 'нет'}`);
        
        // Останавливаем поток
        stream.getTracks().forEach(track => track.stop());
        
        // Если получили видео - прекращаем тестирование
        if (videoTracks.length > 0) {
          addResult('🎯 Видео найдено, останавливаем дальнейшие тесты');
          break;
        }
        
      } catch (error: any) {
        const errorName = error.name || 'UnknownError';
        addResult(`❌ ${constraint.name}: ${errorName} - ${error.message}`);
        
        // Ждем между попытками
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    addResult('\n🏁 Тестирование завершено');
    setTesting(false);
  }, [testing, addResult, enumerateDevices]);

  const stopTest = useCallback(() => {
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
      setCurrentStream(null);
    }
    setTesting(false);
    addResult('⏹️ Тестирование остановлено');
  }, [currentStream, addResult]);

  const clearResults = useCallback(() => {
    setResults([]);
    setDevices([]);
  }, []);

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Тестировщик медиа-устройств
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Этот компонент тестирует различные стратегии подключения к камере и микрофону, 
        используя логику BigBlueButton для обработки ошибок.
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<PlayArrowIcon />}
          onClick={runFullTest}
          disabled={testing}
        >
          {testing ? 'Тестирование...' : 'Запустить тест'}
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<StopIcon />}
          onClick={stopTest}
          disabled={!testing}
        >
          Остановить
        </Button>
        
        <Button
          variant="outlined"
          onClick={enumerateDevices}
          disabled={testing}
        >
          Перечислить устройства
        </Button>
        
        <Button
          variant="text"
          onClick={clearResults}
        >
          Очистить
        </Button>
      </Box>

      {devices.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Найденные устройства:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {devices.map((device, index) => (
              <Chip
                key={device.deviceId}
                label={`${device.kind === 'videoinput' ? '📹' : '🎤'} ${device.label}`}
                size="small"
                variant="outlined"
              />
            ))}
          </Box>
        </Box>
      )}

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom>
        Результаты тестирования:
      </Typography>
      
      {results.length === 0 ? (
        <Alert severity="info" icon={<InfoIcon />}>
          Результаты тестирования будут отображаться здесь
        </Alert>
      ) : (
        <Box sx={{
          bgcolor: '#000',
          color: '#0f0',
          p: 2,
          borderRadius: 1,
          fontFamily: 'monospace',
          fontSize: '12px',
          maxHeight: 400,
          overflow: 'auto',
          whiteSpace: 'pre-wrap'
        }}>
          {results.join('\n')}
        </Box>
      )}
    </Box>
  );
};

export default MediaDevicesTester; 