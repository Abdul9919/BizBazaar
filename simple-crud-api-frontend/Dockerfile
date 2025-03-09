# Use official Node.js image as base
FROM node:18-alpine 

# Set working directory inside the container
WORKDIR /app 

# Copy package.json and package-lock.json first (to take advantage of Docker layer caching)
COPY package*.json ./ 

# Install dependencies
RUN npm install --legacy-peer-deps  

# Copy rest of the frontend code
COPY . .

# Expose port (adjust if your frontend uses a different port)
EXPOSE 3000  

# Start the frontend application
CMD ["npm", "start"]
