# https://typicode.github.io/husky/#/?id=disable-husky-in-cidockerprod
# For disabling husky in docker

# Node base image
FROM node:latest

# Create a directory for app
RUN mkdir -p /usr/src/app

# Set newly created directory as current working directory
WORKDIR /usr/src/app

# Copy package*.json file
COPY package*.json /usr/src/app/

# Install packages
RUN npm install

# Copy source code into container
COPY . /usr/src/app/

# Expose server port
EXPOSE 3000

# Command to run within container
CMD ["node", "server.js"]
