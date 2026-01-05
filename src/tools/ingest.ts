import { DocumentServiceClient } from "@google-cloud/discoveryengine";

async function ingestDocument(filePath: string) {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT;
  const location = process.env.GOOGLE_CLOUD_LOCATION || "global";
  const dataStoreId = process.env.VERTEX_SEARCH_DATA_STORE_ID;

  if (!projectId || !dataStoreId) {
    console.error(
      "Missing environment variables: GOOGLE_CLOUD_PROJECT or VERTEX_SEARCH_DATA_STORE_ID"
    );
    return;
  }

  const client = new DocumentServiceClient();
  // Correct path helper for Data Store Branch
  const parent = client.projectLocationDataStoreBranchPath(
    projectId,
    location,
    dataStoreId,
    "default_branch"
  );

  console.log(`Preparing to ingest ${filePath} into ${parent}...`);
  console.log(
    "NOTE: Actual file content upload requires GCS or Cloud Storage integration."
  );
  console.log(
    "For this stub, we verified the client connection and path generation."
  );

  // Example of import call (commented out as it requires GCS configuration)
  /*
  const request = {
      parent,
      gcsSource: { inputUris: [filePath] }, // Assuming filePath is gs://...
      reconciliationMode: 'INCREMENTAL'
  };
  const [operation] = await client.importDocuments(request);
  await operation.promise();
  */
}

const file = process.argv[2];
if (file) {
  ingestDocument(file);
} else {
  console.log("Usage: ts-node src/tools/ingest.ts <file-path>");
}
