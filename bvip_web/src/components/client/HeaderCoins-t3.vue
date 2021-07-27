<template>
  <div class="header-coins">
    <section v-for="(h, i) in myHeads" class="item" :key="i">
      <template v-if="i === 0">
        <em class="value-wrap">
        <span class="value"
              style="font-size: 0.18rem;width: 2.68rem;text-align: center;margin-right: 0;"
              v-html="(h.formatter?h.formatter(coin, h.alias):coin[h.alias])||0"></span>
        </em>
      </template>
      <template v-if="i === 1">
        <em class="value-wrap">
        <span class="value"
              v-html="(h.formatter?h.formatter(coin, h.alias):coin[h.alias])||0"></span>
        </em>
      </template>
      <template v-if="i > 1">
        <h3 class="name">{{$t(h.name)}}</h3>
        <em class="value-wrap">
        <span class="value"
              v-html="(h.formatter?h.formatter(coin, h.alias):coin[h.alias])||0"></span>
        </em>
      </template>
    </section>
  </div>
</template>

<script>
// import { CustomCoin } from 'utils/CustomCoin'
import { symbolsMixin } from 'utils/HomeMixin'
// import { orderBy } from 'utils/Sort'
import { mapState } from 'vuex'

// 币币交易页面显示在 header 的交易对列表信息
export default {
  name: 'HeaderCoins',
  mixins: [symbolsMixin],
  // beforeCreate() {
  //   if (this.symbol === undefined) {
  //     this.$router.replace(`${this.$route.path}?coin=BTC_CNT`)
  //   }
  // },
  beforeMount() {
    // this.getSymbols().then(() => {
    //   this.listenPrices()
    // })
  },
  // destroyed() {
  //   this.listenPricesUnsubscribe()
  // },
  data() {
    return {
      // sortType: {},
    }
  },
  computed: {
    ...mapState('market', ['symbols', 'quoteAssets']),
    // coins() {
    //   if (this.symbolsArrC.length < 1) return []
    //   const items = this.symbolsArrC.filter(item => item.symbol !== this.$route.query.coin)
    //   const { alias = 'volume', value = 'desc' } = this.sortType
    //   return [...this.quoteAssets.map(i => i.value), ''].map(key => ({
    //     name: key ? `${key} ${this.$t('ex-zone')}` : this.$t('custom'),
    //     coins: (alias && value
    //       ? orderBy(items,
    //         this.arrC.includes(alias) ? alias + 1 : alias,
    //         value)
    //       : items)
    //       .filter(item => (key ? item.quote_asset === key : item.tableSelected)),
    //   }))
    // },
    heads() {
      return [
        {
          type: 'select',
          style: { padding: '0 .1rem 0 .2rem' },
          checkboxStyle: { marginLeft: '-.05rem' },
        },
        { name: '', alias: 'symbol1', style: { padding: 0, textAlign: 'left', fontSize: '0.2rem' } },
        {
          name: '',
          alias: 'last',
          sort: false,
          style: { padding: 0, textAlign: 'right' },
          formatter: (item, alias) => {
            const color = this.getColor(item.rate)
            const price = item[alias] || 0
            return `<h3 class="name ${color}" style="font-size: 0.16rem">${price}</h3><span style="margin: 0 0 0 .06rem;font-size: .12rem;color: #667680;">${this.$cEx(item[`${alias}1`])}</span>`
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
    coin() {
      const name = this.$route.query.coin
      const symbol = this.symbols[name] || this.symbols[Object.keys(this.symbols)[0]]
      return symbol ? this.dealSymbol(symbol) : {}
    },
  },
  // watch: {
  //   'coin.symbol': {
  //     handler(val) {
  //       if (val) {
  //         this.$router.replace(`${this.$route.path}?coin=${val}`)
  //       }
  //     },
  //     immediate: true,
  //   },
  // },
  methods: {
    // ...mapActions('market', ['getSymbols',
    // 'listenPrices', 'listenPricesUnsubscribe', 'updateSymbol']),
    // select(ID) {
    //   const item = this.symbolsArrC.find(i => i.ID === ID);
    //   (!item.tableSelected ? CustomCoin.addCustom(item.ID) : CustomCoin.delCustom(item.ID))
    //     .then(() => {
    //       item.tableSelected = item.tableSelected ? '' : 'checked'
    //       this.updateSymbol(item)
    //     })
    //     .catch(this.snackBar.error)
    // },
    // chose(key, index) {
    //   const item = this.coins[key].coins[index]
    //   this.$router.replace(`${this.$route.path}?coin=${item.symbol}`)
    // },
  },
}
</script>
