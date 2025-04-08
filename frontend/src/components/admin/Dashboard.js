import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Typography,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Box,
} from '@mui/material';
import axiosInstance from '../axiosInstance';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { token, logoutUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentChats, setRecentChats] = useState([]);
  const [productStats, setProductStats] = useState([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [statsRes, ordersRes, chatsRes, productsRes] = await Promise.all([
        axiosInstance.get('/api/admin/stats', { headers }),
        axiosInstance.get('/api/admin/recent-orders', { headers }),
        axiosInstance.get('/api/admin/recent-chats', { headers }),
        axiosInstance.get('/api/admin/product-stats', { headers }),
      ]);

      setStats(statsRes.data);
      setRecentOrders(ordersRes.data);
      setRecentChats(chatsRes.data);
      setProductStats(productsRes.data);
    } catch (err) {
      if (err.response?.status === 401) {
        logoutUser();
      } else {
        setError('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="primary">Total Products</Typography>
            <Typography variant="h4">{stats?.totalProducts}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="primary">Total Orders</Typography>
            <Typography variant="h4">{stats?.totalOrders}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="primary">Total Users</Typography>
            <Typography variant="h4">{stats?.totalUsers}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="primary">Total Chats</Typography>
            <Typography variant="h4">{stats?.totalChats}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Orders */}
      <Grid item xs={12} sx={{ mb: 2 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" color="primary" gutterBottom>
            Recent Orders
          </Typography>
          {recentOrders.length > 0 ? (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>{order._id}</TableCell>
                    <TableCell>{order.user?.name || 'N/A'}</TableCell>
                    <TableCell>${order.totalPrice.toFixed(2)}</TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Typography color="text.secondary">No recent orders</Typography>
          )}
        </Paper>
      </Grid>

      {/* Product Stats */}
      <Grid item xs={12} sx={{ mb: 2 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" color="primary" gutterBottom>
            Product Stats
          </Typography>
          {productStats.length > 0 ? (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product Name</TableCell>
                  <TableCell>Inventory</TableCell>
                  <TableCell>Sold</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {productStats.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.inventory}</TableCell>
                    <TableCell>{product.sold}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Typography color="text.secondary">No product stats available</Typography>
          )}
        </Paper>
      </Grid>

      {/* Recent Chats */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" color="primary" gutterBottom>
            Recent Chats
          </Typography>
          {recentChats.length > 0 ? (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentChats.map((chat) => (
                  <TableRow key={chat._id}>
                    <TableCell>{chat.user?.name || 'Unknown'}</TableCell>
                    <TableCell>
                      <Tooltip title={chat.message}>
                        <span>{chat.message.length > 50 ? `${chat.message.slice(0, 50)}...` : chat.message}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{new Date(chat.createdAt).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Typography color="text.secondary">No recent chats</Typography>
          )}
        </Paper>
      </Grid>
    </Container>
  );
};

export default Dashboard;
