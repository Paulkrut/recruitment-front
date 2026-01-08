"use client";
import * as React from "react";
import { Box, Container, Typography } from "@mui/material";
import { Icon } from "@iconify/react";

export default function SocialProofBar() {
  return (
    <Box sx={{ bgcolor: '#fff', borderTop: '1px solid #e5e5e5', borderBottom: '1px solid #e5e5e5', py: 3, borderRadius: 0 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 3 }}>
          {[
            { icon: 'mdi:clock-fast', value: '17x', label: 'быстрее найм' },
            { icon: 'mdi:currency-usd-off', value: '5x', label: 'дешевле интервью' },
            { icon: 'mdi:account-check', value: '95%', label: 'довольных клиентов' },
            { icon: 'mdi:shield-check', value: '152-ФЗ', label: 'соответствие' },
          ].map((item, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Icon icon={item.icon} width={24} height={24} color="#4CAF50" />
              <Box>
                <Typography sx={{ fontSize: '1.3rem', fontWeight: 800, color: '#1a1a1a', lineHeight: 1 }}>
                  {item.value}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#888' }}>{item.label}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}

