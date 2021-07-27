<template>
  <page-container class="container-inner home">
    <banner class="banner-wrap" :banners="showBanners"/>
    <div class="content announce-wrap">
      <span class="iconfont icon-horn"></span>
      <span class="h">{{$t('announce')}}： </span>
      <router-link v-if="announce.id" :to="'/article/announce/'+announce.id" class="announce">
        {{announce.title}}
      </router-link>
      <span v-else class="announce">暂无公告</span>
    </div>
    <div v-if="symbolsArrC" class="content market">
      <div v-if="mainPrices.length>3" class="main-prices">
        <router-link v-for="(p, i) in mainPrices" class="main-price" :key="i"
                     :to="'/exchange?coin='+p.symbol">
          <h2>{{p.base_asset}}/{{p.quote_asset}}</h2>
          <em class="price">
            {{p.last||0}} <span class="unit">{{p.quote_asset}}</span></em>
          <em class="rate" :class="getColor(p.rate)">{{(p.rate||0).toFixed(2)+'%'}}</em>
        </router-link>
      </div>
      <div class="prices">
        <tab v-model="tab.value" :options="tabOptions" :tabStyle="{flex:1}"/>
        <my-table class="table"
                  :heads="heads"
                  :trStyle="{cursor:'pointer'}"
                  :data="tableData"
                  :searching="searching"
                  @select="select(tableData[$event].ID)"
                  @sort="setSort"
                  @clickTr="goExchange"
                  @error="log"/>
      </div>
    </div>
    <section class="content advantages">
      <h2>{{$t(advantages.name)}}</h2>
      <div class="wrap">
        <div v-for="(item, i) in advantages.items" class="ad" :key="i">
          <h3>{{$t(item.name)}}</h3>
          <img :src="item.icon"/>
          <p class="description">{{$t(item.desc)}}</p>
        </div>
      </div>
    </section>
    <section class="content apps">
      <h2>{{$t(apps.title)}}</h2>
      <p>{{$t(apps.desc)}}</p>
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
    </section>
    <section v-if="partners.items.length>0" class="content partners">
      <h2>{{$t(partners.name)}}</h2>
      <div class="wrap">
        <div v-for="(p,i) in partners.items" class="partner" :key="i">
          <img-tag :src="p.logo"/>
        </div>
      </div>
    </section>
  </page-container>
</template>

<script>
/* eslint-disable import/no-unresolved */
import Banner from 'components/client/Banner'
import Tab from 'components/client/Tab'
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
      advantages: {
        name: 'advantages',
        items: [
          {
            name: 'security',
            icon: require('assets/client/home/icon-security-<<template>>-<<theme>>.png'),
            desc: 'advantages.security.desc',
          },
          {
            name: 'assurance',
            icon: require('assets/client/home/icon-lock-<<template>>-<<theme>>.png'),
            desc: 'advantages.encrypt.desc',
          },
          {
            name: 'fast',
            icon: require('assets/client/home/icon-fast-<<template>>-<<theme>>.png'),
            desc: 'advantages.fast.desc',
          },
          {
            name: 'service',
            icon: require('assets/client/home/icon-service-<<template>>-<<theme>>.png'),
            desc: 'advantages.serve.desc',
          },
        ],
      },
      partners: {
        name: 'partners',
        // items: [
        //   { logo: require('assets/client/logo-1.jpg') },
        // ],
        items: [],
      },
      tab: {
        value: 'custom',
        options: [
          // { icon: require('assets/client/home/icon-ethereum.png'),
          // value: 'ETH', needTran: false },
          { value: 'custom' },
        ],
      },
      subscription: null,
      sortType: {},
      searching: false,
    }
  },
  computed: {
    ...mapState('market', ['quoteAssets']),
    ...mapState('article', ['articleList']),
    ...mapState(['banners', 'siteInfo']),
    apps() {
      return {
        title: 'app.download',
        desc: 'app.download.desc',
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
    showBanners() {
      return this.banners.filter(b => b.endpoint === 'web')
    },
    announce() {
      const news = this.articleList.news || {}
      return (news.news && news.news[0]) || {}
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
    if (!this.articleList.news) this.getArticles({ type: 'news' }).catch(this.snackBar.error)
    this.initTab()
  },
  beforeDestroy() {
    this.listenPricesUnsubscribe()
  },
}
</script>
