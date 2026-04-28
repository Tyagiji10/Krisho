import express from 'express';
import { categorizeProduct, generateProductDescription, generateChatResponse } from '../utils/gemini.js';

const router = express.Router();

router.post('/categorize', async (req, res) => {
  const { name, description } = req.body;
  const category = await categorizeProduct(name, description);
  res.json({ category });
});

router.post('/describe', async (req, res) => {
  const { name, category } = req.body;
  const description = await generateProductDescription(name, category);
  res.json({ description });
});

router.post('/chat', async (req, res) => {
  const { message, history } = req.body;
  const response = await generateChatResponse(message, history);
  res.json({ response });
});

export default router;
