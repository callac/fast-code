// 事件总线

const BusPlugin = {}
BusPlugin.install = (Vue) => {
  const bus = new Vue()

  Vue.prototype.bus = bus

  // snackbar 拦截器
  const snackBarInterceptor = msg => msg
    && +msg.statusCode !== 401
    && +msg.statusCode !== 400
    && +msg.statusCode !== 426
    && +msg.resCode !== 2

  // snackbar 组件
  Vue.prototype.snackBar = {
    open(msg) {
      if (snackBarInterceptor(msg)) bus.$emit('snack-bar-open', msg)
    },
    info(msg) {
      if (snackBarInterceptor(msg)) bus.$emit('snack-bar-info', msg)
    },
    error(msg) {
      if (snackBarInterceptor(msg)) bus.$emit('snack-bar-error', msg)
    },
    warn(msg) {
      if (snackBarInterceptor(msg)) bus.$emit('snack-bar-warn', msg)
    },
    listen(vm) {
      // vm: snackBar实例
      bus.$on('snack-bar-open', (msg) => {
        vm.open(msg)
      })
      bus.$on('snack-bar-info', (msg) => {
        vm.info(msg)
      })
      bus.$on('snack-bar-error', (msg) => {
        vm.error(msg)
      })
      bus.$on('snack-bar-warn', (msg) => {
        vm.warn(msg)
      })
    },
  }

  // 图片全屏显示组件
  Vue.prototype.imgFullScreen = {
    open({ imgs, index }) {
      bus.$emit('img-full-screen-open', { imgs, index })
    },
    close() {
      bus.$emit('img-full-screen-close')
    },
    listen(vm) {
      // vm: imgFullScreen实例
      bus.$on('img-full-screen-open', ({ imgs, index }) => {
        vm.open({ imgs, index })
      })
      bus.$on('img-full-screen-close', () => {
        vm.close()
      })
    },
  }
}

export default BusPlugin
