<template>
  <page-container class="container-inner"
                  :class="{'white-container-inner':theme === 'white'}"
                  :title="title">
    <template v-if="$route.query.coin">
      <!--<div class="exchange" :style="user.id ? {} : {height:'calc(100vh - 0.6rem)'}">-->
      <div class="exchange">
        <div class="left">
          <header class="client-header exchange-header">
            <header-coins/>
          </header>
          <div class="left-container">
            <div class="left-aside">
              <ExchangeAside></ExchangeAside>
            </div>
            <div class="left-body">
              <tradingview v-if="$route.query.coin" :symbol="$route.query.coin"
                           :coin="coin"
                           @changeTheme="changeTheme"
                           :theme="theme"></tradingview>
              <!--<k-line v-if="symbol"-->
                      <!--:symbol="symbol"/>-->
              <exchange-forms :coin="coin"
                              :tabStyle="style"
                              :initData="formInitData"/>
            </div>

          </div>
        </div>
        <aside class="aside">
          <div class="min-aside-tab">
             <div class="aside-tab" :class="{'selected':AsideSelected===1}" @click="AsideChange(1)">
               {{$t('exchange.deep')}}
             </div>
             <div class="aside-tab" :class="{'selected':AsideSelected===2}" @click="AsideChange(2)">
               {{$t('exchange.history')}}
             </div>
          </div>
          <div class="tables">
            <depth-map :coin="coin"
                       :data="depth"
                       :tabStyle="style"
                       :tableStyle="trStyle"
                       ref="depthMap"
                       :theme="theme"
                       @setPrice="setPrice"/>
            <history-order :coin="coin"
                           :data="dealsObj"
                           :tabStyle="style"
                           :tableStyle="trStyle"/>
          </div>
        </aside>
      </div>
      <!--<div class="exchange exchange-footer" v-if="user.id">-->
      <div class="exchange exchange-footer">
        <my-exchange ref="myExchange"
                     :coin="coin"
                     :data="myOrders"
                     :tabStyle="style"
                     :tableStyle="Object.assign({},trStyle,
                   {tr:Object.assign({}, trStyle.tr, { height:'.24rem',})})"
                     @pageChange="orderPageInfo=$event"/>
      </div>
    </template>
  </page-container>
</template>

<script>
import HeaderCoins from 'components/client/HeaderCoins-t3'
import tradingview from 'components/tradingview/tradingview'
import Singleton from 'utils/Singleton'
import { debounce } from 'utils/Utils'
import { mapActions, mapState } from 'vuex'
import DepthMap from '../../page-zt/components/DepthMap'
import ExchangeForms from '../../page-zt/components/ExchangeForms'
import HistoryOrder from '../../page-zt/components/HistoryOrder'
import MyExchange from '../../page-zt/components/MyExchange'
import ExchangeAside from '../../page-zt/components/ExchangeAside'
// import KLine from 'components/kline/KLine'

export default {
  name: 'Exchange',
  // created() {
  //   this.getData(this.$route.query.coin)
  //   this.getDataLogin(this.$route.query.coin)
  // },
  beforeMount() {
    this.getData()
  },
  beforeRouteUpdate(to, fr, next) {
    this.unsubscribe(this.symbol)
    this.getData(to.query.coin)
    this.getDataLogin(to.query.coin)
    next()
  },
  mounted() {
    window.addEventListener('resize', this.getWidth)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.getWidth)
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
          fontSize: '.14rem',
        },
        selected: {},
      },
      trStyle: {
        head: {
          fontSize: '.10rem',
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
      tab: {
        value: 'custom',
        options: [
          { value: 'custom' },
        ],
      },
      AsideSelected: 1,
      theme: 'black', // 主题white，black
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
              .slice(0, 60)
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
      return deals ? deals.slice(0, 60).map(item => ({
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
    changeTheme(theme) {
      this.theme = theme
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
    // 可视化区域宽度获取宽度
    getWidth() {
      debounce(() => {
        const { clientWidth } = document.documentElement
        // console.log(clientWidth)
        if (clientWidth >= 1560) {
          this.$refs.depthMap.$el.style.display = 'block'
        }
      }, 1000)
    },
    // 盘口切换
    AsideChange(val) {
      this.AsideSelected = val;
      // console.log('盘口')
      // console.log(this.depth)
      if (val === 2) {
        this.$refs.depthMap.$el.style.display = 'none'
      } else {
        this.$refs.depthMap.$el.style.display = 'block'
      }
    },
  },
  components: {
    MyExchange,
    DepthMap,
    HistoryOrder,
    ExchangeForms,
    HeaderCoins,
    tradingview,
    ExchangeAside,
  },
}
</script>
