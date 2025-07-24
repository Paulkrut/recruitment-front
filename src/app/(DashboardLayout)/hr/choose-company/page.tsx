"use client";
import { useEffect, useState } from "react";
import { Box, Paper, Typography, Stack, TextField, Button, Alert } from "@mui/material";
import PageContainer from "@/app/components/container/PageContainer";
import { apiFetch } from "@/utils/api";

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

function InvitesBlock({ onAccept }: { onAccept: () => void }) {
  const [invites, setInvites] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const load = async () => {
    const res = await apiFetch(`${API_BASE}/api/user/invites`);
    setInvites(await res.json());
  };
  useEffect(() => { load(); }, []);
  const handleAccept = async (id: number) => {
    setError(null);
    const res = await apiFetch(`${API_BASE}/api/company/invite/${id}/accept`, { method: "POST" });
    const data = await res.json();
    if (data.ok) {
      onAccept();
      load();
    } else {
      setError(data.error || "Ошибка");
    }
  };
  const handleDecline = async (id: number) => {
    setError(null);
    const res = await apiFetch(`${API_BASE}/api/company/invite/${id}/decline`, { method: "POST" });
    const data = await res.json();
    if (data.ok) {
      load();
    } else {
      setError(data.error || "Ошибка");
    }
  };
  if (invites.length === 0) return null;
  return (
    <Paper sx={{ p: 4, width: "100%", maxWidth: 600, mb: 4 }}>
      <Typography variant="h6" gutterBottom>Вас пригласили в компании:</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <Stack spacing={2}>
        {invites.map(inv => (
          <Stack key={inv.id} direction="row" spacing={2} alignItems="center">
            <Typography><b>{inv.company}</b> — роль: {inv.role}</Typography>
            <Button variant="contained" onClick={() => handleAccept(inv.id)}>Принять</Button>
            <Button variant="outlined" color="error" onClick={() => handleDecline(inv.id)}>Отклонить</Button>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
}

export default function ChooseCompanyPage() {
  const [list, setList] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const load = () => apiFetch(`${API_BASE}/api/user/companies`).then(r => r.json()).then((d: any) => setList(d));
  useEffect(() => {
    load();
  }, []);
  const select = (id: number) => { localStorage.setItem("current_company", String(id)); window.location.href = "/hr"; };
  const create = async () => {
    setError(null); setSuccess(null);
    const res = await apiFetch(`${API_BASE}/api/company`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    const d = await res.json();
    if (d.id) {
      setSuccess("Компания создана!");
      setName("");
      load();
    } else {
      setError(d.error || "Ошибка");
    }
  };
  return (
    <PageContainer title="Выбор компании">
      <Box minHeight="100vh" display="flex" flexDirection="column" alignItems="center" pt={8} gap={4}>
        <InvitesBlock onAccept={load} />
        <Paper sx={{ p: 4, width: "100%", maxWidth: 600, mb: 4 }}>
          <Typography variant="h5" gutterBottom>Выберите компанию</Typography>
          <Stack spacing={2} mt={2}>
            {list.length > 0 ? list.map((c: any) => (
              <Button key={c.id} variant="outlined" size="large" sx={{ fontSize: 18, py: 2 }} onClick={() => select(c.id)}>
                {c.name} ({c.role})
              </Button>
            )) : <Typography color="text.secondary">Нет компаний</Typography>}
          </Stack>
        </Paper>
        <Paper sx={{ p: 4, width: "100%", maxWidth: 600 }}>
          <Typography variant="h6" gutterBottom>Создать новую компанию</Typography>
          <Stack direction="row" spacing={2} mt={2}>
            <TextField value={name} onChange={e => setName(e.target.value)} size="small" fullWidth placeholder="Название компании" />
            <Button variant="contained" onClick={create} disabled={!name.trim()}>Создать</Button>
          </Stack>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
        </Paper>
      </Box>
    </PageContainer>
  );
} 