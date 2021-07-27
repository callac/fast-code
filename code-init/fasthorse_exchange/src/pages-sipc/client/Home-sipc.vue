<template>
  <page-container class="container-inner home">
    <banner class="banner-wrap" :banners="showBanners"/>
    <section class="content description">
      <h2>{{$t('platform.title')}}</h2>
      <p class="desc" :class="$i18n.locale.includes('zh')?'zh':$i18n.locale">
        {{$t('platform.desc')}}</p>
      <div class="links">
        <div class="link"
             v-for="(link, i) in links"
             :style="linkStyle"
             :key="i">
          <div class="link-img-wrap">
            <img class="link-img" :src="link.img" alt="link">
          </div>
          <router-link class="btn btn-main link-btn" :to="link.route">{{link.name}}
            <img :src="require('assets/client/home/sipc/icon-arrow.png')" alt="">
          </router-link>
        </div>
      </div>
    </section>
    <section class="content features">
      <h2>{{$t(features.title)}}</h2>
      <p class="desc">{{$t(features.desc)}}</p>
      <div class="items">
        <section v-for="(item, i) in features.items" class="item transition" :key="i">
          <img class="transition" :src="item.icon"/>
          <div class="text">
            <h3 class="transition">{{$t(item.name)}}</h3>
            <p class="transition">{{$t(item.desc)}}</p>
          </div>
        </section>
      </div>
    </section>
    <section class="content apps">
      <img class="app-img"
           :src="require('assets/client/home/sipc/<<theme>>/home-apps-img.png')"
           alt="home-apps-img">
      <h2>{{$t(apps.title)}}</h2>
      <p class="desc" v-for="(p,i) in appsDesc" :key="i">{{p}}</p>
      <div class="btns">
        <template v-for="(app,i) in apps.items">
          <a v-if="app.link" class="btn" target="_blank" :href="app.link" :key="i">
            <span class="iconfont" :class="app.icon"></span>
            {{app.name}}
          </a>
          <button v-else class="btn" @click="snackBar.info($t('developing'))" :key="i">
            <span class="iconfont" :class="app.icon"></span>
            {{app.name}}
          </button>
        </template>
      </div>
    </section>
  </page-container>
</template>

<script>
/* eslint-disable import/no-unresolved,no-param-reassign,import/no-dynamic-require */
import Banner from 'components/client/Banner-jp'
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'Home',
  components: { Banner },
  data() {
    return {
      features: {
        title: 'advantages.title',
        desc: 'advantages.desc',
        items: [
          {
            name: 'advantages.1.title',
            desc: 'advantages.1.desc',
            icon: require('assets/client/home/sipc/<<theme>>/pic-1.png'),
          },
          {
            name: 'advantages.2.title',
            desc: 'advantages.2.desc',
            icon: require('assets/client/home/sipc/<<theme>>/pic-2.png'),
          },
          {
            name: 'advantages.3.title',
            desc: 'advantages.3.desc',
            icon: require('assets/client/home/sipc/<<theme>>/pic-3.png'),
          },
          {
            name: 'advantages.4.title',
            desc: 'advantages.4.desc',
            icon: require('assets/client/home/sipc/<<theme>>/pic-4.png'),
          },
        ],
      },
    }
  },
  computed: {
    ...mapGetters(['siteInfo']),
    ...mapState(['banners']),
    links() {
      const links = ['/exchange', '/exchange/cash', '/user-center/assets-manage']
      return this.$t('platform.links')
        .split(';')
        .map((name, i) => ({
          name,
          route: (!this.siteInfo.c2cEnabled && links[i] === '/exchange/cash') ? '' : links[i],
          img: require(`assets/client/home/sipc/<<theme>>/platform-link-${i + 1}-img.png`),
        }))
    },
    linkStyle() {
      return {
        background: `url(${require('assets/client/home/sipc/<<theme>>/platform-link-bg.png')}) no-repeat right bottom/1.73rem auto`,
      }
    },
    apps() {
      return {
        title: 'apps.title',
        desc: 'apps.desc',
        items: [
          {
            name: 'App Store',
            icon: 'icon-iphone',
            link: this.siteInfo.ios_url,
          },
          {
            name: 'Android',
            icon: 'icon-android',
            link: this.siteInfo.android_url,
          },
        ],
      }
    },
    appsDesc() {
      return this.$t(this.apps.desc).split('\n')
    },
    showBanners() {
      return this.banners.filter(b => b.endpoint === 'web')
    },
  },
  methods: {
    setSort(val) {
      this.sortType = val
    },
  },
}
</script>
