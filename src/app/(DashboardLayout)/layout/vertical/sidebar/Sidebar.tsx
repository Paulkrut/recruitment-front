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
import { Button } from "@mui/material";
import { apiFetch } from "@/utils/api";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';

export default function Sidebar() {
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.down("lg"));
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();
  const theme = useTheme();
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
      // fetch full profile to get latest name/email/position
      const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test';
      apiFetch(`${API_BASE}/api/user/me`).then(r=>r.json()).then(p=>setAuth(a=>({...a, name:p.name||a.name, position:p.position||'' })));
  },[]);

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
              }}
            >
              {/* ------------------------------------------- */}
              {/* Logo */}
              {/* ------------------------------------------- */}
              <Box px={2}>
                <Logo />
              </Box>
              <Scrollbar
                sx={{
                  height: customizer.isCollapse
                    ? "calc(100% - 90px)"
                    : "calc(100% - 200px)",
                }}
              >
                {/* ------------------------------------------- */}
                {/* Sidebar Items */}
                {/* ------------------------------------------- */}
                <SidebarItems />
              </Scrollbar>
              {customizer.isCollapse ? null : (
                <>
                <Box px={3} py={2} m={3} bgcolor="primary.light">
                  <Stack
                    direction="row"
                    gap={2}
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ width:45,height:45,bgcolor:stringToColor(initials),cursor:'pointer' }} onClick={()=>setOpenProfile(true)}>
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
  useEffect(()=>{
    if(!open) return;
    const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test';
    apiFetch(`${API_BASE}/api/user/me`).then(r=>r.json()).then(setForm);
  },[open]);
  const save=async ()=>{
    setLoading(true);
    const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test';
    await apiFetch(`${API_BASE}/api/user/me`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
    setLoading(false); onUpdated(form); onClose();
  };
  const h=(f:keyof typeof form)=>(e:any)=>setForm({...form,[f]:e.target.value});
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Мой профиль</DialogTitle>
      <DialogContent sx={{display:'flex',flexDirection:'column',gap:2,mt:1}}>
        <TextField label="Имя" value={form.name||''} onChange={h('name')} fullWidth />
        <TextField label="Email" value={form.email||''} onChange={h('email')} fullWidth />
        <TextField label="Должность" value={form.position||''} onChange={h('position')} fullWidth />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={save} disabled={loading}>Сохранить</Button>
      </DialogActions>
    </Dialog>
  );
}
