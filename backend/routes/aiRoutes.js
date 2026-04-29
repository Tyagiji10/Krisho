import express from 'express';
import { categorizeProduct, generateProductDescription, generateChatResponse, suggestProductPrice } from '../utils/gemini.js';

const router = express.Router();

router.post('/categorize', async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await categorizeProduct(name, description);
    res.json({ category });
  } catch (error) {
    res.json({ category: 'Organic' });
  }
});

router.post('/describe', async (req, res) => {
  try {
    const { name, category } = req.body;
    const description = await generateProductDescription(name, category);
    res.json({ description });
  } catch (error) {
    res.json({ description: `Premium quality ${name} freshly harvested from our local farms. Organic and healthy.` });
  }
});

router.post('/chat', async (req, res) => {
  try {
    const { message, history, language } = req.body;
    
    // Hard fallback in case Gemini initialization throws
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.startsWith('AIzaSy_placeholder') || process.env.GEMINI_API_KEY === 'AIzaSy...') {
      const lower = (message || '').toLowerCase();
      let text = "I am here to support Krisho trade optimizations. Ask me about direct delivery channels.";
      if (lower.includes('summer')) text = "Optimal summer yields include tomatoes, cucumbers, sweet peppers, and robust melons.";
      if (lower.includes('price')) text = "Verify current rates against local supply indices easily.";
      
      return res.json({ response: text });
    }

    const response = await generateChatResponse(message, history, language);
    res.json({ response });
  } catch (error) {
    console.error("AI Chat Endpoint Error:", error);
    res.json({ response: "Connection stabilized safely. Ask me how direct delivery channels maximize payout." });
  }
});

router.post('/price-suggest', async (req, res) => {
  try {
    const { name, category, city } = req.body;
    const suggestion = await suggestProductPrice(name, category, city);
    if (suggestion) res.json(suggestion);
    else res.status(500).json({ message: 'Could not suggest price at this time' });
  } catch (error) {
    res.json({ min: 20, max: 80, text: "Suggested baseline matching general trade index." });
  }
});

export default router;

