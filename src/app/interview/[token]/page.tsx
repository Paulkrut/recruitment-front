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
  Checkbox,
  FormControlLabel,
  Alert,
} from "@mui/material";
import { keyframes } from "@mui/system";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import VideocamIcon from "@mui/icons-material/Videocam";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import CheckIcon from "@mui/icons-material/Check";
import PauseIcon from "@mui/icons-material/PauseCircleOutline";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ChatBubble from "@/app/components/apps/chats/ChatBubble";
import Scrollbar from "@/app/components/custom-scroll/Scrollbar";
import ForgetMeAuto from "@/app/components/ForgetMeAuto";
import ProductionWebcamComponent from "./ProductionWebcamComponent";
import { useLingui } from '@lingui/react';
import { msg, Trans } from '@lingui/macro';
import { getErrorMessage } from '@/utils/errorTranslator';


interface Question {
  id: number;
  text: string;
  type: string;
  maxTime?: number;
  position: number;
}

const API_BASE =
  process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";


export default function CandidateInterviewPage() {
  const { _, i18n } = useLingui();
  const steps = [_(msg`Подготовка`), _(msg`Тест оборудования`), _(msg`Ответы`), _(msg`Финиш`)];

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
  const [micTestedSuccessfully, setMicTestedSuccessfully] = useState(false);
  const analyserRef = useRef<AnalyserNode|null>(null);
  const rafRef = useRef<number|null>(null);
  const [skipDialogOpen, setSkipDialogOpen] = useState(false);
  // Убрали все проверки разрешений - используем прямые вызовы getUserMedia

  const [videoLoading, setVideoLoading] = useState(false);
  const [forgetMeDialogOpen, setForgetMeDialogOpen] = useState(false);
  const [forgetMeLoading, setForgetMeLoading] = useState(false);
  const [forgetMeConfirmed, setForgetMeConfirmed] = useState('');
  // Дубликаты хелперов удалены - используем только первый блок

  // Состояние для записанного blob (перед отправкой)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  // Состояние для анимации удаления реплики
  const [deletingMessageIndex, setDeletingMessageIndex] = useState<number | null>(null);

  // Состояния для обратной связи
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState<any>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [sendingFeedback, setSendingFeedback] = useState(false);
  const [feedbackEmail, setFeedbackEmail] = useState("");
  const [candidateOpinion, setCandidateOpinion] = useState("");
  const [opinionSubmitted, setOpinionSubmitted] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  // Переключатель камеры на экране подготовки (в стиле Google Meet)
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [pdnConsent, setPdnConsent] = useState(false);
  const hasTestVideoTrack = useMemo(() => !!(testStream && testStream.getVideoTracks().length > 0), [testStream]);
  const [debugError, setDebugError] = useState<string>('');



  // Состояния для прогресса генерации
  const [generationStep, setGenerationStep] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(60);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Состояния для прогресса интервью
  const [interviewProgress, setInterviewProgress] = useState<{
    current: number;
    total: number;
    percentage: number;
  } | null>(null);
  const [canContinue, setCanContinue] = useState(false);

  const chatRef = useRef<HTMLDivElement | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
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
    return Math.round(position) + 1;
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
          console.log('Skipping auto-submit - recent answer detected: ', {
            timeSinceLastAnswer,
            questionId: question.id
          });
          return;
        }
      }

      // Проверка - отправляем пустой ответ только если у вопроса есть таймер
      if (question.maxTime === null || question.maxTime === undefined || question.maxTime === 0) {
        console.log('Skipping auto-submit - no max time for current question: ', {
          questionId: question.id,
          maxTime: question.maxTime
        });
        return;
      }

      // Отправляем пустой ответ
      console.log('Auto-submit triggered: ', {
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
    //setPrepared({total:20,durationSec:60,status:'ready'})
    fetch(`${API_BASE}/api/public/interview/${token}/prepare`).then(r=>r.json()).then(setPrepared);
  },[token]);


  function handleToggleCamera(){
    const newVal = !cameraEnabled;
    setCameraEnabled(newVal);
  }


  // Диагностика доступных камер для Android
  const diagnoseCameras = async () => {
    setDebugError(_(msg`🔍 Диагностика камер...`));

    try {
      // Получаем список всех устройств
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');

      setDebugError(_(msg`📷 Найдено камер: ${cameras.length}`));

      if (cameras.length === 0) {
        setDebugError(_(msg`❌ Камеры не найдены в системе`));
        return;
      }

      // Пробуем каждую камеру отдельно
      for (let i = 0; i < cameras.length; i++) {
        const camera = cameras[i];
        const label = camera.label || _(msg`Камера ${i + 1}`);
        setDebugError(_(msg`🔍 Тестируем: ${label}...`));

        try {
          const testStream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: camera.deviceId } }
          });

          const videoTrack = testStream.getVideoTracks()[0];
          const settings = videoTrack.getSettings();

          setDebugError(_(msg`✅ ${label} работает! (${settings.width}x${settings.height})`));

          // Останавливаем тестовый поток
          testStream.getTracks().forEach(track => track.stop());

          // Пробуем использовать эту камеру для основного потока
          try {
            const mainStream = await navigator.mediaDevices.getUserMedia({
              audio: true,
              video: { deviceId: { exact: camera.deviceId } }
            });

            setTestStream(mainStream);
            if (testVideoRef.current) {
              testVideoRef.current.srcObject = mainStream;
            }

            setDebugError(_(msg`🎉 Камера подключена! ${label}`));
            return;

          } catch (mainError: any) {
            setDebugError(_(msg`⚠️ ${label} работает отдельно, но не с микрофоном: ${mainError.message}`));
          }

        } catch (cameraError: any) {
          setDebugError(_(msg`❌ ${label} не работает: ${cameraError.message}`));
        }
      }

      setDebugError(_(msg`💡 Камеры найдены, но не работают с микрофоном одновременно`));

    } catch (error: any) {
      setDebugError(_(msg`❌ Ошибка диагностики: ${error.message}`));
    }
  };

  // Функция для остановки тестового потока
  function stopDeviceTest() {
    if (testStream) {
      testStream.getTracks().forEach(t => t.stop());
      setTestStream(null);
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    setMicReady(false);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
  }

  useEffect(()=>{ if(testVideoRef.current){ testVideoRef.current.srcObject = testStream || null; } },[testStream]);

  // Отслеживаем когда микрофон впервые поймал звук
  useEffect(() => {
    if (micReady && micLevel > 5 && !micTestedSuccessfully) {
      setMicTestedSuccessfully(true);
    }
  }, [micLevel, micReady, micTestedSuccessfully]);

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
    // ПРОВЕРКА: Микрофон подключен, но не ловит звук?
    if (micReady && micLevel < 1) {
      const confirmed = confirm(
        _(msg`⚠️ Микрофон подключен, но не обнаружен звук\n\nВозможные причины:\n• Микрофон отключен физической кнопкой\n• Неправильно выбран микрофон\n• Микрофон не работает\n\nРекомендуем скажите что-нибудь для проверки.\n\nВсё равно начать интервью?`)
      );
      
      if (!confirmed) {
        return; // Отменяем старт
      }
    }

    // Останавливаем тестовый поток перед началом интервью
    stopDeviceTest();

    // Сначала проверяем прогресс интервью
    const progressResponse = await fetch(`${API_BASE}/api/public/interview/${token}/progress`);
    if (progressResponse.ok) {
      const progressData = await progressResponse.json();

      if (progressData.status === 'finished') {
        // Интервью уже завершено
        alert(_(msg`Интервью уже завершено`));
        return;
      }

      if (progressData.status === 'ready') {
        // Интервью ещё не начиналось - начинаем заново
        console.log('Интервью ещё не начиналось, начинаем заново');
      } else if (progressData.canContinue && progressData.nextQuestion) {
        // Можно продолжить с места остановки
        setQuestion(progressData.nextQuestion);
        setPreviousQuestionId(progressData.nextQuestion.id);
        setTotal(progressData.total);
        setInterviewProgress(progressData.progress);
        setCanContinue(true);

        // Показываем сообщение о прогрессе
        setChat([
          {role:'bot',text: _(msg`Добро пожаловать обратно! Продолжаем интервью с вопроса ${progressData.progress.current} из ${progressData.progress.total}.`), timestamp: Date.now()},
          {role:'bot',text:progressData.nextQuestion.text, timestamp: Date.now()}
        ]);
        return;
      }
    }

    // Если прогресса нет, статус ready или нельзя продолжить - начинаем заново
    const r = await fetch(`${API_BASE}/api/public/interview/${token}/start`);
    if(!r.ok) {
      const data = await r.json().catch(() => ({}));
      
      // Специальная обработка для 402 - недостаточно баланса компании
      if (r.status === 402) {
        alert(
          '⛔ Интервью временно недоступно\n\n' +
          'К сожалению, компания временно приостановила прием интервью.\n\n' +
          'Пожалуйста, свяжитесь с представителем компании для уточнения деталей.\n\n' +
          'Приносим извинения за неудобства.'
        );
        return;
      }
      
      // Специальная обработка для 410 - интервью закрыто компанией
      if (r.status === 410) {
        alert(
          '🚫 Прохождение интервью закрыто\n\n' +
          'Компания завершила набор по данной вакансии и закрыла возможность прохождения интервью.\n\n' +
          'Благодарим за интерес к вакансии!'
        );
        return;
      }
      
      // Backend: {error: 'interview.session_not_found'}, {error: 'interview.not_ready'}
      const errorCode = data.error || 'common.internal_error';
      const errorMessage = i18n._(getErrorMessage(errorCode));
      alert(errorMessage);
      return;
    }
    const d = await r.json();
    setQuestion(d.question);
    setPreviousQuestionId(d.question.id);
    setTotal(d.total);
    setChat([
      {role:'bot', text: _(msg`Здравствуйте! Добро пожаловать на интервью. Желаем вам успешного прохождения и удачи! 🍀`), timestamp: Date.now()},
      {role:'bot', text: _(msg`Прочитайте вопрос. Нажмите кнопку "Записать ответ" и отвечайте. Остановите запись, когда закончите отвечать и переходите к следующему вопросу.`), timestamp: Date.now() + 1},
      {role:'bot', text: d.question.text, timestamp: Date.now() + 2}
    ]);
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
      alert(_(msg`Ваш браузер не поддерживает доступ к камере и микрофону. Пожалуйста, используйте современный браузер.`));
      return;
    }

    try {


      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        },
        video: cameraEnabled ? {
          width: 640,
          height: 480,
          frameRate: { ideal: 15, max: 30 }
        } : false
      });

      // Проверяем, что поток действительно содержит треки
      const hasAudio = stream.getAudioTracks().length > 0;
      const hasVideo = cameraEnabled ? stream.getVideoTracks().length > 0 : false;

      if (!hasAudio || (cameraEnabled && !hasVideo)) {
        throw new Error(_(msg`Не удалось получить доступ к требуемым устройствам`));
      }

      // Для видео или аудио сохраняем превью-поток
      const audioTrack = stream.getAudioTracks()[0];
      if (!audioTrack.enabled) audioTrack.enabled = true;

      // Настраиваем анализ аудио для визуализации уровня звука
      if (!cameraEnabled) {
        try {
          console.log('Setting up audio analysis for recording...');
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

          // Возобновляем AudioContext если он приостановлен
          if (audioContext.state === 'suspended') {
            await audioContext.resume();
          }

          const source = audioContext.createMediaStreamSource(stream);
          const analyser = audioContext.createAnalyser();

          analyser.fftSize = 256;
          analyser.smoothingTimeConstant = 0.8;
          source.connect(analyser);
          analyserRef.current = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);

          const updateLevel = () => {
            if (!analyserRef.current) return;

            analyserRef.current.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
            const normalizedLevel = Math.min(100, (average / 128) * 100);

            console.log('Audio level:', normalizedLevel);
            setMicLevel(normalizedLevel);
            rafRef.current = requestAnimationFrame(updateLevel);
          };

          updateLevel();
          console.log('Audio analysis setup complete');
        } catch (error) {
          console.error('Не удалось настроить анализ аудио для записи: ', error);
        }
      }

      if (cameraEnabled) {
        const videoTrack = stream.getVideoTracks()[0];
        if (!videoTrack.enabled) videoTrack.enabled = true;
        setPreviewStream(stream);
        setVideoLoading(true);

        // Добавляем видео-сообщение в чат с live-потоком
        setChat((p) => [
          ...p,
          { role: 'user', text: _(msg`🎥 Запись...`), video: "live", timestamp: Date.now() }
        ]);
      } else {
        // Для аудио-режима добавляем сообщение с индикатором записи
        setChat((p) => [
          ...p,
          { role: "user", text: _(msg`🎤 Запись аудио...`), timestamp: Date.now() }
        ]);
      }

      // Проверяем поддержку MediaRecorder и создаем с подходящим форматом
      let mr: MediaRecorder;

      if (cameraEnabled) {
        // Видео запись
        if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
          mr = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp8,opus',
            videoBitsPerSecond: 500000
          });
        } else {
          console.warn('WebM with VP8/Opus not supported, trying alternative formats');
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
            throw new Error(_(msg`Ваш браузер не поддерживает запись видео`));
          }
        }
      } else {
        // Аудио запись
        let audioMime: string | null = null;
        const audioCandidates = [
          'audio/webm;codecs=opus',
          'audio/ogg;codecs=opus',
          'audio/webm'
        ];

        for (const fmt of audioCandidates) {
          if (MediaRecorder.isTypeSupported(fmt)) {
            audioMime = fmt;
            break;
          }
        }

        if (!audioMime) {
          throw new Error(_(msg`Ваш браузер не поддерживает запись аудио`));
        }

        mr = new MediaRecorder(stream, {
          mimeType: audioMime,
          audioBitsPerSecond: 128000
        });
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
          alert(_(msg`Запись не содержит данных. Попробуйте ещё раз.`));
          setRecording(false);
          stream.getTracks().forEach((t) => t.stop());
          if (cameraEnabled) {
            setPreviewStream(null);
          }

          // Удаляем сообщение при ошибке записи
          setChat((p) => {
            const newChat = [...p];
            for (let i = newChat.length - 1; i >= 0; i--) {
              if (newChat[i].role === 'user' && (newChat[i].video || newChat[i].text.includes('🎤'))) {
                if (newChat[i].video && newChat[i].video !== "live") {
                  URL.revokeObjectURL(newChat[i].video);
                }
                newChat.splice(i, 1);
                break;
              }
            }
            return newChat;
          });

          // Очищаем анализ аудио при ошибке записи
          if (analyserRef.current) {
            analyserRef.current.disconnect();
            analyserRef.current = null;
          }
          if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
          }
          setMicLevel(0);

          return;
        }

        // Определяем тип блоба
        let blobType = mr.mimeType || (cameraEnabled ? 'video/webm' : 'audio/webm');
        if (!cameraEnabled && blobType.includes('ogg')) {
          blobType = 'audio/ogg';
        }
        const blob = new Blob(chunks, { type: blobType });
        console.log('Blob created:', blob.size, blob.type);

        // ИЗМЕНЕНО: Не отправляем сразу, а сохраняем blob для выбора (Переписать/Отправить)
        setRecordedBlob(blob);

        // Обновляем сообщение в чате - показываем что запись готова к отправке
        if (cameraEnabled) {
          // Для видео - создаём URL для preview
          const videoUrl = URL.createObjectURL(blob);
          setChat((p) => {
            const newChat = [...p];
            for (let i = newChat.length - 1; i >= 0; i--) {
              if (newChat[i].role === 'user' && newChat[i].video === "live") {
                newChat[i] = {
                  ...newChat[i],
                  video: videoUrl,
                  text: _(msg`🎥 Запись готова. Выберите действие ниже`),
                  timestamp: newChat[i].timestamp || Date.now()
                };
                break;
              }
            }
            return newChat;
          });
        } else {
          // Для аудио - обновляем текст
          setChat((p) => {
            const newChat = [...p];
            for (let i = newChat.length - 1; i >= 0; i--) {
              if (newChat[i].role === 'user' && newChat[i].text.includes(_(msg`🎤 Запись`))) {
                newChat[i] = {
                  ...newChat[i],
                  text: _(msg`🎤 Запись готова. Выберите действие ниже`),
                  timestamp: newChat[i].timestamp || Date.now()
                };
                break;
              }
            }
            return newChat;
          });
        }

        setRecording(false);
        stream.getTracks().forEach((t) => t.stop());
        if (cameraEnabled) {
          setPreviewStream(null);
        }

        // Очищаем анализ аудио при успешном завершении записи
        if (analyserRef.current) {
          analyserRef.current.disconnect();
          analyserRef.current = null;
        }
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        setMicLevel(0);
      };
      mr.start();
      setMediaRecorder(mr);
      setRecording(true);
    } catch (err: any) {
      console.error('startRecording error:', err);
      let msgText = cameraEnabled ? _(msg`Не удалось получить доступ к камере и микрофону.`) : _(msg`Не удалось получить доступ к микрофону.`);

      // Специальная обработка для Safari
      if (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) {
        msgText += cameraEnabled
          ? _(msg`\n\nВ Safari необходимо:\n1. Разрешить доступ к камере и микрофону\n2. Убедиться, что сайт открыт по HTTPS\n3. Проверить настройки в Safari > Настройки > Веб-сайты > Камера/Микрофон`)
          : _(msg`\n\nВ Safari необходимо:\n1. Разрешить доступ к микрофону\n2. Убедиться, что сайт открыт по HTTPS\n3. Проверить настройки в Safari > Настройки > Веб-сайты > Микрофон`);

        // В Safari иногда ошибка показывается, но запись все равно работает
        if (previewStream && previewStream.active) {
          console.log('Safari error but stream is active, continuing with recording');
          return;
        }
      } else if (typeof window !== "undefined" && !window.isSecureContext) {
        msgText += cameraEnabled
          ? _(msg`\nБраузер требует HTTPS или http://localhost для доступа к камере и микрофону. Откройте страницу по безопасному протоколу или через localhost.`)
          : _(msg`\nБраузер требует HTTPS или http://localhost для доступа к микрофону. Откройте страницу по безопасному протоколу или через localhost.`);
      } else if (err?.name === "NotAllowedError") {
        msgText += cameraEnabled
          ? _(msg`\nРазрешите доступ к камере и микрофону в настройках браузера (значок камеры/микрофона в адресной строке).`)
          : _(msg`\nРазрешите доступ к микрофону в настройках браузера (значок микрофона в адресной строке).`);
      } else if (err?.name === "NotFoundError") {
        msgText += cameraEnabled ? _(msg`\nКамера или микрофон не найдены.`) : _(msg`\nУстройство микрофона не найдено.`);
      } else if (err?.name === "NotSupportedError") {
        msgText += cameraEnabled ? _(msg`\nВаш браузер не поддерживает запись видео.`) : _(msg`\nВаш браузер не поддерживает запись аудио.`);
      } else if (err?.name === "NotReadableError") {
        msgText += cameraEnabled
          ? _(msg`\nКамера или микрофон уже используются другим приложением.`)
          : _(msg`\nМикрофон уже используется другим приложением.`);
      }

      alert(msgText);

      // Удаляем сообщение при ошибке
      setChat((p) => {
        const newChat = [...p];
        for (let i = newChat.length - 1; i >= 0; i--) {
          if (newChat[i].role === 'user' && (newChat[i].video || newChat[i].text.includes('🎤'))) {
            if (newChat[i].video && newChat[i].video !== "live") {
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

    // Очищаем анализ аудио в конце
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setMicLevel(0);
  }

  // Функция для перезаписи ответа (очищает blob и запускает запись заново)
  function handleRetake() {
    console.log('handleRetake called');
    setRecordedBlob(null);
    setMediaRecorder(null);

    // Находим индекс последней реплики пользователя для анимации
    let messageIndexToDelete = -1;
    for (let i = chat.length - 1; i >= 0; i--) {
      if (chat[i].role === 'user' && (chat[i].video || chat[i].text.includes('🎤'))) {
        messageIndexToDelete = i;
        break;
      }
    }

    if (messageIndexToDelete !== -1) {
      // Запускаем анимацию удаления
      setDeletingMessageIndex(messageIndexToDelete);

      // Через время анимации удаляем реплику
      setTimeout(() => {
        setChat((p) => {
          const newChat = [...p];
          for (let i = newChat.length - 1; i >= 0; i--) {
            if (newChat[i].role === 'user' && (newChat[i].video || newChat[i].text.includes('🎤'))) {
              // Освобождаем URL если это видео
              if (newChat[i].video && newChat[i].video !== "live") {
                URL.revokeObjectURL(newChat[i].video);
              }
              newChat.splice(i, 1);
              break;
            }
          }
          return newChat;
        });

        setDeletingMessageIndex(null);

        // Запускаем новую запись
        setTimeout(() => {
          startRecording();
        }, 50);
      }, 400); // Длительность анимации
    } else {
      // Если реплика не найдена, просто запускаем запись
      setTimeout(() => {
        startRecording();
      }, 100);
    }
  }

  // Функция для отправки записанного ответа
  function handleSubmitRecording() {
    console.log('handleSubmitRecording called', { hasBlob: !!recordedBlob });
    if (recordedBlob) {
      sendBlobAnswer(recordedBlob);
      setRecordedBlob(null); // Очищаем после отправки
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
    console.log('=== sendBlobAnswer START ===', {
      questionId: question?.id,
      answered,
      recording,
      timeLeft,
      timerStarted
    });

    if (!question || answered) {
      console.log('=== sendBlobAnswer EARLY RETURN ===', {
        hasQuestion: !!question,
        answered
      });
      return;
    }

    setTimeLeft(null);
    console.log('sendBlobAnswer called', { questionId: question.id, blobType: blob.type });

    if (recording) {
      console.log('Recording is active, skipping empty answer');
      return;
    }

    const isAudio = (blob.type || '').startsWith('audio');

    clearCountdown();
    setLoadingNextQuestion(true);
    setAnswered(true);
    setLastAnswerTime(Date.now());

    if (cameraEnabled && !isAudio) {
      // Обновляем последнее видео-сообщение с финальным видео
      const finalVideoUrl = URL.createObjectURL(blob);
      setTimeout(() => {
        setChat((p) => {
          const newChat = [...p];
          for (let i = newChat.length - 1; i >= 0; i--) {
            if (newChat[i].role === 'user' && newChat[i].video) {
              if (newChat[i].video !== "live") {
                URL.revokeObjectURL(newChat[i].video);
              }
              newChat[i] = {
                ...newChat[i],
                video: finalVideoUrl,
                text: _(msg`🎥 Видео ответ отправлен`),
                timestamp: newChat[i].timestamp || Date.now()
              };
              break;
            }
          }
          return newChat;
        });
      }, 500);
    } else {
      // Для аудио: обновляем последнее аудио-сообщение
      setChat((p) => {
        const newChat = [...p];
        for (let i = newChat.length - 1; i >= 0; i--) {
          if (newChat[i].role === 'user' && newChat[i].text.includes('🎤')) {
            newChat[i] = {
              ...newChat[i],
              text: _(msg`🎤 Аудио ответ отправлен`),
              timestamp: newChat[i].timestamp || Date.now()
            };
            break;
          }
        }
        return newChat;
      });
    }

    // Добавляем индикатор обработки
    setChat((p) => [
      ...p,
      { role: "bot", text: "typing", timestamp: Date.now() },
    ]);
    const typingIdx = chat.length; // Индекс добавленного элемента

    const fd = new FormData();
    fd.append("questionId", String(question.id));
    const key = isAudio ? 'audio' : 'video';
    const ext = (blob.type || '').includes('ogg') ? 'ogg' : 'webm';
    fd.append(key, new File([blob], `answer.${ext}`, { type: blob.type || (isAudio ? 'audio/webm' : 'video/webm') }));

    const answerResponse = await fetch(`${API_BASE}/api/public/interview/${token}/answer`, {
      method: "POST",
      body: fd,
    });
    console.log('Answer response:', answerResponse.status, answerResponse.ok);
    
    // Обработка ошибок при отправке ответа
    if (!answerResponse.ok) {
      const errorData = await answerResponse.json().catch(() => ({}));
      // Backend: {error: 'interview.file_too_large'}, {error: 'interview.file_upload_failed'}
      const errorCode = errorData.error || 'common.internal_error';
      const errorMessage = i18n._(getErrorMessage(errorCode));
      setChat((p) => p.filter((_, i) => i !== typingIdx));
      alert(_(msg`Ошибка при отправке ответа`) + '\n\n' + errorMessage);
      setLoadingNextQuestion(false);
      return;
    }

    const r = await fetch(`${API_BASE}/api/public/interview/${token}/next`);
    console.log('Next question response:', r.status, r.ok);

    if (!r.ok) {
      // interview finished
      setChat((p) => p.filter((_, i) => i !== typingIdx));
      const res = await fetch(
        `${API_BASE}/api/public/interview/${token}/result`
      );
      setResult(await res.json());
      setLoadingNextQuestion(false);
      return;
    }

    const d = await r.json();
    console.log('Next question data:', d);

    // if server returns no question – finish
    if (!d.question) {
      const res = await fetch(
        `${API_BASE}/api/public/interview/${token}/result`
      );
      setResult(await res.json());
      setLoadingNextQuestion(false);
      return;
    }

    setQuestion(d.question);
    setPreviousQuestionId(d.question.id);
    setChat((p) => {
      const cp = [...p];
      // Заменяем typing индикатор на новый вопрос
      cp[typingIdx] = { role: "bot", text: d.question.text, timestamp: Date.now() };
      return cp;
    });
    setLoadingNextQuestion(false);
    setAnswered(false);
    setRecordedBlob(null); // Очищаем записанный blob при переходе к новому вопросу
  }

  async function sendEmptyAnswer(){
    console.log('=== sendEmptyAnswer START ===', {
      questionId: question?.id,
      answered,
      recording,
      timeLeft,
      timerStarted,
      hasRecordedBlob: !!recordedBlob
    });

    if (!question || answered) {
      console.log('=== sendEmptyAnswer EARLY RETURN ===', {
        hasQuestion: !!question,
        answered
      });
      return; // Защита от дублирования
    }

    // ВАЖНО: Если есть записанный blob, отправляем его вместо пустого ответа
    if (recordedBlob) {
      console.log('Recorded blob found, sending it instead of empty answer', {
        blobSize: recordedBlob.size,
        blobType: recordedBlob.type
      });
      sendBlobAnswer(recordedBlob);
      return;
    }

    // Устанавливаем timeLeft в null чтобы предотвратить auto-submit
    setTimeLeft(null);

    console.log('sendEmptyAnswer called', { questionId: question.id });

    // Дополнительная проверка - если запись активна, не отправляем пустой ответ
    if (recording) {
      console.log('Recording is active, skipping empty answer');
      return;
    }

    clearCountdown();
    setLoadingNextQuestion(true);
    setAnswered(true);
    setLastAnswerTime(Date.now()); // Запоминаем время отправки пустого ответа

    // optimistic UI
    setChat((p)=>[
      ...p,
      {role:'user',text: _(msg`(нет ответа)`), timestamp: Date.now()},
      {role:'bot',text:'typing', timestamp: Date.now()},
    ]);
    const typingIdx = chat.length + 1; // Индекс typing (после user и bot)

    const fd = new FormData();
    fd.append('questionId', String(question.id));
    fd.append('text',''); // Пустой текст

    console.log('Sending empty answer to server...');
    const answerResponse = await fetch(`${API_BASE}/api/public/interview/${token}/answer`,{method:'POST',body:fd});
    console.log('Empty answer response:', answerResponse.status, answerResponse.ok);

    // Проверяем что ответ успешно отправлен
    if (!answerResponse.ok) {
      const errorData = await answerResponse.json().catch(() => ({}));
      // Backend: {error: 'interview.session_not_found'}, {error: 'interview.question_required'}
      const errorCode = errorData.error || 'common.internal_error';
      const errorMessage = i18n._(getErrorMessage(errorCode));
      console.error('Failed to send empty answer:', errorMessage);
      alert(errorMessage);
      setChat((p)=>p.filter((_,i)=>i!==typingIdx));
      setLoadingNextQuestion(false);
      setAnswered(false);
      return;
    }

    const r = await fetch(`${API_BASE}/api/public/interview/${token}/next`);
    console.log('Next question response (empty):', r.status, r.ok);

    if(!r.ok){
      // Интервью завершено
      setChat((p)=>p.filter((_,i)=>i!==typingIdx));
      const res = await fetch(`${API_BASE}/api/public/interview/${token}/result`);
      setResult(await res.json());
      setLoadingNextQuestion(false);
      return;
    }

    const d = await r.json();
    console.log('Next question data (empty):', d);

    if(!d.question){
      // Нет следующего вопроса - интервью завершено
      setChat((p)=>p.filter((_,i)=>i!==typingIdx));
      const res = await fetch(`${API_BASE}/api/public/interview/${token}/result`);
      setResult(await res.json());
      setLoadingNextQuestion(false);
      return;
    }

    // Устанавливаем следующий вопрос
    setQuestion(d.question);
    setPreviousQuestionId(d.question.id);
    setChat((p)=>{
      const cp=[...p];
      // Заменяем typing индикатор на новый вопрос
      cp[typingIdx]={role:'bot',text:d.question.text, timestamp: Date.now()};
      return cp;
    });
    setLoadingNextQuestion(false);
    setAnswered(false);
    setRecordedBlob(null); // Очищаем записанный blob при переходе к новому вопросу
  }

  async function skipQuestion() {
    setSkipDialogOpen(false);
    await sendEmptyAnswer();
  }

  // Функции для работы с обратной связью
  async function loadFeedback() {
    setFeedbackLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/public/interview/${token}/feedback`);
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'ready') {
          setFeedbackData(data);
          setShowFeedback(true);
        } else {
          // Обратная связь не готова
          throw new Error(_(msg`Обратная связь еще не сгенерирована`));
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        // Backend: {error: 'interview.feedback_not_found'}, {error: 'interview.feedback_not_ready'}
        const errorCode = errorData.error || 'interview.feedback_not_ready';
        const errorMessage = i18n._(getErrorMessage(errorCode));
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Error loading feedback:', error);
      // Показываем сообщение о том, что нужно начать генерацию
      alert(error.message || _(msg`Обратная связь еще не сгенерирована. Нажмите кнопку для начала генерации.`));
    } finally {
      setFeedbackLoading(false);
    }
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
        alert(_(msg`Обратная связь отправлена на ваш email!`));
        setShowEmailForm(false);
        setFeedbackEmail('');
      } else {
        const errorData = await response.json().catch(() => ({}));
        // Backend: {error: 'interview.invalid_email'}, {error: 'interview.feedback_send_failed'}
        const errorCode = errorData.error || 'common.internal_error';
        const errorMessage = i18n._(getErrorMessage(errorCode));
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Error sending feedback:', error);
      alert(error.message || _(msg`Произошла ошибка при отправке. Попробуйте позже.`));
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
      } else {
        const errorData = await response.json().catch(() => ({}));
        // Backend: {error: 'interview.invalid_email'}, {error: 'interview.opinion_too_short'}
        const errorCode = errorData.error || 'common.internal_error';
        const errorMessage = i18n._(getErrorMessage(errorCode));
        console.error('Error submitting opinion:', errorMessage);
        alert(errorMessage);
      }
    } catch (error: any) {
      console.error('Error submitting opinion:', error);
    }
  };

  const handleForgetMe = async () => {
    if (forgetMeConfirmed !== _(msg`УДАЛИТЬ`)) {
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
        const errorData = await response.json().catch(() => ({}));
        // Backend: {error: 'interview.session_not_found'}, {error: 'interview.session_not_finished'}
        const errorCode = errorData.error || 'common.internal_error';
        const errorMessage = i18n._(getErrorMessage(errorCode));
        console.error('Error forgetting data:', errorMessage);
        alert(errorMessage);
      }
    } catch (error: any) {
      console.error('Error forgetting data:', error);
    } finally {
      setForgetMeLoading(false);
      setForgetMeDialogOpen(false);
    }
  };

  // Сообщения для прогресса генерации
  const progressMessages = [
    _(msg`🔍 Анализируем ваши ответы...`),
    _(msg`🤖 Запускаем AI-анализ качества ответов...`),
    _(msg`📊 Вычисляем персональную оценку...`),
    _(msg`💪 Определяем ваши сильные стороны...`),
    _(msg`🎯 Выявляем области для развития...`),
    _(msg`📝 Формируем развивающую обратную связь...`),
    _(msg`🚀 Создаем план персонального роста...`),
    _(msg`✨ Финализируем результаты...`)
  ];

  // Прогресс-сообщения для обработки ответов
  const processingMessages = [
    _(msg`Обрабатываем аудио и видео ответы...`),
    _(msg`Транскрибируем речь...`),
    _(msg`Анализируем содержание ответов...`),
    _(msg`Подготавливаем данные для оценки...`),
    _(msg`Готовимся к генерации обратной связи...`)
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
          throw new Error(data.message || _(msg`Неизвестный статус ответа`));
        }
      } else {
        throw new Error(_(msg`Ошибка запуска генерации`));
      }
    } catch (error) {
      console.error('Error starting generation:', error);
      alert(_(msg`Произошла ошибка при запуске генерации. Попробуйте позже.`));
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
                <Typography variant="h4" gutterBottom align="center" color="primary"><Trans>🎯 Ваши результаты интервью</Trans></Typography>

                {/* Дисклеймер наверху */}
                <Box sx={{ bgcolor: 'warning.light', p: 2, borderRadius: 1, mb: 3 }}>
                  <Typography variant="body2" sx={{ fontStyle: 'italic', textAlign: 'center' }}>
                    ⚠️ {feedbackData.feedback.disclaimer}
                  </Typography>
                </Box>

                {feedbackData.feedback.average_score > 0 && (
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Typography variant="h5" gutterBottom><Trans>
                      Общая оценка: {feedbackData.feedback.average_score}/10
                    </Trans></Typography>
                    <Rating value={feedbackData.feedback.average_score / 2} readOnly size="large" />
                  </Box>
                )}

                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}><Trans>📝 Краткий итог</Trans></Typography>
                <Typography paragraph>
                  {feedbackData.feedback.summary}
                </Typography>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom><Trans>💡 Развивающая обратная связь</Trans></Typography>
                <Typography paragraph>
                  {feedbackData.feedback.feedback}
                </Typography>

                {feedbackData.feedback.scores_table && (
                  <>
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="h6" gutterBottom><Trans>📊 Таблица оценок</Trans></Typography>
                    {Array.isArray(feedbackData.feedback.scores_table) && feedbackData.feedback.scores_table.length > 0 ? (
                      <TableContainer component={Paper} sx={{ bgcolor: 'grey.50' }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell><strong><Trans>Вопрос</Trans></strong></TableCell>
                              <TableCell align="center"><strong><Trans>Оценка</Trans></strong></TableCell>
                              <TableCell><strong><Trans>Комментарий</Trans></strong></TableCell>
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
                    <Typography variant="h6" gutterBottom color="success.main"><Trans>✅ Ваши сильные стороны</Trans></Typography>
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
                    <Typography variant="h6" gutterBottom color="warning.main"><Trans>🎯 Области для развития</Trans></Typography>
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
                  <Typography variant="h6" gutterBottom><Trans>📧 Отправить результаты на email</Trans></Typography>
                  <TextField
                    fullWidth
                    type="email"
                    label={_(msg`Ваш email`)}
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
                      {sendingFeedback ? <CircularProgress size={20} /> : _(msg`Отправить`)}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setShowEmailForm(false)}
                    >
                      <Trans>Отмена</Trans>
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
                    <Trans>📧 Отправить результаты на email</Trans>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Форма мнения кандидата */}
            {!opinionSubmitted && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom><Trans>💬 Дополнительная информация</Trans></Typography>
                  <Typography variant="body2" color="text.secondary" paragraph><Trans>Есть что-то важное, что хотели бы добавить? Любая дополнительная информация поможет рекрутеру лучше оценить вашу кандидатуру.</Trans></Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label={_(msg`Дополнительная информация`)}
                    value={candidateOpinion}
                    onChange={(e) => setCandidateOpinion(e.target.value)}
                    placeholder={_(msg`Поделитесь любой информацией, которая может быть важна для рекрутера...`)}
                    sx={{ mb: 2 }}
                  />
                  <Button
                    variant="contained"
                    onClick={submitCandidateOpinion}
                    disabled={candidateOpinion.length < 10}
                  ><Trans>Отправить мнение</Trans></Button>
                </CardContent>
              </Card>
            )}

            {opinionSubmitted && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography color="success.main" align="center"><Trans>✅ Спасибо за ваше мнение! Оно отправлено HR-менеджеру.</Trans></Typography>
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
          <Typography variant="h4" gutterBottom><Trans>Спасибо за прохождение интервью!</Trans></Typography>
          <Typography sx={{mb:3}}><Trans>Наш менеджер свяжется с вами после проверки ответов.</Trans></Typography>

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
              <Trans>🎯 Получить персональную обратную связь</Trans>
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
                  <Trans>Прогресс</Trans>: {Math.min(Math.floor((elapsedTime / estimatedTime) * 100), 95)}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ~{Math.max(estimatedTime - elapsedTime, 5)} {' '}<Trans>сек осталось</Trans>
                </Typography>
              </Box>
              {/* Показываем дополнительную информацию о текущем этапе */}
              <Typography variant="caption" color="text.primary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                {elapsedTime < 30 ? _(msg`Обрабатываем ваши ответы...`) : _(msg`Генерируем обратную связь...`)}
              </Typography>
            </Box>
          )}

          <Typography variant="body2" color="text.secondary">
            {feedbackLoading
              ? (elapsedTime < 30
                  ? _(msg`Система обрабатывает ваши аудио и видео ответы для подготовки к анализу`)
                  : _(msg`Система AI анализирует ваши ответы для создания персональных рекомендаций`))
              : _(msg`Узнайте свои сильные стороны, области для развития и персональные рекомендации`)
            }
          </Typography>

          {/* Предупреждение о времени обработки */}
          {feedbackLoading && (
            <Alert
              severity="info"
              sx={{
                mt: 3,
                maxWidth: 600,
                '& .MuiAlert-message': {
                  width: '100%'
                }
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}><Trans>⏱️ Обработка ответов может занимать до 20 минут</Trans></Typography>
              <Typography variant="body2"><Trans>Пожалуйста, не закрывайте это окно. Мы обрабатываем ваши видео/аудио ответы и генерируем персональную обратную связь с помощью искусственного интеллекта.</Trans></Typography>
            </Alert>
          )}
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
          <Typography><Trans>Загрузка…</Trans></Typography>
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
                  <Typography variant="h4" gutterBottom align="center" color="primary"><Trans>🎯 Ваши результаты интервью</Trans></Typography>

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
                        <Trans>Общая оценка</Trans>: {feedbackData.feedback.average_score}/10
                      </Typography>
                      <Rating value={feedbackData.feedback.average_score / 2} readOnly size="large" />
                    </Box>
                  )}

                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}><Trans>📝 Краткий итог</Trans></Typography>
                  <Typography paragraph>
                    {feedbackData.feedback.summary}
                  </Typography>

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="h6" gutterBottom><Trans>💡 Развивающая обратная связь</Trans></Typography>
                  <Typography paragraph>
                    {feedbackData.feedback.feedback}
                  </Typography>

                  {feedbackData.feedback.scores_table && (
                    <>
                      <Divider sx={{ my: 3 }} />
                      <Typography variant="h6" gutterBottom><Trans>📊 Таблица оценок</Trans></Typography>
                      {Array.isArray(feedbackData.feedback.scores_table) && feedbackData.feedback.scores_table.length > 0 ? (
                        <TableContainer component={Paper} sx={{ bgcolor: 'grey.50' }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell><strong><Trans>Вопрос</Trans></strong></TableCell>
                                <TableCell align="center"><strong><Trans>Оценка</Trans></strong></TableCell>
                                <TableCell><strong><Trans>Комментарий</Trans></strong></TableCell>
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

                  <Typography variant="h6" gutterBottom><Trans>💡 Рекомендации для развития</Trans></Typography>
                  <Typography paragraph>
                    {feedbackData.feedback.recommendations || feedbackData.feedback.next_level}
                  </Typography>

                  {feedbackData.feedback.strengths && feedbackData.feedback.strengths.length > 0 && (
                    <>
                      <Divider sx={{ my: 3 }} />
                      <Typography variant="h6" gutterBottom color="success.main"><Trans>✅ Ваши сильные стороны</Trans></Typography>
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
                      <Typography variant="h6" gutterBottom color="warning.main"><Trans>🎯 Области для развития</Trans></Typography>
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
                    <Typography variant="h6" gutterBottom><Trans>📧 Отправить результаты на email</Trans></Typography>
                    <TextField
                      fullWidth
                      type="email"
                      label={_(msg`Ваш email`)}
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
                        {sendingFeedback ? <CircularProgress size={20} /> : _(msg`Отправить`)}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => setShowEmailForm(false)}
                      >
                        <Trans>Отмена</Trans>
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
                      <Trans>📧 Отправить результаты на email</Trans>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Форма мнения кандидата */}
              {!opinionSubmitted && (
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom><Trans>💬 Дополнительная информация</Trans></Typography>
                    <Typography variant="body2" color="text.secondary" paragraph><Trans>Есть что-то важное, что хотели бы добавить? Любая дополнительная информация поможет рекрутеру лучше оценить вашу кандидатуру.</Trans></Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label={_(msg`Дополнительная информация`)}
                      value={candidateOpinion}
                      onChange={(e) => setCandidateOpinion(e.target.value)}
                      placeholder={_(msg`Поделитесь любой информацией, которая может быть важна для рекрутера...`)}
                      sx={{ mb: 2 }}
                    />
                    <Button
                      variant="contained"
                      onClick={submitCandidateOpinion}
                      disabled={candidateOpinion.length < 10}
                    ><Trans>Отправить мнение</Trans></Button>
                  </CardContent>
                </Card>
              )}

              {opinionSubmitted && (
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography color="success.main" align="center"><Trans>✅ Спасибо за ваше мнение! Оно отправлено HR-менеджеру.</Trans></Typography>
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
            <Typography variant="h4" gutterBottom><Trans>Спасибо за прохождение интервью!</Trans></Typography>
            <Typography sx={{mb:3}}><Trans>Наш менеджер свяжется с вами после проверки ответов.</Trans></Typography>

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
                _(msg`🎯 Получить персональную обратную связь`)
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
                    <Trans>Прогресс</Trans>: {Math.min(Math.floor((elapsedTime / estimatedTime) * 100), 95)}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ~{Math.max(estimatedTime - elapsedTime, 5)}{' '}<Trans>сек осталось</Trans>
                  </Typography>
                </Box>
                {/* Показываем дополнительную информацию о текущем этапе */}
                <Typography variant="caption" color="text.primary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                  {elapsedTime < 30 ? _(msg`Обрабатываем ваши ответы...`) : _(msg`Генерируем обратную связь...`)}
                </Typography>
              </Box>
            )}

            <Typography variant="body2" color="text.secondary">
              {feedbackLoading
                ? (elapsedTime < 30
                    ? _(msg`Система обрабатывает ваши аудио и видео ответы для подготовки к анализу`)
                    : _(msg`Система AI анализирует ваши ответы для создания персональных рекомендаций`))
                : _(msg`Узнайте свои сильные стороны, области для развития и персональные рекомендации`)
              }
            </Typography>

            {/* Предупреждение о времени обработки */}
            {feedbackLoading && (
              <Alert
                severity="info"
                sx={{
                  mt: 3,
                  maxWidth: 600,
                  '& .MuiAlert-message': {
                    width: '100%'
                  }
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}><Trans>⏱️ Обработка ответов может занимать до 20 минут</Trans></Typography>
                <Typography variant="body2"><Trans>Пожалуйста, не закрывайте это окно. Мы обрабатываем ваши видео/аудио ответы и генерируем персональную обратную связь с помощью искусственного интеллекта.</Trans></Typography>
              </Alert>
            )}
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
        position: 'relative',
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
        <Typography variant="h4" gutterBottom><Trans>Перед началом</Trans></Typography>
        <Typography sx={{mb:2}}><Trans>Тест состоит из {prepared.total} вопросов (в процессе могут появляться уточняющие) и займет примерно {min} мин.</Trans></Typography>
          <Typography sx={{mb:2}}><Trans>Во время прохождения нельзя ставить собеседование на паузу, повторять или пропускать вопросы. Отвечайте последовательно и не перегружайте страницу — дополнительное время будет выделено автоматически для уточняющих вопросов.</Trans></Typography>
          <Box sx={{mt:2}}>
            <FormControlLabel
              control={<Checkbox checked={pdnConsent} onChange={e=>setPdnConsent(e.target.checked)} color="primary" />}
              label={
                <Typography variant="body2">
                  <Trans>Соглашаюсь на обработку моих персональных данных для прохождения интервью и оценки соответствия вакансии</Trans>. <a href="/privacy-policy" target="_blank"><Trans>Политика ПДн</Trans></a>.{' '}<Trans>Медиа хранятся до 60 дней</Trans>.
                </Typography>
              }
              sx={{ alignItems: 'center', mb: 1 }}
            />
            <FormControlLabel
              control={<Checkbox checked={cameraEnabled} onChange={handleToggleCamera} color="primary" />}
              label={
                <Typography variant="body2">
                  <Trans>Согласие на запись видео. Запись с камерой может повысить доверие работодателя и помочь ему лучше оценить ваши коммуникативные навыки.</Trans>
                  <Typography component="span" sx={{ color: 'text.secondary', fontSize: '0.85em', display: 'block', mt: 0.5 }}>
                    <Trans>(Снимите галочку — будет только аудио)</Trans>
                  </Typography>
                </Typography>
              }
              sx={{ alignItems: 'flex-start', mb: 1 }}
            />
          </Box>
        </Box>

        {/* Content - без скролла на странице подготовки */}
        <Box sx={{
          flex: 1,
          // Убираем скролл на странице подготовки
          overflow: 'visible',
          p: isMobile ? 2 : 4,
          // Убираем все настройки скролла
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>


        {/* Продвинутый компонент веб-камеры с улучшенной обработкой ошибок */}
        <ProductionWebcamComponent
          cameraEnabled={cameraEnabled}
          onCameraToggle={handleToggleCamera}
          onStreamReady={(stream) => setTestStream(stream)}
          onMicLevelChange={setMicLevel}
          onMicReady={(ready) => setMicReady(ready)}
          onError={(error) => setDebugError(error)}
        />

        {/* Индикатор уровня микрофона на странице подготовки */}
        {micReady && (
          <Box sx={{
            mt: 3,
            p: 2,
            bgcolor: micLevel > 5 ? '#e8f5e9' : '#fff3e0',
            borderRadius: 2,
            border: '2px solid',
            borderColor: micLevel > 5 ? '#4caf50' : '#ff9800',
            maxWidth: '500px',
            width: '100%'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <MicIcon sx={{ color: micLevel > 5 ? '#4caf50' : '#ff9800' }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {micLevel > 5 ? <Trans>🎤 Микрофон работает</Trans> : <Trans>⚠️ Говорите в микрофон для проверки</Trans>}
              </Typography>
            </Box>

            {/* Визуальный индикатор уровня */}
            <Box sx={{
              height: '8px',
              bgcolor: 'rgba(0,0,0,0.1)',
              borderRadius: '4px',
              overflow: 'hidden',
              position: 'relative',
              mb: 1
            }}>
              <Box
                style={{ width: `${Math.max(micLevel * 2, 2)}%` }}
                sx={{
                  height: '100%',
                  bgcolor: micLevel > 5 ? '#4caf50' : '#ff9800',
                  borderRadius: '4px',
                  transition: 'width 0.1s linear, background-color 0.3s'
                }}
              />
            </Box>

            <Typography variant="caption" sx={{ 
              color: 'text.secondary',
              fontSize: '11px',
              display: 'block'
            }}>
              {micLevel > 5 
                ? <Trans>✓ Звук обнаружен. Можете начинать интервью.</Trans>
                : <Trans>Скажите что-нибудь, чтобы убедиться что микрофон работает</Trans>
              }
            </Typography>
          </Box>
        )}

        {/* Юридическая информация и удаление данных - в основном контенте */}
        <Box sx={{ mt: 4, maxWidth: '600px', width: '100%' }}>
          <ForgetMeAuto candidateToken={token as string} />
        </Box>

        </Box>

        {/* Sticky Bottom Button - КОМПАКТНАЯ ВЕРСИЯ БЕЗ ForgetMeAuto */}
        <Box sx={{
          position: 'sticky',
          bottom: 0,
          p: 2,
          bgcolor: 'background.paper',
          borderTop: '2px solid',
          borderColor: 'divider',
          flexShrink: 0,
          zIndex: 100,
          boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
        }}>

          {/* Debug блок для Android - только если есть ошибка ИЛИ нет согласия ПДн */}
          {(debugError || !pdnConsent) && (
            <Box sx={{
              mb: 1.5,
              p: 1.5,
              bgcolor: debugError ? (debugError.includes('❌') || debugError.includes('💀') ? '#ffebee' : '#e8f5e8') : '#fff3e0',
              borderRadius: 1,
              border: '1px solid',
              borderColor: debugError ? (debugError.includes('❌') || debugError.includes('💀') ? '#f44336' : '#4caf50') : '#ff9800'
            }}>
              <Typography variant="caption" sx={{
                fontFamily: 'monospace',
                fontSize: '11px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                display: 'block'
              }}>
                {!pdnConsent ? <Trans>⚠️ Примите соглашение на обработку ПДн</Trans> : debugError}
              </Typography>

              {/* Кнопка диагностики камер */}
              {debugError && debugError.includes(_(msg`Видео: нет`)) && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={async () => {
                    setDebugError(_(msg`🔍 Ищем доступные камеры...`));
                    try {
                      const devices = await navigator.mediaDevices.enumerateDevices();
                      const cameras = devices.filter(d => d.kind === 'videoinput');
                      setDebugError(`📷 Камер найдено: ${cameras.length}\n${cameras.map((c, i) => `${i+1}. ${c.label || _(msg`Неизвестная камера`)}`).join('\n')}`);
                    } catch (e: any) {
                      setDebugError(_(msg`❌ Ошибка поиска камер: ${e.message}`));
                    }
                  }}
                  sx={{ mt: 0.5, fontSize: '11px', py: 0.5 }}
                >
                  🔍 <Trans>Найти камеры</Trans>
                </Button>
              )}
            </Box>
          )}

          {/* КОМПАКТНЫЙ статус - только для микрофона когда согласие УЖЕ дано */}
          {pdnConsent && !micReady && !debugError && (
            <Typography 
              variant="caption" 
              sx={{ 
                display: 'block',
                mb: 1,
                color: 'text.secondary',
                fontSize: '12px',
                textAlign: 'center'
              }}
            >
              <Trans>⏳ Проверяем микрофон...</Trans>
            </Typography>
          )}

          {/* Компактное предупреждение о молчащем микрофоне */}
          {micReady && micLevel < 1 && pdnConsent && !debugError && (
            <Typography 
              variant="caption" 
              sx={{ 
                display: 'block',
                mb: 1,
                color: 'warning.main',
                fontSize: '12px',
                textAlign: 'center',
                fontWeight: 500
              }}
            >
              <Trans>⚠️ Микрофон не ловит звук. Проверьте громкость или физическую кнопку отключения</Trans>
            </Typography>
          )}

          <Button
            variant="contained"
            onClick={startInterview}
            disabled={!micReady || !pdnConsent}
            fullWidth
            size="large"
            sx={{
              minHeight: '48px',
              fontSize: '16px',
              fontWeight: 600,
              boxShadow: 2,
              '&:not(:disabled):hover': {
                boxShadow: 4,
              },
            }}
          >
            {micReady && pdnConsent
              ? <Trans>Начать интервью</Trans>
              : <Trans>Подготовка...</Trans>
            }
          </Button>
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
                <Typography variant="h6" fontWeight={600} sx={{ color: '#000' }}><Trans>Интервью</Trans></Typography>
                <Typography variant="caption" sx={{ color: '#666' }}><Trans>AI-ассистент</Trans></Typography>
              </Box>
            </Box>
            <Box sx={{display:'flex',alignItems:'center',gap:2}}>
              {total && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ color: '#666', fontSize: '13px' }}>
                    <Trans>{getQuestionNumber(question.position)} из {total}</Trans>
                  </Typography>
                </Box>
              )}
              {/* Показываем прогресс если интервью продолжается */}
              {interviewProgress && canContinue && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ color: '#25d366', fontSize: '13px', fontWeight: 600 }}>
                    <Trans>Продолжение: {interviewProgress.current} из {interviewProgress.total}
                  </Trans></Typography>
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
              value={interviewProgress && canContinue
                ? (interviewProgress.percentage)
                : (( question.position + 1 ) / total) * 100
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
            <Typography variant="caption" sx={{ color: '#666', fontSize: '11px' }}><Trans>
              {timeLeft} сек
            </Trans></Typography>
          )}

          {/* Уведомление о продолжении интервью */}
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
              <Typography variant="body2" sx={{ color: '#2e7d32', fontSize: '13px' }}><Trans>
                Интервью продолжается с вопроса {interviewProgress.current} из {interviewProgress.total} ({interviewProgress.percentage}% завершено)
              </Trans></Typography>
            </Box>
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
              // Если сообщений мало (<=5), выравниваем сверху, иначе снизу
              justifyContent: chat.length <= 5 ? 'flex-start' : 'flex-end',
              // Запрет выделения и копирования текста
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none'
            }}>
              {chat.map((m,i)=>(
                m.text=== 'typing' ? (
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
                    mb: 1,
                    // Добавляем анимацию удаления
                    ...(deletingMessageIndex === i && {
                      animation: `${fadeOutSlide} 0.4s ease-out forwards`
                    })
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
                                  <Typography sx={{ fontSize: '12px', opacity: 0.8 }}><Trans>Подключение к камере...</Trans></Typography>
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
                                }}><Trans>Загрузка видео...</Trans></Box>
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

                      {/* Аудио-визуализация для записи без камеры */}
                      {!cameraEnabled && m.text.includes(_(msg`🎤 Запись аудио`)) && (
                        <Box sx={{
                          mb: 1,
                          p: 2,
                          bgcolor: '#1976d2',
                          borderRadius: '8px',
                          maxWidth: '280px',
                          display: 'flex',
                          alignItems: 'center',
                          flexDirection: 'column',
                          gap: 1
                        }}>
                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            color: 'white'
                          }}>
                            <MicIcon sx={{ fontSize: '20px' }} />
                            <Typography sx={{ fontSize: '14px', fontWeight: 'bold' }}><Trans>Запись аудио</Trans></Typography>
                            <Box sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              bgcolor: '#ff4444',
                              animation: `${pulse} 1s infinite`
                            }} />
                          </Box>

                          {/* Индикатор уровня звука */}
                          <Box sx={{
                            width: '100%',
                            maxWidth: '200px',
                            height: '8px',
                            bgcolor: 'rgba(255,255,255,0.2)',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            position: 'relative'
                          }}>
                            <Box
                              style={{width: `${Math.max(micLevel * 2, 5)}%`}}
                              sx={{
                              height: '100%',
                              bgcolor: '#4caf50',
                              borderRadius: '4px',
                              transition: 'width 0.1s linear'
                            }} />
                          </Box>

                          <Typography sx={{
                            fontSize: '12px',
                            color: 'rgba(255,255,255,0.8)'
                          }}><Trans>Говорите в микрофон</Trans></Typography>
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

        {/* Fixed Bottom Controls - WhatsApp Style */}
        <Box sx={{
          p: isMobile ? 2 : 3,
          bgcolor: '#ffffff',
          borderTop: '1px solid #e0e0e0',
          flexShrink: 0,
          boxShadow: '0 -1px 3px rgba(0,0,0,0.1)',
          position: 'relative' // Для абсолютного позиционирования индикатора
        }}>
          {/* Индикатор записи ПОВЕРХ кнопок (не сдвигает их) */}
          {recording && (
            <Box sx={{
              position: 'absolute',
              top: isMobile ? -70 : -80, // Выше кнопок
              left: isMobile ? 8 : 16,
              right: isMobile ? 8 : 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
              p: 2,
              bgcolor: '#fff3f3',
              borderRadius: '12px',
              border: '2px solid #ff4444',
              boxShadow: '0 2px 8px rgba(255, 68, 68, 0.2)',
              zIndex: 5
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

          {/* answer input – только аудио */}
          <Box sx={{
            display: "flex",
            gap: 2,
            justifyContent: 'flex-start',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center'
          }}>
            {!recording && !recordedBlob ? (
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
                  {loadingNextQuestion ? _(msg`Обработка ответа...`) : _(msg`🎤 Записать ответ`)}
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
                  <Trans>⏭️ Пропустить</Trans>
                </Button>
              </>
            ) : recording ? (
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
              ><Trans>⏹️ Остановить запись</Trans></Button>
            ) : recordedBlob ? (
              <>
                <Button
                  variant="contained"
                  color="success"
                  size={isMobile ? 'large' : 'medium'}
                  onClick={handleSubmitRecording}
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
                  {loadingNextQuestion ? _(msg`Отправка...`) : _(msg`✓ Отправить ответ`)}
                </Button>
                <Button
                  variant="outlined"
                  size={isMobile ? 'large' : 'medium'}
                  onClick={handleRetake}
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
                ><Trans>🔄 Переписать</Trans></Button>
              </>
            ) : null}
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
            <Typography variant="h6" sx={{ color: '#000', fontWeight: 600 }}><Trans>Пропустить вопрос?</Trans></Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: 2, pb: 1 }}>
            <Typography sx={{
              color: '#666',
              lineHeight: 1.5,
              textAlign: 'center',
              fontSize: '14px'
            }}><Trans>
              Вы уверены, что хотите пропустить этот вопрос?
              </Trans><br />
              <Box component="span" sx={{
                color: '#ff9800',
                fontWeight: 600,
                fontSize: '13px'
              }}><Trans>Внимание:</Trans></Box> <Trans>Пропущенный вопрос будет засчитан как отсутствие ответа.</Trans>
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
              <Trans>Отмена</Trans>
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
            ><Trans>Пропустить</Trans></Button>
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
          <Trans>🗑️ Удаление данных</Trans>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph sx={{ mb: 2 }}><Trans>
            <strong>Внимание!</strong> Вы собираетесь удалить все свои данные с платформы SofiHR.
          </Trans></Typography>

          <Typography variant="body2" paragraph>
            <strong><Trans>Что будет удалено:</Trans></strong>
          </Typography>
          <Box sx={{ pl: 2, mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}><Trans>• Ваши персональные данные (имя, email, телефон)</Trans></Typography>
            <Typography variant="body2" sx={{ mb: 1 }}><Trans>• Видео и аудио записи интервью</Trans></Typography>
            <Typography variant="body2" sx={{ mb: 1 }}><Trans>• Результаты анализа и оценки</Trans></Typography>
            <Typography variant="body2" sx={{ mb: 1 }}><Trans>• Все согласия на обработку данных</Trans></Typography>
          </Box>

          <Typography variant="body2" paragraph color="error.main"><Trans>
            <strong>Это действие нельзя отменить!</strong> После удаления данные будут потеряны навсегда.
          </Trans></Typography>

          <Typography variant="body2" paragraph>
            <strong><Trans>Для подтверждения введите "УДАЛИТЬ":</Trans></strong>
          </Typography>

          <TextField
            fullWidth
            value={forgetMeConfirmed}
            onChange={(e) => setForgetMeConfirmed(e.target.value)}
            placeholder={_(msg`Введите УДАЛИТЬ для подтверждения`)}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            onClick={() => setForgetMeDialogOpen(false)}
            variant="outlined"
            sx={{ mr: 2 }}
          >
            <Trans>Отмена</Trans>
          </Button>
          <Button
            onClick={handleForgetMe}
            variant="contained"
            color="warning"
            disabled={forgetMeConfirmed !== _(msg`УДАЛИТЬ`) || forgetMeLoading}
            startIcon={forgetMeLoading ? <CircularProgress size={20} /> : null}
          >
            {forgetMeLoading ? _(msg`Удаляю...`) : _(msg`Удалить навсегда`)}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );

}
