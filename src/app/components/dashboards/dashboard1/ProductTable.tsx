import React from "react";
import DashboardCard from "../../shared/DashboardCard";
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import ProductTableData from "./ProductTableData";
import { IconDotsVertical } from "@tabler/icons-react";

const performers = ProductTableData;

const ProductTable = () => {
  return (
    <DashboardCard >
      <TableContainer>
        <Table
          aria-label="simple table"
          sx={{
            whiteSpace: "nowrap",
            mt: -2,
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="h6" fontWeight={600}>
                  Products
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="h6" fontWeight={600}>
                  Payment
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="h6" fontWeight={600}>
                  Status
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="h6" fontWeight={600}></Typography>
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
                      sx={{ width: 60, height: 60 }}
                    />
                    <Box>
                      <Typography
                        variant="subtitle2"
                        fontWeight={600}
                        width="170px"
                        className="text-truncate-2"
                      >
                        {basic.name}
                      </Typography>
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
                      ${basic.budget}
                    </Typography>
                    / 499
                  </Typography>
                  <Typography
                    color="textSecondary"
                    variant="subtitle2"
                    fontWeight={400}
                    mb={1}
                  >
                    {basic.budget > 200
                      ? "Full Paid"
                      : basic.budget > 180
                      ? "Partially Paid"
                      : "Cancelled"}
                  </Typography>
                  {basic.percent > 50 ? (
                    <LinearProgress
                      value={basic.percent}
                      variant="determinate"
                      color="primary"
                    />
                  ) : basic.percent > 20 ? (
                    <LinearProgress
                      value={basic.percent}
                      variant="determinate"
                      color="warning"
                    />
                  ) : (
                    <LinearProgress
                      value={basic.percent}
                      variant="determinate"
                      color="error"
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    sx={{
                      bgcolor:
                        basic.percent > 50
                          ? (theme) => theme.palette.primary.light
                          : basic.percent > 20
                          ? (theme) => theme.palette.warning.light
                          : (theme) => theme.palette.error.light,
                      color:
                        basic.percent > 50
                          ? (theme) => theme.palette.primary.main
                          : basic.percent > 20
                          ? (theme) => theme.palette.warning.main
                          : (theme) => theme.palette.error.main,
                      border: "1px solid",
                    }}
                    size="small"
                    label={
                      basic.percent > 50
                        ? "Confirmed"
                        : basic.percent > 20
                        ? "Pending"
                        : "Cancelled"
                    }
                  />
                </TableCell>
                <TableCell>
                  <IconButton aria-label="more">
                    <IconDotsVertical size={18} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </DashboardCard>
  );
};

export default ProductTable;
