import React from "react";
import { useDispatch, useSelector } from "@/store/hooks";
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import Typography from '@mui/material/Typography';
import {
  sortByProducts,
  sortByGender,
  sortByColor,
  sortByPrice,
  filterReset,
} from "@/store/apps/eCommerce/ECommerceSlice";
import { IconCheck, IconChevronDown } from "@tabler/icons-react";
import {
  IconHanger,
  IconCircles,
  IconNotebook,
  IconMoodSmile,
  IconDeviceLaptop,
  IconSortAscending2,
  IconSortDescending2,
  IconAd2,
} from "@tabler/icons-react";
import { Stack } from "@mui/system";
import { ProductFiterType } from "../../../../(DashboardLayout)/types/apps/eCommerce";
import BlankCard from "../../../shared/BlankCard";

const ProductFilter2 = () => {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.ecommerceReducer.products);
  const active = useSelector((state) => state.ecommerceReducer.filters);
  const checkactive = useSelector((state) => state.ecommerceReducer.sortBy);
  const customizer = useSelector((state) => state.customizer);
  const br = `${customizer.borderRadius}px`;

  const getUniqueData = (data: string[], attr: any) => {
    let newVal = data.map((curElem) => {
      return curElem[attr];
    });
    if (attr === "colors") {
      newVal = newVal.flat();
    }

    return (newVal = ["All", ...Array.from(new Set(newVal))]);
  };

  const filterbyGender = getUniqueData(products, "gender");
  const filterbyColors = getUniqueData(products, "colors");

  const filterCategory: ProductFiterType[] = [
    {
      id: 2,
      name: "All",
      sort: "All",
      icon: IconCircles,
    },
    {
      id: 3,
      name: "Fashion",
      sort: "fashion",
      icon: IconHanger,
    },
    {
      id: 9,
      name: "Books",
      sort: "books",
      icon: IconNotebook,
    },
    {
      id: 10,
      name: "Toys",
      sort: "toys",
      icon: IconMoodSmile,
    },
    {
      id: 11,
      name: "Electronics",
      sort: "electronics",
      icon: IconDeviceLaptop,
    },
    {
      id: 6,
      devider: true,
    },
  ];
  const filterbySort = [
    { id: 1, value: "newest", label: "Newest", icon: IconAd2 },
    {
      id: 2,
      value: "priceDesc",
      label: "Price: High-Low",
      icon: IconSortAscending2,
    },
    {
      id: 3,
      value: "priceAsc",
      label: "Price: Low-High",
      icon: IconSortDescending2,
    },
    { id: 4, value: "discount", label: "Discounted", icon: IconAd2 },
  ];
  const filterbyPrice = [
    {
      id: 0,
      label: "All",
      value: "All",
    },
    {
      id: 1,
      label: "0-50",
      value: "0-50",
    },
    {
      id: 3,
      label: "50-100",
      value: "50-100",
    },
    {
      id: 4,
      label: "100-200",
      value: "100-200",
    },
    {
      id: 5,
      label: "Over 200",
      value: "200-99999",
    },
  ];

  const handlerGenderFilter = (value: React.ChangeEvent<HTMLInputElement>) => {
    if (value.target.checked) {
      dispatch(sortByGender({ gender: value.target.value }));
    }
  };
  const handlerPriceFilter = (value: React.ChangeEvent<HTMLInputElement>) => {
    if (value.target.checked) {
      dispatch(sortByPrice({ price: value.target.value }));
    }
  };

  //   1
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const categoryopen = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  //   2
  const [anchorEl2, setAnchorEl2] = React.useState<null | HTMLElement>(null);
  const sortopen = Boolean(anchorEl2);
  const handleClick2 = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl2(event.currentTarget);
  };
  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  //   3
  const [anchorEl3, setAnchorEl3] = React.useState<null | HTMLElement>(null);
  const filteropen = Boolean(anchorEl3);
  const handleClick3 = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl3(event.currentTarget);
  };
  const handleClose3 = () => {
    setAnchorEl3(null);
  };

  //   4
  const [anchorEl4, setAnchorEl4] = React.useState<null | HTMLElement>(null);
  const priceopen = Boolean(anchorEl4);
  const handleClick4 = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl4(event.currentTarget);
  };
  const handleClose4 = () => {
    setAnchorEl4(null);
  };

  //   5
  const [anchorEl5, setAnchorEl5] = React.useState<null | HTMLElement>(null);
  const coloropen = Boolean(anchorEl5);
  const handleClick5 = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl5(event.currentTarget);
  };
  const handleClose5 = () => {
    setAnchorEl5(null);
  };

  return (
    <>
      <Box mb={4}>
        <BlankCard>
          <Box px={3} py={2}>
            <Stack direction="row" alignItems="center" spacing={1} width="100%">
              <Typography variant="subtitle1" color="textSecondary">
                Filter By:{" "}
              </Typography>
              {/* ------------------------------------------- */}
              {/* Sort by */}
              {/* ------------------------------------------- */}
              <Button
                id="sort-button"
                aria-controls={sortopen ? "sort-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={sortopen ? "true" : undefined}
                onClick={handleClick2}
                sx={{
                  backgroundColor: "transparent",
                  color: "inherit",
                  "&:hover": {
                    backgroundColor: "transparent",
                    color: "inherit",
                  },
                }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  Sort By <IconChevronDown width={18} />
                </Box>
              </Button>
              <Menu
                id="sort-menu"
                anchorEl={anchorEl2}
                open={sortopen}
                onClose={handleClose2}
                MenuListProps={{
                  "aria-labelledby": "sort-button",
                }}
              >
                {filterbySort.map((filter) => (
                  <MenuItem
                    selected={checkactive === `${filter.value}`}
                    onClick={() => dispatch(sortByProducts(`${filter.value}`))}
                    key={filter.id + filter.label + filter.value}   sx={{ mb: 1, mx: 1, borderRadius: br }}
                  >
                    <ListItemIcon sx={{ minWidth: "30px" }}>
                      <filter.icon stroke="1.5" size={19} />
                    </ListItemIcon>
                    <ListItemText>{filter.label}</ListItemText>
                  </MenuItem>
                ))}
              </Menu>
              <Divider orientation="vertical" variant="middle" flexItem />
              {/* ------------------------------------------- */}
              {/* Filter By Gender */}
              {/* ------------------------------------------- */}
              <Button
                id="sort-button"
                aria-controls={filteropen ? "sort-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={filteropen ? "true" : undefined}
                onClick={handleClick3}
                sx={{
                  backgroundColor: "transparent",
                  color: "inherit",
                  "&:hover": {
                    backgroundColor: "transparent",
                    color: "inherit",
                  },
                }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  Gender <IconChevronDown width={18} />
                </Box>
              </Button>
              <Menu
                id="sort-menu"
                anchorEl={anchorEl3}
                open={filteropen}
                onClose={handleClose3}
                MenuListProps={{
                  "aria-labelledby": "sort-button",
                }}
              >
                <FormGroup>
                  {filterbyGender.map((gen, i ) => (
                    <MenuItem onClick={handleClose3} sx={{ mb: 1, mx: 1, borderRadius: br }} key={i}>
                      <FormControlLabel
                        key={gen}
                        control={
                          <Radio
                            value={gen}
                            checked={active.gender === gen}
                            onChange={handlerGenderFilter}
                          />
                        }
                        label={gen}
                      />
                    </MenuItem>
                  ))}
                </FormGroup>
              </Menu>
              <Divider orientation="vertical" variant="middle" flexItem />
              {/* ------------------------------------------- */}
              {/* Filter By Pricing */}
              {/* ------------------------------------------- */}
              <Button
                id="sort-button"
                aria-controls={priceopen ? "sort-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={priceopen ? "true" : undefined}
                onClick={handleClick4}
                sx={{
                  backgroundColor: "transparent",
                  color: "inherit",
                  "&:hover": {
                    backgroundColor: "transparent",
                    color: "inherit",
                  },
                }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  Pricing <IconChevronDown width={18} />
                </Box>
              </Button>
              <Menu
                id="sort-menu"
                anchorEl={anchorEl4}
                open={priceopen}
                onClose={handleClose4}
                MenuListProps={{
                  "aria-labelledby": "sort-button",
                }}
              >
                <FormGroup>
                  {filterbyPrice.map((price,i) => (
                    <MenuItem onClick={handleClose4} sx={{ mb: 1, mx: 1, borderRadius: br }} key={i}>
                      <FormControlLabel
                        key={price.label}
                        control={
                          <Radio
                            value={price.value}
                            checked={active.price === price.value}
                            onChange={handlerPriceFilter}
                          />
                        }
                        label={price.label}
                      />
                    </MenuItem>
                  ))}
                </FormGroup>
              </Menu>
              <Divider orientation="vertical" variant="middle" flexItem />
              {/* ------------------------------------------- */}
              {/* Filter By colors */}
              {/* ------------------------------------------- */}
              <Button
                id="sort-button"
                aria-controls={coloropen ? "sort-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={coloropen ? "true" : undefined}
                onClick={handleClick5}
                sx={{
                  backgroundColor: "transparent",
                  color: "inherit",
                  "&:hover": {
                    backgroundColor: "transparent",
                    color: "inherit",
                  },
                }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  Colors <IconChevronDown width={18} />
                </Box>
              </Button>
              <Menu
                id="sort-menu"
                anchorEl={anchorEl5}
                open={coloropen}
                onClose={handleClose5}
                MenuListProps={{
                  "aria-labelledby": "sort-button",
                }}
              >
                <MenuItem onClick={handleClose5}>
                  <Stack direction={"row"} flexWrap="wrap" gap={2}>
                    {filterbyColors.map((curColor) => {
                      if (curColor !== "All") {
                        return (
                          <Avatar
                            sx={{
                              backgroundColor: curColor,
                              width: 30,
                              height: 30,
                              cursor: "pointer",
                            }}
                            aria-label={curColor}
                            key={curColor}
                            onClick={
                              active.color === curColor
                                ? () => dispatch(sortByColor({ color: "All" }))
                                : () =>
                                    dispatch(sortByColor({ color: curColor }))
                            }
                          >
                            {active.color === curColor ? (
                              <IconCheck size="13" />
                            ) : (
                              ""
                            )}
                          </Avatar>
                        );
                      } else {
                        return (
                          <Box key={curColor} sx={{ display: "none" }}></Box>
                        );
                      }
                    })}
                  </Stack>
                </MenuItem>
              </Menu>
              {/* ------------------------------------------- */}
              {/* Reset */}
              {/* ------------------------------------------- */}
              <Box ml="auto !important">
                <Button
                  variant="contained"
                  onClick={() => dispatch(filterReset())}
                >
                  Reset Filters
                </Button>
              </Box>
            </Stack>
          </Box>
        </BlankCard>
      </Box>
    </>
  );
};

export default ProductFilter2;
