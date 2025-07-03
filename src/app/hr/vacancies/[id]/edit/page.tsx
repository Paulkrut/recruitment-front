"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Typography, Paper, TextField, Button } from "@mui/material";
import { apiFetch } from "@/utils/api";

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

export default function VacancyEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
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
      .then((v) => {
        setTitle(v.title);
        setDescription(v.description || "");
      });
  }, [token, id]);

  if (!token) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Нет доступа</Typography>
      </Box>
    );
  }

  async function handleSave() {
    await apiFetch(`${API_BASE}/api/admin/vacancies/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });
    router.push(`/hr/vacancies/${id}`);
  }

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Редактировать вакансию
      </Typography>
      <Paper sx={{ p: 2 }}>
        <TextField
          label="Название"
          fullWidth
          sx={{ mb: 2 }}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField
          label="Описание"
          fullWidth
          multiline
          minRows={4}
          sx={{ mb: 2 }}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="contained" onClick={handleSave} disabled={!title.trim()}>
            Сохранить
          </Button>
          <Button variant="outlined" onClick={() => router.back()}>
            Отмена
          </Button>
        </Box>
      </Paper>
    </Box>
  );
} 