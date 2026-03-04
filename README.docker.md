# Docker Build and Publish Guide

This repository includes a simple publish script and an updated `Dockerfile.dev` for building the full app image.

## What Changed in `Dockerfile.dev`

Key changes:
- Added sensible production defaults:
  - `NODE_ENV=production`
  - `NODE_OPTIONS=--max-old-space-size=4096`
  - `NEXT_TELEMETRY_DISABLED=1`
- Build runs the full workspace build.

## Publish Script

The script is located at:
- `var/docker/docker-publish.sh`

It builds an image using a Dockerfile and pushes it to a registry.

Required env var:
- `REGISTRY` (e.g. `docker.io/youruser` or `ghcr.io/youruser`)

Fixed image name:
- `feedvector` (hardcoded in the script)

Optional env vars:
- `TAG` (default: `latest`)
- `DOCKERFILE` (default: `Dockerfile.dev`)

## Examples

Build and publish the image:
```bash
REGISTRY=docker.io/youruser TAG=latest ./var/docker/docker-publish.sh
```
