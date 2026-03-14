# Stage 1: Build the React frontend
FROM node:24-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Serve the app with the Node backend
FROM node:24-alpine
WORKDIR /app/backend

# Copy backend dependencies
COPY backend/package*.json ./
RUN npm install --production

# Copy backend source code
COPY backend/ ./

# Copy built frontend assets from the previous stage
# The backend expects frontend assets at ../frontend/dist
COPY --from=frontend-build /app/frontend/dist ../frontend/dist


# Set default environment variables
ENV NODE_ENV=production
# ENV PORT=5001


# Start the server (and run migrations if needed)
# It's a good practice to run migrations before starting the server in a simple setup
# CMD ["sh", "-c", "node migration.js && node server.js"]
CMD ["sh", "-c", "node server.js"]
