<template>
  <page-container class="container-inner home">
    <banner class="banner-wrap" :banners="showBanners"/>
    <div v-if="symbols" class="content market">
      <div class="prices">
        <tab class="tab-sector"
             v-model="tab"
             :options="tabOptions"
             :tabStyle="{padding: '0 .3rem'}"/>
        <div class="search-wrap">
          <input class="search"
                 type="text"
                 :value="keyword.currValue"
                 :placeholder="$t(keyword.placeholder)"
                 @input="setKeyword">
          <span class="iconfont icon-search"></span>
        </div>
        <tab v-if="tab1Options.length>1"
             class="tab-asset"
             v-model="tab1"
             :options="tab1Options"/>
        <my-table class="table"
                  :heads="heads"
                  :data="tableData"
                  :headTrStyle="{height:'.5rem',border:'none',opacity:'.6'}"
                  :trStyle="{border:'none',cursor:'pointer'}"
                  :searching="searching"
                  @select="select(tableData[$event].ID)"
                  @sort="setSort"
                  @clickTr="goExchange"
                  @error="log"/>
      </div>
    </div>
    <section class="content join">
      <h2 v-html="$t('join.tip')"></h2>
      <router-link class="btn" to="/sign-up">{{$t('join.immediately')}}</router-link>
      <img :src="require('assets/client/home/home-zg-pic-$.jpg')" alt="">
    </section>
    <section class="content features">
      <h2>{{$t(features.title)}}</h2>
      <p>{{$t(features.desc)}}</p>
      <img :src="features.bg" alt="">
      <div class="items">
        <section v-for="(item, i) in features.items" class="item transition" :key="i">
          <img class="transition" :src="require('assets/client/home/home-zg-bg.jpg')" alt="">
          <span class="iconfont transition" :class="item.icon"></span>
          <h3 class="transition">{{$t(item.name)}}</h3>
          <p class="transition">{{$t(item.desc)}}</p>
        </section>
      </div>
    </section>
    <section class="content apps">
      <img class="bg" :src="require('assets/client/home/home-zg-phone.jpg')" alt="">
      <h2>{{$t(apps.title)}}</h2>
      <p v-for="(p,i) in appsDesc" :key="i">{{p}}</p>
      <div class="btns">
        <div v-for="(app,i) in apps.items" class="btn"
             :key="i">
          <span class="iconfont" :class="app.icon"></span>
          {{app.name}}
          <span class="tooltip">
            <span class="tooltip-tip" v-if="!app.link">{{$t('developing')}}</span>
            <template v-else>
              <img-tag class="qrcode" :src="qrCode(app.link)"/>
              <span class="tooltip-tip-1">{{$t('apps.down')}}</span>
            </template>
          </span>
        </div>
      </div>
    </section>
    <section class="content news" ref="newsEl">
      <h2>{{$t(articleTitle)}}
        <span v-if="article.options.length>1">
          <span v-for="(t, i) in article.options" class="type"
                :class="{active: article.value===t.value}" :key="i"
                @click="article.value=t.value">{{$t(t.name)}}</span>
        </span>
      </h2>
      <div class="news-wrap-content">
        <span class="iconfont icon-right" @click="toNext"></span>
        <span class="iconfont icon-right left" @click="toPrev"></span>
        <div class="news-wrap transition" :style="{left}">
          <router-link v-for="(n, i) in articles" class="news-item transition"
                       :style="newsItemStyle"
                       :to="showArticle.route+'/'+n.id+'?classId='+n.news_class_id"
                       :class="{now: i===articles.length-1}" :key="i">
            <time class="transition">{{n.dateline|datePipe({fmt:'MM/DD'})}}</time>
            <div class="c">
              <img :src="require('assets/client/home/home-zg-bg-2.jpg')" alt="">
              <h3 class="transition">{{n.title}}</h3>
              <p class="transition">{{n.resume||n.title}}</p>
            </div>
          </router-link>
        </div>
      </div>
    </section>
  </page-container>
</template>

