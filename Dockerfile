
# Use the official Node.js image.
FROM node:20-slim

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
COPY package*.json ./

# Install dependencies.
RUN npm install

# Copy the local code to the container image.
COPY . .

# Build the TypeScript code.
RUN npm run build

# Expose the port the app runs on.
# ADK Web usually runs on 8000 by default, but Cloud Run expects $PORT.
# We will map $PORT to the adk web port or configure adk web to listen on $PORT if possible.
# For simplicity with `adk web`, we can try to use a wrapper or just simple forwarding.
# However, adk web doesn't easily take PORT env var in all versions. 
# Let's assume we use standard `adk web` and try to map it.
# Actually, `adk web` binds to localhost by default? We need 0.0.0.0.
# We will use `npx adk web --host 0.0.0.0 --port 8080 ./dist/index.js` (assuming args support)
# If arguments aren't supported, we might need to check help.

# Let's try to assume we can pass host/port.
ENV PORT=8080
EXPOSE 8080

# Run the web service on container startup.
CMD [ "sh", "-c", "npx adk web --host 0.0.0.0 --port $PORT ./dist/index.js" ]
