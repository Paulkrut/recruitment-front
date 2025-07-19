import React,{ useState } from "react";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { IconX } from "@tabler/icons-react";
import Menuitems from "../sidebar/MenuItems";
import Link from "next/link";
import { Icon } from "@iconify/react";
interface menuType {
  title: string;
  id: string;
  subheader: string;
  children: menuType[];
  href: string;
}

const Search = () => {
  // drawer top
  
  const [search, setSerach] = useState("");

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };


  const filterRoutes = (rotr: any, cSearch: string) => {
    if (rotr.length > 1)
      return rotr.filter((t: any) =>
        t.title
          ? t.href.toLocaleLowerCase().includes(cSearch.toLocaleLowerCase())
          : ""
      );

    return rotr;
  };
  const searchData = filterRoutes(Menuitems, search);

  return (
    <>
      <Button
        aria-label=""
        color="inherit" variant="outlined"
        aria-controls="search-menu"
        aria-haspopup="true"
        size="large"
        onClick={handleClick}
        startIcon={
          <Icon icon="solar:magnifer-linear" width={20} />
        } sx={{
          borderColor: (theme) => theme.palette.divider,
          borderRadius: "25px",
        }}
      >
        Try to searching
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <Stack direction="row" spacing={2} p={3} alignItems="center">
          <TextField
            id="tb-search"
            placeholder="Search here"
            fullWidth
            onChange={(e) => setSerach(e.target.value)}
            inputProps={{ "aria-label": "Search here" }}
          />
          <IconButton size="small" onClick={handleClose}>
            <IconX size="18" />
          </IconButton>
        </Stack>
        <Divider />
        <Box p={2} sx={{ maxHeight: "60vh", overflow: "auto" }}>
          <Typography variant="h5" p={1}>
            Quick Page Links
          </Typography>
          <Box>
            <List component="nav">
              {searchData.map((menu: menuType) => {
                return (
                  <Box key={menu.title ? menu.id : menu.subheader}>
                    {menu.title && !menu.children ? (
                      <ListItemButton
                        sx={{ py: 0.5, px: 1 }}
                        href={menu?.href}
                        component={Link}
                      >
                        <ListItemText
                          primary={menu.title}
                          secondary={menu?.href}
                          sx={{ my: 0, py: 0.5 }}
                        />
                      </ListItemButton>
                    ) : (
                      ""
                    )}
                    {menu.children ? (
                      <>
                        {menu.children.map((child: menuType) => {
                          return (
                            <ListItemButton
                              sx={{ py: 0.5, px: 1 }}
                              href={child.href}
                              component={Link}
                              key={child.title ? child.id : menu.subheader}
                            >
                              <ListItemText
                                primary={child.title}
                                secondary={child.href}
                                sx={{ my: 0, py: 0.5 }}
                              />
                            </ListItemButton>
                          );
                        })}
                      </>
                    ) : (
                      ""
                    )}
                  </Box>
                );
              })}
            </List>
          </Box>
        </Box>
      </Menu>
    </>
  );
};

export default Search;
