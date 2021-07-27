
<template>
  <div id="app">
    <snack-bar ref="snackBar" baseSize="1rem"/>
    <image-full-screen ref="imgFull"/>
    <router-view/>
    <global-popup/>
  </div>
</template>

<script>
/* eslint-disable */
import GlobalPopup from 'components/client/GlobalPopup'
import ImageFullScreen from 'components/image/ImageFullScreen'
import { AuthToken } from 'data/api/auth-token'
import SnackBar from 'vuejs-snackbar'
import { mapActions, mapGetters } from 'vuex'
import { isMobile } from 'utils/UserAgent'

// 根路由
export default {
  name: 'app',
  components: { SnackBar, ImageFullScreen, GlobalPopup },
  data() {
    return {
      isZt: /(127\.0\.0\.1)|(47\.97\.206\.151)|(zt\.com)/.test(window.location.origin),
    }
  },
  computed: {
    ...mapGetters(['siteInfo']),
    isHome() {
      return ['/'].includes(window.location.pathname)
    },
    // isMobileHome() {
    //   return ['/mobile/home'].includes(this.$route.path)
    // },
  },
  methods: {
    ...mapActions('user', ['logout']),
    setIco() {
      /* 设置 favicon */
      if (typeof window !== 'undefined') {
        const ico = document.createElement('link')
        ico.setAttribute('rel', 'shortcut icon')
        ico.setAttribute('href', this.siteInfo.icon)
        document.head.appendChild(ico)
      }
    },
    setCookie(c_name, value, expire) {
      const date = new Date()
      date.setSeconds(date.getSeconds() + expire)
      document.cookie = `${c_name}=${escape(value)}; expires=${date.toGMTString()}`
    },
    getCookie(c_name) {
      if (document.cookie.length > 0) {
        let c_start = document.cookie.indexOf(`${c_name}=`)
        if (c_start !== -1) {
          c_start = c_start + c_name.length + 1
          let c_end = document.cookie.indexOf(';', c_start)
          if (c_end === -1) c_end = document.cookie.length
          return unescape(document.cookie.substring(c_start, c_end))
        }
      }
      return ''
    },
  },
  created() {
    const loadState = this.getCookie('loadState')
    if (this.isZt && loadState !== '1' && isMobile()) {
      this.setCookie('loadState', '1', 10 * 60)
      if (this.isHome) {
        window.location.replace('/mobile/home')
      }
    }
  },
  mounted() {
    this.snackBar.listen(this.$refs.snackBar) // 监听 bus => snackBar 事件
    this.imgFullScreen.listen(this.$refs.imgFull) // 监听 bus => imgFullScreen 事件
    this.setIco()

    // token 信息变化处理
    AuthToken.tokenChange.subscribe((token, expired) => {
      if (expired) {
        // 过期
        this.snackBar.info(this.$t('token.expire'))
        setTimeout(this.logout, 1000)
      } else {
        // 浏览器其他窗口操作导致 token 信息变化
        window.location.reload()
      }
    })
  },
}
</script>
