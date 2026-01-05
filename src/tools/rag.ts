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

// Helper to parse Protobuf Struct
function extractValue(val: any): any {
  if (val.stringValue !== undefined) return val.stringValue;
  if (val.structValue) return parseStruct(val.structValue);
  if (val.listValue) return (val.listValue.values || []).map(extractValue);
  return null;
}

function parseStruct(struct: any): any {
  const result: any = {};
  if (!struct.fields) return result;
  for (const key in struct.fields) {
    result[key] = extractValue(struct.fields[key]);
  }
  return result;
}

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
        extractiveContentSpec: { maxExtractiveAnswerCount: 1 },
      },
    };

    const response = await client.search(request);
    const results = response[0];

    if (!results || results.length === 0) return "No results found.";

    return results
      .map((result) => {
        let doc = (result.document?.structData ||
          result.document?.derivedStructData ||
          {}) as any;

        // Auto-parse if it looks like a Protobuf Struct
        if (doc.fields) {
          doc = parseStruct(doc);
        }

        let rawTitle = doc.title || doc.name || doc.link || "Unknown Source";

        // Cleanup title: remove timestamp prefix, file extension, and format
        // Example: 1767636013307_manual_simples_nacional -> Manual Simples Nacional
        const title = rawTitle
          .replace(/^\d+_/, "") // Remove leading timestamp + underscore
          .replace(/\.[^/.]+$/, "") // Remove file extension
          .replace(/_/g, " ") // Replace underscores with spaces
          .replace(/\b\w/g, (c: string) => c.toUpperCase()); // Title Case

        // Handle different snippet locations/formats
        // Handle different snippet locations/formats - Prioritize Extractive Answers
        let snippet = "";

        if (doc.extractive_answers && doc.extractive_answers.length > 0) {
          snippet = doc.extractive_answers[0].content || "";
        } else if (
          doc.extractive_segments &&
          doc.extractive_segments.length > 0
        ) {
          snippet = doc.extractive_segments[0].content || "";
        } else if (doc.snippets && doc.snippets.length > 0) {
          snippet = doc.snippets[0].snippet || doc.snippets[0].content || "";
        } else if (doc.content) {
          snippet = doc.content;
        }

        return `Source: ${title}\nContent: ${snippet.trim()}`;
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
  }),
  execute: async (input: unknown) => {
    const { query } = input as { query: string };
    return await searchKnowledgeBase(query);
  },
});
