import Avatar from "@mui/material/Avatar";
import {useEffect, useState} from 'react';
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import SidebarItems from "./SidebarItems";
import Logo from "../../shared/logo/Logo";
import { useSelector, useDispatch } from "@/store/hooks";
import {
  hoverSidebar,
  toggleMobileSidebar,
} from "@/store/customizer/CustomizerSlice";
import Scrollbar from "@/app/components/custom-scroll/Scrollbar";
import { AppState } from "@/store/store";
import { Icon } from "@iconify/react";
import { Button, MenuItem, Select } from "@mui/material";
import { apiFetch } from "@/utils/api";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MailIcon from "@mui/icons-material/Mail";
import Badge from "@mui/material/Badge";
import { useRouter } from "next/navigation";
import { IconBriefcase } from "@tabler/icons-react";
import { useUser } from "@/contexts/UserContext";

export default function Sidebar() {
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.down("lg"));
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();
  const theme = useTheme();
  const { user, companies, invites, currentCompany, setCurrentCompany } = useUser();
  
  const toggleWidth =
    customizer.isCollapse && !customizer.isSidebarHover
      ? customizer.MiniSidebarWidth
      : customizer.SidebarWidth;

  // ----- auth user extraction -----
  const [auth,setAuth]=useState<{name:string;phone:string;role:string;position?:string}>({name:'',phone:'',role:'RECRUITER'});
  useEffect(()=>{
      if(typeof window==='undefined') return;
      const t=localStorage.getItem('recruitment_token');
      if(!t) return;
      try{
        const payload=JSON.parse(atob(t.split('.')[1]||''));
        setAuth({name:payload.name||'',phone:payload.phone||'',role:(payload.roles&&payload.roles[0])||'RECRUITER',position:''});
      }catch(e){/* ignore */}
      // Обновляем auth из контекста пользователя
      if (user) {
        setAuth(a=>({...a, name:user.name||a.name, position:user.position||'' }));
      }
  },[user]);

  const initials = auth.name? auth.name.split(' ').map(n=>n[0]).join('').toUpperCase(): auth.phone? auth.phone.slice(-2):'U';
  const stringToColor=(s:string)=>{
     let hash=0; for (let i=0;i<s.length;i++) hash=s.charCodeAt(i)+((hash<<5)-hash);
     const c=(hash>>24)&0xff ^ (hash>>16)&0xff ^ (hash>>8)&0xff;
     return `hsl(${c*3.6},60%,60%)`;
  };

  const onHoverEnter = () => {
    if (customizer.isCollapse) {
      dispatch(hoverSidebar(true));
    }
  };

  const onHoverLeave = () => {
    dispatch(hoverSidebar(false));
  };

  const [openProfile,setOpenProfile]=useState(false);

  return (
    <>
      {!lgUp ? (
        <Box
          sx={{
            zIndex: 100,
            width: toggleWidth,
            flexShrink: 0,
            ...(customizer.isCollapse && {
              position: "absolute",
            }),
            borderRadius: "13px",
          }}
        >
          {/* ------------------------------------------- */}
          {/* Sidebar for desktop */}
          {/* ------------------------------------------- */}
          <Drawer
            anchor="left"
            open
            onMouseEnter={onHoverEnter}
            onMouseLeave={onHoverLeave}
            variant="permanent"
            PaperProps={{
              sx: {
                boxShadow: customizer.isCardShadow ? 9 : 0,
                transition: theme.transitions.create("width", {
                  duration: theme.transitions.duration.shortest,
                }),
                width: toggleWidth,
                borderRight: 0,
                boxSizing: "border-box",
                top: 20,
                left: 20,
                bottom: 20,
                borderRadius: "13px",
                height: "calc(100% - 40px)",
              },
            }}
          >
            {/* ------------------------------------------- */}
            {/* Sidebar Box */}
            {/* ------------------------------------------- */}
            <Box
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* ------------------------------------------- */}
              {/* Logo */}
              {/* ------------------------------------------- */}
              <Box px={2}>
                <Logo />
                <CompanySwitcher />
                <InviteIndicator />
              </Box>
              <Scrollbar
                sx={{
                  flex: 1,
                  minHeight: 0,
                }}
              >
                {/* ------------------------------------------- */}
                {/* Sidebar Items */}
                {/* ------------------------------------------- */}
                <SidebarItems />
              </Scrollbar>
              {customizer.isCollapse ? null : (
                <>
                <Box px={3} py={1.5} m={2} bgcolor="primary.light" sx={{ mt: "auto" }}>
                  <Stack
                    direction="row"
                    gap={2}
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ width:40,height:40,bgcolor:stringToColor(initials),cursor:'pointer' }} onClick={()=>setOpenProfile(true)}>
                        {initials}
                      </Avatar>
                      <Box ml={2} onClick={()=>setOpenProfile(true)} sx={{cursor:'pointer'}}>
                        <Typography variant="h6">{auth.name || auth.phone}</Typography>
                        <Typography variant="caption" color="text.secondary">{auth.position || auth.role}</Typography>
                      </Box>
                    </Box>
                    <IconButton color="primary" onClick={()=>{
                        if(typeof window!=='undefined'){
                          localStorage.removeItem('recruitment_token');
                          window.location.href='/auth/phone';
                        }
                      }}>
                      <Icon icon="solar:logout-line-duotone" width={24} height={24} />
                    </IconButton>
                  </Stack>
                </Box>
                <ProfileDialog open={openProfile} onClose={()=>setOpenProfile(false)} onUpdated={(u)=>setAuth(a=>({...a, ...u}))} />
                </>
              )}
            </Box>
          </Drawer>
        </Box>
      ) : (
        <Drawer
          anchor="left"
          open={customizer.isMobileSidebar}
          onClose={() => dispatch(toggleMobileSidebar())}
          variant="temporary"
          PaperProps={{
            sx: {
              width: customizer.SidebarWidth,
              border: "0 !important",
              boxShadow: (theme) => theme.shadows[8],
            },
          }}
        >
          {/* ------------------------------------------- */}
          {/* Logo */}
          {/* ------------------------------------------- */}
          <Box px={2}>
            <Logo />
          </Box>
          {/* ------------------------------------------- */}
          {/* Sidebar For Mobile */}
          {/* ------------------------------------------- */}
          <SidebarItems />
        </Drawer>
      )}
    </>
  );
}

