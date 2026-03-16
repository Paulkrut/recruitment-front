"use client";

import * as React from "react";
import { Box, Checkbox, Link as MuiLink, Typography } from "@mui/material";
import Link from "next/link";

interface HrToolConsentProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function HrToolConsent({ checked, onChange }: HrToolConsentProps) {
  return (
    <Box
      sx={{
        mt: 3,
        p: 2,
        borderRadius: 2,
        border: "1px solid #e2e8f0",
        bgcolor: "#f8fafc",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
        <Checkbox
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          sx={{ mt: -0.5, ml: -1 }}
        />
        <Typography sx={{ fontSize: "0.88rem", color: "#334155", lineHeight: 1.6 }}>
          Нажимая кнопку инструмента, я подтверждаю согласие с{" "}
          <MuiLink component={Link} href="/terms-of-service" target="_blank" underline="hover">
            Офертой
          </MuiLink>
          ,{" "}
          <MuiLink component={Link} href="/privacy-policy" target="_blank" underline="hover">
            Политикой конфиденциальности
          </MuiLink>{" "}
          и{" "}
          <MuiLink component={Link} href="/personal-data-consent" target="_blank" underline="hover">
            Согласием на обработку персональных данных
          </MuiLink>
          .
        </Typography>
      </Box>
    </Box>
  );
}
