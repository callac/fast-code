'use strict'
// module.exports = {
//   localhost: 'http://www.mingshiwande.com/api/v1', // 服务器运行 server-index.js 时使用
//   backendUrl: 'http://www.mingshiwande.com/api/v1',
//   backendOTCUrl: 'http://www.mingshiwande.com/otc/api/v1',
//   socketUrl: 'ws://www.mingshiwande.com/ws/',                             // 服务端 websocket 的 url
//   klineSocketUrl: 'ws://www.mingshiwande.com/ws/',                             // 服务端 k线的websocket 的 url
//   ossUrl: 'https://mingshiwande-exchange.oss-cn-beijing.aliyuncs.com/ex/dist/',
//   assetsSubDirectory: 'static',
//   anchorCoin: 'CNT',
// };
module.exports = {
  localhost: 'http://localhost:8081/api/v1', // 服务器运行 server-index.js 时使用
  backendUrl: 'http://8.210.117.251:8883/api/v1',
  backendOTCUrl: 'http://8.210.117.251:8887/api/v1',
  socketUrl: 'ws://8.210.117.251:8090/ws/',                             // 服务端 websocket 的 url
  klineSocketUrl: 'ws://8.210.117.251:8090/ws/',                             // 服务端 k线的websocket 的 url
  ossUrl: 'http://8.210.117.251:8886/',
  assetsSubDirectory: 'static',
  anchorCoin: 'CNT'
};
