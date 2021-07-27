<template>
  <page-container class="mobile-page-container mobile-home">
    <div class="mobile-page-container" style="min-height: auto;">
      <header class="sign-header">
        <div class="website"><img :src="require('assets/mobile/site.png')"/></div>
        <div class="description">{{$t('down-ios-terrace')}}</div>
      </header>
      <div class="ios-down-container">
        <div class="sub-title">{{$t('down-ios-test')}}</div>
        <div class="ios-down-content">{{$t('down-ios-test.content')}}</div>
        <div class="down-tips">{{$t('down-ios-test.tips')}}</div>
        <a href="itms-services://?action=download-manifest&url=https://ztstatictest.oss-cn-hangzhou.aliyuncs.com/ZT.plist"
           target="_blank" class="down-btn">{{$t('down-ios-test.down')}}</a>
        <div class="sub-title" style="padding-top: 0.9rem">{{$t('down-ios-store')}}</div>
        <div class="ios-down-content" style="padding-bottom: 0.08rem">
          {{$t('down-ios-store.content1')}}
        </div>
        <div class="ios-down-content">
          {{$t('down-ios-store.content2')}}
        </div>
        <!--<a href="" target="_blank" class="down-btn">{{$t('down-ios-store.down')}}</a>-->
        <a class="down-btn">暂未开放</a>
      </div>
    </div>
    <div class="down-rule-container">
      <div class="rule-title">{{$t('down-ios-course')}}</div>
      <div class="course-step">
        <div class="step-num"><span>1</span></div>
        <div class="step-content">
          <p>{{$t('down-ios-course.content1')}}</p>
          <img :src="require('assets/mobile/zh/course01.png')"/>
        </div>
      </div>
      <div class="course-step">
        <div class="step-num"><span>2</span></div>
        <div class="step-content">
          <p>{{$t('down-ios-course.content2')}}</p>
          <img :src="require('assets/mobile/zh/course02.png')"/>
        </div>
      </div>
      <div class="course-step">
        <div class="step-num"><span>3</span></div>
        <div class="step-content">
          <p>{{$t('down-ios-course.content3.info1')}}</p>
          <img :src="require('assets/mobile/zh/course03.png')"/>
          <p>{{$t('down-ios-course.content3.info1')}}</p>
          <img :src="require('assets/mobile/zh/course04.png')"/>
        </div>
      </div>
      <div class="course-step">
        <div class="step-num"><span>4</span></div>
        <div class="step-content">
          <p>{{$t('down-ios-course.content4')}}</p>
          <img :src="require('assets/mobile/zh/course05.png')"/>
        </div>
      </div>
    </div>
    <div class="wx-down-tips" v-if="wxTipState" @click="wxTipState=false">
      <img :src="require('assets/mobile/down-tips.png')"/>
    </div>
  </page-container>
</template>

<script>
import { mapState } from 'vuex'
import { isWeiXin } from 'utils/UserAgent'

export default {
  name: 'DownIos',
  data() {
    return {
      wxTipState: false,
    }
  },
  mounted() {
    if (isWeiXin()) {
      this.wxTipState = true
    }
  },
  methods: {},
  computed: {
    ...mapState(['siteInfo']),
  },
}
</script>

<style lang="scss" scoped>

</style>
