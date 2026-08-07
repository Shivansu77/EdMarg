FROM node:22-alpine

WORKDIR /app

# ffmpeg is required by fluent-ffmpeg for video compression (recording pipeline)
RUN apk add --no-cache ffmpeg

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build && npm prune --omit=dev

EXPOSE 5000

CMD ["npm", "start"]
