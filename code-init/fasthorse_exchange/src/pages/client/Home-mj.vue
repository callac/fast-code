<template>
  <page-container class="container-inner home">
    <div v-if="symbolsArrC" class="market">
      <vue-seamless-scroll :data="mainPrices" :class-option="optionLeft" class="seamless-warp2">
        <table class="scroll-box">
          <tr>
            <td v-for="(p, i) in mainPrices" :key="i">
              <router-link class="main-price"
                           :to="'/exchange?coin='+p.symbol">
                <div>
                  <h2>{{p.base_asset}}/{{p.quote_asset}}
                    <em class="rate" :class="getColor(p.rate)">{{(p.rate||0).toFixed(2)+'%'}}</em>
                  </h2>
                  <em class="price" :class="getColor(p.rate)">
                    {{p.last||0}} <span class="unit">{{p.quote_asset}}</span></em>
                </div>
                <div>
                  <img
                    v-if="parseFloat(p.rate) < 0"
                    :src="require('assets/client/home/home-mj-wave-red.png')" alt="">
                  <img v-else :src="require('assets/client/home/home-mj-wave-green.png')" alt="">
                </div>
              </router-link>
            </td>
          </tr>
        </table>
      </vue-seamless-scroll>
    </div>
    <div class="banner-wrap">
      <p>{{$t('banner-text-1')}}</p>
      <p>{{$t('banner-text-2')}}</p>
      <p>
        <router-link to="/exchange">{{$t('start')}}</router-link>
      </p>
    </div>
    <div class="market-content">
      <!--<div class="market-title">-->
      <!--<p>The HBUS Marketplace is Now Huobi!</p>-->
      <!--<p>Huobi Launch Promotion: Earn 20 USDT and Enjoy 0.05% Trading Fees</p>-->
      <!--<p>Huobi Will Support the Upcoming Ethereum Constantinople Hard Fork-->
      <!--<a href="/article/announce">VIEW ALl</a>-->
      <!--</p>-->
      <!--</div>-->
      <div class="market-title">
        <div v-for="(item, idx) in announce" :key="idx">
          <p>
            <vue-seamless-scroll
              :data="announce"
              :class-option="optionLeft2"
              :class="[announce.length === 1 ? 'only-one' : '', 'seamless-announce']">
              <router-link :to="'/article/announce/'+[item][0].id">
                {{[item][0].title}}
              </router-link>
            </vue-seamless-scroll>
          </p>
        </div>
        <div v-if="announce.length === 3" class="view-more">
          <a href="/article/announce">{{$t('view-all')}}</a>
        </div>
      </div>
      <div class="prices">
        <tab v-model="tab.value" :options="tabOptions" :tabStyle="tabStyle"/>
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
    <section class="content features">
      <h2 class="h2">{{$t('advantages.title')}}</h2>
      <div class="items">
        <section v-for="(item, i) in features.items" class="item" :key="i">
          <!-- <img v-if="i%2===0" class="transition" :src="item.icon"/> -->
          <div class="item-head" :style="backStyle(item.icon)"></div>
          <div class="item-text">
            <h3>{{$t(item.name)}}</h3>
            <p class="describe">{{$t(item.desc)}}</p>
          </div>
          <!-- <img v-if="i%2===1" class="transition" :src="item.icon"/> -->
        </section>
      </div>
    </section>
    <section class="content apps">
      <!-- <img :src="require('assets/client/home/home-app-bg-t3-self_help.jpg')" alt=""> -->
      <div class="btns">
        <div>
          <div class="content-title">
            <h2>{{$t(apps.title)}}</h2>
            <p v-for="(p,i) in appsDesc" :key="i">{{p}}</p>
          </div>
          <div v-for="(item,i) in apps.items" :key="i"
               class="btn-clock">
            <template v-for="(app,k) in item">
              <template v-if="k>0">
                <a v-if="app.link" class="btn" target="_blank" :href="app.link"
                   :key="k">
                  <span class="iconfont" :class="app.icon"></span>
                  {{app.name}}
                </a>
                <button v-else class="btn" :key="k" @click="snackBar.info($t('developing'))">
                  <span class="iconfont" :class="app.icon"></span>
                  {{app.name}}
                </button>
              </template>
            </template>
          </div>
        </div>
        <img class="app-img" :src="require('assets/client/home/home-mj-phone.png')" alt="">
      </div>
    </section>
  </page-container>
</template>

