FROM node:alpine
WORKDIR /app
RUN npm i -g pnpm
COPY ./*.json ./*.yaml ./
RUN pnpm i -P
COPY ./ ./
RUN pnpm format
RUN pnpm lint
RUN pnpm build
VOLUME /app/logs ./logs
CMD ["pnpm", "start:prod"]
