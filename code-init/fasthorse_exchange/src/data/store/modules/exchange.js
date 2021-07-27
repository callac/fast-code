import Exchange from 'data/api/exchange'
import { EXCHANGE } from 'data/store/mutations-types'
import Vue from 'vue'

const state = () => ({
  anchorCoin: {
    CNY: '',
    USD: '',
  },
  exchangeRate: {
    USD_CNY: 6.7,
    BTC_USD: 0,
  },
  orderHistory: [],
  cashPrice: {},
  otcPrice: {},
  otcMerchants: [],
  otcOrders: [],
})

const getters = {}

const mutations = {
  init(_state) {
    Vue.set(_state, 'orderHistory', [])
  },
  [EXCHANGE.UPDATE_ANCHOR_COIN](_state, info) {
    Vue.set(_state, 'anchorCoin', { ..._state.anchorCoin, ...info })
  },
  [EXCHANGE.UPDATE_EXCHANGE_RATE](_state, info) {
    const res = { ..._state.exchangeRate, ...info }
    if (!res.USD_CNY) res.USD_CNY = 6.7
    Vue.set(_state, 'exchangeRate', res)
  },
  [EXCHANGE.GET_ORDER_HISTORY](_state, array) {
    Vue.set(_state, 'orderHistory', array)
  },
  [EXCHANGE.GET_CASH_PRICE](_state, info) {
    Vue.set(_state, 'cashPrice', info)
  },
  [EXCHANGE.GET_OTC_PRICE](_state, info) {
    Vue.set(_state, 'otcPrice', info)
  },
  [EXCHANGE.GET_OTC_MERCHANTS](_state, arr) {
    Vue.set(_state, 'otcMerchants', arr)
  },
  [EXCHANGE.GET_OTC_ORDERS](_state, arr) {
    Vue.set(_state, 'otcOrders', arr)
  },
}

const actions = {
  getExchangeRate({ commit }) {
    commit(EXCHANGE.UPDATE_EXCHANGE_RATE, null)
    return Exchange.getExchangeRate().then((res) => {
      const obj = {
        CNY: res.cny_anchor_coin || 'CNY',
        USD: res.usd_anchor_coin || 'USD',
      }
      commit(EXCHANGE.UPDATE_EXCHANGE_RATE, {
        ...res,
        ...Object.keys(res)
          .reduce((pre, k) => ({
            ...pre,
            [k.split('_').map(s => obj[s] || s).join('_')]: res[k],
          }), {}),
      })
      commit(EXCHANGE.UPDATE_ANCHOR_COIN, obj)
      return res
    })
  },
  updateExchangeRate({ commit }, info) {
    commit(EXCHANGE.UPDATE_EXCHANGE_RATE, info)
    return Promise.resolve(true)
  },
  getCashPrice({ commit }) {
    return Exchange.getCashPrice().then((res) => {
      commit(EXCHANGE.GET_CASH_PRICE, res)
      commit(EXCHANGE.UPDATE_EXCHANGE_RATE, { [`${res.asset}_CNY`]: +res.sell_price })
      return res
    })
  },
  exchangeCash({ dispatch }, { amount, type, user_bank_id }) {
    return Exchange.exchangeCash({ amount, type, user_bank_id }).then((res) => {
      dispatch('getCashOrders', { status: 1 })
      return res
    })
  },
  getCashOrders({ commit }, { status, offset, limit }) {
    return Exchange.getCashOrderHistory({ status, offset, limit }).then((res) => {
      commit(EXCHANGE.GET_ORDER_HISTORY, res)
      return res
    })
  },
  cancelCashOrder(context, id) {
    return Exchange.updateCashOrder({ id })
  },
  confirmCashOrder(context, id) {
    return Exchange.updateCashOrder({ id, action: 'confirm' })
  },
  tradeLimit(context, { market, side, amount, price }) {
    return Exchange.tradeLimit({ market, side, amount, price })
  },
  tradeByMarket(context, { market, side, amount }) {
    return Exchange.tradeByMarket({ market, side, amount })
  },
  tradeCancel(context, { market, order_id }) {
    return Exchange.tradeCancel({ market, order_id })
  },
  orderReferences(context, { order_id, offset, limit }) {
    return Exchange.orderReferences({ order_id, offset, limit })
  },
  getOtcPrice({ commit }, params) {
    return Exchange.getOtcPrice(params).then((res) => {
      commit(EXCHANGE.GET_OTC_PRICE, res)
      return res
    })
  },
  getOtcMerchants({ commit }, params) {
    return Exchange.getOtcMerchants(params).then((res) => {
      commit(EXCHANGE.GET_OTC_MERCHANTS, res.records)
      return res
    })
  },
  getMyOtcOrders({ commit }, params) {
    return Exchange.getMyOtcOrders(params).then((res) => {
      commit(EXCHANGE.GET_OTC_ORDERS, res.records)
      return res
    })
  },
  getOtcOrderDetails(context, id) {
    return Exchange.getOtcOrderDetails(id)
  },
  exchangeOtc(context, params) {
    return Exchange.exchangeOtc(params)
  },
  otcUpdate(content, params) {
    return Exchange.otcUpdate(params)
  },
}

export const exchange = {
  namespaced: true, // 增加命名空间，外部使用时需要指明命名空间（如果没有外部冲突，可以去掉）
  state: state(),
  getters,
  mutations,
  actions,
}
