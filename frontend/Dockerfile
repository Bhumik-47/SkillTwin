FROM node:20-alpine AS runner

WORKDIR /app

# Set node environment
ENV NODE_ENV=development
ENV NEXT_PUBLIC_API_URL=http://localhost:8000

# Install dependencies
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install

# Copy frontend source
COPY frontend/ ./

EXPOSE 3000

CMD ["npm", "run", "dev"]
