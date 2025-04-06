import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Box,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import axiosInstance from '../components/axiosInstance'; // Adjust path if needed
import { useAuth } from '../../context/AuthContext'; // Adjust path if needed

const ProductStats = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axiosInstance.get('/api/admin/product-stats', {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });
        setStats(response.data || []);
      } catch (err) {
        console.error('Error fetching product stats:', err);
        setError('Failed to load product statistics');
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchStats();
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
