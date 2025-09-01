
import { GoogleGenAI, Type } from "@google/genai";
import type { NovelAnalysis } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    corrected: {
      type: Type.STRING,
      description: "The text with only grammar and spelling mistakes corrected. The original meaning and style should be preserved as much as possible."
    },
    improved: {
      type: Type.STRING,
      description: "A version of the text with improved phrasing for better fluency and naturalness, suitable for general high-quality Arabic writing."
    },
    literary: {
      type: Type.STRING,
      description: "An enhanced, literary version of the text, using richer vocabulary, evocative imagery, and a style suitable for a novel."
    }
  },
  required: ["corrected", "improved", "literary"]
};

export const enhanceArabicText = async (text: string): Promise<NovelAnalysis> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `رجاءً قم بتحليل النص العربي التالي وتقديم ثلاث نسخ منه:
      1. نسخة مصححة: صحح الأخطاء الإملائية والنحوية فقط.
      2. نسخة محسنة: أعد صياغة النص ليكون أكثر سلاسة وطبيعية.
      3. نسخة أدبية: حول النص إلى أسلوب أدبي غني ومناسب للروايات.
      
      النص هو: "${text}"`,
      config: {
        systemInstruction: "You are an expert Arabic linguist and novelist. Your task is to help users improve their Arabic writing for literary purposes. Respond ONLY with the requested JSON object.",
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.8,
        topP: 0.95,
      },
    });

    const jsonString = response.text.trim();
    const parsedJson = JSON.parse(jsonString);
    
    // Basic validation to ensure the response matches the expected structure
    if (
      typeof parsedJson.corrected === 'string' &&
      typeof parsedJson.improved === 'string' &&
      typeof parsedJson.literary === 'string'
    ) {
      return parsedJson as NovelAnalysis;
    } else {
      throw new Error("Invalid JSON structure received from API.");
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to enhance text. Please check your input or API key.");
  }
};
