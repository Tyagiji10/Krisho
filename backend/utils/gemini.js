import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSy..."); // Placeholder

export const categorizeProduct = async (name, description) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
