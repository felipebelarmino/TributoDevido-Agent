/**
 * Guardrails Module - Input/Output Validation for Agent Safety
 *
 * MINIMAL APPROACH: Only blocks:
 * 1. Prompt injection/jailbreak attempts
 * 2. Explicit profanity/offensive language
 *
 * Off-topic handling is delegated to the LLM agent (via prompt instructions)
 */

// ============================================
// BLOCKED INPUT PATTERNS (Jailbreak Detection)
// ============================================
const JAILBREAK_PATTERNS: RegExp[] = [
  /ignore (previous|all|your|the) instructions/i,
  /ignor(e|ar) (suas|as|todas) instruções/i,
  /you are now/i,
  /você (agora é|é agora)/i,
  /pretend (to be|you're|you are)/i,
  /finja (ser|que é)/i,
  /act as (a|an|the)/i,
  /atue como (um|uma|o|a)/i,
  /jailbreak/i,
  /bypass (your|the|all)/i,
  /burlar (suas|as) regras/i,
  /esqueça (tudo|suas regras|o que)/i,
  /forget (everything|your rules|all)/i,
  /new persona/i,
  /DAN mode/i,
  /developer mode/i,
  /admin mode/i,
  /override (your|the|all)/i,
  /disregard (your|the|all|previous)/i,
  /ignore your programming/i,
  /ignore seu programação/i,
];

// ============================================
// PROFANITY BLOCKLIST (Word-boundary matching)
// Uses regex patterns to avoid false positives like "reCUPERAR"
// ============================================
const PROFANITY_PATTERNS: RegExp[] = [
  /\bporra\b/i,
  /\bcaralho\b/i,
  /\bmerda\b/i,
  /\bfoda\b/i,
  /\bfodase\b/i,
  /\bfoder\b/i,
  /\bpqp\b/i,
  /\bbuceta\b/i,
  /\bcu\b/i,
  /\bviado\b/i,
  /\bputa\b/i,
  /\barrombado\b/i,
  /\bcuzão\b/i,
  /\bfilho da puta\b/i,
  /\bfdp\b/i,
  /\bvsf\b/i,
  /\btnc\b/i,
  /\bvtnc\b/i,
  /\bcacete\b/i,
  /\bporra\b/i,
];

// ============================================
// BLOCKED RESPONSE MESSAGES
// ============================================
export const BLOCKED_RESPONSE_JAILBREAK =
  "Não posso processar essa solicitação. Sou um consultor tributário especializado. Como posso ajudá-lo com questões fiscais?";

export const BLOCKED_RESPONSE_OFFENSIVE =
  "Prefiro manter nossa conversa profissional e respeitosa. Como posso ajudá-lo com questões tributárias?";

// ============================================
// INPUT VALIDATION
// ============================================
export interface ValidationResult {
  valid: boolean;
  reason?: string;
  blockedResponse?: string;
}

export function validateInput(userMessage: string): ValidationResult {
  // 1. Check for jailbreak attempts
  for (const pattern of JAILBREAK_PATTERNS) {
    if (pattern.test(userMessage)) {
      return {
        valid: false,
        reason: "jailbreak_attempt",
        blockedResponse: BLOCKED_RESPONSE_JAILBREAK,
      };
    }
  }

  // 2. Check for profanity (using word boundaries)
  for (const pattern of PROFANITY_PATTERNS) {
    if (pattern.test(userMessage)) {
      return {
        valid: false,
        reason: "profanity",
        blockedResponse: BLOCKED_RESPONSE_OFFENSIVE,
      };
    }
  }

  // 3. Let the model handle everything else (off-topic, greetings, etc.)
  return { valid: true };
}

// ============================================
// OUTPUT VALIDATION
// ============================================
export function validateOutput(response: string): ValidationResult {
  // Check if output contains profanity (safety net)
  for (const pattern of PROFANITY_PATTERNS) {
    if (pattern.test(response)) {
      return {
        valid: false,
        reason: "output_profanity",
        blockedResponse: "[Resposta removida por conteúdo inadequado]",
      };
    }
  }

  return { valid: true };
}

// ============================================
// UTILITY: Extract user message from request
// ============================================
export function extractUserMessage(contents: any[]): string {
  if (!contents || contents.length === 0) return "";

  const lastContent = contents[contents.length - 1];
  if (lastContent.role === "user" && lastContent.parts) {
    return lastContent.parts
      .filter((p: any) => typeof p.text === "string")
      .map((p: any) => p.text)
      .join(" ");
  }
  return "";
}
