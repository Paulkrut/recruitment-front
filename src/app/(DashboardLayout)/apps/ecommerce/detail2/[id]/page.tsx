"use client";

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import ProductCarousel from "@/app/components/apps/ecommerce/productDetail2/ProductCarousel";
import PageContainer from "@/app/components/container/PageContainer";
import ProductDetail from "@/app/components/apps/ecommerce/productDetail2";
import ProductRelated from "@/app/components/apps/ecommerce/productDetail2/ProductRelated";
import BlankCard from "@/app/components/shared/BlankCard";


const EcommerceDetail = () => {
  return (
    <PageContainer
      title="eCommerce Detail"
      description="this is eCommerce Detail"
    >
      <Grid
        container
        spacing={3}
        sx={{ maxWidth: { lg: "1055px", xl: "1200px" } }}
      >
        <Grid item xs={12} sm={12} lg={12}>
          <BlankCard>
            <Box p={3}>
              {/* ------------------------------------------- */}
              {/* Carousel */}
              {/* ------------------------------------------- */}
              <Grid container spacing={3}>
                <Grid item xs={12} sm={12} lg={6}>
                  <ProductCarousel />
                </Grid>
                <Grid item xs={12} sm={12} lg={6}>
                  <ProductDetail />
                </Grid>
              </Grid>
            </Box>
          </BlankCard>
        </Grid>
        <Grid item xs={12} sm={12} lg={12}>
          <ProductRelated />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default EcommerceDetail;
