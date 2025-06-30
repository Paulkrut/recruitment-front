"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Typography, Paper, TextField, Button } from "@mui/material";
import { apiFetch } from "@/utils/api";

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

interface VacancyDto {
  id: number;
  title: string;
  description?: string | null;
}

export default function VacancyEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const t = localStorage.getItem("recruitment_token");
    if (t) setToken(t);
  }, []);

  useEffect(() => {
    if (!token) return;
    apiFetch(`${API_BASE}/api/admin/vacancies/${id}`)
      .then((r) => r.json())
      .then((d: VacancyDto) => {
        setTitle(d.title);
        setDescription(d.description || "");
      })
      .finally(() => setLoading(false));
  }, [id, token]);

  if (!token) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Нет доступа</Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Загрузка…</Typography>
      </Box>
    );
  }

  async function handleSave() {
    if (!title.trim()) return;
    const res = await apiFetch(`${API_BASE}/api/admin/vacancies/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });
    if (res.ok) {
      router.push(`/hr/vacancy/${id}`);
    }
  }

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Редактирование вакансии #{id}
      </Typography>
      <Paper sx={{ p: 2 }}>
        <Box
          component="form"
          noValidate
          autoComplete="off"
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="Название вакансии"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <TextField
            label="Описание вакансии"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            minRows={4}
          />
          <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
            <Button
              variant="contained"
              disabled={!title.trim()}
              onClick={handleSave}
            >
              Сохранить
            </Button>
            <Button variant="outlined" onClick={() => router.back()}>
              Отмена
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
} 