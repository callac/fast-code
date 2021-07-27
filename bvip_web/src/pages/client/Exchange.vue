<template>
  <page-container class="container-inner exchange"
                  :title="title">
    <template v-if="symbol">
      <div class="left">
        <k-line v-if="symbol"
                :symbol="symbol"/>
        <my-exchange v-if="user.id"
                     ref="myExchange"
                     :coin="coin"
                     :data="myOrders"
                     :tabStyle="style"
                     :tableStyle="Object.assign({},trStyle,
                   {tr:Object.assign({}, trStyle.tr, { height:'.24rem',})})"
                     @pageChange="orderPageInfo=$event"/>
      </div>
      <aside class="aside">
        <div class="tables">
          <depth-map :coin="coin"
                     :data="depth"
                     :tabStyle="style"
                     :tableStyle="trStyle"
                     @setPrice="setPrice"/>
          <history-order :coin="coin"
                         :data="dealsObj"
                         :tabStyle="style"
                         :tableStyle="trStyle"/>
        </div>
        <exchange-forms :coin="coin"
                        :tabStyle="style"
                        :initData="formInitData"/>
      </aside>
    </template>
  </page-container>
</template>

<script>
import DepthMap from 'components/client/DepthMap'
import ExchangeForms from 'components/client/ExchangeForms'
import HistoryOrder from 'components/client/HistoryOrder'
import MyExchange from 'components/client/MyExchange'
import KLine from 'components/kline/KLine'
import Singleton from 'utils/Singleton'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'Exchange',
  beforeMount() {
    this.getData()
  },
  beforeRouteUpdate(to, fr, next) {
    this.unsubscribe(this.symbol)
    this.getData(to.query.coin)
    this.getDataLogin(to.query.coin)
    next()
  },
  beforeRouteLeave(to, fr, next) {
    this.unsubscribe(this.symbol)
    next()
  },
  data() {
    return {
      style: {
        wrap: {},
        tab: {
          height: '.32rem',
          width: 'auto',
          padding: '0 .3rem',
          fontSize: '.12rem',
        },
        selected: {},
      },
      trStyle: {
        head: {
          fontSize: '.12rem',
          height: '.30rem',
          border: 'none',
        },
        tr: {
          fontSize: '.12rem',
          height: '.18rem',
          border: 'none',
        },
      },
      formInitData: null,
      canPriceChange: true,
      orderPageInfo: null,
      isListen: '',
    }
  },
  computed: {
    ...mapState('user', {
      user: state => state.info,
      assets: state => state.assets,
      openOrder: 'openOrder',
      orderHistory: 'orderHistory',
    }),
    ...mapState('market', ['symbols', 'depthMap', 'deals']),
    symbol() {
      return this.$route.query.coin
    },
    coin() {
      if (!this.symbol) return {}
      const arr = this.symbol ? this.symbol.split('_') : []
      const coinObj = this.symbols[this.symbol]
      return { ...coinObj, name: arr[0], base: arr[1] }
    },
    depth() {
      const depthMap = this.depthMap[this.symbol]
      const depth = { sell: [], buy: [] }
      const { precision = {} } = this.coin
      if (depthMap) {
        Object.keys(depthMap).forEach((key) => {
          if (['buy', 'sell'].includes(key)) {
            depthMap[key]
              .slice(0, 30)
              .reduce((pre, item, i) => {
                const total = pre + (+item.amount)
                depth[key][i] = {
                  ...item,
                  size: (+item.amount).toFixed(precision.amount),
                  price: (+item.price).toFixed(precision.price),
                  total: total.toFixed(precision.amount),
                  type: key,
                }
                return total
              }, 0)
            if (key === 'sell') {
              depth[key].reverse()
            }
          }
        })
      }
      return depth
    },
    dealsObj() {
      const deals = this.deals[this.symbol]
      const { precision = {} } = this.coin
      return deals ? deals.slice(0, 30).map(item => ({
        ...item,
        size: (+item.amount).toFixed(precision.amount),
        price: (+item.price).toFixed(precision.price),
        createdAt: this.dateFormatter(item.time, 'HH:mm:ss'),
      })) : []
    },
    myOrders() {
      if (!this.orderPageInfo) return []
      const orders = this.orderPageInfo.type === 'open' ? this.openOrder : this.orderHistory
      return orders[this.symbol]
    },
    title() {
      return `${this.coin.last || 0} ${this.symbol && this.symbol.split('_').join('/')} ${this.$t('exchange')}`
    },
  },
  watch: {
    symbol() {
      this.canPriceChange = true
      if (this.$refs.myExchange) this.$refs.myExchange.initPage()
    },
    orderPageInfo() {
      this.getOrders()
    },
    'user.id': {
      handler() {
        this.getDataLogin()
      },
      immediate: true,
    },
    'coin.last': {
      handler(val) {
        if (this.canPriceChange && val !== undefined) {
          this.formInitData = {
            price: val,
            amount: '',
          }
          this.canPriceChange = false
        }
      },
      immediate: true,
    },
  },
  methods: {
    ...mapActions('user', [
      'getAssets',
      'assetsSubscribe',
      'assetsUnsubscribe',
      'orderQuery',
      'orderHistoryQuery',
      'orderSubscribe',
      'orderUnsubscribe',
    ]),
    ...mapActions('market', [
      'depthMapSubscribe',
      'depthMapUnsubscribe',
      'dealsSubscribe',
      'dealsUnsubscribe',
    ]),
    getData(symbol) {
      const s = symbol || this.symbol
      if (s) {
        this.depthMapSubscribe(s)
        this.dealsSubscribe(s)
      }
    },
    getDataLogin(s) {
      const symbol = s || this.symbol
      if (symbol && this.user.id) {
        this.getAssets().then(() => {
          this.assetsSubscribe(symbol.split('_'))
        }).catch(this.snackBar.error)
        this.getOrders(s)
      }
    },
    getOrders(s) {
      const symbol = s || this.symbol
      const { orderPageInfo } = this
      return orderPageInfo ? Singleton.promise(
        () => {
          const { user, orderQuery, orderHistoryQuery, isListen } = this
          if (symbol && user.id) {
            const fn = orderPageInfo.type === 'open' ? orderQuery : orderHistoryQuery
            return fn({ symbol, ...orderPageInfo })
              .then(() => {
                if (isListen !== symbol) {
                  this.orderSubscribe([symbol])
                  this.isListen = symbol
                }
              })
              .catch(this.snackBar.error)
          }
          return Promise.resolve()
        },
        `getOrders-${symbol}-${orderPageInfo.offset}-${orderPageInfo.limit}`,
      ) : Promise.resolve()
    },
    unsubscribe(symbol) {
      if (symbol) {
        this.depthMapUnsubscribe(symbol)
        this.dealsUnsubscribe(symbol)
        this.assetsUnsubscribe()
        this.orderUnsubscribe()
        this.isListen = ''
      }
    },
    setPrice({ price, total: amount, type } = {}) {
      this.formInitData = { price, amount, type }
      this.canPriceChange = false
    },
  },
  components: {
    MyExchange,
    DepthMap,
    HistoryOrder,
    ExchangeForms,
    KLine,
  },
}
</script>
