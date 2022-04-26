FROM node:14.19.0-alpine AS base 

FROM base as build
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn 
COPY . .
RUN yarn build

FROM nginx:1.21.6-alpine
COPY --from=build /app/build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

