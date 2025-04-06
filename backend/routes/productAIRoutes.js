import express from 'express';
import axios from 'axios';
import { protect } from '../middleware/auth.js';
import Product from '../models/Product.js';

const router = express.Router();

router.post("/ask", protect, async (req, res) => {
  const { message } = req.body;

  try {
    // First, get all products to provide context to the AI
    const products = await Product.find({ isActive: true })
      .select('name price description category stock')
      .lean();

    const productContext = products.map(p => 
      `- ${p.name} (${p.category}): $${p.price} - ${p.stock} in stock\n  ${p.description}`
    ).join('\n');

    const prompt = `
You are an AI product assistant for our inventory management system.
You have access to our current product catalog:

${productContext}

Your tasks:
- Answer questions about specific products (price, stock, description)
- Help find products by category or features
- Provide inventory status updates
- Make product recommendations based on user needs
- Explain product features and specifications
- Compare similar products

Always:
- Be concise and professional
- Include specific product details when relevant
- Mention stock availability
- Format prices with $ symbol
- Use bullet points for lists
- Stay within the scope of available product information

User Question: "${message}"
Assistant:`;

    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + process.env.GEMINI_API_KEY,
      {
        contents: [{ parts: [{ text: prompt }] }]
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    const reply = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, but I couldn't process that request.";
    res.json({ reply });

  } catch (err) {
    console.error("Product AI Error:", err.response?.data || err.message);
    res.status(500).json({
      msg: "Error processing product query",
      error: err?.response?.data?.error?.message || err.message
    });
  }
});

export default router;
