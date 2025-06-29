"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { apiFetch } from "@/utils/api";

const API_BASE =
  process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

interface Template {
  id: number;
  title: string;
}
interface Candidate {
  id: number;
  name: string;
  token: string;
  status: string;
}

export default function HrPage() {
  /* ---------------- state ---------------- */
  const [token, setToken] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [templates, setTemplates] = useState<Template[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  // form values
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneCand, setPhoneCand] = useState("");
  const [templateId, setTemplateId] = useState<number | "">("");
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  /* ---------------- effects ---------------- */
  useEffect(() => {
    const saved = localStorage.getItem("recruitment_token");
    if (saved) {
      setToken(saved);
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    fetchTemplates();
    fetchCandidates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  /* ---------------- API ---------------- */
  async function fetchTemplates() {
    const res = await apiFetch(`${API_BASE}/api/admin/templates?limit=1000`);
    if (!res.ok) return;
    const data = await res.json();
    // новый API может вернуть {items:[...]}, старый – сразу массив
    setTemplates(Array.isArray(data) ? data : data.items || []);
  }

  async function fetchCandidates() {
    const res = await apiFetch(`${API_BASE}/api/admin/candidates`);
    if (res.ok) {
      setCandidates(await res.json());
    }
  }

  async function login() {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      if (!res.ok) throw new Error("Auth error");
      const data = await res.json();
      localStorage.setItem("recruitment_token", data.token);
      setToken(data.token);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function createCandidate() {
    if (!token || !name || !templateId) return;

    // 1. create candidate
    const resCand = await apiFetch(`${API_BASE}/api/admin/candidates`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, phone: phoneCand }),
    });

    if (!resCand.ok) {
      setError("Не удалось создать кандидата");
      return;
    }

    const cand = await resCand.json();

    // 2. assign template
    const resAssign = await apiFetch(
      `${API_BASE}/api/admin/candidates/${cand.id}/assign`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      }
    );

    if (!resAssign.ok) {
      setError("Не удалось назначить интервью");
      return;
    }

    const data = await resAssign.json();
    setGeneratedLink(data.link);

    // refresh list
    fetchCandidates();
  }

  /* ---------------- render: auth form ---------------- */
  if (!token) {
    return (
      <Box sx={{ p: 4, maxWidth: 400, mx: "auto" }}>
        <Typography variant="h5" gutterBottom>
          HR: вход
        </Typography>

        <TextField
          label="Телефон"
          fullWidth
          sx={{ mb: 2 }}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <TextField
          label="Пароль"
          type="password"
          fullWidth
          sx={{ mb: 2 }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button variant="contained" onClick={login}>
          Войти
        </Button>

        {error && (
          <Typography color="error" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
      </Box>
    );
  }

  /* ---------------- render: dashboard ---------------- */
  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{display:'flex',justifyContent:'space-between',alignItems:'center',mb:3}}>
        <Typography variant="h4">HR-кабинет</Typography>
        <Box sx={{display:'flex',gap:2}}>
          <Button href="/hr" color="primary" variant="outlined" size="small">Кандидаты</Button>
          <Button href="/hr/templates" color="primary" variant="outlined" size="small">Шаблоны</Button>
        </Box>
      </Box>

      {/* create candidate */}
      <Paper sx={{ p: 3, mb: 4, maxWidth: 600 }}>
        <Typography variant="h6" gutterBottom>
          Создать кандидата
        </Typography>

        <TextField
          label="Имя"
          fullWidth
          sx={{ mb: 2 }}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <TextField
          label="Email"
          fullWidth
          sx={{ mb: 2 }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          label="Телефон"
          fullWidth
          sx={{ mb: 2 }}
          value={phoneCand}
          onChange={(e) => setPhoneCand(e.target.value)}
        />

        <Select
          fullWidth
          displayEmpty
          sx={{ mb: 2 }}
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value as number)}
        >
          <MenuItem value="">
            <em>Выберите шаблон</em>
          </MenuItem>
          {templates.map((t) => (
            <MenuItem key={t.id} value={t.id}>
              {t.title}
            </MenuItem>
          ))}
        </Select>

        <Button
          variant="contained"
          onClick={createCandidate}
          disabled={!name || !templateId}
        >
          Создать и получить ссылку
        </Button>

        {generatedLink && (
          <Typography sx={{ mt: 2 }}>
            <b>Ссылка:</b>{" "}
            <a href={generatedLink} target="_blank" rel="noreferrer">
              {generatedLink}
            </a>
          </Typography>
        )}
      </Paper>

      {/* candidates table */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Кандидаты
        </Typography>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Имя</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Ссылка</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {candidates.map((c) => (
              <TableRow key={c.id}>
                <TableCell><a href={`/hr/candidate/${c.id}`}>{c.id}</a></TableCell>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.status}</TableCell>
                <TableCell>
                  <a
                    href={`/interview/${c.token}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    ссылка
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
} 