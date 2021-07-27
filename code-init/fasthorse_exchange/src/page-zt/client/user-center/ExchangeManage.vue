<template>
  <page-container class="user-content exchange-manage" :title="$t('exchange.manage')">
    <div class="assets-manager-title">{{$t('exchange.manage')}}</div>
    <div class="manage-wrap">
      <tab-head v-model="tab.value" :options="tab.options"/>
      <select-base class="symbol" v-model="filters.symbol" :options="symbols"
                   :scrollbarProps="{isMobile}"/>
      <my-table v-if="tab.value===tab.options[0].value" :heads="openHeads" :sort="false"
                :data="showData[tab.value]" :trStyle="overlayTableStyle.baseTr">
        <btn-once v-for="(item, i) in showData[tab.value]" class="btn btn-red" :key="item.id"
                  :slot="i+'-'+(openHeads.length-1)" :clickFn="()=>click(i)" :canUseAgain="false">
          {{$t('order.cancel')}}
        </btn-once>
      </my-table>
      <my-table v-else-if="tab.value===tab.options[1].value"
                :heads="historyHeads"
                :data="showData[tab.value]" :sort="false" :searching="searching"
                :trStyle="overlayTableStyle.baseTr">
        <template v-for="(t, i) in showData[tab.value]">
          <button v-if="isButton(myOrders[tab.value][i].status)" class="btn font-green"
                  :key="i" :slot="i+'-'+(historyHeads.length-1)" @click="click(i)">
            {{t.status}}
          </button>
          <span v-else class="btn cancel" :key="i" :slot="i">{{t.status}}</span>
        </template>
      </my-table>
      <pagination :config="pageConfig" :noPage="tab.value===tab.options[1].value"
                  @to="pageConfig.page=$event;orderListen()"/>
      <my-overlay v-if="showOverlay&&showOverlay.type==='details'" @close="showOverlay.rej()"
                  :head="$t('order')+' '+showOverlay.item.id+'('+showOverlay.item.pair+')'">
        <my-table class="table"
                  type="extend"
                  :sort="false"
                  :scrollbarProps="{isMobile, maxHeight: '50vh'}"
                  :heads="detailsHeads(showOverlay.feeAsset)"
                  :data="showOverlay.item.children"
                  :trStyle="overlayTableStyle.tr"
                  :headTrStyle="overlayTableStyle.head"/>
      </my-overlay>
    </div>
  </page-container>
</template>

