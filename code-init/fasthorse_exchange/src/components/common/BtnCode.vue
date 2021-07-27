<template>
  <button class="btn-code" @click="getCode" :disabled="!!second||disabled">
    {{second>0 ? second + '秒' : text||this.$t('verify.code.get')}}
  </button>
</template>

<script>
// 获取验证码之后倒数 60s 的按钮
export default {
  name: 'BtnCode',
  props: {
    // 按钮文本
    text: String,
    // 是否可用
    disabled: Boolean,
    // 点击的回调函数
    getCodeFn: Function,
  },
  data() {
    return {
      second: 0,
      timer: null,
    }
  },
  methods: {
    getCode() {
      if (this.getCodeFn instanceof Function) {
        const pro = this.getCodeFn()
        if (pro.then && pro.then instanceof Function) {
          pro.then(() => {
            // 获取成功开始倒计时
            this.second = 60
            this.timer = setInterval(() => {
              const second = this.second - 1
              if (second <= 0) {
                clearInterval(this.timer)
              }
              this.second = Math.max(0, second)
            }, 1000)
          }).catch((e) => {
            this.snackBar.error(e)
            this.$emit('errorGet', e)
          })
        } else {
          this.$emit('error', new Error('BtnCode: Result of Prop getCodeFn is not a Promise'))
        }
      } else {
        this.$emit('error', new Error('BtnCode: Prop getCodeFn is not a Function'))
      }
    },
  },
  beforeDestroy() {
    if (this.timer) clearInterval(this.timer)
  },
}
</script>
