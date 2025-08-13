import React from "react";
import CandidateDetailClient from "./CandidateDetailClient";

// Функция для статического экспорта
export async function generateStaticParams() {
  // Возвращаем пустой массив, так как ID генерируются динамически
  return [];
}

export default function HRCandidateDetailPage() {
  return <CandidateDetailClient />;
} 