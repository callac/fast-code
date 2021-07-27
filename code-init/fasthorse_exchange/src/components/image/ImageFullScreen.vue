<template>
  <div>
    <overlay v-if="!closed" @click="close">
      <span class="btn-close" @click="close">X</span>
      <img-tag :src="img.value" alt=""/>
      <div v-if="imgs.length>1" class="operator">
        <div class="prev" @click="toPrev">上一张</div>
        <div class="next" @click="toNext">下一张</div>
      </div>
    </overlay>
  </div>
</template>

<script>
// 图片全屏显示组件
export default {
  name: 'ImageFullScreen',
  data() {
    return {
      // 元素结构 { value: String|File|Promise, ...}
      imgs: [],
      index: 0,
      closed: true,
    }
  },
  computed: {
    img() {
      return this.imgs[this.index]
    },
  },
  methods: {
    toPrev() {
      this.index -= 1
      if (this.index < 0) this.index = 0
    },
    toNext() {
      this.index += 1
      if (this.index >= this.imgs.length) this.index = this.imgs.length - 1
    },
    open({ imgs, index }) {
      this.closed = false
      this.imgs = imgs
      this.index = index
    },
    close() {
      this.closed = true
    },
  },
  components: {},
}
</script>
