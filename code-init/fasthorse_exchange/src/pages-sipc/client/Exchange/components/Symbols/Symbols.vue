<template>
  <section class="symbols">
    <tab
      v-model="tab.value"
      :options="tabOptions"
    />
    <search
      :inputConfig="searchConfig"
      @search="keyword=$event"
    />
    <my-table
      type="extend"
      :sort="false"
      :heads="heads"
      :data="tableData"
      :scrollbarProps="{isMobile, maxHeight}"
      @select="select(tableData[$event].ID)"
      @clickTr="goExchange"
    />
  </section>
</template>

<script>
import Tab from 'components/client/Tab'
import Search from 'components/Search'
import { CustomCoin } from 'utils/CustomCoin'
import { symbolsMixin } from 'utils/HomeMixin'
import { mapActions, mapState } from 'vuex'
import messages from './Symbols.msg'

export default {
  name: 'Symbols',
  mixins: [symbolsMixin],
  components: { Tab, Search },
  i18n: { messages },
  props: {
    maxHeight: String,
  },
  data() {
    return {
      tab: {
        value: 'custom',
        options: [
          { value: 'custom' },
        ],
      },
      keyword: '',
    }
  },
  computed: {
    ...mapState('market', ['quoteAssets']),
    searchConfig() {
      return { placeholder: `${this.$t('symbol.search')}...` }
    },
    heads() {
      const formatter = (item, alias) => {
        const val = item[alias] || 0
        return `<span class="table-value">${val}</span>`
      }
      return [
        {
          type: 'select',
          style: { padding: 0 },
        },
        {
          name: this.$t('pair'),
          alias: 'symbolObj',
          sort: 'symbol',
          formatter: (item) => {
            const { base_asset } = item
            return `<span class="table-value">${base_asset}</span>`
          },
          needTran: false,
        },
        {
          name: `${this.$t('last-price')}(${this.tab.value})`,
          alias: 'last',
          formatter,
          needTran: false,
          style: { textAlign: 'right' },
        },
        {
          name: 'change',
          alias: 'rate',
          formatter: (item) => {
            const value = `${(item.rate || 0).toFixed(2)}%`
            const color = this.getColor(item.rate)
            return `<span class="${color}">${value}</span>`
          },
          style: { textAlign: 'right', paddingRight: 0 },
        },
      ]
    },
    tableData() {
      if (!this.symbolsArrC) return []
      let symbols
      const keyword = this.keyword.toUpperCase()
      if (!keyword) symbols = this.symbolsArrC
      else {
        symbols = this.symbolsArrC.filter(item => item.symbol.toUpperCase().includes(keyword)
          || item.symbol1.toUpperCase().includes(keyword))
      }
      const val = this.tab.value
      return symbols
        .filter(item => (val !== 'custom' ? item.quote_asset === val : item.tableSelected))
        .sort((a, b) => {
          const index = (item) => {
            switch (item.base_asset) {
              case 'BTC':
                return 3
              case 'ETH':
                return 2
              case 'SIPC':
                return 1
              default:
                return 0
            }
          }
          return index(b) - index(a)
        })
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
    tableData: {
      handler(val) {
        if (val.length > 0 && !this.$route.query.symbol) this.goExchange(0, true)
      },
      immediate: true,
    },
  },
  methods: {
    ...mapActions('market', ['getSymbols', 'listenPrices', 'listenPricesUnsubscribe', 'updateSymbol']),
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
    goExchange(index, replace = false) {
      const item = this.tableData[index]
      if (replace) this.$router.replace(`/exchange?symbol=${item.symbol}`)
      else this.$router.push(`/exchange?symbol=${item.symbol}`)
    },
  },
  beforeMount() {
    this.getSymbols().then(() => {
      this.listenPrices()
    }).catch(this.snackBar.error)
    this.initTab()
  },
  beforeDestroy() {
    this.listenPricesUnsubscribe()
  },
}
</script>
