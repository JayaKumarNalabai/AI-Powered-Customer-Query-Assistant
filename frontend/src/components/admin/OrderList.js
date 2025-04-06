import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
      setError(null);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchOrders();
    }
  }, [user]);

  const handleOpen = (order) => {
    setSelectedOrder(order);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedOrder(null);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      fetchOrders();
      handleClose();
    } catch (error) {
      console.error('Error updating order:', error);
      setError(error.message);
    }
  };

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const calculateOrderTotal = (items) => {
    return items.reduce((total, item) => {
      const itemTotal = (item.price || 0) * (item.quantity || 0);
      return total + itemTotal;
    }, 0).toFixed(2);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Orders</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order._id}>
                <TableCell>{order._id.substring(order._id.length - 6)}</TableCell>
                <TableCell>{order.user?.name || 'Unknown'}</TableCell>
                <TableCell>{order.items?.length || 0} items</TableCell>
                <TableCell>${calculateOrderTotal(order.items || [])}</TableCell>
                <TableCell>
                  <Chip
                    label={order.status}
                    color={getStatusColor(order.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{formatDate(order.createdAt)}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleOpen(order)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Order Details Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Order Details - #{selectedOrder?._id.substring(selectedOrder?._id.length - 6)}
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Customer: {selectedOrder.user?.name}
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Email: {selectedOrder.user?.email}
              </Typography>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Items:
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedOrder.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.product?.name}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">${item.price?.toFixed(2)}</TableCell>
                      <TableCell align="right">
                        ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3} align="right">
                      <strong>Total:</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>${calculateOrderTotal(selectedOrder.items)}</strong>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
          {selectedOrder && (
            <>
              <Button
                onClick={() => handleStatusChange(selectedOrder._id, 'processing')}
                color="primary"
                disabled={selectedOrder.status !== 'pending'}
              >
                Process
              </Button>
              <Button
                onClick={() => handleStatusChange(selectedOrder._id, 'shipped')}
                color="primary"
                disabled={selectedOrder.status !== 'processing'}
              >
                Ship
              </Button>
              <Button
                onClick={() => handleStatusChange(selectedOrder._id, 'delivered')}
                color="success"
                disabled={selectedOrder.status !== 'shipped'}
              >
                Mark Delivered
              </Button>
              <Button
                onClick={() => handleStatusChange(selectedOrder._id, 'cancelled')}
                color="error"
                disabled={['delivered', 'cancelled'].includes(selectedOrder.status)}
              >
                Cancel
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderList;
