"use client";
import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Stack, Paper, InputAdornment } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import { IMaskInput } from 'react-imask';
import PageContainer from '@/app/components/container/PageContainer';

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

const TextMaskCustom = React.forwardRef<HTMLElement, CustomProps>(
  function TextMaskCustom(props, ref) {
    const { onChange, ...other } = props;
    return (
      <IMaskInput
        {...other}
        mask="+7 (#00) 000-00-00"
        definitions={{
          '#': /[1-9]/,
        }}
        inputRef={ref as any}
        onAccept={(value: any) => onChange({ target: { name: props.name, value } })}
        overwrite
      />
    );
  },
);


export default function PhoneAuthPage(){
  const [step,setStep]=useState<'phone'|'code'>('phone');
  const [phone,setPhone]=useState('');
  const [code,setCode]=useState('');
  const [loading,setLoading]=useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(300);
  const theme = useTheme();

  React.useEffect(() => {
    if (step === 'code' && timer > 0) {
        const interval = setInterval(() => {
            setTimer((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }
  }, [step, timer]);


  const sendPhone=async()=>{
    setLoading(true);
    setError('');
    await fetch(`${API_BASE}/api/public/auth/request-code`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone})});
    setLoading(false);
    setStep('code');
    setTimer(300);
  };
  const verify=async()=>{
    setLoading(true);
    setError('');
    const r = await fetch(`${API_BASE}/api/public/auth/verify-code`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone,code})});
    setLoading(false);
    if(r.ok){ 
      const {token}=await r.json(); 
      localStorage.setItem('recruitment_token',token); 
      window.location.href='/hr'; 
    } else {
      setError('Неверный или истекший код подтверждения.');
    }
  };
  return (
    <PageContainer title="SofiHR | Вход">
      <Box sx={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:`linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${alpha(theme.palette.primary.dark,0.8)} 100%)`}}>
        <PaperForm>
          <Typography variant="h4" fontWeight={700} textAlign="center" gutterBottom color="primary.main">SofiHR</Typography>
          {step==='phone' ? (
            <Stack spacing={2} minWidth={300}>
              <Typography variant="h5">Введите номер телефона</Typography>
              <TextField 
                value={phone} 
                onChange={e=>setPhone(e.target.value)} 
                fullWidth 
                placeholder="+7 (___) ___-__-__" 
                InputProps={{
                  startAdornment:(<InputAdornment position="start"><PhoneIphoneIcon color="action"/></InputAdornment>),
                  inputComponent: TextMaskCustom as any,
                }}
                name="textmask"
                id="formatted-text-mask-input"
               />
              <Button variant="contained" onClick={sendPhone} disabled={loading||phone.length<10}>Получить код</Button>
            </Stack>
          ) : (
            <Stack spacing={2} minWidth={300}>
              <Typography variant="h5">Введите код из SMS</Typography>
              <Typography variant="body2" color="text.secondary">Отправлен на номер {phone}</Typography>
              <TextField 
                value={code} 
                onChange={e=>{ setCode(e.target.value); setError(''); }} 
                placeholder="––––––" 
                fullWidth 
                inputProps={{maxLength:6,style:{letterSpacing:'0.3em',textAlign:'center',fontSize:'1.5rem'}}}
                error={!!error}
                helperText={error}
              />
              <Button variant="contained" onClick={verify} disabled={loading||code.length<6 || timer === 0}>Войти</Button>
              {timer > 0 ? (
                <Typography variant="body2" textAlign="center" color="text.secondary">
                    Запросить новый код можно через {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                </Typography>
              ) : (
                <Button onClick={sendPhone} disabled={loading}>
                    Запросить новый код
                </Button>
              )}
            </Stack>
          )}
        </PaperForm>
      </Box>
    </PageContainer>
  );
}

function PaperForm({children}:{children:React.ReactNode}){
  return <Paper elevation={6} sx={{p:4,borderRadius:3,minWidth:340}}>{children}</Paper>;
} 