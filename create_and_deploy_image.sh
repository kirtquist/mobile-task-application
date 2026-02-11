#!/bin/bash
set -e  # Exit on error

# Set your GCP project and region
export GCP_PROJECT="edgeshop-2026"
export GCP_REGION="us-west1"
export REPO_NAME="edge-shop"
export IMAGE_NAME="mobile-task"
export REGISTRY="${GCP_REGION}-docker.pkg.dev"
export FULL_IMAGE_PATH="${REGISTRY}/${GCP_PROJECT}/${REPO_NAME}/${IMAGE_NAME}"

echo "Setting GCP project..."
gcloud config set project ${GCP_PROJECT} 2>&1 | grep -v "WARNING" || true

# Set quota project for Application Default Credentials if needed
echo "Setting quota project for Application Default Credentials..."
gcloud auth application-default set-quota-project ${GCP_PROJECT} 2>&1 | grep -v "WARNING" || true

echo "Verifying authentication..."
gcloud auth list

echo "Verifying Artifact Registry repository exists..."
gcloud artifacts repositories describe ${REPO_NAME} \
    --location=${GCP_REGION} \
    --format="value(name)" || {
    echo "Repository not found. Creating it..."
    gcloud artifacts repositories create ${REPO_NAME} \
        --repository-format=docker \
        --location=${GCP_REGION} \
        --description="Mobile Task Application Docker images"
}

echo "Authenticating Docker with Artifact Registry..."
# Use a temporary Docker config directory to avoid credential helper issues
TEMP_DOCKER_DIR=$(mktemp -d)
export DOCKER_CONFIG="${TEMP_DOCKER_DIR}"

# Ensure cleanup on script exit
cleanup() {
    if [ -n "${TEMP_DOCKER_DIR}" ] && [ -d "${TEMP_DOCKER_DIR}" ]; then
        rm -rf "${TEMP_DOCKER_DIR}"
    fi
    unset DOCKER_CONFIG
}
trap cleanup EXIT

# Create a minimal Docker config without credential helpers
mkdir -p "${TEMP_DOCKER_DIR}"
cat > "${TEMP_DOCKER_DIR}/config.json" <<EOF
{
  "auths": {}
}
EOF

# Use direct token authentication (works on Windows/WSL without credential helper)
# Refresh the access token and login to Docker
TOKEN=$(gcloud auth print-access-token)
echo $TOKEN | docker login -u oauth2accesstoken --password-stdin ${REGISTRY}

# Verify authentication worked
if [ $? -ne 0 ]; then
    echo "ERROR: Docker authentication failed. Please check your gcloud credentials."
    echo "Try running: gcloud auth login"
    rm -rf "${TEMP_DOCKER_DIR}"
    exit 1
fi

echo "Docker authentication successful!"
# Keep DOCKER_CONFIG and temp directory for subsequent docker commands (build, push)
# We'll clean up at the end

echo "Building Docker image..."
docker build -t ${FULL_IMAGE_PATH}:latest .

echo "Tagging image with version..."
docker tag ${FULL_IMAGE_PATH}:latest ${FULL_IMAGE_PATH}:v1.0.0

echo "Pushing images to Artifact Registry..."
docker push ${FULL_IMAGE_PATH}:latest
docker push ${FULL_IMAGE_PATH}:v1.0.0

echo "Success! Images pushed to: ${FULL_IMAGE_PATH}"

# Clean up: remove temp Docker config directory and unset DOCKER_CONFIG
rm -rf "${TEMP_DOCKER_DIR}"
unset DOCKER_CONFIG