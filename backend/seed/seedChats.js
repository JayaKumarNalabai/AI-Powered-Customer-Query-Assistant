import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Chat from '../models/Chat.js';
import User from '../models/User.js';

dotenv.config();

const generateChatMessages = () => {
  return [
    {
      role: 'user',
      content: 'Hello, I need help with my order.',
      timestamp: new Date(Date.now() - 3600000 * 2) // 2 hours ago
    },
    {
      role: 'assistant',
      content: 'Hello! I\'d be happy to help you with your order. Could you please provide your order number?',
      timestamp: new Date(Date.now() - 3600000 * 2 + 30000)
    },
    {
      role: 'user',
      content: 'Yes, my order number is #12345',
      timestamp: new Date(Date.now() - 3600000 * 2 + 60000)
    },
    {
      role: 'assistant',
      content: 'I can see your order is currently in processing status. It should be shipped within the next 24 hours.',
      timestamp: new Date(Date.now() - 3600000 * 2 + 90000)
    },
    {
      role: 'user',
      content: 'Great, thank you! When will I receive it?',
      timestamp: new Date(Date.now() - 3600000 * 2 + 120000)
    },
    {
      role: 'assistant',
      content: 'Based on your location, estimated delivery time is 2-3 business days after shipping.',
      timestamp: new Date(Date.now() - 3600000 * 2 + 150000)
    }
  ];
};

const generateProductInquiry = () => {
  return [
    {
      role: 'user',
      content: 'I\'m interested in the Gaming Keyboard. Does it come with a wrist rest?',
      timestamp: new Date(Date.now() - 3600000) // 1 hour ago
    },
    {
      role: 'assistant',
      content: 'Yes, the Gaming Keyboard comes with a detachable ergonomic wrist rest for added comfort during long gaming sessions.',
      timestamp: new Date(Date.now() - 3600000 + 30000)
    },
    {
      role: 'user',
      content: 'Perfect! What about the warranty?',
      timestamp: new Date(Date.now() - 3600000 + 60000)
    },
    {
      role: 'assistant',
      content: 'The keyboard comes with a 2-year manufacturer warranty covering any mechanical defects.',
      timestamp: new Date(Date.now() - 3600000 + 90000)
    }
  ];
};

const generateTechnicalSupport = () => {
  return [
    {
      role: 'user',
      content: 'My Bluetooth headphones won\'t connect to my laptop',
      timestamp: new Date(Date.now() - 1800000) // 30 minutes ago
    },
    {
      role: 'assistant',
      content: 'Let\'s troubleshoot this together. First, make sure Bluetooth is enabled on your laptop. Can you confirm this?',
      timestamp: new Date(Date.now() - 1800000 + 30000)
    },
    {
      role: 'user',
      content: 'Yes, Bluetooth is on but the headphones don\'t show up in the device list',
      timestamp: new Date(Date.now() - 1800000 + 60000)
    },
    {
      role: 'assistant',
      content: 'Please try putting your headphones in pairing mode by holding the power button for 5 seconds until you see the LED blinking.',
      timestamp: new Date(Date.now() - 1800000 + 90000)
    }
  ];
};

const seedChats = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing chats
    await Chat.deleteMany({});
    console.log('Cleared existing chats');

    // Get all users
    const users = await User.find({ role: 'user' });

    // Create chats for each user
    const chats = [];
    for (const user of users) {
      // Order support chat
      chats.push({
        userId: user._id,
        messages: generateChatMessages()
      });

      // Product inquiry chat
      chats.push({
        userId: user._id,
        messages: generateProductInquiry()
      });

      // Technical support chat
      chats.push({
        userId: user._id,
        messages: generateTechnicalSupport()
      });
    }

    await Chat.insertMany(chats);
    console.log(`\n✅ Created ${chats.length} chats\n`);

    // Print summary
    console.log('Chat summary by user:');
    for (const user of users) {
      const userChats = chats.filter(chat => chat.userId.toString() === user._id.toString());
      console.log(`\n${user.name} (${user.email}):`);
      console.log(`Total chats: ${userChats.length}`);
      console.log('Chat topics:');
      console.log('  • Order support (6 messages)');
      console.log('  • Product inquiry (4 messages)');
      console.log('  • Technical support (4 messages)');
    }

  } catch (error) {
    console.error('Error seeding chats:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

seedChats();
