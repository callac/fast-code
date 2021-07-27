/* eslint-disable import/no-unresolved */
import { throttle } from 'throttle-debounce'
import { mapGetters, mapState } from 'vuex'

function getSymbolsArr() {
  this.symbolsArr = [...this.symbolsArr1]
}

// 首页混入
// 首页交易对列表数据更新的公共逻辑
// 可在 Home.vue 写入相同函数来覆盖 Mixin 中的函数，达到自定义的目的
export const symbolsMixin = {
  data() {
    return {
      arrC: Object.freeze(['volume', 'last', 'high', 'low']),
      symbolsWatchCount: 0,
      symbolsArr: [],
      symbolsArrC: [],
    }
  },
  computed: {
    ...mapGetters('market', {
      symbolsArr1: 'symbolsArr',
    }),
    ...mapState('exchange', ['anchorCoin', 'exchangeRate']),
    $_symbols() {
      return {
        symbols: this.symbolsArr1,
        isExEnable: this.anchorCoin.USD,
      }
    },
  },
  watch: {
    $_symbols: {
      handler(val) {
        /**
         * 1. 在 `this.symbolsArr1.length` 次更新之前
         *    symbolsArr1 都未完全的初始化，还在整合 websocket 推送过来的价格信息
         *    所以：应该实时更新 symbolsArr，
         *         直到价格信息的一轮整合（this.symbolsArr1.length === this.symbolsWatchCount）完毕
         * 2. 在 `/currency` 接口返回之前（this.anchorCoin.USD === ''）得不到折合
         *    所以：应该实时更新 symbolsArr，直到 `/currency` 接口响应成功
         * */
        if (
          !val.isExEnable
          || this.symbolsWatchCount <= this.symbolsArr1.length
        ) {
          getSymbolsArr.call(this)
        } else this.getSymbolsArr()
        this.symbolsWatchCount += 1
      },
      immediate: true,
    },
    /**
     * 折合变化使得列表立即变化
     * */
    $currencyVal() {
      getSymbolsArr.call(this)
    },
    /**
     * 不使用 computed，是为了防止 getSymbolsArrC 方法中有其他依赖
     * 其他依赖的变化将导致更新频率不可控
     * */
    symbolsArr: {
      handler() {
        this.symbolsArrC = this.getSymbolsArrC()
      },
      immediate: true,
    },
  },
  methods: {
    // 6s 更新交易对列表
    getSymbolsArr: throttle(6000, getSymbolsArr),
    getSymbolsArrC() {
      return this.symbolsArr ? this.symbolsArr.map(this.dealSymbol) : []
    },
    dealSymbol(symbol) {
      return {
        ...symbol,
        ...(this.arrC.reduce((pre, k) => ({
          ...pre,
          [`${k}1`]: (k === 'volume'
            ? this.$exAmount(symbol.volume, symbol)
            : this.$exPrice(symbol, k)),
        }), {})),
      }
    },
  },
}
