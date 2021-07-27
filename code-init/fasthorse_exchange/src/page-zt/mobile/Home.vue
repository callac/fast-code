<template>
  <page-container class="mobile-home">
    <div class="mobile-page-container">
      <div class="mobile-wrap">
        <div class="logo">
          <img :src="require('assets/mobile/site.png')"/>
        </div>
        <div class="abstract">
          {{$t('mobile.introduce')}}
        </div>
        <div class="coin-list" v-if="symbolsArrC">
          <template v-for="(p, i) in mainPrices">
            <div class="coin-item" :key="i" v-if="i<=1">
              <div class="coin-name">{{p.symbol1}}</div>
              <div class="price-content">
                <span class="price">{{p.last}} {{p.quote_asset}}</span>
                <span :class="getColor(p.rate)">{{(p.rate || 0).toFixed(2)}}%</span>
              </div>
            </div>
          </template>
        </div>
        <div class="coin-list" v-if="symbolsArrC">
          <template v-for="(p, i) in mainPrices">
            <div class="coin-item" :key="i" v-if="i>1">
              <div class="coin-name">{{p.symbol1}}</div>
              <div class="price-content">
                <span class="price">{{p.last}} {{p.quote_asset}}</span>
                <span :class="getColor(p.rate)">{{(p.rate || 0).toFixed(2)}}%</span>
              </div>
            </div>
          </template>
        </div>
        <div class="operate-content">
          <a href="/mobile/sign-up?routeType=sign-in">{{$t('sign-in')}}</a>
          <a class="reg-btn" href="/mobile/sign-up">{{$t('sign-up')}}</a>
        </div>
        <div class="sub-title">{{$t('advantages.title')}}</div>
        <div class="advantage-content">
          <div class="advantage-item" v-for="(item,i) in features" :key="i">
            <div class="item-head">
              <img :src="item.icon" alt="">
            </div>
            <div class="item-text">
              <p class="title">{{$t(item.name)}}</p>
              <p class="describe">{{$t(item.desc)}}</p>
            </div>
          </div>
        </div>
        <div class="sub-title">{{$t('apps.title')}}</div>
        <div class="app-btns">
          <!--<a v-for="(item, idx) in apps" :key="idx"-->
             <!--:href="item.link"-->
             <!--class="app-btn" target="_blank">-->
            <!--<span>{{item.name}}</span>-->
          <!--</a>-->
          <router-link v-for="(item, idx) in apps" :key="idx"
             :to="item.link"
             class="app-btn">
            <span>{{item.name}}</span>
          </router-link>
          <!--<a href="itms-services://?action=download-manifest&url=https://ztstatictest.oss-cn-hangzhou.aliyuncs.com/ZT.plist"-->
          <!--class="app-btn" target="_blank">-->
          <!--<span>ios</span>-->
          <!--</a>-->
          <!--<a href="itms-services://?action=download-manifest&url=https://ztstatictest.oss-cn-hangzhou.aliyuncs.com/ZT.plist"-->
             <!--class="app-btn" target="_blank">-->
            <!--<span>ios</span>-->
          <!--</a>-->
        </div>
      </div>
    </div>
    <div class="down-layer-container">
      <div class="down-layer">
        <div class="logo">
          <img :src="require('assets/logo-zt.png')"/>
        </div>
        <div class="web-name">
          <img :src="require('assets/mobile/site.png')"/>
        </div>
        <div class="down-app-btn" @click="toDown">{{$t('mobile.down')}}</div>
      </div>
    </div>
  </page-container>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { symbolsMixin } from '../../utils/HomeMixin'

export default {
  name: 'MobileSignIn',
  mixins: [symbolsMixin],
  data() {
    return {
      features: [
        {
          name: 'advantages.2.title',
          desc: 'advantages.2.desc',
          icon: require('assets/mobile/advantage01.png'),
        },
        {
          name: 'advantages.3.title',
          desc: 'advantages.3.desc',
          icon: require('assets/mobile/advantage02.png'),
        },
        {
          name: 'advantages.4.title',
          desc: 'advantages.4.desc',
          icon: require('assets/mobile/advantage03.png'),
        },
        {
          name: 'advantages.6.title',
          desc: 'advantages.6.desc',
          icon: require('assets/mobile/advantage04.png'),
        },
      ],
    }
  },
  created() {
    this.getSymbols().then(() => {
      // this.listenPrices()
    }).catch(this.snackBar.error)
    // this.getUserInfo().then((res) => {
    //   if (res.id) {
    //     window.location.replace('/')
    //   }
    // })
  },
  // beforeDestroy() {
  //   this.listenPricesUnsubscribe()
  // },
  computed: {
    ...mapState(['siteInfo']),
    // 交易对
    mainPrices() {
      return this.symbolsArrC.filter(item => item.recommend).splice(0, 4)
    },
    // app下载
    apps() {
      return [
        {
          name: 'android',
          link: '/mobile/down-android',
        },
        {
          name: 'iOS',
          link: '/mobile/down-ios',
        },
      ]
    },
  },
  methods: {
    ...mapActions('market', ['getSymbols']),
    ...mapActions('user', ['getUserInfo']),
    // 前往下载
    toDown() {
      if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
        this.$router.push('/mobile/down-ios')
      } else if (/(Android)/i.test(navigator.userAgent)) {
        this.$router.push('/mobile/down-android')
      } else {
        this.$router.push('/mobile/down-android')
      }
    },
  },
}
</script>
