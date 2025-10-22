import { GoogleGenAI } from "@google/genai";
import type { GroundingSource } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface GeminiSearchResult {
  text: string;
  sources: GroundingSource[];
}

export const askGeminiWithSearch = async (prompt: string): Promise<GeminiSearchResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Considering the topic of antibiotic resistance, answer the following question: "${prompt}"`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const sources: GroundingSource[] = groundingMetadata?.groundingChunks || [];

    return { text, sources };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        return { text: `An error occurred: ${error.message}`, sources: [] };
    }
    return { text: "An unexpected error occurred. Please check the console.", sources: [] };
  }
};
