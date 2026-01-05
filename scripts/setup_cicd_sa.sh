#!/bin/bash

# Configuration
SA_NAME="github-actions-sa"
PROJECT_ID="td-multi-agent-faq-1"
DESCRIPTION="Service Account for GitHub Actions CI/CD"

echo "--- Setting up Service Account for GitHub Actions ---"

# 1. Create Service Account
if gcloud iam service-accounts describe $SA_NAME@$PROJECT_ID.iam.gserviceaccount.com > /dev/null 2>&1; then
    echo "Service Account $SA_NAME already exists."
else
    echo "Creating Service Account..."
    gcloud iam service-accounts create $SA_NAME \
        --display-name "$DESCRIPTION" \
        --project $PROJECT_ID
fi

SA_EMAIL="$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com"
echo "Service Account Email: $SA_EMAIL"

# 2. Assign Roles
echo "Assigning IAM Roles..."
ROLES=(
    "roles/run.admin"                # Deploy to Cloud Run
    "roles/iam.serviceAccountUser"   # Act as service account
    "roles/cloudbuild.builds.editor" # Submit builds
    "roles/storage.admin"            # Upload source/images to GCS/GCR
    "roles/artifactregistry.writer"  # Push images
    "roles/serviceusage.serviceUsageConsumer" # Check API status
)

for role in "${ROLES[@]}"; do
    echo "Adding role: $role"
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:$SA_EMAIL" \
        --role="$role" \
        --condition=None \
        --quiet > /dev/null
done

# 3. Generate Key
KEY_FILE="gcp-sa-key.json"
if [ -f "$KEY_FILE" ]; then
    echo "Key file $KEY_FILE already exists. Skipping generation."
else
    echo "Generating JSON Key..."
    gcloud iam service-accounts keys create $KEY_FILE \
        --iam-account=$SA_EMAIL \
        --project $PROJECT_ID
fi

echo "--- Setup Complete ---"
echo "Your JSON key is saved to: $KEY_FILE"
echo "IMPORTANT: Copy the content of this file to your GitHub Secret: GCP_CREDENTIALS"
echo "Then DELETE the file immediately."
