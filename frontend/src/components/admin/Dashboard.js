import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Container,
  CircularProgress,
  Alert,
  Typography,
  Paper
} from '@mui/material';
import { styled } from '@mui/system';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../axiosInstance';

// ✅ Styled Stat Card (inline instead of separate file)
const StyledPaper = styled(Paper)(({ bgcolor }) => ({
  padding: '24px',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  backgroundColor: bgcolor || '#f5f5f5',
  transition: 'transform 0.2s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 6px 30px rgba(0,0,0,0.15)',
  },
  color: '#fff',
  textAlign: 'center'
}));

const StatCard = ({ title, value, color }) => {
  return (
    <StyledPaper bgcolor={color}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h3" fontWeight="bold">
        {value}
      </Typography>
    </StyledPaper>
  );
};

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
      <Typography variant="h5" gutterBottom color="primary">
        Admin Dashboard
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={stats.counts?.users || 0}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Products"
            value={stats.counts?.products || 0}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Orders"
            value={stats.counts?.orders || 0}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Chats"
            value={stats.counts?.chats || 0}
            color="#9c27b0"
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
