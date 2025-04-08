import express from 'express';
import { protect } from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Chat from '../models/Chat.js';

const router = express.Router();

// Product Management Routes
router.get('/products', protect, adminAuth, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/products', protect, adminAuth, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/products/:id', protect, adminAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/products/:id', protect, adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/products/:id', protect, adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Order Management Routes
router.get('/orders', protect, adminAuth, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate({
        path: 'items.product',
        select: 'name price'
      })
      .sort({ createdAt: -1 });

    // Calculate totals for each order
    const ordersWithTotals = orders.map(order => {
      const orderObj = order.toObject();
      orderObj.items = orderObj.items.map(item => ({
        ...item,
        price: item.product.price, // Use current product price
        total: item.product.price * item.quantity
      }));
      return orderObj;
    });

    res.json(ordersWithTotals);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/orders/:id', protect, adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate({
        path: 'items.product',
        select: 'name price'
      });
      
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Calculate totals
    const orderObj = order.toObject();
    orderObj.items = orderObj.items.map(item => ({
      ...item,
      price: item.product.price,
      total: item.product.price * item.quantity
    }));
    
    res.json(orderObj);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: error.message });
  }
});

router.put('/orders/:id', protect, adminAuth, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    )
    .populate('user', 'name email')
    .populate('items.product', 'name price');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// User Management Routes
router.get('/users', protect, adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/users/:id', protect, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/users/:id', protect, adminAuth, async (req, res) => {
  try {
    // Don't allow changing role or password through this endpoint
    const { isActive } = req.body;
    
    // Don't allow deactivating self
    if (req.params.id === req.user._id && !isActive) {
      return res.status(400).json({ message: 'Cannot deactivate your own account' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/users/:id', protect, adminAuth, async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Delete user's chats
    await Chat.deleteMany({ userId: req.params.id });

    res.json({ 
      message: 'User and associated data deleted successfully',
      deletedUser: user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Chat Management Routes
router.get('/chats', protect, adminAuth, async (req, res) => {
  try {
    const chats = await Chat.find()
      .populate('userId', 'name email')
      .sort({ updatedAt: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/chats/:id', protect, adminAuth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('userId', 'name email');
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/chats/:id', protect, adminAuth, async (req, res) => {
  try {
    const chat = await Chat.findByIdAndDelete(req.params.id);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Dashboard Statistics
router.get('/stats', protect, adminAuth, async (req, res) => {
  try {
    // Get counts using Promise.all for better performance
    const [userCount, productCount, orderCount, chatCount] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Chat.countDocuments()
    ]);

    // Get recent orders with populated data
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get product stats by category
    const productStats = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalStock: { $sum: "$stock" }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get recent chats with populated data
    const recentChats = await Chat.find()
      .populate('userId', 'name email')
      .sort({ updatedAt: -1 })
      .limit(5);

    res.json({
      counts: {
        users: userCount,
        products: productCount,
        orders: orderCount,
        chats: chatCount
      },
      recentOrders,
      productStats,
      recentChats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// updated
export default router;
