"use client";
import React from "react";
import { useEffect, useState } from "react";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import PageContainer from "@/app/components/container/PageContainer";
import { Button, Stack, Typography, Stepper, Step, StepLabel } from "@mui/material";
import { useRouter } from "next/navigation";

import Welcome from "@/app/(DashboardLayout)/layout/shared/welcome/Welcome";

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
  const [user, setUser] = useState<{ name?: string }>({});
  const [companies, setCompanies] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    apiFetch(`${API_BASE}/api/dashboard`)
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
    apiFetch(`${API_BASE}/api/user/me`).then(r => r.json()).then(setUser);
    apiFetch(`${API_BASE}/api/user/companies`).then(r => r.json()).then(setCompanies);
  }, []);

  // Stepper logic
  const hasCompany = companies.length > 0;
  const hasColleagues = hasCompany && companies.some((c:any) => c.role === 'HR_LEAD' || c.role === 'HR'); // упрощённо
  const hasVacancy = data && data.openVacancies && data.openVacancies.length > 0;
  const hasCandidate = data && data.overdueCandidates && data.overdueCandidates.length > 0;
  const steps = [
    { label: "Создайте компанию", done: hasCompany, action: () => router.push("/hr/choose-company") },
    { label: "Пригласите коллег", done: hasColleagues, action: () => router.push("/hr/employees") },
    { label: "Создайте вакансию", done: hasVacancy, action: () => router.push("/hr/vacancy-create") },
    { label: "Пригласите кандидата", done: hasCandidate, action: () => router.push("/hr/candidates") },
  ];
  const activeStep = steps.findIndex(s => !s.done);

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

  const isEmpty =
    (!data.openVacancies || data.openVacancies.length === 0) &&
    (!data.testsPerDay || data.testsPerDay.length === 0) &&
    (!data.weakQuestions || data.weakQuestions.length === 0) &&
    (!data.overdueCandidates || data.overdueCandidates.length === 0);

  return (
    <PageContainer title="HR Dashboard" description="HR Dashboard">
      <Box>
        {/* Персональное приветствие */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Добро пожаловать{user.name ? `, ${user.name}` : ''}!
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={2}>
            Это ваша HR-панель. Здесь вы управляете вакансиями, сотрудниками и кандидатами.
          </Typography>
        </Box>
        {/* Stepper онбординга */}
        <Box sx={{ maxWidth: 700, mx: 'auto', mb: 6 }}>
          <Stepper activeStep={activeStep === -1 ? steps.length : activeStep} alternativeLabel>
            {steps.map((step, idx) => (
              <Step key={step.label} completed={step.done}>
                <StepLabel onClick={step.action} style={{ cursor: 'pointer' }}>{step.label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
        {isEmpty ? (
          <Box textAlign="center" py={8}>
            <img src="/images/empty-dashboard.svg" alt="empty" style={{ width: 120, marginBottom: 24, opacity: 0.7 }} />
            <Typography variant="h5" gutterBottom>Здесь появятся ваши вакансии и кандидаты</Typography>
            <Typography variant="body1" color="text.secondary" mb={4}>
              Для начала работы воспользуйтесь шагами выше или быстрыми действиями ниже.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button variant="contained" size="large" onClick={() => router.push('/hr/vacancy-create')}>Создать вакансию</Button>
              <Button variant="outlined" size="large" onClick={() => router.push('/hr/employees')}>Пригласить сотрудника</Button>
              <Button variant="outlined" size="large" onClick={() => router.push('/hr/choose-company')}>Добавить компанию</Button>
            </Stack>
          </Box>
        ) : (
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
        )}
      </Box>
    </PageContainer>
  );
}
