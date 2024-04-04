FROM node:20.10.0

# work directory
WORKDIR /src/app



# initial dependencies
COPY package*.json ./

# Build the app
RUN npm install

# Copy alll files
COPY . .

# Run the app
CMD ["npm","start"]

# Set environment variable
ENV PORT=3000
ENV CONNECTION_URL_LOCAL="mongodb://localhost:27017/route-nodejs-eng-amira-backend-e-commerce-project-development"
