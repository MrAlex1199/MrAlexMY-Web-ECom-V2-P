# Use a lean Node.js base image for development.
# 'alpine' images are small and efficient.
# node:18-alpine is a good choice, as your logs show Node.js v18.20.8.

# Choose the base image based on your development environment:
# If you are on an Intel/AMD (x86_64) machine:
FROM node:18-alpine

# If you are on an Apple Silicon (M1/M2/M3) or other ARM64 machine,
# and you want to ensure the image is built specifically for ARM64 Linux:
# FROM --platform=linux/arm64 node:18-alpine
# (Though Docker Desktop on ARM often handles this automatically with `node:18-alpine`)


# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) first.
# This helps Docker optimize builds by caching the npm install step.
# If these files don't change, Docker can reuse the layer, speeding up subsequent builds.
COPY package*.json ./

# Install project dependencies.
# For native modules like bcrypt, this step is CRUCIAL as it compiles them
# for the *container's* environment.
# On Alpine-based images, you might need to install build tools (`python3`, `make`, `g++`)
# if your native modules require them and they are not included in the base Node.js image.
# node:alpine images often come with basic build essentials, but it's good to be explicit.
RUN apk add --no-cache python3 make g++

RUN npm install

# Copy the rest of your application source code into the container
COPY . .

# Expose the port your Node.js backend server listens on.
# Your docker-compose.yml indicates 3001.
EXPOSE 3001

# Command to run your application in development mode.
# Based on your logs, you're using `npm run dev` which then runs `nodemon`.
CMD ["npm", "run", "dev"]