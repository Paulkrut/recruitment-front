"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  IconPlus,
  IconUsers,
  IconArrowsDiff,
  IconEye,
  IconLink,
  IconCheck,
  IconClock,
  IconRefresh,
} from "@tabler/icons-react";
import PageContainer from "@/app/components/container/PageContainer";
import { apiFetch } from "@/utils/api";

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

interface Template {
  id: number;
  title: string;
}

interface Candidate {
  id: number;
  name: string;
  token: string;
  status: string;
  aiStatus?: string;
  email?: string;
  phone?: string;
}

export default function HRCandidatesPage() {
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
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const selectedReady = selectedIds.length >= 2 && selectedIds.every((id) => {
    const cand = candidates.find((c) => c.id === id);
    return cand?.aiStatus === "done";
  });

  /* effects */
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
  }, [token]);

  async function fetchTemplates() {
    const res = await apiFetch(`${API_BASE}/api/admin/templates?limit=1000`);
    if (!res.ok) return;
    const data = await res.json();
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
    const resCand = await apiFetch(`${API_BASE}/api/admin/candidates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone: phoneCand }),
    });
    if (!resCand.ok) {
      setError("Не удалось создать кандидата");
      return;
    }
    const cand = await resCand.json();
    const resAssign = await apiFetch(`${API_BASE}/api/admin/candidates/${cand.id}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId }),
    });
    if (!resAssign.ok) {
      setError("Не удалось назначить интервью");
      return;
    }
    const data = await resAssign.json();
    setGeneratedLink(data.link);
    fetchCandidates();
    setShowCreateDialog(false);
    // Reset form
    setName("");
    setEmail("");
    setPhoneCand("");
    setTemplateId("");
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "in_progress":
        return "warning";
      case "pending":
        return "info";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Завершено";
      case "in_progress":
        return "В процессе";
      case "pending":
        return "Ожидает";
      default:
        return status;
    }
  };

  if (!token) {
    return (
      <PageContainer title="HR: Вход" description="Вход в систему">
        <Box sx={{ p: 4, maxWidth: 400, mx: "auto" }}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom align="center">
                HR: Вход в систему
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
              <Button variant="contained" fullWidth onClick={login}>
                Войти
              </Button>
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Кандидаты" description="Управление кандидатами">
      <Box>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <IconUsers size={32} color="#2196f3" />
            <Typography variant="h4" fontWeight="600">
              Кандидаты
            </Typography>
            <Chip label={candidates.length} color="primary" />
          </Box>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<IconRefresh size={20} />}
              onClick={fetchCandidates}
            >
              Обновить
            </Button>
            <Button
              variant="contained"
              startIcon={<IconPlus size={20} />}
              onClick={() => setShowCreateDialog(true)}
            >
              Создать кандидата
            </Button>
          </Box>
        </Box>

        {/* Compare Button */}
        {selectedIds.length > 0 && (
          <Box mb={3}>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<IconArrowsDiff size={20} />}
              disabled={!selectedReady}
              onClick={() => {
                const qs = selectedIds.join(",");
                window.location.href = `/hr/candidates/compare?ids=${qs}`;
              }}
            >
              Сравнить {selectedIds.length} кандидатов
              {!selectedReady && " (ожидается завершение AI анализа)"}
            </Button>
          </Box>
        )}

        {/* Candidates Grid */}
        <Grid container spacing={3}>
          {candidates.map((candidate) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={candidate.id}>
              <Card
                sx={{
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 4,
                  },
                }}
                onClick={() => {
                  if (selectedIds.includes(candidate.id)) {
                    setSelectedIds(selectedIds.filter(id => id !== candidate.id));
                  } else {
                    setSelectedIds([...selectedIds, candidate.id]);
                  }
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Typography variant="h6" fontWeight="600">
                      {candidate.name}
                    </Typography>
                    <Chip
                      size="small"
                      color={selectedIds.includes(candidate.id) ? "primary" : "default"}
                      label={selectedIds.includes(candidate.id) ? "Выбрано" : "Выбрать"}
                    />
                  </Box>

                  <Box mb={2}>
                    <Chip
                      label={getStatusLabel(candidate.status)}
                      color={getStatusColor(candidate.status) as any}
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    {candidate.aiStatus === "done" && (
                      <Chip
                        icon={<IconCheck size={14} />}
                        label="AI готов"
                        color="success"
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    )}
                    {candidate.aiStatus === "pending" && (
                      <Chip
                        icon={<IconClock size={14} />}
                        label="AI анализирует"
                        color="warning"
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Box>

                  <Box display="flex" gap={1}>
                    <Tooltip title="Просмотреть профиль">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`/hr/candidates/${candidate.id}`, "_blank");
                        }}
                      >
                        <IconEye size={16} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Открыть интервью">
                      <IconButton
                        size="small"
                        color="success"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`/interview/${candidate.token}`, "_blank");
                        }}
                      >
                        <IconLink size={16} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {candidates.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              Нет кандидатов
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Создайте первого кандидата, чтобы начать работу
            </Typography>
          </Box>
        )}

        {/* Create Candidate Dialog */}
        <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Создать нового кандидата</DialogTitle>
          <DialogContent>
            <TextField
              label="Имя"
              fullWidth
              sx={{ mb: 2, mt: 1 }}
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
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Шаблон интервью</InputLabel>
              <Select
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value as number)}
                label="Шаблон интервью"
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
            </FormControl>
            {generatedLink && (
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Ссылка на интервью:</strong>
                </Typography>
                <a href={generatedLink} target="_blank" rel="noreferrer">
                  {generatedLink}
                </a>
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowCreateDialog(false)}>Отмена</Button>
            <Button
              variant="contained"
              onClick={createCandidate}
              disabled={!name || !templateId}
            >
              Создать и получить ссылку
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageContainer>
  );
} 