import { Observer } from '@livelybone/simple-observer'
import * as config from 'config/config'
import ErrorPoster from 'utils/ErrorPoster'
import pako from 'pako'

// socket 错误类型
function errorType(code) {
  switch (code) {
    case 1:
      return '参数不合法'
    case 2:
      return '内部错误'
    case 3:
      return '服务不可用'
    case 4:
      return '方法未找到'
    case 5:
      return '服务超时'
    default:
      return '需要授权'
  }
}

// 响应数据处理
function resultDeal(data) {
  if (data.error) {
    const error = new Error(`${errorType(data.error.code)}: ${data.error.message}`)
    error.code = data.error.code
    return Promise.reject(error)
  }
  return Promise.resolve(data.result)
}

// 订阅数据处理
function subscribeResDeal(data) {
  return Promise.resolve(data.params)
}

// 计算出正确的 socket 地址
function getSocketUrl(url) {
  if (/^ws.*\/.*/.test(url)) return url
  const { protocol, host } = window.location
  const socketPro = /https/.test(protocol) ? 'wss:' : 'ws:'
  if (/^\/\//.test(url)) return `${socketPro}${url}`
  if (/^\//.test(url)) return `${socketPro}//${host}${url}`
  return `${socketPro}//${url}`
}

// socket 纯方法
class SocketMethods {
  // ping pong
  static ping(method, interval) {
    setInterval(
      () => {
        SocketMethods.request({ method: method || 'ping' })
      },
      interval || 60000,
    )
  }

  // 对 socket 实例添加事件监听
  static eventListen(socket, { openCb, errorCb, closeCb, messageCb }) {
    const openHandler = SocketMethods.openFn(openCb)
    const errorHandler = SocketMethods.errorFn(errorCb)
    const closeHandler = SocketMethods.closeFn(closeCb, socket)
    const messageHandler = SocketMethods.messageFn(messageCb)
    socket.addEventListener('open', openHandler)
    socket.addEventListener('error', errorHandler)
    socket.addEventListener('close', closeHandler)
    socket.addEventListener('message', messageHandler)
  }

  // 生成 open 事件监听函数
  static openFn(cb) {
    return (ev) => {
      // console.log('---- Socket: WebSocket connected! ', ev)
      if (cb instanceof Function) cb(ev)
    }
  }

  // 生成 error 事件监听函数
  static errorFn(cb) {
    return (ev) => {
      // console.log('---- Socket: WebSocket got an error! ', ev)
      if (cb instanceof Function) cb(ev)
    }
  }

  // 生成 close 事件监听函数
  static closeFn(cb, socket) {
    return (ev) => {
      // console.log('---- Socket: WebSocket closed! ', ev)
      if (cb instanceof Function) cb(ev)

      // 实例关闭连接时，删除对应的请求和订阅
      SocketMethods.deleteCallback(socket)
    }
  }

  // 生成 message 事件监听函数
  static messageFn(cb) {
    return (ev) => {
      // console.log('---- Socket: Message from Server: ', ev.data);
      let data = {}
      if (ev.data instanceof Blob) {
        // console.log('解压过程')
        const blob = ev.data;
        const reader = new FileReader();
        reader.readAsBinaryString(blob);
        reader.onload = (e) => {
          const textFromFileLoaded = e.target.result;
          const charData = textFromFileLoaded.split('').map(x => x.charCodeAt(0));
          const bindata = new Uint8Array(charData);
          const plain = pako.inflateRaw(bindata, { to: 'string' });
          data = JSON.parse(plain)
          // console.log(data)
          if (data.method) {
            const { callback } = SocketMethods.subscribes.get(data.method) || {}
            if (callback) callback(subscribeResDeal(data))
          } else {
            const { callback } = SocketMethods.onceResponses.get(data.id) || {}
            if (callback) {
              callback(resultDeal(data))
              SocketMethods.onceResponses.delete(data.id)
            }
          }
          if (cb instanceof Function) cb(ev)
        }
      } else {
        data = JSON.parse(ev.data)
        if (data.method) {
          const { callback } = SocketMethods.subscribes.get(data.method) || {}
          if (callback) callback(subscribeResDeal(data))
        } else {
          const { callback } = SocketMethods.onceResponses.get(data.id) || {}
          if (callback) {
            callback(resultDeal(data))
            SocketMethods.onceResponses.delete(data.id)
          }
        }
        if (cb instanceof Function) cb(ev)
      }
    }
  }

  // 向服务器发送请求
  static send(socket, { method, params = [], id }, cb) {
    if (socket.readyState === 1) {
      if (cb instanceof Function) cb()
      socket.send(JSON.stringify({ method, params, id }))
    }
  }

  // 生成请求 ID
  static uniqueId() {
    let id
    do {
      id = Math.floor(Math.random() * 10000)
    } while (SocketMethods.onceResponses.has(id))
    return id
  }

  // 请求
  static request(socket, { method, params = [] }, cb) {
    const api = `webSocket: ${method}`
    return new Promise((res, rej) => {
      const id = SocketMethods.uniqueId()
      const start = Date.now()
      SocketMethods.send(socket, { method, params, id }, () => {
        if (cb instanceof Function) cb()
        SocketMethods.onceResponses.set(id, {
          callback: pro => pro.then(res).catch(rej),
          socket,
        })

        // 超过10秒提交网络统计
        const time = Date.now() - start
        if (time > 10000) {
          ErrorPoster.postMsg({
            type: 'network-statistics',
            level: 'normal',
            message: `Long response time(greater than 2 second): \`${api}\``,
            details: {
              api,
              time,
              config: { params },
            },
          })
        }
      })
    }).catch((error) => {
      // 请求报错提交
      if (!error.message.includes('jwt') && !error.message.includes('require authentication')) {
        ErrorPoster.postMsg({
          type: 'api-error',
          level: 'error',
          message: error.message,
          details: {
            api,
            config: { params },
          },
        })
      }
      throw error
    })
  }

  // 订阅
  // callback 接收一个 promise 作为参数
  static subscribe(socket, { method, params = [], getResultMethod, callback }) {
    const getMethod = getResultMethod || method

    return SocketMethods
      .request(socket, { method, params }, () => {
        SocketMethods.subscribes.set(getMethod, { callback, socket })
      })
      // .then(() => console.log(`---- Socket: Method \`${method}\`
      // subscribe success! Result method is \`${getMethod}\``))
      .catch((e) => {
        // console.error(`---- Socket: Method \`${method}\`subscribe failed!`, e)
        throw e
      })
  }

  // 取消订阅
  static unsubscribe(socket, method) {
    return SocketMethods
      .request(socket, { method, params: [] }, () => {
        SocketMethods.subscribes.delete(method)
      })
      // .then(() => console.log(`---- Socket: Method \`${method}\` unsubscribe success!`))
      .catch((e) => {
        // console.error(`---- Socket: Method \`${method}\` unsubscribe failed!`, e)
        throw e
      })
  }

  // 关闭 socket 实例
  static close(socket) {
    if (socket.readyState === 1) socket.close()
  }

  /**
   * 删除这个 webSocket 实例遗留的请求和订阅
   * */
  static deleteCallback(socket) {
    SocketMethods.subscribes.forEach(({ socket: ws }, method) => {
      if (ws === socket) SocketMethods.subscribes.delete(method)
    })
    SocketMethods.onceResponses.forEach(({ socket: ws }, id) => {
      if (ws === socket) SocketMethods.onceResponses.delete(id)
    })
  }
}

// 订阅回调函数队列
SocketMethods.subscribes = new Map()

// 请求回调函数队列
SocketMethods.onceResponses = new Map()

// socket 实例创建
class SocketClass {
  // socket 服务地址
  url = ''

  // promise 实例，resolve 状态返回一个 socket 实例
  pro = null

  // 其他配置项
  // 比如： { ping: { method: 'server.ping', interval: 2000 } }
  options = null

  // @livelybone/simple-observer 发布订阅模式，监听 socket 状态变化
  statucChange = null

  // @livelybone/simple-observer 发布订阅模式，监听 socket 状态变化
  next = null

  // 是否为被动关闭（不是调用 disconnect 方法的关闭: 服务端出错，网络错误...）
  isPassiveClose = true

  /**
   * {Map<key: String, value: Object<{args: Array}>>} 正在订阅的请求
   * */
  subscribeList = new Map()

  /**
   * {Map<key: String, value: Object<{args: Array}>>} 正在响应的请求
   * */
  requestList = new Map()

  constructor(url, options) {
    this.options = options
    this.url = getSocketUrl(url)

    // @livelybone/simple-observer 发布订阅模式
    this.statusChange = new Observer((next) => {
      this.next = next
    })
  }

  get socket() {
    return this.connect()
  }

  // 返回 this.pro（resolve 出一个 socket 实例）
  connect() {
    if (this.pro === null) {
      this.pro = new Promise((res, rej) => {
        let socket = null
        if (typeof window !== 'undefined') {
          // 判断浏览器是否支持 webSocket
          if ('WebSocket' in window) {
            socket = new WebSocket(this.url)
          } else if ('MozWebSocket' in window) {
            socket = new window.MozWebSocket(this.url)
          } else {
            rej(new Error('---- Socket: Your browser does not support WebSocket !'))
          }

          if (socket) {
            const start = Date.now()
            SocketMethods.eventListen(socket, {
              // open 事件监听函数
              openCb: () => {
                res(socket)

                // 定时 ping，防止断连
                this.request({ method: this.options.ping.method || 'ping' })
                setInterval(() => {
                  if (this.pro) this.request({ method: this.options.ping.method || 'ping' })
                }, this.options.ping.interval || 60000)

                // 发布通知：socket 状态为已连接
                this.next('open')

                // 将 isPassiveClose 重置
                this.isPassiveClose = true

                // 连接时间超过2s提交网络统计
                const time = Date.now() - start
                if (time > 2000) {
                  const api = 'webSocket: connect'
                  ErrorPoster.postMsg({
                    type: 'network-statistics',
                    level: 'normal',
                    message: `Long response time(greater than 2 second): \`${api}\``,
                    details: {
                      api,
                      time,
                    },
                  })
                }
              },
              // error 事件监听函数
              errorCb: (error) => {
                // 重置 pro
                this.pro = null

                // 发布通知：socket 状态为已报错
                this.next('error')

                // 重新连接
                this.reconnect(rej)

                // 上报错误
                ErrorPoster.postMsg({
                  type: 'websocket-error',
                  message: `Websocket error: ${error.message || error}`,
                  details: { error },
                })
              },
              closeCb: () => {
                // 重置 pro
                this.pro = null

                // 发布通知：socket 状态为已关闭
                this.next('close')

                // 如果不是主动关闭，则重连
                if (this.isPassiveClose) {
                  this.reconnect(rej)

                  // 上报情况
                  ErrorPoster.postMsg({
                    type: 'websocket-passive-close',
                    level: 'normal',
                    message: 'Websocket closed passively',
                    details: {
                      holdTime: Date.now() - start,
                    },
                  })
                }
                rej()
              },
            })
          }
        } else {
          rej(new Error('---- Socket: You are in a non-browser env!'))
        }
      })
    }
    return this.pro
  }

  // 重连
  reconnect(cb) {
    if (cb instanceof Function) cb()
    setTimeout(() => {
      this.connect().then(() => {
        // 重新开启未取消的订阅
        this.subscribeList.forEach(({ args }) => {
          this.subscribe(...args)
        })

        // 重新打开未响应的请求
        this.requestList.forEach(({ args }) => {
          this.request(...args)
        })
      })
    }, 2000)
  }

  // 主动关闭连接
  disconnect() {
    return (this.pro
      ? this.pro.then(socket => SocketMethods.close(socket))
      : Promise.resolve())
      .then(() => {
        this.isPassiveClose = false
      })
  }

  // 请求
  request(...args) {
    return this.socket
      .then((socket) => {
        const key = JSON.stringify(args)
        this.requestList.set(key, { args })

        return SocketMethods.request(socket, ...args)
          .finally(() => {
            // 服务端响应之后(不管成功还是失败)，删除请求
            this.requestList.delete(key)
          })
      })
  }

  // 订阅
  subscribe(...args) {
    return this.socket
      .then(socket => SocketMethods.subscribe(socket, ...args))
      .then(() => {
        const { method, getResultMethod } = args[0]
        this.subscribeList.set(getResultMethod || method, { args })
      })
  }

  // 取消订阅
  unsubscribe(method) {
    return this.pro
      ? this.pro
        .then(socket => SocketMethods.unsubscribe(socket, method))
        .then(() => {
          this.subscribeList.delete(method)
        })
      : Promise.resolve()
  }
}

const { host } = window.location
const socketUrl = host === 'www.zt.com' ? 'wss://ws.zt.com/ws' : config.socketUrl
// 专门用于请求订阅 K 线数据的 socket 实例
export const KlineSocket = new SocketClass(
  config.klineSocketUrl,
  // socketUrl,
  {
    ping: {
      method: 'server.ping',
      interval: 30000,
    },
  },
)

// 用于其他请求订阅的 socket 实例
export const Socket = new SocketClass(
  // config.socketUrl,
  socketUrl,
  {
    ping: {
      method: 'server.ping',
      interval: 30000,
    },
  },
)
