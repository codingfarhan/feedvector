FROM node:22.20-bookworm-slim

ARG NEXT_PUBLIC_VERSION
ENV NEXT_PUBLIC_VERSION=$NEXT_PUBLIC_VERSION
ENV NODE_ENV=production

RUN apt-get update && apt-get install -y --no-install-recommends \
    g++ \
    make \
    python3-pip \
 && rm -rf /var/lib/apt/lists/*

RUN npm --no-update-notifier --no-fund --global install pnpm@10.6.1

WORKDIR /app

COPY . /app

RUN pnpm install
RUN NODE_OPTIONS="--max-old-space-size=4096" pnpm run build

CMD ["pnpm", "run", "start"]
