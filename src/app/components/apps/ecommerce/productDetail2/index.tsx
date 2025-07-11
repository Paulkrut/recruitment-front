import React, { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";

// MUI Elements
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Fab from '@mui/material/Fab';
import Grid from '@mui/material/Grid';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";

import { useSelector, useDispatch } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  fetchProducts,
  addToCart,
} from "@/store/apps/eCommerce/ECommerceSlice";
import {
  IconCheck,
  IconMinus,
  IconPlus,
  IconStarFilled,
} from "@tabler/icons-react";
import AlertCart from "../productCart/AlertCart";
import { ProductType } from "../../../../(DashboardLayout)/types/apps/eCommerce";
import ProductDesc from "./ProductDesc";

const ProductDetail = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const router = usePathname();

  const getTitle: string | any = router.split("/").pop();

  // Get Product
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Get Products
  const product: ProductType | any = useSelector(
    (state: AppState) => state.ecommerceReducer.products[getTitle - 1]
  );

  /// select colors on click
  const [scolor, setScolor] = useState(product ? product.colors[0] : "");
  const setColor = (e: string) => {
    setScolor(e);
  };

  //set qty
  const [count, setCount] = useState(1);

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

  // color select
  const [color, setPColor] = React.useState("10");

  const handleChange = (event: SelectChangeEvent) => {
    setPColor(event.target.value as string);
  };

  // size select
  const [size, setSize] = React.useState("10");

  const handleChange2 = (event: SelectChangeEvent) => {
    setSize(event.target.value as string);
  };
  return (
    <Box p={2}>
      {product ? (
        <>
          {/* ------------------------------------------- */}
          {/* Title and description */}
          {/* ------------------------------------------- */}
          <Typography fontWeight="600" variant="h2">
            {product?.title}
          </Typography>
          {/* ------------------------------------------- */}
          {/* Ratings */}
          {/* ------------------------------------------- */}
          <Stack direction="row" alignItems="center" spacing={1} mt={1}>
            <Box color="warning.main" display="flex" alignItems="center">
              <IconStarFilled width={16} />
            </Box>
            <Typography variant="h6" color="textSecondary">
              {product.rating}
            </Typography>
            <Typography
              color="textSecondary"
              variant="subtitle1"
              fontSize="16px"
            >
              ( 87 reviews)
            </Typography>
          </Stack>

          <Typography
            variant="subtitle1"
            fontSize="16px"
            mt={1}
            color={theme.palette.text.secondary}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ex
            arcu, tincidunt bibendum felis.
          </Typography>
          {/* ------------------------------------------- */}
          {/* Price */}
          {/* ------------------------------------------- */}
          <Typography
            my={2}
            variant="subtitle1"
            fontSize="21px"
            fontWeight={600}
            display="flex"
            alignItems="center"
            gap={2}
          >
            <Box
              component={"div"}
              fontSize="21px"
              sx={{ textDecoration: "line-through" }}
              color="textSecondary"
            >
              ${product.salesPrice}
            </Box>{" "}
            ${product.price}
          </Typography>

          <Divider />
          {/* ------------------------------------------- */}
          {/* Size */}
          {/* ------------------------------------------- */}
          <Stack pt={4} direction="row" alignItems="center">
            <Typography variant="h6" mr={1} width={80}>
              Size:
            </Typography>
            <Box width="100%">
              <FormControl fullWidth>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={size}
                  onChange={handleChange2}
                >
                  <MenuItem value={10}>Small</MenuItem>
                  <MenuItem value={20}>Medium</MenuItem>
                  <MenuItem value={30}>Large</MenuItem>
                  <MenuItem value={40}>x- Large</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Stack>
          {/* ------------------------------------------- */}
          {/* Colors */}
          {/* ------------------------------------------- */}
          <Stack direction="row" pt={2} alignItems="center">
            <Typography variant="h6" mr={1} width={80}>
              Colors:
            </Typography>
            <Box width="100%">
              <FormControl fullWidth>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={color}
                  onChange={handleChange}
                >
                  <MenuItem value={10}>Red</MenuItem>
                  <MenuItem value={20}>Yellow</MenuItem>
                  <MenuItem value={30}>Brown</MenuItem>
                  <MenuItem value={40}>Green</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Stack>
          {/* ------------------------------------------- */}
          {/* Qty */}
          {/* ------------------------------------------- */}
          <Stack direction="row" alignItems="center" pt={2} pb={3}>
            <Typography variant="h6" width={80}>
              QTY:
            </Typography>
            <Box>
              <ButtonGroup color="secondary" aria-label="small button group">
                <Button
                  key="one"
                  onClick={() => setCount(count < 2 ? count : count - 1)}
                >
                  <IconMinus size="1.1rem" />
                </Button>
                <Button key="two">{count}</Button>
                <Button key="three" onClick={() => setCount(count + 1)}>
                  <IconPlus size="1.1rem" />
                </Button>
              </ButtonGroup>
            </Box>
          </Stack>
          {/* ------------------------------------------- */}
          {/* Buttons */}
          {/* ------------------------------------------- */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6}>
              <Button
                color="primary"
                size="large"
                fullWidth
                component={Link}
                variant="outlined"
                href="/apps/eco-checkout"
                onClick={() => dispatch(addToCart(product))}
              >
               Add to Wishlist
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                color="primary"
                size="large"
                fullWidth
                variant="contained"
                onClick={() => dispatch(addToCart(product)) && handleClick()}
              >
                Add to Cart
              </Button>
            </Grid>
          </Grid>
          <Divider />

          <ProductDesc />
          {/* ------------------------------------------- */}
          {/* Alert When click on add to cart */}
          {/* ------------------------------------------- */}
          <AlertCart handleClose={handleClose} openCartAlert={cartalert} />
        </>
      ) : (
        "No product"
      )}
    </Box>
  );
};

export default ProductDetail;
