"use client";
import { redirect } from 'next/navigation';
import { useParams } from 'next/navigation';

export default function LegacyVacancyEdit(){
  const { id } = useParams<{id:string}>();
  redirect(`/hr/vacancies/${id}/edit`);
} 