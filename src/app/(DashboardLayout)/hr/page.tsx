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

import { useLingui } from '@lingui/react';
import { msg, Trans } from '@lingui/macro';

import WelcomeHero from "@/components/WelcomeHero";
import SetupReminderBanner from "@/components/SetupReminderBanner";

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

export default function HRDashboard() {
  const { _ } = useLingui();

  const { currentCompany, companies, user } = useUser();
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [hasHhIntegration, setHasHhIntegration] = useState(false);
  const [showSetupBanner, setShowSetupBanner] = useState(true);

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
      
      // Check if HH integration exists
      const hhResponse = await apiFetch(`${API_BASE}/api/hh/status`);
      if (hhResponse.ok) {
        const hhData = await hhResponse.json();
        setHasHhIntegration(hhData.connected || false);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Проверяем, был ли баннер закрыт и когда
    const dismissedData = localStorage.getItem('setup_banner_dismissed');
    if (dismissedData) {
      try {
        const { timestamp, count } = JSON.parse(dismissedData);
        const dayInMs = 24 * 60 * 60 * 1000; // 1 день
        const now = Date.now();
        
        // Показываем баннер снова, если прошло больше дня
        if (now - timestamp >= dayInMs) {
          setShowSetupBanner(true);
        } else {
          setShowSetupBanner(false);
        }
      } catch (e) {
        // Старый формат (timestamp в миллисекундах) - проверяем прошёл ли день
        const timestamp = parseInt(dismissedData);
        if (!isNaN(timestamp)) {
          const dayInMs = 24 * 60 * 60 * 1000;
          const now = Date.now();
          if (now - timestamp < dayInMs) {
            setShowSetupBanner(false);
          }
        }
      }
    }
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
          <div><Trans>Загрузка...</Trans></div>
        </Box>
      </PageContainer>
    );
  }

  if (!currentCompany) {
    return (
      <PageContainer title="HR Dashboard" description="HR Dashboard">
        <Box sx={{ p: 4 }}>
          <div><Trans>Пожалуйста, выберите компанию</Trans></div>
        </Box>
      </PageContainer>
    );
  }

  if (!data) {
    return (
      <PageContainer title="HR Dashboard" description="HR Dashboard">
        <Box sx={{ p: 4 }}>
          <div><Trans>Ошибка загрузки данных</Trans></div>
        </Box>
      </PageContainer>
    );
  }

  const isEmpty =
    (!data.openVacancies || data.openVacancies.length === 0) &&
    (!data.testsPerDay || data.testsPerDay.length === 0) &&
    (!data.weakQuestions || data.weakQuestions.length === 0) &&
    (!data.overdueCandidates || data.overdueCandidates.length === 0);

  // Show Welcome Hero if no vacancies
  const showWelcomeHero = !hasVacancy;
  
  // Find vacancies without questions
  const vacanciesWithoutQuestions = data?.openVacancies?.filter((v: any) => 
    !v.questionsCount || v.questionsCount === 0
  ) || [];

  // Проверяем, изменилось ли количество вакансий без вопросов
  useEffect(() => {
    if (vacanciesWithoutQuestions.length > 0) {
      const dismissedData = localStorage.getItem('setup_banner_dismissed');
      if (dismissedData) {
        try {
          const { count } = JSON.parse(dismissedData);
          // Если количество увеличилось (появились новые вакансии без вопросов), показываем баннер
          if (vacanciesWithoutQuestions.length > count) {
            setShowSetupBanner(true);
          }
        } catch (e) {
          // Игнорируем ошибки парсинга
        }
      }
    }
  }, [vacanciesWithoutQuestions.length]);

  return (
    <PageContainer title="HR Dashboard" description="HR Dashboard">
      <Box>
        {/* Welcome Hero - показываем если нет вакансий */}
        {showWelcomeHero ? (
          <WelcomeHero hasHhIntegration={hasHhIntegration} />
        ) : (
          <>
            {/* Setup Reminder Banner - показываем если есть вакансии без вопросов */}
            {showSetupBanner && vacanciesWithoutQuestions.length > 0 && (
              <SetupReminderBanner 
                vacanciesWithoutQuestions={vacanciesWithoutQuestions}
                onClose={() => {
                  setShowSetupBanner(false);
                  // Сохраняем время закрытия и количество вакансий
                  localStorage.setItem('setup_banner_dismissed', JSON.stringify({
                    timestamp: Date.now(),
                    count: vacanciesWithoutQuestions.length
                  }));
                }}
              />
            )}

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

            {/* Кнопка создания новой вакансии */}
            {hasSelectedCompany && (
              <Box sx={{ mb: 6, textAlign: 'center' }}>
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
              </Box>
            )}
          </>
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
