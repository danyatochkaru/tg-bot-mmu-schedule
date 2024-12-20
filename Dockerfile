FROM node:20.5.1-alpine
WORKDIR /app
RUN apk add --no-cache alpine-conf && \
    setup-timezone -z Europe/Moscow
RUN npm i -g pnpm
COPY ./*.json ./*.yaml ./
RUN pnpm i
COPY ./ ./
RUN pnpm format
RUN pnpm lint
RUN pnpm build
VOLUME /app/logs ./logs
CMD ["pnpm", "start:prod"]
