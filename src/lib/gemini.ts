export interface ItemDescription {
  title: string;
  description: string;
  category: string;
  condition: string;
  suggestedPrice: {
    min: number;
    max: number;
    perDay: number;
  };
  tags: string[];
}

export interface ChatResponse {
  message: string;
  suggestions?: string[];
}

export interface RecommendationResult {
  items: string[];
  reason: string;
}

async function callGeminiAPI(action: string, params: Record<string, any>) {
  const response = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...params }),
  });

  const text = await response.text();
  
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error("Failed to parse API response");
  }

  if (!response.ok) {
    console.log("AI ERROR FULL RESPONSE:", data);
    console.log("AI ERROR FIELD:", data.error);

    if (data.error === "QUOTA_EXCEEDED") {
      throw new Error("QUOTA_EXCEEDED");
    }
    if (data.error === "API_KEY_INVALID") {
      throw new Error("API_KEY_INVALID");
    }
    throw new Error(data.message || "Failed to call AI service");
  }

  return data;
}

export async function generateItemDescription(imageBase64: string, mimeType: string): Promise<ItemDescription> {
  try {
    return await callGeminiAPI("generateItemDescription", { imageBase64, mimeType });
  } catch (error: any) {
    if (error.message === "API_KEY_INVALID") {
      throw new Error("QUOTA_EXCEEDED");
    }
    throw error;
  }
}

export async function getSmartRecommendations(
  itemCategory: string,
  itemTitle: string,
  userHistory?: string[]
): Promise<RecommendationResult> {
  try {
    return await callGeminiAPI("recommendations", { itemCategory, itemTitle, userHistory });
  } catch (error: any) {
    if (error.message === "QUOTA_EXCEEDED") {
      return { items: [], reason: "Recommendations temporarily unavailable due to high demand." };
    }
    throw error;
  }
}

export async function chatbotResponse(
  userMessage: string,
  conversationHistory: { role: "user" | "assistant"; content: string }[] = []
): Promise<ChatResponse> {
  try {
    return await callGeminiAPI("chatbot", { userMessage, conversationHistory });
  } catch (error: any) {
    if (error.message === "QUOTA_EXCEEDED") {
      return {
        message: "I'm sorry, I'm a bit overwhelmed with requests right now. Please try again in a few minutes!",
        suggestions: ["Try later", "Contact Support"],
      };
    }
    throw error;
  }
}

export async function suggestPrice(
  itemName: string,
  category: string,
  condition: string,
  originalPrice?: number
): Promise<{ min: number; max: number; recommended: number; reasoning: string }> {
  return callGeminiAPI("suggestPrice", { itemName, category, condition, originalPrice });
}

export async function verifyItemImage(
  imageBase64: string,
  mimeType: string,
  expectedCategory: string
): Promise<{ isValid: boolean; confidence: number; detectedCategory: string; issues: string[] }> {
  return callGeminiAPI("verifyItemImage", { imageBase64, mimeType, expectedCategory });
}
