'use client';

import { usePathname } from 'next/navigation';
import { Tabs, Tab, Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import EditIcon from '@mui/icons-material/Edit';
import PeopleIcon from '@mui/icons-material/People';
import QuizIcon from '@mui/icons-material/Quiz';
import { useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';


interface RegulationTestTabsProps {
  testId: string | number;
}

export default function RegulationTestTabs({ testId }: RegulationTestTabsProps) {
  const { _ } = useLingui();

  const router = useRouter();
  const pathname = usePathname();

  // Определяем текущий активный таб на основе pathname
  const getCurrentTab = () => {
    if (pathname.includes('/edit')) return 'edit';
    if (pathname.includes('/questions')) return 'questions';
    if (pathname.includes('/results') || pathname.includes('/invitations')) return 'results';
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
          label={_(msg`Редактировать`)}
          value="edit"
        />
        <Tab
          icon={<QuizIcon />}
          iconPosition="start"
          label={_(msg`Вопросы`)}
          value="questions"
        />
        <Tab
          icon={<PeopleIcon />}
          iconPosition="start"
          label={_(msg`Участники`)}
          value="results"
        />
      </Tabs>
    </Box>
  );
}

