FROM node:alpine
WORKDIR /app
RUN npm i -g pnpm
COPY ./*.json ./*.yaml ./
RUN pnpm i
COPY ./ ./
RUN pnpm format
RUN pnpm lint
RUN pnpm build
CMD ["pnpm", "start:prod"]
