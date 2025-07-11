import React, { useEffect } from "react";
import { filter, orderBy } from "lodash";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Fab from "@mui/material/Fab";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import { Theme } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import Link from "next/link";
import { useSelector, useDispatch } from "@/store/hooks";
import {
  fetchProducts,
  addToCart,
  filterReset,
} from "@/store/apps/eCommerce/EcommerceSlicev2";
import ProductSearch from "./ProductSearch";
import {
  IconBasket,
  IconHeart,
  IconMenu2,
  IconStarFilled,
} from "@tabler/icons-react";
import AlertCart from "../productCart/AlertCart";
import { ProductType } from "../../../../(DashboardLayout)/types/apps/eCommerce";
import Image from "next/image";

interface Props {
  onClick: (event: React.SyntheticEvent | Event) => void;
}

const ProductList2 = ({ onClick }: Props) => {
  const dispatch = useDispatch();
  const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up("lg"));
  const customizer = useSelector((state) => state.customizer);
  const br = `${customizer.borderRadius}px`;

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const getVisibleProduct = (
    products: ProductType[],
    sortBy: string,
    filters: any,
    search: string
  ) => {
    // SORT BY
    if (sortBy === "newest") {
      products = orderBy(products, ["created"], ["desc"]);
    }
    if (sortBy === "priceDesc") {
      products = orderBy(products, ["price"], ["desc"]);
    }
    if (sortBy === "priceAsc") {
      products = orderBy(products, ["price"], ["asc"]);
    }
    if (sortBy === "discount") {
      products = orderBy(products, ["discount"], ["desc"]);
    }

    // FILTER PRODUCTS
    if (filters.category !== "All") {
      products = products.filter((_product) =>
        _product.category.includes(filters.category)
      );
    }

    //FILTER PRODUCTS BY GENDER
    if (filters.gender !== "All") {
      products = filter(
        products,
        (_product) => _product.gender === filters.gender
      );
    }

    //FILTER PRODUCTS BY GENDER
    if (filters.color !== "All") {
      products = products.filter((_product) =>
        _product.colors.includes(filters.color)
      );
    }

    //FILTER PRODUCTS BY Search
    if (search !== "") {
      products = products.filter((_product) =>
        _product.title.toLocaleLowerCase().includes(search.toLocaleLowerCase())
      );
    }

    //FILTER PRODUCTS BY Price
    if (filters.price !== "All") {
      const minMax = filters.price ? filters.price.split("-") : "";
      products = products.filter((_product) =>
        filters.price
          ? _product.price >= minMax[0] && _product.price <= minMax[1]
          : true
      );
    }

    return products;
  };

  const getProducts = useSelector((state) =>
    getVisibleProduct(
      state.ecommerceReducer.products,
      state.ecommerceReducer.sortBy,
      state.ecommerceReducer.filters,
      state.ecommerceReducer.productSearch
    )
  );

  // for alert when added something to cart
  const [cartalert, setCartalert] = React.useState(false);

  const handleClick = () => {
    setCartalert(true);
  };

  const handleClose = (reason: string) => {
    if (reason === "clickaway") {
      return;
    }
    setCartalert(false);
  };

  // skeleton
  const [isLoading, setLoading] = React.useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Box>
      {/* ------------------------------------------- */}
      {/* Header Detail page */}
      {/* ------------------------------------------- */}
      <Stack direction="row" justifyContent="space-between" pb={3}>
        {lgUp ? (
          <Typography variant="h5">{getProducts.length} Products</Typography>
        ) : (
          <Fab onClick={onClick} color="primary" size="small">
            <IconMenu2 width="16" />
          </Fab>
        )}
        <Box>
          <ProductSearch />
        </Box>
      </Stack>

      {/* ------------------------------------------- */}
      {/* Page Listing product */}
      {/* ------------------------------------------- */}
      <Grid container spacing={3}>
        {getProducts.length > 0 ? (
          <>
            {getProducts.map((product) => (
              <Grid
                item
                xs={12}
                lg={3}
                md={4}
                sm={6}
                display="flex"
                alignItems="stretch"
                key={product.id}
              >
                {/* ------------------------------------------- */}
                {/* Product Card */}
                {/* ------------------------------------------- */}
                {isLoading ? (
                  <>
                    <Skeleton
                      variant="rectangular"
                      width={270}
                      height={300}
                      sx={{
                        borderRadius: (theme) => theme.shape.borderRadius / 20,
                      }}
                    ></Skeleton>
                  </>
                ) : (
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
                      <Avatar
                        src={product.photo}
                        alt="img"
                        sx={{
                          width: "100%",
                          height: "256px",
                          borderRadius: br,
                        }}
                      />
                    </Typography>
                    <Box
                      className="wishList"
                      sx={{
                        position: "absolute",
                        top: "37%",
                        right: "-100px",
                        transition: "all .3s ease-in-out",
                        visibility: "hidden",
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={2}
                        sx={{
                          bottom: "75px",
                          right: "15px",
                          position: "absolute",
                        }}
                      >
                        <Tooltip title="Add To Favourites">
                          <Fab
                            color="inherit"
                            onClick={() =>
                              dispatch(addToCart(product)) && handleClick()
                            }
                            sx={{
                              height: "36px",
                              width: "36px",
                              backgroundColor: (theme:any) => theme.palette.mode==="light"?"white":"#111C2D",
                              "&:hover": {
                                backgroundColor: (theme:any) => theme.palette.mode==="light"?"white":"#111C2D",
                              },
                            }}
                          >
                            <IconHeart size="20" />
                          </Fab>
                        </Tooltip>
                        <Tooltip title="Add To Cart">
                          <Fab
                            color="inherit"
                            onClick={() =>
                              dispatch(addToCart(product)) && handleClick()
                            }
                            sx={{
                              height: "36px",
                              width: "36px",
                              backgroundColor: (theme:any) => theme.palette.mode==="light"?"white":"#111C2D",
                              "&:hover": {
                                backgroundColor: (theme:any) => theme.palette.mode==="light"?"white":"#111C2D",
                              },
                            }}
                          >
                            <IconBasket size="20" />
                          </Fab>
                        </Tooltip>
                      </Stack>
                    </Box>

                    <Typography variant="h6" my={1}>
                      {product.title}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box
                        color="warning.main"
                        display="flex"
                        alignItems="center"
                      >
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
                )}
                <AlertCart
                  handleClose={handleClose}
                  openCartAlert={cartalert}
                />
                {/* ------------------------------------------- */}
                {/* Product Card */}
                {/* ------------------------------------------- */}
              </Grid>
            ))}
          </>
        ) : (
          <>
            <Grid item xs={12} lg={12} md={12} sm={12}>
              <Box textAlign="center" mt={6}>
                <Image
                  src="/images/products/empty-shopping-cart.svg"
                  alt="cart"
                  width={200}
                  height={200}
                />
                <Typography variant="h2">There is no Product</Typography>
                <Typography variant="h6" mb={3}>
                  The Product you are searching is no longer available.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => dispatch(filterReset())}
                >
                  Try Again
                </Button>
              </Box>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
};

export default ProductList2;
