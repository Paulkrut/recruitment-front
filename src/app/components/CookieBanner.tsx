"use client";
import { useEffect, useState } from "react";

export default function CookieBanner(){
  const [open,setOpen]=useState(false);
  useEffect(()=>{
    try{
      const v = document.cookie.split('; ').find(c=>c.startsWith('cookieConsentV1='));
      if(!v) setOpen(true);
    }catch{}
  },[]);
  function setCookie(val:string){
    const expires = new Date(Date.now()+180*864e5).toUTCString();
    document.cookie = `cookieConsentV1=${val}; expires=${expires}; path=/; Secure; SameSite=Lax`;
  }
  if(!open) return null;
  return (
    <div style={{position:'fixed',bottom:0,left:0,right:0,background:'#fff',borderTop:'1px solid #e5e7eb',boxShadow:'0 -1px 6px rgba(0,0,0,0.06)',zIndex:50}}>
      <div style={{maxWidth:1200,margin:'0 auto',padding:'12px 16px',display:'flex',gap:12,alignItems:'center',justifyContent:'space-between'}}>
        <div style={{fontSize:14,color:'#374151'}}>Мы используем файлы cookie. Подробно — <a href="/privacy-policy" style={{textDecoration:'underline'}}>Политика ПДн</a>.</div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={()=>{setCookie(JSON.stringify({necessary:true,analytics:false}));setOpen(false);}} style={{padding:'8px 12px',border:'1px solid #e5e7eb',borderRadius:6,background:'#fff'}}>Отклонить</button>
          <button onClick={()=>{setCookie(JSON.stringify({necessary:true,analytics:true}));setOpen(false);}} style={{padding:'8px 12px',border:'1px solid #111827',borderRadius:6,background:'#111827',color:'#fff'}}>Принять все</button>
        </div>
      </div>
    </div>
  );
} 