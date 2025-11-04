'use client';

import { usePathname } from 'next/navigation';
import { Tabs, Tab, Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import EditIcon from '@mui/icons-material/Edit';
import AssessmentIcon from '@mui/icons-material/Assessment';
import MailIcon from '@mui/icons-material/Mail';

interface RegulationTestTabsProps {
  testId: string | number;
}

export default function RegulationTestTabs({ testId }: RegulationTestTabsProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Определяем текущий активный таб на основе pathname
  const getCurrentTab = () => {
    if (pathname.includes('/edit')) return 'edit';
    if (pathname.includes('/results')) return 'results';
    if (pathname.includes('/invitations')) return 'invitations';
    return 'edit';
  };

  const currentTab = getCurrentTab();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    router.push(`/hr/regulation-tests/${testId}/${newValue}`);
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
      <Tabs value={currentTab} onChange={handleTabChange} aria-label="regulation test tabs">
        <Tab
          icon={<EditIcon />}
          iconPosition="start"
          label="Редактировать"
          value="edit"
        />
        <Tab
          icon={<AssessmentIcon />}
          iconPosition="start"
          label="Результаты"
          value="results"
        />
        <Tab
          icon={<MailIcon />}
          iconPosition="start"
          label="Приглашения"
          value="invitations"
        />
      </Tabs>
    </Box>
  );
}

