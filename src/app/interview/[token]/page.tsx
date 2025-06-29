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
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import { keyframes } from "@mui/system";

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

  async function startInterview(){
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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const mr = new MediaRecorder(stream, { mimeType: mime });
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
          return;
        }
        const blob = new Blob(chunks, { type: mime });
        /* при завершении записи сразу отправляем ответ */
        sendAudioAnswer(blob);
        setRecording(false);
        stream.getTracks().forEach((t) => t.stop());
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

  /* ---------------- handlers ---------------- */
  async function sendAudioAnswer(blob: Blob) {
    if (!question) return;

    // optimistic UI update (показываем, что ответ дан)
    setChat((p) => [
      ...p,
      { role: "user", text: "(аудио-ответ)" },
      { role: "bot", text: "typing" },
    ]);
    const typingIdx = chat.length + 1;

    const fd = new FormData();
    fd.append("questionId", String(question.id));
    fd.append("audio", new File([blob], "answer.webm", { type: blob.type }));
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
      <Box sx={{ p: 4, maxWidth: 600, mx: "auto", textAlign:"center" }}>
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
      return (<Box sx={{p:4}}><Typography>Загрузка…</Typography></Box>);
    }
    if(prepared.status==='finished'){
      return (
        <Box sx={{p:4,maxWidth:600,mx:'auto',textAlign:'center'}}>
          <Typography variant="h4" gutterBottom>Интервью уже пройдено</Typography>
          <Typography>Наш менеджер свяжется с вами для дальнейшего шага.</Typography>
        </Box>
      );
    }

    const min = Math.ceil(prepared.durationSec/60);
    return (
      <Box sx={{p:4,maxWidth:600,mx:'auto'}}>
        <Typography variant="h4" gutterBottom>Перед началом</Typography>
        <Typography sx={{mb:2}}>Тест состоит из {prepared.total} вопросов и займет примерно {min} мин.</Typography>
        <Typography sx={{mb:4}}>Во время прохождения нельзя ставить собеседование на паузу и повторять вопросы.
        Отвечайте последовательно и не перегружайте страницу.</Typography>
        <Button variant="contained" onClick={startInterview}>Начать</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 600, mx: "auto" }}>
      {/* header */}
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h5">Интервью</Typography>
        {total && (
          <Typography>
            {question.position + 1}/{total}
          </Typography>
        )}
      </Box>

      {/* chat list */}
      <Paper
        ref={chatRef}
        sx={{ height: 400, overflowY: "auto", p: 2, my: 2 }}
      >
        <List>
          {chat.map((m, i) => (
            <ListItem key={i} alignItems="flex-start">
              <ListItemAvatar>
                <Avatar
                  sx={{ bgcolor: m.role === "bot" ? "primary.main" : "secondary.main" }}
                >
                  {m.role === "bot" ? <SmartToyIcon /> : <PersonIcon />}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  m.text === "typing" ? (
                    <Box
                      component="span"
                      sx={{ animation: `${blink} 1s infinite step-start` }}
                    >
                      •••
                    </Box>
                  ) : (
                    m.text
                  )
                }
              />
            </ListItem>
          ))}
        </List>
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
      <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
        {!recording ? (
          <Button variant="contained" onClick={startRecording} disabled={recording}>
            Записать ответ
          </Button>
        ) : (
          <Button variant="outlined" color="error" onClick={stopRecording}>
            Стоп
          </Button>
        )}
      </Box>
    </Box>
  );
}
