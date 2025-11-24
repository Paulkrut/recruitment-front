"use client";
import React, { useState } from 'react';
import PageContainer from '@/app/components/container/PageContainer';
import { Box, Typography, Tab, Tabs, TextField, Button, Paper, Stack } from '@mui/material';
import { useEffect } from 'react';
import { apiFetch } from '@/utils/api';
import { useLingui } from '@lingui/react';
import { msg, Trans } from '@lingui/macro';


export default function SettingsPage(){
  const { _ } = useLingui();

  const [tab,setTab]=useState('users');

  return (
    <PageContainer title={_(msg`Настройки HR`)}>
      <Box p={4}>
        <Typography variant="h4" gutterBottom><Trans>Настройки</Trans></Typography>
        <Tabs value={tab} onChange={(_,v)=>setTab(v)} sx={{mb:3}}>
          <Tab label={_(msg`Пользователи & роли`)} value="users" />
          <Tab label={_(msg`Интеграции`)} value="integrations" />
          <Tab label={_(msg`Интервью`)} value="interview" />
          <Tab label={_(msg`Брендирование`)} value="branding" />
        </Tabs>

        {tab==='users' && <UsersTab/>}
        {tab==='integrations' && <IntegrationsTab/>}
        {tab==='interview' && <InterviewTab/>}
        {tab==='branding' && <BrandingTab/>}
      </Box>
    </PageContainer>
  );
}

/* ------------ Users ------------ */
function UsersTab(){
  // заглушка списка пользователей
  return (
    <Paper sx={{p:3}}>
      <Typography variant="h6" gutterBottom><Trans>Управление пользователями</Trans></Typography>
      <Typography><Trans>Функционал в разработке: добавление HR-пользователей, назначение ролей.</Trans></Typography>
    </Paper>
  );
}

/* ------------ Integrations ------------ */
function IntegrationsTab(){
  const [form,setForm]=useState({openAi:'',smtp:'',webhook:''});
  const handle=(f:keyof typeof form)=>(e:React.ChangeEvent<HTMLInputElement>)=>setForm({...form,[f]:e.target.value});
  return (
    <Paper sx={{p:3}}>
      <Typography variant="h6" gutterBottom><Trans>Интеграции</Trans></Typography>
      <Stack spacing={2} maxWidth={400}>
        <TextField label="OpenAI API Key" value={form.openAi} onChange={handle('openAi')} fullWidth placeholder="sk-…" />
        <TextField label="SMTP DSN" value={form.smtp} onChange={handle('smtp')} fullWidth placeholder="smtp://user:pass@host:port" />
        <TextField label="Webhook URL" value={form.webhook} onChange={handle('webhook')} fullWidth placeholder="https://example.com/hook" />
        <Button variant="contained" disabled><Trans>Сохранить (demo)</Trans></Button>
      </Stack>
    </Paper>
  );
}

/* ------------ Interview ------------ */
function InterviewTab(){
  const [maxTime,setMaxTime]=useState(120);
  return (
    <Paper sx={{p:3,maxWidth:300}}>
      <Typography variant="h6" gutterBottom><Trans>Параметры интервью</Trans></Typography>
      <TextField label={_(msg`Дефолтное время ответа (сек)`)} type="number" value={maxTime} onChange={e=>setMaxTime(parseInt(e.target.value))} fullWidth sx={{mb:2}} />
      <Button variant="contained" disabled><Trans>Сохранить (demo)</Trans></Button>
    </Paper>
  );
}

/* ------------ Branding ------------ */
function BrandingTab() {
  const [form, setForm] = useState({ name: '', logo: '' });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLead, setIsLead] = useState(false);

  useEffect(() => {
    const companyId = localStorage.getItem('current_company');
    if (!companyId) return;
    apiFetch(`/api/company/${companyId}`).then(r => r.json()).then((d:any) => {
      setForm(f => ({ ...f, name: d.name, logo: d.logo }));
    });
    apiFetch(`/api/user/companies`).then(r => r.json()).then((list: any[]) => {
      const found = list.find(c => String(c.id) === String(companyId));
      setIsLead(found?.role === 'HR_LEAD');
    });
  }, []);

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setLogoFile(e.target.files[0]);
  };
  const handleSave = async () => {
    setError(null); setSuccess(null);
    const companyId = localStorage.getItem('current_company');
    if (!companyId) return;
    let logoUrl = form.logo;
    if (logoFile) {
      const data = new FormData();
      data.append('logo', logoFile);
      const res = await apiFetch(`/api/company/${companyId}/logo`, { method: 'POST', body: data });
      const d = await res.json();
      if (d.logo) logoUrl = d.logo;
    }
    const res = await apiFetch(`/api/company/${companyId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, logo: logoUrl })
    });
    const d = await res.json();
    if (d.ok) setSuccess(_(msg`Сохранено!`)); else setError(d.error || _(msg`Ошибка`));
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 500 }}>
      <Typography variant="h6" gutterBottom><Trans>Брендирование компании</Trans></Typography>
      <Stack spacing={2}>
        <TextField
          label={_(msg`Название компании`)}
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          fullWidth
          InputProps={{ readOnly: !isLead }}
        />
        <Box>
          <Typography variant="body2"><Trans>Логотип</Trans></Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            {form.logo && <img src={form.logo} alt="logo" style={{ width: 64, height: 64, objectFit: 'contain', borderRadius: 8, background: '#eee' }} />}
            {isLead && (
              <Button variant="outlined" component="label"><Trans>Загрузить</Trans>
                <input type="file" accept="image/*" hidden onChange={handleLogo} />
              </Button>
            )}
          </Stack>
        </Box>
        {isLead && <Button variant="contained" onClick={handleSave}><Trans>Сохранить</Trans></Button>}
        {success && <Typography color="success.main">{success}</Typography>}
        {error && <Typography color="error.main">{error}</Typography>}
      </Stack>
    </Paper>
  );
}
