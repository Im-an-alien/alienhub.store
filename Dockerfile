# AlienHub.Store — production image. Bundles its own Node 24, so the VM's host
# Node/npm version doesn't matter.
FROM node:24-alpine

WORKDIR /app

# Install dependencies (cached layer)
COPY package.json package-lock.json ./
RUN npm ci

# Build the app
COPY . .
RUN npx prisma generate && npm run build

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
EXPOSE 3000

# On start: apply DB migrations, then run the server.
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
