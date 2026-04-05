"use client";

import * as React from "react";
import { Box, Checkbox, Link as MuiLink, Typography } from "@mui/material";
import Link from "next/link";
import { hasHrToolsConsent, setHrToolsConsent } from "../lib/consent";

export default function HrToolConsent() {
  const [checked, setChecked] = React.useState(false);

  React.useEffect(() => {
    setChecked(hasHrToolsConsent());
  }, []);

  const handleChange = (val: boolean) => {
    setChecked(val);
    setHrToolsConsent(val);
  };

  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, my: 1.5 }}>
      <Checkbox
        checked={checked}
        onChange={(e) => handleChange(e.target.checked)}
        size="small"
        sx={{ mt: -0.3, ml: -1, flexShrink: 0 }}
      />
      <Typography sx={{ fontSize: "0.82rem", color: "#64748b", lineHeight: 1.5 }}>
        Подтверждаю согласие с{" "}
        <MuiLink component={Link} href="/terms-of-service" target="_blank" underline="hover">
          Офертой
        </MuiLink>
        ,{" "}
        <MuiLink component={Link} href="/privacy-policy" target="_blank" underline="hover">
          Политикой конфиденциальности
        </MuiLink>{" "}
        и{" "}
        <MuiLink component={Link} href="/personal-data-consent" target="_blank" underline="hover">
          Согласием на обработку ПД
        </MuiLink>
        .
      </Typography>
    </Box>
  );
}
