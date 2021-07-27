import { AuthToken } from 'data/api/auth-token'
import Exchange from 'data/api/exchange'
import MarketSocket from 'data/api/market-socket'
// eslint-disable-next-line import/no-unresolved,import/extensions
import User from 'data/api/user-<<mask>>'
import Status from 'data/immutable-data/Status'
import { USER } from 'data/store/mutations-types'
import Singleton from 'utils/Singleton'
import { deepMergeArr, deepMergeObj, orderBy } from 'utils/Sort'
import StoreToStorage from 'utils/StoreToStorage'
import Vue from 'vue'

const subscription = {
  assets: null,
  order: null,
}

const state = () => ({
  info: StoreToStorage.getUser(AuthToken.getToken()),
  countries: [],
  assets: {},
  assetsHistory: {},
  depositAddresses: {},
  openOrder: [],
  orderHistory: [],
  security: {
    phone: false,
    email: false,
    google: false,
  },
  addresses: {},
  rechargeRecords: {},
  withdrawRecords: {},
  loginHistory: [],
  bankCards: [],
  inviteData: {},
  inviteRecords: {},
  rebaseRecords: {},
  inviteInfo: StoreToStorage.getInvite(AuthToken.getToken()),
  inviteTop: [],
  tokenHistory: [],
  businessTypes: [],
  certificateInfo: {},
  ossConfig: null,
  myPayTypes: [],
})

const getters = {
  id(_state) {
    return _state.info.id
  },
}

const mutations = {
  init(_state) {
    const data = state()
    Object.keys(data).forEach((k) => {
      Vue.set(_state, k, data[k])
    })
  },
  [USER.GET_USER_INFO](_state, info) {
    Vue.set(_state, 'info', {
      ...info,
      username: info.phone || info.email,
      pay_bound_all: info.bank_card_bound || info.pay_bound ? 1 : 0,
    })
    StoreToStorage.setUser(_state.info, AuthToken.getToken())
  },
  [USER.UPDATE_USER_INFO](_state, info) {
    Vue.set(_state, 'info', { ..._state.info, ...info })
    StoreToStorage.setUser(_state.info, AuthToken.getToken())
  },
  [USER.GET_COUNTRIES](_state, info) {
    Vue.set(_state, 'countries', info)
  },
  [USER.GET_USER_ASSETS](_state, info) {
    Vue.set(_state, 'assets', info)
  },
  [USER.UPDATE_ASSETS](_state, info) {
    Vue.set(_state, 'assets', deepMergeObj(_state.assets, info))
  },
  [USER.GET_ASSETS_HISTORY](_state, info) {
    Vue.set(_state.assetsHistory, info.asset, info.array)
  },
  [USER.GET_OPEN_ORDERS](_state, info) {
    Vue.set(_state.openOrder, info.symbol, info.array)
  },
  [USER.UPDATE_OPEN_ORDERS](_state, info) {
    Vue.set(_state.openOrder, info.symbol,
      orderBy(deepMergeArr(_state.openOrder[info.symbol] || [], [info.data], 'id'), 'mtime', 'desc'))
  },
  [USER.DELETE_OPEN_ORDERS](_state, info) {
    const { symbol, data: { id } } = info
    const array = _state.openOrder[symbol]
    const index = Object.keys(array).find(k => array[k].id === id)
    if (index) {
      array.splice(index, 1)
      Vue.set(_state.openOrder, symbol, array)
    }
  },
  [USER.GET_HISTORY_ORDERS](_state, info) {
    Vue.set(_state.orderHistory, info.symbol, info.array)
  },
  [USER.UPDATE_HISTORY_ORDERS](_state, info) {
    Vue.set(_state.orderHistory, info.symbol,
      [info.data, ...(_state.orderHistory[info.symbol] || [])])
  },
  [USER.GET_SECURITY](_state, info) {
    Vue.set(_state, 'security', info)
  },
  [USER.UPDATE_SECURITY](_state, info) {
    Vue.set(_state, 'security', { ..._state.security, ...info })
  },
  [USER.GET_ADDRESSES](_state, info) {
    Vue.set(_state, 'addresses', info)
  },
  [USER.UPDATE_DEPOSIT_ADDRESSES](_state, info) {
    Vue.set(_state.depositAddresses, info.asset, info.address)
  },
  [USER.GET_DEPOSIT_RECORDS](_state, info) {
    Vue.set(_state.rechargeRecords, info.asset, info.info)
  },
  [USER.GET_WITHDRAW_RECORDS](_state, info) {
    Vue.set(_state.withdrawRecords, info.asset, info.info)
  },
  [USER.GET_LOGIN_HISTORY](_state, array) {
    Vue.set(_state, 'loginHistory', array)
  },
  [USER.GET_BANK_CARD](_state, info) {
    Vue.set(_state, 'bankCards', info)
  },
  [USER.DEL_BANK_CARD](_state, id) {
    Vue.set(_state, 'bankCards', _state.bankCards.filter(card => card.ID !== id))
  },
  [USER.GET_INVITE_INFO](_state, info) {
    Vue.set(_state, 'inviteInfo', info)
    StoreToStorage.setInvite(_state.inviteInfo, AuthToken.getToken())
  },
  [USER.GET_INVITE_DATA](_state, info) {
    Vue.set(_state, 'inviteData', info)
  },
  [USER.GET_INVITE_RECORDS](_state, info) {
    Vue.set(_state, 'inviteRecords', info)
  },
  [USER.GET_REBASE_RECORDS](_state, info) {
    Vue.set(_state, 'rebaseRecords', info)
  },
  [USER.GET_INVITE_TOP](_state, arr) {
    Vue.set(_state, 'inviteTop', arr)
  },
  [USER.GET_TOKEN_STATEMENT](_state, arr) {
    Vue.set(_state, 'tokenHistory', arr)
  },
  [USER.GET_BUSINESS_TYPES](_state, arr) {
    Vue.set(_state, 'businessTypes', arr)
  },
  [USER.GET_CERTIFICATE_INFO](_state, obj) {
    Vue.set(_state, 'certificateInfo', { ..._state.certificateInfo, ...obj })
  },
  [USER.GET_OSS_CONFIG](_state, obj) {
    Vue.set(_state, 'ossConfig', obj)
  },
  [USER.GET_PAY_TYPES](_state, arr) {
    Vue.set(_state, 'myPayTypes', arr)
  },
}

