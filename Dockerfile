
FROM node:20-alpine


WORKDIR /app


COPY package*.json ./
COPY tsconfig*.json ./

COPY wait-for /wait-for
RUN chmod +x /wait-for

RUN npm install


COPY . .

RUN npx prisma generate

RUN npm run build


EXPOSE 3333


CMD ["node", "dist/main"]
