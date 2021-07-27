import { objectDeepMerge } from '@livelybone/copy'
import { unsubscribeAll } from '@livelybone/simple-observer'
import Market from 'data/api/market'
import MarketSocket from 'data/api/market-socket'
import { MARKET } from 'data/store/mutations-types'
import { getPrecision } from 'utils/GetPrecision'
import Singleton from 'utils/Singleton'
import { deepMergeArr, filterZero, orderBy } from 'utils/Sort'
import StoreToStorage from 'utils/StoreToStorage'
import Vue from 'vue'

function klineData(item) {
  return [
    item[0] * 1000,
    +item[1],
    +item[3],
    +item[4],
    +item[2],
    ...item.slice(5).map(val => (Number.isNaN(+val) ? val : +val)),
  ]
}

// 清除重复交易对信息
/* eslint-disable */
function deteleObject(obj) {
  let uniques = [];
  const objLength = obj.length
  let str = '';
  for (let i = 0; i < objLength; i++) {
    // symbol
    if (str.indexOf(obj[i].symbol) === -1) {
      str += obj[i].symbol + ','
      uniques.push(obj[i]);
    }
  }
  return uniques
}

const subscription = {
  listenPrices: null,
  deals: {},
  depthMap: {},
}

const marketUpdate = {
  marketList: [],
  time: null,
}

const state = {
  // symbols: StoreToStorage.getSymbols() || {},
  symbols: {},
  symbolClasses: StoreToStorage.getSymbolClasses() || [],
  assets: [],
  assetsInfo: {},
  quoteAssets: StoreToStorage.getQuoteAssets() || [],
  deals: StoreToStorage.getDeals() || {},
  depthMap: StoreToStorage.getDepthMap() || {},
  kline: {
    data: [],
    updateData: { data: [], market: '', interval: 0 },
  },
  foreignOtcAssets: [],
}

const getters = {
  symbolsArr(_state) {
    return Object.values(_state.symbols)
  },
}

const mutations = {
  [MARKET.GET_SYMBOLS](_state, info) {
    Vue.set(_state, 'symbols', { ...objectDeepMerge(_state.symbols, info) })
    // StoreToStorage.setSymbols(_state.symbols)
  },
  [MARKET.GET_SYMBOL_CLASSES](_state, arr) {
    Vue.set(_state, 'symbolClasses', arr)
    StoreToStorage.setSymbolClasses(_state.symbolClasses)
  },
  [MARKET.GET_ASSETS_INFO_LIST](_state, arr) {
    Vue.set(_state, 'assets', arr)
  },
  [MARKET.GET_ASSET_INFO](_state, info) {
    Vue.set(_state.assetsInfo, String(info.asset_code).toUpperCase(), info)
  },
  [MARKET.GET_QUOTE_ASSETS](_state, arr) {
    Vue.set(_state, 'quoteAssets', arr)
    StoreToStorage.setQuoteAssets(_state.quoteAssets)
  },
  [MARKET.UPDATE_SYMBOL](_state, info) {
    Vue.set(_state.symbols, info.symbol, { ...(_state.symbols[info.symbol] || {}), ...info })
    StoreToStorage.setSymbols(_state.symbols)
  },
  [MARKET.GET_DEALS](_state, info) {
    Vue.set(_state.deals, info.symbol, info.array)
  },
  [MARKET.UPDATE_DEALS](_state, info) {
    Vue.set(_state.deals, info.symbol, orderBy(deepMergeArr(info.data, _state.deals[info.symbol] || [], 'id'), 'time', 'desc').slice(0, 60))
    StoreToStorage.setDeals(_state.deals)
  },
  [MARKET.GET_DEPTH](_state, info) {
    Vue.set(_state.depthMap, info.symbol, info.data ? {
      sell: filterZero(orderBy(info.data.sell, 'price', 'asc', true), 'amount'),
      buy: filterZero(orderBy(info.data.buy, 'price', 'desc', true), 'amount'),
    } : {})
    StoreToStorage.setDepthMap(_state.depthMap)
  },
  [MARKET.UPDATE_DEPTH](_state, info) {
    const sell = filterZero(orderBy(deepMergeArr(_state.depthMap[info.symbol].sell, info.data.sell || [], 'price'), 'price', 'asc', true), 'amount')
    const buy = filterZero(orderBy(deepMergeArr(_state.depthMap[info.symbol].buy, info.data.buy || [], 'price'), 'price', 'desc', true), 'amount')
    Vue.set(_state.depthMap, info.symbol, info.data ? {
      sell: sell.slice(Math.max(sell.length - 70, 0)),
      buy: buy.slice(0, 70),
    } : {})
    StoreToStorage.setDepthMap(_state.depthMap)
  },
  [MARKET.SUBSCRIBE_KLINE](_state, info) {
    Vue.set(_state.kline, 'updateData', info)
  },
  [MARKET.QUERY_KLINE](_state, { pre = false, arr }) {
    Vue.set(_state.kline, 'data', pre ? [...arr, _state.kline.data] : arr)
  },
  [MARKET.FOREIGN_OTC_ASSETS](_state, arr) {
    Vue.set(_state, 'foreignOtcAssets', arr)
  },
}

