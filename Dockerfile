# Gunakan Node.js versi LTS
FROM node:22

# Set working directory
WORKDIR /usr/src/app

# Copy package.json dan package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy semua source code
COPY . .

# Expose port
EXPOSE 3000

# Command untuk menjalankan app
CMD ["npm", "run", "start:dev"]
