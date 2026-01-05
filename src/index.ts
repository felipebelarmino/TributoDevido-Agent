import { dispatcher } from "./agents/dispatcher.js";

// Export the root agent for ADK CLI/Runner
export default dispatcher;

// Optional: Simple self-run if executed directly (e.g. via ts-node)
if (require.main === module) {
  console.log('Agent loaded. Use "adk run" or "adk web" to interact.');
}
