
FROM node:20-alpine


WORKDIR /app


COPY package*.json ./
COPY tsconfig*.json ./


RUN npm install
RUN npx prisma generate


COPY . .


RUN npm run build


EXPOSE 3333


CMD ["node", "dist/main"]
