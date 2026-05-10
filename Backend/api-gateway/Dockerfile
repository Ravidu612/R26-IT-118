FROM node:20-alpine

WORKDIR /app/Backend/api-gateway

COPY Backend/api-gateway/package*.json ./
RUN npm install

COPY Backend/shared /app/Backend/shared
COPY Backend/api-gateway /app/Backend/api-gateway

EXPOSE 5000
CMD ["npm", "run", "dev"]
