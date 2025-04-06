import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

dotenv.config();
const router = express.Router();

// @route   POST /api/auth/register/admin
// @desc    Register a new admin user with admin key
// @access  Public
router.post('/register/admin', async (req, res) => {
  const { name, email, password, adminKey } = req.body;
  console.log('Admin registration request:', { name, email });

  try {
    // Verify admin key using JWT_SECRET
    if (!adminKey || adminKey !== process.env.JWT_SECRET) {
      return res.status(401).json({ message: 'Invalid admin key' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
    });

    await newUser.save();
    console.log('Admin user registered successfully:', email);

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      token,
      user: newUser.toJSON(),
    });
  } catch (error) {
    console.error('Admin registration error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  console.log('Registration request:', { name, email, role });

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
    });

    await newUser.save();
    console.log('User registered successfully:', email);

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      token,
      user: newUser.toJSON(),
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/admin/login
// @desc    Authenticate admin user and get token
// @access  Public
router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Admin login request:', { email });

  try {
    const user = await User.findOne({ email });
    if (!user || user.role !== 'admin') {
      console.log('Admin not found or unauthorized:', email);
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Invalid password for admin:', email);
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    console.log('Admin logged in successfully:', email);
    res.json({
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Admin login error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user and get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login request:', { email });

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Invalid password for user:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    console.log('User logged in successfully:', email);
    res.json({
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/user
// @desc    Get logged in user
// @access  Private
router.get('/user', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/verify
// @desc    Verify token and return user data
// @access  Private
router.get('/verify', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Token verification error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client can just delete token, but we can add logic if needed)
// @access  Public
router.post('/logout', (req, res) => {
  // Just a placeholder - in real apps, handle token blacklisting if needed
  res.status(200).json({ message: 'Logged out successfully' });
});

export default router;
