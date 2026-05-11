FROM node:20-alpine

WORKDIR /app/Backend/auth-service

COPY Backend/auth-service/package*.json ./
RUN npm install

COPY Backend/shared /app/Backend/shared
COPY Backend/auth-service /app/Backend/auth-service

EXPOSE 5001
CMD ["npm", "run", "dev"]
