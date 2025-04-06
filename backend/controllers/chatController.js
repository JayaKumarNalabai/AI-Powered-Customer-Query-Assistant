// backend/controllers/chatController.js

import axios from 'axios';
import Chat from '../models/Chat.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const user = await User.findById(req.user._id);
    const products = await Product.find().limit(5);
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 })
      .limit(3);

    const productList = products.map(p => (
      `• ${p.name} - $${p.price}\nDescription: ${p.description}`
    )).join('\n');

    const orderList = orders.map(o => {
      const itemsList = o.items.map(item => 
        `  - ${item.product.name} (Qty: ${item.quantity}, Price: $${item.price})`
      ).join('\n');
      
      return `Order ID: ${o._id}
Status: ${o.status}
Items:\n${itemsList}
Total: $${o.totalAmount}
`;
    }).join('\n\n') || "No recent orders found.";

    const userContext = `
Customer Details:
Name: ${user.name}
Email: ${user.email}
Role: ${user.role}

Top Products:
${productList}

Recent Orders:
${orderList}
`;

    const systemPrompt = `
You are a polite, knowledgeable customer query assistant for an e-commerce website.
Your job is to help the customer with product details, order updates, refund policies, or return issues.

When discussing orders:
- Always mention product names, quantities, and prices
- Show order status and total amount
- Format all prices with $ symbol
- Use bullet points for listing items

Never talk like an AI. Be natural and helpful.
If the user says "Hi", greet back and offer help.
Only talk about things relevant to their shopping experience.

Here's the customer and product context:
${userContext}

Now respond to this query: "${message}"
`;

    // Find existing chat or create a new one
    let chat = await Chat.findOne({ userId: req.user._id });
    if (!chat) {
      chat = new Chat({ userId: req.user._id, messages: [] });
    }

    // Add user message
    chat.messages.push({
      role: 'user',
      content: message
    });

    const promptContent = {
      contents: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }]
        }
      ]
    };

    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      promptContent,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const reply = geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't process that. Could you rephrase it?";

    // Add assistant message
    chat.messages.push({
      role: 'assistant',
      content: reply
    });

    // Save the updated chat
    await chat.save();

    res.json({ 
      reply,
      messages: chat.messages 
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: 'Error processing message', error: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const chat = await Chat.findOne({ userId: req.user._id });
    res.json(chat ? chat.messages : []);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
};
