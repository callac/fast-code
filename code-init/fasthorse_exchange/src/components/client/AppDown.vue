<template>
  <!--<div v-if="isMobile&&isZt" class="app-down">-->
    <!--<div class="left">-->
      <!--<img :src="require('assets/logo-zt.png')" alt="">-->
      <!--<div class="text">-->
        <!--<h2>ZT APP</h2>-->
        <!--<p>掌中交易，随时随地</p>-->
      <!--</div>-->
    <!--</div>-->
    <!--<a :href="url" target="_blank">立即下载</a>-->
  <!--</div>-->
  <div v-if="isMobile&&isZt" class="down-layer-container">
    <div class="down-layer">
      <div class="logo">
        <img :src="require('assets/logo-zt.png')"/>
      </div>
      <div class="web-name">
        <img :src="require('assets/mobile/site.png')"/>
      </div>
      <!--<a class="down-app-btn" :href="url" target="_blank">{{$t('mobile.down')}}</a>-->
      <a class="down-app-btn" :href="url">{{$t('mobile.down')}}</a>
    </div>
  </div>
</template>

<script>
import { isAndroid, isMobile } from 'utils/UserAgent'
import { mapState } from 'vuex'

export default {
  name: 'AppDown',
  data() {
    return {
      isMobile: isMobile(),
      isAndroid: isAndroid(),
      isZt: /(127\.0\.0\.1)|(47\.97\.206\.151)|(zt\.com)/.test(window.location.origin),
    }
  },
  computed: {
    ...mapState(['siteInfo']),
    url() {
      // return this.isAndroid ? this.siteInfo.android_url : this.siteInfo.ios_url
      return this.isAndroid ? '/mobile/down-android' : ''
    },
  },
  methods: {},
}
</script>
