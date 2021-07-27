import { timeConversion } from 'utils/DateDeal'
import { zeroFill } from 'utils/Utils'

const ids = {}

const infinity = '0001-01-01T00:00:00Z'

// 订单倒计时
export class OrderCountDown {
  /**
   * @desc  添加倒计时，加入到 ids 对象中
   * @param {String} expireTime
   * @param {Function} cb
   * @param {Number} deltaTime, clientTime - serverTime
   * */
  static bind(expireTime, cb, deltaTime = 0) {
    if (expireTime && expireTime !== infinity) {
      if (!ids[expireTime]) ids[expireTime] = {}

      if (!ids[expireTime].timer) {
        ids[expireTime].timer = setInterval(() => {
          OrderCountDown.fn(expireTime, deltaTime)
        }, 1000)
      }

      if (!ids[expireTime].callbacks) {
        ids[expireTime].callbacks = new Set()
      }

      ids[expireTime].callbacks.add(cb)
      OrderCountDown.fn(expireTime, deltaTime)
    }
  }

  // 运行倒计时回调函数
  static fn(time, deltaTime) {
    const { day, hour, minute, second } = timeConversion(time, deltaTime)

    const call = (value) => {
      const { callbacks } = ids[time] || {}
      if (callbacks) {
        callbacks.forEach((callback) => {
          if (callback instanceof Function) callback(value)
        })
      }
    }

    const valid = val => val > 0

    if (valid(day) || valid(hour) || valid(minute) || valid(second)) {
      const h = day * 24 + +hour
      const strC = v => (v ? `${zeroFill(v, 2)}:` : '')
      const value = `${strC(h)}${strC(minute)}${zeroFill(second, 2)}`
      call(value)
    } else {
      call('00')
      OrderCountDown.clearTimer(time)
    }
  }

  // 删除定时器
  static clearTimer(time) {
    const { timer } = ids[time] || {}
    clearInterval(timer)
    ids[time] = undefined
  }

  // 删除倒计时，从 ids 对象中删除
  static unbind(time, cb) {
    if (time) {
      const { callbacks } = ids[time] || {}
      if (callbacks) {
        callbacks.delete(cb)
        if (callbacks.size < 1) OrderCountDown.clearTimer(time)
      }
    }
  }
}
