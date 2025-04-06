import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding users');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create admin user
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const admin = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await admin.save();
    console.log('Admin user created');

    // Create regular users
    const userPassword = await bcrypt.hash('User@123', 10);
    const users = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: userPassword,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: userPassword,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Michael Johnson',
        email: 'michael@example.com',
        password: userPassword,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Sarah Wilson',
        email: 'sarah@example.com',
        password: userPassword,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'David Brown',
        email: 'david@example.com',
        password: userPassword,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await User.insertMany(users);
    console.log('Regular users created');

    console.log('\n=== Seeding completed successfully ===');
    console.log('\nUser Credentials:');
    console.log('\nAdmin User:');
    console.log('Email: admin@example.com');
    console.log('Password: Admin@123');
    console.log('\nRegular Users:');
    console.log('All regular users have the password: User@123');
    console.log('\n1. John Doe (john@example.com)');
    console.log('2. Jane Smith (jane@example.com)');
    console.log('3. Michael Johnson (michael@example.com)');
    console.log('4. Sarah Wilson (sarah@example.com)');
    console.log('5. David Brown (david@example.com)');

  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

// Run the seeder
seedUsers();
