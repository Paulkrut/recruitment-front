import { useEffect, useState } from 'react';
import { apiFetch } from '@/utils/api';

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test';

export interface CompetencyCriterion {
  name: string;
  status: 'yes' | 'no' | 'partial' | 'not_checked';
  evidence: string;
  comment: string;
}

export interface CompetencyScore {
  score: number;
  criteria?: CompetencyCriterion[]; // Новая детализация
  overall_comment?: string; // Общий комментарий
  // Старый формат (для обратной совместимости)
  evidence?: string[];
  comment?: string;
}

export interface ValueItem {
  value: string;
  quote: string;
}

export interface AdditionalScore {
  score: number | string;
  comment: string;
  details?: any;
}

export interface CriticalRisks {
  short_term_plans?: boolean;
  avoids_conflicts?: boolean;
  excessive_parasites?: boolean;
  no_client_experience?: boolean;
  unwilling_routine?: boolean;
}

export interface Recommendation {
  status: 'recommended' | 'verification_needed' | 'not_recommended' | 'insufficient_data';
  level?: 'high' | 'medium' | 'low';
  comment: string;
  verification_needed?: string[];
}

export interface SummaryTable {
  average_score: number;
  key_strengths: string[];
  key_risks: string[];
}

export interface NewMetrics {
  insufficient_data: boolean;
  competencies: {
    motivation?: CompetencyScore;
    speech_culture?: CompetencyScore;
    client_orientation?: CompetencyScore;
    stress_resistance?: CompetencyScore;
    responsibility?: CompetencyScore;
    system_thinking?: CompetencyScore;
  };
  additional_scores?: {
    values?: ValueItem[];
    learning_ability?: AdditionalScore;
    technical_skills?: AdditionalScore;
    writing_quality?: AdditionalScore;
  };
  critical_risks?: CriticalRisks;
  recommendation?: Recommendation;
  summary_table?: SummaryTable;
}

export interface AiEvaluation {
  status: 'pending'|'done'|'error'|'not_requested';
  summary?: string;
  strengths?: string[];
  weaknesses?: string[];
  metrics?: Record<string,number> | NewMetrics; // Поддержка старого и нового формата
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