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

  /* ---------------- state ---------------- */
  const [prepared, setPrepared] = useState<{total:number;durationSec:number;status:string}|null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout|null>(null);
  const [chat, setChat] = useState<{ role: "bot" | "user"; text: string }[]>(
    []
  );
  const [result, setResult] = useState<any>(null);
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [answered,setAnswered] = useState(false);
  const [paused,setPaused] = useState(false);
  const [loadingNextQuestion, setLoadingNextQuestion] = useState(false);
  const videoRef = useRef<HTMLVideoElement|null>(null);
  const [previewStream, setPreviewStream] = useState<MediaStream|null>(null);
  const [testStream, setTestStream] = useState<MediaStream|null>(null);
  const testVideoRef = useRef<HTMLVideoElement|null>(null);
  const [micLevel,setMicLevel] = useState(0);
  const [micReady,setMicReady] = useState(false);
  const analyserRef = useRef<AnalyserNode|null>(null);
  const rafRef = useRef<number|null>(null);
  const [skipDialogOpen, setSkipDialogOpen] = useState(false);

  const chatRef = useRef<HTMLDivElement | null>(null);
  const blink = keyframes`50%{opacity:0.2}`;

  const activeStep = result ? 3 : question ? 2 : prepared ? 1 : 0;

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
    if (chatRef.current) {
      chatRef.current.scrollTo({top: chatRef.current.scrollHeight, behavior:'smooth'});
    }
  }

  /* ---------------- effects ---------------- */
  // autoscroll
  useEffect(scrollToBottom, [chat]);

  /* -------- countdown logic -------- */
  function clearCountdown(){
    if(intervalRef.current){ clearInterval(intervalRef.current); intervalRef.current=null; }
    setPaused(true);
  }
  function startCountdown(totalSec:number){
    clearCountdown();
      setTimeLeft(totalSec);
    intervalRef.current = setInterval(()=>
      setTimeLeft(prev=> (prev!==null && prev>0)? prev-1 : 0),
        1000);
    setPaused(false);
  }

  useEffect(()=>{
    clearCountdown();
    if(question){ startCountdown(question.maxTime || 120); }
    return clearCountdown;
  },[question]);

  // reset answered flag when question changes
  useEffect(()=>{ setAnswered(false); }, [question]);

  /* ---------- auto-submit on timeout ----------- */
  useEffect(()=>{
    if(timeLeft===0 && question && !answered){
      if(recording){
        stopRecording(); // onstop will send answer
      } else {
        sendEmptyAnswer();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[timeLeft,recording,answered,question]);

  // prepare
  useEffect(()=>{
    if(!token) return;
    fetch(`${API_BASE}/api/public/interview/${token}/prepare`).then(r=>r.json()).then(setPrepared);
  },[token]);

  const startDeviceTest = async () => {
    try{
      const stream = await navigator.mediaDevices.getUserMedia({audio:true,video:{width:640,height:480}});
      setTestStream(stream);
      if(testVideoRef.current){ testVideoRef.current.srcObject = stream; }
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
    }catch(e){alert('Не удалось получить доступ к камере/микрофону');}
  };

  function stopDeviceTest(){
    if(testStream){ testStream.getTracks().forEach(t=>t.stop()); setTestStream(null); }
    if(analyserRef.current){ analyserRef.current.disconnect(); analyserRef.current=null; }
    setMicReady(false);
    if(rafRef.current){ cancelAnimationFrame(rafRef.current); }
  }

  useEffect(()=>{ if(testVideoRef.current){ testVideoRef.current.srcObject = testStream || null; } },[testStream]);

  // auto start device test when prepared screen shown
  useEffect(()=>{
    if(!question && prepared && !testStream){
       startDeviceTest();
    }
  },[prepared, question]);

  async function startInterview(){
    stopDeviceTest();
    const r = await fetch(`${API_BASE}/api/public/interview/${token}/start`);
    if(!r.ok) return;
    const d = await r.json();
    setQuestion(d.question);
    setTotal(d.total);
    setChat([{role:'bot',text:d.question.text}]);
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
    try {
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
      console.log('Media stream obtained');
      setPreviewStream(stream);
      const mr = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus',
        videoBitsPerSecond: 500000 // 500 kbps
      });
      const chunks: BlobPart[] = [];
      mr.ondataavailable = (e) => {
        console.log('Data available:', e.data.size);
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
          return;
        }
        const blob = new Blob(chunks, { type: 'video/webm' });
        console.log('Blob created:', blob.size);
        
        // Сжимаем видео если оно слишком большое
        if (blob.size > 5 * 1024 * 1024) { // больше 5MB
          console.log('Video too large, compressing...');
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const video = document.createElement('video');
          
          video.onloadedmetadata = () => {
            canvas.width = 640;
            canvas.height = 480;
            ctx?.drawImage(video, 0, 0, 640, 480);
            canvas.toBlob((compressedBlob) => {
              if (compressedBlob) {
                console.log('Compressed blob size:', compressedBlob.size);
                sendBlobAnswer(compressedBlob);
              } else {
                sendBlobAnswer(blob);
              }
            }, 'video/webm', 0.5);
          };
          
          video.src = URL.createObjectURL(blob);
          video.play();
        } else {
          /* при завершении записи сразу отправляем ответ */
          sendBlobAnswer(blob);
        }
        
        setRecording(false);
        stream.getTracks().forEach((t) => t.stop());
        setPreviewStream(null);
      };
      mr.start();
      console.log('MediaRecorder started');
      setMediaRecorder(mr);
      setRecording(true);
    } catch (err: any) {
      console.error('startRecording error:', err);
      let msg = "Не удалось получить доступ к микрофону.";
      if (typeof window !== "undefined" && !window.isSecureContext) {
        msg += "\nБраузер требует HTTPS или http://localhost для доступа к микрофону. Откройте страницу по безопасному протоколу или через localhost.";
      } else if (err?.name === "NotAllowedError") {
        msg += "\nРазрешите доступ к микрофону в настройках браузера (значок камеры/микрофона в адресной строке).";
      } else if (err?.name === "NotFoundError") {
        msg += "\nУстройство микрофона не найдено.";
      }
      alert(msg);
    }
  }

  function stopRecording() {
    console.log('stopRecording called');
    mediaRecorder?.stop();
  }

  // auto-stop по таймеру
  useEffect(() => {
    if (!recording) return;
    if (timeLeft === 0) {
      stopRecording();
    }
  }, [timeLeft, recording]);

  // useEffect to bind srcObject
  useEffect(()=>{
    if(videoRef.current){
      videoRef.current.srcObject = previewStream || null;
    }
  },[previewStream]);

  /* ---------------- handlers ---------------- */
  async function sendBlobAnswer(blob: Blob) {
    if (!question) return;

    console.log('sendBlobAnswer called', { questionId: question.id, blobSize: blob.size });

    clearCountdown();
    setLoadingNextQuestion(true);
    setAnswered(true);

    // optimistic UI update (показываем, что ответ дан)
    setChat((p) => [
      ...p,
      { role: "user", text: "(аудио-ответ)" },
      { role: "bot", text: "typing" },
    ]);
    const typingIdx = chat.length + 1;

    const fd = new FormData();
    fd.append("questionId", String(question.id));
    fd.append("video", new File([blob], "answer.webm", { type: blob.type }));
    
    console.log('Sending answer to server...');
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
    setChat((p) => {
      const cp = [...p];
      cp[typingIdx] = { role: "bot", text: d.question.text };
      return cp;
    });
    setLoadingNextQuestion(false);
    setAnswered(false);
  }

  async function sendEmptyAnswer(){
    clearCountdown();
    setLoadingNextQuestion(true);
    setAnswered(true);
    if(!question) return;

    console.log('sendEmptyAnswer called', { questionId: question.id });

    // optimistic UI
    setChat((p)=>[
      ...p,
      {role:'user',text:'(нет ответа)'},
      {role:'bot',text:'typing'},
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
    setChat((p)=>{
      const cp=[...p];
      cp[typingIdx]={role:'bot',text:d.question.text};
      return cp;
    });
    setLoadingNextQuestion(false);
    setAnswered(false);
  }

  async function skipQuestion() {
    setSkipDialogOpen(false);
    await sendEmptyAnswer();
  }

  /* ---------------- render ---------------- */
  if (result) {
    return (
      <Box sx={{ p: 4, maxWidth: 600, mx: "auto", textAlign:"center" }}>
        {stepperComp}
        <Typography variant="h4" gutterBottom>
          Спасибо за прохождение интервью!
        </Typography>
        <Typography sx={{mb:3}}>
          Наш менеджер свяжется с вами после проверки ответов.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Вы можете закрыть эту страницу.
        </Typography>
      </Box>
    );
  }

  if (!question) {
    // если еще не стартовали, показываем подготовительный экран
    if(!prepared){
      return (<Box sx={{p:4}}>{stepperComp}<Typography>Загрузка…</Typography></Box>);
    }
    if(prepared.status==='finished'){
      return (
        <Box sx={{p:4,maxWidth:600,mx:'auto',textAlign:'center'}}>
          {stepperComp}
          <Typography variant="h4" gutterBottom>Интервью уже пройдено</Typography>
          <Typography>Наш менеджер свяжется с вами для дальнейшего шага.</Typography>
        </Box>
      );
    }

    const min = Math.ceil(prepared.durationSec/60);
    return (
      <Box sx={{p:4,maxWidth:600,mx:'auto'}}>
        {stepperComp}
        <Typography variant="h4" gutterBottom>Перед началом</Typography>
        <Typography sx={{mb:2}}>Тест состоит из {prepared.total} вопросов (в процессе могут появляться уточняющие) и займет примерно {min} мин.</Typography>
        <Typography sx={{mb:4}}>Во время прохождения нельзя ставить собеседование на паузу, повторять или пропускать вопросы. Отвечайте последовательно и не перегружайте страницу — дополнительное время будет выделено автоматически для уточняющих вопросов.</Typography>
        <Box sx={{display:'flex',gap:2}}>
          <Button variant="contained" onClick={startInterview}>Начать</Button>
        </Box>

        {/* Device test preview */}
        {testStream && (
          <Box sx={{mt:3}}>
            <Typography variant="h6" gutterBottom>Проверка оборудования</Typography>
            <video ref={testVideoRef} width={320} height={240} autoPlay muted playsInline style={{border:'1px solid #ccc',borderRadius:4}} />
            <Box sx={{display:'flex',alignItems:'center',mt:1,width:220}}>
              <GraphicEqIcon sx={{mr:1}}/>
              <Box sx={{flexGrow:1,height:10,bgcolor:'#eee',borderRadius:5,overflow:'hidden'}}>
                <Box sx={{width:`${micLevel}%`,height:'100%',bgcolor:'primary.main',transition:'width 0.1s linear'}} />
              </Box>
            </Box>
            <Box sx={{display:'flex',gap:2,mt:1}}>
              <Box sx={{display:'flex',alignItems:'center',gap:0.5}}>
                <VideocamIcon color={testStream?"success":"error" as any}/>
                <Typography variant="body2" color={testStream?"success.main":"error.main"}>{testStream?"Камера OK":"Камера выкл."}</Typography>
              </Box>
              <Box sx={{display:'flex',alignItems:'center',gap:0.5}}>
                <MicIcon color={micReady?"success":"error" as any}/>
                <Typography variant="body2" color={micReady?"success.main":"error.main"}>{micReady?"Микрофон OK":"Микрофон выкл."}</Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 600, mx: "auto", pb:8 }}>
      {stepperComp}
      {/* header */}
      <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', mb:1 }}>
        <Typography variant="h6" fontWeight={700}>Интервью</Typography>
        <Box sx={{display:'flex',alignItems:'center',gap:2}}>
        {total && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">Вопрос {formatQuestionNumber(question.position)} из {total}</Typography>
              {isFollowUpQuestion(question.position) && (
                <Typography variant="caption" color="primary.main" sx={{ fontWeight: 600 }}>
                  (дополнительный)
                </Typography>
              )}
            </Box>
          )}
          {timeLeft !== null && question?.maxTime && (
            <Box position="relative" display="inline-flex">
              <CircularProgress variant="determinate" value={(timeLeft / (question.maxTime || 1)) * 100} size={36} />
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
                <Typography variant="caption" component="div" color="text.secondary">
                  {timeLeft}
          </Typography>
              </Box>
            </Box>
        )}
          {paused && <PauseIcon color="action" fontSize="small" />}
        </Box>
      </Box>

      {/* chat list */}
      <Paper ref={chatRef} sx={{ height: 400, p:0, my: 2, bgcolor:'background.default' }}>
        <Scrollbar sx={{maxHeight:400, p:2}}>
          <Stack spacing={1}>
            {chat.map((m,i)=>(
              m.text=== 'typing' ? (
                <ChatBubble key={i} role={m.role} time={undefined}>
                  <Box component="span" sx={{ 
                    animation: `${blink} 1s infinite step-start`
                  }}>
                    •••
                  </Box>
                </ChatBubble>
              ) : (
                <ChatBubble key={i} role={m.role} text={m.text} time={new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} />
              )
            ))}
          </Stack>
        </Scrollbar>
      </Paper>

      {/* progress */}
      {total && (
        <LinearProgress
          variant="determinate"
          value={(question.position / total) * 100}
          sx={{ mb: 1 }}
        />
      )}
      {timeLeft !== null && (
        <Typography variant="caption">{timeLeft} сек</Typography>
      )}

      {/* answer input – только аудио */}
      <Box sx={{ display: "flex", gap: 1, mt: 1, position:'sticky', bottom:0, bgcolor:'background.default', py:1, justifyContent: 'space-between' }}>
        {!recording ? (
          <>
            <Button 
              variant="contained" 
              onClick={startRecording} 
              disabled={recording || loadingNextQuestion}
              sx={{
                fontWeight: 600,
                '&:disabled': {
                  opacity: 0.6,
                }
              }}
            >
              {loadingNextQuestion ? 'Обработка ответа...' : 'Записать ответ'}
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => setSkipDialogOpen(true)}
              disabled={recording || loadingNextQuestion}
              color="primary"
              sx={{
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  borderColor: 'primary.main',
                },
                '&:disabled': {
                  opacity: 0.6,
                }
              }}
            >
              Пропустить вопрос
          </Button>
          </>
        ) : (
          <Button variant="outlined" color="error" onClick={stopRecording}>
            Стоп
          </Button>
        )}
      </Box>

      {/* preview */}
      {previewStream && (
        <video ref={videoRef} width={320} height={240} autoPlay muted playsInline style={{ marginBottom: 8, border:'1px solid #ccc', borderRadius:4 }} />
      )}

      {/* Диалог подтверждения пропуска вопроса */}
      <Dialog open={skipDialogOpen} onClose={() => setSkipDialogOpen(false)}>
        <DialogTitle>
          Пропустить вопрос?
        </DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <Typography>
            Вы уверены, что хотите пропустить этот вопрос? 
            <br />
            <strong>Внимание:</strong> Пропущенный вопрос будет засчитан как отсутствие ответа.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSkipDialogOpen(false)} color="primary">
            Отмена
          </Button>
          <Button onClick={skipQuestion} color="warning" variant="contained">
            Пропустить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
