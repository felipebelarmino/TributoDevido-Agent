import { dispatcher } from "./agents/dispatcher.js";
import { FirestoreSessionService } from "./services/firestore_session_service.js";

console.log("--- Agent Tree Initialization ---");
console.log(`Root Agent: ${dispatcher.name}`);
if (dispatcher.subAgents) {
  console.log(
    `SubAgents: ${dispatcher.subAgents.map((a) => a.name).join(", ")}`
  );
} else {
  console.log("No SubAgents found on Root Agent!");
}
console.log("---------------------------------");

// Export the root agent
export const rootAgent = dispatcher;
export default dispatcher;

// Export session service for custom runners
export { FirestoreSessionService };
