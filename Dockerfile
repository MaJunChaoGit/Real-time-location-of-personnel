FROM node:8.0.0
MAINTAINER MJC

RUN apt-get update \
  && apt-get install -y nginx

ADD . /app/

#制定工作目录
WORKDIR /app

# 声明运行时容器提供服务端口
EXPOSE 80

RUN npm install
RUN npm rebuild node-sass --force

RUN npm run dist \
 && cp -r lib/* /var/www/html \
 && rm -rf /app

# 以前台的方式启动 NGINX
CMD ["nginx","-g","daemon off;"]