<script>
import MyOverlay from 'components/client/MyOverlay'
import TabHead from 'components/client/user-center/TabHead'
import Exchange from 'data/api/exchange'
import Status from 'data/immutable-data/Status'
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  name: 'ExchangeManage',
  beforeMount() {
    const query = this.$route.query.type && this.$route.query.symbol
    this.getSymbols().then(() => {
      if (query) this.orderListen()
      if (!this.filters.symbol) this.filters.symbol = this.symbols[0].value
    })
  },
  beforeDestroy() {
    this.orderUnsubscribe()
  },
  data() {
    return {
      searching: false,
      tab: {
        value: this.$route.query.type || 'open',
        options: [
          { name: 'open-order', value: 'open' },
          { name: 'order-history', value: 'history' },
        ],
      },
      filters: {
        symbol: this.$route.query.symbol,
      },
      heads: {
        base: [
          { name: 'date', alias: 'date', style: { width: '18%', textAlign: 'center' } },
          { name: 'pair', alias: 'symbol1', style: { width: '11.5%', textAlign: 'center' } },
          { name: 'type', alias: 'type', style: { width: '7%', textAlign: 'center' } },
          { name: 'price', alias: 'price', style: { width: '11.6%', textAlign: 'center' } },
          { name: 'amount', alias: 'amount', style: { width: '11.6%', textAlign: 'center' } },
          { name: 'delegate-total', alias: 'total', style: { width: '11.6%', textAlign: 'center' } },
          { name: 'executed', alias: 'deal_stock', style: { width: '8.8%', textAlign: 'center' } },
        ],
        open: [
          { name: 'unexecuted', alias: 'left', style: { width: '8.8%', textAlign: 'center' } },
          { name: 'action', style: { width: '10%', textAlign: 'center' } },
        ],
        history: [
          { name: 'avg-price', alias: 'average', style: { width: '8%', textAlign: 'center' } },
          {
            name: 'status',
            style: { width: '9%', textAlign: 'center', whiteSpace: 'nowrap' },
          },
        ],
        details: [
          {
            name: 'commission',
            alias: 'fee',
            style: { width: '25%', textAlign: 'center ', padding: '0 .2rem 0 .1rem' },
          },
        ],
      },
      overlayTableStyle: {
        head: {
          height: '.42rem',
          border: 'none',
        },
        tr: {
          height: '.36rem',
          border: 'none',
        },
        baseTr: {
          fontSize: '.1rem',
        },
      },
      showOverlay: null,
      pageConfig: {
        total: 0,
        pages: 1,
        page: 1,
        pageSize: 15,
        currPageSize: 0,
      },
    }
  },
  computed: {
    ...mapGetters('market', ['symbolsArr']),
    ...mapState('user', ['openOrder', 'orderHistory']),
    symbols() {
      return this.symbolsArr.map(item => ({ name: item.symbol1, value: item.symbol }))
    },
    symbol() {
      return { precision: {}, ...this.symbolsArr.find(s => this.filters.symbol === s.symbol) }
    },
    myOrders() {
      return {
        open: this.openOrder[this.filters.symbol] || [],
        history: this.orderHistory[this.filters.symbol] || [],
      }
    },
    openHeads() {
      return [...this.heads.base, ...this.heads.open]
    },
    historyHeads() {
      return [...this.heads.base, ...this.heads.history]
    },
    detailsHeads() {
      return feeAsset => ([
        {
          ...this.heads.base[0],
          style: { ...this.heads.base[0].style },
        },
        ...this.heads.base.slice(3, 6),
        ...this.heads.details
          .map((item, i) => (
            i === 0 ? { ...item, name: `${this.$t(item.name)}(${feeAsset})`, needTran: false }
              : item)),
      ])
    },
    showData() {
      return {
        open: this.convert(this.myOrders.open, 'mtime'),
        history: this.convert(this.myOrders.history, 'ftime'),
      }
    },
  },
  watch: {
    symbols(val) {
      if (!this.filters.symbol) this.filters.symbol = val[0].value
    },
    'filters.symbol'(val) {
      this.pageConfig.page = 1
      this.$router.replace(`${this.$route.path}?symbol=${val}&&type=${this.tab.value}`)
    },
    'tab.value'(val) {
      this.$router.replace(`${this.$route.path}?type=${val}&&symbol=${this.filters.symbol}`)
      this.pageConfig.page = 1
    },
    '$route'(to) {
      this.orderListen()
      if (this.tab.value !== to.query.type) {
        this.tab.value = to.query.type || 'open'
      }
    },
  },
  methods: {
    ...mapActions('user', ['orderQuery', 'orderSubscribe', 'orderUnsubscribe', 'orderHistoryQuery']),
    ...mapActions('market', ['getSymbols']),
    getOrders() {
      this.searching = true
      const { symbol } = this.filters
      if (symbol) {
        return (this.tab.value === 'open' ? this.orderQuery : this.orderHistoryQuery)({
          symbol,
          ...this.pageC(this.pageConfig),
        }).then((res) => {
          this.pageConfig = {
            ...this.pageConfig,
            total: res.total,
            pages: Math.ceil(res.total / this.pageConfig.pageSize),
            currPageSize: res.records.length,
          }
          this.searching = false
          return symbol
        }, (e) => {
          this.searching = false
          throw e
        })
      }
      return Promise.resolve().then(() => {
        this.searching = false
      })
    },
    orderListen() {
      this.getOrders().then((symbol) => {
        if (symbol && this.tab.value === 'open') {
          this.orderUnsubscribe()
            .then(() => {
              this.orderSubscribe([symbol])
            })
        }
      }).catch(this.snackBar.error)
    },
    convert(arr, timeAlias) {
      return arr && arr.map((item) => {
        const type = Status.orderType[item.side]
        const status = Status.orderStatus[item.status]
        const color = this.getColor(type.name === Status.orderType[1].name ? -1 : 1)
        const { precision } = this.symbol
        const price = +item.type === 2 ? this.$t('exchange.market') : this.numTrim(item.price, precision.price)
        let amount = this.numTrim(item.amount, precision.amount)
        let total = this.numTrim(item.total, precision.total)
        if (+item.type === 2) {
          if (type.name === 'buy-1') {
            amount = '--'
          } else {
            total = '--'
          }
        }
        return {
          ...item,
          type: `<span class="${color}" style="font-size:inherit">${this.$t(type.name)}</span>`,
          price: `<span class="${color}" style="font-size:inherit">${price}</span>`,
          amount,
          total,
          deal_stock: this.numTrim(item.deal_stock, precision.total),
          left: `<span class="${color}" style="font-size:inherit">${this.numTrim(item.left, precision.total)}</span>`,
          average: this.numTrim(item.average, precision.price),
          date: this.dateFormatter(item[timeAlias], 'YYYY-MM-DD HH:mm:ss'),
          ...status ? { status: this.$t(status.name) } : {},
        }
      })
    },
    isButton(status) {
      return status !== Status.orderStatus.CANCELED.value
    },
    click(index) {
      const market = this.filters.symbol
      const coin = market.split('_')
      const item = this.showData[this.tab.value][index]
      const order_id = item.id
      if (this.tab.value === 'open') {
        return Exchange.tradeCancel({ market, order_id }).then(() => {
          this.snackBar.info(this.$t('cancel.success'))
          this.orderListen()
        })
      }

      return new Promise((res, rej) => {
        Exchange.orderReferences({ order_id }).then((result) => {
          this.showOverlay = {
            type: 'details',
            feeAsset: item.type.indexOf('卖出') > -1 ? coin[1] : coin[0],
            item: {
              id: order_id,
              pair: market,
              children: result.records.map(item1 => ({
                ...item1,
                date: this.dateFormatter(item1.time),
                total: this.numTrim(item1.price * item1.amount, 8),
              })),
            },
            res,
            rej,
          }
        })
      }).catch((e) => {
        if (!e) this.showOverlay = null
      })
    },
  },
  components: { TabHead, MyOverlay },
}
</script>
