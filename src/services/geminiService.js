import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
const missingApiKey =
  !apiKey || apiKey === "your_google_gemini_api_key_here" || apiKey === "missing-api-key";

if (missingApiKey) {
  console.warn("GEMINI_API_KEY is not set. AI routes will fail until it is configured.");
}

const genAI = new GoogleGenerativeAI(apiKey || "missing-api-key");
const model = genAI.getGenerativeModel({ model: modelName });

const stripJsonFences = (value) => {
  return value
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
};

export const generateText = async (prompt) => {
  if (missingApiKey) {
    const err = new Error("GEMINI_API_KEY is missing. Add it to backend/.env and restart the backend.");
    err.status = 503;
    throw err;
  }

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text().trim();
};

export const generateJson = async (prompt) => {
  const rawText = await generateText(prompt);
  const cleanedText = stripJsonFences(rawText);

  try {
    return JSON.parse(cleanedText);
  } catch {
    const err = new Error("Gemini returned invalid JSON.");
    err.status = 502;
    throw err;
  }
};
