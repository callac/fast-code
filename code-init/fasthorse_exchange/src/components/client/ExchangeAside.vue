<template>
  <div class="header-coins exchange-aside">
    <section>
      <div class="coins">
        <div v-for="(c, j) in coins" class="zone-tab" :key="j">
          {{c.name}}
        </div>
      </div>
      <div class="table-wrap">
        <my-table class="coins-table"
                  type="extend"
                  :heads="tableHeads"
                  :data="tableData[index]"
                  :headTrStyle="{height: '.36rem'}"
                  :trStyle="{height: '.34rem',cursor:'pointer'}"
                  :scrollbarProps="{isMobile, maxHeight:'50vh'}"
                  @select="select(tableData[index][$event].ID)"
                  @clickTr="chose(index, $event)"
                  @sort="sortType=$event"/>
      </div>
    </section>
  </div>
</template>

<script>
import { CustomCoin } from 'utils/CustomCoin'
import { symbolsMixin } from 'utils/HomeMixin'
import { orderBy } from 'utils/Sort'
import { mapActions, mapState } from 'vuex'

// 币币交易页面显示在 header 的交易对列表信息
export default {
  name: 'HeaderCoins',
  mixins: [symbolsMixin],
  // beforeMount() {
  // this.getSymbols().then(() => {
  //   this.listenPrices()
  // })
  // },
  destroyed() {
    this.listenPricesUnsubscribe()
  },
  data() {
    return {
      sortType: {},
      index: 0,
    }
  },
  computed: {
    ...mapState('market', ['symbols', 'quoteAssets']),
    coins() {
      if (this.symbolsArrC.length < 1) return []
      const items = this.symbolsArrC.filter(item => item.symbol !== this.$route.query.coin)
      const { alias = 'volume', value = 'desc' } = this.sortType
      return [...this.quoteAssets.map(i => i.value), ''].map(key => ({
        // name: key ? `${key} ${this.$t('ex-zone')}` : this.$t('custom'),
        name: key ? `${key}` : this.$t('custom'),
        coins: (alias && value
          ? orderBy(items,
            this.arrC.includes(alias) ? alias + 1 : alias,
            value)
          : items)
          .filter(item => (key ? item.quote_asset === key : item.tableSelected)),
      }))
    },
    heads() {
      return [
        {
          type: 'select',
          style: { padding: '0 .1rem 0 .2rem' },
          checkboxStyle: { marginLeft: '-.05rem' },
        },
        { name: 'coin', alias: 'symbol1', style: { padding: 0, textAlign: 'left' } },
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
          style: { padding: '0 .2rem 0 0', textAlign: 'right' },
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
        .map(item => (item.alias === 'last' ? {
          ...item,
          formatter: null,
          style: { whiteSpace: 'nowrap', textAlign: 'right' },
        } : item))
    },
    tableData() {
      return this.coins.map(zone => zone.coins)
    },

    coin() {
      const name = this.$route.query.coin
      const symbol = this.symbols[name] || this.symbols[Object.keys(this.symbols)[0]]
      return symbol ? this.dealSymbol(symbol) : {}
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
  },
  methods: {
    ...mapActions('market', ['getSymbols', 'listenPrices', 'listenPricesUnsubscribe', 'updateSymbol']),
    select(ID) {
      const item = this.symbolsArrC.find(i => i.ID === ID);
      (!item.tableSelected ? CustomCoin.addCustom(item.ID) : CustomCoin.delCustom(item.ID))
        .then(() => {
          item.tableSelected = item.tableSelected ? '' : 'checked'
          this.updateSymbol(item)
        })
        .catch(this.snackBar.error)
    },
    chose(key, index) {
      const item = this.coins[key].coins[index]
      this.$router.replace(`${this.$route.path}?coin=${item.symbol}`)
    },
  },
}
</script>
