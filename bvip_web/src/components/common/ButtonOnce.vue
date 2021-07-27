<template>
  <vue-btn class="button-once"
           :clickFn="clickFn"
           :errorFn="errorFn"
           :class="{'use-load': useLoading}">
    <slot/>
    <loading v-if="useLoading" color="#fff" :size="loadingSize" slot="lock"/>
  </vue-btn>
</template>

<script>
import VueBtn from '@livelybone/vue-button'

// 防抖 button
export default {
  name: 'ButtonOnce',
  components: { VueBtn },
  props: {
    // 点击回调函数
    clickFn: {
      required: true,
      type: Function,
    },
    // 是否能继续点击
    canUseAgain: {
      type: Boolean,
      default: true,
    },
    // Loading 组件大小设置
    loadingSize: {
      default: '.2rem',
      type: String,
    },
    // 是否使用 Loading 组件
    useLoading: {
      default: false,
      type: Boolean,
    },
  },
  methods: {
    errorFn(e) {
      this.snackBar.error(e)
    },
  },
}
</script>
