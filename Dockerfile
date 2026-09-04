# Render 배포용 Dockerfile (공부의 숲 BE, 포트 30000)
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Prisma 클라이언트 생성
RUN npx prisma generate

EXPOSE 30000

CMD ["sh", "-c", "npm run prisma:migrate && node --env-file=./env/.env.production ./src/server.js"]