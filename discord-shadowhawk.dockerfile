FROM mhart/alpine-node:latest

WORKDIR /app
COPY package.json .
RUN yarn install

COPY . .

RUN chmod +x /app/entrypoint.sh
ENTRYPOINT [ "/app/entrypoint.sh" ]