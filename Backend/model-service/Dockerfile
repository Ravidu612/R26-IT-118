FROM node:20-alpine

WORKDIR /app/Backend/model-service

COPY Backend/model-service/package*.json ./
RUN npm install

COPY Backend/shared /app/Backend/shared
COPY Backend/model-service /app/Backend/model-service

EXPOSE 5002
CMD ["npm", "run", "dev"]