const actions = {
  // eslint-disable-next-line max-len
  register({ commit }, { username, password, code, password_confirmation, country_id, recommend_code }) {
    return User.register({
      username,
      password,
      code,
      password_confirmation,
      country_id,
      recommend_code,
    }).then((res) => {
      commit(USER.GET_USER_INFO, { role: 'client', ...res })
      return res
    })
  },
  getCountries({ commit }) {
    return User.getCountries().then((res) => {
      commit(USER.GET_COUNTRIES, res)
    })
  },
  getUserInfo({ commit }) {
    return Singleton.promise(() => User.getUser()
      .then((res) => {
        commit(USER.GET_USER_INFO, { role: 'client', ...res })
        return res
      }), 'getUser')
  },
  signIn(context, { username, password }) {
    return User.signIn({ username, password })
  },
  safeLogin({ commit }, { sms_code, email_code, two_step_code }) {
    return User.safeLogin({ sms_code, email_code, two_step_code })
      .then(res => commit(USER.GET_USER_INFO, { role: 'client', ...res }))
  },
  logout() {
    return User.signOut().then(() => {
      // commit('init')
      // commit('exchange/init', null, { root: true })
      window.location.href = '/'
    })
  },
  getAssets({ commit }) {
    return User.getAssets().then((data) => {
      commit(USER.UPDATE_ASSETS, data)
      return data
    })
  },
  getAssetsHistory({ commit }, { asset, offset, limit }) {
    return User.getRechargeHistory({ asset, offset, limit }).then((res) => {
      commit(USER.GET_ASSETS_HISTORY, { asset, array: res })
      return res
    })
  },
  assetsSubscribe({ commit }, symbols) {
    if (subscription.assets) return Promise.reject(new Error('Please unsubscribe the previous subscription'))
    try {
      subscription.assets = MarketSocket
        .assetSubscribe(symbols).subscribe(data => commit(USER.UPDATE_ASSETS, data))
      return Promise.resolve()
    } catch (e) {
      return Promise.reject(e)
    }
  },
  assetsUnsubscribe() {
    try {
      if (subscription.assets) {
        subscription.assets.unsubscribe()
        MarketSocket.assetUnsubscribe()
      }
      subscription.assets = null
      return Promise.resolve()
    } catch (e) {
      return Promise.reject(e)
    }
  },
  orderQuery({ commit }, { symbol, offset, limit }) {
    return MarketSocket.orderQuery({ symbol, offset, limit }).then((res) => {
      commit(USER.GET_OPEN_ORDERS, {
        symbol,
        array: res.records,
      })
      return res
    })
  },
  orderHistoryQuery({ commit }, { symbol, start_time, end_time, offset, limit, side }) {
    return MarketSocket.orderHistoryQuery({
      symbol,
      start_time,
      end_time,
      offset,
      limit,
      side,
    }).then((res) => {
      commit(USER.GET_HISTORY_ORDERS, { symbol, array: res.records })
      return res
    })
  },
  getOrderHistory({ commit }, { symbol, start_time, end_time, offset, limit, side }) {
    return Exchange.orderFinishedList({
      market: symbol,
      start_time,
      end_time,
      offset,
      limit,
      side,
    }).then((res) => {
      commit(USER.GET_HISTORY_ORDERS, { symbol, array: res.records })
      return res
    })
  },
  orderSubscribe({ commit }, symbols) {
    if (subscription.order) return Promise.reject(new Error('Please unsubscribe the previous subscription'))
    try {
      subscription.order = MarketSocket
        .orderSubscribe(symbols).subscribe(({ event, order }) => {
          /**
           * @param {Number} event, 1: PUT, 2: UPDATE, 3: FINISH
           * */
          const result = { symbol: order.market, data: order }
          if (event !== 3) {
            commit(USER.UPDATE_OPEN_ORDERS, result)
          } else {
            commit(USER.DELETE_OPEN_ORDERS, result)
            if (order.status !== Status.orderStatus.CANCELED.value) {
              commit(USER.UPDATE_HISTORY_ORDERS, result)
            }
          }
        })
      return Promise.resolve()
    } catch (e) {
      return Promise.reject(e)
    }
  },
  orderUnsubscribe() {
    try {
      if (subscription.order) {
        subscription.order.unsubscribe()
        MarketSocket.orderUnsubscribe()
      }
      subscription.order = null
      return Promise.resolve()
    } catch (e) {
      return Promise.reject(e)
    }
  },
  getSecurity({ commit }) {
    return User.getSecurity().then((res) => {
      commit(USER.GET_SECURITY, res)
      return res
    })
  },
  verifyOpen({ commit }, type) {
    return User.verifyOpen(type).then((res) => {
      commit(USER.UPDATE_SECURITY, { [type]: true })
      return res
    })
  },
  verifyClose({ commit }, { type, sms_code, email_code, two_step_code }) {
    return User.verifyClose({ type, sms_code, email_code, two_step_code }).then((res) => {
      commit(USER.UPDATE_SECURITY, { [type]: false })
      return res
    })
  },
  getDepositAddress({ commit }, asset) {
    return User.getRechargeAddress(asset).then((res) => {
      commit(USER.UPDATE_DEPOSIT_ADDRESSES, { asset, address: res })
      return res
    })
  },
  getWithdrawAddresses({ commit }, { asset, offset, limit }) {
    return User.getWithdrawAddresses({ asset, offset, limit }).then((res) => {
      commit(USER.GET_ADDRESSES, res)
      return res
    })
  },
  // eslint-disable-next-line max-len
  addWithdrawAddress(context, { asset, name, address, remark, memo, sms_code, email_code, two_step_code }) {
    return User.addWithdrawAddress({
      asset,
      name,
      address,
      remark,
      memo,
      sms_code,
      email_code,
      two_step_code,
    })
  },
  delWithdrawAddress(context, id) {
    return User.delWithdrawAddress(id)
  },
  // eslint-disable-next-line
  withdraw(context, { asset, address_id, amount, password, sms_code, email_code, two_step_code }) {
    return User.withdraw({
      asset,
      address_id,
      amount,
      password,
      sms_code,
      email_code,
      two_step_code,
    })
  },
  withdrawCancel(context, id) {
    return User.withdrawCancel(id)
  },
  getWithdrawRecords({ commit }, { asset, offset, limit }) {
    return User.getWithdrawRecords({ asset, offset, limit }).then((res) => {
      commit(USER.GET_WITHDRAW_RECORDS, { asset, info: res })
      return res
    })
  },
  getRechargeRecords({ commit }, { asset, offset, limit }) {
    return User.getRechargeHistory({ asset, offset, limit }).then((res) => {
      commit(USER.GET_DEPOSIT_RECORDS, { asset, info: res })
      return res
    })
  },
  bindPhone({ commit }, { phone, sms_code, email_code, country_id, two_step_code }) {
    return User.bindPhone({
      phone,
      sms_code,
      email_code,
      country_id,
      two_step_code,
    }).then((res) => {
      commit(USER.UPDATE_USER_INFO, { phone, username: phone, phone_bound: 1 })
      return res
    })
  },
  bindEmail({ commit }, { email, sms_code, email_code, two_step_code }) {
    return User.bindEmail({ email, sms_code, email_code, two_step_code }).then((res) => {
      commit(USER.UPDATE_USER_INFO, { email, email_bound: 1 })
      return res
    })
  },
  // eslint-disable-next-line
  setFundPassword({ commit }, { password, password_confirmation, sms_code, email_code, two_step_code }) {
    return User.setFundPassword({
      password,
      password_confirmation,
      sms_code,
      email_code,
      two_step_code,
    }).then((res) => {
      commit(USER.UPDATE_USER_INFO, { withdraw_password_set: 1 })
      return res
    })
  },
  // eslint-disable-next-line
  resetFundPassword(context, { password, password_confirmation, sms_code, email_code, two_step_code }) {
    return User.resetFundPassword({
      password,
      password_confirmation,
      sms_code,
      email_code,
      two_step_code,
    })
  },
  setGoogle({ commit }, { two_step_code, sms_code, email_code }) {
    return User.setGoogleVerify({ two_step_code, sms_code, email_code }).then(() => {
      commit(USER.UPDATE_USER_INFO, { two_step_set: 1 })
    })
  },
  getCertificationUrl(context, { country_id, first_name, last_name, number }) {
    return User.getCertificationUrl({ country_id, first_name, last_name, number }).then((res) => {
      context.dispatch('getCertificateInfo')
      return res
    })
  },
  getLoginHistory({ commit }, { offset, limit }) {
    return User.getLoginHistory({ offset, limit }).then((res) => {
      commit(USER.GET_LOGIN_HISTORY, res)
      return res
    })
  },
  getCard({ commit }) {
    return User.getCard().then((res) => {
      commit(USER.GET_BANK_CARD, res)
      return res
    })
  },
  // eslint-disable-next-line max-len
  setCard({ commit }, { bank_name, sub_bank_name, number, pre_phone, sms_code, email_code, two_step_code }) {
    return User.setCard({
      bank_name,
      sub_bank_name,
      number,
      pre_phone,
      sms_code,
      email_code,
      two_step_code,
    }).then((res) => {
      commit(USER.UPDATE_USER_INFO, { bank_card_bound: 1 })
      return res
    })
  },
  delCard({ commit }, id) {
    return User.delCard(id).then((res) => {
      commit(USER.DEL_BANK_CARD, id)
      return res
    })
  },
  getCode(context, { username, use_type, id, img_code, country_id }) {
    return User.sendSms({ username, use_type, id, img_code, country_id })
  },
  getCodeAfterLogin(context, { type, use_type, phone, email, country_id }) {
    return User.sendSmsAfterLogin({ type, use_type, phone, email, country_id })
  },
  getGoogleVerify() {
    return User.getGoogleVerify()
  },
  resetPasswordAfterLogin(context, { origin_password, password, password_confirmation }) {
    return User.resetPasswordAfterLogin({ origin_password, password, password_confirmation })
  },
  getCodeImg() {
    return User.getImgCode()
  },
  resetPassword(context, { username, code, password, password_confirmation }) {
    return User.resetPassword({ username, code, password, password_confirmation })
  },
  getInviteInfo({ commit }) {
    return User.getInvite().then((res) => {
      commit(USER.GET_INVITE_INFO, res)
      return res
    })
  },
  getInviteData({ commit }) {
    return User.getInviteData().then((res) => {
      commit(USER.GET_INVITE_DATA, res)
      return res
    })
  },
  getInviteRecords({ commit }, { offset, limit }) {
    return User.getInviteRecords({ offset, limit }).then((res) => {
      commit(USER.GET_INVITE_RECORDS, res)
      return res
    })
  },
  getRebaseRecords({ commit }, { offset, limit }) {
    return User.getRebaseRecords({ offset, limit }).then((res) => {
      // const arr = []
      // Object.keys(res).forEach((key) => {
      //   arr.push(res[key])
      // })
      commit(USER.GET_REBASE_RECORDS, res)
      return res
    })
  },
  getInviteTop({ commit }) {
    return User.getRankTop().then((res) => {
      commit(USER.GET_INVITE_TOP, res)
      return res
    })
  },
  getTokenStatement({ commit }, { asset, business, start_time, end_time, offset, limit }) {
    return User.getTokenHistory({ asset, business, start_time, end_time, offset, limit })
      .then((res) => {
        commit(USER.GET_TOKEN_STATEMENT, res.records)
        return res
      })
  },
  getBusinessType({ commit }) {
    return User.getBusinessType().then((res) => {
      commit(USER.GET_BUSINESS_TYPES, res)
      return res
    })
  },
  getCertificateInfo({ commit }) {
    return User.getCertificateInfo().then((res) => {
      commit(USER.GET_CERTIFICATE_INFO, res)
      return res
    })
  },
  updateCertificateInfo(context, { id, last_name, first_name, country_id, number }) {
    return User.updateCertificateInfo({ id, last_name, first_name, country_id, number })
  },
  getOssConfig({ commit, state: _state }) {
    return _state.ossConfig ? Promise.resolve(_state.ossConfig)
      : User.getOssConfig().then((res) => {
        commit(USER.GET_OSS_CONFIG, res)
        return res
      })
  },
  uploadCertificateImg(context, { id, file, img_type }) {
    return User.uploadCertificateImg({ identity_id: id, filename: file, img_type })
  },
  certificateSubmitAll(context, id) {
    return User.certificateSubmitAll(id)
  },
  getMyPayTypes({ commit }) {
    return User.getMyOtcPayTypes().then((res) => {
      commit(USER.GET_PAY_TYPES, res)
      return res
    })
  },
  transferToOtc({ dispatch }, params) {
    return User.transferToOtc(params).then((res) => {
      dispatch('getAssets')
      return res
    })
  },
  addMobilePay(context, params) {
    return User.addMobilePay(params)
  },
  delMobilePay(context, id) {
    return User.delMobilePay(id)
  },
}

export const user = {
  namespaced: true, // 增加命名空间，外部使用时需要指明命名空间（如果没有外部冲突，可以去掉）
  state: state(),
  getters,
  mutations,
  actions,
}
