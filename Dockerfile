FROM node:12.13-alpine

WORKDIR /app
ADD package.json /app/package.json
RUN npm config set registry http://registry.npmjs.org
RUN npm install
ADD . /app

CMD ["npm", "run", "start"]