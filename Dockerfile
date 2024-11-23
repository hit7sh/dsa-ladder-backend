# Use official Node.js image as a base image
FROM node:16

# Set the working directory inside the container
WORKDIR /usr/src/app

#install c++
RUN apt-get update && apt-get install -y g++

#install python3
RUN apt-get install python3

#install java
RUN apt install default-jdk

# Copy package.json and package-lock.json (if present) to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application files to the working directory
COPY . .

# Expose the port the app will run on (optional, for example if the server runs on port 3000)
EXPOSE 3000

# Command to run your server (adjust this depending on your entry point, e.g. `server.js`)
CMD ["node", "./src/index.js"]
