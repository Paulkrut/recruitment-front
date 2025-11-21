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
import { useUser } from "@/contexts/UserContext";
import { Trans } from '@lingui/react';
import { useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';



const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

export default function HRDashboard() {
  const { _ } = useLingui();

  const { currentCompany, companies, user } = useUser();
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    if (!currentCompany) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      const response = await apiFetch(`${API_BASE}/api/dashboard`);
      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentCompany]);

  // Stepper logic
  const hasCompany = companies.length > 0;
  const hasColleagues = hasCompany && companies.some((c:any) => c.role === 'HR_LEAD' || c.role === 'HR');
  const hasVacancy = data && data.openVacancies && data.openVacancies.length > 0;
  const hasCandidate = data && data.overdueCandidates && data.overdueCandidates.length > 0;
  const hasSelectedCompany = !!currentCompany;
  const steps = [
    { label: _(msg`Создайте компанию`), done: hasCompany, href: "/hr/choose-company" },
    { label: _(msg`Пригласите коллег`), done: hasColleagues, href: "/hr/employees" },
    { label: _(msg`Создайте вакансию`), done: hasVacancy, href: "/hr/vacancy-create" },
    { label: _(msg`Пригласите кандидата`), done: hasCandidate, href: "/hr/vacancies" },
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

  if (!currentCompany) {
    return (
      <PageContainer title="HR Dashboard" description="HR Dashboard">
        <Box sx={{ p: 4 }}>
          <div>Пожалуйста, выберите компанию</div>
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
          <Typography variant="h4" fontWeight={700} gutterBottom><Trans>
            Добро пожаловать{user?.name ? `, ${user.name}` : ''}!
          </Trans></Typography>
          <Typography variant="body1" color="text.secondary" mb={2}><Trans>Это ваша HR-панель. Здесь вы управляете вакансиями, сотрудниками и кандидатами.</Trans></Typography>
        </Box>

        {/* Stepper */}
        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((step, index) => (
              <Step key={step.label} completed={step.done}>
                <StepLabel>
                  <Link href={step.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {step.label}
                  </Link>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Кнопка создания вакансии */}
        {hasSelectedCompany && (
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            {hasVacancy ? (
              // Маленькая кнопка когда есть вакансии
              <Link href="/hr/vacancy-create" style={{ textDecoration: 'none' }}>
                <Button 
                  variant="contained" 
                  size="large"
                  sx={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                    '&:hover': {
                      boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                ><Trans>✨ Создать новую вакансию</Trans></Button>
              </Link>
            ) : (
              // Большая hero кнопка когда нет вакансий
          <Box sx={{ 
            textAlign: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 3,
            p: 4,
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.1\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'2\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              opacity: 0.3
            }
          }}>
            <Typography variant="h5" fontWeight={600} gutterBottom sx={{ position: 'relative', zIndex: 1 }}><Trans>🚀 Готовы создать первую вакансию?</Trans></Typography>
            <Typography variant="body1" sx={{ mb: 3, opacity: 0.9, position: 'relative', zIndex: 1 }}><Trans>Создайте вакансию и начните привлекать талантливых кандидатов уже сегодня</Trans></Typography>
            <Link href="/hr/vacancy-create" style={{ textDecoration: 'none' }}>
              <Button 
                variant="contained" 
                size="large"
                sx={{ 
                  backgroundColor: 'white',
                  color: '#667eea',
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    boxShadow: '0 12px 35px rgba(0,0,0,0.2)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  zIndex: 1
                }}
              ><Trans>✨ Создать вакансию</Trans></Button>
            </Link>
          </Box>
        )}
        </Box>
        )}

        {/* Dashboard Cards */}
        {!isEmpty && (
          <Grid container spacing={3}>
            <Grid item xs={12} lg={6}>
              <OpenVacanciesCard data={data.openVacancies || []} />
            </Grid>
            <Grid item xs={12} lg={6}>
              <TestsChartCard data={data.testsPerDay || []} onRefresh={fetchDashboardData} />
            </Grid>
            <Grid item xs={12} lg={6}>
              <WeakQuestionsCard data={data.weakQuestions || []} />
            </Grid>
            <Grid item xs={12} lg={6}>
              <OverdueCandidatesCard data={data.overdueCandidates || []} />
            </Grid>
          </Grid>
        )}

        {/* Empty State */}
        {isEmpty && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom><Trans>Пока нет данных для отображения</Trans></Typography>
            <Typography variant="body2" color="text.secondary"><Trans>Создайте вакансию и пригласите кандидатов, чтобы увидеть статистику</Trans></Typography>
          </Box>
        )}
      </Box>
    </PageContainer>
  );
}
