import { LlmAgent } from "@google/adk";
import { complianceFlow } from "./compliance.js";
import { salesAgent } from "./sales.js";

export const dispatcher = new LlmAgent({
  name: "Dispatcher",
  model: "gemini-1.5-flash",
  instruction: `
    You are the main receptionist for Tributo Devido.
    Analyze the user's input to decide the best course of action.
    
    ROUTING RULES:
    - If the user has a specific TAX QUESTION (e.g., "can I recover PIS?", "what is the law?"), delegate to 'ComplianceFlow'.
    - If the user wants to HIRE, asking about PRICES, or simply saying "hello" to start a business conversation, delegate to 'SalesAgent'.
    - If irrelevant, answer politely yourself.
  `,
  subAgents: [complianceFlow, salesAgent],
});
