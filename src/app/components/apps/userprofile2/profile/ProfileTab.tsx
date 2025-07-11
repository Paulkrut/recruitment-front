import React from 'react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import {  IconId, IconLayoutGridAdd,  IconUserCircle, IconUsers } from '@tabler/icons-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const ProfileTab = () => {
  const location = usePathname();
  const [value, setValue] = React.useState(location);
  const handleChange = (event: React.SyntheticEvent, newValue: any) => {
    setValue(newValue);
  };
  const ProfileTabs = [
    {
      label: 'My Profile',
      icon: <IconUserCircle size="20" />,
      to: '/apps/user-profile2/profile',
    },
    {
      label: 'Teams',
      icon: <IconUsers size="20" />,
      to: '/apps/user-profile2/teams',
    },
    {
      label: 'Projects',
      icon: <IconLayoutGridAdd size="20" />,
      to: '/apps/user-profile2/projects',
    },
    {
      label: 'Connections',
      icon: <IconId size="20" />,
      to: '/apps/user-profile2/connections',
    },
  ];

  return (
   
      <Box justifyContent={'start'} display="flex">
        <Tabs value={value} onChange={handleChange} aria-label="scrollable prevent tabs example">
          {ProfileTabs.map((tab) => {
            return (
              <Tab
                iconPosition="start"
                label={tab.label}
                sx={{ minHeight: '50px' }}
                icon={tab.icon}
                component={Link}
                href={tab.to}
                value={tab.to}
                key={tab.label}
              />
            );
          })}
        </Tabs>
      </Box>
  );
};

export default ProfileTab;
