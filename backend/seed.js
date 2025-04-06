import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Chat from "./models/Chat.js";
import bcrypt from 'bcryptjs';

dotenv.config();

const users = [
  {
    name: "Admin User",
    email: "admin@example.com",
    password: "admin123",
    role: "admin"
  },
  {
    name: "John Doe",
    email: "john@example.com",
    password: "user123",
    role: "user"
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    password: "user123",
    role: "user"
  },
  {
    name: "Alice Johnson",
    email: "alice@example.com",
    password: "user123",
    role: "user"
  },
  {
    name: "Bob Wilson",
    email: "bob@example.com",
    password: "user123",
    role: "user"
  },
  {
    name: "Carol Brown",
    email: "carol@example.com",
    password: "user123",
    role: "user"
  }
];

const chats = [
  {
    messages: [
      {
        role: "user",
        content: "What gaming products do you have in stock?"
      },
      {
        role: "assistant",
        content: "I can help you with our gaming products! Currently, we have:\n\n• Gaming Keyboard ($65.00) - RGB mechanical keyboard with blue switches\n• Gaming Mouse ($19.99) - Ergonomic wireless mouse with USB receiver\n• Gaming Mouse Pad ($15.99) - Extended RGB mouse pad\n• Mechanical Keyboard Switch Tester ($12.99) - Try different switches\n\nAll items are in stock and ready for purchase. Would you like specific details about any of these products?"
      },
      {
        role: "user",
        content: "Tell me more about the keyboard"
      },
      {
        role: "assistant",
        content: "The Gaming Keyboard features:\n\n• RGB backlighting with customizable effects\n• Blue mechanical switches for tactile feedback\n• Full N-key rollover for gaming performance\n• Durable construction with aluminum top plate\n• USB-C connection for modern setups\n\nIt's currently priced at $65.00 and we have 25 units in stock. It's one of our most popular gaming peripherals, especially appreciated by users who enjoy a clicky, tactile typing experience."
      }
    ]
  },
  {
    messages: [
      {
        role: "user",
        content: "What electronics do you have under $30?"
      },
      {
        role: "assistant",
        content: "Here are our electronics products under $30:\n\n1. Wireless Mouse ($19.99)\n   • Ergonomic design\n   • Includes USB receiver\n   • 50 units in stock\n\n2. USB-C Hub ($29.99)\n   • Multiport adapter\n   • HDMI, USB 3.0 and card reader\n   • 60 units in stock\n\n3. Gaming Mouse Pad ($15.99)\n   • Extended size (900x400mm)\n   • RGB lighting effects\n   • 100 units in stock\n\n4. Mechanical Switch Tester ($12.99)\n   • 9 different switches\n   • Great for choosing your preferred switch\n   • 40 units in stock\n\nAll items are currently available. Would you like more details about any of them?"
      }
    ]
  },
  {
    messages: [
      {
        role: "user",
        content: "Do you have any webcams for streaming?"
      },
      {
        role: "assistant",
        content: "Yes! We have the 4K Webcam which is perfect for streaming:\n\n• Ultra HD 4K resolution\n• Auto-focus for crystal clear image\n• Built-in noise-canceling microphone\n• Great for streaming and video calls\n• Currently in stock (20 units)\n• Priced at $79.99\n\nIt's one of our premium products and very popular among content creators. Would you like to know more about its features?"
      }
    ]
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Chat.deleteMany({});
    console.log('Cleared existing data');

    // Create users with hashed passwords
    const createdUsers = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 12);
        return User.create({
          ...user,
          password: hashedPassword
        });
      })
    );
    console.log('Created users:', createdUsers.map(u => u.email));

    // Create chats and associate them with users
    const chatPromises = chats.map(async (chat, index) => {
      // Associate each chat with a non-admin user
      const nonAdminUsers = createdUsers.filter(u => u.role === 'user');
      const user = nonAdminUsers[index % nonAdminUsers.length];
      
      return Chat.create({
        userId: user._id,
        messages: chat.messages
      });
    });

    const createdChats = await Promise.all(chatPromises);
    console.log(`Created ${createdChats.length} chats`);

    // Log summary
    console.log("\nSeeded data summary:");
    console.log(`- Created ${users.length} users`);
    console.log(`- Created ${chats.length} chats`);
    console.log("\nYou can now log in with these credentials:");
    console.log("Admin - Email: admin@example.com, Password: admin123");
    console.log("Users - Password for all users: user123");
    console.log("User emails:");
    users.filter(u => u.role === 'user').forEach(u => console.log(`- ${u.email}`));

    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
    
  } catch (err) {
    console.error("❌ Error seeding data:", err);
  }
};

seedDatabase();
