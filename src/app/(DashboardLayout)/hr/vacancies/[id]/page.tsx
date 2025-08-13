import React from "react";
import VacancyDetailClient from "./VacancyDetailClient";

// Функция для статического экспорта
export async function generateStaticParams() {
  // Возвращаем пустой массив, так как ID генерируются динамически
  return [];
}

export default function HRVacancyDetailPage() {
  return <VacancyDetailClient />;
}
