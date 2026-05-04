import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import cache from './cache.js';

dotenv.config();

const getAIModel = (modelName = "gemini-flash-latest") => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is missing from environment variables.");
  }
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ 
    model: modelName,
    generationConfig: {
      temperature: 0.7,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 1024,
    }
  });
};

export const categorizeProduct = async (name, description) => {
  const cacheKey = `cat_${name}_${description}`.substring(0, 100);
  const cachedValue = cache.get(cacheKey);
  if (cachedValue) return cachedValue;

  try {
    const model = getAIModel();

    const prompt = `
      You are an expert in Indian agriculture and marketplaces. 
      Given a product name and description, categorize it into one of these categories:
      - Grains
      - Vegetables
      - Fruits
      - Dairy
      - Organic
      - Spices
      
      Product Name: ${name}
      Description: ${description}
      
      Respond with ONLY the category name.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const category = response.text().trim();
    
    // Validate response
    const validCategories = ['Grains', 'Vegetables', 'Fruits', 'Dairy', 'Organic', 'Spices'];
    const finalCategory = validCategories.includes(category) ? category : 'Organic';
    cache.set(cacheKey, finalCategory);
    return finalCategory;
  } catch (error) {
    console.error("Gemini Categorization Error:", error);
    return "Organic"; // Fallback
  }
};

export const generateProductDescription = async (name, category) => {
  const cacheKey = `desc_${name}_${category}`.substring(0, 100);
  const cachedValue = cache.get(cacheKey);
  if (cachedValue) return cachedValue;

  try {
    const model = getAIModel();

    const prompt = `
      You are an expert copywriter for an Indian agricultural marketplace called "Krisho". 
      Write a professional, appetizing, and trust-building product description for:
      Product Name: ${name}
      Category: ${category}
      
      Keep it under 30 words. Focus on freshness, quality, and direct-from-farm benefits.
      Respond with ONLY the description text.
    `;

    const apiResult = await model.generateContent(prompt);
    const text = apiResult.response.text().trim();
    cache.set(cacheKey, text);
    return text;
  } catch (error) {
    console.error("Gemini Description Error:", error);
    return `Premium quality ${name} freshly harvested from our local farms. Organic and healthy.`; // Fallback
  }
};

export const generateChatResponse = async (message, history = [], language = 'en') => {
  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key.startsWith('AIzaSy_placeholder')) {
      // Basic rule-based fallback if no key
      const lowerMessage = (message || '').toLowerCase();
      if (lowerMessage.includes('summer') || lowerMessage.includes('crop')) {
        return "Top crops for summer include cucumbers, tomatoes, bell peppers, melons, and corn.";
      }
      return "Namaste! I am here to help. How else can I guide your Agri yields?";
    }

    const languageInstruction = language === 'hi' 
      ? "The user prefers Hindi. Respond in Hindi unless asked otherwise."
      : "The user prefers English. Respond in English unless asked otherwise.";

    const systemPrompt = `You are the official AI Assistant for Krisho, a premium Indian agricultural marketplace that empowers farmers by eliminating middlemen.
    ${languageInstruction} 
    You MUST support both Hindi and English. If the user writes in a specific language, follow that. If they mix, use Hinglish.
    
    YOUR MISSION:
    - Help farmers maximize their profits by selling directly on Krisho.
    - Explain how Krisho eliminates middlemen to give farmers better prices.
    - Provide expert advice on farming, crop health, and marketplace strategies.
    
    SPECIAL KNOWLEDGE (GOVT SCHEMES):
    - When asked about schemes, provide detailed, structured info:
      1. PM-KISAN: ₹6000/year direct income support (₹2000 in 3 installments).
      2. PMFBY (Fasal Bima): Low-premium insurance against natural disasters.
      3. e-NAM: Integration with Krisho for wider market access.
      4. Soil Health Card: Testing soil to reduce fertilizer costs.
      5. PMKSY: 'Per Drop More Crop' irrigation support.
      6. Kisan Credit Card (KCC): Credit for seeds, fertilizers, and equipment.
    
    Always be polite, professional, and accurate. Use bullet points for readability.
    If asked about Krisho functions, guide them to the Dashboard, Mandi Pricing, or My Products section.`;

    // Convert history to REST format
    const contents = [
      { role: "user", parts: [{ text: systemPrompt }] },
      { role: "model", parts: [{ text: language === 'hi' ? "नमस्ते! मैं कृषो एआई सहायक हूँ। मैं भारतीय सरकारी योजनाओं और खेती में आपकी कैसे मदद कर सकता हूँ?" : "Namaste! I am the Krisho AI Helper. How can I assist you today with Indian government schemes or farming?" }] },
      ...history.map(h => ({
        role: h.role === 'model' ? 'model' : 'user',
        parts: h.parts || [{ text: h.text }]
      })),
      { role: "user", parts: [{ text: message }] }
    ];

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${key}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.candidates[0].content.parts[0].text.trim();
  } catch (error) {
    console.error("Gemini REST Chat Error:", error);
    
    // Resilient rule-based answers instead of dropping error messages
    const lowerMessage = (message || '').toLowerCase();
    if (lowerMessage.includes('summer') || lowerMessage.includes('crop')) {
      return language === 'hi' ? "गर्मी की फसलों के लिए, खीरा, टमाटर, खरबूजा और मक्का जैसी फसलों पर विचार करें।" : "For optimum yields, consider robust summer crops like gourds, sweet corn, tomatoes, and peppers.";
    }
    if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return language === 'hi' ? "अपने डैशबोर्ड में मंडी मूल्य की जांच करें।" : "Make sure to view the Mandi Pricing benchmarks available directly in your settings pane.";
    }
    return language === 'hi' ? "नमस्ते! मैं आपकी कृषि उपज को बढ़ाने में मदद करने के लिए यहाँ हूँ। मैं आपकी और कैसे मदद कर सकता हूँ?" : "Namaste! I am here to help maximize your marketplace operations. How else can I guide your Agri yields?";
  }
};

export const getMultilingualKeywords = async (keyword) => {
  const cacheKey = `keys_${keyword}`.substring(0, 100);
  const cachedValue = cache.get(cacheKey);
  if (cachedValue) return cachedValue;

  try {
    const model = getAIModel();

    const prompt = `
      You are an agricultural keyword expander for an Indian farming app.
      Given the user search query: "${keyword}"
      Provide equivalent product keywords for this item in English, Hindi, Marathi, Telugu, and Punjabi.
      Also include spelling variations, phonetic translations (e.g. tomato -> tamaatar, tamatar).
      Respond ONLY with a comma-separated list of lowercase keywords. 
      Do not include quotes, explanations, or any other text. 
      Example output for 'tomato': tomato, tamatar, tamaatar, टोमॅटो
    `;

    const apiResult = await model.generateContent(prompt);
    const text = apiResult.response.text();
    
    const keywords = text
      .split(',')
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);
      
    if (!keywords.includes(keyword.toLowerCase())) {
      keywords.push(keyword.toLowerCase());
    }
    
    cache.set(cacheKey, keywords);
    return keywords;
  } catch (error) {
    console.error("Gemini Keyword Expansion Error:", error);
    return [keyword.toLowerCase()];
  }
};

// Suggest a competitive price range for a product
export const suggestProductPrice = async (name, category, city) => {
  const cacheKey = `price_${name}_${category}_${city}`.substring(0, 100);
  const cachedValue = cache.get(cacheKey);
  if (cachedValue) return cachedValue;

  try {
    const model = getAIModel();
    const prompt = `
      You are an Indian agricultural market expert.
      A farmer in ${city || 'India'} wants to sell "${name}" (category: ${category}).
      Based on current mandi rates, what is a fair price range per unit (kg/litre/piece)?
      
      Respond ONLY with a JSON object like:
      {"min": 20, "max": 35, "unit": "kg", "note": "Prices vary by season"}
    `;
    const apiResult = await model.generateContent(prompt);
    const text = apiResult.response.text().replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(text);
    cache.set(cacheKey, parsed);
    return parsed;
  } catch (err) {
    console.error("Price suggestion error:", err);
    return null;
  }
};
