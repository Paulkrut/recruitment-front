"use client";
import { useEffect, useState } from "react";
import { Box, Paper, Typography, Stack, TextField, Button, Alert, CircularProgress } from "@mui/material";
import PageContainer from "@/app/components/container/PageContainer";
import { apiFetch } from "@/utils/api";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import { useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';


const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

function InvitesBlock({ onAccept }: { onAccept: () => void }) {
  const [invites, setInvites] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`${API_BASE}/api/user/invites`);
      if (res.ok) {
        const data = await res.json();
        setInvites(Array.isArray(data) ? data : []);
      } else {
        setError("Ошибка загрузки приглашений");
        setInvites([]);
      }
    } catch (err) {
      setError("Ошибка загрузки приглашений");
      setInvites([]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => { load(); }, []);
  
  const handleAccept = async (id: number) => {
    setError(null);
    try {
      const res = await apiFetch(`${API_BASE}/api/company/invite/${id}/accept`, { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        onAccept();
        load();
      } else {
        setError(data.error || "Ошибка");
      }
    } catch (err) {
      setError("Ошибка принятия приглашения");
    }
  };
  
  const handleDecline = async (id: number) => {
    setError(null);
    try {
      const res = await apiFetch(`${API_BASE}/api/company/invite/${id}/decline`, { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        load();
      } else {
        setError(data.error || "Ошибка");
      }
    } catch (err) {
      setError("Ошибка отклонения приглашения");
    }
  };
  
  if (loading) {
    return (
      <Paper sx={{ p: 4, width: "100%", maxWidth: 600, mb: 4 }}>
        <Box display="flex" justifyContent="center" p={2}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }
  
  if (invites.length === 0) return null;
  
  return (
    <Paper sx={{ p: 4, width: "100%", maxWidth: 600, mb: 4 }}>
      <Typography variant="h6" gutterBottom>Вас пригласили в компании:</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
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
  const { _ } = useLingui();

  const { companies, isLoading, error: contextError, refreshCompanies, setCurrentCompany } = useUser();
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const select = async (company: any) => {
    setCurrentCompany(company);
    router.push("/hr");
  };

  const create = async () => {
    setError(null); 
    setSuccess(null);
    setCreating(true);
    
    try {
      const res = await apiFetch(`${API_BASE}/api/company`, { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ name }) 
      });
      const d = await res.json();
      if (d.id) {
        setSuccess("Компания создана!");
        setName("");
        await refreshCompanies();
      } else {
        setError(d.error || "Ошибка создания компании");
      }
    } catch (err) {
      setError("Ошибка создания компании");
    } finally {
      setCreating(false);
    }
  };

  if (isLoading) {
    return (
      <PageContainer title={_(msg`Выбор компании`)}>
        <Box minHeight="100vh" display="flex" justifyContent="center" alignItems="center">
          <CircularProgress size={60} />
        </Box>
      </PageContainer>
    );
  }

  if (contextError) {
    return (
      <PageContainer title={_(msg`Выбор компании`)}>
        <Box minHeight="100vh" display="flex" justifyContent="center" alignItems="center">
          <Alert severity="error" sx={{ maxWidth: 600 }}>
            Ошибка загрузки данных: {contextError}
          </Alert>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer title={_(msg`Выбор компании`)}>
      <Box minHeight="100vh" display="flex" flexDirection="column" alignItems="center" pt={8} gap={4}>
        <InvitesBlock onAccept={refreshCompanies} />
        
        <Paper sx={{ p: 4, width: "100%", maxWidth: 600, mb: 4 }}>
          <Typography variant="h5" gutterBottom>Выберите компанию</Typography>
          <Stack spacing={2} mt={2}>
            {companies && companies.length > 0 ? companies.map((c: any) => (
              <Button 
                key={c.id} 
                variant="outlined" 
                size="large" 
                sx={{ fontSize: 18, py: 2 }} 
                onClick={() => select(c)}
              >
                {c.name} ({c.role})
              </Button>
            )) : (
              <Typography color="text.secondary">
                У вас пока нет компаний. Создайте новую компанию или примите приглашение.
              </Typography>
            )}
          </Stack>
        </Paper>
        
        <Paper sx={{ p: 4, width: "100%", maxWidth: 600 }}>
          <Typography variant="h6" gutterBottom>Создать новую компанию</Typography>
          <Stack direction="row" spacing={2} mt={2}>
            <TextField 
              value={name} 
              onChange={e => setName(e.target.value)} 
              size="small" 
              fullWidth 
              placeholder={_(msg`Название компании`)}
              disabled={creating}
            />
            <Button 
              variant="contained" 
              onClick={create} 
              disabled={!name.trim() || creating}
            >
              {creating ? <CircularProgress size={20} /> : "Создать"}
            </Button>
          </Stack>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
        </Paper>
      </Box>
    </PageContainer>
  );
} 