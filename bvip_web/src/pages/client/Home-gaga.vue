<template>
  <page-container class="container-inner home">
    <section class="banner-wrap">
      <div class="banner-title">
        <h2>{{$t('platform.title')}}</h2>
        <h4>{{$t('platform.subtitle')}}</h4>
        <p class="count">
          <span>54</span>
          <span>124M+</span>
        </p>
        <p class="cover">
          <span>{{$t('countries.num')}}</span>
          <span>{{$t('customers.num')}}</span>
        </p>
        <div class="btn-wrap">
          <router-link class="view" :to="'/exchange'">{{$t('btn1.text')}}</router-link>
          <router-link class="log" :to="'/sign-in?redirectTo=%2F'">{{$t('btn2.text')}}</router-link>
        </div>
        <!-- <p @click="writeAnnounce">
          <img src="../../assets/client/home/banner-title.png" alt="">
        </p> -->
      </div>
      <div class="announce-wrap">
        <p>
          <span>Notice</span>
          <router-link class="more" :to="'/article/announce'"></router-link>
        </p>
        <ul class="items">
          <li v-for="(item, idx) in announce" :key="idx">
            <router-link v-if="item.id"
                      :to="'/article/announce/'+item.id"
                      class="announce">
            {{item.title}}
            </router-link>
          </li>
        </ul>
      </div>
      <!-- <banner :banners="showBanners"/> -->
    </section>
    <section class="created">{{$t('created.title')}}</section>
    <section v-if="symbolsArrC" class="content market">
      <div class="main-prices">
        <router-link v-for="(p, i) in mainPricesTwo" class="main-price" :key="i"
                     :to="'/exchange?coin='+p.symbol" :class="getColor(p.rate)">
          <h2>{{p.base_asset}}/{{p.quote_asset}}
            <em class="price" :class="getColor(p.rate)">
            {{p.last||0}} <span class="unit">{{p.quote_asset}}</span></em>
          </h2>
          <h2>{{p.base_asset}}
            <em class="rate" :class="getColor(p.rate)">{{(p.rate||0).toFixed(2)+'%'}}</em>
          </h2>
        </router-link>
        <div class="main-price pair-group">
          <h2>
            <span class="title">Trends</span>
            <router-link class="more" :to="'/exchange'">more></router-link>
          </h2>
          <router-link v-for="(l, i) in mainPricesFour" :key="i" class="pair-item"
            :to="'/exchange?coin='+l.symbol">
            <span class="f2">{{l.base_asset}}/{{l.quote_asset}}</span>
            <span class="f1" :class="getColor(l.rate)">{{l.last||0}}{{l.quote_asset}}</span>
            <span class="rate f1" :class="getColor(l.rate)">{{(l.rate||0).toFixed(2)+'%'}}</span>
          </router-link>
        </div>
      </div>
    </section>
    <section class="app-wrap">
      <h2 class="title">{{$t(apps.title)}}</h2>
      <div class="btn-wrap">
        <div v-for="(item,i) in apps.items" :key="i"
             class="btn-clock">
          <template v-for="(app,k) in item">
            <a v-if="app.link" class="btn" :class="app.name" target="_blank" :href="app.link"
               :key="k">
              <span class="iconfont" :class="app.icon"></span>
              {{app.name}}
            </a>
            <button v-else class="btn" :class="app.name" :key="k"
            @click="snackBar.info($t('developing'))">
              <span class="iconfont" :class="app.icon"></span>
              {{app.name}}
            </button>
          </template>
        </div>
      </div>
      <div class="features" :style="appBgStyle(apps.icon)">
        <div class="column" v-for="(column, i) in apps.features" :key="i">
          <section v-for="(item, index) in column" :key="index" class="feature"
          :style="bgStyle(item.icon, i === 0 ? 'right' : 'left')" :class="{right: i === 1}">
            <div class="text">
              <h3 class="title">{{$t(item.title)}}</h3>
              <div class="desc">{{$t(item.desc)}}</div>
            </div>
          </section>
        </div>
      </div>
      <div class="ring">
        <div class="inside"></div>
      </div>
    </section>
    <!-- <div class="announce-wrap">
      <div>
        <span class="iconfont icon-horn"></span>
        <span class="h">{{$t('announce')}}： </span>
      </div>
      <div class="scroll-box">
        <vue-seamless-scroll
          :data="announce"
          :class-option="optionLeft2" class="seamless-warp">
          <ul class="item">
            <li v-for="(item, idx) in announce" :key="idx">
              <span class="title" v-text="item.title" style="font-size: 0.15rem"></span>
            </li>
          </ul>
        </vue-seamless-scroll>
        <router-link style="color: #C2C2CC" to="/article/announce">更多&gt;&gt;</router-link>
      </div>
    </div> -->
    <!-- <div v-if="symbolsArrC" class="content market">
      <div v-if="mainPrices.length>2" class="main-prices">
        <router-link v-for="(p, i) in mainPrices" class="main-price" :key="i"
                     :to="'/exchange?coin='+p.symbol">
          <h2>{{p.base_asset}}/{{p.quote_asset}}
            <em class="rate" :class="getColor(p.rate)">{{(p.rate||0).toFixed(2)+'%'}}</em>
          </h2>
          <em class="price" :class="getColor(p.rate)">
            {{p.last||0}} <span class="unit">{{p.quote_asset}}</span></em>
        </router-link>
      </div>
      <div class="prices">
        <tab v-model="tab.value" :options="tabOptions" :tabStyle="{width: '20%'}"/>
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
    </div> -->
    <section class="content features">
      <h2>{{$t(features.title)}}</h2>
      <p>{{$t(features.desc)}}</p>
      <div class="items">
        <section v-for="(item, i) in features.items" class="item" :key="i" :class="`item${i}`">
          <img class="transition" :src="item.icon"/>
          <!-- <img v-if="i%2===0" class="transition" :src="item.icon"/> -->
          <!-- <div class="item-head" :style="backStyle(item.icon)"></div> -->
          <div class="item-text">
            <h3>{{$t(item.name)}}</h3>
            <p class="describe">{{$t(item.desc)}}</p>
          </div>
          <!-- <img v-if="i%2===1" class="transition" :src="item.icon"/> -->
        </section>
      </div>
    </section>
    <!-- <section class="content apps">
      <img :src="require('assets/client/home/home-app-bg-t3-self_help.jpg')" alt="">
      <h2>{{$t(apps.title)}}</h2>
      <p v-for="(p,i) in appsDesc" :key="i">{{p}}</p>
      <div class="btns">
        <div v-for="(item,i) in apps.items" :key="i" :style="bgStyle(item[0].icon,i)"
             class="btn-clock">
          <template v-for="(app,k) in item" v-if="k>0">
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
        </div>
      </div>
    </section> -->
  </page-container>
