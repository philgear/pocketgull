#!/bin/bash
set -e

echo "=== PocketGull API Deployment Script ==="
echo ""

# Default variables
REGION="us-central1"
SERVICE_NAME="pocketgull-api"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null
then
    echo "Error: gcloud CLI could not be found. Please install the Google Cloud SDK."
    exit 1
fi

# Prompt for Project ID
read -p "Enter your Google Cloud Project ID: " PROJECT_ID

if [ -z "$PROJECT_ID" ]
then
    echo "Error: Project ID is required."
    exit 1
fi

echo ""
echo "Building Docker image in Cloud Build..."
IMAGE_URI="gcr.io/$PROJECT_ID/$SERVICE_NAME"
gcloud builds submit --tag $IMAGE_URI --project $PROJECT_ID

echo ""
echo "Deploying to Cloud Run..."
# Note: We enforce --no-allow-unauthenticated because Apigee should be the only public entry point
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_URI \
    --platform managed \
    --region $REGION \
    --project $PROJECT_ID \
    --no-allow-unauthenticated \
    --set-env-vars NODE_ENV=production \
    --cpu 1 \
    --memory 1Gi \
    --min-instances 0 \
    --max-instances 2 \
    --update-labels env=production,team=clinical-squad,component=scoring-api

echo ""
echo "Deployment Complete!"
echo "Next step: Ensure the Apigee Gateway Service Account has the 'Cloud Run Invoker' role for this service."
