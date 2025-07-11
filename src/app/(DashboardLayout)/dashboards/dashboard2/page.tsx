"use client";
import React from "react";
import { useEffect, useState } from "react";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import PageContainer from "@/app/components/container/PageContainer";

import WelcomeCard from "@/app/components/dashboards/dashboard2/WelcomeCard";
import TopCards from "@/app/components/dashboards/dashboard2/TopCards";
import ProfielExpanceCard from "@/app/components/dashboards/dashboard2/ProfileExpanceCard";
import ProductSales from "@/app/components/dashboards/dashboard2/ProductSales";
import TrafficDistribution from "@/app/components/dashboards/dashboard2/TrafficDistribution";
import NewGoals from "@/app/components/dashboards/dashboard2/NewGoals";
import ProfileCard from "@/app/components/dashboards/dashboard2/ProfileCard";
import BlogCard from "@/app/components/dashboards/dashboard2/BlogCard";
import TopEmployees from "@/app/components/dashboards/dashboard2/TopEmployees";
import UpcomingSchedules from "@/app/components/dashboards/dashboard2/UpcomingSchedules";

export default function Dashboard2() {
  const [isLoading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <PageContainer
      title="eCommerce Dashboard"
      description="this is eCommerce Dashboard"
    >
      <Box>
        <Grid container spacing={3}>
          {/* column */}
          <Grid item xs={12} lg={6}>
            <WelcomeCard />
          </Grid>
          <Grid item xs={12} lg={6}>
            <TopCards />
          </Grid>

          {/* column */}
          <Grid item xs={12} lg={8}>
            <ProfielExpanceCard />
          </Grid>
          <Grid item xs={12} lg={4}>
            <ProductSales />
          </Grid>

          <Grid item xs={12} lg={3}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <NewGoals />
              </Grid>
              <Grid item xs={12}>
                <ProfileCard />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} lg={6}>
            <TrafficDistribution />
          </Grid>
          <Grid item xs={12} lg={3}>
            <BlogCard />
          </Grid>

          {/* column */}
          <Grid item xs={12} lg={4}>
            <UpcomingSchedules />
          </Grid>

          <Grid item xs={12} lg={8}>
            <TopEmployees />
          </Grid>

          
        </Grid>
      </Box>
    </PageContainer>
  );
}
