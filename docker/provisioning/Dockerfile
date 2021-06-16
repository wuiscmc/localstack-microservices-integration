ARG NODE_BASE_IMAGE_TAG=3.11
ARG NODE_VERSION=16

FROM node:${NODE_VERSION}-alpine${NODE_BASE_IMAGE_TAG}

WORKDIR /app

COPY package.json package-lock.json index.js ./

RUN npm install

CMD ["npm", "run", "start"]
