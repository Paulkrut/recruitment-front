import React from "react";
import SessionDetailClient from "./SessionDetailClient";

// Функция для статического экспорта
export async function generateStaticParams() {
  // Возвращаем пустой массив, так как ID генерируются динамически
  return [];
}

export default function HRSessionDetailPage() {
  return <SessionDetailClient />;
}
