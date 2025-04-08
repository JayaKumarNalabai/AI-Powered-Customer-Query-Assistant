import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Box,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import axiosInstance from '../axiosInstance';
import { useAuth } from '../../context/AuthContext';

const RecentOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

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

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        const response = await axiosInstance.get('/api/admin/orders', {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });

        const sortedOrders = (response.data || []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        const recentFive = sortedOrders.slice(0, 5);
        setOrders(recentFive);
        setError(null);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load recent orders');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchRecentOrders();
    }
  }, [user]);

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

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
            <TableCell>${order.items?.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 0), 0).toFixed(2)}</TableCell>
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
