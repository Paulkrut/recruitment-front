"use client";import { Trans } from '@lingui/macro';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Image from "next/image";
import Link from "next/link";
import React from "react";



export default function NotFound() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100vh"
      textAlign="center"
      justifyContent="center"
    >
      <Container maxWidth="md">
        <Image
          src={"/images/backgrounds/errorimg.svg"}
          alt="404"
          width={500}
          height={500}
          style={{ width: "100%", maxWidth: "500px", maxHeight: "500px" }}
        />
        <Typography align="center" variant="h1" mb={4}><Trans>Упс!!!</Trans></Typography>
        <Typography align="center" variant="h4" mb={4}><Trans>Страница, которую вы ищете, не найдена.</Trans></Typography>
        <Button
          color="primary"
          variant="contained"
          component={Link}
          href="/"
          disableElevation
        ><Trans>Вернуться на главную</Trans></Button>
      </Container>
    </Box>
  );
}
