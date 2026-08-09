import OpenAI from "openai";

export const azureOpenai = new OpenAI({
  baseURL: process.env.AZURE_OPENAI_API_BASE_URL!,
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
});

export const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o";
