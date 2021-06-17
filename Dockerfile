ARG NODE_BASE_IMAGE_TAG=3.11
ARG NODE_VERSION=16

##############
### builder ##
##############
# FROM node:${NODE_VERSION}-alpine${NODE_BASE_IMAGE_TAG} AS build-env
# WORKDIR /app
# COPY package.json package-lock.json ./
# RUN mv node_modules node_modules_production


##############
### dev ##
##############
FROM node:${NODE_VERSION}-alpine${NODE_BASE_IMAGE_TAG} AS dev
WORKDIR /app
# COPY --from=build-env /app/node_modules_production/ ./node_modules

COPY .gitignore package.json index.js ./
COPY src/ ./src
RUN npm install --production

CMD ["npm", "run", "start"]

###################
### Test image ####
###################
FROM node:${NODE_VERSION}-alpine${NODE_BASE_IMAGE_TAG} AS test-runner
WORKDIR /app
# COPY --from=build-env /app/node_modules/ ./node_modules

# Add app files
COPY .gitignore package.json index.js ./
RUN npm install

COPY src/ ./src

# Copy test files
COPY tests/ ./tests

CMD ["npm", "run", "test"]
