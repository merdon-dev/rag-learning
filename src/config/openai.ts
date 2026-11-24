import { config } from "dotenv";
import path from "node:path";
import { GEMINI_API_KEY } from "./env.js";
import { GoogleGenAI } from "@google/genai";

config({
  path: path.resolve(
    process.cwd(),
    `src/config/env/.env.${process.env.NODE_ENV || "development"}`,
  ),
});

if (!GEMINI_API_KEY) {
  throw new Error("Gemini api key missing");
}

export const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});
