import express from 'express';
import { protect } from '../middleware/auth.js';
import Order from '../models/Order.js';

const router = express.Router();

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', 'name price') // Populate product details
      .sort({ createdAt: -1 });

    const formattedOrders = orders.map(order => ({
      id: order._id,
      status: order.status,
      totalAmount: order.totalAmount,
      paymentStatus: order.paymentStatus,
      items: order.items.map(item => ({
        product: item.product.name,
        quantity: item.quantity,
        price: item.price
      })),
      createdAt: order.createdAt
    }));

    res.json(formattedOrders);
  } catch (err) {
    console.error('Fetch orders error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order details
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('items.product', 'name price description');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (err) {
    console.error('Fetch order details error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
