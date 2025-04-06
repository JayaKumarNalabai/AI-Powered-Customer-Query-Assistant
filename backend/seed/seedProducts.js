import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product.js";
import User from "../models/User.js";
import bcrypt from 'bcryptjs';

dotenv.config();

// First, we'll create an admin user to be the product creator
const adminUser = {
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'admin123',
  role: 'admin'
};

const products = [
  {
    name: "Wireless Mouse",
    price: 19.99,
    category: "Electronics",
    description: "Ergonomic wireless mouse with USB receiver",
    stock: 50,
    images: [{ url: "https://example.com/mouse.jpg", alt: "Wireless Mouse" }],
    isActive: true
  },
  {
    name: "Bluetooth Headphones",
    price: 49.99,
    category: "Electronics",
    description: "Noise-cancelling over-ear headphones with 20-hour battery life",
    stock: 30,
    images: [{ url: "https://example.com/headphones.jpg", alt: "Bluetooth Headphones" }],
    isActive: true
  },
  {
    name: "Laptop Stand",
    price: 25.50,
    category: "Accessories",
    description: "Adjustable aluminum stand for laptops and tablets",
    stock: 45,
    images: [{ url: "https://example.com/stand.jpg", alt: "Laptop Stand" }],
    isActive: true
  },
  {
    name: "Gaming Keyboard",
    price: 65.00,
    category: "Gaming",
    description: "RGB mechanical keyboard with blue switches",
    stock: 25,
    images: [{ url: "https://example.com/keyboard.jpg", alt: "Gaming Keyboard" }],
    isActive: true
  },
  {
    name: "USB-C Hub",
    price: 29.99,
    category: "Electronics",
    description: "Multiport adapter with HDMI, USB 3.0 and card reader",
    stock: 60,
    images: [{ url: "https://example.com/hub.jpg", alt: "USB-C Hub" }],
    isActive: true
  },
  {
    name: "4K Webcam",
    price: 79.99,
    category: "Electronics",
    description: "Ultra HD webcam with auto-focus and noise-canceling microphone",
    stock: 20,
    images: [{ url: "https://example.com/webcam.jpg", alt: "4K Webcam" }],
    isActive: true
  },
  {
    name: "Gaming Mouse Pad",
    price: 15.99,
    category: "Gaming",
    description: "Extended RGB mouse pad with non-slip base, 900x400mm",
    stock: 100,
    images: [{ url: "https://example.com/mousepad.jpg", alt: "Gaming Mouse Pad" }],
    isActive: true
  },
  {
    name: "Mechanical Keyboard Switch Tester",
    price: 12.99,
    category: "Gaming",
    description: "9-key switch tester with different Cherry MX switches",
    stock: 40,
    images: [{ url: "https://example.com/switch-tester.jpg", alt: "Switch Tester" }],
    isActive: true
  },
  {
    name: "Laptop Cooling Pad",
    price: 35.99,
    category: "Accessories",
    description: "5-fan laptop cooling pad with RGB lighting",
    stock: 30,
    images: [{ url: "https://example.com/cooling-pad.jpg", alt: "Laptop Cooling Pad" }],
    isActive: true
  },
  {
    name: "Wireless Keyboard",
    price: 45.99,
    category: "Electronics",
    description: "Slim wireless keyboard with numeric keypad",
    stock: 35,
    images: [{ url: "https://example.com/wireless-keyboard.jpg", alt: "Wireless Keyboard" }],
    isActive: true
  }
];

const seedProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Create admin user if doesn't exist
    let admin = await User.findOne({ email: adminUser.email });
    if (!admin) {
      const hashedPassword = await bcrypt.hash(adminUser.password, 12);
      admin = await User.create({
        ...adminUser,
        password: hashedPassword
      });
      console.log("✅ Admin user created");
    }

    // Clear existing products
    await Product.deleteMany({});
    console.log("Cleared existing products");

    // Add createdBy field to each product
    const productsWithCreator = products.map(product => ({
      ...product,
      createdBy: admin._id
    }));

    // Insert products
    await Product.insertMany(productsWithCreator);
    console.log("✅ Products seeded successfully!");

    // Log summary
    console.log("\nSeeded data summary:");
    console.log(`- Created ${products.length} products`);
    console.log(`- Admin user: ${admin.email} (password: ${adminUser.password})`);

    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
    
  } catch (err) {
    console.error("❌ Error seeding products:", err);
  }
};

seedProducts();
