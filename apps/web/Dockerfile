FROM node:22-bookworm-slim AS builder

WORKDIR /app

COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/web/package*.json ./apps/web/

RUN npm install --workspace=@videodrop/shared --workspace=@videodrop/web

COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

RUN npm run build:shared
RUN npm run build:web

FROM node:22-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder /app/packages ./packages

EXPOSE 3000

CMD ["npm", "run", "start", "--workspace=@videodrop/web"]
