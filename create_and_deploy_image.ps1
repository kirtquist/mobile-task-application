# PowerShell script to build and push Docker image to Google Cloud Artifact Registry
# Run this script in PowerShell (not WSL)

param(
    [string]$GCP_PROJECT = "edgeshop-2026",
    [string]$GCP_REGION = "us-west1",
    [string]$REPO_NAME = "edge-shop",
    [string]$IMAGE_NAME = "mobile-task",
    [string]$VERSION = "latest"
)

$ErrorActionPreference = "Stop"

# Set variables
$REGISTRY = "${GCP_REGION}-docker.pkg.dev"
$FULL_IMAGE_PATH = "${REGISTRY}/${GCP_PROJECT}/${REPO_NAME}/${IMAGE_NAME}"

Write-Host "Setting GCP project..." -ForegroundColor Cyan
gcloud config set project $GCP_PROJECT 2>&1 | Out-Null

Write-Host "Setting quota project for Application Default Credentials..." -ForegroundColor Cyan
gcloud auth application-default set-quota-project $GCP_PROJECT 2>&1 | Out-Null

Write-Host "Verifying authentication..." -ForegroundColor Cyan
gcloud auth list

Write-Host "Verifying Artifact Registry repository exists..." -ForegroundColor Cyan
$repoExists = gcloud artifacts repositories describe $REPO_NAME `
    --location=$GCP_REGION `
    --format="value(name)" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "Repository not found. Creating it..." -ForegroundColor Yellow
    gcloud artifacts repositories create $REPO_NAME `
        --repository-format=docker `
        --location=$GCP_REGION `
        --description="Mobile Task Application Docker images"
}

Write-Host "Authenticating Docker with Artifact Registry..." -ForegroundColor Cyan
# Configure Docker to use gcloud credential helper
gcloud auth configure-docker $REGISTRY --quiet

# Get access token and authenticate Docker
$token = gcloud auth print-access-token
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to get access token. Please run: gcloud auth login" -ForegroundColor Red
    exit 1
}

# Login to Docker using the token
$token | docker login -u oauth2accesstoken --password-stdin $REGISTRY
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker authentication failed." -ForegroundColor Red
    Write-Host "Try running: gcloud auth login" -ForegroundColor Yellow
    exit 1
}

Write-Host "Docker authentication successful!" -ForegroundColor Green

Write-Host "Building Docker image..." -ForegroundColor Cyan
docker build -t "${FULL_IMAGE_PATH}:${VERSION}" .
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker build failed." -ForegroundColor Red
    exit 1
}

# Tag with version if not already latest
if ($VERSION -ne "latest") {
    Write-Host "Tagging image with version..." -ForegroundColor Cyan
    docker tag "${FULL_IMAGE_PATH}:${VERSION}" "${FULL_IMAGE_PATH}:latest"
}

# Also tag with v1.0.0 for versioning
Write-Host "Tagging image with v1.0.0..." -ForegroundColor Cyan
docker tag "${FULL_IMAGE_PATH}:${VERSION}" "${FULL_IMAGE_PATH}:v1.0.0"

Write-Host "Pushing images to Artifact Registry..." -ForegroundColor Cyan
docker push "${FULL_IMAGE_PATH}:${VERSION}"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to push image." -ForegroundColor Red
    exit 1
}

if ($VERSION -ne "latest") {
    docker push "${FULL_IMAGE_PATH}:latest"
}

docker push "${FULL_IMAGE_PATH}:v1.0.0"

Write-Host "Success! Images pushed to: ${FULL_IMAGE_PATH}" -ForegroundColor Green
Write-Host "  - ${FULL_IMAGE_PATH}:${VERSION}" -ForegroundColor Gray
Write-Host "  - ${FULL_IMAGE_PATH}:v1.0.0" -ForegroundColor Gray
if ($VERSION -ne "latest") {
    Write-Host "  - ${FULL_IMAGE_PATH}:latest" -ForegroundColor Gray
}
