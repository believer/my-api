FROM node:0.12
ADD . /app
WORKDIR /app
RUN rm -rf node_modules
RUN npm install --production
RUN node -v
ENV PORT 3000
EXPOSE 3000
CMD ["node", "server.js"]