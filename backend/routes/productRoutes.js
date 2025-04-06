import express from 'express';
import Product from '../models/Product.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error('Fetch products error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/products
// @desc    Add a new product
// @access  Admin only
router.post('/', adminAuth, async (req, res) => {
  const { name, description, price, stock } = req.body;

  try {
    const product = new Product({
      name,
      description,
      price,
      stock,
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Add product error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
