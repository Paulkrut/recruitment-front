import React from "react";
import InterviewClient from "./InterviewClient";

// Функция для статического экспорта
export async function generateStaticParams() {
  // Возвращаем пустой массив, так как токены генерируются динамически
  return [];
}

export default function CandidateInterviewPage() {
  return <InterviewClient />;
}
