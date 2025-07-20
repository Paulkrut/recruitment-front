import React from "react";
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Grid from '@mui/material/Grid';
import { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import NextLink from "next/link";

import { IconCircle } from "@tabler/icons-react";


interface BreadCrumbType {
  subtitle?: string;
  items?: any[];
  title: string;
  children?: JSX.Element;
}

const Breadcrumb = ({ subtitle, items, title, children }: BreadCrumbType) => {
  const lgDown = useMediaQuery((theme: any) => theme.breakpoints.down("lg"));
  return (
    <Grid
      container
      sx={{
        backgroundColor: (theme) => theme.palette.background.paper,
        borderRadius: (theme: Theme) => theme.shape.borderRadius / 4,
        p: "30px 25px 20px",
        marginBottom: "30px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Grid item xs={12} sm={6} lg={8} mb={1}>
        <Typography variant="h4" mb={0}>{title}</Typography>
      </Grid>
      <Grid item xs={12} sm={6} lg={4} mb={1} display="flex" alignItems="center" justifyContent="flex-end">
        <Typography color="textSecondary" variant="h6" fontWeight={400} mb={0}>
          {subtitle}
        </Typography>
        <Breadcrumbs
          separator={
            <IconCircle
              size="5"
              fill="textSecondary"
              fillOpacity={"0.6"}
              style={{ margin: "0 5px" }}
            />
          }
          sx={{ alignItems: "center" }}
          aria-label="breadcrumb"
        >
          {items
            ? items.map((item) => (
                <div key={item.title}>
                  {item.to ? (
                    <NextLink href={item.to} passHref>
                      <Typography color="textSecondary">
                        {item.title}
                      </Typography>
                    </NextLink>
                  ) : (
                    <Typography color="textPrimary">{item.title}</Typography>
                  )}
                </div>
              ))
            : ""}
        </Breadcrumbs>
      </Grid>
    </Grid>
  );
};

export default Breadcrumb;
