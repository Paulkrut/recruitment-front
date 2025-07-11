import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { IconTemplate, IconLayoutGridAdd, IconId } from "@tabler/icons-react";
import BlankCard from "../../../../components/shared/BlankCard";

const tasks = [
  {
    icon: <IconTemplate size="21" />,
    title: "680",
    subtext: "Tasks Done",
    color: "primary.light",
    darkcolor: "primary.main",
  },
  {
    icon: <IconLayoutGridAdd size="21" />,
    title: "42",
    subtext: "Projects",
    color: "success.light",
    darkcolor: "success.main",
  },
  {
    icon: <IconId size="21" />,
    title: "$780",
    subtext: "Sales",
    color: "error.light",
    darkcolor: "error.main",
  },
];

export const TaskCard = () => {
  return (
    <Grid container spacing={3}>
      {tasks.map((task, i) => (
        <Grid item xs={12} sm={4} key={i}>
          <BlankCard>
            <Box p={3}>
              <Stack direction="row" gap={2} alignItems="center" key={i}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  sx={{
                    height: "48px",
                    width: "48px",
                    backgroundColor: task.color,
                    color: task.darkcolor,
                  }}
                >
                  {task.icon}
                </Box>
                <Box>
                  <Typography variant="h5">
                    {task.title}
                  </Typography>
                  <Typography variant="subtitle2">{task.subtext}</Typography>
                </Box>
              </Stack>
            </Box>
          </BlankCard>
        </Grid>
      ))}
    </Grid>
  );
};
