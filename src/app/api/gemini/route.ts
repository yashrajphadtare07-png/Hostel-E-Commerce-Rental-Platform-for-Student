import { NextRequest, NextResponse } from "next/server";
//import { GoogleGenAI } from "@google/genai";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
//const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const geminiModel = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case "generateItemDescription":
        return await handleGenerateItemDescription(params);
      case "suggestPrice":
        return await handleSuggestPrice(params);
      case "verifyItemImage":
        return await handleVerifyItemImage(params);
      case "chatbot":
        return await handleChatbot(params);
      case "recommendations":
        return await handleRecommendations(params);
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      
      let status = 500;
      let errorType = "INTERNAL_ERROR";
      let message = error.message || "An unexpected error occurred";

      if (error.message?.includes("403") || error.message?.includes("API key") || error.message?.includes("leaked")) {
        status = 403;
        errorType = "API_KEY_INVALID";
        message = "AI service is currently unavailable. Please try again later or fill in the details manually.";
      } else if (error.message?.includes("429") || error.message?.includes("quota")) {
        status = 429;
        errorType = "QUOTA_EXCEEDED";
        message = "AI service is busy. Please try again later.";
      } else if (error instanceof SyntaxError) {
        status = 500;
        errorType = "PARSE_ERROR";
        message = "Failed to parse AI response as JSON";
      }

      return NextResponse.json(
        { error: errorType, message },
        { status }
      );
    }
}

async function handleGenerateItemDescription({ imageBase64, mimeType }: { imageBase64: string; mimeType: string }) {
  const prompt = `You are an expert at analyzing items for a college rental marketplace. Analyze this image and provide a JSON response with the following structure:
{
  "title": "A catchy, descriptive title for the item (max 60 chars)",
  "description": "A detailed description of the item, its features, condition, and why someone would want to rent it (150-250 words)",
  "category": "One of: Electronics, Books, Sports, Furniture, Appliances, Clothing, Vehicles, Study Materials, Musical Instruments, Other",
  "condition": "One of: Like New, Good, Fair, Worn",
  "suggestedPrice": {
    "min": minimum suggested price per day in INR,
    "max": maximum suggested price per day in INR,
    "perDay": recommended price per day in INR
  },
  "tags": ["array", "of", "relevant", "search", "tags"]
}

Be realistic about pricing for Indian college students. Consider the item type, condition, and typical rental market rates.
Return ONLY valid JSON, no markdown or extra text.`;

  const result = await geminiModel.generateContent([
    { text: prompt },
    { inlineData: { mimeType, data: imageBase64 } }
  ]);

  const text = result.response.text();
  if (!text) throw new Error("Empty response from Gemini");
  
  const cleanedResponse = text.replace(/```json\n?|\n?```/g, "").trim();
  try {
    const json = JSON.parse(cleanedResponse);
    return NextResponse.json(json);
  } catch (e) {
    console.error("Failed to parse Gemini response:", text);
    throw new SyntaxError("Invalid JSON in Gemini response");
  }
}

async function handleSuggestPrice({ itemName, category, condition, originalPrice }: { itemName: string; category: string; condition: string; originalPrice?: number }) {
  const priceContext = originalPrice ? `Original purchase price: ₹${originalPrice}.` : "";

  const prompt = `You are a pricing expert for a college rental marketplace in India.
Item: ${itemName}
Category: ${category}
Condition: ${condition}
${priceContext}

Suggest a fair daily rental price in INR. Consider:
- Indian college student budgets
- Typical rental market rates
- Item depreciation and condition
- Demand for this category

Return JSON:
{
  "min": minimum daily rental price in INR,
  "max": maximum daily rental price in INR,
  "recommended": best recommended price in INR,
  "reasoning": "Brief explanation of the pricing (1-2 sentences)"
}

Return ONLY valid JSON.`;

  const result = await geminiModel.generateContent(prompt);
  const text = result.response.text();
  if (!text) throw new Error("Empty response from Gemini");
  
  const cleanedResponse = text.replace(/```json\n?|\n?```/g, "").trim();
  try {
    const json = JSON.parse(cleanedResponse);
    return NextResponse.json(json);
  } catch (e) {
    console.error("Failed to parse Gemini response:", text);
    throw new SyntaxError("Invalid JSON in Gemini response");
  }
}