// --------- Profile Dialog ---------
function ProfileDialog({open,onClose,onUpdated}:{open:boolean;onClose:()=>void;onUpdated:(u:any)=>void}){
  const [form,setForm]=useState({name:'',email:'',position:''});
  const [loading,setLoading]=useState(false);
  const [errors, setErrors] = useState({name:'',email:'',position:''});
  
  // Валидация email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  useEffect(()=>{
    if(!open) return;
    const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test';
    apiFetch(`${API_BASE}/api/user/me`).then(r=>r.json()).then(setForm);
  },[open]);
  
  const save=async ()=>{
    // Валидация перед сохранением
    const newErrors = {name:'',email:'',position:''};
    if (!form.name.trim()) newErrors.name = 'Имя обязательно';
    if (form.email && !validateEmail(form.email)) newErrors.email = 'Введите корректный email адрес';
    
    if (newErrors.name || newErrors.email || newErrors.position) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test';
    await apiFetch(`${API_BASE}/api/user/me`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
    setLoading(false); 
    onUpdated(form); 
    onClose();
  };
  
  const h=(f:keyof typeof form)=>(e:any)=>{
    const value = e.target.value;
    setForm({...form,[f]:value});
    // Очищаем ошибку при вводе
    setErrors(prev => ({...prev, [f]: ''}));
    // Валидация email в реальном времени
    if (f === 'email' && value && !validateEmail(value)) {
      setErrors(prev => ({...prev, email: 'Введите корректный email адрес'}));
    }
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Мой профиль</DialogTitle>
      <DialogContent sx={{display:'flex',flexDirection:'column',gap:2,pt:'16px !important'}}>
        <TextField 
          label="Имя *" 
          value={form.name||''} 
          onChange={h('name')} 
          fullWidth 
          error={!!errors.name}
          helperText={errors.name}
        />
        <TextField 
          label="Email" 
          value={form.email||''} 
          onChange={h('email')} 
          fullWidth 
          error={!!errors.email}
          helperText={errors.email || 'Например: example@mail.ru'}
          placeholder="example@mail.ru"
        />
        <TextField 
          label="Должность" 
          value={form.position||''} 
          onChange={h('position')} 
          fullWidth 
          error={!!errors.position}
          helperText={errors.position}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={save} disabled={loading || !form.name.trim()}>Сохранить</Button>
      </DialogActions>
    </Dialog>
  );
}

