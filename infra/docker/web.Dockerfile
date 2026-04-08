FROM node:20-alpine

WORKDIR /workspace

RUN corepack enable

COPY package.json pnpm-workspace.yaml turbo.json tsconfig.base.json /workspace/
COPY apps/web/package.json /workspace/apps/web/package.json
COPY packages/shared-types/package.json /workspace/packages/shared-types/package.json
COPY packages/ui/package.json /workspace/packages/ui/package.json
COPY packages/prompts/package.json /workspace/packages/prompts/package.json

RUN pnpm install

COPY . /workspace

CMD ["pnpm", "--filter", "@onlook/web", "dev", "--hostname", "0.0.0.0", "--port", "3000"]

