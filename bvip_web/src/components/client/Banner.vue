<template>
  <div class="banner">
    <div class="wrap" :class="{transition:!noTransition}" :style="style" ref="banner">
      <template v-for="(b, i) in showBanners">
        <div v-if="!b.url" class="b" :key="i" :style="bannerStyle(b.image)"></div>
        <a v-else class="b" target="_blank" :href="b.url" :key="i"
           :style="bannerStyle(b.image)"></a>
      </template>
    </div>
    <div v-if="banners.length>1" class="nav" :style="navStyle">
      <div v-for="(b,i) in banners" class="bar"
           :class="{active: showIndex === i||(i===0&&showIndex>=banners.length)}" :key="i"
           @click="setPos(i,true)"></div>
    </div>
  </div>
</template>

<script>
// 轮播图组件
export default {
  name: 'Banner',
  mounted() {
    if (this.banners.length > 1) this.runTimer()
  },
  beforeDestroy() {
    this.clear()
  },
  props: {
    banners: Array,
    navStyle: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      timer: null,
      showIndex: 0,
      noTransition: false,
    }
  },
  computed: {
    showBanners() {
      return this.banners.length > 1 ? [...this.banners, this.banners[0]]
        : this.banners
    },
    style() {
      return { left: `${-this.showIndex * this.getWidth()}px` }
    },
  },
  watch: {
    banners(val) {
      if (val.length > 1) {
        this.clear()
        this.runTimer()
      }
    },
  },
  methods: {
    bannerStyle(url) {
      const height = this.$refs.banner ? `${this.$refs.banner.clientHeight}px` : '100%'
      return {
        background: `url(${url}) no-repeat center top/ auto ${height}`,
      }
    },
    runTimer() {
      this.clear()
      this.timer = setInterval(() => {
        this.setPos(this.showIndex + 1)
      }, 5000)
    },
    clear() {
      if (this.timer) clearInterval(this.timer)
    },
    setPos(index, clearTimer = false) {
      if (clearTimer) {
        this.clear()
        this.runTimer()
      }
      if (index >= this.banners.length) {
        this.showIndex = this.banners.length
        this.$nextTick(() => {
          setTimeout(() => {
            this.showIndex = 0
            this.noTransition = true
            setTimeout(() => {
              this.noTransition = false
            }, 500)
          }, 500)
        })
      } else this.showIndex = index
    },
    getWidth() {
      return (this.$refs.banner && this.$refs.banner.clientWidth) || 0
    },
  },
}
</script>
