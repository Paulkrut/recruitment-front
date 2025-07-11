"use client";

import React from "react";
import Box from '@mui/material/Box';
import PageContainer from "@/app/components/container/PageContainer";
import ProductList2 from "@/app/components/apps/ecommerce/productGrid/ProductList2";
import ProductSidebar2 from "@/app/components/apps/ecommerce/productGrid/ProductSidebar2";
import AppCard from "@/app/components/shared/AppCard";

const EcommerceShop2 = () => {
  const [isMobileSidebarOpen, setMobileSidebarOpen] = React.useState(true);

  return (
    <PageContainer title="Shop" description="this is Shop">
      {/* ------------------------------------------- */}
      {/* Left part */}
      {/* ------------------------------------------- */}
      <ProductSidebar2
        isMobileSidebarOpen={isMobileSidebarOpen}
        onSidebarClose={() => setMobileSidebarOpen(false)}
      />
      <AppCard>
        {/* ------------------------------------------- */}
        {/* Right part */}
        {/* ------------------------------------------- */}
        <Box p={3} flexGrow={1}>
          <ProductList2
            onClick={() => setMobileSidebarOpen(!isMobileSidebarOpen)}
          />
        </Box>
      </AppCard>
    </PageContainer>
  );
};

export default EcommerceShop2;
