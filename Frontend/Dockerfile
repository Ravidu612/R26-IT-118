FROM node:20-alpine

WORKDIR /app/Frontend

COPY Frontend/package*.json ./
RUN npm install

COPY Frontend/ ./

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
