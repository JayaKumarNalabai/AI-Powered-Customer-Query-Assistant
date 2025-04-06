import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Box,
  Typography
} from '@mui/material';

const RecentOrders = ({ orders = [] }) => {
  const getStatusColor = (status) => {
    const colors = {
      'pending': 'warning',
      'processing': 'info',
      'shipped': 'primary',
      'delivered': 'success',
      'cancelled': 'error'
    };
    return colors[status] || 'default';
  };

  if (orders.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="text.secondary">No recent orders</Typography>
      </Box>
    );
  }

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Order ID</TableCell>
          <TableCell>Customer</TableCell>
          <TableCell>Total</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Date</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order._id}>
            <TableCell>{order._id.slice(-6)}</TableCell>
            <TableCell>{order.user?.name || 'Unknown'}</TableCell>
            <TableCell>${order.total?.toFixed(2) || '0.00'}</TableCell>
            <TableCell>
              <Chip 
                label={order.status} 
                color={getStatusColor(order.status)}
                size="small"
              />
            </TableCell>
            <TableCell>
              {new Date(order.createdAt).toLocaleDateString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default RecentOrders;
