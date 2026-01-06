import {
  BaseAgent,
  Event,
  InvocationContext,
  LlmAgent,
  stringifyContent,
} from "@google/adk";
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

class ComplianceLoopAgent extends BaseAgent {
  constructor() {
    super({
      name: "ComplianceFlow",
    });
  }

  protected async *runAsyncImpl(
    context: InvocationContext
  ): AsyncGenerator<Event, void, void> {
    const maxIterations = 3;

    for (let i = 0; i < maxIterations; i++) {
      // 1. Run Tax Expert
      for await (const event of taxExpert.runAsync(context)) {
        yield event;
      }

      // 2. Run Auditor
      let auditorResponse = "";
      for await (const event of auditor.runAsync(context)) {
        yield event;
        auditorResponse += stringifyContent(event);
      }

      // 3. Check termination
      if (auditorResponse.includes("TERMINATE")) {
        return;
      }
    }
  }

  // Live mode implementation (delegates to async for now or simplified)
  protected async *runLiveImpl(
    context: InvocationContext
  ): AsyncGenerator<Event, void, void> {
    yield* this.runAsyncImpl(context);
  }
}

export const complianceFlow = new ComplianceLoopAgent();
