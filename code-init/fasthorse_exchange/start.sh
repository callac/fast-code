git pull
kill -9 $(netstat -nlp | grep :3001 | awk '{print $7}' | awk -F"/" '{ print $1 }')
nohup cross-env defaultTemplate='default' port=3001 npm run server >> /var/log/bvip_web/client.log 2>&1 &
