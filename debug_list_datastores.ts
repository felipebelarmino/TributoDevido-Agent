import "dotenv/config";
import { DocumentServiceClient } from "@google-cloud/discoveryengine";

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || "td-multi-agent-faq-1";
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";

const client = new DocumentServiceClient({
  apiEndpoint: `${LOCATION}-discoveryengine.googleapis.com`,
});

async function main() {
  console.log(
    `Listing Data Stores for Project: ${PROJECT_ID}, Location: ${LOCATION}`
  );
  const parent = `projects/${PROJECT_ID}/locations/${LOCATION}/collections/default_collection`;

  try {
    const response = await client.listDataStores({ parent });
    console.log("Found Data Stores:");
    response[0].forEach((ds) => {
      console.log(`- Display Name: ${ds.displayName}`);
      console.log(`  Name (Full Path): ${ds.name}`);
      console.log(`  ID: ${ds.name?.split("/").pop()}`);
    });
  } catch (err) {
    console.error("Error listing data stores:", err);
  }
}

main();
