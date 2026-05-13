FROM node:23-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 5173

# --host diperlukan supaya Vite boleh diakses dari luar container
CMD ["npm", "run", "dev", "--", "--host"]