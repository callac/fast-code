<template>
  <div class="header-coins">
    <section v-for="(h, i) in myHeads" class="item" :key="i">
      <h3 class="name">{{$t(h.name)}}</h3>
      <div class="value-wrap">
        <span class="value"
              v-html="(h.formatter?h.formatter(coin, h.alias):coin[h.alias])||0"></span>
        <template v-if="i===0">
          <span class="iconfont icon-arrowdropdown"></span>
          <div class="coins">
            <template v-if="showTab">
              <tab class="tab-sector"
                   v-model="tab"
                   :options="tabOptions"/>
              <tab v-if="tab1Options.length>1"
                   class="tab-asset"
                   v-model="tab1"
                   :options="tab1Options"/>
            </template>
            <my-table class="coins-table"
                      type="extend"
                      :heads="tableHeads"
                      :data="tableData"
                      :headTrStyle="{height: '.36rem'}"
                      :scrollbarProps="{isMobile, maxHeight:'50vh'}"
                      @select="select(tableData[$event].ID)"
                      @clickTr="chose($event)"
                      @sort="sortType=$event"/>
          </div>
        </template>
      </div>
    </section>
  </div>
</template>

<script>
import Tab from 'components/client/Tab-zg'
import ExchangeSector from 'data/immutable-data/ExchangeSector'
import { CustomCoin } from 'utils/CustomCoin'
import { symbolsMixin } from 'utils/HomeMixin'
import { orderBy } from 'utils/Sort'
import { mapActions, mapState } from 'vuex'

// 模板 zg 的币币交易页面显示在 header 的交易对列表信息
export default {
  name: 'HeaderCoins',
  mixins: [symbolsMixin],
  beforeMount() {
    this.getSymbolClasses().then(() => {
      this.showTab = true
    }).catch(this.snackBar.error)
    this.getSymbols().then(() => {
      this.listenPrice()
    }).catch(this.snackBar.error)
    this.setTab()
  },
  destroyed() {
    this.listenPricesUnsubscribe()
  },
  data() {
    return {
      tab: 'all',
      tab1: '',
      sortType: {},
      showTab: false,
    }
  },
  computed: {
    ...mapState('market', ['quoteAssets', 'symbolClasses']),
    ...mapState('market', { symbolsC: 'symbols' }),
    formatters() {
      return {
        symbol1: (item) => {
          const { base_asset, quote_asset, classes = [], selected } = item
          return `<div class="nowrap">
                     <span class="table-value ${selected ? 'font-main' : ''}">${base_asset}</span>/${quote_asset}
                     ${['custom', 'all', 'up-down'].includes(this.tab) ? classes.map(c => `<span class="table-sector">${c.shorthand}</span>`).join('') : ''}
                  </div>`
        },
        last: (item, alias) => {
          const price = item[alias] || 0
          return `${price}<br><span style="font-size: .12rem;">${this.$cEx(item[`${alias}1`])}</span>`
        },
      }
    },
    heads() {
      return [
        {
          type: 'select',
          style: { padding: '0' },
          checkboxStyle: { margin: 0 },
        },
        {
          name: 'coin',
          alias: 'symbol1',
          style: { padding: 0, textAlign: 'left' },
        },
        {
          name: 'last-price',
          alias: 'last',
          sort: false,
          style: { padding: 0, textAlign: 'right' },
          formatter: (item, alias) => {
            const price = item[alias] || 0
            return `${price}<span style="margin: 0 0 0 .06rem;font-size: .14rem;">${this.$cEx(item[`${alias}1`])}</span>`
          },
        },
        {
          name: 'change',
          alias: 'rate',
          style: { padding: '0', textAlign: 'right' },
          formatter: (item) => {
            const value = `${(item.rate || 0).toFixed(2)}%`
            const color = this.getColor(item.rate)
            return `<span class="${color}">${value}</span>`
          },
        },
        { name: 'max-price', alias: 'high' },
        { name: 'min-price', alias: 'low' },
        { name: '24h-vol', alias: 'volume' },
      ]
    },
    myHeads() {
      return this.heads.slice(1)
    },
    tableHeads() {
      return this.heads.slice(0, 4)
        .map(item => ({
          ...item,
          formatter: this.formatters[item.alias] || item.formatter,
        }))
    },
    symbolsObject() {
      return ExchangeSector.getSymbols(this.symbolsArr, this.tab, this.dealSymbol)
    },
    symbols() {
      if (this.symbolsArrC instanceof Array) return this.symbolsArrC
      return this.symbolsArrC[this.tab1] || []
    },
    tableData() {
      if (this.symbols.length < 1) return []
      const items = this.symbols.map(item => ({
        ...item,
        selected: item.symbol === this.$route.query.coin,
      }))
      const { alias = 'volume', value = 'desc' } = this.sortType
      return (alias && value
        ? orderBy(items,
          this.arrC.includes(alias) ? alias + 1 : alias,
          value)
        : items)
    },
    coin() {
      const name = this.$route.query.coin
      const symbol = this.symbolsC[name] || this.symbolsC[Object.keys(this.symbolsC)[0]]
      return symbol ? this.dealSymbol(symbol) : {}
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
    'coin.symbol': {
      handler(val) {
        if (val) {
          this.$router.replace(`${this.$route.path}?coin=${val}`)
        }
      },
      immediate: true,
    },
    'tab': {
      handler(val) {
        if (val) {
          this.setTab1()
        }
      },
      immediate: true,
    },
    symbolsArrC() {
      this.setTab1()
    },
  },
  methods: {
    ...mapActions('market', ['getSymbols', 'getSymbolClasses', 'listenPrices', 'listenPricesUnsubscribe', 'updateSymbol']),
    setTab() {
      this.tab = this.$route.query.tab || 'all'
    },
    setTab1() {
      if (Object.keys(this.symbolsArrC).length > 0) {
        const keys = Object.keys(this.symbolsArrC)
        if (!this.tab1 || !keys.includes(this.tab1)) {
          this.tab1 = keys.includes(this.coin.quote_asset)
            ? this.coin.quote_asset
            : keys[0]
        }
      }
    },
    listenPrice() {
      this.listenPricesUnsubscribe()
        .then(() => this.listenPrices())
        .catch(this.snackBar.error)
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
    chose(index) {
      const item = this.tableData[index]
      this.$router.replace(`${this.$route.path}?coin=${item.symbol}&tab=${this.tab}`)
    },
    getSymbolsArrC() {
      return this.symbolsObject
    },
  },
  components: { Tab },
}
</script>
