'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Box, IconButton, Slider, Typography, CircularProgress, Tooltip, LinearProgress
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  GetApp as DownloadIcon,
  ErrorOutline as ErrorIcon,
  VolumeUp as VolumeIcon,
  VolumeOff as MuteIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material';
import Link from "next/link";

interface AudioPlayerProps {
  src: string;
  filename?: string;
  mimeType?: string;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, filename = 'audio', mimeType }) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorDetail, setErrorDetail] = useState('');
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(src, '_blank');
    } finally {
      setIsDownloading(false);
    }
  }, [src, filename]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onCanPlay = () => { setIsLoading(false); setCanPlay(true); setHasError(false); };
    const onLoadedMetadata = () => { setDuration(audio.duration); };
    const onTimeUpdate = () => { setCurrentTime(audio.currentTime); };
    const onEnded = () => { setIsPlaying(false); setCurrentTime(0); };
    const onWaiting = () => { setIsLoading(true); };
    const onPlaying = () => { setIsLoading(false); };
    const onError = () => {
      setIsLoading(false);
      setHasError(true);
      const err = audio.error;
      const messages: Record<number, string> = {
        1: 'Загрузка прервана',
        2: 'Сетевая ошибка',
        3: 'Ошибка декодирования',
        4: 'Формат не поддерживается браузером',
      };
      setErrorDetail(err ? (messages[err.code] ?? `Ошибка ${err.code}`) : 'Неизвестная ошибка');
    };

    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('error', onError);
    };
  }, [src]);

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || hasError) return;
    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (e: any) {
      setHasError(true);
      setErrorDetail(e?.message ?? 'Не удалось воспроизвести');
    }
  }, [isPlaying, hasError]);

  const handleSeek = useCallback((_: Event, value: number | number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    const t = value as number;
    audio.currentTime = t;
    setCurrentTime(t);
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const next = !isMuted;
    audio.muted = next;
    setIsMuted(next);
  }, [isMuted]);

  const handleVolume = useCallback((_: Event, value: number | number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    const v = value as number;
    audio.volume = v;
    setVolume(v);
    if (v > 0 && isMuted) {
      audio.muted = false;
      setIsMuted(false);
    }
  }, [isMuted]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
      <>
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        p: 1.5,
        borderRadius: 2,
        bgcolor: 'grey.100',
        border: '1px solid',
        borderColor: hasError ? 'error.light' : 'grey.300',
        width: '100%',
        maxWidth: '320px',
        minWidth: '240px',
      }}
    >
      {/* Скрытый audio элемент */}
      <audio ref={audioRef} preload="metadata" style={{ display: 'none' }}>
        <source src={src} type={mimeType} />
      </audio>

      {/* Верхняя строка: play + время + скачать */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Play / Pause / Loading / Error */}
        <IconButton
          size="small"
          onClick={hasError ? undefined : togglePlay}
          disabled={isLoading && !canPlay}
          sx={{
            bgcolor: hasError ? 'error.main' : 'primary.main',
            color: 'white',
            width: 44,
            height: 44,
            flexShrink: 0,
            '&:hover': { bgcolor: hasError ? 'error.dark' : 'primary.dark' },
            '&.Mui-disabled': { bgcolor: 'grey.400', color: 'white' },
          }}
        >
          {isLoading && !canPlay ? (
            <CircularProgress size={18} sx={{ color: 'white' }} />
          ) : hasError ? (
            <Tooltip title={errorDetail}>
              <ErrorIcon fontSize="small" />
            </Tooltip>
          ) : isPlaying ? (
            <PauseIcon fontSize="medium" />
          ) : (
            <PlayIcon fontSize="medium" />
          )}
        </IconButton>

        {/* Прогресс-бар */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {hasError ? (
            <Typography variant="caption" color="error" sx={{ fontSize: '11px' }}>
              {errorDetail}
            </Typography>
          ) : (
            <Slider
              size="small"
              value={currentTime}
              min={0}
              max={duration || 100}
              onChange={handleSeek}
              disabled={!canPlay}
              sx={{
                py: 0,
                '& .MuiSlider-thumb': { width: 12, height: 12 },
                '& .MuiSlider-track': { height: 3 },
                '& .MuiSlider-rail': { height: 3 },
              }}
            />
          )}
        </Box>

        {/* Время */}
        <Typography
          variant="caption"
          sx={{ fontSize: '11px', color: 'text.secondary', flexShrink: 0, minWidth: 36 }}
        >
          {formatTime(currentTime)}{duration > 0 ? ` / ${formatTime(duration)}` : ''}
        </Typography>

        {/* Скачать */}
        <Tooltip title="Скачать файл">
          <IconButton size="small" onClick={handleDownload} disabled={isDownloading} sx={{ flexShrink: 0 }}>
            {isDownloading ? <CircularProgress size={16} /> : <DownloadIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Нижняя строка: громкость справа */}
      {canPlay && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
          {isLoading && canPlay && (
            <LinearProgress sx={{ flex: 1, height: 2, borderRadius: 1 }} />
          )}
          <IconButton size="small" onClick={toggleMute} sx={{ p: 0 }}>
            {isMuted || volume === 0 ? (
              <MuteIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            ) : (
              <VolumeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            )}
          </IconButton>
          <Slider
            size="small"
            value={isMuted ? 0 : volume}
            min={0}
            max={1}
            step={0.05}
            onChange={handleVolume}
            sx={{
              maxWidth: 80,
              py: 0,
              '& .MuiSlider-thumb': { width: 10, height: 10 },
              '& .MuiSlider-track': { height: 2 },
              '& .MuiSlider-rail': { height: 2 },
            }}
          />
        </Box>
      )}
    </Box>
        <Typography sx={{my: 1}}>
        <Link href={src} target={'_blank'}>
          <>Ссылка на аудио</>
          <OpenInNewIcon sx={{fontSize: '12px', ml: .3}}/>
        </Link>
        </Typography>
      </>
  );
};

export default AudioPlayer;
