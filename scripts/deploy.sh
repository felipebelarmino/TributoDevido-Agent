#!/bin/bash
set -e

# Configuration
SERVICE_NAME="tributo-devido-agent-hml"
REGION="us-central1"

# Load .env variables if present
if [ -f .env ]; then
  export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
else
  echo ".env file not found. Assuming variables are set in environment (CI/CD)."
fi

echo "--- Deploying to Cloud Run ($SERVICE_NAME) ---"

# 1. Build the image using Cloud Build (bypasses local Docker and service account issues)
IMAGE_URL="gcr.io/$GOOGLE_CLOUD_PROJECT/$SERVICE_NAME"
echo "Building container image: $IMAGE_URL"
gcloud builds submit --tag $IMAGE_URL .

# 2. Deploy the built image to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_URL \
  --region $REGION \
  --port 8080 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_CLOUD_PROJECT=$GOOGLE_CLOUD_PROJECT \
  --set-env-vars GOOGLE_CLOUD_LOCATION=$GOOGLE_CLOUD_LOCATION \
  --set-env-vars VERTEX_SEARCH_DATA_STORE_ID=$VERTEX_SEARCH_DATA_STORE_ID \
  --set-env-vars GOOGLE_GENAI_API_KEY=$GOOGLE_GENAI_API_KEY \
  --quiet

echo "--- Deployment Complete ---"