function CompanySwitcher() {
  const { companies, currentCompany, setCurrentCompany } = useUser();
  
  const handleChange = (e: any) => {
    const selectedCompany = companies.find(c => c.id == e.target.value);
    setCurrentCompany(selectedCompany || null);
    window.location.reload();
  };

  // Если компаний нет, не показываем селект
  if (companies.length === 0) return null;

  const isSingleCompany = companies.length === 1;

  return (
    <Box mb={2} mt={2}>
      {isSingleCompany ? (
        // Если компания одна - показываем как элегантный блок
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2.5,
            borderRadius: 3,
            backgroundColor: '#f8fafc',
            border: '2px solid #e2e8f0',
            color: '#1e293b',
            fontWeight: 600,
            fontSize: '0.9rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              borderColor: '#cbd5e1',
              backgroundColor: '#f1f5f9',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
            }
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: '#3b82f6',
              color: '#fff',
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
            }}
          >
            <IconBriefcase size={20} color="#fff" />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 700, 
                color: '#1e293b',
                fontSize: '0.95rem',
                lineHeight: 1.2
              }}
            >
              {currentCompany?.name || 'Компания'}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#64748b',
                fontSize: '0.75rem',
                fontWeight: 500
              }}
            >
              Текущая компания
            </Typography>
          </Box>
        </Box>
      ) : (
        // Если компаний несколько - показываем красивый селект
        <Box
          sx={{
            position: 'relative',
            '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 2.5,
              borderRadius: 3,
              backgroundColor: '#f8fafc',
              border: '2px solid #e2e8f0',
              color: '#1e293b',
              fontWeight: 600,
              fontSize: '0.9rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                borderColor: '#cbd5e1',
                backgroundColor: '#f1f5f9',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              },
              '&.Mui-focused': {
                borderColor: '#3b82f6',
                backgroundColor: '#f0f9ff',
                boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
              }
            },
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none'
            },
            '& .MuiSelect-icon': {
              color: '#3b82f6',
              fontSize: '1.2rem'
            }
          }}
        >
          <Select
            value={currentCompany?.id?.toString() || ""}
            onChange={handleChange}
            size="small"
            fullWidth
            displayEmpty
            renderValue={selected => {
              const company = companies.find(c => c.id == Number(selected));
              return company ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      backgroundColor: '#3b82f6',
                      color: '#fff',
                      boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                    }}
                  >
                    <IconBriefcase size={20} color="#fff" />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 700, 
                        color: '#1e293b',
                        fontSize: '0.95rem',
                        lineHeight: 1.2
                      }}
                    >
                      {company.name}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: '#64748b',
                        fontSize: '0.75rem',
                        fontWeight: 500
                      }}
                    >
                      {company.role}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      backgroundColor: '#e2e8f0',
                      color: '#64748b'
                    }}
                  >
                    <IconBriefcase size={20} />
                  </Box>
                  <Typography sx={{ color: '#64748b', fontWeight: 600 }}>
                    Выберите компанию
                  </Typography>
                </Box>
              );
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  mt: 1,
                  borderRadius: 3,
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  border: '1px solid #e2e8f0',
                  '& .MuiMenuItem-root': {
                    borderRadius: 2,
                    mx: 1,
                    mb: 0.5,
                    '&:hover': {
                      backgroundColor: '#f1f5f9'
                    },
                    '&.Mui-selected': {
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      fontWeight: 600
                    }
                  }
                }
              }
            }}
          >
            <MenuItem value="" disabled sx={{ color: '#64748b', fontStyle: 'italic' }}>
              Выберите компанию
            </MenuItem>
            {companies.map((c: any) => (
              <MenuItem key={c.id} value={c.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: c.id == currentCompany?.id ? '#3b82f6' : '#e2e8f0',
                      color: c.id == currentCompany?.id ? '#fff' : '#64748b'
                    }}
                  >
                    <IconBriefcase size={16} color={c.id == currentCompany?.id ? "#fff" : "#64748b"} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: c.id == currentCompany?.id ? 700 : 600,
                        color: c.id == currentCompany?.id ? '#1e40af' : '#1e293b',
                        fontSize: '0.9rem'
                      }}
                    >
                      {c.name}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: '#64748b',
                        fontSize: '0.75rem',
                        fontWeight: 500
                      }}
                    >
                      {c.role}
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </Box>
      )}
    </Box>
  );
}

function InviteIndicator() {
  const { invites } = useUser();
  const router = useRouter();
  
  if (invites.length === 0) return null;
  
  return (
    <IconButton color="primary" onClick={() => router.push("/hr/choose-company")}
      sx={{ ml: 1 }}>
      <Badge badgeContent={invites.length} color="error">
        <MailIcon />
      </Badge>
    </IconButton>
  );
}
