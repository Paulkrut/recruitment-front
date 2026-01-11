"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
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
  Alert,
} from "@mui/material";
import ForgetMeAuto from "@/app/components/ForgetMeAuto";
import VacancyInfoStep from "./VacancyInfoStep";
import InterviewResultsScreen from "./InterviewResultsScreen";
import EquipmentCheckScreen from "./EquipmentCheckScreen";
import ActiveInterviewScreen from "./ActiveInterviewScreen";
import FeedbackProgressBar from "./FeedbackProgressBar";
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  console.log('🎯 Component render start:', {
    token,
    'searchParams string': searchParams?.toString(),
    'skipVacancyInfo param': searchParams?.get('skipVacancyInfo'),
  });

  /* ---------------- vacancy info logic ---------------- */
  // Просто читаем параметр из URL - не нужен useState
  const skipVacancyInfo = searchParams?.get('skipVacancyInfo') === 'true';
  const [vacancyData, setVacancyData] = useState<any>(null);
  const [candidateData, setCandidateData] = useState<any>(null);

  console.log('🔎 After skipVacancyInfo check:', {
    skipVacancyInfo,
    type: typeof skipVacancyInfo
  });

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
  const [forgetMeDialogOpen, setForgetMeDialogOpen] = useState(false);
  const [forgetMeLoading, setForgetMeLoading] = useState(false);
  const [forgetMeConfirmed, setForgetMeConfirmed] = useState('');
  // Дубликаты хелперов удалены - используем только первый блок

  // Состояние для записанного blob (перед отправкой)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);


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
  // const hasTestVideoTrack = useMemo(() => !!(testStream && testStream.getVideoTracks().length > 0), [testStream]); // ❌ Не используется
  // const [debugError, setDebugError] = useState<string>(''); // ❌ Не используется - функция diagnoseCameras не вызывается



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

  // Helper: удаление последнего сообщения пользователя из чата
  const removeLastUserMessage = () => {
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
  };

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
    fetch(`${API_BASE}/api/public/interview/${token}/prepare`)
      .then(r=>r.json())
      .then(data => {
        console.log('✅ Prepare API response:', data);
        console.log('🔄 Setting prepared state...');
        setPrepared(data);
        console.log('✅ Prepared state SET');
        
        // Extract vacancy and candidate data if available
        if (data.vacancy) {
          console.log('✅ Vacancy data found:', data.vacancy);
          setVacancyData(data.vacancy);
        } else {
          console.log('⚠️ No vacancy data in response - using mock data for testing');
          // ВРЕМЕННО: Мок-данные для тестирования UI
          // TODO: Удалить когда бэкенд будет отдавать vacancy
          const mockVacancy = {
            title: 'Frontend-разработчик (React)',
            company: 'SofiHR',
            location: 'Москва, удалённо',
            salary: '150 000 - 200 000 ₽',
            description: `Мы ищем опытного Frontend-разработчика для работы над платформой автоматизации рекрутинга.
            
Вы будете работать с современным стеком технологий (React, TypeScript, Next.js) и влиять на архитектуру продукта.

Наша команда создаёт инновационное решение для HR-специалистов, которое помогает экономить время и находить лучших кандидатов.`,
            responsibilities: [
              'Разработка пользовательских интерфейсов на React',
              'Написание чистого, типизированного кода (TypeScript)',
              'Взаимодействие с API, оптимизация производительности',
              'Code review и участие в архитектурных решениях'
            ],
            requirements: [
              'Опыт работы с React от 2 лет',
              'Знание TypeScript, Redux/MobX или Zustand',
              'Понимание принципов REST API',
              'Опыт работы с Git',
              'Умение писать чистый, поддерживаемый код'
            ]
          };
          console.log('📦 Setting mock vacancy:', mockVacancy);
          setVacancyData(mockVacancy);
        }
        
        if (data.candidate) {
          console.log('✅ Candidate data found:', data.candidate);
          setCandidateData(data.candidate);
        } else {
          console.log('⚠️ No candidate data in response - using mock data for testing');
          // ВРЕМЕННО: Мок-данные для тестирования UI
          // TODO: Удалить когда бэкенд будет отдавать candidate
          const mockCandidate = {
            firstName: 'Иван',
            lastName: 'Петров',
            email: 'ivan.petrov@example.com'
          };
          console.log('📦 Setting mock candidate:', mockCandidate);
          setCandidateData(mockCandidate);
        }
        
        console.log('🏁 Prepare useEffect completed');
      })
      .catch(err => {
        console.error('❌ Prepare API error:', err);
      });
  },[token]);


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

    // Если есть записанный blob, значит это переписывание - удаляем последнее сообщение пользователя
    if (recordedBlob) {
      console.log('Retake: removing last user message');
      setRecordedBlob(null);
      setMediaRecorder(null);

      // Находим и удаляем последнюю реплику пользователя с видео или аудио
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
    }

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
          removeLastUserMessage();

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
      removeLastUserMessage();
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
    // setSkipDialogOpen(false); // ❌ Диалог убран
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

  // Helper function для отправки ответа
  function submitAnswer() {
    if (recordedBlob) {
      sendBlobAnswer(recordedBlob);
      setRecordedBlob(null);
    }
  }

  /* ---------------- render ---------------- */
  if (result) {
    if (showFeedback && feedbackData) {
      return <InterviewResultsScreen
          feedbackData={feedbackData}
          token={token as string}
          isMobile={isMobile}
          stepperComp={stepperComp}
          onSendEmailClick={sendFeedbackToEmail}
      />;
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
            <FeedbackProgressBar elapsedTime={elapsedTime} estimatedTime={estimatedTime} />
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

    // 🆕 Показываем информацию о вакансии если нет параметра skipVacancyInfo
    if (!skipVacancyInfo) {
      console.log('✅ Rendering VacancyInfoStep inside if(!question) block');
      return (
        <VacancyInfoStep
          vacancy={vacancyData || {
            title: 'Frontend-разработчик (React)',
            company: 'SofiHR',
            location: 'Москва, удалённо',
            salary: '150 000 - 200 000 ₽',
            description: 'Мы ищем опытного Frontend-разработчика для работы над инновационной платформой для автоматизации HR-процессов. Вы будете участвовать в разработке современных веб-приложений с использованием React и TypeScript.',
            responsibilities: [
              'Разработка новых функций и поддержка существующих',
              'Оптимизация производительности приложений',
              'Код-ревью и менторство младших разработчиков',
              'Участие в проектировании архитектуры'
            ],
            requirements: [
              'Опыт работы с React от 3 лет',
              'Знание TypeScript',
              'Опыт работы с REST API',
              'Понимание принципов UX/UI'
            ],
            companyDescription: 'SofiHR - это современная платформа для автоматизации процесса найма. Мы помогаем HR-специалистам проводить интервью с кандидатами в формате видео-чата с ИИ-ассистентом, который помогает экономить время и находить лучших кандидатов.'
          }}
          candidate={candidateData || {
            firstName: '',
            lastName: 'Кандидат'
          }}
          onContinue={() => {
            console.log('🚀 Continue to interview clicked, adding skipVacancyInfo=true');
            router.replace(`/interview/${token}?skipVacancyInfo=true`);
          }}
        />
      );
    }

    if(prepared.status==='finished'){
      // Показываем ту же страницу с кнопкой обратной связи, что и после завершения интервью
      // Имитируем состояние result = true

      if (showFeedback && feedbackData) {
        // Если обратная связь уже загружена, показываем её
      return <InterviewResultsScreen
          feedbackData={feedbackData}
          token={token as string}
          isMobile={isMobile}
          stepperComp={stepperComp}
          onSendEmailClick={sendFeedbackToEmail}
      />;
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
              <FeedbackProgressBar elapsedTime={elapsedTime} estimatedTime={estimatedTime} />
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

    return (
        <EquipmentCheckScreen
            token={token as string}
            isMobile={isMobile}
            prepared={prepared}
            stepperComp={stepperComp}
          cameraEnabled={cameraEnabled}
            pdnConsent={pdnConsent}
            onCameraToggle={setCameraEnabled}
            onPdnConsentChange={setPdnConsent}
            onStartInterview={startInterview}
            onStreamReady={setTestStream}
        />
    )
  }

  return (
    <>
      {/* Основной контент интервью - это блок срабатывает только когда question есть */}
      <ActiveInterviewScreen
          question={question}
          total={total}
          timeLeft={timeLeft}
          paused={paused}
          recording={recording}
          recordedBlob={recordedBlob}
          messages={chat}
          userInputText=""
          isMobile={isMobile}
          cameraEnabled={cameraEnabled}
          mediaStream={previewStream}
          interviewProgress={interviewProgress}
          canContinue={canContinue}
          loadingNextQuestion={loadingNextQuestion}
          stepperComp={stepperComp}
          chatRef={chatRef}
          chatScrollRef={chatScrollRef}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
          onSubmitAnswer={submitAnswer}
          onSkipQuestion={skipQuestion}
          onPauseInterview={() => {}} // ❌ Pause dialog removed
          onUserInputChange={() => {}}
          onCameraToggle={setCameraEnabled}
          onStreamReady={setPreviewStream}
          onRecordingComplete={(blob) => setRecordedBlob(blob)}
          getQuestionNumber={getQuestionNumber}
          formatMessageTime={formatMessageTime}
      />;

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
