# 使用node:6.10.3 的精简版作为基础镜像
FROM node:7.9-slim

# 安装nginx
RUN apt-get update \
  && apt-get install -y nginx

#制定工作目录
WORKDIR /app

# 将当前目录下的所有文件拷贝到工作目录下
COPY . /app/

# 声明运行时容器提供服务端口
EXPOSE 80

# 1.安装依赖
# 2.运行 npm run dist
# 3.将 dist目录的所有文件拷贝到 nginx 的目录下
# 4.删除工作目录的文件，尤其是 node_modules 以减小镜像体积
# 由于镜像构建的每一步都会产生新层
# 为了减小镜像体积，尽可能将一些同类操作,集成到一个步骤中,如下
RUN npm install -g cnpm --registry=https://registry.npm.taobao.org
RUN cnpm install \
RUN npm run dist \
 && cp -r lib/* /var/www/html \
 && rm -rf /app

# 以前台的方式启动 NGINX
CMD ["nginx","-g","daemon off;"]