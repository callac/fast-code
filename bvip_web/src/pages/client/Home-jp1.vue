<template>
  <page-container class="container-inner home">
    <banner class="banner-wrap" :banners="showBanners"/>
    <div v-if="symbolsArrC" class="content market">
      <div class="prices">
        <tab v-model="tab.value" :options="tabOptions"
             :tabStyle="{width: '1.4rem', height: '.4rem', lineHeight: '.4rem'}"
             :selectedStyle="{color: '#fff'}"/>
        <div class="search-wrap">
          <input class="search"
                 type="text"
                 :value="keyword.currValue"
                 :placeholder="$t(keyword.placeholder)"
                 @input="setKeyword">
          <span class="iconfont icon-search"></span>
        </div>
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
      <h2>{{$t(features.title)}}</h2>
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
    <section class="content description">
      <div class="wrap">
        <h2>{{$t('platform.title')}}</h2>
        <p class="desc" :class="$i18n.locale.includes('zh')?'zh':$i18n.locale"
           v-for="(p,i) in $t('platform.desc').split('\n')" :key="i">{{p}}</p>
        <div class="logos">
          <div class="logo" v-for="(l, i) in logos" :key="i"><img :src="l.logo" alt="logo"></div>
        </div>
      </div>
    </section>
    <!--<section class="content history">-->
    <!--<h2>{{$t('history.title')}}</h2>-->
    <!--<p class="desc">{{$t('history.desc')}}</p>-->
    <!--<div class="history-wrap" ref="historyWrap">-->
    <!--<div class="btns">-->
    <!--<div class="btn-pre iconfont icon-left-arrow" @click="showHistory(-1)"></div>-->
    <!--<div class="btn-next iconfont icon-left-arrow" @click="showHistory(1)"></div>-->
    <!--</div>-->
    <!--<div class="wrap transition" :style="wrapStyle">-->
    <!--<div class="history-item"-->
    <!--v-for="(item,i) in history"-->
    <!--:class="{selected: i===historyAbout.showIndex}"-->
    <!--:style="{left: i * historyAbout.offsetWidth+'rem'}"-->
    <!--:key="i">-->
    <!--<time>{{item.time}}</time>-->
    <!--<p class="text">{{item.content}}</p>-->
    <!--</div>-->
    <!--</div>-->
    <!--</div>-->
    <!--</section>-->
    <!--<section class="content news">-->
    <!--<h2>{{$t(showArticle.name)}}-->
    <!--<span v-if="article.options.length>1">-->
    <!--<span v-for="(t, i) in article.options" class="type"-->
    <!--:class="{active: article.value===t.value}" :key="i"-->
    <!--@click="article.value=t.value">{{$t(t.name)}}</span>-->
    <!--</span>-->
    <!--</h2>-->
    <!--<div class="news-wrap-content">-->
    <!--<router-link v-if="articles.first"-->
    <!--class="news-item-1"-->
    <!--:to="showArticle.route-->
    <!--+'/'+articles.first.id+'?classId='+articles.first.news_class_id">-->
    <!--<img :src="require('assets/client/home/jp1/<<theme>>/pic-news.jpg')" alt="">-->
    <!--<h3>{{ellipsis(articles.first.title, 15)}}</h3>-->
    <!--<p>{{ellipsis(articles.first.resume||articles.first.title, 30)}}-->
    <!--<time>{{articles.first.dateline|datePipe({fmt:'MM/DD'})}}</time>-->
    <!--</p>-->
    <!--</router-link>-->
    <!--<div class="right">-->
    <!--<router-link v-for="(n, i) in articles.right" class="news-item"-->
    <!--:class="{before: n.isNew}"-->
    <!--:to="showArticle.route+'/'+n.id+'?classId='+n.news_class_id"-->
    <!--:key="i">-->
    <!--<h3>{{ellipsis(n.title, 15)}}</h3>-->
    <!--<time>{{n.dateline|datePipe({fmt:'MM/DD'})}}</time>-->
    <!--</router-link>-->
    <!--</div>-->
    <!--</div>-->
    <!--<router-link class="btn btn-more btn-main" :to="showArticle.route">MORE >></router-link>-->
    <!--</section>-->
    <section class="content apps">
      <img class="app-img" :src="require('assets/client/home/home-apps-jp-jp.png')" alt="">
      <h2>{{$t(apps.title)}}</h2>
      <p class="desc" v-for="(p,i) in appsDesc" :key="i">{{p}}</p>
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
/* eslint-disable import/no-unresolved,no-param-reassign */

