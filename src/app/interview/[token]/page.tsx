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
} from "@mui/material";
import { keyframes } from "@mui/system";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import VideocamIcon from "@mui/icons-material/Videocam";
import MicIcon from "@mui/icons-material/Mic";
import PauseIcon from "@mui/icons-material/PauseCircleOutline";
import ChatBubble from "@/app/components/apps/chats/ChatBubble";
import Scrollbar from "@/app/components/custom-scroll/Scrollbar";

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

  // Функция для форматирования номера вопроса
  const formatQuestionNumber = (position: number) => {
    // Если position имеет десятичную часть (например, 0.01, 0.02, 3.01, 3.02), 
    // то это дополнительный вопрос
    const mainQuestion = Math.floor(position);
    const decimalPart = position - mainQuestion;
    
    if (decimalPart > 0) {
      // Дополнительный вопрос: 1.1, 1.2, 1.3 или 3.1, 3.2, 3.3
      const followUpNumber = Math.round(decimalPart * 100); // 1, 2, 3
      // Если mainQuestion = 0, то это дополнительный вопрос к первому основному вопросу
      const actualMainQuestion = mainQuestion === 0 ? 1 : mainQuestion + 1;
      return `${actualMainQuestion}.${followUpNumber}`;
    } else {
      // Основной вопрос: 1, 2, 3, 4
      return `${position + 1}`;
    }
  };

  // Функция для определения типа вопроса
  const isFollowUpQuestion = (position: number) => {
    const mainQuestion = Math.floor(position);
    const decimalPart = position - mainQuestion;
    return decimalPart > 0;
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
      // Дополнительный скролл к новому вопросу
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
    try{
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
      
      // Проверяем разрешения
      setPermissionsGranted({
        camera: permissions.state === 'granted',
        microphone: micPermissions.state === 'granted'
      });
      setPermissionsRequested(true);
      
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
  }

  const requestPermissions = async () => {
    try {
      setPermissionsRequested(false);
      await startDeviceTest();
    } catch (e) {
      console.error('Ошибка при запросе разрешений:', e);
    }
  };

  useEffect(()=>{ if(testVideoRef.current){ testVideoRef.current.srcObject = testStream || null; } },[testStream]);

  // auto start device test when prepared screen shown
  useEffect(()=>{
    if(!question && prepared && !testStream){
       startDeviceTest();
    }
  },[prepared, question]);

  async function startInterview(){
    // Проверяем разрешения перед началом интервью
    if (!permissionsGranted.camera || !permissionsGranted.microphone) {
      alert('Для начала интервью необходимо разрешить доступ к камере и микрофону');
      return;
    }
    
    stopDeviceTest();
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
      return; // Защита от дублирования
    }

    // Устанавливаем timeLeft в null чтобы предотвратить auto-submit
    setTimeLeft(null);

    console.log('sendBlobAnswer called', { questionId: question.id });
    
    // Дополнительная проверка - если запись активна, не отправляем пустой ответ
    if (recording) {
      console.log('Recording is active, skipping empty answer');
      return;
    }

    clearCountdown();
    setLoadingNextQuestion(true);
    setAnswered(true);
    setLastAnswerTime(Date.now()); // Запоминаем время отправки ответа

    // Обновляем последнее видео-сообщение с финальным видео
    const finalVideoUrl = URL.createObjectURL(blob);
    
    // Небольшая задержка для лучшего UX - пользователь видит процесс обработки
    setTimeout(() => {
      setChat((p) => {
        const newChat = [...p];
        // Находим последнее видео-сообщение пользователя и обновляем его
        for (let i = newChat.length - 1; i >= 0; i--) {
          if (newChat[i].role === 'user' && newChat[i].video) {
            // Очищаем старый URL если он был
            if (newChat[i].video !== "live") {
              URL.revokeObjectURL(newChat[i].video);
            }
            newChat[i] = { 
              ...newChat[i], 
              video: finalVideoUrl, 
              text: "🎥 Видео ответ отправлен",
              timestamp: newChat[i].timestamp || Date.now()
            };
            break;
          }
        }
        return newChat;
      });
    }, 500); // 500ms задержка

    // Добавляем индикатор обработки
    setChat((p) => [
      ...p,
      { role: "bot", text: "typing", timestamp: Date.now() },
    ]);
    const typingIdx = chat.length + 1;

    const fd = new FormData();
    fd.append("questionId", String(question.id));
    fd.append("video", new File([blob], "answer.webm", { type: blob.type }));
    
    const answerResponse = await fetch(`${API_BASE}/api/public/interview/${token}/answer`, {
      method: "POST",
      body: fd,
    });
    console.log('Answer response:', answerResponse.status, answerResponse.ok);

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
      // Заменяем typing индикатор на новый вопрос, сохраняя видео-сообщение
      cp[typingIdx] = { role: "bot", text: d.question.text, timestamp: Date.now() };
      return cp;
    });
    setLoadingNextQuestion(false);
    setAnswered(false);
  }

  async function sendEmptyAnswer(){
    console.log('=== sendEmptyAnswer START ===', {
      questionId: question?.id,
      answered,
      recording,
      timeLeft,
      timerStarted
    });

    if (!question || answered) {
      console.log('=== sendEmptyAnswer EARLY RETURN ===', { 
        hasQuestion: !!question, 
        answered 
      });
      return; // Защита от дублирования
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
      {role:'user',text:'(нет ответа)', timestamp: Date.now()},
      {role:'bot',text:'typing', timestamp: Date.now()},
    ]);
    const typingIdx = chat.length + 1;

    const fd = new FormData();
    fd.append('questionId', String(question.id));
    fd.append('text','');
    
    console.log('Sending empty answer to server...');
    const answerResponse = await fetch(`${API_BASE}/api/public/interview/${token}/answer`,{method:'POST',body:fd});
    console.log('Empty answer response:', answerResponse.status, answerResponse.ok);

    const r = await fetch(`${API_BASE}/api/public/interview/${token}/next`);
    console.log('Next question response (empty):', r.status, r.ok);
    
    if(!r.ok){
      setChat((p)=>p.filter((_,i)=>i!==typingIdx));
      const res = await fetch(`${API_BASE}/api/public/interview/${token}/result`);
      setResult(await res.json());
      setLoadingNextQuestion(false);
      return;
    }
    const d = await r.json();
    console.log('Next question data (empty):', d);
    
    if(!d.question){
      const res = await fetch(`${API_BASE}/api/public/interview/${token}/result`);
      setResult(await res.json());
      setLoadingNextQuestion(false);
      return;
    }
    setQuestion(d.question);
    setPreviousQuestionId(d.question.id);
    setChat((p)=>{
      const cp=[...p];
      cp[typingIdx]={role:'bot',text:d.question.text, timestamp: Date.now()};
      return cp;
    });
    setLoadingNextQuestion(false);
    setAnswered(false);
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
          throw new Error('Обратная связь еще не сгенерирована');
        }
      } else {
        throw new Error('Обратная связь пока не готова');
      }
    } catch (error) {
      console.error('Error loading feedback:', error);
      // Показываем сообщение о том, что нужно начать генерацию
      alert('Обратная связь еще не сгенерирована. Нажмите кнопку для начала генерации.');
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

  async function submitCandidateOpinion() {
    if (!candidateOpinion.trim() || candidateOpinion.length < 10) {
      alert('Пожалуйста, напишите ваше мнение (минимум 10 символов)');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/public/interview/${token}/candidate-opinion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          opinion: candidateOpinion
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setOpinionSubmitted(true);
        if (data.moderated) {
          alert('Ваше мнение отправлено. Некоторые слова были заменены для соблюдения этики общения.');
        } else {
          alert('Спасибо за ваше мнение! Оно отправлено HR-менеджеру.');
        }
      } else {
        throw new Error('Ошибка отправки мнения');
      }
    } catch (error) {
      console.error('Error submitting opinion:', error);
      alert('Произошла ошибка при отправке мнения. Попробуйте позже.');
    }
  }

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

  async function startFeedbackGeneration() {
    setFeedbackLoading(true);
    setGenerationStep(0);
    setElapsedTime(0);
    setEstimatedTime(60); // 60 секунд примерное время

    // Запускаем генерацию
    try {
      const response = await fetch(`${API_BASE}/api/public/interview/${token}/generate-feedback`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'already_exists') {
          // Обратная связь уже существует, пробуем загрузить
          await loadFeedback();
          return;
        }
        
        // Запускаем поллинг и прогресс
        startProgressAnimation();
        startPolling();
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
        
        // Обновляем шаг каждые 7-8 секунд
        const newStep = Math.min(Math.floor(newTime / 7), progressMessages.length - 1);
        setGenerationStep(newStep);
        
        // Если прошло больше минуты, останавливаем прогресс
        if (newTime > 90) {
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
          
          <Box sx={{ flex: 1, mt: 3 }}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h4" gutterBottom align="center" color="primary">
                  🎯 Ваши результаты интервью
                </Typography>
                
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
                    <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                      <Typography component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                        {feedbackData.feedback.scores_table}
                      </Typography>
                    </Box>
                  </>
                )}

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>
                  🚀 Что нужно для следующего уровня
                </Typography>
                <Typography paragraph>
                  {feedbackData.feedback.next_level}
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

            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Button 
                variant="outlined" 
                onClick={() => setShowFeedback(false)}
                sx={{ mr: 2 }}
              >
                ← Назад к результатам
              </Button>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Вы можете закрыть эту страницу
              </Typography>
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
              {progressMessages[generationStep]}
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
          </Box>
        )}

        <Typography variant="body2" color="text.secondary">
          {feedbackLoading 
            ? "Система AI анализирует ваши ответы для создания персональных рекомендаций" 
            : "Узнайте свои сильные стороны, области для развития и персональные рекомендации"
          }
        </Typography>
      </Box>
    );
  }

  if (!question) {
    // если еще не стартовали, показываем подготовительный экран
    if(!prepared){
      return (
        <Box sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: isMobile ? 2 : 4,
          maxWidth: '1200px', // Ограничение ширины для больших мониторов
          mx: 'auto', // Центрирование на больших экранах
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
            
            <Box sx={{ flex: 1, mt: 3 }}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h4" gutterBottom align="center" color="primary">
                    🎯 Ваши результаты интервью
                  </Typography>
                  
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
                      <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                        <Typography component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                          {feedbackData.feedback.scores_table}
                        </Typography>
                      </Box>
                    </>
                  )}

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="h6" gutterBottom>
                    🚀 Что нужно для следующего уровня
                  </Typography>
                  <Typography paragraph>
                    {feedbackData.feedback.next_level}
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

              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Button 
                  variant="outlined" 
                  onClick={() => setShowFeedback(false)}
                  sx={{ mr: 2 }}
                >
                  ← Назад к результатам
                </Button>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Вы можете закрыть эту страницу
                </Typography>
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
                {progressMessages[generationStep]}
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
            </Box>
          )}

          <Typography variant="body2" color="text.secondary">
            {feedbackLoading 
              ? "Система AI анализирует ваши ответы для создания персональных рекомендаций" 
              : "Узнайте свои сильные стороны, области для развития и персональные рекомендации"
            }
          </Typography>
        </Box>
      );
    }

    const min = Math.ceil(prepared.durationSec/60);
    return (
      <Box sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
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

        {/* Scrollable Content */}
        <Box sx={{ 
          flex: 1, 
          overflow: 'auto',
          p: isMobile ? 2 : 4
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
              <Button 
                variant="contained" 
                color="warning" 
                onClick={requestPermissions}
                fullWidth={isMobile}
                size={isMobile ? 'large' : 'medium'}
              >
                Разрешить камеру и микрофон
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
          flexShrink: 0
        }}>
          <Button 
            variant="contained" 
            onClick={startInterview}
            disabled={permissionsRequested && (!permissionsGranted.camera || !permissionsGranted.microphone)}
            fullWidth={isMobile}
            size={isMobile ? 'large' : 'medium'}
          >
            Начать
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
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
                  {formatQuestionNumber(question.position)} из {total}
                </Typography>
              {isFollowUpQuestion(question.position) && (
                  <Typography variant="caption" sx={{ color: '#25d366', fontWeight: 600, fontSize: '11px' }}>
                    (доп.)
                </Typography>
              )}
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
        overflow: 'hidden',
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
            overflow: 'auto',
            p: { xs: 1, sm: 2 },
            // WhatsApp-like scrolling
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'thin',
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
                      <Box sx={{ mb: 1, borderRadius: '8px', overflow: 'hidden' }}>
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
                            overflow: 'hidden'
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
                                  overflow: 'hidden'
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
  );
}
