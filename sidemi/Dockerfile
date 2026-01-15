FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Install dependencies (using --legacy-peer-deps if needed, or just npm install)
RUN npm install

COPY . .

# Build argument for API URL
ARG NEXT_PUBLIC_API_URL=http://localhost:5000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build the Next.js application
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