import Banner from 'components/client/Banner-jp'
import Tab from 'components/client/Tab'
import { CustomCoin } from 'utils/CustomCoin'
import Debounce from 'utils/Debounce'
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
      keyword: {
        placeholder: 'symbol.search',
        value: '',
        currValue: '',
        debonce: new Debounce(),
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
            icon: require('assets/client/home/jp1/<<theme>>/pic-1.png'),
          },
          {
            name: 'advantages.2.title',
            desc: 'advantages.2.desc',
            icon: require('assets/client/home/jp1/<<theme>>/pic-2.png'),
          },
          {
            name: 'advantages.3.title',
            desc: 'advantages.3.desc',
            icon: require('assets/client/home/jp1/<<theme>>/pic-3.png'),
          },
          {
            name: 'advantages.4.title',
            desc: 'advantages.4.desc',
            icon: require('assets/client/home/jp1/<<theme>>/pic-4.png'),
          },
          {
            name: 'advantages.5.title',
            desc: 'advantages.5.desc',
            icon: require('assets/client/home/jp1/<<theme>>/pic-5.png'),
          },
          {
            name: 'advantages.6.title',
            desc: 'advantages.6.desc',
            icon: require('assets/client/home/jp1/<<theme>>/pic-6.png'),
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
      historyAbout: {
        wrapWidth: 0,
        showIndex: 0,
        offsetWidth: 2.6,
        historyItemWidth: 3.2,
      },
      qrcode: {},
      logos: [
        // { logo: require('assets/client/home/jp1/<<theme>>/logo-1.png') },
        // { logo: require('assets/client/home/jp1/<<theme>>/logo-2.png') },
        // { logo: require('assets/client/home/jp1/<<theme>>/logo-3.png') },
      ],
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
    showArticle() {
      const { options, value } = this.article
      return options.find(item => item.value === value) || {}
    },
    wrapWidth() {
      const { length } = this.history
      const { offsetWidth, historyItemWidth } = this.historyAbout
      return `${Math.max(length - 1, 0) * offsetWidth + historyItemWidth}`
    },
    minLeft() {
      const { wrapWidth } = this.historyAbout
      return -this.wrapWidth + wrapWidth / window.rootSize.value
    },
    wrapStyle() {
      const { showIndex, offsetWidth } = this.historyAbout
      const left = Math.max(-offsetWidth * showIndex, this.minLeft)
      return { width: `${this.wrapWidth}rem`, left: `${left}rem` }
    },
    articles() {
      return [...((this.articleList[this.article.value] || {})[this.article.value] || [])]
        .slice(0, 7)
        .reverse()
        .reduce((pre, item, i) => {
          if (i === 0) {
            pre.first = item
          } else {
            pre.right.push({ ...item, isNew: i < 4 })
          }
          return pre
        }, { first: null, right: [] })
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
        {
          sort: false,
          style: { width: '10%', textAlign: 'center', paddingLeft: '5%' },
          formatter: () => `<img src="${require('assets/icon-exchange.png')}">`,
        },
      ]
    },
    tableData() {
      if (!this.symbolsArrC) return []
      const val = this.tab.value
      const { alias = 'volume', value = 'desc' } = this.sortType
      return (alias && value
        ? orderBy(this.symbolsArrC, this.arrC.includes(alias) ? alias + 1 : alias,
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
    history() {
      return [...Array(6)].map((a, i) => {
        const arr = this.$t(`history.${i + 1}`).split('\n')
        return { time: this.dateFormatter(arr[0], 'YYYY-MM'), content: arr[1] }
      })
    },
  },
  watch: {
    'article.value'() {
      this.getArticleList()
    },
    quoteAssets() {
      this.initTab()
    },
    history: {
      handler(val) {
        this.historyAbout.showIndex = val.length - 1
      },
      immediate: true,
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
      if (!this.articles.first) {
        this.getArticles({ type: this.article.value }).catch(this.snackBar.error)
      }
    },
    setQrcode(app) {
      QrCode(app.link || this.$t('coming-soon')).then((url) => {
        this.qrcode = {
          exist: !!app.link,
          url,
        }
      }).catch(this.snackBar.error)
    },
    getWidth() {
      this.$nextTick(() => {
        if (this.$refs.historyWrap) {
          this.historyAbout.wrapWidth = this.$refs.historyWrap.clientWidth
        }
      })
    },
    goExchange(index) {
      const item = this.tableData[index]
      this.$router.push(`/exchange?coin=${item.symbol}`)
    },
    setKeyword(ev) {
      const { target: { value } } = ev
      this.keyword.currValue = value
      this.keyword.debonce.handle(() => {
        this.keyword.value = value
      })
    },
    showHistory(delta = 1) {
      const showIndex = this.historyAbout.showIndex + delta
      if (showIndex >= 0 && showIndex < this.history.length) this.historyAbout.showIndex = showIndex
    },
    getSymbolsArrC() {
      const symbols = this.symbolsArr ? this.symbolsArr
        .map(this.dealSymbol) : []
      const value = this.keyword.value.toUpperCase()
      if (!value) return symbols
      return symbols.filter(item => item.symbol.toUpperCase().includes(value)
        || item.symbol1.toUpperCase().includes(value))
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
    setTimeout(() => {
      this.getWidth()
      window.addEventListener('resize', this.getWidth)
    }, 1000)
    this.setQrcode(this.apps.items[0])
  },
  beforeDestroy() {
    this.listenPricesUnsubscribe()
    window.removeEventListener('resize', this.getWidth)
  },
}
</script>
