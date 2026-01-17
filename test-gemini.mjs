import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';

async function test() {
  try {
    const env = fs.readFileSync('.env.local', 'utf8');
    const keyMatch = env.match(/NEXT_PUBLIC_GEMINI_API_KEY=(.*)/);
    const apiKey = keyMatch ? keyMatch[1].trim() : "";

    const genAI = new GoogleGenerativeAI(apiKey, { apiVersion: "v1" });
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    console.log("Testing gemini-1.5-flash on v1...");
    const result = await model.generateContent("Hello, respond with 'OK' if you see this.");
    console.log("Response:", result.response.text());
  } catch (e) {
    console.error("Test failed:", e.message);
    if (e.message.includes("404")) {
        console.log("404 detected, trying gemini-pro...");
        // gemini-pro is often on v1
    }
  }
}

test();
