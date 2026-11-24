import { config } from "dotenv";

if (process.env.NODE_ENV !== "production") {
  config({
    path: `./src/config/env/.env.${process.env.NODE_ENV || "development"}`,
  });
}

export const { PORT, GEMINI_API_KEY, DATABASE_URL } = process.env;

export default { PORT, GEMINI_API_KEY, DATABASE_URL };
