<template>
  <div class="banner-box">
    <!--<img class="arrow left-arrow"-->
          <!--@click="setPot(-1, true)"-->
         <!--v-if="banners.length > 4"-->
         <!--:src="showIndex === 0-->
         <!--?require('assets/client/home/home-t3-banner-btn-left-disabled.png')-->
         <!--:require('assets/client/home/home-t3-banner-btn-left.png')"/>-->
    <!--<img class="arrow right-arrow"-->
         <!--@click="setPot(-1, true)"-->
         <!--v-if="banners.length > 4"-->
         <!--:src="this.banners.length <=4-->
         <!--?require('assets/client/home/home-t3-banner-btn-right-disabled.png')-->
         <!--:require('assets/client/home/home-t3-banner-btn-right.png')"/>-->
    <span class="arrow left-arrow iconfont icon-arrow-right"
          @click="setPot(-1, true)"
          :class="{'arrow-disabled': showIndex === 0}"></span>
    <span class="arrow right-arrow iconfont icon-arrow-left"
          @click="setPot(1, true)"
          :class="{'arrow-disabled': this.banners.length <=4}"></span>
    <div class="banner">
      <div class="wrap" :class="{transition:!noTransition}" :style="style" ref="banner">
        <template v-for="(b, i) in showBanners">
          <div v-if="!b.url" class="b" :key="i" :style="bannerStyle(b.image)"></div>
          <a v-else class="b a" target="_blank" :href="b.url" :key="i"
             :style="bannerStyle(b.image)"></a>
        </template>
      </div>
      <!--<div v-if="banners.length>1" class="nav" :style="navStyle">-->
      <!--<div v-for="(b,i) in pointers" class="bar"-->
      <!--:class="{active: showIndex === i||(i===0&&showIndex>=banners.length)}" :key="i"-->
      <!--@click="setPos(i,true)"></div>-->
      <!--</div>-->
    </div>
  </div>
</template>

<script>
// 模板 t3 的轮播图组件
export default {
  name: 'Banner',
  mounted() {
    if (this.banners.length > 4) {
      this.runTimer()
    }
  },
  beforeDestroy() {
    this.clear()
  },
  props: {
    banners: Array,
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
      return this.banners.length > 4 ? [...this.banners, ...this.banners] : this.banners
    },
    style() {
      return { left: `${-this.showIndex * this.getWidth()}px` }
    },
    pointers() {
      return this.banners.length > 4 ? this.banners.length : 1
    },
  },
  watch: {
    banners(val) {
      if (val.length > 4) {
        this.clear()
        this.runTimer()
      }
    },
  },
  methods: {
    bannerStyle(url) {
      return {
        background: `url(${url}) no-repeat center top/ 100% 100%`,
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
      if (clearTimer && this.banners.length > 4) {
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
    setPot(index, clearTimer) {
      if (this.banners.length <= 4) return
      if (clearTimer && this.banners.length > 4) {
        this.clear()
        this.runTimer()
      }
      if (this.showIndex + index > this.banners.length) {
        this.noTransition = true
        this.showIndex = 0
      } else if (this.showIndex + index < 0) {
        this.showIndex = 0
      } else {
        this.showIndex += index
        this.noTransition = false
      }
    },
    getWidth() {
      return (this.$refs.banner && this.$refs.banner.clientWidth) / 4 || 0
    },
  },
}
</script>
