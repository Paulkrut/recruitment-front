"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Paper,
  CircularProgress,
} from "@mui/material";
import { apiFetch } from "@/utils/api";
import EvaluationResult from "@/components/EvaluationResult";
import { useCandidateEvaluation } from "@/hooks/useCandidateEvaluation";

const API_BASE =
  process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

interface SessionRow {
  sessionId: number;
  status: string;
  createdAt: string;
}

export default function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [token, setToken] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [name, setName] = useState<string>("");
  const [candToken, setCandToken] = useState<string>("");
  const { data: aiData } = useCandidateEvaluation(Number(id));

  useEffect(() => {
    const t = localStorage.getItem("recruitment_token");
    if (t) setToken(t);
  }, []);

  useEffect(() => {
    if (!token) return;

    // fetch candidate sessions
    apiFetch(`${API_BASE}/api/admin/candidates/${id}/status`).then(r=>r.json())
      .then((d:any) => {
        setName(d.candidate);
        setSessions(d.sessions);
        setCandToken(d.token);
      });
  }, [token, id]);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Кандидат: {name || id}
      </Typography>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Сессии интервью
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Создано</TableCell>
              <TableCell>Ссылка</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sessions.map((s) => (
              <TableRow key={s.sessionId}>
                <TableCell><a href={`/hr/session/${s.sessionId}`}>{s.sessionId}</a></TableCell>
                <TableCell>{s.status}</TableCell>
                <TableCell>{s.createdAt}</TableCell>
                <TableCell>
                  <Button
                    component="a"
                    href={`/interview/${candToken}`}
                    target="_blank"
                    size="small"
                  >
                    интервью
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* AI evaluation */}
      {aiData?.status==='done' && aiData.result ? (
        <EvaluationResult {...aiData.result} />
      ): aiData?.status==='pending' ? (
        <Box sx={{mt:3,display:'flex',alignItems:'center',gap:1}}>
          <CircularProgress size={20}/>
          <Typography>AI-оценка выполняется…</Typography>
        </Box>
      ): (
        <Typography sx={{mt:3}}>AI-оценка ещё не запущена (ожидаем завершения интервью).</Typography>
      )}
    </Box>
  );

  function dToken() {}
} 