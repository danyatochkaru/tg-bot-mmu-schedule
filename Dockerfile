FROM node:alpine
WORKDIR /app
RUN npm i -g pnpm
COPY ./ ./
RUN pnpm i
RUN pnpm format
RUN pnpm lint
RUN pnpm build
CMD ["pnpm", "start:prod"]
