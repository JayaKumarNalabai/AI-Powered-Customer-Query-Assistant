import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Container,
  CircularProgress,
  Alert
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import StatCard from './StatCard';
import RecentOrders from './RecentOrders';
import RecentChats from './RecentChats';
import ProductStats from './ProductStats';
import axiosInstance from '../components/axiosInstance';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await axiosInstance.get('/api/admin/stats', {
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 401) {
          logout();
          throw new Error('Session expired. Please login again.');
        }

        const data = response.data;

        if (!data || typeof data !== 'object') {
          throw new Error('Invalid data received from server');
        }

        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        const errMsg =
          error.response?.data?.message || error.message || 'Failed to fetch dashboard stats';
        setError(errMsg);

        if (errMsg.includes('Session expired')) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, logout]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">No data available</Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Total Users"
            value={stats.counts?.users || 0}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Total Products"
            value={stats.counts?.products || 0}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Total Orders"
            value={stats.counts?.orders || 0}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Total Chats"
            value={stats.counts?.chats || 0}
            color="#9c27b0"
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Recent Orders
            </Typography>
            <RecentOrders orders={stats.recentOrders || []} />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Product Statistics
            </Typography>
            <ProductStats stats={stats.productStats || []} />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Recent Chats
            </Typography>
            <RecentChats chats={stats.recentChats || []} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
