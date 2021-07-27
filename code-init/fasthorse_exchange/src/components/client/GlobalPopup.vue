<template>
  <overlay v-if="show&&popup.image" class="global-activity" @click="hide">
    <div class="notice_box">
      <span class="iconfont icon-del" @click="hide"></span>
      <img :src="popup.image" alt="" :style="imgStyle" @load="getNaturalSize">
    </div>
  </overlay>
</template>

<script>
import Storage from 'utils/StorageX'
import { mapActions, mapState } from 'vuex'

// 全局的弹窗，可根据后台的配置加载不同的内容（一般是图片）
export default {
  name: 'GlobalActivity',
  beforeMount() {
    this.getBanners().catch(this.snackBar.error)
  },
  data() {
    const key = 'GlobalActivity'
    const storage = new Storage()
    return {
      key,
      storage,
      show: (storage.get(key) || 0) < Date.now(),
      naturalSize: null,
    }
  },
  computed: {
    ...mapState(['popup']),
    imgStyle() {
      return this.naturalSize && {
        width: `${this.naturalSize.width / 100}rem`,
      }
    },
  },
  methods: {
    ...mapActions(['getBanners']),
    hide() {
      this.show = false
      this.storage.set(this.key, Date.now() + 24 * 60 * 60 * 1000)
    },
    getNaturalSize() {
      const img = document.createElement('img')
      img.src = this.popup.image
      img.style.position = 'fixed'
      img.style.left = 0
      img.style.top = 0
      img.style.zIndex = -1000
      document.body.appendChild(img)
      this.naturalSize = {
        width: img.clientWidth,
        height: img.clientHeight,
      }
      document.body.removeChild(img)
    },
  },
}
</script>
