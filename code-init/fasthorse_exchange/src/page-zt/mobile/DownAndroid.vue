<template>
  <page-container class="mobile-android-down">
    <div class="android-down-logo">
      <img :src="require('assets/mobile/android-logo.png')"/>
    </div>
    <a class="down-btn" href="http://ztstatictest.oss-cn-hangzhou.aliyuncs.com/app-release-an.apk"
       target="_blank">{{$t('mobile.android.install')}}</a>
    <div class="wx-down-tips" v-if="wxTipState" @click="wxTipState=false">
      <img :src="require('assets/mobile/down-tips.png')"/>
    </div>
  </page-container>
</template>

<script>
import { mapState } from 'vuex'
import { isWeiXin } from 'utils/UserAgent'

export default {
  name: 'DownAndroid',
  data() {
    return {
      wxTipState: false,
    }
  },
  methods: {},
  mounted() {
    if (isWeiXin()) {
      this.wxTipState = true
    }
  },
  computed: {
    ...mapState(['siteInfo']),
  },
}
</script>

<style lang="scss" scoped>

</style>
