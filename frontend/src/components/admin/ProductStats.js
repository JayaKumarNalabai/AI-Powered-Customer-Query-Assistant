import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Box,
  Typography
} from '@mui/material';

const ProductStats = ({ stats = [] }) => {
  if (stats.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="text.secondary">No product statistics available</Typography>
      </Box>
    );
  }

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Category</TableCell>
          <TableCell align="right">Products</TableCell>
          <TableCell align="right">Total Stock</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {stats.map((stat) => (
          <TableRow key={stat._id}>
            <TableCell>{stat._id || 'Uncategorized'}</TableCell>
            <TableCell align="right">{stat.count}</TableCell>
            <TableCell align="right">{stat.totalStock}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ProductStats;
