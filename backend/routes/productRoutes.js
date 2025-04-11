import express from 'express';
import Product from '../models/Product.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// @route   GET /api/admin/products
// @desc    Get all products
// @access  Admin only
router.get('/', adminAuth, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Fetch products error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/products
// @desc    Add a new product
// @access  Admin only
router.post('/', adminAuth, async (req, res) => {
  try {
    const { name, description, price, stock, category, isActive, images } = req.body;

    // Validate required fields
    if (!name || !description || !category) {
      return res.status(400).json({ message: 'Name, description, and category are required' });
    }

    // Validate numeric fields
    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({ message: 'Price must be a valid positive number' });
    }

    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({ message: 'Stock must be a valid positive number' });
    }

    const product = new Product({
      name,
      description,
      price,
      stock,
      category,
      isActive: isActive ?? true,
      images: images || [{ url: 'https://via.placeholder.com/150', alt: 'Product Image' }],
      createdBy: req.user.id
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Add product error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/products/:id
// @desc    Update a product
// @access  Admin only
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { name, description, price, stock, category, isActive, images } = req.body;

    // Validate required fields
    if (!name || !description || !category) {
      return res.status(400).json({ message: 'Name, description, and category are required' });
    }

    // Validate numeric fields
    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({ message: 'Price must be a valid positive number' });
    }

    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({ message: 'Stock must be a valid positive number' });
    }

    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        price,
        stock,
        category,
        isActive,
        images: images || product.images
      },
      { new: true, runValidators: true }
    );

    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/products/:id
// @desc    Delete a product
// @access  Admin only
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product removed' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/products/:id
// @desc    Get single product by ID
// @access  Admin only
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
