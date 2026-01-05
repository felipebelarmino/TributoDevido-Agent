import { LlmAgent, LoopAgent } from "@google/adk";
import { taxExpert } from "./tax_expert.js";

const auditor = new LlmAgent({
  name: "Auditor",
  model: "gemini-2.5-pro",
  instruction: `
    You are a strict Tax Auditor. Your job is to review the draft answer provided by the TaxExpert.
    
    CHECKLIST:
    1. Does it cite a source/law?
    2. does it promise exact values? (IT MUST NOT. It can only estimate).
    3. Does it mention the 5-year prescription period (60 months) if relevant?
    4. Is it factually supported by the context provided?
    
    If REJECTED:
    - Respond with specific feedback on what to fix.
    
    If APPROVED:
    - Respond with exactly "TERMINATE".
  `,
});

export const complianceFlow = new LoopAgent({
  name: "ComplianceFlow",
  subAgents: [taxExpert, auditor],
  maxIterations: 3,
});
