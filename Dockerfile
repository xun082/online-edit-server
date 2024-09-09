FROM node:18-alpine as base

RUN npm config set registry https://registry.npmmirror.com/


ENV PNPM_REGISTRY=https://registry.npmmirror.com/
RUN npm i -g pnpm

FROM base As dependencies

WORKDIR /home/infinity/infinity-server
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

FROM base AS build

WORKDIR /home/infinity/infinity-server
COPY . .
COPY --from=dependencies /home/infinity/infinity-server/node_modules ./node_modules
RUN pnpm build
RUN pnpm prune --prod

FROM base AS deploy

WORKDIR /home/infinity/infinity-server
COPY --from=build /home/infinity/infinity-server/dist/ ./dist/
COPY --from=build /home/infinity/infinity-server/node_modules ./node_modules

ENV DATABASE_HOST=mongo
ENV DATABASE_PORT=27017
ENV DATABASE_NAME=interview
ENV DATABASE_USER=admin
ENV DATABASE_PASS=interview666

EXPOSE 8000

CMD ["node", "dist/main.js"]
