FROM node:6.10.3-slim
RUN apt-get update \    && apt-get install -y nginx
WORKDIR /app
COPY . /app/
EXPOSE 80
RUN  npm install \
    && npm run dist \
    && cp -r lib/* /var/www/html \
    && rm -rf /app
CMD ["nginx","-g","daemon off;"]