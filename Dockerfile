FROM node:18

# Create Directory for the Container
WORKDIR /usr/src/app
# Only copy the package.json file to work directory
COPY package.json .
COPY tsconfig.json .
COPY ./prisma .
# Install all Packages
RUN npm install
# Copy all other source code to work directory
ADD . /usr/src/app
# TypeScript
RUN npx tsc

# Start
CMD [ "npm", "start" ]
EXPOSE 3000