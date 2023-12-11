FROM node:alpine
RUN mkdir -p /home/node/app/backend && chown -R node:node /home/node
WORKDIR /home/node/app/backend
COPY package*.json ./
RUN npm install
USER node
COPY --chown=node:node . .
CMD [ "npm", "run dev-start" ]
EXPOSE 3000