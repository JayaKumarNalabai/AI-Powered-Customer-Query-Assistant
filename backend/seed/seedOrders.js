import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';

dotenv.config();

const generateOrdersForUser = (user, products, baseAddress) => {
  return [
    // Delivered order
    {
      user: user._id,
      items: [
        {
          product: products.find(p => p.name === 'Gaming Keyboard')._id,
          quantity: 1,
          price: 65.00
        },
        {
          product: products.find(p => p.name === 'Gaming Mouse Pad')._id,
          quantity: 1,
          price: 15.99
        }
      ],
      totalAmount: 80.99,
      status: 'delivered',
      shippingAddress: { ...baseAddress },
      paymentStatus: 'completed',
      paymentMethod: 'credit_card'
    },
    // Processing order
    {
      user: user._id,
      items: [
        {
          product: products.find(p => p.name === '4K Webcam')._id,
          quantity: 1,
          price: 79.99
        }
      ],
      totalAmount: 79.99,
      status: 'processing',
      shippingAddress: { ...baseAddress },
      paymentStatus: 'completed',
      paymentMethod: 'paypal'
    },
    // Shipped order
    {
      user: user._id,
      items: [
        {
          product: products.find(p => p.name === 'Laptop Stand')._id,
          quantity: 1,
          price: 25.50
        },
        {
          product: products.find(p => p.name === 'USB-C Hub')._id,
          quantity: 2,
          price: 29.99
        }
      ],
      totalAmount: 85.48,
      status: 'shipped',
      shippingAddress: { ...baseAddress },
      paymentStatus: 'completed',
      paymentMethod: 'credit_card'
    },
    // Cancelled order
    {
      user: user._id,
      items: [
        {
          product: products.find(p => p.name === 'Bluetooth Headphones')._id,
          quantity: 1,
          price: 49.99
        }
      ],
      totalAmount: 49.99,
      status: 'cancelled',
      shippingAddress: { ...baseAddress },
      paymentStatus: 'refunded',
      paymentMethod: 'credit_card',
      notes: 'Customer requested cancellation'
    },
    // Pending order
    {
      user: user._id,
      items: [
        {
          product: products.find(p => p.name === 'Wireless Keyboard')._id,
          quantity: 1,
          price: 45.99
        },
        {
          product: products.find(p => p.name === 'Mechanical Keyboard Switch Tester')._id,
          quantity: 1,
          price: 12.99
        }
      ],
      totalAmount: 58.98,
      status: 'pending',
      shippingAddress: { ...baseAddress },
      paymentStatus: 'pending',
      paymentMethod: 'credit_card'
    }
  ];
};

const seedOrders = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing orders
    await Order.deleteMany({});
    console.log('Cleared existing orders');

    // Get users and products
    const users = await User.find({ role: 'user' });
    const products = await Product.find();

    if (!users.length || !products.length) {
      throw new Error('Please run seedUsers.js and seedProducts.js first');
    }

    // Addresses for each user
    const addresses = {
      'john@example.com': {
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'USA'
      },
      'jane@example.com': {
        street: '456 Market St',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        country: 'USA'
      },
      'alice@example.com': {
        street: '789 Broadway',
        city: 'New York',
        state: 'NY',
        zipCode: '10012',
        country: 'USA'
      },
      'bob@example.com': {
        street: '321 Pine St',
        city: 'Seattle',
        state: 'WA',
        zipCode: '98101',
        country: 'USA'
      },
      'carol@example.com': {
        street: '555 Oak Ave',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA'
      }
    };

    // Generate 5 orders for each user
    const orders = users.reduce((allOrders, user) => {
      const userAddress = addresses[user.email];
      const userOrders = generateOrdersForUser(user, products, userAddress);
      return [...allOrders, ...userOrders];
    }, []);

    // Create orders
    const createdOrders = await Order.create(orders);
    console.log(`✅ Created ${createdOrders.length} orders`);

    // Log summary
    console.log('\nOrder summary by user:');
    for (const user of users) {
      const userOrders = createdOrders.filter(order => order.user.equals(user._id));
      console.log(`\n${user.name} (${user.email}):`);
      
      // Group orders by status
      const ordersByStatus = userOrders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {});

      console.log('Order Status Distribution:');
      Object.entries(ordersByStatus).forEach(([status, count]) => {
        console.log(`  • ${status}: ${count} orders`);
      });

      console.log('Recent Orders:');
      userOrders.slice(0, 3).forEach(order => {
        console.log(`  • $${order.totalAmount} (${order.status}) - ${order.items.length} items`);
      });
    }

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');

  } catch (err) {
    console.error('❌ Error seeding orders:', err);
    process.exit(1);
  }
};

seedOrders();
