import { useEffect, useState } from 'react';
import { apiFetch } from '@/utils/api';

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test';

export interface AiEvaluation {
  status: 'pending'|'done'|'error'|'not_requested';
  summary?: string;
  strengths?: string[];
  weaknesses?: string[];
  metrics?: Record<string,number>;
  error?: string;
}

export function useCandidateEvaluation(id:number){
  const [data,setData]=useState<AiEvaluation>();

  useEffect(()=>{
    let timer: NodeJS.Timeout;
    const load= async ()=>{
      const res = await apiFetch(`${API_BASE}/api/admin/candidates/${id}/evaluation`);
      if(res.ok){ setData(await res.json()); }
    };
    load();
    timer = setInterval(()=>{
      if(data?.status==='pending'){ load(); }
    },5000);
    return ()=> clearInterval(timer);
  },[id,data?.status]);

  return { data, refresh:()=>apiFetch(`${API_BASE}/api/admin/candidates/${id}/evaluation`).then(r=>r.json()).then(setData) };
} 