"use client";
import React from "react";
import { useEffect, useState } from "react";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import PageContainer from "@/app/components/container/PageContainer";
import { Button, Stack, Typography, Stepper, Step, StepLabel } from "@mui/material";
import Link from "next/link";

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

  const fetchDashboardData = async () => {
    try {
      const response = await apiFetch(`${API_BASE}/api/dashboard`);
      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  useEffect(() => {
    fetchDashboardData().finally(() => setLoading(false));
    apiFetch(`${API_BASE}/api/user/me`).then(r => r.json()).then(setUser);
    apiFetch(`${API_BASE}/api/user/companies`).then(r => r.json()).then(setCompanies);
  }, []);

  // Stepper logic
  const hasCompany = companies.length > 0;
  const hasColleagues = hasCompany && companies.some((c:any) => c.role === 'HR_LEAD' || c.role === 'HR'); // упрощённо
  const hasVacancy = data && data.openVacancies && data.openVacancies.length > 0;
  const hasCandidate = data && data.overdueCandidates && data.overdueCandidates.length > 0;
  const steps = [
    { label: "Создайте компанию", done: hasCompany, href: "/hr/choose-company" },
    { label: "Пригласите коллег", done: hasColleagues, href: "/hr/employees" },
    { label: "Создайте вакансию", done: hasVacancy, href: "/hr/vacancy-create" },
    { label: "Пригласите кандидата", done: hasCandidate, href: "/hr/vacancies" },
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
                <Link href={step.href} style={{ textDecoration: 'none' }}>
                  <StepLabel style={{ cursor: 'pointer' }}>{step.label}</StepLabel>
                </Link>
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
              <Link href="/hr/vacancy-create" style={{ textDecoration: 'none' }}>
                <Button variant="contained" size="large">Создать вакансию</Button>
              </Link>
              <Link href="/hr/employees" style={{ textDecoration: 'none' }}>
                <Button variant="outlined" size="large">Пригласить сотрудника</Button>
              </Link>
              <Link href="/hr/choose-company" style={{ textDecoration: 'none' }}>
                <Button variant="outlined" size="large">Добавить компанию</Button>
              </Link>
            </Stack>
          </Box>
        ) : (
        <Grid container spacing={3}>
          {/* Open Vacancies */}
          <Grid item xs={12} lg={6}>
            <OpenVacanciesCard data={data.openVacancies} />
          </Grid>
          {/* Weak Questions */}
          <Grid item xs={12} lg={6}>
            <WeakQuestionsCard data={data.weakQuestions} />
          </Grid>
          {/* Tests Chart */}
          <Grid item xs={12} lg={6}>
            <TestsChartCard data={data.testsPerDay} onRefresh={fetchDashboardData} />
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
