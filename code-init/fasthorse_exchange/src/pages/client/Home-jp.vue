<template>
  <page-container class="container-inner home">
    <banner class="banner-wrap" :banners="showBanners"/>
    <div class="content announce-wrap">
      <div class="left">
        <span class="iconfont icon-horn"></span>
        <span class="h">{{$t('announce')}}： </span>
        <router-link v-if="announce.id"
                     :to="'/article/announce/'+announce.id"
                     class="announce">
          {{announce.title}}
        </router-link>
        <span v-else class="announce">{{$t('no-announce')}}</span>
      </div>
      <router-link to="/article/announce">{{$t('more')}} ></router-link>
    </div>
    <div v-if="symbolsArrC" class="content market">
      <!--<div v-if="mainPrices.length>2" class="main-prices">
        <router-default-link v-for="(p, i) in mainPrices" class="main-price" :key="i"
                     :to="'/exchange?coin='+p.symbol">
          <h2>{{p.base_asset}}/{{p.quote_asset}}
            <em class="rate" :class="getColor(p.rate)">{{(p.rate||0).toFixed(2)+'%'}}</em>
          </h2>
          <em class="price" :class="getColor(p.rate)">
            {{p.last||0}} <span class="unit">{{p.quote_asset}}</span></em>
        </router-default-link>
      </div>-->
      <div class="prices">
        <tab v-model="tab.value" :options="tabOptions"
             :tabStyle="{width: '1.4rem', height: '.4rem', lineHeight: '.4rem'}"
             :selectedStyle="{color: '#fff'}"/>
        <my-table class="table"
                  :heads="heads"
                  :data="tableData"
                  :headTrStyle="{height:'.5rem',opacity:'.6'}"
                  :trStyle="{cursor:'pointer'}"
                  :searching="searching"
                  @select="select(tableData[$event].ID)"
                  @sort="setSort"
                  @clickTr="goExchange"
                  @error="log"/>
      </div>
    </div>
    <section class="content features">
      <!--<h2>{{$t(features.title)}}</h2>-->
      <!--<p>{{$t(features.desc)}}</p>-->
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
    <!--<section class="content news" ref="newsEl">-->
    <!--<h2>{{$t(articleTitle)}}-->
    <!--<span v-if="article.options.length>1">-->
    <!--<span v-for="(t, i) in article.options" class="type"-->
    <!--:class="{active: article.value===t.value}" :key="i"-->
    <!--@click="article.value=t.value">{{$t(t.name)}}</span>-->
    <!--</span>-->
    <!--</h2>-->
    <!--<div class="news-wrap-content">-->
    <!--<div class="news-wrap transition" :style="{left}">-->
    <!--<div v-for="(n, i) in articles" class="news-item transition"-->
    <!--:style="newsItemStyle"-->
    <!--:class="{now: i===showIndex+1, before: i<showIndex+2, 'even': i%2===0}" :key="i">-->
    <!--<router-default-link class="c"
     :to="showArticle.route+'/'+n.id+'?classId='+n.news_class_id">-->
    <!--<div class="after"></div>-->
    <!--<time class="transition">{{n.dateline|datePipe({fmt:'MM/DD'})}}</time>-->
    <!--<h3 class="transition">{{ellipsis(n.title, 15)}}</h3>-->
    <!--<p class="transition">{{ellipsis(n.resume||n.title, 30)}}</p>-->
    <!--</router-default-link>-->
    <!--</div>-->
    <!--</div>-->
    <!--<div class="arrows">-->
    <!--<span class="iconfont icon-left-arrow left" @click="toPrev"></span>-->
    <!--<span class="iconfont icon-left-arrow" @click="toNext"></span>-->
    <!--</div>-->
    <!--</div>-->
    <!--<div class="mask"></div>-->
    <!--</section>-->
    <section class="content apps">
      <img class="app-img" :src="require('assets/client/home/home-apps-jp-jp.png')" alt="">
      <h2>{{$t(apps.title)}}</h2>
      <p v-for="(p,i) in appsDesc" :key="i">{{p}}</p>
      <div class="btns">
        <div class="img">
          <img class="qrcode" :src="qrcode.url">
          <div v-if="!qrcode.exist" class="text">{{$t('coming-soon')}}</div>
        </div>
        <div class="btn-wrap">
          <template v-for="(app,i) in apps.items">
            <a v-if="app.link" class="btn" target="_blank" :href="app.link"
               @mouseenter="setQrcode(app)" :key="i">
              <span class="iconfont" :class="app.icon"></span>
              {{app.name}}
            </a>
            <button v-else class="btn" @click="snackBar.info($t('developing'))"
                    @mouseenter="setQrcode(app)" :key="i">
              <span class="iconfont" :class="app.icon"></span>
              {{app.name}}
            </button>
          </template>
        </div>
      </div>
    </section>
  </page-container>
