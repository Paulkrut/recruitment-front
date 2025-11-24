"use client"

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Image from "next/image";
import Link from "next/link";
import { Trans, useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';


const Maintenance = () => {
  const { _ } = useLingui();
  
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
        src={"/images/backgrounds/maintenance2.svg"}
        alt={_(msg`Техническое обслуживание`)} width={500} height={500}
        style={{ width: "100%", maxWidth: "500px", maxHeight: "500px" }}
      />
      <Typography align="center" variant="h1" mb={4}><Trans>Техническое обслуживание!!!</Trans></Typography>
      <Typography align="center" variant="h4" mb={4}><Trans>Сайт находится на техническом обслуживании. Загляните позже!</Trans></Typography>
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
};

export default Maintenance;
