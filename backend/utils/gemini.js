import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSy..."); // Placeholder

export const categorizeProduct = async (name, description) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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
    return validCategories.includes(category) ? category : 'Organic';
  } catch (error) {
    console.error("Gemini Categorization Error:", error);
    return "Organic"; // Fallback
  }
};

export const generateProductDescription = async (name, category) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
      You are an expert copywriter for an Indian agricultural marketplace called "Krisho". 
      Write a professional, appetizing, and trust-building product description for:
      Product Name: ${name}
      Category: ${category}
      
      Keep it under 30 words. Focus on freshness, quality, and direct-from-farm benefits.
      Respond with ONLY the description text.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Gemini Description Error:", error);
    return `Premium quality ${name} freshly harvested from our local farms. Organic and healthy.`; // Fallback
  }
};

export const generateChatResponse = async (message, history = []) => {
  try {
    // Fail-safe rule-based responses if API key is not set
    const key = process.env.GEMINI_API_KEY || '';
    if (!key || key.startsWith('AIzaSy_placeholder') || key === 'AIzaSy...') {
      const lowerMessage = message.toLowerCase();
      if (lowerMessage.includes('summer') || lowerMessage.includes('crop')) {
        return "Top crops for summer include cucumbers, tomatoes, bell peppers, melons, and corn. Ensure optimum moisture levels.";
      }
      if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
        return "Check the Mandi Pricing tab in your Dashboard to match regional buyer demand comfortably!";
      }
      return "I am here to assist with Krisho operations. Try optimizing delivery parameters for better outcomes.";
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const languageInstruction = preferredLanguage === 'hi' 
      ? "The user prefers Hindi. Respond in Hindi unless asked otherwise."
      : "The user prefers English. Respond in English unless asked otherwise.";

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: `You are the official AI Assistant for Krisho, an Indian agricultural marketplace. ${languageInstruction} You MUST support both Hindi and English. If the user writes in a specific language, follow that. If they mix, use Hinglish. Always answer briefly, politely, and accurately. You understand farming, crop pricing, Indian government schemes for farmers, logistics, and marketplace instructions.` }]
        },
        {
          role: "model",
          parts: [{ text: preferredLanguage === 'hi' ? "नमस्ते! मैं कृषो एआई सहायक हूँ। मैं आपकी कैसे मदद कर सकता हूँ?" : "Namaste! I am the Krisho AI Helper. How can I assist you today?" }]
        },
        ...history
      ]
    });

    const result = await chat.sendMessage(message);
    return result.response.text().trim();
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    
    // Resilient rule-based answers instead of dropping error messages
    const lowerMessage = (message || '').toLowerCase();
    if (lowerMessage.includes('summer') || lowerMessage.includes('crop')) {
      return "For optimum yields, consider robust summer crops like gourds, sweet corn, tomatoes, and peppers. Guarantee sufficient root hydration.";
    }
    if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return "Make sure to view the Mandi Pricing benchmarks available directly in your settings pane.";
    }
    return "Namaste! I am here to help maximize your marketplace operations. How else can I guide your Agri yields?";
  }
};

export const getMultilingualKeywords = async (keyword) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
      You are an agricultural keyword expander for an Indian farming app.
      Given the user search query: "${keyword}"
      Provide equivalent product keywords for this item in English, Hindi, Marathi, Telugu, and Punjabi.
      Also include spelling variations, phonetic translations (e.g. tomato -> tamaatar, tamatar).
      Respond ONLY with a comma-separated list of lowercase keywords. 
      Do not include quotes, explanations, or any other text. 
      Example output for 'tomato': tomato, tamatar, tamaatar, टोमॅटो
    `;

    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    
    const keywords = text
      .split(',')
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);
      
    if (!keywords.includes(keyword.toLowerCase())) {
      keywords.push(keyword.toLowerCase());
    }
    
    return keywords;
  } catch (error) {
    console.error("Gemini Keyword Expansion Error:", error);
    return [keyword.toLowerCase()];
  }
};

// Suggest a competitive price range for a product
export const suggestProductPrice = async (name, category, city) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `
      You are an Indian agricultural market expert.
      A farmer in ${city || 'India'} wants to sell "${name}" (category: ${category}).
      Based on current mandi rates, what is a fair price range per unit (kg/litre/piece)?
      
      Respond ONLY with a JSON object like:
      {"min": 20, "max": 35, "unit": "kg", "note": "Prices vary by season"}
    `;
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, '').trim();
    return JSON.parse(text);
  } catch (err) {
    console.error("Price suggestion error:", err);
    return null;
  }
};
