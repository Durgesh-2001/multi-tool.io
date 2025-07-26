# Use official Node.js LTS image
FROM node:20

# Set working directory
WORKDIR /app

# Install ffmpeg and yt-dlp
RUN apt-get update && apt-get install -y ffmpeg wget \
    && wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp \
    && chmod +x /usr/local/bin/yt-dlp

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the backend code
COPY . .

# Expose the port (change if your app uses a different port)
EXPOSE 5000

# Start the server
CMD ["node", "server.js"] 