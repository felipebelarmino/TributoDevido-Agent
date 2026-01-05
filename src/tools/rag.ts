import { FunctionTool } from "@google/adk";
import { SearchServiceClient } from "@google-cloud/discoveryengine";
import { z } from "zod";

const project = process.env.GOOGLE_CLOUD_PROJECT || "";
const location = process.env.GOOGLE_CLOUD_LOCATION || "global";
const dataStore = process.env.VERTEX_SEARCH_DATA_STORE_ID || "";

const options: any = {};
if (location !== "global") {
  options.apiEndpoint = `${location}-discoveryengine.googleapis.com`;
}
const client = new SearchServiceClient(options);

export async function searchKnowledgeBase(query: string): Promise<string> {
  try {
    const servingConfig = client.projectLocationDataStoreServingConfigPath(
      project,
      location,
      dataStore,
      "default_serving_config"
    );

    const request = {
      servingConfig,
      query,
      pageSize: 5,
      contentSearchSpec: {
        snippetSpec: { returnSnippet: true },
      },
    };

    const response = await client.search(request);
    const results = response[0];

    if (!results || results.length === 0) return "No results found.";

    return results
      .map((result) => {
        const doc = result.document?.derivedStructData as any;
        const snippet = doc?.snippets?.[0]?.snippet || "";
        const title = doc?.title || "Unknown Source";
        return `Source: ${title}\nContent: ${snippet}`;
      })
      .join("\n\n");
  } catch (error) {
    console.error("RAG Search Error:", error);
    return "Error searching knowledge base. Please try again.";
  }
}

export const ragTool = new FunctionTool({
  name: "TributoKnowledgeBase",
  description:
    "Searches the official tax knowledge base (laws, manuals, Q&A). Use this to ground your answers.",
  parameters: z.object({
    query: z
      .string()
      .describe("The search query to find relevant tax information."),
  }) as any,
  execute: async (input: unknown) => {
    const { query } = input as { query: string };
    return await searchKnowledgeBase(query);
  },
});
