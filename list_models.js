const https = require("https");
const fs = require("fs");
const path = require("path");

// Read .env manually since dotenv might not be available in this scope or I want to be sure
const envPath = path.resolve(__dirname, ".env");
let apiKey = "";

try {
  const envConfig = fs.readFileSync(envPath, "utf8");
  for (const line of envConfig.split("\n")) {
    if (line.startsWith("GOOGLE_GENAI_API_KEY=")) {
      apiKey = line.split("=")[1].trim();
      break;
    }
  }
} catch (e) {
  console.error("Error reading .env", e);
  process.exit(1);
}

if (!apiKey) {
  console.error("GOOGLE_GENAI_API_KEY not found in .env");
  process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https
  .get(url, (res) => {
    let data = "";
    res.on("data", (chunk) => (data += chunk));
    res.on("end", () => {
      if (res.statusCode !== 200) {
        console.error(
          `API Request Failed: ${res.statusCode} ${res.statusMessage}`
        );
        console.error(data);
        return;
      }
      const models = JSON.parse(data).models;
      console.log("--- Available Models ---");
      models.forEach((m) => {
        if (m.name.includes("gemini")) {
          console.log(m.name.replace("models/", ""));
        }
      });
    });
  })
  .on("error", (err) => {
    console.error("Error: ", err.message);
  });
