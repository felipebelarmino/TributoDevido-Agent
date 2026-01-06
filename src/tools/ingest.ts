import "dotenv/config";
import { DocumentServiceClient } from "@google-cloud/discoveryengine";
import { Storage } from "@google-cloud/storage";
import * as path from "path";
import * as fs from "fs";

// Configuration
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || "td-multi-agent-faq-1";
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";
const DATA_STORE_ID = process.env.VERTEX_SEARCH_DATA_STORE_ID;
// Bucket created automatically with suffix for uniqueness
const BUCKET_NAME = `td-kb-source-829114946536`;

if (!DATA_STORE_ID) {
  console.error(
    "Error: VERTEX_SEARCH_DATA_STORE_ID is not set in environment."
  );
  process.exit(1);
}

const storage = new Storage({ projectId: PROJECT_ID });

const options: any = {};
if (LOCATION !== "global") {
  options.apiEndpoint = `${LOCATION}-discoveryengine.googleapis.com`;
}
const client = new DocumentServiceClient(options);

async function uploadToGCS(filePath: string): Promise<string> {
  const fileName = path.basename(filePath);
  const destination = `knowledge_base/${Date.now()}_${fileName}`;

  console.log(
    `☁️  Uploading '${fileName}' to gs://${BUCKET_NAME}/${destination}...`
  );

  await storage.bucket(BUCKET_NAME).upload(filePath, {
    destination: destination,
  });

  console.log(`✅ Upload complete.`);
  return `gs://${BUCKET_NAME}/${destination}`;
}

async function importToVertexAI(gcsUri: string) {
  console.log(`🧠 Importing ${gcsUri} into Data Store '${DATA_STORE_ID}'...`);

  const parent = client.projectLocationDataStoreBranchPath(
    PROJECT_ID,
    LOCATION,
    DATA_STORE_ID as string,
    "default_branch"
  );

  const request = {
    parent,
    gcsSource: {
      inputUris: [gcsUri],
      dataSchema: "content", // Indicates unstructured content (PDF, HTML)
    },
    reconciliationMode: "INCREMENTAL" as const,
  };

  try {
    const [operation] = await client.importDocuments(request as any);
    console.log(`⏳ Operation started: ${operation.name}`);
    console.log(
      `   This may take a few minutes. Check Vertex AI Console for status.`
    );

    // Optional: wait for operation (can be long running)
    // await operation.promise();
    // console.log("✅ Import completed successfully.");
  } catch (error) {
    console.error("❌ Error importing document:", error);
    process.exit(1);
  }
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.log("Usage: npx ts-node src/tools/ingest.ts <file-path>");
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found at ${filePath}`);
    process.exit(1);
  }

  try {
    const gcsUri = await uploadToGCS(filePath);
    await importToVertexAI(gcsUri);
  } catch (err) {
    console.error("Fatal Error:", err);
  }
}

main();
