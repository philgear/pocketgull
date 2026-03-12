#!/bin/bash
# Pocket Gull - Automated Google Cloud Run Deployment Script
# Required for Gemini Live Agent Challenge Infrastructure-as-Code Bonus

set -e

echo "=========================================================="
echo "🚀 Deploying Pocket Gull to Google Cloud Run"
echo "=========================================================="

# 1. Ensure gcloud is initialized and authenticated
# gcloud auth login
# gcloud config set project YOUR_PROJECT_ID

# Automatically grab the current project
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
    echo "ERROR: Please run 'gcloud auth login' and 'gcloud config set project YOUR_PROJECT_ID' first."
    exit 1
fi

SERVICE_NAME="pocket-gull"
REGION="us-west1"
IMAGE_TAG="gcr.io/$PROJECT_ID/$SERVICE_NAME:latest"

echo "📦 1/3: Building the image for Cloud Run using Dockerfile..."
# Assuming Google Cloud Build is enabled for the project
gcloud builds submit --tag $IMAGE_TAG

echo "🌐 2/3: Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_TAG \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --memory 1Gi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 5 \
    --set-secrets=GEMINI_API_KEY=GEMINI_API_KEY:latest

echo "✅ 3/3: Deployment Complete!"
echo "Your live agent is now running on Google Cloud."
echo "=========================================================="
