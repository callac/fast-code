/**
 * 资产折合
 * 目前的价格折合策略：
 *   从所有交易对中找到最少计算次数的折合方式
 *   比如计算 'BTC_CNT' 折合成 USDT 的结果，如果有交易对 'BTC_USDT'，则直接取 'BTC_USDT' 的价格
 * */
import store from 'data/store'
import { LangStore } from 'extensions/i18n'
import Storage from 'utils/StorageX'
import { reduceValOfArr } from 'utils/Utils'

export class CurrencyConversion {
  // 获取本地存储的法币
  static getCurrency() {
    const currency = CurrencyConversion.storage.get(CurrencyConversion.key)
    if (currency) return currency

    const item = CurrencyConversion.options
      .find(item1 => item1.default || item1.langRef.includes(LangStore.getLang()))
    return item.value
  }


  // 设置本地存储的法币
  static setCurrency(val) {
    CurrencyConversion.storage.set(CurrencyConversion.key, val)
  }

  // 获取法币对应的信息
  static getCurrencyObj(val) {
    let $currencyObj = {}
    if (val) {
      $currencyObj = CurrencyConversion.options
        .find(item => item.value === val) || {}
    }
    return $currencyObj
  }
}

// 存储键值
CurrencyConversion.key = 'CURRENCY'

// localStorage 实例
CurrencyConversion.storage = new Storage(true)

// 折合方式，目前只有 CNY 和 USD，默认 CNY
CurrencyConversion.options = Object.freeze([
  { name: 'CNY', value: 'CNY', unit: '￥', default: true, langRef: ['zh-hans'] },
  { name: 'USD', value: 'USD', unit: '$' },
].sort((a, b) => {
  const index = item => (item.default ? 1 : 2)
  return index(a) - index(b)
}))

export const CurrencyPlugin = {
  install(Vue) {
    const value = CurrencyConversion.getCurrency()
    const currencyObj = {
      $currencyVal: value,
      $currencyObj: CurrencyConversion.getCurrencyObj(value),
    }
    Vue.prototype.$currency = {
      ...CurrencyConversion,
      getCurrency() {
        const val = CurrencyConversion.getCurrency()
        if (currencyObj.$currencyVal !== val) {
          this.setCurrency(val)
        }
        return val
      },
      setCurrency(val) {
        if (currencyObj.$currencyVal !== val) {
          CurrencyConversion.setCurrency(val)
          Vue.set(currencyObj, '$currencyVal', val)
          Vue.set(currencyObj, '$currencyObj', CurrencyConversion.getCurrencyObj(val))
        }
      },
    }

    Vue.mixin({
      data() {
        // 保证全局 currencyObj 对应同一个对象，这样才能实现 当在某一个组件中改变法币同时其他组件会自动更新 的需求
        return { currencyObj }
      },
      computed: {
        $currencyVal() {
          return this.currencyObj.$currencyVal
        },
        $currencyObj() {
          return this.currencyObj.$currencyObj
        },
      },
      methods: {
        // 折合舍略
        $cEx(val) {
          if (!val) {
            if (val !== 0) return ''
            return ' =0'
          }
          return ` &asymp;${this.$currencyObj.unit}${this.$numFixed2(val)}`
        },
        /**
         * 价格折合
         * type, ['last', 'high', 'low', 'open']
         * */
        $exPrice({ base_asset, quote_asset, ...res }, type = 'last') {
          if (!res[type] || !quote_asset) {
            return this.$exMiddleware({ base_asset, quote_asset: base_asset, [type]: 1, last: 1 })
          }
          return res[type] * this.$exMiddleware(
            { base_asset: quote_asset, quote_asset, [type]: 1, last: 1 },
            type,
          )
        },
        $exMiddleware({ base_asset, quote_asset, ...res }, type = 'last') {
          const {
            market: { quoteAssets },
            exchange: { exchangeRate, anchorCoin: { [this.$currencyVal]: currency } },
          } = store.state

          /**
           * 如果资产为当前计价币种，返回 1
           * */
          if (base_asset === currency) return 1

          const quoteAsset = quote_asset || currency
          const last = +(res.last || exchangeRate[`${base_asset}_${quoteAsset}`])

          /**
           * 在求交易对价格时，如果价格不存在，直接返回 ''
           * */
          const price = +(type === 'last' ? last : res[type])
          const isSymbol = !!quote_asset
          if (isSymbol && (!price || !last)) return ''

          /**
           * 找到转换的最短交易对路径
           * 比如：
           * 1. 在 ['ETH_BTC', 'CNT_USDT', 'BTC_CNT'] 交易对数组中，
           *    ETH 转换成 USDT 的最短交易对路径为 ['ETH_BTC', 'BTC_CNT', 'CNT_USDT']
           * 2. 在 ['ETH_BTC', 'CNT_USDT', 'BTC_CNT', 'BTC_USDT'] 交易对数组中，
           *    ETH 转换成 USDT 的最短交易对路径为 ['ETH_BTC', 'BTC_USDT']
           * */
          const shortestSymbols = []

          // 在市场所有的引用资产（quote_asset）中去除基准资产（base_asset）和法币资产（currency）
          // 并将这个交易对的引用资产（quoteAsset）放在第一位（如果没有被去除掉的话）
          const splicedAssets = reduceValOfArr(
            quoteAssets.map(item => item.value),
            [base_asset, currency],
          ).sort((a, b) => {
            const index = item => (item === quoteAsset ? 1 : 2)
            return index(a) - index(b)
          })
          let length = 2
          // console.log(quoteAssets)
          // console.log(shortestSymbols)
          /**
           * 从理论最短路径长度(2)出发，开始计算，直到得到第一个有效路劲，即为所求路径
           * */
          while (shortestSymbols.length < 1 && length <= splicedAssets.length + 2) {
            const symbols = []
            const arr = Array(length)
            arr[0] = base_asset
            arr[length - 1] = currency
            // console.log(arr)
            /**
             * 判断交易对价格是否存在
             * */
            const rateNotZero = (index, cb) => {
              const ascSymbol = `${arr[index - 1]}_${arr[index]}`
              const descSymbol = `${arr[index]}_${arr[index - 1]}`
              if (exchangeRate[ascSymbol] || exchangeRate[descSymbol]) {
                symbols[index - 1] = exchangeRate[ascSymbol]
                  ? { symbol: ascSymbol, rate: exchangeRate[ascSymbol] }
                  : { symbol: descSymbol, rate: 1 / exchangeRate[descSymbol] }
                if (cb) return cb()
                return true
              }
              return false
            }

            // eslint-disable-next-line no-loop-func
            const fn = (index) => {
              if (index < length - 1) {
                for (let i = 0; i < splicedAssets.length; i += 1) {
                  arr[index] = splicedAssets[i]
                  const done = rateNotZero(index, () => fn(index + 1))
                  if (done) return true
                }
                return false
              }

              if (index === length - 1) return rateNotZero(index)

              /**
               * 直到最后一个元素，返回 false
               * */
              return false
            }

            if (fn(1)) shortestSymbols.push(...symbols)
            else length += 1
          }

          /**
           * 用最短交易对路径计算折合
           * */
          if (shortestSymbols.length < 1) return ''
          return (shortestSymbols
            .reduce((pre, symbol) => pre * symbol.rate, 1) * (isSymbol ? 1 / last * price : 1))
        },
        // 交易量折合
        $exAmount(amount, symbolInfo, toFixed = 8) {
          if (!+amount) return ''
          const price = this.$exPrice(symbolInfo)
          if (price === '') return ''
          return (amount * price).toFixed(toFixed)
        },
      },
    })
  },
}
