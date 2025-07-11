"use client"

import Box from '@mui/material/Box';
import PageContainer from '@/app/components/container/PageContainer';
import ProductChecout from '@/app/components/apps/ecommerce/productCheckout/ProductCheckout';
import ChildCard from '@/app/components/shared/ChildCard';

const EcommerceCheckout = () => {
  return (
    <PageContainer title="Checkout" description="this is Checkout">
      <ChildCard>
        {/* ------------------------------------------- */}
        {/* Right part */}
        {/* ------------------------------------------- */}
        <Box p={3} flexGrow={1}>
          <ProductChecout />
        </Box>
      </ChildCard>
    </PageContainer>
  );
};

export default EcommerceCheckout;
