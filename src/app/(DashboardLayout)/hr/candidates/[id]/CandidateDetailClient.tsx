"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box, Card, CardContent, Typography, Button, Chip, Divider, Grid, CircularProgress, Alert
} from "@mui/material";
import { IconUsers, IconFileText, IconCheck, IconClock, IconArrowLeft } from "@tabler/icons-react";
import PageContainer from "@/app/components/container/PageContainer";

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

export default function CandidateDetailClient() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`${API_BASE}/api/admin/candidates/${id}`)
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !data) {
    return (
      <PageContainer title="Загрузка кандидата">
        <Box sx={{ p: 4, textAlign: "center" }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer title={`Кандидат: ${data.name}`}>
      <Box>
        <Typography variant="h4">Детали кандидата</Typography>
        <Typography>ID: {id}</Typography>
        {/* Здесь будет полная реализация */}
      </Box>
    </PageContainer>
  );
} 