# Use the official Node.js image from Docker Hub with Node.js version 22 and Alpine Linux
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json for dependency installation
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Expose port 8000
EXPOSE 8000

# Define health check command
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD npm run healthcheck || exit 1

# Run the application
CMD ["npm", "start"]

