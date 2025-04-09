// import React, { useState, useEffect } from 'react';
// import {
//   Box,
//   Button,
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   IconButton,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   Stack,
//   Typography,
//   Switch,
//   CircularProgress,
//   Alert
// } from '@mui/material';
// import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
// import { useAuth } from '../../context/AuthContext';
// import axiosInstance from '../axiosInstance';
// const ProductList = () => {
//   const [products, setProducts] = useState([]);
//   const [open, setOpen] = useState(false);
//   const [selectedProduct, setSelectedProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const { user } = useAuth();

//   const initialFormState = {
//     name: '',
//     price: '',
//     description: '',
//     category: '',
//     stock: '',
//     isActive: true
//   };

//   const [formData, setFormData] = useState(initialFormState);

//   const fetchProducts = async () => {
//     try {
//       setLoading(true);
//       const response = await axiosInstance.get('/api/admin/products', {
//         headers: {
//           Authorization: `Bearer ${user.token}`,
//         },
//       });
//       const data = response.data;
//       setProducts(Array.isArray(data) ? data : []);
//       setError(null);
//     } catch (error) {
//       console.error('Error fetching products:', error);
//       setError(error.message);
//       setProducts([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (user?.token) {
//       fetchProducts();
//     }
//   }, [user]);

//   const handleOpen = (product = null) => {
//     if (product) {
//       setSelectedProduct(product);
//       setFormData({
//         name: product.name,
//         price: product.price,
//         description: product.description,
//         category: product.category,
//         stock: product.stock,
//         isActive: product.isActive
//       });
//     } else {
//       setSelectedProduct(null);
//       setFormData(initialFormState);
//     }
//     setOpen(true);
//   };

//   const handleClose = () => {
//     setOpen(false);
//     setSelectedProduct(null);
//     setFormData(initialFormState);
//   };

//   const handleChange = (e) => {
//     const { name, value, checked } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: name === 'isActive' ? checked : value
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       if (selectedProduct) {
//         await axiosInstance.put(`/api/admin/products/${selectedProduct._id}`, formData, {
//           headers: {
//             Authorization: `Bearer ${user.token}`,
//           },
//         });
//       } else {
//         await axiosInstance.post('/api/admin/products', formData, {
//           headers: {
//             Authorization: `Bearer ${user.token}`,
//           },
//         });
//       }

//       handleClose();
//       fetchProducts();
//     } catch (error) {
//       console.error('Error saving product:', error);
//       setError(error.message);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm('Are you sure you want to delete this product?')) {
//       try {
//         await axiosInstance.delete(`/api/admin/products/${id}`, {
//           headers: {
//             Authorization: `Bearer ${user.token}`,
//           },
//         });
//         fetchProducts();
//       } catch (error) {
//         console.error('Error deleting product:', error);
//         setError(error.message);
//       }
//     }
//   };

//   if (loading) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
//         <CircularProgress />
//       </Box>
//     );
//   }

//   if (error) {
//     return (
//       <Box sx={{ p: 3 }}>
//         <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
//         <Button variant="contained" color="primary" onClick={fetchProducts}>
//           Retry
//         </Button>
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ p: 3 }}>
//       <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
//         <Typography variant="h5" component="h1">
//           Products
//         </Typography>
//         <Button
//           variant="contained"
//           color="primary"
//           onClick={() => handleOpen()}
//         >
//           Add Product
//         </Button>
//       </Box>

//       <TableContainer component={Paper}>
//         <Table>
//           <TableHead>
//             <TableRow>
//               <TableCell>Name</TableCell>
//               <TableCell>Category</TableCell>
//               <TableCell>Price</TableCell>
//               <TableCell>Stock</TableCell>
//               <TableCell>Status</TableCell>
//               <TableCell>Actions</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {products.length === 0 ? (
//               <TableRow>
//                 <TableCell colSpan={6} align="center">
//                   No products found
//                 </TableCell>
//               </TableRow>
//             ) : (
//               products.map((product) => (
//                 <TableRow key={product._id}>
//                   <TableCell>{product.name}</TableCell>
//                   <TableCell>{product.category}</TableCell>
//                   <TableCell>${product.price}</TableCell>
//                   <TableCell>{product.stock}</TableCell>
//                   <TableCell>
//                     {product.isActive ? 'Active' : 'Inactive'}
//                   </TableCell>
//                   <TableCell>
//                     <IconButton onClick={() => handleOpen(product)} color="primary">
//                       <EditIcon />
//                     </IconButton>
//                     <IconButton onClick={() => handleDelete(product._id)} color="error">
//                       <DeleteIcon />
//                     </IconButton>
//                   </TableCell>
//                 </TableRow>
//               ))
//             )}
//           </TableBody>
//         </Table>
//       </TableContainer>

//       <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
//         <DialogTitle>
//           {selectedProduct ? 'Edit Product' : 'Add New Product'}
//         </DialogTitle>
//         <DialogContent>
//           <Stack spacing={2} sx={{ mt: 2 }}>
//             <TextField
//               name="name"
//               label="Product Name"
//               value={formData.name}
//               onChange={handleChange}
//               fullWidth
//               required
//             />
//             <TextField
//               name="price"
//               label="Price"
//               type="number"
//               value={formData.price}
//               onChange={handleChange}
//               fullWidth
//               required
//             />
//             <TextField
//               name="description"
//               label="Description"
//               multiline
//               rows={4}
//               value={formData.description}
//               onChange={handleChange}
//               fullWidth
//             />
//             <TextField
//               name="category"
//               label="Category"
//               value={formData.category}
//               onChange={handleChange}
//               fullWidth
//               required
//             />
//             <TextField
//               name="stock"
//               label="Stock"
//               type="number"
//               value={formData.stock}
//               onChange={handleChange}
//               fullWidth
//               required
//             />
//             <Box sx={{ display: 'flex', alignItems: 'center' }}>
//               <Switch
//                 name="isActive"
//                 checked={formData.isActive}
//                 onChange={handleChange}
//               />
//               <Typography>Active</Typography>
//             </Box>
//           </Stack>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleClose}>Cancel</Button>
//           <Button onClick={handleSubmit} variant="contained" color="primary">
//             {selectedProduct ? 'Update' : 'Create'}
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// };

// export default ProductList;
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
  const { user } = useAuth();

  const initialFormState = {
    name: '',
    price: '',
    description: '',
    category: '',
    stock: '',
    isActive: true
  };

  const [formData, setFormData] = useState(initialFormState);

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
    if (product) {
      setSelectedProduct(product);
      setFormData({
        name: product.name,
        price: product.price,
        description: product.description,
        category: product.category,
        stock: product.stock,
        isActive: product.isActive
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
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedProduct) {
        await axiosInstance.put(`/api/admin/products/${selectedProduct._id}`, formData, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
      } else {
        await axiosInstance.post('/api/admin/products', formData, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
      }

      handleClose();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      setError(error.response?.data?.message || error.message);
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
                  <TableCell>${product.price}</TableCell>
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
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              name="name"
              label="Product Name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              name="price"
              label="Price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              name="description"
              label="Description"
              multiline
              rows={4}
              value={formData.description}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              name="category"
              label="Category"
              value={formData.category}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              name="stock"
              label="Stock"
              type="number"
              value={formData.stock}
              onChange={handleChange}
              fullWidth
              required
            />
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Switch
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
              <Typography sx={{ ml: 1 }}>
                {formData.isActive ? 'Active' : 'Inactive'}
              </Typography>
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
