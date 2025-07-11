import React from "react";
import DashboardCard from "../../shared/DashboardCard";
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import ProductTableData from "./TopEmployeesData";
import { IconDotsVertical } from "@tabler/icons-react";

const performers = ProductTableData;

const TopEmployees = () => {
  // for select
  const [month, setMonth] = React.useState("1");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMonth(event.target.value);
  };

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <DashboardCard
      title="Top Employees"
      action={
        <>
          <IconButton
            id="basic-button"
            aria-controls={open ? "basic-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            onClick={handleClick}
          >
            <IconDotsVertical />
          </IconButton>
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              "aria-labelledby": "basic-button",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <MenuItem onClick={handleClose}>Add</MenuItem>
            <MenuItem onClick={handleClose}>Edit</MenuItem>
            <MenuItem onClick={handleClose}>Delete</MenuItem>
          </Menu>
        </>
      }
    >
      <TableContainer>
        <Table
          aria-label="simple table"
          sx={{
            whiteSpace: "nowrap",
            mt: -2,
            ".MuiTableCell-root": {
              borderBottom: 0,
              padding: "14px",
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="h6" fontWeight={600}>
                  Profile
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="h6" fontWeight={600}>
                  Hour Rate
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="h6" fontWeight={600}>
                  Skills
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="h6" fontWeight={600}>
                  Status
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {performers.map((basic) => (
              <TableRow key={basic.id}>
                <TableCell>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      src={basic.imgsrc}
                      alt={basic.imgsrc}
                      sx={{ width: 50, height: 50 }}
                    />
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {basic.name}
                      </Typography>
                      <Typography variant="subtitle2">{basic.post}</Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography color="textSecondary" variant="subtitle2">
                    <Typography
                      color="textPrimary"
                      variant="subtitle1"
                      component="span"
                      fontWeight={600}
                      display="inline-block"
                    >
                      ${basic.rate}
                    </Typography>
                    / hour
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography color="textSecondary" variant="subtitle2">
                    {basic.skill}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    sx={{
                      bgcolor:
                        basic.status == "Available"
                          ? (theme) => theme.palette.success.light
                          : basic.status == "On Leave"
                          ? (theme) => theme.palette.warning.light
                          : basic.status == "Absent"
                          ? (theme) => theme.palette.error.light
                          : basic.status == "On Holiday"
                          ? (theme) => theme.palette.primary.light
                          : (theme) => theme.palette.error.light,
                      color:
                        basic.status == "Available"
                          ? (theme) => theme.palette.success.main
                          : basic.status == "On Leave"
                          ? (theme) => theme.palette.warning.main
                          : basic.status == "Absent"
                          ? (theme) => theme.palette.error.main
                          : basic.status == "On Holiday"
                          ? (theme) => theme.palette.primary.main
                          : (theme) => theme.palette.error.main,
                      border: "1px solid",
                    }}
                    size="small"
                    label={
                      basic.status == "Available"
                        ? "Available"
                        : basic.status == "On Leave"
                        ? "On Leave"
                        : basic.status == "Absent"
                        ? "Absent"
                        : basic.status == "On Holiday"
                        ? "On Holiday"
                        : ""
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </DashboardCard>
  );
};

export default TopEmployees;
