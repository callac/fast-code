<template>
  <transition name="fade-enter">
    <div class="page-container">
      <slot />
    </div>
  </transition>
</template>

<script>
import { mapState } from 'vuex'

// 页面容器
export default {
  name: 'PageContainer',
  props: {
    title: [String, Function], // 页面 title
  },
  computed: {
    ...mapState(['siteInfo']),
    // 后台配置的页面 title
    domain() {
      return this.siteInfo.headTitle
    },
  },
  watch: {
    title: {
      handler() {
        this.setTitle()
      },
      immediate: true,
    },
  },
  methods: {
    // 拼接 title
    getTitle() {
      if (!this.title) return this.domain
      const title = typeof this.title === 'function' ? this.title() : this.title
      if (!title) return this.domain
      return this.domain ? `${title} - ${this.domain}` : title
    },
    // 设置 title
    setTitle() {
      const title = this.getTitle() || ''
      if (typeof window !== 'undefined') {
        document.title = title
      } else {
        this.$ssrContext.title = title
      }
    },
  },
}
</script>
