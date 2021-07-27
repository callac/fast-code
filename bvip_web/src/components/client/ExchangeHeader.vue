<template>
    <nav class="nav">
      <template v-for="(r,i) in nav">
        <router-link v-if="r.route" class="a" :key="i" :to="r.route">
          {{r.needTran===false?r.name:$t(r.name)}}
        </router-link>
        <a v-else class="a" target="_blank" :href="r.href" :key="i">
          {{r.needTran===false?r.name:$t(r.name)}}
        </a>
      </template>
    </nav>
    <!--<div class="header-coins" style="display: none;">-->
      <!--<section v-for="(h, i) in myHeads" class="item" :key="i">-->
        <!--<h3 class="name">{{$t(h.name)}}</h3>-->
        <!--<em class="value-wrap">-->
        <!--<span class="value"-->
              <!--v-html="(h.formatter?h.formatter(coin, h.alias):coin[h.alias])||0"></span>-->
        <!--</em>-->
      <!--</section>-->
    <!--</div>-->
</template>

<script>
import { CustomCoin } from 'utils/CustomCoin'
import { symbolsMixin } from 'utils/HomeMixin'
import { orderBy } from 'utils/Sort'
import { mapActions, mapState, mapGetters } from 'vuex'

// 币币交易页面显示在 header 的交易对列表信息
export default {
  name: 'HeaderCoins',
  mixins: [symbolsMixin],
  destroyed() {
    this.listenPricesUnsubscribe()
  },
  data() {
    return {
      sortType: {},
    }
  },
  computed: {
    ...mapState(['headers']),
    ...mapState('market', ['symbols', 'quoteAssets']),
    ...mapGetters(['siteInfo']),
    nav() {
      return orderBy([
        { name: 'exchange.coin', route: '/exchange?coin=BTC_CNT', order: 1 },
        { name: 'exchange.otc', href: `/otc-web/${this.$i18n.locale}`, order: 1 },
        ...(this.siteInfo.c2cEnabled
          ? [{ name: 'exchange.cash', route: '/exchange/cash', order: 2 }] : []),
        { name: 'announce', route: '/announce', order: 3 },
        // { name: 'help', route: '/article/help', order: 4 },
        ...this.headers.map(h => ({
          name: h.label_name,
          href: h.api_url,
          order: +h.order,
          needTran: false,
        })),
      ], 'order')
    },
    coins() {
      if (this.symbolsArrC.length < 1) return []
      const items = this.symbolsArrC.filter(item => item.symbol !== this.$route.query.coin)
      const { alias = 'volume', value = 'desc' } = this.sortType
      return [...this.quoteAssets.map(i => i.value), ''].map(key => ({
        name: key ? `${key} ${this.$t('ex-zone')}` : this.$t('custom'),
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