</template>

<script>
/* eslint-disable import/no-unresolved */

import Banner from 'components/client/Banner-jp'
import Tab from 'components/client/Tab'
import { CustomCoin } from 'utils/CustomCoin'
import { symbolsMixin } from 'utils/HomeMixin'
import { orderBy } from 'utils/Sort'
import { QrCode } from 'utils/Utils'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'Home',
  components: { Tab, Banner },
  mixins: [symbolsMixin],
  data() {
    return {
      wrap: '',
      tab: {
        value: 'custom',
        options: [
          { value: 'custom' },
        ],
      },
      sortType: {},
      searching: false,
      features: {
        title: 'advantages.title',
        desc: 'advantages.desc',
        items: [
          {
            name: 'advantages.1.title',
            desc: 'advantages.1.desc',
            icon: require('assets/client/home/home-icon-efficient-jp-jp.png'),
          },
          {
            name: 'advantages.2.title',
            desc: 'advantages.2.desc',
            icon: require('assets/client/home/home-icon-security-jp-jp.png'),
          },
          {
            name: 'advantages.3.title',
            desc: 'advantages.3.desc',
            icon: require('assets/client/home/home-icon-fast-jp-jp.png'),
          },
          {
            name: 'advantages.4.title',
            desc: 'advantages.4.desc',
            icon: require('assets/client/home/home-icon-server-jp-jp.png'),
          },
        ],
      },
      article: {
        value: 'news',
        options: [
          { name: 'news.title', value: 'news', route: '/article/announce' },
          // { name: 'help', value: 'help', route: '/article/help' },
        ],
      },
      showIndex: 0,
      newsWidth: '',
      qrcode: {},
    }
  },
  computed: {
    ...mapState('market', ['quoteAssets']),
    ...mapState('article', ['articleList']),
    ...mapState(['banners', 'siteInfo']),
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
    newsItemStyle() {
      return { width: `calc(${this.newsWidth}px / 3)` }
    },
    showArticle() {
      const { options, value } = this.article
      return options.find(item => item.value === value) || {}
    },
    left() {
      return `calc(100% / 3  * ${-this.showIndex} + ${this.newsWidth}px / 6)`
    },
    articleTitle() {
      return (this.article.options.find(op => op.value === this.article.value) || {}).name
    },
    articles() {
      return [...((this.articleList[this.article.value] || {})[this.article.value] || [])]
        .reverse()
    },
    announce() {
      return this.articles[this.articles.length - 1] || {}
    },
    appsDesc() {
      return this.$t(this.apps.desc).split('\n')
    },
    showBanners() {
      return this.banners.filter(b => b.endpoint === 'web')
    },
    heads() {
      const formatter = (item, alias) => {
        const val = item[alias] || 0
        return `<span class="table-value">${val}</span>${this.$cEx(item[`${alias}1`])}`
      }
      return [
        {
          type: 'select',
          style: { width: '3%', whiteSpace: 'nowrap' },
          checkboxStyle: { margin: '0 0 0 .2rem' },
        },
        {
          name: 'pair',
          alias: 'symbolObj',
          sort: 'symbol',
          formatter: (item) => {
            const { base_asset, quote_asset } = item
            return `<span class="table-value">${base_asset}</span>/${quote_asset}`
          },
          style: { width: '10%' },
        },
        {
          name: 'coin',
          alias: 'base_asset_name',
          formatter: (item, alias) => item[alias] || item.base_asset,
        },
        { name: 'last-price', alias: 'last', formatter },
        { name: 'max-price', alias: 'high', formatter },
        { name: 'min-price', alias: 'low', formatter },
        {
          name: 'change',
          alias: 'rate',
          formatter: (item) => {
            const value = `${(item.rate || 0).toFixed(2)}%`
            const color = this.getColor(item.rate)
            return `<span class="${color}">${value}</span>`
          },
          style: { padding: '0 .3rem 0 0' },
        },
        {
          name: '24h-vol',
          alias: 'volume',
          formatter,
          style: { textAlign: 'right' },
        },
      ]
    },
    mainPrices() {
      return this.symbolsArrC.filter(item => item.recommend).splice(0, 5)
    },
    tableData() {
      if (!this.symbolsArrC) return []
      const val = this.tab.value
      const { alias = 'volume', value = 'desc' } = this.sortType
      return (alias && value
        ? orderBy(this.symbolsArrC,
          this.arrC.includes(alias) ? alias + 1 : alias,
          value,
          this.arrC.includes(alias))
        : this.symbolsArrC)
        .filter(item => (val !== 'custom' ? item.quote_asset === val : item.tableSelected))
    },
    tabOptions() {
      return this.tab.options.map(item => ({
        ...item,
        name: `${item.icon ? `<img src="${item.icon}" style="margin: 0 .1rem 0 0">` : ''}${item.value}`,
      }))
    },
  },
  watch: {
    'article.value'() {
      this.getArticleList()
    },
    articles(val) {
      this.showIndex = val && val.length > 3 ? val.length - 3 : 0
    },
    quoteAssets() {
      this.initTab()
    },
  },
  methods: {
    ...mapActions('market', ['getSymbols', 'listenPrices', 'listenPricesUnsubscribe', 'updateSymbol']),
    ...mapActions('article', ['getArticles']),
    initTab() {
      if (this.quoteAssets.length > 0) {
        const options = [
          ...this.quoteAssets.map(as => ({ ...as, needTran: false })),
          { value: 'custom' },
        ]
        this.tab = {
          options,
          value: options[0].value,
        }
      }
    },
    select(ID) {
      const item = this.symbolsArrC.find(i => i.ID === ID);
      (!item.tableSelected ? CustomCoin.addCustom(item.ID) : CustomCoin.delCustom(item.ID))
        .then(() => {
          item.tableSelected = item.tableSelected ? '' : 'checked'
          this.updateSymbol(item)
        })
        .catch(this.snackBar.error)
    },
    setSort(val) {
      this.sortType = val
    },
    getArticleList() {
      if (this.articles.length < 1) {
        this.getArticles({ type: this.article.value }).catch(this.snackBar.error)
      } else if (this.articles.length > 3) {
        this.showIndex = this.articles.length - 3
      }
    },
    toPrev() {
      const index = this.showIndex - 1
      if (index > -1) {
        this.showIndex = index
      }
    },
    toNext() {
      const index = this.showIndex + 1
      if (index < this.articles.length - 1) {
        this.showIndex = index
      }
    },
    getWidth() {
      this.newsWidth = this.$refs.newsEl.clientWidth
    },
    setQrcode(app) {
      QrCode(app.link || this.$t('coming-soon')).then((url) => {
        this.qrcode = {
          exist: !!app.link,
          url,
        }
      }).catch(this.snackBar.error)
    },
    goExchange(index) {
      const item = this.tableData[index]
      this.$router.push(`/exchange?coin=${item.symbol}`)
    },
  },
  beforeMount() {
    this.searching = true
    this.getSymbols().then(() => {
      this.listenPrices()
    }).catch(this.snackBar.error).then(() => {
      this.searching = false
    })
    this.getArticleList()
    this.initTab()
  },
  mounted() {
    // setTimeout(() => {
    //   this.getWidth()
    //   window.addEventListener('resize', this.getWi dth)
    // }, 1000)
    this.setQrcode(this.apps.items[0])
  },
  beforeDestroy() {
    this.listenPricesUnsubscribe()
    // window.removeEventListener('resize', this.getWidth)
  },
}
</script>
