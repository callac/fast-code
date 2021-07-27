// 和 throttle-debounce 对比：
//    throttle-debounce 返回的是一个新的自带防抖的函数，中间无法改变运行的函数；
//    Debounce 类返回一个自带防抖的类实例，可以通过 handle 方法自定义调用不同的函数
export default class Debounce {
  timer = null

  time = 500

  constructor(time) {
    this.time = time || 500
  }

  handle(callback) {
    if (this.timer) clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      callback()
    }, this.time)
  }
}
