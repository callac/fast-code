const ErrorPoster = {
  /**
   * @param {String} type           可选:
   *                                [
   *                                  'error-resource',     // 资源加载报错
   *                                  'error-runtime',      // 脚本运行时报错
   *                                  'user-behavior',      // 用户行为统计
   *                                  'api-error',          // 接口错误
   *                                  'network-statistics', // 网络状况
   *                                  ...                   // 等等... 可根据情况添加类型
   *                                ]
   * @param {String} level          日志等级，可选：
   *                                [
   *                                  'error',    // 错误，比如 'error-resource',
   *                                                 'error-runtime', 'api-error' 这些
   *                                                 类型就属于错误等级，比较紧急
   *                                  'warn',     // 警告，但不是错误，不太紧急
   *                                  'normal',   // 正常，，比如 'user-behavior',
   *                                                 'network-statistics' 这些
   *                                                 类型是用来做统计，属于正常
   *                                ]
   * @param {String} message        消息内容
   * @param {Object} [details]      信息详情
   * @param {String} [position]     访问的地理位置，可不传。实际上，更推荐由后端处理
   * @param {Number} [probability]  消息发送率。当网站访问量很大(比如：百万级千万级 pv)
   *                                错误出现的频率就会相当的大
   *                                因此可以通过 probability 来限制错误发送的数量
   *                                值越大，消息发送的概率就越大
   * */
  postMsg: ({ type, level = 'error', message, position, details }, probability) => {
    if (window.errorMonitor) {
      // 来源: index-pro.html
      // ErrorMonitor 库地址：http://192.168.3.165/livelybone/error-monitor
      return new Promise((onSuccess, onFailed) => {
        window.errorMonitor.postMsg(
          { type, level, message, position, details, callbacks: { onSuccess, onFailed } },
          probability,
        )
      })
    }

    // 拼接提交信息，并打印
    let msg = '-------- Error post --------\n'
    msg += `         message.type: ${type}\n`
    msg += `         message.message: ${message}\n`
    if (level) msg += `         message.level: ${level}\n`
    if (details) msg += `         message.details: ${JSON.stringify(details)}\n`
    if (position) msg += `         message.position: ${JSON.stringify(position)}\n`
    if (probability) msg += `         probability: ${probability}`
    console.error(msg)
    if (details && details.error) console.error(details.error)

    return Promise.resolve()
  },
}

export default ErrorPoster
