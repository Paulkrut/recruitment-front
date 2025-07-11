import React from "react";
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import {
  IconPaperclip,
  IconLink,
  IconMoodSmile,
  IconBold,
  IconItalic,
  IconUnderline,
  IconList,
} from "@tabler/icons-react";
import BlankCard from "../../../../components/shared/ChildCard";
import { IconListNumbers } from "@tabler/icons-react";

export const PostTextBox = () => {
  // tabs
  const [value, setValue] = React.useState("1");

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <TabContext value={value}>
      <Box>
        <TabList
          onChange={handleChange}
          aria-label="lab API tabs example"
          sx={{
            "& .MuiTab-root.Mui-selected": {
              background: (theme) => theme.palette.primary.main,
              color: "white",
              borderRadius: "8px",
            },
            "& .MuiTabs-indicator": {
              display: "none",
            },
          }}
        >
          <Tab label="Feeds" value="1" />
          <Tab label="Timeline" value="2" />
        </TabList>
      </Box>
      <TabPanel
        value="1"
        sx={{
          "&.MuiTabPanel-root": {
            padding: "24px 0 0",
          },
        }}
      >
        <BlankCard>
          <Stack spacing={1} direction="row" alignItems="center" mb={2}>
            <Avatar
              src="/images/profile/user1.jpg"
              sx={{ width: 32, height: 32 }}
            />
            <Typography variant="subtitle2" fontWeight="600">
            Mike Nielsen
            </Typography>
          </Stack>

          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="What's in your mind ?"
            inputProps={{ "aria-label": "search google maps" }}
          />

          <Box
            px={3}
            py={1}
            mt={3}
            sx={{
              backgroundColor: "grey.200",
            }}
          >
            <Stack direction="row">
              <IconButton>
                <IconBold size={18} />
              </IconButton>
              <IconButton>
                <IconItalic size={18} />
              </IconButton>
              <IconButton>
                <IconUnderline size={18} />
              </IconButton>
              <IconButton>
                <IconLink size={18} />
              </IconButton>
              <IconButton>
                <IconList size={18} />
              </IconButton>
              <IconButton>
                <IconListNumbers size={18} />
              </IconButton>
            </Stack>
          </Box>

          <Stack direction="row" mt={2} alignItems="center">
            <Button
              variant="text"
              color="inherit"
              component="label"
              sx={{ display: "flex", gap: "5px" }}
            >
              <IconPaperclip size="16" />
              <input hidden accept="image/*" multiple type="file" />
              Attachments
            </Button>

            <Button
              variant="text"
              color="inherit"
              component="label"
              sx={{ display: "flex", gap: "5px" }}
            >
              <IconLink size="16" />
              <input hidden accept="image/*" multiple type="file" />
              Link
            </Button>

            <Button
              variant="text"
              color="inherit"
              component="label"
              sx={{ display: "flex", gap: "5px" }}
            >
              <IconMoodSmile size="16" />
              <input hidden accept="image/*" multiple type="file" />
              Emoji
            </Button>

            <Button variant="contained" color="primary" sx={{ ml: "auto" }}>
              Post
            </Button>
          </Stack>
        </BlankCard>
      </TabPanel>
      <TabPanel
        value="2"
        sx={{
          "&.MuiTabPanel-root": {
            padding: "24px 0 0",
          },
        }}
      >
        <BlankCard>
          <Stack spacing={1} direction="row" alignItems="center" mb={2}>
            <Avatar
              src="/images/profile/user-4.jpg"
              sx={{ width: 32, height: 32 }}
            />
            <Typography variant="subtitle2" fontWeight="600">
              Jonathan Doe
            </Typography>
          </Stack>

          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="What's in your mind ?"
            inputProps={{ "aria-label": "search google maps" }}
          />

          <Box
            px={3}
            py={1}
            mt={3}
            sx={{
              backgroundColor: "grey.200",
            }}
          >
            <Stack direction="row">
              <IconButton>
                <IconBold size={18} />
              </IconButton>
              <IconButton>
                <IconItalic size={18} />
              </IconButton>
              <IconButton>
                <IconUnderline size={18} />
              </IconButton>
              <IconButton>
                <IconLink size={18} />
              </IconButton>
              <IconButton>
                <IconList size={18} />
              </IconButton>
              <IconButton>
                <IconListNumbers size={18} />
              </IconButton>
            </Stack>
          </Box>

          <Stack direction="row" mt={2} alignItems="center">
            <Button
              variant="text"
              color="inherit"
              component="label"
              sx={{ display: "flex", gap: "5px" }}
            >
              <IconPaperclip size="16" />
              <input hidden accept="image/*" multiple type="file" />
              Attachments
            </Button>

            <Button
              variant="text"
              color="inherit"
              component="label"
              sx={{ display: "flex", gap: "5px" }}
            >
              <IconLink size="16" />
              <input hidden accept="image/*" multiple type="file" />
              Link
            </Button>

            <Button
              variant="text"
              color="inherit"
              component="label"
              sx={{ display: "flex", gap: "5px" }}
            >
              <IconMoodSmile size="16" />
              <input hidden accept="image/*" multiple type="file" />
              Emoji
            </Button>

            <Button variant="contained" color="primary" sx={{ ml: "auto" }}>
              Post
            </Button>
          </Stack>
        </BlankCard>
      </TabPanel>
    </TabContext>
  );
};
