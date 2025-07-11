import React, { useState } from "react";
import { sum } from "lodash";
import { IconX } from "@tabler/icons-react";
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useSelector } from "@/store/hooks";
import Link from "next/link";
import CartItems from "./CartItem";
import { AppState } from "@/store/store";
import { Icon } from "@iconify/react";

const Cart = () => {
  // Get Products
  const Cartproduct = useSelector(
    (state: AppState) => state.ecommerceReducer.cart
  );
  const bcount = Cartproduct.length > 0 ? Cartproduct.length : "0";

  const checkout = useSelector(
    (state: AppState) => state.ecommerceReducer.cart
  );
  const total = sum(
    checkout.map((product: any) => product.price * product.qty)
  );

  const [showDrawer, setShowDrawer] = useState(false);
  const handleDrawerClose = () => {
    setShowDrawer(false);
  };

  const cartContent = (
    <Box>
      {/* ------------------------------------------- */}
      {/* Cart Content */}
      {/* ------------------------------------------- */}
      <Box>
        <CartItems />
      </Box>
    </Box>
  );

  return (
    <Box>
      <Button
        size="large"
        className="btn-rounded-circle-40"
        onClick={() => setShowDrawer(true)}
        color="inherit"
      >
        <Badge color="primary" badgeContent={bcount}>
          <Icon icon="solar:cart-3-line-duotone" width="24" height="24" />
        </Badge>
      </Button>
      {/* ------------------------------------------- */}
      {/* Cart Sidebar */}
      {/* ------------------------------------------- */}
      <Drawer
        anchor="right"
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        PaperProps={{ sx: { maxWidth: "500px" } }}
      >
        <Box
          display="flex"
          alignItems="center"
          p={3}
          pb={0}
          justifyContent="space-between"
        >
          <Typography variant="h5" fontWeight={600}>
            Shopping Cart
          </Typography>
          <Box>
            <IconButton
              color="inherit"
              sx={{
                color: (theme) => theme.palette.grey.A200,
              }}
              onClick={handleDrawerClose}
            >
              <IconX size="1rem" />
            </IconButton>
          </Box>
        </Box>

        {/* component */}
        {cartContent}
        {/* ------------------------------------------- */}
        {/* Checkout  */}
        {/* ------------------------------------------- */}
        <Box px={3} mt={2}>
          {Cartproduct.length > 0 ? (
            <>
              <Stack direction="row" justifyContent="space-between" mb={3}>
                <Typography variant="subtitle2" fontWeight={400}>
                  Total
                </Typography>
                <Typography variant="subtitle2" fontWeight={600}>
                  ${total}
                </Typography>
              </Stack>
              <Button
                fullWidth
                component={Link}
                href="/apps/ecommerce/eco-checkout"
                variant="contained"
                color="primary"
              >
                Checkout
              </Button>
            </>
          ) : (
            ""
          )}
        </Box>
      </Drawer>
    </Box>
  );
};

export default Cart;
