import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

// Try to load from .env.local
import fs from 'fs';
const env = fs.readFileSync('.env.local', 'utf8');
const keyMatch = env.match(/NEXT_PUBLIC_GEMINI_API_KEY=(.*)/);
const apiKey = keyMatch ? keyMatch[1].trim() : "";

const genAI = new GoogleGenerativeAI(apiKey);

async function list() {
  try {
    const models = await genAI.listModels();
    console.log(JSON.stringify(models, null, 2));
  } catch (e) {
    console.error(e);
  }
}

list();
