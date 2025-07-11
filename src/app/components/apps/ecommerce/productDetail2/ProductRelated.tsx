import React, { useEffect } from "react";
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useSelector, useDispatch } from "@/store/hooks";
import { fetchProducts } from "@/store/apps/eCommerce/EcommerceSlicev2";
import Link from "next/link";
import { ProductType } from "../../../../(DashboardLayout)/types/apps/eCommerce";
import { IconStarFilled } from "@tabler/icons-react";

const ProductRelated = () => {
  const dispatch = useDispatch();

  // Get Product
  React.useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const filterRelatedProduct = (products: ProductType[]) => {
    if (products) return products.filter((t) => t.related);

    return products;
  };

  // Get Products
  const Relatedproducts = useSelector((state) =>
    filterRelatedProduct(state.ecommerce2Reducer.products)
  );

  // skeleton
  const [isLoading, setLoading] = React.useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Box>
      <Typography variant="h4" mb={4} mt={7}>
      You might also like
      </Typography>
      <Grid container spacing={3}>
        {Relatedproducts.map((product) => (
          <Grid
            item
            xs={12}
            lg={3}
            sm={4}
            display="flex"
            alignItems="stretch"
            key={product.title}
          >
            {/* ------------------------------------------- */}
            {/* Product Card */}
            {/* ------------------------------------------- */}
            <Box
              position="relative"
              overflow="hidden"
              width="100%"
              sx={{
                borderRadius: 0,
                "&:hover .wishList": {
                  right: "0 !important",
                  visibility: "visible",
                },
              }}
            >
              <Typography
                component={Link}
                href={`/apps/ecommerce/detail2/${product.id}`}
              >
                {isLoading ? (
                  <Skeleton
                    variant="rectangular"
                    animation="wave"
                    width="100%"
                    sx={{
                      borderRadius: (theme) => theme.shape.borderRadius / 27,
                    }}
                    height={268}
                  ></Skeleton>
                ) : (
                  <Avatar
                    src={product.photo}
                    alt="img"
                    sx={{ width: "100%", height: "256px", borderRadius: "9px" }}
                  />
                )}
              </Typography>
             
                <Typography variant="h6" my={1}>
                  {product.title}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box color="warning.main" display="flex" alignItems="center">
                    <IconStarFilled width={16} />
                  </Box>
                  <Typography variant="h6" color="textSecondary">
                    4.8
                  </Typography>
                  <Typography color="textSecondary">
                    ({product.rating})
                  </Typography>
                </Stack>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  mt={1}
                >
                  <Stack direction="row" alignItems="center">
                    <Typography variant="h6">${product.price}</Typography>
                    <Typography color="textSecondary" ml={1}>
                      ${product.salesPrice}
                    </Typography>
                  </Stack>
                </Stack>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ProductRelated;
