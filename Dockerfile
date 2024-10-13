# Use a lightweight Node.js runtime as a parent image
FROM node:18-alpine

# Copying the environment file into /src
COPY .env ./src/

# Set the working directory
WORKDIR /src

# Copy the package.json and package-lock.json files
COPY src/package*.json ./

# Install any needed packages specified in package.json
RUN npm install

# Copy the source code into the container
COPY src ./

# Install MySQL client for database connection
RUN apk add --no-cache mysql-client

# Add a non-root user and group
RUN adduser -D nodeuser

# Change ownership of the working directory to the non-root user
RUN chown -R nodeuser /src

# Switch to the non-root user
USER nodeuser

# Expose the application port 
EXPOSE 3000

# Run the application
CMD [ "node", "main.js" ]