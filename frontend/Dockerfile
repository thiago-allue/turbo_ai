# Frontend Dockerfile
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Build for production
RUN npm run build

# Expose the frontend port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
