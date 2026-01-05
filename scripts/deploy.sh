#!/bin/bash

# Configuration
SERVICE_NAME="tributo-devido-agent-hml"
REGION="us-central1"

# Load .env variables
if [ -f .env ]; then
  export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
else
  echo "Error: .env file not found!"
  exit 1
fi

echo "--- Deploying to Cloud Run ($SERVICE_NAME) ---"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "gcloud could not be found. Please install Google Cloud SDK."
    exit 1
fi

# Deploy
gcloud run deploy $SERVICE_NAME \
  --source . \
  --region $REGION \
  --port 8080 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_CLOUD_PROJECT=$GOOGLE_CLOUD_PROJECT \
  --set-env-vars GOOGLE_CLOUD_LOCATION=$GOOGLE_CLOUD_LOCATION \
  --set-env-vars VERTEX_SEARCH_DATA_STORE_ID=$VERTEX_SEARCH_DATA_STORE_ID \
  --set-env-vars GOOGLE_GENAI_API_KEY=$GOOGLE_GENAI_API_KEY \
  --quiet

echo "--- Deployment Complete ---"
echo "Share the URL above with your testers."