<script>
import Banner from 'components/client/Banner-zg'
import Tab from 'components/client/Tab-zg'
import ExchangeSector from 'data/immutable-data/ExchangeSector'
import { CustomCoin } from 'utils/CustomCoin'
import Debounce from 'utils/Debounce'
import { symbolsMixin } from 'utils/HomeMixin'
import { orderBy } from 'utils/Sort'
import { QrCode } from 'utils/Utils'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'Home-zg',
  components: { Tab, Banner },
  mixins: [symbolsMixin],
  data() {
    return {
      wrap: '',
      tab: 'all',
      tab1: '',
      sortType: {},
      keyword: {
        placeholder: 'symbol.search',
        value: '',
        currValue: '',
        debonce: new Debounce(),
      },
      searching: false,
      features: {
        title: 'zg.features.title',
        desc: 'zg.features.desc',
        bg: require('assets/client/home/home-zg-bg-1.jpg'),
        items: [
          { name: 'zg.features.power', desc: 'zg.features.power.desc', icon: 'icon-love' },
          { name: 'zg.features.bonus', desc: 'zg.features.bonus.desc', icon: 'icon-bonus' },
          { name: 'zg.features.speed', desc: 'zg.features.speed.desc', icon: 'icon-speed-shield' },
          { name: 'zg.features.vip', desc: 'zg.features.vip.desc', icon: 'icon-crown' },
        ],
      },
      article: {
        value: 'news',
        options: [
          { name: 'announce', value: 'news', route: '/article/announce' },
          // { name: 'help', value: 'help', route: '/article/help' },
        ],
      },
      showIndex: 0,
      newsWidth: '',
    }
  },
  computed: {
    ...mapState('market', ['quoteAssets', 'symbolClasses']),
    ...mapState('article', ['articleList']),
    ...mapState(['banners', 'siteInfo']),
    apps() {
      return {
        title: 'zg.app.title',
        desc: 'zg.app.desc',
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
          {
            name: 'Windows',
            icon: 'icon-windows',
            link: this.siteInfo.windows_url,
          },
        ],
      }
    },
    newsItemStyle() {
      return { width: `calc((${this.newsWidth}px - .2rem * 2) / 3)` }
    },
    showArticle() {
      const { options, value } = this.article
      return options.find(item => item.value === value) || {}
    },
    left() {
      return `calc(((100% - .2rem * 2) / 3 + .2rem) * ${-this.showIndex})`
    },
    articleTitle() {
      return (this.article.options.find(op => op.value === this.article.value) || {}).name
    },
    articles() {
      return [...((this.articleList[this.article.value] || {})[this.article.value] || [])]
        .reverse()
    },
    appsDesc() {
      return this.$t(this.apps.desc).split('\n')
    },
    showBanners() {
      return this.banners.filter(b => b.endpoint === 'web')
    },
    symbolsObject() {
      return ExchangeSector
        .getSymbols(this.symbolsArr, this.tab, this.dealSymbol, this.keyword.value)
    },
    symbols() {
      if (this.symbolsArrC instanceof Array) return this.symbolsArrC
      return this.symbolsArrC[this.tab1] || []
    },
    heads() {
      const formatter = (item, alias) => {
        const val = item[alias] || 0
        return `<span class="table-value content-4">${val}</span><br>${this.$cEx(item[`${alias}1`])}`
      }
      const sort = this.tab !== 'up-down'
      return [
        {
          type: 'select',
          style: { width: '3%', whiteSpace: 'nowrap' },
          checkboxStyle: { margin: '0 0 0 .2rem' },
          sort,
        },
        {
          name: 'pair',
          alias: 'symbolObj',
          sort,
          formatter: (item) => {
            const { base_asset, quote_asset, classes = [] } = item
            return `<div class="nowrap content-4" style="color:inherit">
                      <span class="table-value content-4">${base_asset}</span>/${quote_asset}
                      ${['custom', 'all', 'up-down'].includes(this.tab) ? classes.map(c => `<span class="table-sector">${c.shorthand}</span>`).join('') : ''}
                    </div>`
          },
          style: { width: '15%' },
        },
        {
          name: 'coin',
          alias: 'base_asset_name',
          formatter: (item, alias) => item[alias] || item.base_asset,
          sort,
        },
        { name: 'last-price', alias: 'last', formatter, sort },
        { name: 'max-price', alias: 'high', formatter, sort },
        { name: 'min-price', alias: 'low', formatter, sort },
        {
          name: 'change',
          alias: 'rate',
          formatter: (item) => {
            const value = `${(item.rate || 0).toFixed(2)}%`
            const color = this.getColor(item.rate)
            return `<span class="${color} content-4">${value}</span>`
          },
          style: { padding: '0 .3rem 0 0' },
        },
        {
          name: '24h-vol',
          alias: 'volume',
          formatter,
          sort,
        },
        {
          sort: false,
          style: { width: '10%', textAlign: 'right' },
          formatter: () => `<span class="font-main" style="font-size:inherit;color:inherit">${this.$t('exchange.go')} >></span>`,
        },
      ]
    },
    // mainPrices() {
    //   return this.symbolsArr.filter(item => item.recommend)
    // },
    tableData() {
      const { alias = 'volume', value = 'desc' } = this.sortType
      return (this.tab !== 'up-down' && alias && value)
      || (this.tab === 'up-down' && alias === 'rate')
        ? orderBy(this.symbols,
          this.arrC.includes(alias) ? alias + 1 : alias,
          value,
          this.arrC.includes(alias))
        : this.symbols
    },
    tabOptions() {
      return ExchangeSector.getSectors(this.symbolClasses)
        .map(item => ({ ...item, value: item.id }))
    },
    tab1Options() {
      return this.symbolsArrC instanceof Array
        ? []
        : Object.keys(this.symbolsArrC).map(k => this.tabName({ name: k, value: k }))
    },
  },
  watch: {
    'article.value'() {
      this.getArticleList()
    },
    articles(val) {
      this.showIndex = val && val.length > 3 ? val.length - 3 : 0
    },
    symbolsArrC() {
      this.initTab()
    },
  },
  methods: {
    ...mapActions('market', ['getSymbols', 'getSymbolClasses', 'listenPrices', 'listenPricesUnsubscribe', 'updateSymbol']),
    ...mapActions('article', ['getArticles']),
    listenPrice() {
      this.listenPricesUnsubscribe()
        .then(() => this.listenPrices())
        .catch(this.snackBar.error)
    },
    initTab() {
      if (Object.keys(this.symbolsArrC).length > 0) {
        const keys = Object.keys(this.symbolsArrC)
        if (!this.tab1 || !keys.includes(this.tab1)) {
          [this.tab1] = keys
        }
      }
    },
    tabName(item) {
      return {
        ...item,
        name: `${item.icon ? `<img src="${item.icon}" style="margin: 0 .1rem 0 0">` : ''}${item.value}`,
        needTran: false,
      }
    },
    select(ID) {
      const item = this.symbols.find(i => i.ID === ID);
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
      if (index < this.articles.length - 2) {
        this.showIndex = index
      }
    },
    getWidth() {
      this.newsWidth = this.$refs.newsEl.clientWidth
    },
    setKeyword(ev) {
      const { target: { value } } = ev
      this.keyword.currValue = value
      this.keyword.debonce.handle(() => {
        this.keyword.value = value
      })
    },
    goExchange(index) {
      const item = this.tableData[index]
      this.$router.push(`/exchange?coin=${item.symbol}&tab=${this.tab}`)
    },
    qrCode(url) {
      return QrCode(url, { width: 240 }).catch(this.snackBar.error)
    },
    getSymbolsArrC() {
      return this.symbolsObject
    },
  },
  beforeMount() {
    this.searching = true
    this.getSymbolClasses()
      .catch(this.snackBar.error)
    this.getSymbols()
      .then(() => {
        this.listenPrice()
      })
      .catch(this.snackBar.error)
      .then(() => {
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
  },
  beforeDestroy() {
    this.listenPricesUnsubscribe()
    window.removeEventListener('resize', this.getWidth)
  },
}
</script>