async function handleVerifyItemImage({ imageBase64, mimeType, expectedCategory }: { imageBase64: string; mimeType: string; expectedCategory: string }) {
  const prompt = `Analyze this image for a rental marketplace listing.
Expected category: ${expectedCategory}

Verify:
1. Does the image show a real, rentable item?
2. Does it match the expected category?
3. Is the image quality acceptable for a listing?
4. Are there any issues (blurry, inappropriate content, stock photo, etc.)?

Return JSON:
{
  "isValid": true/false,
  "confidence": 0-100 (how confident you are),
  "detectedCategory": "what category this actually belongs to",
  "issues": ["array of any issues found, empty if none"]
}

Return ONLY valid JSON.`;

  const result = await geminiModel.generateContent([
    { text: prompt },
    { inlineData: { mimeType, data: imageBase64 } }
  ]);

  const text = result.response.text();
  if (!text) throw new Error("Empty response from Gemini");
  
  const cleanedResponse = text.replace(/```json\n?|\n?```/g, "").trim();
  try {
    const json = JSON.parse(cleanedResponse);
    return NextResponse.json(json);
  } catch (e) {
    console.error("Failed to parse Gemini response:", text);
    throw new SyntaxError("Invalid JSON in Gemini response");
  }
}

async function handleChatbot({ userMessage, conversationHistory }: { userMessage: string; conversationHistory: { role: "user" | "assistant"; content: string }[] }) {
  const systemPrompt = `You are RentAI, a helpful assistant for a college rental marketplace called CampusRent. You help students:
- Find items to rent
- Understand how the platform works
- Get pricing advice
- Navigate listings
- Resolve common issues

Be friendly, concise, and helpful. Use casual language appropriate for college students.
Keep responses under 150 words unless more detail is needed.

Platform features:
- Students can list items for rent
- Browse categories: Electronics, Books, Sports, Furniture, etc.
- Secure wallet system for payments
- Community features for discussions
- Trust levels (Bronze, Silver, Gold) based on rental history

Common questions you can answer:
- How to rent an item
- How to list an item
- Payment and wallet info
- Trust and verification
- Pricing suggestions`;

  const messages = (conversationHistory || []).map((msg: { role: string; content: string }) => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.content }]
  }));

  const chat = geminiModel.startChat({
    history: [
      { role: "user", parts: [{ text: systemPrompt }] },
      { role: "model", parts: [{ text: "I understand! I'm RentAI, ready to help students with the CampusRent platform. How can I assist you today?" }] },
      ...messages
    ]
  });

  const result = await chat.sendMessage(userMessage);
  const text = result.response.text();

  const suggestions = extractSuggestions(text, userMessage);

  return NextResponse.json({ message: text, suggestions });
}

async function handleRecommendations({ itemCategory, itemTitle, userHistory }: { itemCategory: string; itemTitle: string; userHistory?: string[] }) {
  const historyContext = userHistory?.length 
    ? `User has previously rented: ${userHistory.join(", ")}.` 
    : "";

  const prompt = `You are a recommendation engine for a college rental marketplace. 
${historyContext}
The user is looking at: "${itemTitle}" in category "${itemCategory}".

Suggest 4-5 complementary items that students often rent together. Think about what goes well with this item.
Examples:
- Cycle → Helmet, Lock, Pump
- Camera → Tripod, Memory Card, Camera Bag
- Guitar → Tuner, Picks, Capo

Return a JSON response:
{
  "items": ["item1", "item2", "item3", "item4"],
  "reason": "Brief explanation of why these items complement the main item"
}

Return ONLY valid JSON.`;

  const result = await geminiModel.generateContent(prompt);
  const text = result.response.text();
  if (!text) throw new Error("Empty response from Gemini");
  
  const cleanedResponse = text.replace(/```json\n?|\n?```/g, "").trim();
  try {
    const json = JSON.parse(cleanedResponse);
    return NextResponse.json(json);
  } catch (e) {
    console.error("Failed to parse Gemini response:", text);
    throw new SyntaxError("Invalid JSON in Gemini response");
  }
}

function extractSuggestions(response: string, userMessage: string): string[] {
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes("rent") || lowerMessage.includes("find")) {
    return ["Browse all items", "View categories", "Search nearby"];
  }
  if (lowerMessage.includes("list") || lowerMessage.includes("sell")) {
    return ["List an item", "View my listings", "Pricing guide"];
  }
  if (lowerMessage.includes("pay") || lowerMessage.includes("wallet")) {
    return ["Check wallet", "Add funds", "Transaction history"];
  }
  return ["Browse items", "List an item", "View community"];
}
