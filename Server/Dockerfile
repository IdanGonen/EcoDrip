#The server will need database connection and environment variables to work properly, but this Dockerfile handles the basic app setup.

# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Start the server
CMD ["npm", "start"]

