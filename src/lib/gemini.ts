import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not defined in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);

export const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const suggestCategory = async (title: string, description: string) => {
  const prompt = `Based on the following title and description of a rental item for students, suggest the most appropriate category from this list: Books, Electronics, Lab Gear, Sports, Other.
  
  Title: ${title}
  Description: ${description}
  
  Return only the category name.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Other";
  }
};

export const generateListingDescription = async (title: string) => {
  const prompt = `Generate a short, catchy, and professional rental description (max 2 sentences) for a student item called: ${title}. Focus on its utility for campus life.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "";
  }
};
