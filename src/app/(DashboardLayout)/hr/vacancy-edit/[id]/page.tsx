import React from "react";
import VacancyEditClient from "./VacancyEditClient";

// Функция для статического экспорта
export async function generateStaticParams() {
  // Возвращаем пустой массив, так как ID генерируются динамически
  return [];
}

export default function HRVacancyEditPage() {
  return <VacancyEditClient />;
} 