<template>
  <page-container class="container-inner home">
    <banner class="banner-wrap" :banners="showBanners"
            :nav-style="mainPrices.length>0?{bottom: '1.6rem'}:{}"/>
    <div class="content main-prices">
      <router-link v-for="(p, i) in mainPrices" class="main-price" :key="i"
                   :to="'/exchange?coin='+p.symbol">
        <h2>{{p.base_asset}}/{{p.quote_asset}}
          <em class="rate" :class="getColor(p.rate)">{{(p.rate||0).toFixed(2)+'%'}}</em>
        </h2>
        <em class="price" :class="getColor(p.rate)">
          {{p.last||0}} <span class="unit">{{p.quote_asset}}</span></em>
      </router-link>
    </div>
    <div v-if="symbolsArrC" class="content market">
      <div class="prices">
        <tab v-model="tab.value" :options="tabOptions" :tabStyle="{width: '20%'}"/>
        <my-table class="table"
                  :heads="heads"
                  :data="tableData"
                  :headTrStyle="{height:'.6rem',opacity:'.6',fontSize:'.16rem'}"
                  :trStyle="{border:'none',height:'.6rem',fontSize:'.16rem',cursor:'pointer'}"
                  :searching="searching"
                  @select="select(tableData[$event].ID)"
                  @sort="setSort"
                  @clickTr="goExchange"
                  @error="log"/>
      </div>
    </div>
    <section class="content features">
      <h2>{{$t(features.title)}}</h2>
      <div class="items">
        <section v-for="(item, i) in features.items" class="item" :key="i">
          <img :src="item.icon">
          <h3>{{$t(item.name)}}</h3>
          <p>{{$t(item.desc)}}</p>
        </section>
      </div>
    </section>
    <section class="content apps">
      <img :src="require('assets/client/home/apps-bg-58-yellow.jpg')" alt="">
      <h2>{{$t(apps.title)}}</h2>
      <p>{{$t(apps.desc)}}</p>
      <div class="btns">
        <template v-for="(app,i) in apps.items">
          <a v-if="app.link" class="btn" target="_blank" :href="app.link"
             :key="i">
            <span class="iconfont" :class="app.icon"></span>
            {{app.name}}
          </a>
          <button v-else class="btn" :key="i" @click="snackBar.info($t('developing'))">
            <span class="iconfont" :class="app.icon"></span>
            {{app.name}}
          </button>
        </template>
      </div>
    </section>
    <!--<section class="content news" ref="newsEl">
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
          <router-default-link v-for="(n, i) in articles" class="news-item transition"
                       :style="newsItemStyle"
                       :to="showArticle.route+'/'+n.id+'?classId='+n.news_class_id"
                       :class="{now: i===articles.length-1}" :key="i">
            <time class="transition">{{n.dateline|datePipe({fmt:'MM/DD'})}}</time>
            <div class="c">
              <img :src="require('assets/client/home/home-zg-bg-2.jpg')" alt="">
              <h3 class="transition">{{n.title}}</h3>
              <p class="transition">{{n.resume||n.title}}</p>
            </div>
          </router-default-link>
        </div>
      </div>
    </section>-->
  </page-container>
</template>

<script>
import Banner from 'components/client/Banner'
import Tab from 'components/client/Tab-58'
import { CustomCoin } from 'utils/CustomCoin'
import { symbolsMixin } from 'utils/HomeMixin'
import { orderBy } from 'utils/Sort'
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
        title: 'advantages',
        items: [
          {
            name: 'advantages.1.title',
            desc: 'advantages.1.desc',
            icon: require('assets/client/home/icon-security-58-yellow.png'),
          },
          {
            name: 'advantages.2.title',
            desc: 'advantages.2.desc',
            icon: require('assets/client/home/icon-lock-58-yellow.png'),
          },
          {
            name: 'advantages.3.title',
            desc: 'advantages.3.desc',
            icon: require('assets/client/home/icon-fast-58-yellow.png'),
          },
          {
            name: 'advantages.4.title',
            desc: 'advantages.4.desc',
            icon: require('assets/client/home/icon-service-58-yellow.png'),
          },
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
          {
            name: 'Windows',
            icon: 'icon-windows',
            link: this.siteInfo.windows_url,
          },
          {
            name: 'Mac',
            icon: 'icon-mac',
            link: this.siteInfo.mac_url,
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
          style: { width: '3%', whiteSpace: 'nowrap' },
          checkboxStyle: { margin: '0 0 0 .2rem' },
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
          style: { textAlign: 'right', paddingRight: '.2rem' },
        },
      ]
    },
    mainPrices() {
      return this.symbolsArrC.filter(item => item.recommend).slice(0, 4)
    },
    tableData() {
      if (!this.symbolsArrC) return []
      const val = this.tab.value
      return (this.sortType.alias && this.sortType.value
        ? orderBy(this.symbolsArrC,
          this.arrC.includes(this.sortType.alias) ? this.sortType.alias + 1 : this.sortType.alias,
          this.sortType.value,
          this.arrC.includes(this.sortType.alias))
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
    // toPrev() {
    //   const index = this.showIndex - 1
    //   if (index > -1) {
    //     this.showIndex = index
    //   }
    // },
    // toNext() {
    //   const index = this.showIndex + 1
    //   if (index < this.articles.length - 2) {
    //     this.showIndex = index
    //   }
    // },
    // getWidth() {
    //   this.newsWidth = this.$refs.newsEl.clientWidth
    // },
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
    // this.getArticleList()
    this.initTab()
  },
  mounted() {
    // setTimeout(() => {
    //   this.getWidth()
    //   window.addEventListener('resize', this.getWidth)
    // }, 1000)
  },
  beforeDestroy() {
    this.listenPricesUnsubscribe()
    // window.removeEventListener('resize', this.getWidth)
  },
}
</script>
