FROM node

RUN apt-get update \
 && apt-get install -y nginx

RUN npm install pm2 -g --registry=https://registry.npm.taobao.org

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package.json /usr/src/app/

RUN npm install --registry=https://registry.npm.taobao.org

COPY . /usr/src/app

ENV NODE_ENV production

EXPOSE 80

RUN npm run dist \
 && cp -r lib/* /var/www/html \
 && rm -rf /usr/src/app

CMD ["nginx","-g","daemon off;"]
