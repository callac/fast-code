// 单例模式
export default class Singleton {
  /**
   * @desc 单例 Promise 实例，状态改变时删除
   * @param {Function<Promise>} proFn
   * @param {String|Number} key
   * @return Promise
   * */
  static promise(proFn, key = '') {
    const k = key ? `promise-${key}` : proFn
    if (!Singleton.keys.has(k)) {
      Singleton.keys.set(
        k,
        proFn().then(
          (res) => {
            Singleton.keys.delete(k)
            return res
          },
          (e) => {
            Singleton.keys.delete(k)
            throw e
          },
        ),
      )
    }
    return Singleton.keys.get(k)
  }

  /**
   * @desc 单例 Promise 实例，不删除
   * @param {Function<Promise>} proFn
   * @param {String|Number} key
   * @return Promise
   * */
  static promiseForever(proFn, key = '') {
    const k = key ? `promise-forever-${key}` : proFn
    if (!Singleton.keys.has(k)) {
      Singleton.keys.set(k, proFn())
    }
    return Singleton.keys.get(k)
  }

  /**
   * @desc 全局对象
   * @param {String|Number} key
   * @param {Object} defaultValue
   * @return any
   * */
  static obj(key, defaultValue) {
    const k = `object-${key || 'default'}`
    if (!Singleton.keys.has(k)) {
      Singleton.keys.set(k, defaultValue || {})
    }
    return Singleton.keys.get(k)
  }

  /**
   * @desc 只运行一次的函数
   * @param {Function} fn
   * @param {String|Number} key
   * */
  static onceRun(fn, key = '') {
    const k = key ? `once-run-${key}` : fn
    if (!Singleton.keys.has(k)) {
      Singleton.keys.set(k, fn())
    }
  }
}

Singleton.keys = new Map()
