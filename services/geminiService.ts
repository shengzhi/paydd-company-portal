import { GoogleGenAI, Chat } from "@google/genai";

const apiKey = process.env.API_KEY;

// Initialize the client only if the API key is present
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const createComplianceChat = (): Chat | null => {
  if (!ai) return null;
  
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `You are the PayDD Compliance Copilot. Your role is to assist HR managers and Finance Directors of global companies with cross-border hiring, payroll, and local labor law compliance. 
      
      Key Guidelines:
      1. Be professional, concise, and helpful.
      2. Provide specific details about labor laws, tax rates, and benefits for countries like US, UK, Germany, Singapore, Japan, etc.
      3. If a user asks about PayDD specific features, mention that PayDD automates EOR (Employer of Record), payroll processing, and contract management.
      4. Always advise users to consult with local legal counsel for final decisions.
      5. Format your responses with Markdown for readability (bullet points, bold text).
      `,
    },
  });
};

export const validateApiKey = (): boolean => {
  return !!process.env.API_KEY;
};