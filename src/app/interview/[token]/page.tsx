"use client";

import { useEffect, useRef, useState, KeyboardEvent, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  LinearProgress,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Tooltip,
  IconButton,
  Divider,
  Chip,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import { keyframes } from "@mui/system";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import VideocamIcon from "@mui/icons-material/Videocam";
import MicIcon from "@mui/icons-material/Mic";
import { IconMicrophone, IconVideo, IconClock, IconCheck } from "@tabler/icons-react";
import Scrollbar from "@/app/components/custom-scroll/Scrollbar"; // Assuming this is available as in chat component

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
  const { token } = useParams<{ token: string }>();

  /* ---------------- state ---------------- */
  const [prepared, setPrepared] = useState<{total:number;durationSec:number;status:string}|null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [chat, setChat] = useState<{ role: "bot" | "user"; text: string }[]>(
    []
  );
  const [result, setResult] = useState<any>(null);
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement|null>(null);
  const [previewStream, setPreviewStream] = useState<MediaStream|null>(null);
  const [testStream, setTestStream] = useState<MediaStream|null>(null);
  const testVideoRef = useRef<HTMLVideoElement|null>(null);
  const [micLevel,setMicLevel] = useState(0);
  const [micReady,setMicReady] = useState(false);
  const analyserRef = useRef<AnalyserNode|null>(null);
  const rafRef = useRef<number|null>(null);
  const [transcription, setTranscription] = useState<string>(''); // New state for live transcription
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);

  const chatRef = useRef<HTMLDivElement | null>(null);
  const blink = keyframes`50%{opacity:0.2}`;

  /* ---------------- helpers ---------------- */
  function scrollToBottom() {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }

  /* ---------------- effects ---------------- */
  // autoscroll
  useEffect(scrollToBottom, [chat]);

  // countdown by question
  useEffect(() => {
    if (question) {
      const totalSec = question.maxTime || 120;
      setTimeLeft(totalSec);
      const id = setInterval(() =>
          setTimeLeft((prev) => (prev! <= 1 ? 0 : prev! - 1)),
        1000);
      return () => clearInterval(id);
    }
  }, [question]);

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
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: { width: 640, height: 480 } });
      setPreviewStream(stream);
      const mr = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      mr.onstop = () => {
        if (chunks.length === 0) {
          alert("Запись не содержит данных. Попробуйте ещё раз.");
          setRecording(false);
          stream.getTracks().forEach((t) => t.stop());
          setPreviewStream(null);
          return;
        }
        const blob = new Blob(chunks, { type: 'video/webm' });
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
      console.error(err);
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
    mediaRecorder?.stop();
  }

  // auto-stop по таймеру
  useEffect(() => {
    if (!recording) return;
    if (timeLeft === 0) {
      stopRecording();
    }
  }, [timeLeft, recording]);

  // Initialize speech recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      speechRecognitionRef.current = new SpeechRecognition();
      speechRecognitionRef.current.continuous = true;
      speechRecognitionRef.current.interimResults = true;
      speechRecognitionRef.current.lang = 'ru-RU'; // Assuming Russian based on UI text

      speechRecognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setTranscription(transcript);
      };

      speechRecognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
      };
    }
  }, []);

  // Start/stop transcription with recording
  useEffect(() => {
    if (recording && speechRecognitionRef.current) {
      speechRecognitionRef.current.start();
    } else if (!recording && speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      setTranscription('');
    }
  }, [recording]);

  // useEffect to bind srcObject
  useEffect(()=>{
    if(videoRef.current){
      videoRef.current.srcObject = previewStream || null;
    }
  },[previewStream]);

  /* ---------------- handlers ---------------- */
  async function sendBlobAnswer(blob: Blob) {
    if (!question) return;

    // optimistic UI update
    setChat((p) => [
      ...p,
      { role: "user", text: transcription || "(видео-ответ)" }, // Use transcription if available
      { role: "bot", text: "typing" },
    ]);
    const typingIdx = chat.length + 1;

    const fd = new FormData();
    fd.append("questionId", String(question.id));
    fd.append("video", new File([blob], "answer.webm", { type: blob.type }));
    await fetch(`${API_BASE}/api/public/interview/${token}/answer`, {
      method: "POST",
      body: fd,
    });

    const r = await fetch(`${API_BASE}/api/public/interview/${token}/next`);

    if (!r.ok) {
      // interview finished
      setChat((p) => p.filter((_, i) => i !== typingIdx));
      const res = await fetch(
        `${API_BASE}/api/public/interview/${token}/result`
      );
      setResult(await res.json());
      return;
    }

    const d = await r.json();

    // if server returns no question – finish
    if (!d.question) {
      const res = await fetch(
        `${API_BASE}/api/public/interview/${token}/result`
      );
      setResult(await res.json());
      return;
    }

    setQuestion(d.question);
    setChat((p) => {
      const cp = [...p];
      cp[typingIdx] = { role: "bot", text: d.question.text };
      return cp;
    });
  }

  /* ---------------- render ---------------- */
  if (result) {
    return (
      <Box sx={{ p: 4, maxWidth: 800, mx: "auto" }}>
        <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
          <CardContent sx={{ textAlign: "center" }}>
            <Typography variant="h4" gutterBottom>
              Спасибо за прохождение интервью!
            </Typography>
            <Typography sx={{mb:3}}>
              Наш менеджер свяжется с вами после проверки ответов.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Вы можете закрыть эту страницу.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (!question) {
    if(!prepared){
      return (<Box sx={{p:4,textAlign:'center'}}><CircularProgress /></Box>);
    }
    if(prepared.status==='finished'){
      return (
        <Box sx={{p:4,maxWidth:800,mx:'auto'}}>
          <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <CardContent sx={{textAlign:'center'}}>
              <Typography variant="h4" gutterBottom>Интервью уже пройдено</Typography>
              <Typography>Наш менеджер свяжется с вами для дальнейшего шага.</Typography>
            </CardContent>
          </Card>
        </Box>
      );
    }

    const min = Math.ceil(prepared.durationSec/60);
    return (
      <Box sx={{p:4,maxWidth:800,mx:'auto'}}>
        <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent>
            <Typography variant="h4" gutterBottom>Перед началом</Typography>
            <Typography sx={{mb:2}}>Тест состоит из {prepared.total} вопросов (в процессе могут появляться уточняющие) и займет примерно {min} мин.</Typography>
            <Typography sx={{mb:4}}>Во время прохождения нельзя ставить собеседование на паузу, повторять или пропускать вопросы. Отвечайте последовательно и не перегружайте страницу — дополнительное время будет выделено автоматически для уточняющих вопросов.</Typography>
            <Button variant="contained" color="secondary" onClick={startInterview}>Начать</Button>
          </CardContent>
        </Card>

        {/* Device test preview */}
        {testStream && (
          <Card sx={{mt:3, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Проверка оборудования</Typography>
              <video ref={testVideoRef} width={320} height={240} autoPlay muted playsInline style={{border:'1px solid #fff',borderRadius:4, backgroundColor: 'rgba(0,0,0,0.2)'}} />
              <Box sx={{display:'flex',alignItems:'center',mt:1,width:320}}>
                <GraphicEqIcon sx={{mr:1}}/>
                <Box sx={{flexGrow:1,height:10,bgcolor:'rgba(255,255,255,0.2)',borderRadius:5,overflow:'hidden'}}>
                  <Box sx={{width:`${micLevel}%`,height:'100%',bgcolor:'white',transition:'width 0.1s linear'}} />
                </Box>
              </Box>
              <Grid container spacing={2} mt={1}>
                <Grid item xs={6}>
                  <Box sx={{display:'flex',alignItems:'center',gap:0.5}}>
                    <VideocamIcon color={testStream?"success":"error" as any}/>
                    <Typography variant="body2" color={testStream?"success.main":"error.main"}>{testStream?"Камера OK":"Камера выкл."}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{display:'flex',alignItems:'center',gap:0.5}}>
                    <MicIcon color={micReady?"success":"error" as any}/>
                    <Typography variant="body2" color={micReady?"success.main":"error.main"}>{micReady?"Микрофон OK":"Микрофон выкл."}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: "auto" }}>
      <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', mb: 3 }}>
        <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h5">Интервью</Typography>
          {total && (
            <Chip label={`${question.position + 1}/${total}`} color="secondary" />
          )}
        </CardContent>
      </Card>

      {/* chat list */}
      <Card sx={{ height: 400, overflow: "hidden", mb: 2, background: 'rgba(255,255,255,0.05)' }}>
        <Scrollbar>
          <List>
            {chat.map((m, i) => (
              <ListItem key={i} alignItems="flex-start" sx={{ justifyContent: m.role === 'bot' ? 'flex-start' : 'flex-end' }}>
                {m.role === 'bot' && (
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <SmartToyIcon />
                    </Avatar>
                  </ListItemAvatar>
                )}
                <ListItemText
                  primary={
                    m.text === "typing" ? (
                      <Box component="span" sx={{ animation: `${blink} 1s infinite step-start` }}>
                        •••
                      </Box>
                    ) : (
                      <Paper sx={{ p: 2, bgcolor: m.role === 'bot' ? 'primary.light' : 'secondary.light', maxWidth: '70%' }}>
                        {m.text}
                      </Paper>
                    )
                  }
                />
                {m.role === 'user' && (
                  <ListItemAvatar sx={{ ml: 1 }}>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                )}
              </ListItem>
            ))}
          </List>
        </Scrollbar>
      </Card>

      {/* progress */}
      {total && (
        <LinearProgress variant="determinate" value={(question.position / total) * 100} sx={{ mb: 1, height: 8, borderRadius: 4 }} />
      )}
      {timeLeft !== null && (
        <Typography variant="caption" display="block" gutterBottom>{timeLeft} сек</Typography>
      )}

      {/* answer input – video recording */}
      <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            {!recording ? (
              <Button variant="contained" color="secondary" startIcon={<IconVideo />} onClick={startRecording} disabled={recording}>
                Записать видео-ответ
              </Button>
            ) : (
              <Button variant="outlined" color="error" startIcon={<IconVideo />} onClick={stopRecording}>
                Стоп
              </Button>
            )}
          </Box>

          {/* preview */}
          {previewStream && (
            <Box sx={{ position: 'relative' }}>
              <video ref={videoRef} width={480} height={360} autoPlay muted playsInline style={{ border:'2px solid white', borderRadius:8, backgroundColor: 'rgba(0,0,0,0.2)' }} />
              {recording && (
                <Box sx={{ position: 'absolute', bottom: 10, left: 10, bgcolor: 'rgba(0,0,0,0.5)', p: 1, borderRadius: 4, color: 'white' }}>
                  <Typography variant="body2">Live transcription: {transcription}</Typography>
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
