import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';

async function test() {
  try {
    const env = fs.readFileSync('.env.local', 'utf8');
    const keyMatch = env.match(/NEXT_PUBLIC_GEMINI_API_KEY=(.*)/);
    const apiKey = keyMatch ? keyMatch[1].trim() : "";

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    console.log("Testing gemini-2.0-flash-exp...");
    const result = await model.generateContent("Hello, respond with 'OK' if you see this.");
    console.log("Response:", result.response.text());
  } catch (e) {
    console.error("Test failed:", e.message);
  }
}

test();
