FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --registry=https://registry.npmjs.org/ --omit=dev
COPY . .
ENV PORT=8080
EXPOSE 8080
CMD ["npm", "start"]
