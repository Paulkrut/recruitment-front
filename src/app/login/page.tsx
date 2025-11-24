"use client";

import { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useLingui, Trans } from '@lingui/react';
import { msg } from '@lingui/macro';


const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

export default function LoginPage(){
  const { _ } = useLingui();

  const [phone,setPhone] = useState('');
  const [password,setPassword] = useState('');
  const [error,setError] = useState<string|null>(null);

  async function login(){
    try{
      const res = await fetch(`${API_BASE}/auth/login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone,password})});
      if(!res.ok) throw new Error('Auth failed');
      const d = await res.json();
      localStorage.setItem('recruitment_token', d.token);
      window.location.replace('/hr');
    }catch(e:any){ setError(e.message); }
  }

  return (<Box sx={{p:4,maxWidth:400,mx:'auto'}}>
    <Typography variant="h5" gutterBottom><Trans>Вход HR</Trans></Typography>
    <TextField label={_(msg`Телефон`)} fullWidth sx={{mb:2}} value={phone} onChange={e=>setPhone(e.target.value)}/>
    <TextField label={_(msg`Пароль`)} type="password" fullWidth sx={{mb:2}} value={password} onChange={e=>setPassword(e.target.value)}/>
    <Button variant="contained" fullWidth onClick={login}><Trans>Войти</Trans></Button>
    {error && <Typography color="error" sx={{mt:1}}>{error}</Typography>}
  </Box>);
} 