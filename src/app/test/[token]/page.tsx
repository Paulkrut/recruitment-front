'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Stack,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  Chip,
  Checkbox,
  FormControlLabel,
  Paper,
  TextField,
  Grid,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { keyframes } from '@mui/system';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ProductionWebcamComponent from './ProductionWebcamComponent';
import { useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';


interface Question {
  id: number;
  text: string;
  type: string;
  maxTime: number;
  regulationId: number;
  regulationTitle: string;
}

interface TestInfo {
  id: number;
  title: string;
  description: string;
  questionsPerRegulation: number;
  timeLimitMinutes: number;
}

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test';
const steps = [_(msg`Подготовка`), _(msg`Настройка оборудования`), _(msg`Тестирование`), _(msg`Завершено`)];

export default function RegulationTestPage() {
  const { _ } = useLingui();

  const { token } = useParams<{ token: string }>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Состояние приглашения
  const [loading, setLoading] = useState(true);
  const [testInfo, setTestInfo] = useState<TestInfo | null>(null);
  const [invitationType, setInvitationType] = useState<string>('');
  const [employeeEmail, setEmployeeEmail] = useState('');

  // Форма регистрации (для general invitations)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [pdnConsent, setPdnConsent] = useState(false);

  // Шаги
  const [currentStep, setCurrentStep] = useState(0); // 0: подготовка, 1: оборудование, 2: тестирование, 3: результаты

  // Оборудование
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [testStream, setTestStream] = useState<MediaStream | null>(null);
  const [micLevel, setMicLevel] = useState(0);
  const [micReady, setMicReady] = useState(false);
  const [debugError, setDebugError] = useState<string>('');

  // Сессия тестирования
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [timerStarted, setTimerStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Результаты
  const [finished, setFinished] = useState(false);
  const [finalScore, setFinalScore] = useState<number>(0);

  const currentQuestion = questions[currentQuestionIndex];

  // Определяем активный шаг
  useEffect(() => {
    if (finished) setCurrentStep(3);
    else if (sessionId) setCurrentStep(2);
  }, [finished, sessionId]);

  const blink = keyframes`50%{opacity:0.2}`;

  useEffect(() => {
    loadInvitation();
  }, [token]);

  // Таймер для текущего вопроса
  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0 && sessionId && timerStarted) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null || prev <= 1) {
            // Время вышло - автоотправка
            if (intervalRef.current) clearInterval(intervalRef.current);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [timeLeft, sessionId, timerStarted, currentQuestionIndex]);

  const loadInvitation = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/public/regulation-tests/invitation/${token}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 404 || errorData.error === 'invitation_not_found') {
          setTestInfo(null);
          alert('❌ Приглашение не найдено\n\n' +
                'Возможные причины:\n' +
                '• Ссылка неверная или устарела\n' +
                '• Приглашение было удалено HR-менеджером\n\n' +
                '📧 Пожалуйста, запросите новое приглашение.');
        } else if (response.status === 403 || response.status === 410) {
          setTestInfo(null);
          alert('❌ Приглашение истекло или уже использовано\n\n' +
                '📧 Запросите новое приглашение у вашего HR-менеджера.');
        } else {
          setTestInfo(null);
          alert('❌ Ошибка загрузки приглашения\n\n' +
                (errorData.message || _(msg`Не удалось загрузить информацию о тесте.`)));
        }
        setLoading(false);
        return;
      }

      const data = await response.json();
      setTestInfo(data.test);
      setInvitationType(data.type);
      setEmployeeEmail(data.employeeEmail || '');
      setLoading(false);
    } catch (error) {
      console.error('Error loading invitation:', error);
      setTestInfo(null);
      setLoading(false);
      alert('❌ Ошибка соединения\n\n' +
            'Не удалось загрузить приглашение.\n\n' +
            '🔄 Проверьте подключение к интернету и обновите страницу.');
    }
  };

  const handleStartTest = async () => {
    try {
      const body: any = { token };

      if (invitationType === 'general') {
        if (!name || !email) {
          alert(_(msg`Пожалуйста, заполните все обязательные поля`));
          return;
        }
        body.name = name;
        body.email = email;
        body.department = department;
      }

      const response = await fetch(
        `${API_BASE}/api/public/regulation-tests/invitation/${token}/start`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Обрабатываем разные типы ошибок
        if (response.status === 402 || errorData.error === 'insufficient_balance') {
          alert('❌ У компании закончились тесты на балансе\n\n' +
                'К сожалению, HR-отдел вашей компании исчерпал лимит доступных тестов.\n\n' +
                '📧 Пожалуйста, свяжитесь с вашим руководителем или HR-менеджером для пополнения баланса.\n\n' +
                'Они смогут приобрести дополнительные тесты в личном кабинете.');
          return;
        }

        if (response.status === 404 || errorData.error === 'invitation_not_found') {
          alert('❌ Приглашение не найдено\n\n' +
                'Возможные причины:\n' +
                '• Ссылка устарела или была удалена\n' +
                '• Приглашение уже было использовано\n' +
                '• Срок действия приглашения истёк\n\n' +
                '📧 Запросите новое приглашение у вашего HR-менеджера.');
          return;
        }

        if (response.status === 403 || errorData.error === 'invitation_expired') {
          alert('❌ Срок действия приглашения истёк\n\n' +
                'Данное приглашение больше недействительно.\n\n' +
                '📧 Пожалуйста, запросите новое приглашение у вашего HR-менеджера.');
          return;
        }

        if (response.status === 410 || errorData.error === 'invitation_used') {
          alert('❌ Приглашение уже использовано\n\n' +
                'Вы уже проходили тест по этому приглашению, или лимит использований исчерпан.\n\n' +
                '📧 Если вам нужно пройти тест повторно, запросите новое приглашение у вашего HR-менеджера.');
          return;
        }

        // Общая ошибка с деталями, если они есть
        const errorMessage = errorData.message || _(msg`Не удалось начать тест`);
        alert('❌ Ошибка при запуске теста\n\n' + errorMessage + '\n\n' +
              '📧 Если проблема повторяется, обратитесь к вашему HR-менеджеру.');
        return;
      }

      const data = await response.json();
      setSessionId(data.sessionId);
      setQuestions(data.questions);

      // Начинаем таймер для первого вопроса
      if (data.questions && data.questions.length > 0) {
        setTimeLeft(data.questions[0].maxTime || 120);
        setTimerStarted(true);
      }
    } catch (error) {
      console.error('Error starting test:', error);
      alert('❌ Ошибка соединения\n\n' +
            'Не удалось связаться с сервером.\n\n' +
            '🔄 Проверьте подключение к интернету и попробуйте ещё раз.\n\n' +
            '📧 Если проблема повторяется, обратитесь к вашему HR-менеджеру.');
    }
  };

  const handleStartRecording = useCallback(() => {
    console.log('Starting recording...', { testStream, hasGetWebcamStream: !!(window as any).getWebcamStream });

    let stream = testStream;

    if (!stream && (window as any).getWebcamStream) {
      console.log('Trying to get stream from window.getWebcamStream()');
      stream = (window as any).getWebcamStream();
    }

    if (!stream) {
      console.error('No stream available. testStream:', testStream, 'getWebcamStream:', (window as any).getWebcamStream);
      alert(_(msg`Нет доступного потока для записи. Проверьте, что камера/микрофон подключены.`));
      return;
    }

    console.log('Stream found:', stream, 'Video tracks:', stream.getVideoTracks().length, 'Audio tracks:', stream.getAudioTracks().length);

    try {
      // Определяем тип записи: видео или только аудио
      const hasVideo = stream.getVideoTracks().length > 0;
      const hasAudio = stream.getAudioTracks().length > 0;

      console.log('Recording mode:', hasVideo ? 'video+audio' : 'audio-only');

      // Выбираем MIME тип в зависимости от наличия видео
      let mimeType = hasVideo ? 'video/webm;codecs=vp8,opus' : 'audio/webm;codecs=opus';
      let recorder: MediaRecorder;

      try {
        recorder = new MediaRecorder(stream, { mimeType });
      } catch (e) {
        // Fallback без указания кодеков
        mimeType = hasVideo ? 'video/webm' : 'audio/webm';
        try {
          recorder = new MediaRecorder(stream, { mimeType });
        } catch (e2) {
          // Последний fallback без MIME типа
          recorder = new MediaRecorder(stream);
        }
      }

      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        // Создаём blob с правильным MIME типом
        const finalMimeType = hasVideo ? 'video/webm' : 'audio/webm';
        const blob = new Blob(chunks, { type: finalMimeType });
        setAudioBlob(blob);
        setRecording(false);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert(_(msg`Не удалось начать запись`));
    }
  }, [testStream, cameraEnabled]);

  const handleStopRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
  }, [mediaRecorder]);

  const handleAutoSubmit = () => {
    console.log('Auto-submitting due to timeout');

    // Если идёт запись - останавливаем и ждём blob
    if (recording && mediaRecorder) {
      console.log('Recording in progress, stopping...');

      // Создаём одноразовый обработчик для автоотправки после остановки
      const originalOnStop = mediaRecorder.onstop;
      mediaRecorder.onstop = (event) => {
        // Вызываем оригинальный обработчик (который создаёт blob)
        if (originalOnStop) originalOnStop.call(mediaRecorder, event);

        // Ждём создания blob и отправляем
        setTimeout(() => {
          console.log('Blob created after auto-stop, submitting...');
          handleSubmitAnswer();
        }, 200);
      };

      handleStopRecording();
    } else if (audioBlob) {
      // Есть готовая запись - отправляем
      console.log('Blob already exists, submitting...');
      handleSubmitAnswer();
    } else {
      // Нет записи вообще - отправляем пустой ответ
      console.log('No recording, submitting empty answer...');
      handleSubmitEmptyAnswer();
    }
  };

  const handleSubmitEmptyAnswer = async () => {
    console.log('Submitting empty answer (timeout or skipped)');

    // Останавливаем таймер
    setTimerStarted(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Активируем состояние загрузки
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('questionId', currentQuestion.id.toString());
      formData.append('answerText', ''); // Пустой ответ

      console.log('Submitting empty answer for question:', currentQuestion.id);

      const response = await fetch(
        `${API_BASE}/api/public/regulation-tests/session/${sessionId}/answer`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 402 || errorData.error === 'insufficient_balance') {
          alert('❌ Тест прерван: закончились тесты на балансе\n\n' +
                'К сожалению, HR-отдел вашей компании исчерпал лимит доступных тестов во время вашего прохождения.\n\n' +
                '📧 Пожалуйста, сообщите об этом вашему HR-менеджеру.');
          setSubmitting(false);
          return;
        }

        if (response.status === 404 || response.status === 410) {
          alert('❌ Сессия тестирования не найдена или истекла\n\n' +
                'Возможные причины:\n' +
                '• Превышено максимальное время прохождения теста\n' +
                '• Сессия была прервана\n\n' +
                '📧 Обратитесь к вашему HR-менеджеру для получения нового приглашения.');
          setSubmitting(false);
          return;
        }

        const errorMessage = errorData.message || _(msg`Не удалось отправить ответ`);
        throw new Error(errorMessage);
      }

      // Успешно отправлено - переходим к следующему вопросу
      setSubmitting(false);
      skipToNextQuestion();
    } catch (error: any) {
      console.error('Error submitting empty answer:', error);
      alert('❌ Не удалось зарегистрировать пропуск вопроса\n\n' +
            (error.message || _(msg`Произошла ошибка при отправке.`)) + '\n\n' +
            '📧 Обратитесь к вашему HR-менеджеру.');
      setSubmitting(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!audioBlob) {
      alert(_(msg`Пожалуйста, запишите ответ`));
      return;
    }

    // Останавливаем таймер
    setTimerStarted(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Активируем состояние загрузки
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('questionId', currentQuestion.id.toString());

      // Определяем тип файла по MIME типу blob
      const isVideo = audioBlob.type.includes('video');
      const fileExtension = 'webm';
      const filename = `answer_q${currentQuestion.id}_${Date.now()}.${fileExtension}`;

      // Отправляем в правильное поле: video или audio
      const fieldName = isVideo ? 'video' : 'audio';
      formData.append(fieldName, audioBlob, filename);

      console.log('Submitting answer:', { fieldName, mimeType: audioBlob.type, size: audioBlob.size });

      const response = await fetch(
        `${API_BASE}/api/public/regulation-tests/session/${sessionId}/answer`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 402 || errorData.error === 'insufficient_balance') {
          alert('❌ Тест прерван: закончились тесты на балансе\n\n' +
                'К сожалению, HR-отдел вашей компании исчерпал лимит доступных тестов во время вашего прохождения.\n\n' +
                '📧 Пожалуйста, сообщите об этом вашему HR-менеджеру.');
          // Не возвращаем возможность повторной отправки
          setSubmitting(false);
          return;
        }

        if (response.status === 404 || response.status === 410) {
          alert('❌ Сессия тестирования не найдена или истекла\n\n' +
                'Возможные причины:\n' +
                '• Превышено максимальное время прохождения теста\n' +
                '• Сессия была прервана\n\n' +
                '📧 Обратитесь к вашему HR-менеджеру для получения нового приглашения.');
          setSubmitting(false);
          return;
        }

        if (response.status === 413) {
          alert('❌ Файл слишком большой\n\n' +
                'Размер записи превышает допустимый лимит.\n\n' +
                '💡 Совет: Попробуйте записать более короткий ответ или отключите видео (только аудио).');
          // Возвращаем возможность переписать
          setSubmitting(false);
          if (timeLeft && timeLeft > 0) {
            setTimerStarted(true);
          }
          return;
        }

        // Общая ошибка
        const errorMessage = errorData.message || _(msg`Не удалось отправить ответ`);
        throw new Error(errorMessage);
      }

      // Успешно отправлено - переходим к следующему вопросу
      setSubmitting(false);
      skipToNextQuestion();
    } catch (error: any) {
      console.error('Error submitting answer:', error);
      alert('❌ Не удалось отправить ответ\n\n' +
            (error.message || _(msg`Произошла ошибка при отправке.`)) + '\n\n' +
            '🔄 Пожалуйста, попробуйте ещё раз.\n\n' +
            '📧 Если проблема повторяется, обратитесь к вашему HR-менеджеру.');

      // Возвращаем возможность повторной отправки
      setSubmitting(false);
      // Перезапускаем таймер, если время ещё есть
      if (timeLeft && timeLeft > 0) {
        setTimerStarted(true);
      }
    }
  };

  const skipToNextQuestion = () => {
    // Очищаем состояние
    setAudioBlob(null);
    setMediaRecorder(null);
    setTimerStarted(false);

    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setTimeLeft(questions[nextIndex].maxTime || 120);
      setTimerStarted(true);
    } else {
      // Завершение теста
      handleFinishTest();
    }
  };

  const handleFinishTest = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/api/public/regulation-tests/session/${sessionId}/finish`,
        {
          method: 'POST',
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 404 || response.status === 410) {
          alert('❌ Сессия не найдена или уже завершена\n\n' +
                'Возможно, тест уже был завершён ранее.\n\n' +
                '📧 Если у вас возникли вопросы, обратитесь к вашему HR-менеджеру.');
          setFinished(true);
          return;
        }

        const errorMessage = errorData.message || _(msg`Не удалось завершить тест`);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setFinalScore(data.totalScore || data.score || 0);
      setFinished(true);
    } catch (error: any) {
      console.error('Error finishing test:', error);
      alert('❌ Ошибка при завершении теста\n\n' +
            (error.message || _(msg`Произошла ошибка.`)) + '\n\n' +
            '📧 Ваши ответы сохранены. Обратитесь к вашему HR-менеджеру если возникли вопросы.');
      // Всё равно показываем экран завершения
      setFinished(true);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!testInfo) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error"><Trans>Приглашение не найдено или истекло</Trans></Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      {/* Header с Stepper */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #e0e0e0', p: 2 }}>
        <Box sx={{ maxWidth: '900px', mx: 'auto' }}>
          <Stepper activeStep={currentStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, p: { xs: 2, md: 4 }, maxWidth: '900px', mx: 'auto', width: '100%' }}>
        {/* Шаг 1: Подготовка */}
        {currentStep === 0 && (
          <Paper sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom>
              {testInfo.title}
            </Typography>
            <Typography variant="body1" paragraph>
              {testInfo.description}
            </Typography>

            {invitationType === 'general' && (
              <Box sx={{ mt: 3 }}>
                <TextField
                  fullWidth
                  label={_(msg`Ваше имя`)}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  sx={{ mb: 2 }}
                  required
                />
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{ mb: 2 }}
                  required
                />
                <TextField
                  fullWidth
                  label={_(msg`Отдел (необязательно)`)}
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  sx={{ mb: 2 }}
                />

                {/* Согласие на обработку ПДн */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={pdnConsent}
                      onChange={(e) => setPdnConsent(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" component="span">
                      Соглашаюсь на обработку моих персональных данных для прохождения тестирования.{' '}
                      <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Политика конфиденциальности</a>
                      {' '}<span style={{ color: 'red' }}>*</span>
                    </Typography>
                  }
                  sx={{ mt: 1, alignItems: 'center' }}
                />
              </Box>
            )}

            {invitationType === 'named' && employeeEmail && (
              <>
                <Alert severity="info" sx={{ mt: 3 }}>
                  Вы приглашены на тестирование как: <strong>{employeeEmail}</strong>
                </Alert>

                {/* Согласие на обработку ПДн для именного приглашения */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={pdnConsent}
                      onChange={(e) => setPdnConsent(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" component="span">
                      Соглашаюсь на обработку моих персональных данных для прохождения тестирования.{' '}
                      <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Политика конфиденциальности</a>
                      {' '}<span style={{ color: 'red' }}>*</span>
                    </Typography>
                  }
                  sx={{ mt: 2, alignItems: 'center' }}
                />
              </>
            )}

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={() => {
                if (invitationType === 'general') {
                  if (!name || !email) {
                    alert(_(msg`Пожалуйста, заполните все обязательные поля`));
                    return;
                  }
                  if (!pdnConsent) {
                    alert(_(msg`Необходимо согласие на обработку персональных данных`));
                    return;
                  }
                }
                if (invitationType === 'named' && !pdnConsent) {
                  alert(_(msg`Необходимо согласие на обработку персональных данных`));
                  return;
                }
                setCurrentStep(1);
              }}
              disabled={!pdnConsent || (invitationType === 'general' && (!name || !email))}
              sx={{ mt: 3 }}
            >
              Далее
            </Button>
          </Paper>
        )}

        {/* Шаг 2: Настройка оборудования */}
        {currentStep === 1 && (
          <Paper sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom><Trans>Настройка оборудования</Trans></Typography>
            <Typography variant="body2" paragraph>
              Тестирование состоит из {testInfo.questionsPerRegulation} вопросов.
              На каждый вопрос отводится ограниченное время.
            </Typography>
            <Typography variant="body2" paragraph><Trans>Во время прохождения нельзя ставить тестирование на паузу или пропускать вопросы.
              Отвечайте последовательно и не перегружайте страницу.</Trans></Typography>

            <ProductionWebcamComponent
              cameraEnabled={cameraEnabled}
              onCameraToggle={() => setCameraEnabled(!cameraEnabled)}
              onStreamReady={setTestStream}
              onMicLevelChange={setMicLevel}
              onMicReady={setMicReady}
              onError={setDebugError}
            />

            {debugError && (
              <Alert severity={debugError.includes('✅') ? 'success' : 'info'} sx={{ mt: 2 }}>
                {debugError}
              </Alert>
            )}

            {/* Индикатор уровня микрофона */}
            {micReady && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom><Trans>Микрофон подключен</Trans></Typography>
                <Typography variant="body2" gutterBottom>
                  Уровень микрофона: {Math.round(micLevel)}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={micLevel}
                  sx={{ height: 8, borderRadius: 1 }}
                />
              </Box>
            )}

            {/* Чекбокс согласия на видео */}
            {micReady && (
              <Box sx={{ mt: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={cameraEnabled}
                      onChange={() => setCameraEnabled(!cameraEnabled)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2"><Trans>Согласие на запись видео (снимите галочку — будет только аудио)</Trans></Typography>
                  }
                  sx={{ alignItems: 'center' }}
                />
              </Box>
            )}

            {/* Чекбокс согласия на обработку ПДн */}
            <Box sx={{ mt: 3, mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={pdnConsent}
                    onChange={(e) => setPdnConsent(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2" component="span">
                    Соглашаюсь на обработку моих персональных данных для прохождения тестирования по регламентам.{' '}
                    <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Политика ПДн</a>. Медиа хранятся до 60 дней.
                  </Typography>
                }
                sx={{ alignItems: 'center' }}
              />
            </Box>

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleStartTest}
              disabled={!micReady || !pdnConsent}
              sx={{ mt: 2 }}
            ><Trans>Начать тестирование</Trans></Button>
          </Paper>
        )}

        {/* Шаг 3: Тестирование */}
        {currentStep === 2 && currentQuestion && (
          <Paper sx={{ p: 3 }}>
            {/* 1. Вопрос N из N с регламентом */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Вопрос {currentQuestionIndex + 1} из {questions.length}
              </Typography>
              <Chip
                label={currentQuestion.regulationTitle}
                color="primary"
                size="small"
              />
            </Box>

            {/* 2. Прогресс прохождения теста */}
            <Box sx={{ mb: 3 }}>
              <LinearProgress
                variant="determinate"
                value={((currentQuestionIndex + 1) / questions.length) * 100}
                sx={{ height: 10, borderRadius: 1, mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                Прогресс: {currentQuestionIndex + 1} / {questions.length} ({Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%)
              </Typography>
            </Box>

            {/* 3. Видео */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
              <ProductionWebcamComponent
                cameraEnabled={cameraEnabled}
                onCameraToggle={() => setCameraEnabled(!cameraEnabled)}
                onStreamReady={setTestStream}
                onMicLevelChange={setMicLevel}
                onMicReady={setMicReady}
                onError={setDebugError}
              />
            </Box>

            {/* 4. Текст вопроса */}
            <Typography variant="h6" sx={{ fontSize: '20px', lineHeight: 1.6, mb: 3, textAlign: 'center' }}>
              {currentQuestion.text}
            </Typography>

            {/* 5. Таймер (Осталось + countdown) */}
            {timeLeft !== null && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h5"
                  color={timeLeft < 30 ? 'error.main' : 'primary.main'}
                  sx={{ fontWeight: 'bold', textAlign: 'center', mb: 1 }}
                >
                  Осталось: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(timeLeft / (currentQuestion.maxTime || 120)) * 100}
                  color={timeLeft < 30 ? 'error' : 'primary'}
                  sx={{ height: 12, borderRadius: 1 }}
                />
              </Box>
            )}

            {/* Яркий индикатор записи */}
            {recording && (
              <Alert
                severity="error"
                icon={<GraphicEqIcon sx={{ fontSize: 28 }} />}
                sx={{
                  mb: 3,
                  animation: `${blink} 1s infinite`,
                  fontSize: '18px',
                  fontWeight: 'bold',
                  lineHeight: '140%',
                  '& .MuiAlert-icon': {
                    fontSize: 32
                  }
                }}
              >
                🔴 ИДЁТ ЗАПИСЬ ОТВЕТА - Говорите в микрофон
              </Alert>
            )}

            {/* 6. Кнопки управления */}
            <Stack direction={isMobile ? 'column' : 'row'} spacing={2} justifyContent="center">
              {!recording && !audioBlob && (
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleStartRecording}
                  fullWidth={isMobile}
                  sx={{
                    minWidth: isMobile ? 'auto' : 250,
                    py: 1.5,
                    fontSize: '18px',
                    fontWeight: 'bold'
                  }}
                ><Trans>🎤 Начать ответ</Trans></Button>
              )}

              {recording && (
                <Button
                  variant="contained"
                  color="error"
                  size="large"
                  onClick={handleStopRecording}
                  fullWidth={isMobile}
                  sx={{
                    minWidth: isMobile ? 'auto' : 250,
                    py: 1.5,
                    fontSize: '18px',
                    fontWeight: 'bold'
                  }}
                ><Trans>⏹ Остановить запись</Trans></Button>
              )}

              {audioBlob && (
                <>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => {
                      setAudioBlob(null);
                      setMediaRecorder(null);
                      // Сразу запускаем новую запись
                      setTimeout(() => handleStartRecording(), 100);
                    }}
                    disabled={submitting}
                    fullWidth={isMobile}
                    sx={{ minWidth: isMobile ? 'auto' : 150 }}
                  >
                    🔄 Переписать
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    size="large"
                    onClick={handleSubmitAnswer}
                    disabled={submitting}
                    startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                    fullWidth={isMobile}
                    sx={{
                      minWidth: isMobile ? 'auto' : 200,
                      py: 1.5,
                      fontSize: '18px',
                      fontWeight: 'bold'
                    }}
                  >
                    {submitting ? _(msg`Отправка...`) : _(msg`✓ Отправить ответ`)}
                  </Button>
                </>
              )}
            </Stack>
          </Paper>
        )}

        {/* Шаг 4: Завершено */}
        {currentStep === 3 && (
          <Paper sx={{ p: 5, textAlign: 'center', maxWidth: 600, mx: 'auto' }}>
            <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 3 }} />

            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}><Trans>Спасибо за прохождение теста!</Trans></Typography>

            <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 3, lineHeight: 1.8 }}><Trans>Ваши ответы успешно получены и отправлены на проверку HR-специалисту вашей компании.</Trans></Typography>

            <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 3, lineHeight: 1.8 }}><Trans>Результаты тестирования будут проанализированы, и вы получите обратную связь от вашего руководителя или HR-отдела в ближайшее время.</Trans></Typography>

            <Box
              sx={{
                mt: 4,
                p: 3,
                bgcolor: 'primary.50',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'primary.100'
              }}
            >
              <Typography variant="body2" color="primary.dark" sx={{ fontWeight: 500 }}><Trans>💡 Если у вас возникли вопросы по тестированию, обратитесь к вашему HR-менеджеру</Trans></Typography>
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
