#!/bin/bash

# Configuration
PROJECT_ID="${GOOGLE_CLOUD_PROJECT:-td-multi-agent-faq-1}"
LOCATION="${GOOGLE_CLOUD_LOCATION:-us-central1}"
DATA_STORE_ID="${VERTEX_SEARCH_DATA_STORE_ID:-tributo-kb-id}"

echo "🚀 Setting up Google Cloud Resources for project: $PROJECT_ID"

# 1. Set Project
gcloud config set project "$PROJECT_ID"

# 2. Enable APIs
echo "🔄 Enabling Discovery Engine API (Vertex AI Agent Builder)..."
gcloud services enable discoveryengine.googleapis.com

# 3. Create Data Store
echo "📦 Creating Data Store..."
echo "ℹ️  The 'gcloud discovery-engine' command is not available in your environment."
echo "👉 Please create the Data Store manually in the Google Cloud Console:"
echo ""
echo "   URL: https://console.cloud.google.com/gen-app-builder/engines?project=$PROJECT_ID"
echo ""
echo "   Steps:"
echo "   1. Click 'Create App'"
echo "   2. Select 'Search'"
echo "   3. Name it: Tributo Knowledge Base"
echo "   4. Set ID as: $DATA_STORE_ID (CRITICAL!)"
echo "   5. Company name: Tributo Devido"
echo "   6. Data location: $LOCATION (or 'global' if suggested)"
echo "   7. Continue and select 'Cloud Storage' (you can leave it empty for now and click Create)"
echo "" 
echo "🎉 Once created, you are ready to run 'npm start'!"
