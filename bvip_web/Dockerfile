FROM node:10.15.0-stretch-slim

COPY . bvip_web

RUN npm install -g cnpm --registry=https://registry.npm.taobao.org

# 由于dockerfile中RUN不能被覆盖，所以这里所有的参数都必须静态编写，config.js等配置需要外部来覆盖
RUN cd bvip_web && \
      cp config/config.js.sample config/config.js && \
      cnpm install -g cross-env && \
      cnpm install && \
      cross-env templates=zg npm run build && \
      chmod +x entrypoint.sh

CMD ["bvip_web/entrypoint.sh"]