</template>

<script>
/* eslint-disable import/no-unresolved */
import { CustomCoin } from 'utils/CustomCoin'
import { symbolsMixin } from 'utils/HomeMixin'
import { orderBy } from 'utils/Sort'
import { mapActions, mapGetters, mapState } from 'vuex'

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
      searching: false,
      features: {
        title: 'advantages.title',
        // desc: 'advantages.desc',
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
    ...mapGetters('user', ['id']),
    apps() {
      return {
        title: 'app.title',
        desc: 'apps.desc',
        icon: require('assets/client/home/home-phone-<<template>>-<<theme>>.png'),
        items: [
          [
            // {
            //   icon: require('assets/client/home/home-phone-<<template>>-<<theme>>.png'),
            // },
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
        features: [
          [
            {
              icon: require('assets/client/home/home-app-1-<<template>>-<<theme>>.png'),
              title: 'app.1.title',
              desc: 'app.1.desc',
            },
            {
              icon: require('assets/client/home/home-app-3-<<template>>-<<theme>>.png'),
              title: 'app.3.title',
              desc: 'app.3.desc',
            },
          ],
          [
            {
              icon: require('assets/client/home/home-app-2-<<template>>-<<theme>>.png'),
              title: 'app.2.title',
              desc: 'app.2.desc',
            },
            {
              icon: require('assets/client/home/home-app-4-<<template>>-<<theme>>.png'),
              title: 'app.4.title',
              desc: 'app.4.desc',
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
    announce() {
      return this.articles.slice(0, 4) || []
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
          style: { textAlign: 'right' },
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
    mainPricesTwo() {
      return this.symbolsArrC.filter(item => item.recommend).splice(0, 2)
    },
    mainPricesFour() {
      return this.symbolsArrC.filter(item => item.recommend).splice(2, 4)
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
    optionLeft2() {
      return {
        singleHeight: window.isMobile ? 120 : 40, // 单步运动停止的高度(默认值0是无缝不停止的滚动) direction => 0/1
        waitTime: 2500, // 单步运动停止的时间(默认值1000ms)
        step: 1,
        limitMoveNum: 1,
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
    bgStyle(url, direction) {
      return {
        background: `url(${url}) no-repeat ${direction} center / auto`,
      }
    },
    appBgStyle(url) {
      return {
        background: `url(${url}) no-repeat center center / auto`,
      }
    },
    goExchange(index) {
      const item = this.tableData[index]
      this.$router.push(`/exchange?coin=${item.symbol}`)
    },
    writeAnnounce() {
      console.log(this.announce)
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
  beforeDestroy() {
    this.listenPricesUnsubscribe()
    // window.removeEventListener('resize', this.getWidth)
  },
}
</script>