const actions = {
  getSymbols(context) {
    return Market.getSymbols()
      .then((res) => {
        const result = {}
        const quoteAssets = []
        res.forEach((item) => {
          result[item.symbol] = { ...item, precision: getPrecision(item) }
          const asset = quoteAssets.find(as => as.value === item.quote_asset)
          if (!asset) {
            quoteAssets.push({
              name: item.quote_asset_name || item.quote_asset,
              value: item.quote_asset,
            })
          }
        })
        context.commit(MARKET.GET_SYMBOLS, result)
        context.commit(MARKET.GET_QUOTE_ASSETS, quoteAssets)
        return res
      })
  },
  getSymbolClasses(context) {
    return Market.getSymbolClasses().then((res) => {
      context.commit(MARKET.GET_SYMBOL_CLASSES, res)
      return res
    })
  },
  getAssetsInfoList({ commit }, { search, offset, limit }) {
    return Market.getAssetsInfoList({ search, offset, limit })
      .then((res) => {
        commit(MARKET.GET_ASSETS_INFO_LIST, res.records)
        return res
      })
  },
  getAssetInfo(context, assetCode) {
    return context.state.assetsInfo[assetCode] ? Promise.resolve()
      : Singleton.promise(
        () => Market.getAssetInfo(assetCode)
          .then((res) => {
            context.commit(MARKET.GET_ASSET_INFO, res)
            return res
          }),
        `getAssetInfo-${assetCode}`,
      )
  },
  updateSymbol({ commit }, info) {
    commit(MARKET.UPDATE_SYMBOL, info)
    return Promise.resolve(true)
  },
  klineQuery({ commit }, { pre = false, market, limit, start, end, interval }) {
    return MarketSocket.klineQuery({
      market,
      limit,
      start,
      end,
      interval,
    }).then((res) => {
      commit(MARKET.QUERY_KLINE, { pre, arr: res })
      return res
    })
  },
  klineUpdate({ commit }, { market, interval }) {
    subscription.kline = MarketSocket.klineUpdate({
      market,
      interval,
    }).subscribe((res) => {
      if (res.length > 0) {
        commit(MARKET.SUBSCRIBE_KLINE, {
          data: res,
          interval,
          market: res[0][7],
        })
      }
    })
    return Promise.resolve()
  },
  klineUnsubscribe({ commit }) {
    try {
      if (subscription.kline) {
        MarketSocket.klineUnsubscribe()
        subscription.kline.unsubscribe()
        commit(MARKET.QUERY_KLINE, { arr: [] })
        commit(MARKET.SUBSCRIBE_KLINE, { data: [], market: '', interval: 0 })
      }
      subscription.kline = null
      return Promise.resolve()
    } catch (e) {
      return Promise.reject(e)
    }
  },
  listenPrices(context, symbols) {
    if (subscription.listenPrices) return Promise.reject(new Error('Please unsubscribe the previous subscription'))
    try {
      subscription.listenPrices = MarketSocket
        .marketToday(symbols || context.getters.symbolsArr.map(item => item.symbol))
        .subscribe((symbolInfo) => {
          marketUpdate.marketList.push(symbolInfo)
          const now = Date.now();
          if (marketUpdate.time === null) {
            marketUpdate.time = now
          }
          if (now - marketUpdate.time >= 10000) {
            deteleObject(marketUpdate.marketList)
            marketUpdate.marketList.map((item) => {
              context.dispatch('exchange/updateExchangeRate', { [item.symbol]: +item.last }, { root: true })
            })
            marketUpdate.marketList = []
            marketUpdate.time = now
          }
          context.dispatch('updateSymbol', symbolInfo)
          // context.dispatch('exchange/updateExchangeRate',
          // { [symbolInfo.symbol]: +symbolInfo.last }, { root: true })
          // .then(() => console.log('---- Socket: Exchange rate update success!'))
          // .catch(e => console.error('---- Socket: Exchange rate update failed!', e))
          // context.dispatch('updateSymbol', symbolInfo)
        })
      return Promise.resolve()
    } catch (e) {
      return Promise.reject(e)
    }
  },
  listenPricesUnsubscribe() {
    try {
      if (subscription.listenPrices) {
        subscription.listenPrices.unsubscribe()
        MarketSocket.marketTodayUnsubscribe()
      }
      subscription.listenPrices = null
      return Promise.resolve()
    } catch (e) {
      return Promise.reject(e)
    }
  },
  getDeals(context, { symbol, limit }) {
    return MarketSocket.dealsQuery({ symbol, limit }).then((res) => {
      context.commit(MARKET.GET_DEALS, { symbol, array: res })
    })
  },
  dealsSubscribe(context, symbol) {
    if (subscription.deals[symbol]) return Promise.reject(new Error('Please unsubscribe the previous subscription'))
    try {
      unsubscribeAll(Object.keys(subscription.deals).map(k => subscription.deals[k]))
      subscription.deals[symbol] = MarketSocket.dealsSubscribe([symbol]).subscribe((data) => {
        context.commit(MARKET.UPDATE_DEALS, {
          symbol: data.symbol,
          data: data.deals,
        })
      })
      return Promise.resolve()
    } catch (e) {
      return Promise.reject(e)
    }
  },
  dealsUnsubscribe(context, symbol) {
    try {
      if (subscription.deals[symbol]) {
        subscription.deals[symbol].unsubscribe()
        MarketSocket.dealsUnsubscribe()
      }
      subscription.deals[symbol] = null
      return Promise.resolve()
    } catch (e) {
      return Promise.reject(e)
    }
  },
  getDepthMap(context, { symbol, limit, interval }) {
    return MarketSocket.depthQuery({ symbol, limit, interval }).then((res) => {
      context.commit(MARKET.GET_DEPTH, { symbol, data: res })
    })
  },
  depthMapSubscribe(context, symbol) {
    if (subscription.depthMap[symbol]) return Promise.reject(new Error('Please unsubscribe the previous subscription'))
    try {
      unsubscribeAll(Object.keys(subscription.depthMap).map(k => subscription.depthMap[k]))
      subscription.depthMap[symbol] = MarketSocket.depthSubscribe({ symbol }).subscribe((data) => {
        if (data.clean) {
          context.commit(MARKET.GET_DEPTH, {
            symbol: data.symbol,
            data,
          })
        } else context.commit(MARKET.UPDATE_DEPTH, { symbol: data.symbol, data })
      })
      return Promise.resolve()
    } catch (e) {
      return Promise.reject(e)
    }
  },
  depthMapUnsubscribe(context, symbol) {
    try {
      if (subscription.depthMap[symbol]) {
        subscription.depthMap[symbol].unsubscribe()
        MarketSocket.depthUnsubscribe()
      }
      subscription.depthMap[symbol] = null
      return Promise.resolve()
    } catch (e) {
      return Promise.reject(e)
    }
  },
  getForeignOtcAssets({ commit }) {
    return Market.getForeignOtcAssets().then((res) => {
      commit(MARKET.FOREIGN_OTC_ASSETS, res)
      return res
    })
  },

  getKline(context, { symbol, start, end, interval }) {
    return Market.klineQuery({ symbol, startTime: start, endTime: end, interval })
      .then(res => res.map(klineData))
  },
}

export const market = {
  namespaced: true, // 增加命名空间，外部使用时需要指明命名空间（如果没有外部冲突，可以去掉）
  state,
  getters,
  mutations,
  actions,
}
