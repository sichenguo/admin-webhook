#!/bin/bash
WORK_PATH='/usr/projects/react-front-server'
cd $WORK_PATH
echo "先清除老代码"
git reset --hard origin/master
git clean -f
echo '拉取最新代码'
git pull origin master

echo '开始执行构建'
docker build -t admin-front:1.0 .

echo '停止并删除老容器'
docker stop admin-front-container
docker rm admin-front-container 

echo '启动新容器'
docker container run -p 80:80 --name  admin-front-container -d admin-front:1.0


