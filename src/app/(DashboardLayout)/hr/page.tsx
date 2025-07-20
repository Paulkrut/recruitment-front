"use client";
import React from "react";
import { useEffect, useState } from "react";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import PageContainer from "@/app/components/container/PageContainer";

import Welcome from "@/app/(DashboardLayout)/hr/layout/shared/welcome/Welcome";

// HR specific components
import OpenVacanciesCard from "@/app/components/hr/OpenVacanciesCard";
import TestsChartCard from "@/app/components/hr/TestsChartCard";
import WeakQuestionsCard from "@/app/components/hr/WeakQuestionsCard";
import OverdueCandidatesCard from "@/app/components/hr/OverdueCandidatesCard";

import { apiFetch } from "@/utils/api";

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

export default function HRDashboard() {
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`${API_BASE}/api/dashboard`)
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (isLoading) {
    return (
      <PageContainer title="HR Dashboard" description="HR Dashboard">
        <Box sx={{ p: 4 }}>
          <div>Загрузка...</div>
        </Box>
      </PageContainer>
    );
  }

  if (!data) {
    return (
      <PageContainer title="HR Dashboard" description="HR Dashboard">
        <Box sx={{ p: 4 }}>
          <div>Ошибка загрузки данных</div>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="HR Dashboard" description="HR Dashboard">
      <Box>
        <Grid container spacing={3}>
          {/* Open Vacancies */}
          <Grid item xs={12} lg={6}>
            <OpenVacanciesCard data={data.openVacancies} />
          </Grid>

          {/* Tests Chart */}
          <Grid item xs={12} lg={6}>
            <TestsChartCard data={data.testsPerDay} />
          </Grid>

          {/* Weak Questions */}
          <Grid item xs={12} lg={6}>
            <WeakQuestionsCard data={data.weakQuestions} />
          </Grid>

          {/* Overdue Candidates */}
          <Grid item xs={12} lg={6}>
            <OverdueCandidatesCard data={data.overdueCandidates} />
          </Grid>
        </Grid>
        <Welcome />
      </Box>
    </PageContainer>
  );
}
