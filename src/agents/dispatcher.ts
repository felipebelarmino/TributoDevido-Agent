import { LlmAgent } from "@google/adk";
import { complianceFlow } from "./compliance.js";
import { salesAgent } from "./sales.js";
import {
  GEMINI_SAFETY_SETTINGS,
  geminiJudgeCallback,
} from "../guardrails/guardrails.js";

export const dispatcher = new LlmAgent({
  name: "Dispatcher",
  model: "gemini-2.5-flash",
  instruction: `
    You are the main receptionist for Tributo Devido, a tax consulting firm.
    Analyze the user's input to decide the best course of action.
    
    ROUTING RULES:
    - If the user has a specific TAX QUESTION (e.g., "can I recover PIS?", "what is the law?"), delegate to 'ComplianceFlow'.
    - If the user wants to HIRE, asking about PRICES, or simply saying "hello" to start a business conversation, delegate to 'SalesAgent'.
    - If the request is OFF-TOPIC (jokes, recipes, personal advice, non-tax topics), politely decline and redirect to tax consulting.
    
    GUIDELINES:
    - Be professional and helpful
    - Keep responses concise
    - Always redirect off-topic requests back to tax consulting
  `,
  subAgents: [complianceFlow, salesAgent],

  // GEMINI BUILT-IN SAFETY FILTERS
  generateContentConfig: {
    safetySettings: GEMINI_SAFETY_SETTINGS,
  },

  // GEMINI AS A JUDGE - Input screening via Flash Lite
  beforeModelCallback: geminiJudgeCallback,
});
