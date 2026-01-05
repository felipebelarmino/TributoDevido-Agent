import "dotenv/config";
import { searchKnowledgeBase } from "./src/tools/rag";

async function main() {
  const query = "Simples Nacional";
  console.log(`🔎 Testing RAG with query: "${query}"...`);

  try {
    const result = await searchKnowledgeBase(query);
    console.log("\n--- RESULT ---");
    console.log(result);
    console.log("--------------\n");
  } catch (err) {
    console.error("Error executing RAG search:", err);
  }
}

main();
