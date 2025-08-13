"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box, Card, CardContent, Typography, Button, TextField, CircularProgress
} from "@mui/material";
import PageContainer from "@/app/components/container/PageContainer";

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

export default function VacancyEditClient() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`${API_BASE}/api/admin/vacancies/${id}`)
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !data) {
    return (
      <PageContainer title="Загрузка вакансии">
        <Box sx={{ p: 4, textAlign: "center" }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer title={`Редактирование: ${data.title}`}>
      <Box>
        <Typography variant="h4">Редактирование вакансии</Typography>
        <Typography>ID: {id}</Typography>
        {/* Здесь будет полная реализация */}
      </Box>
    </PageContainer>
  );
} 