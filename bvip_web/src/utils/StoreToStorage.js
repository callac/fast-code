/**
 * 利用 localStorage 缓存用户信息，交易对信息，深度信息，历史交易信息...
 * */
import Storage from 'utils/StorageX'
import Singleton from 'utils/Singleton'

// 不使用 cookie
const storage = new Storage()

storage.delete(1)

const keys = {
  header: 'header',
  footer: 'footer',
  userInfo: 'userInfo',
  inviteInfo: 'inviteInfo',
  symbols: 'symbols',
  symbolClasses: 'symbolClasses',
  quoteAssets: 'quoteAssets',
  deals: 'deals',
  depthMap: 'depthMap',
}

function reduceFr(fn, key) {
  return Singleton.promise(() => new Promise((res) => {
    setTimeout(() => {
      fn()
      res()
    }, 1000)
  }), key)
}

export default class StoreToStorage {
  /**
   * @param obj
   * @param token 授权token
   * */
  static setUser(obj = {}, token) {
    if (token) {
      reduceFr(() => storage.set(keys.userInfo, { [token]: obj }), keys.userInfo)
    }
  }

  static getUser(token) {
    if (!token) return {}
    return (storage.get(keys.userInfo) || {})[token] || {}
  }

  static setInvite(obj = {}, token) {
    if (token) {
      reduceFr(() => storage.set(keys.inviteInfo, { [token]: obj }), keys.inviteInfo)
    }
  }

  static getInvite(token) {
    if (!token) return {}
    return (storage.get(keys.inviteInfo) || {})[token] || {}
  }

  static setHeader(obj = {}) {
    reduceFr(() => storage.set(keys.header, obj), keys.header)
  }

  static getHeader() {
    return storage.get(keys.header)
  }

  static setFooter(obj = {}) {
    reduceFr(() => storage.set(keys.footer, obj), keys.footer)
  }

  static getFooter() {
    return storage.get(keys.footer)
  }

  static setSymbols(obj = {}) {
    reduceFr(() => storage.set(keys.symbols, obj), keys.symbols)
  }

  static getSymbols() {
    return storage.get(keys.symbols)
  }

  static setSymbolClasses(obj = []) {
    reduceFr(() => storage.set(keys.symbolClasses, obj), keys.symbolClasses)
  }

  static getSymbolClasses() {
    return storage.get(keys.symbolClasses)
  }

  static setQuoteAssets(obj = []) {
    reduceFr(() => storage.set(keys.quoteAssets, obj), keys.quoteAssets)
  }

  static getQuoteAssets() {
    return storage.get(keys.quoteAssets)
  }

  static setDeals(obj = {}) {
    reduceFr(() => storage.set(keys.deals, obj), keys.deals)
  }

  static getDeals() {
    return storage.get(keys.deals)
  }

  static setDepthMap(obj = {}) {
    reduceFr(() => storage.set(keys.depthMap, obj), keys.depthMap)
  }

  static getDepthMap() {
    return storage.get(keys.depthMap)
  }
}
