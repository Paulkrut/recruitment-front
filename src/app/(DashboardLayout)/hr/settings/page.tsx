"use client";
import React, { useState } from 'react';
import PageContainer from '@/app/components/container/PageContainer';
import { Box, Typography, Tab, Tabs, TextField, Button, Paper, Stack } from '@mui/material';

export default function SettingsPage(){
  const [tab,setTab]=useState('users');

  return (
    <PageContainer title="Настройки HR">
      <Box p={4}>
        <Typography variant="h4" gutterBottom>Настройки</Typography>
        <Tabs value={tab} onChange={(_,v)=>setTab(v)} sx={{mb:3}}>
          <Tab label="Пользователи & роли" value="users" />
          <Tab label="Интеграции" value="integrations" />
          <Tab label="Интервью" value="interview" />
        </Tabs>

        {tab==='users' && <UsersTab/>}
        {tab==='integrations' && <IntegrationsTab/>}
        {tab==='interview' && <InterviewTab/>}
      </Box>
    </PageContainer>
  );
}

/* ------------ Users ------------ */
function UsersTab(){
  // заглушка списка пользователей
  return (
    <Paper sx={{p:3}}>
      <Typography variant="h6" gutterBottom>Управление пользователями</Typography>
      <Typography>Функционал в разработке: добавление HR-пользователей, назначение ролей.</Typography>
    </Paper>
  );
}

/* ------------ Integrations ------------ */
function IntegrationsTab(){
  const [form,setForm]=useState({openAi:'',smtp:'',webhook:''});
  const handle=(f:keyof typeof form)=>(e:React.ChangeEvent<HTMLInputElement>)=>setForm({...form,[f]:e.target.value});
  return (
    <Paper sx={{p:3}}>
      <Typography variant="h6" gutterBottom>Интеграции</Typography>
      <Stack spacing={2} maxWidth={400}>
        <TextField label="OpenAI API Key" value={form.openAi} onChange={handle('openAi')} fullWidth placeholder="sk-…" />
        <TextField label="SMTP DSN" value={form.smtp} onChange={handle('smtp')} fullWidth placeholder="smtp://user:pass@host:port" />
        <TextField label="Webhook URL" value={form.webhook} onChange={handle('webhook')} fullWidth placeholder="https://example.com/hook" />
        <Button variant="contained" disabled>Сохранить (demo)</Button>
      </Stack>
    </Paper>
  );
}

/* ------------ Interview ------------ */
function InterviewTab(){
  const [maxTime,setMaxTime]=useState(120);
  return (
    <Paper sx={{p:3,maxWidth:300}}>
      <Typography variant="h6" gutterBottom>Параметры интервью</Typography>
      <TextField label="Дефолтное время ответа (сек)" type="number" value={maxTime} onChange={e=>setMaxTime(parseInt(e.target.value))} fullWidth sx={{mb:2}} />
      <Button variant="contained" disabled>Сохранить (demo)</Button>
    </Paper>
  );
} 