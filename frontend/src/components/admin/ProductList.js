import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
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
  TextField,
  Stack,
  Typography,
  Switch,
  CircularProgress,
  Alert
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../axiosInstance';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const { user } = useAuth();

  const initialFormState = {
    name: '',
    price: '',
    description: '',
    category: '',
    stock: '',
    isActive: true,
    images: [{ url: 'https://via.placeholder.com/150', alt: 'Product Image' }]
  };

  const [formData, setFormData] = useState(initialFormState);

  const validateForm = () => {
    if (!formData.name || formData.name.trim() === '') {
      setFormError('Product name is required');
      return false;
    }
    if (!formData.description || formData.description.trim() === '') {
      setFormError('Description is required');
      return false;
    }
    if (!formData.category || formData.category.trim() === '') {
      setFormError('Category is required');
      return false;
    }
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      setFormError('Price must be a valid positive number');
      return false;
    }
    if (!formData.stock || isNaN(Number(formData.stock)) || Number(formData.stock) < 0) {
      setFormError('Stock must be a valid positive number');
      return false;
    }
    setFormError(null);
    return true;
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/admin/products', {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = response.data;
      setProducts(Array.isArray(data) ? data : []);
      setError(null);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error.response?.data?.message || error.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchProducts();
    }
  }, [user]);

  const handleOpen = (product = null) => {
    setFormError(null);
    if (product) {
      setSelectedProduct(product);
      setFormData({
        name: product.name,
        price: product.price,
        description: product.description,
        category: product.category,
        stock: product.stock,
        isActive: product.isActive,
        images: product.images || [{ url: 'https://via.placeholder.com/150', alt: 'Product Image' }]
      });
    } else {
      setSelectedProduct(null);
      setFormData(initialFormState);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedProduct(null);
    setFormData(initialFormState);
    setFormError(null);
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'isActive' ? checked : 
              (name === 'price' || name === 'stock') ? 
              (value === '' ? '' : Number(value)) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const processedFormData = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock)
      };

      if (selectedProduct) {
        await axiosInstance.put(`/api/admin/products/${selectedProduct._id}`, processedFormData, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
      } else {
        await axiosInstance.post('/api/admin/products', processedFormData, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
      }

      handleClose();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      setFormError(error.response?.data?.message || error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axiosInstance.delete(`/api/admin/products/${id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        setError(error.response?.data?.message || error.message);
      }
    }
  };

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
        <Button variant="contained" color="primary" onClick={fetchProducts}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" component="h1">
          Products
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpen()}
        >
          Add Product
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpen(product)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(product._id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2, mt: 2 }}>
              {formError}
            </Alert>
          )}
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              name="name"
              label="Product Name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
              error={formError && !formData.name}
            />
            <TextField
              name="price"
              label="Price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              fullWidth
              required
              inputProps={{ min: 0, step: "0.01" }}
              error={formError && (!formData.price || Number(formData.price) < 0)}
            />
            <TextField
              name="description"
              label="Description"
              multiline
              rows={4}
              value={formData.description}
              onChange={handleChange}
              fullWidth
              required
              error={formError && !formData.description}
            />
            <TextField
              name="category"
              label="Category"
              value={formData.category}
              onChange={handleChange}
              fullWidth
              required
              error={formError && !formData.category}
            />
            <TextField
              name="stock"
              label="Stock"
              type="number"
              value={formData.stock}
              onChange={handleChange}
              fullWidth
              required
              inputProps={{ min: 0 }}
              error={formError && (!formData.stock || Number(formData.stock) < 0)}
            />
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Switch
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
              <Typography>Active</Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedProduct ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductList;
