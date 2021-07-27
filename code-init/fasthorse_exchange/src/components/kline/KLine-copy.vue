<template>
  <div class="k-line" ref="k-line" @resize="log">
    <div id="k-line"></div>
    <!--<a class="out-link" target="_blank" :href="'https://k.chainfor.com/?k=240-'+symbol">{{$t('out-link')}}</a>-->
  </div>
</template>

<script>
import { KlineTheme } from '$router/ThemeComponents'
import config from 'config/config'

window.$ = require('jquery')
require('jquery-mousewheel')
require('components/kline/kline-js/kline.min')

export default {
  name: 'KLine',
  props: {
    resize: Boolean,
    symbol: String,
  },
  mounted() {
    this.kline = new window.Kline({
      element: '#k-line',
      debug: false,
      type: 'poll',
      url: `${config.backendUrl}/kline/query`,
      // eslint-disable-next-line no-undef
      theme: KlineTheme,
    })
    this.kline.draw()
    if (this.symbol) this.kline.setSymbol(this.symbol)
    this.setLang(this.$i18n.locale)
    if (this.kline.paused) this.kline.resend()
    // pageContainer animation time is 500
    setTimeout(this.resizeFn, 500)
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.resizeFn)
    }
  },
  beforeDestroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.resizeFn)
    }
    this.kline.pause()
  },
  data() {
    return {
      myResize: false,
      kline: null,
    }
  },
  computed: {
    user() {
      return this.$store.state.user.info
    },
  },
  watch: {
    user() {
      this.resizeFn()
    },
    resize(val) {
      if (val) {
        this.resizeFn()
      }
    },
    myResize(val) {
      if (val) {
        this.$nextTick(() => {
          this.getSize(this.$refs['k-line']).then((size) => {
            this.kline.resize(size.width, size.height)
            this.myResize = false
          }).catch(console.error)
        })
      }
    },
    symbol(val) {
      this.kline.setSymbol(val)
    },
    '$i18n.locale'(val) {
      this.setLang(val)
    },
  },
  methods: {
    setLang(val) {
      let lang = 'zh-cn'
      switch (val) {
        case 'zh-hans':
          lang = 'zh-cn'
          break
        case 'zh-hant':
          lang = 'zh-tw'
          break
        default:
          lang = 'en-us'
      }
      this.kline.setLanguage(lang)
    },
    getSize(el) {
      return new Promise((res) => {
        this.$nextTick(() => {
          res({
            width: el.clientWidth,
            height: el.clientHeight,
          })
        })
      })
    },
    resizeFn() {
      this.$nextTick(() => {
        this.myResize = true
      })
    },
  },
}
</script>
