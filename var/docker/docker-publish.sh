#!/bin/bash
set -euo pipefail

REGISTRY=${REGISTRY:-}
IMAGE_NAME=feedvector
TAG=${TAG:-latest}
DOCKERFILE=${DOCKERFILE:-Dockerfile.dev}

if [[ -z "$REGISTRY" ]]; then
  echo "REGISTRY is required (e.g. docker.io/youruser or ghcr.io/youruser)" >&2
  exit 1
fi

FULL_IMAGE="$REGISTRY/$IMAGE_NAME:$TAG"

echo "Building $FULL_IMAGE using $DOCKERFILE"
docker build --platform linux/amd64 -f "$DOCKERFILE" -t "$FULL_IMAGE" .

echo "Pushing $FULL_IMAGE"
docker push "$FULL_IMAGE"

echo "Done: $FULL_IMAGE"