<script>
/* eslint-disable import/no-unresolved */
import { CustomCoin } from 'utils/CustomCoin'
import Tab from 'components/client/Tab-mj'
import { symbolsMixin } from 'utils/HomeMixin'
import { orderBy } from 'utils/Sort'
import VueSeamlessScroll from 'vue-seamless-scroll'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'Home',
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
      swiperOption: {
        direction: 'vertical',
        height: 40,
        speed: 300,
        autoplay: {
          delay: 3000,
        },
      },
      searching: false,
      features: {
        title: 'advantages.title',
        desc: 'advantages.desc',
        items: [
          {
            name: 'advantages.1.title',
            desc: 'advantages.1.desc',
            icon: require('assets/client/home/home-adv-1-<<template>>-<<theme>>.png'),
          },
          {
            name: 'advantages.2.title',
            desc: 'advantages.2.desc',
            icon: require('assets/client/home/home-adv-2-<<template>>-<<theme>>.png'),
          },
          {
            name: 'advantages.3.title',
            desc: 'advantages.3.desc',
            icon: require('assets/client/home/home-adv-3-<<template>>-<<theme>>.png'),
          },
          {
            name: 'advantages.4.title',
            desc: 'advantages.4.desc',
            icon: require('assets/client/home/home-adv-4-<<template>>-<<theme>>.png'),
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
          [
            {
              icon: require('assets/client/home/home-phone-<<template>>-<<theme>>.png'),
            },
            {
              name: 'IOS',
              icon: 'icon-iphone',
              link: this.siteInfo.ios_url,
            },
            {
              name: 'Android',
              icon: 'icon-android',
              link: this.siteInfo.android_url,
            },
          ],
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
    // announce() {
    //   return this.articles[this.articles.length - 1] || {}
    // },
    tabStyle() {
      return {
        display: 'flex',
        justifyContent: 'flex-start',
        flexWrap: 'nowrap',
      }
    },
    announce() {
      const arr = this.articles
      const reverseArr = arr.reverse()
      return (reverseArr.length < 4 ? reverseArr : reverseArr.slice(0, 3)) || []
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
        return `<span class="table-value" style="font-size:inherit">${val}</span>${this.$cEx(item[`${alias}1`])}`
      }
      return [
        {
          type: 'select',
          style: { width: '3%', whiteSpace: 'nowrap', textAlign: 'left' },
          // checkboxStyle: { margin: '0 0 0 .2rem' },
        },
        {
          name: 'pair',
          alias: 'symbolObj',
          sort: 'symbol',
          formatter: (item) => {
            const { base_asset, quote_asset } = item
            return `<span class="table-value" style="font-size:inherit">${base_asset}</span>/${quote_asset}`
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
            return `<span class="${color}" style="font-size:inherit">${value}</span>`
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
      return this.symbolsArrC.filter(item => item.recommend)
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
    optionLeft() {
      return {
        direction: 2,
        limitMoveNum: 4,
      }
    },
    optionLeft2() {
      return {
        // direction: 2,
        // limitMoveNum: 4,
        step: 0.3, // 数值越大速度滚动越快
        limitMoveNum: 2, // 开始无缝滚动的数据量 this.dataList.length
        hoverStop: true, // 是否开启鼠标悬停stop
        direction: 2, // 0向下 1向上 2向左 3向右
        openWatch: true, // 开启数据实时监控刷新dom
        singleHeight: 0, // 单步运动停止的高度(默认值0是无缝不停止的滚动) direction => 0/1
        singleWidth: 0, // 单步运动停止的宽度(默认值0是无缝不停止的滚动) direction => 2/3
        waitTime: 1000, // 单步运动停止的时间(默认值1000ms)
        switchOffset: 2000,
        switchSingleStep: 2000,
      }
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
    backStyle(url) {
      return {
        background: `url(${url}) no-repeat center center / auto`,
      }
    },
    bgStyle(url, i) {
      if (i === 0) {
        return {
          background: `url(${url}) no-repeat left center / auto`,
        }
      }
      return {
        background: `url(${url}) no-repeat 1.6rem center / auto`,
        borderRight: 'none',
        paddingLeft: '3.2rem',
        paddingRight: 0,
      }
    },
    goExchange(index) {
      const item = this.tableData[index]
      this.$router.push(`/exchange?coin=${item.symbol}`)
    },
  },
  components: { VueSeamlessScroll, Tab },
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
  beforeDestroy() {
    this.listenPricesUnsubscribe()
    // window.removeEventListener('resize', this.getWidth)
  },
}
</script>
