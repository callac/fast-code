<template>
  <div class="announce-box">
    <span
      class="arrow left-arrow iconfont icon-arrow-right"
      :class="{'arrow-disabled':this.showIndex<=0}" @click="setPot(-1, true)"></span>
    <span class="arrow right-arrow iconfont icon-arrow-left" @click="setPot(1, true)"></span>
    <!--<p class="new-announce">最新公告</p>-->
    <!--<router-link class="view-more" :to="'/article/announce'">查看全部 ></router-link>-->
    <div class="announce-wrap">
      <div v-if="announces.length > 0"
           class="wrap"
           :class="{transition:!noTransition}"
           :style="style" ref="banner">
        <div v-for="(item, i) in showAnnounce" :key="i" class="announce-item">
          <router-link v-if="item.id"
                       :to="'/article/announce/'+item.id"
                       class="announce">
            {{item.title}}
          </router-link>
        </div>
      </div>
      <!--<div v-if="announces.length>1" class="nav">-->
      <!--<div v-for="(b,i) in pointers" class="bar"-->
      <!--:class="{active: showIndex === i||(i===0&&showIndex>=announces.length)}" :key="i"-->
      <!--@click="setPos(i,true)"></div>-->
      <!--</div>-->
    </div>
  </div>
</template>

<script>
// 模板 jp2 的公告组件
export default {
  name: 'Announce-jp2',
  mounted() {
    if (this.announces.length > 4) {
      this.runTimer()
    }
  },
  beforeDestroy() {
    this.clear()
  },
  props: {
    announces: Array,
  },
  data() {
    return {
      timer: null,
      showIndex: 0,
      noTransition: false,
    }
  },
  computed: {
    showAnnounce() {
      return this.announces.length > 4
        ? [...this.announces,
          this.announces[0],
          this.announces[1],
          this.announces[2]]
        : this.announces
    },
    style() {
      return { left: `${-this.showIndex * this.getWidth()}px` }
    },
    pointers() {
      return this.announces.length > 3 ? this.announces.length : 1
    },
  },
  watch: {
    announces(val) {
      if (val.length > 3) {
        this.clear()
        this.runTimer()
      }
    },
  },
  methods: {
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
      if (clearTimer && this.announces.length > 3) {
        this.clear()
        this.runTimer()
      }
      if (index >= this.announces.length) {
        this.showIndex = this.announces.length
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
      if (this.announces.length <= 3) return
      if (clearTimer && this.announces.length > 3) {
        this.clear()
        this.runTimer()
      }
      if (this.showIndex + index > this.announces.length) {
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
      return (this.$refs.banner && this.$refs.banner.clientWidth) / 3 || 0
    },
  },
}
</script>
