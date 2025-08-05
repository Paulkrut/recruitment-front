'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { CircularProgress, Box } from '@mui/material';

interface CompanyGuardProps {
  children: React.ReactNode;
  excludePaths?: string[];
}

export default function CompanyGuard({ children, excludePaths = [] }: CompanyGuardProps) {
  const { currentCompany, companies, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (excludePaths.some(path => pathname.startsWith(path))) {
      return;
    }

    if (companies.length === 0 || !currentCompany) {
      router.push('/hr/choose-company');
      return;
    }
  }, [currentCompany, companies, isLoading, router, excludePaths, pathname]);

  if (isLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  const isExcludedPath = excludePaths.some(path => pathname.startsWith(path));

  if (isExcludedPath) {
    return <>{children}</>;
  }

  if (companies.length === 0 || !currentCompany) {
    return null;
  }

  return <>{children}</>;
} 