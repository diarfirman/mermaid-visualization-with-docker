FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY dist/ ./dist/
COPY public/static/ ./public/static/

EXPOSE 3000

CMD ["node", "dist/index.js"]
