'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Stack,
  Typography,
  Avatar,
  Skeleton,
  Menu,
  MenuItem,
  Chip,
  Button,
  Divider,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useUser } from '@/contexts/UserContext';
import { Trans } from '@lingui/react';


const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test';

interface CompanyDetails {
  id: number;
  name: string;
  inn?: string;
  logo?: string;
}

const CompanyInfo = () => {
  const { currentCompany, companies, setCurrentCompany } = useUser();
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Загружаем детали компании (логотип, ИНН) при изменении текущей компании
  useEffect(() => {
    if (currentCompany) {
      loadCompanyDetails();
    } else {
      setCompanyDetails(null);
    }
  }, [currentCompany]);

  const loadCompanyDetails = async () => {
    if (!currentCompany) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('recruitment_token');

      if (!token) return;

      const response = await fetch(`${API_BASE}/api/companies/${currentCompany.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Company-ID': currentCompany.id.toString(),
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCompanyDetails(data);
      }
    } catch (err) {
      console.error('Error loading company details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (companies.length > 1) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCompanyChange = (companyId: number) => {
    const selectedCompany = companies.find(c => c.id === companyId);
    if (selectedCompany) {
      setCurrentCompany(selectedCompany);
      handleClose();
      window.location.reload();
    }
  };

  if (!currentCompany) {
    return null;
  }

  if (loading && !companyDetails) {
    return (
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Skeleton variant="circular" width={40} height={40} />
        <Box>
          <Skeleton variant="text" width={120} height={20} />
          <Skeleton variant="text" width={80} height={16} />
        </Box>
      </Stack>
    );
  }

  // Используем детали из API если есть, иначе базовую инфу из контекста
  const displayName = companyDetails?.name || currentCompany.name;
  const displayLogo = companyDetails?.logo;
  const displayInn = companyDetails?.inn;
  const hasMultipleCompanies = companies.length > 1;

  return (
    <>
      <Box
        onClick={handleClick}
        sx={{
          cursor: hasMultipleCompanies ? 'pointer' : 'default',
          borderRadius: '10px',
          px: 1.5,
          py: 1,
          transition: 'all 0.2s',
          '&:hover': hasMultipleCompanies ? {
            backgroundColor: 'action.hover',
          } : {},
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            src={displayLogo ? `${API_BASE}${displayLogo}` : undefined}
            sx={{
              width: 40,
              height: 40,
              bgcolor: 'primary.main',
            }}
          >
            {displayLogo ? null : (
              <Icon icon="solar:buildings-2-bold-duotone" width={24} />
            )}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography
                variant="body1"
                fontWeight={600}
                sx={{
                  lineHeight: 1.2,
                  maxWidth: 200,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {displayName}
              </Typography>
              {hasMultipleCompanies && (
                <Icon 
                  icon={open ? 'solar:alt-arrow-up-bold' : 'solar:alt-arrow-down-bold'} 
                  width={16} 
                />
              )}
            </Stack>
            {displayInn && (
              <Typography variant="caption" color="text.secondary">
                ИНН: {displayInn}
              </Typography>
            )}
          </Box>
        </Stack>
      </Box>

      {/* Меню выбора компании */}
      {hasMultipleCompanies && (
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          transformOrigin={{ horizontal: 'left', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          PaperProps={{
            elevation: 3,
            sx: {
              width: 320,
              mt: 1,
              borderRadius: '12px',
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" color="text.secondary"><Trans>Выберите компанию</Trans></Typography>
          </Box>
          <Divider />
          {companies.map((company) => (
            <MenuItem
              key={company.id}
              onClick={() => handleCompanyChange(company.id)}
              selected={company.id === currentCompany.id}
              sx={{
                py: 1.5,
                px: 2,
                mx: 1,
                my: 0.5,
                borderRadius: '8px',
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center" width="100%">
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: company.id === currentCompany.id ? 'primary.main' : 'grey.300',
                  }}
                >
                  <Icon icon="solar:buildings-2-bold-duotone" width={20} />
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    fontWeight={company.id === currentCompany.id ? 600 : 400}
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {company.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {company.role}
                  </Typography>
                </Box>
                {company.id === currentCompany.id && (
                  <Icon icon="solar:check-circle-bold" width={20} style={{ color: '#4caf50' }} />
                )}
              </Stack>
            </MenuItem>
          ))}
        </Menu>
      )}
    </>
  );
};

export default CompanyInfo;

