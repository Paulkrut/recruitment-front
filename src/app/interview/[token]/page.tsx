"use client";

import { useEffect, useRef, useState, KeyboardEvent, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  Button,
  Typography,
  Paper,
  LinearProgress,
  Stack,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme,
  TextField,
  Divider,
  Chip,
  Rating,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { keyframes } from "@mui/system";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import VideocamIcon from "@mui/icons-material/Videocam";
import MicIcon from "@mui/icons-material/Mic";
import PauseIcon from "@mui/icons-material/PauseCircleOutline";
import ChatBubble from "@/app/components/apps/chats/ChatBubble";
import Scrollbar from "@/app/components/custom-scroll/Scrollbar";
import ForgetMeAuto from "@/app/components/ForgetMeAuto";

interface Question {
  id: number;
  text: string;
  type: string;
  maxTime?: number;
  position: number;
}

const API_BASE =
  process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

const steps = ["Подготовка", "Тест оборудования", "Ответы", "Финиш"];

export default function CandidateInterviewPage() {
  const { token } = useParams<{ token: string }>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  /* ---------------- state ---------------- */
  const [prepared, setPrepared] = useState<{total:number;durationSec:number;status:string}|null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);
  const [currentQuestionTimerStarted, setCurrentQuestionTimerStarted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout|null>(null);
  const [chat, setChat] = useState<{
    role: "bot" | "user";
    text: string;
    video?: string;
    timestamp?: number;
  }[]>([]);
  const [result, setResult] = useState<any>(null);
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [answered, setAnswered] = useState(false);
  const [lastAnswerTime, setLastAnswerTime] = useState<number | null>(null);
  const [previousQuestionId, setPreviousQuestionId] = useState<number | null>(null);
  const [loadingNextQuestion, setLoadingNextQuestion] = useState(false);
  const videoRef = useRef<HTMLVideoElement|null>(null);
  const chatVideoRef = useRef<HTMLVideoElement|null>(null);
  const [previewStream, setPreviewStream] = useState<MediaStream|null>(null);
  const [testStream, setTestStream] = useState<MediaStream|null>(null);
  const testVideoRef = useRef<HTMLVideoElement|null>(null);
  const [micLevel,setMicLevel] = useState(0);
  const [micReady,setMicReady] = useState(false);
  const analyserRef = useRef<AnalyserNode|null>(null);
  const rafRef = useRef<number|null>(null);
  const [skipDialogOpen, setSkipDialogOpen] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState<{
    camera: boolean;
    microphone: boolean;
  }>({ camera: false, microphone: false });
  const [permissionsRequested, setPermissionsRequested] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [deviceTestStarted, setDeviceTestStarted] = useState(false); // Флаг для предотвращения повторных запусков
  const [forgetMeDialogOpen, setForgetMeDialogOpen] = useState(false);
  const [forgetMeLoading, setForgetMeLoading] = useState(false);
  const [forgetMeConfirmed, setForgetMeConfirmed] = useState('');

  // Состояния для обратной связи
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState<any>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [sendingFeedback, setSendingFeedback] = useState(false);
  const [feedbackEmail, setFeedbackEmail] = useState("");
  const [candidateOpinion, setCandidateOpinion] = useState("");
  const [opinionSubmitted, setOpinionSubmitted] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  // Состояния для прогресса генерации
  const [generationStep, setGenerationStep] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(60);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const chatRef = useRef<HTMLDivElement | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const blink = keyframes`50%{opacity:0.2}`;
  const pulse = keyframes`0%{opacity:1}50%{opacity:0.5}100%{opacity:1}`;

  const activeStep = result ? 3 : question ? 2 : prepared ? 1 : 0;

  // Функция для форматирования времени сообщения
  const formatMessageTime = (timestamp?: number) => {
    const time = timestamp ? new Date(timestamp) : new Date();
    return time.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Упрощенная нумерация вопросов - просто округляем позицию
  const getQuestionNumber = (position: number) => {
    return Math.round(position);
  };

  // Все вопросы теперь считаются основными
  const isFollowUpQuestion = (position: number) => {
    return false; // Больше нет follow-up вопросов
  };

  const stepperComp = (
    <Stepper activeStep={activeStep} alternativeLabel sx={{mb:2}}>
      {steps.map((label)=>(
        <Step key={label}><StepLabel>{label}</StepLabel></Step>
      ))}
    </Stepper>
  );

  /* ---------------- helpers ---------------- */
  function scrollToBottom() {
    if (chatScrollRef.current) {
      // Добавляем небольшую задержку для полной загрузки контента
      setTimeout(() => {
        if (chatScrollRef.current) {
          chatScrollRef.current.scrollTo({
            top: chatScrollRef.current.scrollHeight + 100, // Добавляем дополнительный отступ
            behavior: 'smooth'
          });
        }
      }, 100); // 100ms задержка
    }
  }

  function forceScrollToBottom() {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight + 200, // Больший отступ для принудительного скролла
        behavior: 'auto' // Мгновенный скролл без анимации
      });
    }
  }

  /* ---------------- effects ---------------- */
  // autoscroll
  useEffect(() => {
    scrollToBottom();
    // Дополнительный скролл через небольшую задержку
    const timer = setTimeout(() => scrollToBottom(), 50);
    // Принудительный скролл в самом конце
    const forceTimer = setTimeout(() => forceScrollToBottom(), 300);
    return () => {
      clearTimeout(timer);
      clearTimeout(forceTimer);
    };
  }, [chat]);

  // Очистка URL объектов при размонтировании
  useEffect(() => {
    return () => {
      // Очищаем все URL объекты при размонтировании компонента
      chat.forEach(message => {
        if (message.video && message.video !== "live") {
          URL.revokeObjectURL(message.video);
        }
      });
    };
  }, [chat]);

  /* -------- countdown logic -------- */
  function clearCountdown(){
    if(intervalRef.current){ clearInterval(intervalRef.current); intervalRef.current=null; }
    setPaused(true);
  }
  function startCountdown(totalSec:number){
    console.log('startCountdown called:', { totalSec, questionId: question?.id });
    clearCountdown();
    setTimeLeft(totalSec);
    intervalRef.current = setInterval(()=>
      setTimeLeft(prev=> (prev!==null && prev>0)? prev-1 : 0),
        1000);
    setPaused(false);
    setTimerStarted(true);
    setCurrentQuestionTimerStarted(true);
  }

  useEffect(()=>{
    console.log('Question changed, starting countdown:', {
      questionId: question?.id,
      maxTime: question?.maxTime,
      timeLeft
    });
    clearCountdown();
    setTimerStarted(false); // Сбрасываем флаг для нового вопроса
    setCurrentQuestionTimerStarted(false); // Сбрасываем флаг для текущего вопроса
    if(question){
      startCountdown(question.maxTime || 120);
      // Скролл к новому вопросу
      setTimeout(() => scrollToBottom(), 200);
      // Принудительный скролл в конце
      setTimeout(() => forceScrollToBottom(), 500);
    }
    return clearCountdown;
  },[question?.id]); // Используем question?.id вместо question

  // reset answered flag when question changes
  useEffect(()=>{
    if (answered) {
      console.log('Resetting answered flag for new question:', {
        questionId: question?.id,
        answered
      });
      setAnswered(false);
    }
  }, [question?.id]); // Используем question?.id вместо question

  /* ---------- auto-submit on timeout ----------- */
  useEffect(()=>{
    if(timeLeft===0 && timeLeft !== null && question && !answered && !recording && currentQuestionTimerStarted){
      console.log('Auto-submit useEffect triggered:', {
        timeLeft,
        questionId: question.id,
        answered,
        recording,
        currentQuestionTimerStarted,
        lastAnswerTime,
        previousQuestionId,
        paused
      });

      // Проверка - не отправляем пустой ответ если недавно был отправлен ответ
      if (lastAnswerTime) {
        const timeSinceLastAnswer = Date.now() - lastAnswerTime;
        console.log('Time since last answer check:', {
          timeSinceLastAnswer,
          questionId: question.id,
          threshold: 2000
        });
        if (timeSinceLastAnswer < 2000) { // 2 секунды
          console.log('Skipping auto-submit - recent answer detected:', {
            timeSinceLastAnswer,
            questionId: question.id
          });
          return;
        }
      }

      // Проверка - отправляем пустой ответ только если у вопроса есть таймер
      if (question.maxTime === null || question.maxTime === undefined || question.maxTime === 0) {
        console.log('Skipping auto-submit - no max time for current question:', {
          questionId: question.id,
          maxTime: question.maxTime
        });
        return;
      }

      // Отправляем пустой ответ
      console.log('Auto-submit triggered:', {
        timeLeft,
        questionId: question.id,
        answered,
        recording,
        currentQuestionTimerStarted,
        lastAnswerTime,
        previousQuestionId,
        paused
      });
      sendEmptyAnswer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[timeLeft,recording,answered,question?.id,currentQuestionTimerStarted,lastAnswerTime,previousQuestionId,paused]);

  // auto-stop по таймеру
  useEffect(() => {
    if (!recording) return;
    if (timeLeft === 0 && !answered) {
      console.log('Auto-stop triggered by timer');
      stopRecording();
    }
  }, [timeLeft, recording, answered]);

  // prepare
  useEffect(()=>{
    if(!token) return;
    fetch(`${API_BASE}/api/public/interview/${token}/prepare`).then(r=>r.json()).then(setPrepared);
  },[token]);

  const startDeviceTest = async () => {
    // Предотвращаем повторные запуски
    if (deviceTestStarted) {
      console.log('Device test already started, skipping...');
      return;
    }

    try{
      setDeviceTestStarted(true);
      console.log('Starting device test...');

      // Проверяем разрешения перед запросом потока
      const permissions = await navigator.permissions.query({ name: 'camera' as PermissionName });
      const micPermissions = await navigator.permissions.query({ name: 'microphone' as PermissionName });

      console.log('Device test permissions:', {
        camera: permissions.state,
        microphone: micPermissions.state
      });

      const stream = await navigator.mediaDevices.getUserMedia({audio:true,video:{width:640,height:480}});
      setTestStream(stream);
      if(testVideoRef.current){ testVideoRef.current.srcObject = stream; }

      // Проверяем реальный доступ к трекам
      const hasAudioTrack = stream.getAudioTracks().length > 0 && stream.getAudioTracks()[0].enabled;
      const hasVideoTrack = stream.getVideoTracks().length > 0 && stream.getVideoTracks()[0].enabled;

      console.log('Real track access:', {
        hasAudioTrack,
        hasVideoTrack,
        audioTracks: stream.getAudioTracks().length,
        videoTracks: stream.getVideoTracks().length
      });

      // Обновляем разрешения на основе реального доступа к трекам
      setPermissionsGranted({
        camera: hasVideoTrack,
        microphone: hasAudioTrack
      });
      setPermissionsRequested(true);

      // Дополнительная проверка для Android устройств
      const isAndroid = /Android/i.test(navigator.userAgent);
      if (isAndroid && (hasAudioTrack || hasVideoTrack)) {
        console.log('Android: Разрешения получены, обновляем состояние...');
        // Небольшая задержка для стабилизации UI на Android
        setTimeout(() => {
          setPermissionsGranted({
            camera: hasVideoTrack,
            microphone: hasAudioTrack
          });
        }, 500);
      }

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize=256;
      source.connect(analyser);
      analyserRef.current = analyser;
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = ()=>{
        analyser.getByteFrequencyData(data);
        let sum=0; for(let i=0;i<data.length;i++){sum+=data[i];}
        const lvl=Math.round(sum/data.length);
        setMicLevel(lvl);
        if(!micReady && lvl>1){ setMicReady(true); }
        rafRef.current=requestAnimationFrame(tick);
      };
      tick();
    }catch(e){
      console.error('Ошибка доступа к камере/микрофону:', e);
      setDeviceTestStarted(false); // Сбрасываем флаг при ошибке

      // Специальная обработка для Safari
      let errorMessage = 'Ошибка доступа к камере/микрофону';
      if (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) {
        errorMessage += '\n\nВ Safari:\n1. Убедитесь, что сайт открыт по HTTPS\n2. Разрешите доступ к камере и микрофону\n3. Проверьте настройки в Safari > Настройки > Веб-сайты';
      }

      console.error(errorMessage);
      setPermissionsGranted({ camera: false, microphone: false });
      setPermissionsRequested(true);
    }
  };

  function stopDeviceTest(){
    if(testStream){ testStream.getTracks().forEach(t=>t.stop()); setTestStream(null); }
    if(analyserRef.current){ analyserRef.current.disconnect(); analyserRef.current=null; }
    setMicReady(false);
    if(rafRef.current){ cancelAnimationFrame(rafRef.current); }
    setDeviceTestStarted(false); // Сбрасываем флаг при остановке
  }

  const requestPermissions = async () => {
    try {
      setPermissionsRequested(false);
      await startDeviceTest();
    } catch (e) {
      console.error('Ошибка при запросе разрешений:', e);
    }
  };

  // Функция для принудительной проверки разрешений (особенно для Android)
  const forceCheckPermissions = async () => {
    try {
      console.log('Принудительная проверка разрешений...');

      // Пытаемся получить поток для проверки реального доступа
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { width: 640, height: 480 }
      });

      // Проверяем реальный доступ к трекам
      const hasAudioTrack = stream.getAudioTracks().length > 0 && stream.getAudioTracks()[0].enabled;
      const hasVideoTrack = stream.getVideoTracks().length > 0 && stream.getVideoTracks()[0].enabled;

      console.log('Force check result:', { hasAudioTrack, hasVideoTrack });

      // Обновляем состояние разрешений
      setPermissionsGranted({
        camera: hasVideoTrack,
        microphone: hasAudioTrack
      });

      // Останавливаем тестовый поток
      stream.getTracks().forEach(track => track.stop());

      // Если разрешения получены, обновляем UI
      if (hasAudioTrack && hasVideoTrack) {
        setPermissionsRequested(true);
      }
    } catch (e) {
      console.error('Ошибка при принудительной проверке разрешений:', e);
    }
  };

  // Функция для проверки разрешений с учетом особенностей Android
  const checkPermissionsWithFallback = async () => {
    try {
      // Сначала проверяем через permissions API
      const cameraPermissions = await navigator.permissions.query({ name: 'camera' as PermissionName });
      const micPermissions = await navigator.permissions.query({ name: 'microphone' as PermissionName });

      console.log('Permissions API check:', {
        camera: cameraPermissions.state,
        microphone: micPermissions.state
      });

      // Если разрешения предоставлены через API, используем их
      if (cameraPermissions.state === 'granted' && micPermissions.state === 'granted') {
        setPermissionsGranted({ camera: true, microphone: true });
        setPermissionsRequested(true);
        return;
      }

      // Если разрешения не определены или предоставлены, делаем реальную проверку
      if (cameraPermissions.state !== 'denied' && micPermissions.state !== 'denied') {
        await forceCheckPermissions();
      }
    } catch (e) {
      console.error('Ошибка при проверке разрешений с fallback:', e);
      // В случае ошибки делаем принудительную проверку
      await forceCheckPermissions();
    }
  };

  useEffect(()=>{ if(testVideoRef.current){ testVideoRef.current.srcObject = testStream || null; } },[testStream]);

  // auto start device test when prepared screen shown
  useEffect(()=>{
    if(!question && prepared && !testStream && !deviceTestStarted){
       startDeviceTest();
    }
  },[prepared, question, deviceTestStarted]);

  // Автоматическая проверка разрешений для Android устройств
  useEffect(() => {
    const checkAndroidPermissions = async () => {
      // Проверяем, является ли устройство Android
      const isAndroid = /Android/i.test(navigator.userAgent);

      if (isAndroid && prepared && !testStream && !deviceTestStarted) {
        console.log('Android устройство обнаружено, выполняем дополнительную проверку разрешений...');

        // Небольшая задержка для стабилизации
        setTimeout(async () => {
          try {
            // Проверяем еще раз, не запустился ли уже тест
            if (!deviceTestStarted) {
              await checkPermissionsWithFallback();
            }
          } catch (e) {
            console.log('Автоматическая проверка разрешений не удалась:', e);
          }
        }, 2000);
      }
    };

    checkAndroidPermissions();
  }, [prepared, testStream, deviceTestStarted]);

  // Специальная обработка для Telegram браузера
  useEffect(() => {
    const isTelegram = /TelegramWebApp/i.test(navigator.userAgent) ||
                      /Telegram/i.test(navigator.userAgent) ||
                      (window as any).Telegram?.WebApp;

    if (isTelegram) {
      console.log('Telegram браузер обнаружен, применяем специальные настройки...');

      // Принудительно показываем блок разрешений в Telegram браузере только один раз
      if (prepared && !permissionsRequested && !deviceTestStarted) {
        setTimeout(() => {
          console.log('Принудительно запрашиваем разрешения в Telegram браузере...');
          setPermissionsRequested(true);
        }, 1000);
      }
    }
  }, [prepared, permissionsRequested, deviceTestStarted]);

  // Специальная обработка для мобильных браузеров
  useEffect(() => {
    const isMobileBrowser = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobileBrowser) {
      console.log('Мобильный браузер обнаружен, применяем специальные настройки...');

      // Убираем блокировку прокрутки на мобильных устройствах
      document.body.style.overflow = 'auto';
      document.body.style.position = 'relative';

      // Добавляем специальные стили для мобильных устройств
      const style = document.createElement('style');
      style.textContent = `
        @media (max-width: 768px) {
          body {
            overflow: auto !important;
            position: relative !important;
            -webkit-overflow-scrolling: touch !important;
          }
          .MuiBox-root {
            overflow: visible !important;
          }
        }
      `;
      document.head.appendChild(style);

      return () => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }
      };
    }
  }, []);

  async function startInterview(){
    // Проверяем разрешения перед началом интервью
    if (!permissionsGranted.camera || !permissionsGranted.microphone) {
      alert('Для начала интервью необходимо разрешить доступ к камере и микрофону');
      return;
    }

    stopDeviceTest();
    setDeviceTestStarted(false); // Сбрасываем флаг для возможности повторного запуска в будущем

    const r = await fetch(`${API_BASE}/api/public/interview/${token}/start`);
    if(!r.ok) return;
    const d = await r.json();
    setQuestion(d.question);
    setPreviousQuestionId(d.question.id);
    setTotal(d.total);
    setChat([{role:'bot',text:d.question.text, timestamp: Date.now()}]);
  }

  /* ------------ блокировка выхода/обновления ------------- */
  useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", beforeUnload);

    // блок кнопки "Назад"
    window.history.pushState(null, "", window.location.href);
    const onPop = () => {
      window.history.pushState(null, "", window.location.href);
    };
    window.addEventListener("popstate", onPop);

    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  /* ------------ запись аудио ------------- */
  async function startRecording() {
    console.log('startRecording called');

    // Проверяем поддержку getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Ваш браузер не поддерживает доступ к камере и микрофону. Пожалуйста, используйте современный браузер.');
      return;
    }

    try {
      // Сначала проверяем разрешения для Safari
      const permissions = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      const cameraPermissions = await navigator.permissions.query({ name: 'camera' as PermissionName });

      console.log('Permissions status:', {
        microphone: permissions.state,
        camera: cameraPermissions.state
      });

      // Если разрешения не предоставлены, запрашиваем их
      if (permissions.state === 'denied' || cameraPermissions.state === 'denied') {
        alert('Для записи необходимо разрешить доступ к камере и микрофону. Пожалуйста, разрешите доступ в настройках браузера.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        },
        video: {
          width: 640,
          height: 480,
          frameRate: { ideal: 15, max: 30 }
        }
      });

      // Проверяем, что поток действительно содержит треки
      if (!stream.getAudioTracks().length || !stream.getVideoTracks().length) {
        throw new Error('Не удалось получить доступ к камере или микрофону');
      }

      // Дополнительная проверка для Safari - убеждаемся, что треки активны
      const audioTrack = stream.getAudioTracks()[0];
      const videoTrack = stream.getVideoTracks()[0];

      if (!audioTrack.enabled || !videoTrack.enabled) {
        console.warn('Tracks are disabled, trying to enable them');
        audioTrack.enabled = true;
        videoTrack.enabled = true;
      }

      setPreviewStream(stream);

      // Сбрасываем состояние загрузки видео
      setVideoLoading(true);

      // Добавляем видео-сообщение в чат с live-потоком
      setChat((p) => [
        ...p,
        { role: "user", text: "🎥 Запись...", video: "live", timestamp: Date.now() }
      ]);

      // Проверяем поддержку MediaRecorder и создаем с подходящим форматом
      let mr: MediaRecorder;

      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
        mr = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus',
          videoBitsPerSecond: 500000
        });
      } else {
        console.warn('WebM with VP8/Opus not supported, trying alternative formats');
        // Попробуем альтернативные форматы для Safari
        const alternativeFormats = [
          'video/mp4',
          'video/webm',
          'video/webm;codecs=h264,opus',
          'video/webm;codecs=vp9,opus'
        ];

        let supportedFormat = null;
        for (const format of alternativeFormats) {
          if (MediaRecorder.isTypeSupported(format)) {
            supportedFormat = format;
            break;
          }
        }

        if (supportedFormat) {
          console.log('Using alternative format:', supportedFormat);
          mr = new MediaRecorder(stream, {
            mimeType: supportedFormat,
            videoBitsPerSecond: 500000
          });
        } else {
          throw new Error('Ваш браузер не поддерживает запись видео');
        }
      }
      const chunks: BlobPart[] = [];
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      mr.onstop = () => {
        console.log('Recording stopped, chunks:', chunks.length);
        if (chunks.length === 0) {
          alert("Запись не содержит данных. Попробуйте ещё раз.");
          setRecording(false);
          stream.getTracks().forEach((t) => t.stop());
          setPreviewStream(null);

          // Удаляем видео-сообщение при ошибке записи
          setChat((p) => {
            const newChat = [...p];
            // Удаляем последнее видео-сообщение пользователя
            for (let i = newChat.length - 1; i >= 0; i--) {
              if (newChat[i].role === 'user' && newChat[i].video) {
                newChat.splice(i, 1);
                break;
              }
            }
            return newChat;
          });
          return;
        }
        const blob = new Blob(chunks, { type: 'video/webm' });
        console.log('Blob created:', blob.size);

        // Отправляем оригинальный blob без сжатия на фронте
        console.log('Sending original video blob:', {
          size: blob.size,
          sizeMB: (blob.size / (1024 * 1024)).toFixed(2) + ' MB',
          type: blob.type
        });

        /* при завершении записи сразу отправляем ответ */
        sendBlobAnswer(blob);

        setRecording(false);
        stream.getTracks().forEach((t) => t.stop());
        setPreviewStream(null);
      };
      mr.start();
      setMediaRecorder(mr);
      setRecording(true);
    } catch (err: any) {
      console.error('startRecording error:', err);
      let msg = "Не удалось получить доступ к микрофону.";

      // Специальная обработка для Safari
      if (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) {
        msg += "\n\nВ Safari необходимо:\n1. Разрешить доступ к камере и микрофону\n2. Убедиться, что сайт открыт по HTTPS\n3. Проверить настройки в Safari > Настройки > Веб-сайты > Камера/Микрофон";

        // В Safari иногда ошибка показывается, но запись все равно работает
        // Проверяем, есть ли активный поток
        if (previewStream && previewStream.active) {
          console.log('Safari error but stream is active, continuing with recording');
          return; // Не показываем ошибку, если поток активен
        }
      } else if (typeof window !== "undefined" && !window.isSecureContext) {
        msg += "\nБраузер требует HTTPS или http://localhost для доступа к микрофону. Откройте страницу по безопасному протоколу или через localhost.";
      } else if (err?.name === "NotAllowedError") {
        msg += "\nРазрешите доступ к микрофону в настройках браузера (значок камеры/микрофона в адресной строке).";
      } else if (err?.name === "NotFoundError") {
        msg += "\nУстройство микрофона не найдено.";
      } else if (err?.name === "NotSupportedError") {
        msg += "\nВаш браузер не поддерживает запись видео.";
      } else if (err?.name === "NotReadableError") {
        msg += "\nКамера или микрофон уже используются другим приложением.";
      }

      alert(msg);

      // Удаляем видео-сообщение при ошибке
      setChat((p) => {
        const newChat = [...p];
        // Удаляем последнее видео-сообщение пользователя
        for (let i = newChat.length - 1; i >= 0; i--) {
          if (newChat[i].role === 'user' && newChat[i].video) {
            newChat.splice(i, 1);
            break;
          }
        }
        return newChat;
      });
    }
  }

  function stopRecording() {
    console.log('stopRecording called', { answered, recording, hasMediaRecorder: !!mediaRecorder });

    // Проверяем, что запись действительно активна
    if (!recording) {
      console.log('Recording is not active, nothing to stop');
      return;
    }

    if (mediaRecorder && !answered) {
      console.log('Stopping media recorder');
      try {
      mediaRecorder.stop();
      } catch (error) {
        console.error('Error stopping media recorder:', error);
        // Если не удалось остановить через mediaRecorder, принудительно останавливаем
        setRecording(false);
        if (previewStream) {
          previewStream.getTracks().forEach((t) => t.stop());
          setPreviewStream(null);
        }
      }
    } else {
      console.log('Not stopping recorder:', {
        hasMediaRecorder: !!mediaRecorder,
        recording,
        answered
      });
    }

    // Удаляем видео-сообщение только если запись была отменена вручную
    // При успешном завершении записи видео-сообщение обновится в sendBlobAnswer
    if (recording && !answered && !mediaRecorder) {
      setChat((p) => {
        const newChat = [...p];
        // Удаляем последнее видео-сообщение пользователя только при отмене
        for (let i = newChat.length - 1; i >= 0; i--) {
          if (newChat[i].role === 'user' && newChat[i].video) {
            if (newChat[i].video !== "live") {
              URL.revokeObjectURL(newChat[i].video);
            }
            newChat.splice(i, 1);
            break;
          }
        }
        return newChat;
      });
    }
  }

  // useEffect to bind srcObject
  useEffect(()=>{
    if(videoRef.current){
      videoRef.current.srcObject = previewStream || null;
    }
  },[previewStream]);

  // useEffect to bind srcObject for chat video
  useEffect(()=>{
    if(chatVideoRef.current){
      chatVideoRef.current.srcObject = previewStream || null;
    }
  },[previewStream]);

  /* ---------------- handlers ---------------- */
  async function sendBlobAnswer(blob: Blob) {
    if (!question || answered) return;

    clearCountdown();
    setLoadingNextQuestion(true);
    setAnswered(true);
    setLastAnswerTime(Date.now());

    // Заменяем live-сообщение на записанное видео и добавляем typing индикатор
    setChat((p) => {
      const newChat = [...p];

      // Находим и заменяем последнее live-сообщение пользователя на записанное видео
      for (let i = newChat.length - 1; i >= 0; i--) {
        if (newChat[i].role === 'user' && newChat[i].video === 'live') {
          newChat[i] = { role: "user", text: "", video: URL.createObjectURL(blob), timestamp: Date.now() };
          break;
        }
      }

      // Добавляем typing индикатор бота
      newChat.push({ role: "bot", text: "typing", timestamp: Date.now() });

      return newChat;
    });

    const fd = new FormData();
    fd.append("questionId", String(question.id));
    fd.append("video", new File([blob], "answer.webm", { type: blob.type }));

    try {
      // Отправляем ответ на сервер
      const answerResponse = await fetch(`${API_BASE}/api/public/interview/${token}/answer`, {
        method: "POST",
        body: fd,
      });
      console.log('Answer response:', answerResponse.status, answerResponse.ok);

      // Немедленно получаем следующий вопрос
      const r = await fetch(`${API_BASE}/api/public/interview/${token}/next`);
      console.log('Next question response:', r.status, r.ok);

      if (!r.ok) {
        // интервью завершено - убираем typing индикатор
        setChat((p) => p.filter(m => !(m.role === 'bot' && m.text === 'typing')));
        const res = await fetch(`${API_BASE}/api/public/interview/${token}/result`);
        setResult(await res.json());
        setLoadingNextQuestion(false);
        return;
      }

      const d = await r.json();
      console.log('Next question data:', d);

      // если сервер не вернул вопрос - завершаем
      if (!d.question) {
        // убираем typing индикатор
        setChat((p) => p.filter(m => !(m.role === 'bot' && m.text === 'typing')));
        const res = await fetch(`${API_BASE}/api/public/interview/${token}/result`);
        setResult(await res.json());
        setLoadingNextQuestion(false);
        return;
      }

      // Устанавливаем следующий вопрос
      setQuestion(d.question);
      setPreviousQuestionId(d.question.id);
      setChat((p) => {
        const cp = [...p];
        // Находим и заменяем последний typing индикатор бота на новый вопрос
        for (let i = cp.length - 1; i >= 0; i--) {
          if (cp[i].role === 'bot' && cp[i].text === 'typing') {
            cp[i] = { role: "bot", text: d.question.text, timestamp: Date.now() };
            break;
          }
        }
        return cp;
      });

    } catch (error) {
      console.error('Error sending answer:', error);
      // Убираем typing индикатор при ошибке
      setChat((p) => p.filter(m => !(m.role === 'bot' && m.text === 'typing')));
    } finally {
      setLoadingNextQuestion(false);
      setAnswered(false);
    }
  }

  async function sendEmptyAnswer(){
    if (!question || answered) return;

    clearCountdown();
    setLoadingNextQuestion(true);
    setAnswered(true);
    setLastAnswerTime(Date.now());

    // optimistic UI
    setChat((p)=>[
      ...p,
      {role:'user',text:'(нет ответа)', timestamp: Date.now()},
      {role:'bot',text:'typing', timestamp: Date.now()},
    ]);

    const fd = new FormData();
    fd.append('questionId', String(question.id));
    fd.append('text','');

    try {
      // Отправляем пустой ответ на сервер
      const answerResponse = await fetch(`${API_BASE}/api/public/interview/${token}/answer`,{method:'POST',body:fd});
      console.log('Empty answer response:', answerResponse.status, answerResponse.ok);

      // Немедленно получаем следующий вопрос
      const r = await fetch(`${API_BASE}/api/public/interview/${token}/next`);
      console.log('Next question response (empty):', r.status, r.ok);

      if(!r.ok){
        // убираем typing индикатор
        setChat((p) => p.filter(m => !(m.role === 'bot' && m.text === 'typing')));
        const res = await fetch(`${API_BASE}/api/public/interview/${token}/result`);
        setResult(await res.json());
        setLoadingNextQuestion(false);
        return;
      }

      const d = await r.json();
      console.log('Next question data (empty):', d);

      if(!d.question){
        // убираем typing индикатор
        setChat((p) => p.filter(m => !(m.role === 'bot' && m.text === 'typing')));
        const res = await fetch(`${API_BASE}/api/public/interview/${token}/result`);
        setResult(await res.json());
        setLoadingNextQuestion(false);
        return;
      }

      // Устанавливаем следующий вопрос
      setQuestion(d.question);
      setPreviousQuestionId(d.question.id);
      setChat((p) => {
        const cp = [...p];
        // Находим и заменяем последний typing индикатор бота на новый вопрос
        for (let i = cp.length - 1; i >= 0; i--) {
          if (cp[i].role === 'bot' && cp[i].text === 'typing') {
            cp[i] = { role: "bot", text: d.question.text, timestamp: Date.now() };
            break;
          }
        }
        return cp;
      });

    } catch (error) {
      console.error('Error sending empty answer:', error);
      // Убираем typing индикатор при ошибке
      setChat((p) => p.filter(m => !(m.role === 'bot' && m.text === 'typing')));
    } finally {
      setLoadingNextQuestion(false);
      setAnswered(false);
    }
  }

  async function skipQuestion() {
    setSkipDialogOpen(false);
    await sendEmptyAnswer();
  }


  async function sendFeedbackToEmail() {
    if (!feedbackEmail.trim()) return;

    setSendingFeedback(true);
    try {
      const response = await fetch(`${API_BASE}/api/public/interview/${token}/send-feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          email: feedbackEmail,
          feedback: JSON.stringify(feedbackData.feedback)
        })
      });

      if (response.ok) {
        alert('Обратная связь отправлена на ваш email!');
        setShowEmailForm(false);
        setFeedbackEmail('');
      } else {
        throw new Error('Ошибка отправки');
      }
    } catch (error) {
      console.error('Error sending feedback:', error);
      alert('Произошла ошибка при отправке. Попробуйте позже.');
    } finally {
      setSendingFeedback(false);
    }
  }

  const submitCandidateOpinion = async () => {
    if (candidateOpinion.length < 10) return;

    try {
      const response = await fetch(`${API_BASE}/api/public/interview/${token}/candidate-opinion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          opinion: candidateOpinion
        })
      });

      if (response.ok) {
        setOpinionSubmitted(true);
      }
    } catch (error) {
      console.error('Error submitting opinion:', error);
    }
  };

  const handleForgetMe = async () => {
    if (forgetMeConfirmed !== 'УДАЛИТЬ') {
      return;
    }

    setForgetMeLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/interview/${token}/forget-me`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        // Перенаправляем на главную страницу после успешного удаления
        window.location.href = '/';
      } else {
        console.error('Error forgetting data:', response.statusText);
      }
    } catch (error) {
      console.error('Error forgetting data:', error);
    } finally {
      setForgetMeLoading(false);
      setForgetMeDialogOpen(false);
    }
  };

  // Сообщения для прогресса генерации
  const progressMessages = [
    "🔍 Анализируем ваши ответы...",
    "🤖 Запускаем AI-анализ качества ответов...",
    "📊 Вычисляем персональную оценку...",
    "💪 Определяем ваши сильные стороны...",
    "🎯 Выявляем области для развития...",
    "📝 Формируем развивающую обратную связь...",
    "🚀 Создаем план персонального роста...",
    "✨ Финализируем результаты..."
  ];

  // Прогресс-сообщения для обработки ответов
  const processingMessages = [
    "Обрабатываем аудио и видео ответы...",
    "Транскрибируем речь...",
    "Анализируем содержание ответов...",
    "Подготавливаем данные для оценки...",
    "Готовимся к генерации обратной связи..."
  ];

  async function startFeedbackGeneration() {
    setFeedbackLoading(true);
    setGenerationStep(0);
    setElapsedTime(0);
    setEstimatedTime(60); // 60 секунд примерное время

    // Запускаем генерацию
    try {
      const response = await fetch(`${API_BASE}/api/public/interview/${token}/request-results`, {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'generating') {
          // Генерация запущена, запускаем поллинг и прогресс
          startProgressAnimation();
          startPolling();
        } else if (data.status === 'ready') {
          // Обратная связь уже готова
          setFeedbackData(data);
          setFeedbackLoading(false);
          setShowFeedback(true);
        } else if (data.status === 'processing') {
          // Ответы еще обрабатываются - запускаем автоматическое ожидание
          setFeedbackLoading(true);
          setGenerationStep(0);
          setElapsedTime(0);
          setEstimatedTime(30); // Примерное время обработки ответов

          // Запускаем поллинг для проверки готовности ответов
          startProcessingPolling(data.pending_answers);
        } else {
          throw new Error(data.message || 'Неизвестный статус ответа');
        }
      } else {
        throw new Error('Ошибка запуска генерации');
      }
    } catch (error) {
      console.error('Error starting generation:', error);
      alert('Произошла ошибка при запуске генерации. Попробуйте позже.');
      setFeedbackLoading(false);
    }
  }

  function startProgressAnimation() {
    const progressInterval = setInterval(() => {
      setElapsedTime(prev => {
        const newTime = prev + 1;

        // Обновляем шаг в зависимости от этапа
        if (newTime < 30) {
          // Этап обработки ответов
          const newStep = Math.min(Math.floor(newTime / 6), processingMessages.length - 1);
          setGenerationStep(newStep);
        } else {
          // Этап генерации feedback
          const feedbackTime = newTime - 30;
          const newStep = Math.min(Math.floor(feedbackTime / 7), progressMessages.length - 1);
          setGenerationStep(newStep);
        }

        // Если прошло больше 2 минут, останавливаем прогресс
        if (newTime > 120) {
          clearInterval(progressInterval);
        }

        return newTime;
      });
    }, 1000);

    return progressInterval;
  }

  function startPolling() {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE}/api/public/interview/${token}/feedback`);
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'ready') {
            // Готово!
            clearInterval(interval);
            setFeedbackData(data);
            setFeedbackLoading(false);
            setShowFeedback(true);
            setPollingInterval(null);
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 10000); // Каждые 10 секунд

    setPollingInterval(interval);
  }

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Функция для загрузки начальных данных интервью
  async function fetchPrepared() {
    try {
      const response = await fetch(`${API_BASE}/api/public/interview/${token}/prepare`);
      if (response.ok) {
        const data = await response.json();
        setPrepared(data);
      } else {
        console.error('Error fetching prepared data:', response.status);
      }
    } catch (error) {
      console.error('Error fetching prepared data:', error);
    }
  }

  useEffect(() => {
    if (token) {
      fetchPrepared();
    }
  }, [token]);

  // Проверяем готовность обратной связи при загрузке для завершенных интервью
  useEffect(() => {
    if (prepared?.status === 'finished') {
      checkExistingFeedback();
    }
  }, [prepared]);

  async function checkExistingFeedback() {
    try {
      const response = await fetch(`${API_BASE}/api/public/interview/${token}/feedback`);
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'ready') {
          setFeedbackData(data);
          setShowFeedback(true);
        }
      }
    } catch (error) {
      // Обратная связь еще не готова, ничего не делаем
      console.log('Feedback not ready yet');
    }
  }

  // Поллинг для проверки готовности ответов
  function startProcessingPolling(initialPendingCount: number) {
    let pendingCount = initialPendingCount;

    const interval = setInterval(async () => {
      try {
        // Проверяем статус ответов
        const response = await fetch(`${API_BASE}/api/public/interview/${token}/feedback`);
        if (response.ok) {
          const data = await response.json();

          if (data.status === 'ready') {
            // Ответы готовы, запускаем генерацию feedback
            clearInterval(interval);
            setFeedbackLoading(false);
            // Автоматически запускаем генерацию
            startFeedbackGeneration();
          } else if (data.status === 'processing') {
            // Обновляем количество необработанных ответов
            const newPendingCount = data.pending_answers || pendingCount;
            if (newPendingCount < pendingCount) {
              pendingCount = newPendingCount;
              // Обновляем прогресс на основе количества обработанных ответов
              const processedCount = initialPendingCount - newPendingCount;
              const progressStep = Math.min(Math.floor(processedCount / Math.max(initialPendingCount / 4, 1)), processingMessages.length - 1);
              setGenerationStep(progressStep);

              // Обновляем estimatedTime на основе прогресса
              const remainingAnswers = newPendingCount;
              const newEstimatedTime = Math.max(30 - (processedCount * 5), 10); // Уменьшаем время по мере обработки
              setEstimatedTime(newEstimatedTime);
            }
          }
        }
      } catch (error) {
        console.error('Processing polling error:', error);
      }
    }, 5000); // Каждые 5 секунд для более частой проверки

    setPollingInterval(interval);
  }

  /* ---------------- render ---------------- */
  if (result) {
    if (showFeedback && feedbackData) {
      // Экран обратной связи
    return (
        <Box sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          p: isMobile ? 2 : 4,
          maxWidth: '1200px',
          mx: 'auto',
          width: '100%',
          px: { xs: 2, sm: 3, md: 4 }
        }}>
          {stepperComp}

          <Box sx={{ flex: 1, mt: 3, display: 'flex', flexDirection: 'column' }}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h4" gutterBottom align="center" color="primary">
                  🎯 Ваши результаты интервью
                </Typography>

                {/* Дисклеймер наверху */}
                <Box sx={{ bgcolor: 'warning.light', p: 2, borderRadius: 1, mb: 3 }}>
                  <Typography variant="body2" sx={{ fontStyle: 'italic', textAlign: 'center' }}>
                    ⚠️ {feedbackData.feedback.disclaimer}
                  </Typography>
                </Box>

                {feedbackData.feedback.average_score > 0 && (
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Typography variant="h5" gutterBottom>
                      Общая оценка: {feedbackData.feedback.average_score}/10
                    </Typography>
                    <Rating value={feedbackData.feedback.average_score / 2} readOnly size="large" />
                  </Box>
                )}

                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  📝 Краткий итог
                </Typography>
                <Typography paragraph>
                  {feedbackData.feedback.summary}
                </Typography>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>
                  💡 Развивающая обратная связь
                </Typography>
                <Typography paragraph>
                  {feedbackData.feedback.feedback}
                </Typography>

                {feedbackData.feedback.scores_table && (
                  <>
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="h6" gutterBottom>
                      📊 Таблица оценок
                    </Typography>
                    {Array.isArray(feedbackData.feedback.scores_table) && feedbackData.feedback.scores_table.length > 0 ? (
                      <TableContainer component={Paper} sx={{ bgcolor: 'grey.50' }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell><strong>Вопрос</strong></TableCell>
                              <TableCell align="center"><strong>Оценка</strong></TableCell>
                              <TableCell><strong>Комментарий</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {feedbackData.feedback.scores_table.map((row: any, index: number) => (
                              <TableRow key={index}>
                                <TableCell>{row.question}</TableCell>
                                <TableCell align="center">
                                  <Chip
                                    label={`${row.score}/10`}
                                    color={row.score >= 8 ? 'success' : row.score >= 6 ? 'warning' : 'error'}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>{row.comment}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                        <Typography component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                          {feedbackData.feedback.scores_table}
                        </Typography>
                      </Box>
                    )}
                  </>
                )}

                {feedbackData.feedback.strengths && feedbackData.feedback.strengths.length > 0 && (
                  <>
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="h6" gutterBottom color="success.main">
                      ✅ Ваши сильные стороны
                    </Typography>
                    <Stack spacing={1}>
                      {feedbackData.feedback.strengths.map((strength: string, index: number) => (
                        <Chip
                          key={index}
                          label={strength}
                          color="success"
                          variant="filled"
                          sx={{
                            backgroundColor: '#2e7d32',
                            color: 'white',
                            fontWeight: 500,
                            height: 'auto',
                            minHeight: '32px',
                            '& .MuiChip-label': {
                              color: 'white',
                              whiteSpace: 'normal',
                              wordBreak: 'break-word',
                              padding: '8px 12px',
                              lineHeight: 1.4
                            }
                          }}
                        />
                      ))}
                    </Stack>
                  </>
                )}

                {feedbackData.feedback.weaknesses && feedbackData.feedback.weaknesses.length > 0 && (
                  <>
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="h6" gutterBottom color="warning.main">
                      🎯 Области для развития
                    </Typography>
                    <Stack spacing={1}>
                      {feedbackData.feedback.weaknesses.map((weakness: string, index: number) => (
                        <Chip
                          key={index}
                          label={weakness}
                          color="warning"
                          variant="filled"
                          sx={{
                            backgroundColor: '#f57c00',
                            color: 'white',
                            fontWeight: 500,
                            height: 'auto',
                            minHeight: '32px',
                            '& .MuiChip-label': {
                              color: 'white',
                              whiteSpace: 'normal',
                              wordBreak: 'break-word',
                              padding: '8px 12px',
                              lineHeight: 1.4
                            }
                          }}
                        />
                      ))}
                    </Stack>
                  </>
                )}

                <Divider sx={{ my: 3 }} />

                <Typography variant="caption" color="text.secondary" align="center" display="block">
                  {feedbackData.feedback.disclaimer}
                </Typography>
              </CardContent>
            </Card>

            {/* Форма отправки на email */}
            {showEmailForm ? (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    📧 Отправить результаты на email
                  </Typography>
                  <TextField
                    fullWidth
                    type="email"
                    label="Ваш email"
                    value={feedbackEmail}
                    onChange={(e) => setFeedbackEmail(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="contained"
                      onClick={sendFeedbackToEmail}
                      disabled={sendingFeedback || !feedbackEmail.trim()}
                    >
                      {sendingFeedback ? <CircularProgress size={20} /> : 'Отправить'}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setShowEmailForm(false)}
                    >
                      Отмена
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ) : (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => setShowEmailForm(true)}
                    sx={{ mb: 2 }}
                  >
                    📧 Отправить результаты на email
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Форма мнения кандидата */}
            {!opinionSubmitted && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    💬 Поделитесь своим мнением
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Что вы думаете о данной оценке? Ваше мнение поможет нам улучшить процесс интервью.
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Ваше мнение"
                    value={candidateOpinion}
                    onChange={(e) => setCandidateOpinion(e.target.value)}
                    placeholder="Например: Считаю оценку справедливой / завышенной / заниженной..."
                    sx={{ mb: 2 }}
                  />
                  <Button
                    variant="contained"
                    onClick={submitCandidateOpinion}
                    disabled={candidateOpinion.length < 10}
                  >
                    Отправить мнение
                  </Button>
                </CardContent>
              </Card>
            )}

            {opinionSubmitted && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography color="success.main" align="center">
                    ✅ Спасибо за ваше мнение! Оно отправлено HR-менеджеру.
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Компонент для автоматического удаления данных - прижат к низу */}
            <Box sx={{ mt: 'auto', pt: 4 }}>
              <ForgetMeAuto candidateToken={token as string} />
            </Box>
          </Box>
        </Box>
      );
    }

    // Основной экран результата с кнопкой получения обратной связи
    return (
      <Box sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: isMobile ? 2 : 4,
        textAlign: "center",
        maxWidth: '1200px',
        mx: 'auto',
        width: '100%',
        px: { xs: 0, sm: 2, md: 4 }
      }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          {stepperComp}
          <Typography variant="h4" gutterBottom>
            Спасибо за прохождение интервью!
          </Typography>
          <Typography sx={{mb:3}}>
            Наш менеджер свяжется с вами после проверки ответов.
          </Typography>

          {/* Hero кнопка для получения обратной связи */}
          <Button
            variant="contained"
            size="large"
            onClick={startFeedbackGeneration}
            disabled={feedbackLoading}
            sx={{
              minHeight: 60,
              px: 6,
              py: 2,
              fontSize: '1.2rem',
              mb: 3,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976D2 30%, #1976D2 90%)',
              }
            }}
          >
            {feedbackLoading ? (
              <>
                <CircularProgress size={24} sx={{ mr: 2, color: 'white' }} />
                {/* Показываем разные сообщения в зависимости от этапа */}
                {elapsedTime < 30 ? processingMessages[generationStep] : progressMessages[generationStep]}
              </>
            ) : (
              '🎯 Получить персональную обратную связь'
            )}
          </Button>

          {feedbackLoading && (
            <Box sx={{ width: '100%', maxWidth: 400, mb: 3 }}>
              <LinearProgress
                variant="determinate"
                value={Math.min((elapsedTime / estimatedTime) * 100, 95)}
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Прогресс: {Math.min(Math.floor((elapsedTime / estimatedTime) * 100), 95)}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ~{Math.max(estimatedTime - elapsedTime, 5)} сек осталось
                </Typography>
              </Box>
              {/* Показываем дополнительную информацию о текущем этапе */}
              <Typography variant="caption" color="text.primary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                {elapsedTime < 30 ? 'Обрабатываем ваши ответы...' : 'Генерируем обратную связь...'}
              </Typography>
            </Box>
          )}

          <Typography variant="body2" color="text.secondary">
            {feedbackLoading
              ? (elapsedTime < 30
                  ? "Система обрабатывает ваши аудио и видео ответы для подготовки к анализу"
                  : "Система AI анализирует ваши ответы для создания персональных рекомендаций")
              : "Узнайте свои сильные стороны, области для развития и персональные рекомендации"
            }
          </Typography>
        </Box>

        {/* Компонент для автоматического удаления данных - прижат к низу */}
        <Box sx={{ mt: 'auto', pt: 4 }}>
          <ForgetMeAuto candidateToken={token as string} />
        </Box>
      </Box>
    );
  }

  if (!question) {
    // если еще не стартовали, показываем подготовительный экран
    if(!prepared){
      return (
        <Box sx={{
          // Убираем фиксированную высоту для страницы подготовки
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          // На странице подготовки убираем все ограничения overflow
          overflow: 'visible',
          maxWidth: '1200px', // Ограничение ширины для больших мониторов
          mx: 'auto', // Центрирование на больших экранов
          width: '100%', // Полная ширина на мобильных
          px: { xs: 0, sm: 2, md: 4 } // Адаптивные горизонтальные отступы
        }}>
          {stepperComp}
          <Typography>Загрузка…</Typography>
        </Box>
      );
    }
    if(prepared.status==='finished'){
      // Показываем ту же страницу с кнопкой обратной связи, что и после завершения интервью
      // Имитируем состояние result = true

      if (showFeedback && feedbackData) {
        // Если обратная связь уже загружена, показываем её
      return (
          <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            p: isMobile ? 2 : 4,
            maxWidth: '1200px',
            mx: 'auto',
            width: '100%',
            px: { xs: 2, sm: 3, md: 4 }
          }}>
          {stepperComp}

            <Box sx={{ flex: 1, mt: 3, display: 'flex', flexDirection: 'column' }}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h4" gutterBottom align="center" color="primary">
                    🎯 Ваши результаты интервью
                  </Typography>

                  {/* Дисклеймер наверху */}
                  <Box sx={{ bgcolor: 'warning.light', p: 2, borderRadius: 1, mb: 3 }}>
                    <Typography variant="body2" sx={{ fontStyle: 'italic', textAlign: 'center' }}>
                      ⚠️ {feedbackData.feedback.disclaimer}
                    </Typography>
                  </Box>

                  {/* Компонент для автоматического удаления данных */}
                  <ForgetMeAuto candidateToken={token as string} />

                  {feedbackData.feedback.average_score > 0 && (
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      <Typography variant="h5" gutterBottom>
                        Общая оценка: {feedbackData.feedback.average_score}/10
                      </Typography>
                      <Rating value={feedbackData.feedback.average_score / 2} readOnly size="large" />
                    </Box>
                  )}

                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    📝 Краткий итог
                  </Typography>
                  <Typography paragraph>
                    {feedbackData.feedback.summary}
                  </Typography>

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="h6" gutterBottom>
                    💡 Развивающая обратная связь
                  </Typography>
                  <Typography paragraph>
                    {feedbackData.feedback.feedback}
                  </Typography>

                  {feedbackData.feedback.scores_table && (
                    <>
                      <Divider sx={{ my: 3 }} />
                      <Typography variant="h6" gutterBottom>
                        📊 Таблица оценок
                      </Typography>
                      {Array.isArray(feedbackData.feedback.scores_table) && feedbackData.feedback.scores_table.length > 0 ? (
                        <TableContainer component={Paper} sx={{ bgcolor: 'grey.50' }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell><strong>Вопрос</strong></TableCell>
                                <TableCell align="center"><strong>Оценка</strong></TableCell>
                                <TableCell><strong>Комментарий</strong></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {feedbackData.feedback.scores_table.map((row: any, index: number) => (
                                <TableRow key={index}>
                                  <TableCell>{row.question}</TableCell>
                                  <TableCell align="center">
                                    <Chip
                                      label={`${row.score}/10`}
                                      color={row.score >= 8 ? 'success' : row.score >= 6 ? 'warning' : 'error'}
                                      size="small"
                                    />
                                  </TableCell>
                                  <TableCell>{row.comment}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                          <Typography component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                            {feedbackData.feedback.scores_table}
                          </Typography>
                        </Box>
                      )}
                    </>
                  )}

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="h6" gutterBottom>
                    💡 Рекомендации для развития
                  </Typography>
                  <Typography paragraph>
                    {feedbackData.feedback.recommendations || feedbackData.feedback.next_level}
                  </Typography>

                  {feedbackData.feedback.strengths && feedbackData.feedback.strengths.length > 0 && (
                    <>
                      <Divider sx={{ my: 3 }} />
                      <Typography variant="h6" gutterBottom color="success.main">
                        ✅ Ваши сильные стороны
                      </Typography>
                      <Stack spacing={1}>
                        {feedbackData.feedback.strengths.map((strength: string, index: number) => (
                          <Chip
                            key={index}
                            label={strength}
                            color="success"
                            variant="filled"
                            sx={{
                              backgroundColor: '#2e7d32',
                              color: 'white',
                              fontWeight: 500,
                              height: 'auto',
                              minHeight: '32px',
                              '& .MuiChip-label': {
                                color: 'white',
                                whiteSpace: 'normal',
                                wordBreak: 'break-word',
                                padding: '8px 12px',
                                lineHeight: 1.4
                              }
                            }}
                          />
                        ))}
                      </Stack>
                    </>
                  )}

                  {feedbackData.feedback.weaknesses && feedbackData.feedback.weaknesses.length > 0 && (
                    <>
                      <Divider sx={{ my: 3 }} />
                      <Typography variant="h6" gutterBottom color="warning.main">
                        🎯 Области для развития
                      </Typography>
                      <Stack spacing={1}>
                        {feedbackData.feedback.weaknesses.map((weakness: string, index: number) => (
                          <Chip
                            key={index}
                            label={weakness}
                            color="warning"
                            variant="filled"
                            sx={{
                              backgroundColor: '#f57c00',
                              color: 'white',
                              fontWeight: 500,
                              height: 'auto',
                              minHeight: '32px',
                              '& .MuiChip-label': {
                                color: 'white',
                                whiteSpace: 'normal',
                                wordBreak: 'break-word',
                                padding: '8px 12px',
                                lineHeight: 1.4
                              }
                            }}
                          />
                        ))}
                      </Stack>
                    </>
                  )}

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="caption" color="text.secondary" align="center" display="block">
                    {feedbackData.feedback.disclaimer}
                  </Typography>
                </CardContent>
              </Card>

              {/* Форма отправки на email */}
              {showEmailForm ? (
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      📧 Отправить результаты на email
                    </Typography>
                    <TextField
                      fullWidth
                      type="email"
                      label="Ваш email"
                      value={feedbackEmail}
                      onChange={(e) => setFeedbackEmail(e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <Stack direction="row" spacing={2}>
                      <Button
                        variant="contained"
                        onClick={sendFeedbackToEmail}
                        disabled={sendingFeedback || !feedbackEmail.trim()}
                      >
                        {sendingFeedback ? <CircularProgress size={20} /> : 'Отправить'}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => setShowEmailForm(false)}
                      >
                        Отмена
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              ) : (
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => setShowEmailForm(true)}
                      sx={{ mb: 2 }}
                    >
                      📧 Отправить результаты на email
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Форма мнения кандидата */}
              {!opinionSubmitted && (
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      💬 Поделитесь своим мнением
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Что вы думаете о данной оценке? Ваше мнение поможет нам улучшить процесс интервью.
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Ваше мнение"
                      value={candidateOpinion}
                      onChange={(e) => setCandidateOpinion(e.target.value)}
                      placeholder="Например: Считаю оценку справедливой / завышенной / заниженной..."
                      sx={{ mb: 2 }}
                    />
                    <Button
                      variant="contained"
                      onClick={submitCandidateOpinion}
                      disabled={candidateOpinion.length < 10}
                    >
                      Отправить мнение
                    </Button>
                  </CardContent>
                </Card>
              )}

              {opinionSubmitted && (
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography color="success.main" align="center">
                      ✅ Спасибо за ваше мнение! Оно отправлено HR-менеджеру.
                    </Typography>
                  </CardContent>
                </Card>
              )}

              {/* Компонент для автоматического удаления данных - прижат к низу */}
              <Box sx={{ mt: 'auto', pt: 4 }}>
                <ForgetMeAuto candidateToken={token as string} />
              </Box>
            </Box>
          </Box>
        );
      }

      return (
        <Box sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: isMobile ? 2 : 4,
          textAlign: "center",
          maxWidth: '1200px',
          mx: 'auto',
          width: '100%',
          px: { xs: 0, sm: 2, md: 4 }
        }}>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            {stepperComp}
            <Typography variant="h4" gutterBottom>
              Спасибо за прохождение интервью!
            </Typography>
            <Typography sx={{mb:3}}>
              Наш менеджер свяжется с вами после проверки ответов.
            </Typography>

            {/* Hero кнопка для получения обратной связи */}
            <Button
              variant="contained"
              size="large"
              onClick={startFeedbackGeneration}
              disabled={feedbackLoading}
              sx={{
                minHeight: 60,
                px: 6,
                py: 2,
                fontSize: '1.2rem',
                mb: 3,
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976D2 30%, #1976D2 90%)',
                }
              }}
            >
              {feedbackLoading ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 2, color: 'white' }} />
                  {/* Показываем разные сообщения в зависимости от этапа */}
                  {elapsedTime < 30 ? processingMessages[generationStep] : progressMessages[generationStep]}
                </>
              ) : (
                '🎯 Получить персональную обратную связь'
              )}
            </Button>

            {feedbackLoading && (
              <Box sx={{ width: '100%', maxWidth: 400, mb: 3 }}>
                <LinearProgress
                  variant="determinate"
                  value={Math.min((elapsedTime / estimatedTime) * 100, 95)}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Прогресс: {Math.min(Math.floor((elapsedTime / estimatedTime) * 100), 95)}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ~{Math.max(estimatedTime - elapsedTime, 5)} сек осталось
                  </Typography>
                </Box>
                {/* Показываем дополнительную информацию о текущем этапе */}
                <Typography variant="caption" color="text.primary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                  {elapsedTime < 30 ? 'Обрабатываем ваши ответы...' : 'Генерируем обратную связь...'}
                </Typography>
              </Box>
            )}

            <Typography variant="body2" color="text.secondary">
              {feedbackLoading
                ? (elapsedTime < 30
                    ? "Система обрабатывает ваши аудио и видео ответы для подготовки к анализу"
                    : "Система AI анализирует ваши ответы для создания персональных рекомендаций")
                : "Узнайте свои сильные стороны, области для развития и персональные рекомендации"
              }
            </Typography>
          </Box>

          {/* Компонент для автоматического удаления данных - прижат к низу */}
          <Box sx={{ mt: 'auto', pt: 4 }}>
            <ForgetMeAuto candidateToken={token as string} />
          </Box>
        </Box>
      );
    }

    const min = Math.ceil(prepared.durationSec/60);
    return (
      <Box sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        // На странице подготовки убираем все ограничения overflow
        overflow: 'visible',
        maxWidth: '1200px', // Ограничение ширины для больших мониторов
        mx: 'auto', // Центрирование на больших экранах
        width: '100%', // Полная ширина на мобильных
        px: { xs: 0, sm: 2, md: 4 } // Адаптивные горизонтальные отступы
      }}>
        {/* Fixed Header */}
        <Box sx={{
          p: isMobile ? 2 : 4,
          pb: isMobile ? 1 : 4,
          bgcolor: 'background.default',
          borderBottom: '1px solid',
          borderColor: 'divider',
          flexShrink: 0
        }}>
        {stepperComp}
        <Typography variant="h4" gutterBottom>Перед началом</Typography>
        <Typography sx={{mb:2}}>Тест состоит из {prepared.total} вопросов (в процессе могут появляться уточняющие) и займет примерно {min} мин.</Typography>
          <Typography sx={{mb:2}}>Во время прохождения нельзя ставить собеседование на паузу, повторять или пропускать вопросы. Отвечайте последовательно и не перегружайте страницу — дополнительное время будет выделено автоматически для уточняющих вопросов.</Typography>
        </Box>

        {/* Content - без скролла на странице подготовки */}
        <Box sx={{
          flex: 1,
          // Убираем скролл на странице подготовки
          overflow: 'visible',
          p: isMobile ? 2 : 4,
          // Убираем все настройки скролла
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Проверка разрешений */}
          {permissionsRequested && (!permissionsGranted.camera || !permissionsGranted.microphone) && (
            <Box sx={{mb:3, p:2, bgcolor:'warning.light', borderRadius:0, border:'1px solid', borderColor:'warning.main'}}>


              <Typography variant="h6" color="warning.dark" gutterBottom>
                ⚠️ Требуется доступ к камере и микрофону
              </Typography>
              <Typography variant="body2" sx={{mb:2}}>
                Для прохождения интервью необходимо разрешить доступ к камере и микрофону.
                {!permissionsGranted.camera && !permissionsGranted.microphone && ' Камера и микрофон заблокированы.'}
                {!permissionsGranted.camera && permissionsGranted.microphone && ' Камера заблокирована.'}
                {permissionsGranted.camera && !permissionsGranted.microphone && ' Микрофон заблокирован.'}
              </Typography>

              {/* Специальная информация для Android */}
              {/Android/i.test(navigator.userAgent) && (
                <Typography variant="body2" sx={{mb:2, fontStyle: 'italic', color: 'warning.dark'}}>
                  💡 <strong>Для Android:</strong> Если разрешения уже предоставлены, но кнопка не исчезает,
                  нажмите "Проверить разрешения (для Android)" или "Сбросить и повторить".
                </Typography>
              )}
              <Button
                variant="contained"
                color="warning"
                onClick={requestPermissions}
                fullWidth={isMobile}
                size={isMobile ? 'large' : 'medium'}
              >
                Разрешить камеру и микрофон
              </Button>

              {/* Дополнительная кнопка для Android устройств */}
              <Button
                variant="outlined"
                color="warning"
                onClick={checkPermissionsWithFallback}
                fullWidth={isMobile}
                size={isMobile ? 'large' : 'medium'}
                sx={{ mt: 1 }}
              >
                Проверить разрешения (для Android)
              </Button>

              {/* Кнопка для принудительного сброса разрешений */}
              <Button
                variant="text"
                color="warning"
                onClick={() => {
                  setPermissionsGranted({ camera: false, microphone: false });
                  setPermissionsRequested(false);
                  if (testStream) {
                    testStream.getTracks().forEach(track => track.stop());
                    setTestStream(null);
                  }
                }}
                fullWidth={isMobile}
                size={isMobile ? 'large' : 'medium'}
                sx={{ mt: 1 }}
              >
                Сбросить и повторить
              </Button>
            </Box>
          )}

        {/* Device test preview */}
        {testStream && (
          <Box sx={{mt:3}}>
            <Typography variant="h6" gutterBottom>Проверка оборудования</Typography>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <video
                  ref={testVideoRef}
                  width={isMobile ? 280 : 320}
                  height={isMobile ? 210 : 240}
                  autoPlay
                  muted
                  playsInline
                  style={{
                    border:'1px solid #ccc',
                    borderRadius:0,
                    maxWidth: '100%'
                  }}
                />
              </Box>
              <Box sx={{display:'flex',alignItems:'center',mt:1,width:220, mx: 'auto'}}>
              <GraphicEqIcon sx={{mr:1}}/>
                <Box sx={{flexGrow:1,height:10,bgcolor:'#eee',borderRadius:0,overflow:'hidden'}}>
                <Box sx={{width:`${micLevel}%`,height:'100%',bgcolor:'primary.main',transition:'width 0.1s linear'}} />
              </Box>
            </Box>
              <Box sx={{
                display:'flex',
                gap:2,
                mt:1,
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'center' : 'flex-start'
              }}>
              <Box sx={{display:'flex',alignItems:'center',gap:0.5}}>
                  <VideocamIcon color={permissionsGranted.camera?"success":"error" as any}/>
                  <Typography variant="body2" color={permissionsGranted.camera?"success.main":"error.main"}>
                    {permissionsGranted.camera?"Камера OK":"Камера заблокирована"}
                  </Typography>
              </Box>
              <Box sx={{display:'flex',alignItems:'center',gap:0.5}}>
                  <MicIcon color={permissionsGranted.microphone?"success":"error" as any}/>
                  <Typography variant="body2" color={permissionsGranted.microphone?"success.main":"error.main"}>
                    {permissionsGranted.microphone?"Микрофон OK":"Микрофон заблокирован"}
                  </Typography>
              </Box>
            </Box>
          </Box>
        )}
        </Box>

        {/* Fixed Bottom Button */}
        <Box sx={{
          p: isMobile ? 2 : 4,
          pt: isMobile ? 1 : 4,
          bgcolor: 'background.default',
          borderTop: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
          // Добавляем z-index для мобильных устройств
          zIndex: isMobile ? 1000 : 'auto',
          // Убираем тень на мобильных для лучшей производительности
          boxShadow: isMobile ? 'none' : '0 -1px 3px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column'
        }}>

          <Button
            variant="contained"
            onClick={startInterview}
            disabled={permissionsRequested && (!permissionsGranted.camera || !permissionsGranted.microphone)}
            fullWidth={isMobile}
            size={isMobile ? 'large' : 'medium'}
            // Добавляем стили для лучшей видимости на мобильных
            sx={{
              ...(isMobile && {
                minHeight: '48px',
                fontSize: '16px',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              })
            }}
          >
            Начать
          </Button>

          {/* Компонент для удаления данных - прижат к низу */}
          <Box sx={{ mt: 2 }}>
            <ForgetMeAuto candidateToken={token as string} />
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <>
      {/* Основной контент */}
      <Box sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        // Убираем overflow: hidden для мобильных устройств
        overflow: isMobile ? 'visible' : 'hidden',
        maxWidth: '1200px', // Ограничение ширины для больших мониторов
        mx: 'auto', // Центрирование на больших экранах
        width: '100%', // Полная ширина на мобильных
        px: { xs: 0, sm: 2, md: 4 } // Адаптивные горизонтальные отступы
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
          {/* header */}
          <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', mb:1 }}>
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
                  Интервью
                </Typography>
                <Typography variant="caption" sx={{ color: '#666' }}>
                  AI-ассистент
                </Typography>
              </Box>
            </Box>
            <Box sx={{display:'flex',alignItems:'center',gap:2}}>
              {total && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ color: '#666', fontSize: '13px' }}>
                    {getQuestionNumber(question.position)} из {total}
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
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="caption" component="div" sx={{ color: '#666', fontSize: '10px' }}>
                      {timeLeft}
                    </Typography>
                  </Box>
                </Box>
              )}
              {paused && <PauseIcon sx={{ color: '#666', fontSize: '20px' }} />}
            </Box>
          </Box>

          {/* progress */}
          {total && (
            <LinearProgress
              variant="determinate"
              value={(question.position / total) * 100}
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
              {timeLeft} сек
            </Typography>
          )}
        </Box>

        {/* Chat Area - WhatsApp/Telegram Style */}
        <Box sx={{
          flex: 1,
          // Убираем overflow: hidden для мобильных устройств
          overflow: isMobile ? 'visible' : 'hidden',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#f0f2f5', // WhatsApp-like background
          position: 'relative'
        }}>
          {/* Chat Container */}
          <Box
            ref={chatScrollRef}
            sx={{
              height: '100%',
              // Улучшаем прокрутку для мобильных устройств
              overflow: isMobile ? 'scroll' : 'auto',
              p: { xs: 1, sm: 2 },
              // WhatsApp-like scrolling
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'thin',
              // Убираем блокировку прокрутки на мобильных
              overscrollBehavior: isMobile ? 'contain' : 'auto',
              '&::-webkit-scrollbar': {
                width: '4px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(0,0,0,0.1)',
                borderRadius: '2px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: 'rgba(0,0,0,0.2)',
              },
            }}
          >
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              minHeight: '100%',
              justifyContent: 'flex-end'
            }}>
              {chat.map((m,i)=>(
                m.text === 'typing' && m.role === 'bot' ? (
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
                      {/* Время для typing индикатора */}
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
                              {previewStream ? (
                                <video
                                  ref={chatVideoRef}
                                  autoPlay
                                  muted
                                  playsInline
                                  onLoadStart={() => setVideoLoading(true)}
                                  onCanPlay={() => setVideoLoading(false)}
                                  onError={(e) => {
                                    console.error('Chat video error:', e);
                                    setVideoLoading(false);
                                  }}
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
                                    Подключение к камере...
                                  </Typography>
                                </Box>
                              )}
                              {/* Индикатор загрузки видео */}
                              {videoLoading && (
                                <Box sx={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: '50%',
                                  transform: 'translate(-50%, -50%)',
                                  bgcolor: 'rgba(0, 0, 0, 0.7)',
                                  color: 'white',
                                  px: 2,
                                  py: 1,
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                  zIndex: 2
                                }}>
                                  Загрузка видео...
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
                                  bgcolor: '#fff',
                                  animation: `${pulse} 1s infinite`
                                }} />
                                ЗАПИСЬ
                              </Box>
                              {/* Индикатор времени записи */}
                              {timeLeft !== null && question?.maxTime && (
                                <Box sx={{
                                  position: 'absolute',
                                  bottom: 8,
                                  left: 8,
                                  bgcolor: 'rgba(0, 0, 0, 0.7)',
                                  color: 'white',
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: '4px',
                                  fontSize: '10px',
                                  fontWeight: 'bold',
                                  zIndex: 1
                                }}>
                                  {timeLeft}s
                                </Box>
                              )}
                              {/* Индикатор качества записи */}
                              {recording && (
                                <Box sx={{
                                  position: 'absolute',
                                  bottom: 8,
                                  right: 8,
                                  bgcolor: 'rgba(0, 0, 0, 0.7)',
                                  color: 'white',
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: '4px',
                                  fontSize: '10px',
                                  fontWeight: 'bold',
                                  zIndex: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5
                                }}>
                                  <Box sx={{
                                    width: 4,
                                    height: 4,
                                    borderRadius: '50%',
                                    bgcolor: '#4caf50'
                                  }} />
                                  HD
                                </Box>
                              )}
                              {/* Индикатор уровня звука */}
                              {recording && micLevel > 0 && (
                                <Box sx={{
                                  position: 'absolute',
                                  top: 8,
                                  left: 8,
                                  bgcolor: 'rgba(0, 0, 0, 0.7)',
                                  color: 'white',
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: '4px',
                                  fontSize: '10px',
                                  fontWeight: 'bold',
                                  zIndex: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5
                                }}>
                                  <Box sx={{
                                    width: 8,
                                    height: 2,
                                    bgcolor: '#fff',
                                    borderRadius: '1px',
                                    position: 'relative',
                                    overflow: isMobile ? 'visible' : 'hidden'
                                  }}>
                                    <Box sx={{
                                      width: `${Math.min(micLevel * 2, 100)}%`,
                                      height: '100%',
                                      bgcolor: '#4caf50',
                                      transition: 'width 0.1s ease'
                                    }} />
                                  </Box>
                                  🔊
                                </Box>
                              )}
                            </Box>
                          ) : (
                            // Финальное видео с контролами
                            <video
                              src={m.video}
                              controls
                              style={{
                                width: '100%',
                                maxWidth: '280px',
                                borderRadius: '8px'
                              }}
                            />
                          )}
                        </Box>
                      )}

                      {/* Текстовое сообщение */}
                      {m.text && (
                        <Typography sx={{
                          fontSize: '14px',
                          lineHeight: 1.4,
                          color: '#000',
                          mb: 0.5
                        }}>
                          {m.text}
                        </Typography>
                      )}

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

        {/* Fixed Bottom Controls - WhatsApp Style */}
        <Box sx={{
          p: isMobile ? 2 : 3,
          bgcolor: '#ffffff',
          borderTop: '1px solid #e0e0e0',
          flexShrink: 0,
          boxShadow: '0 -1px 3px rgba(0,0,0,0.1)'
        }}>
          {/* answer input – только аудио */}
          <Box sx={{
            display: "flex",
            gap: 2,
            justifyContent: 'space-between',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center'
          }}>
            {!recording ? (
              <>
                <Button
                  variant="contained"
                  onClick={startRecording}
                  disabled={recording || loadingNextQuestion}
                  fullWidth={isMobile}
                  size={isMobile ? 'large' : 'medium'}
                  sx={{
                    fontWeight: 600,
                    bgcolor: '#25d366', // WhatsApp green
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
                  {loadingNextQuestion ? 'Обработка ответа...' : '🎤 Записать ответ'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setSkipDialogOpen(true)}
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
                  ⏭️ Пропустить
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                color="error"
                onClick={stopRecording}
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
                ⏹️ Стоп
              </Button>
            )}
          </Box>
        </Box>

        {/* Диалог подтверждения пропуска вопроса - WhatsApp Style */}
        <Dialog
          open={skipDialogOpen}
          onClose={() => setSkipDialogOpen(false)}
          PaperProps={{
            sx: {
              bgcolor: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              maxWidth: '400px',
              width: '90%'
            }
          }}
        >
          <DialogTitle sx={{
            pb: 1,
            textAlign: 'center',
            borderBottom: '1px solid #e0e0e0'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <Box sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                bgcolor: '#ff9800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1
              }}>
                <Typography sx={{ color: 'white', fontWeight: 'bold', fontSize: '20px' }}>
                  ⚠️
                </Typography>
              </Box>
            </Box>
            <Typography variant="h6" sx={{ color: '#000', fontWeight: 600 }}>
              Пропустить вопрос?
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: 2, pb: 1 }}>
            <Typography sx={{
              color: '#666',
              lineHeight: 1.5,
              textAlign: 'center',
              fontSize: '14px'
            }}>
              Вы уверены, что хотите пропустить этот вопрос?
              <br />
              <Box component="span" sx={{
                color: '#ff9800',
                fontWeight: 600,
                fontSize: '13px'
              }}>
                Внимание:
              </Box> Пропущенный вопрос будет засчитан как отсутствие ответа.
            </Typography>
          </DialogContent>
          <DialogActions sx={{
            p: 2,
            pt: 1,
            gap: 1,
            justifyContent: 'center'
          }}>
            <Button
              onClick={() => setSkipDialogOpen(false)}
              sx={{
                color: '#666',
                borderColor: '#ddd',
                '&:hover': {
                  bgcolor: '#f5f5f5',
                  borderColor: '#ccc'
                },
                borderRadius: '20px',
                textTransform: 'none',
                px: 3
              }}
              variant="outlined"
            >
              Отмена
            </Button>
            <Button
              onClick={skipQuestion}
              sx={{
                bgcolor: '#ff9800',
                '&:hover': {
                  bgcolor: '#f57c00',
                },
                borderRadius: '20px',
                textTransform: 'none',
                px: 3
              }}
              variant="contained"
            >
              Пропустить

            </Button>
          </DialogActions>
        </Dialog>
      </Box>

      {/* Диалог подтверждения удаления данных */}
      <Dialog
        open={forgetMeDialogOpen}
        onClose={() => setForgetMeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: 'warning.main', textAlign: 'center' }}>
          🗑️ Удаление данных
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph sx={{ mb: 2 }}>
            <strong>Внимание!</strong> Вы собираетесь удалить все свои данные с платформы SofiHR.
          </Typography>

          <Typography variant="body2" paragraph>
            <strong>Что будет удалено:</strong>
          </Typography>
          <Box sx={{ pl: 2, mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • Ваши персональные данные (имя, email, телефон)
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • Видео и аудио записи интервью
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • Результаты анализа и оценки
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • Все согласия на обработку данных
            </Typography>
          </Box>

          <Typography variant="body2" paragraph color="error.main">
            <strong>Это действие нельзя отменить!</strong> После удаления данные будут потеряны навсегда.
          </Typography>

          <Typography variant="body2" paragraph>
            <strong>Для подтверждения введите "УДАЛИТЬ":</strong>
          </Typography>

          <TextField
            fullWidth
            value={forgetMeConfirmed}
            onChange={(e) => setForgetMeConfirmed(e.target.value)}
            placeholder="Введите УДАЛИТЬ для подтверждения"
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            onClick={() => setForgetMeDialogOpen(false)}
            variant="outlined"
            sx={{ mr: 2 }}
          >
            Отмена
          </Button>
          <Button
            onClick={handleForgetMe}
            variant="contained"
            color="warning"
            disabled={forgetMeConfirmed !== 'УДАЛИТЬ' || forgetMeLoading}
            startIcon={forgetMeLoading ? <CircularProgress size={20} /> : null}
          >
            {forgetMeLoading ? 'Удаляю...' : 'Удалить навсегда'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
