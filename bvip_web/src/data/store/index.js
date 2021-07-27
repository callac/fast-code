import { currentTheme } from '$router/ThemeComponents'
import Home from 'data/api/home'
import Status from 'data/immutable-data/Status'
// eslint-disable-next-line import/no-unresolved,import/extensions
import { article } from 'data/store/modules/article-<<mask>>'
import { exchange } from 'data/store/modules/exchange'
import { feedback } from 'data/store/modules/feedback'
import { market } from 'data/store/modules/market'
// eslint-disable-next-line import/no-unresolved,import/extensions
import { user } from 'data/store/modules/user-<<mask>>'
import { SYSTEM } from 'data/store/mutations-types'
import { orderBy } from 'utils/Sort'
import StoreToStorage from 'utils/StoreToStorage'
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

function generateFooters() {
  return Object.keys(Status.footerItems).reduce((pre, key) => {
    // eslint-disable-next-line no-param-reassign
    pre[Status.footerItems[key].alias] = []
    return pre
  }, {})
}

const store = new Vuex.Store({
  state: {
    siteInfo: {},
    banners: [],
    popup: {},
    contacts: [],
    headers: StoreToStorage.getHeader() || [],
    footers: StoreToStorage.getFooter() || generateFooters(),
    // 服务器与客户端本地时间差
    deltaTime: 0,
  },
  getters: {
    siteInfo({ siteInfo = {} }) {
      const { logo, icon } = siteInfo
      const privilages = Reflect.has(siteInfo, 'privilages') ? siteInfo.privilages : '4,8'
      const arr = privilages.split(',')
      return {
        ...siteInfo,
        logo: logo || currentTheme.defaultLogo,
        icon: icon || require('assets/logo-fac-banner/favicon.png'),
        c2cEnabled: arr.includes('4'),
        otcEnabled: arr.includes('8'),
      }
    },
    otcAssets({ siteInfo = {} }) {
      const { otc_asset = '', otc_currency = '' } = siteInfo
      return [...new Set(otc_asset.split(',').concat(otc_currency.split(',')))]
    },
  },
  mutations: {
    [SYSTEM.GET_BANNERS](_state, arr) {
      Vue.set(_state, 'banners', arr)
    },
    [SYSTEM.GET_POPUP](_state, img) {
      Vue.set(_state, 'popup', img || {})
    },
    [SYSTEM.GET_CONTACTS](_state, arr) {
      Vue.set(_state, 'contacts', arr || [])
    },
    [SYSTEM.GET_HEADERS](_state, arr) {
      Vue.set(_state, 'headers', arr || [])
      StoreToStorage.setHeader(_state.headers)
    },
    [SYSTEM.GET_FOOTERS](_state, obj) {
      Vue.set(_state, 'footers', obj || {})
      StoreToStorage.setFooter(_state.footers)
    },
    [SYSTEM.GET_DELTA_TIME](_state, deltaTime) {
      Vue.set(_state, 'deltaTime', deltaTime)
    },
  },
  actions: {
    getBanners({ commit, state }, position) {
      return state.banners.length > 0 ? Promise.resolve() : Home.getBanner(position).then((res) => {
        const banners = orderBy(res.filter(img => img.type === 1), 'display_order', 'desc', true)
        commit(SYSTEM.GET_BANNERS, banners.length > 0
          ? banners : [{ image: currentTheme.defaultBanner, endpoint: 'web' }])
        commit(SYSTEM.GET_POPUP, res.find(img => img.type === 2 && img.display_order !== 0))
        return res
      })
    },
    getContacts({ commit }) {
      return Home.getContacts().then((res) => {
        commit(SYSTEM.GET_CONTACTS, res)
        return res
      })
    },
    getHeaders({ commit }) {
      return Home.getHeaders().then((res) => {
        commit(SYSTEM.GET_HEADERS, res)
        return res
      })
    },
    getFooters({ commit, dispatch }) {
      return Promise.all([
        Home.getFooters()
          .then(res => res.map(item => ({ ...item, class_id: item.class_id || 1 })))
          .catch(console.error),
        dispatch('article/getArticleClass', 'help')
          .then(res => res.map(item => ({ ...item, class_id: 2 })))
          .catch(console.error),
        Home.getContacts()
          .then(res => res.map(item => ({ ...item, class_id: 3 })))
          .catch(console.error),
      ]).then(([res, articleClass, followUs]) => {
        const obj = generateFooters();
        [...res, ...articleClass, ...followUs].forEach((item) => {
          const type = Status.footerItems[item.class_id]
          if (type) obj[type.alias].push(item)
        })
        commit(SYSTEM.GET_FOOTERS, obj)
        return res
      })
    },
    getDeltaTime({ commit, state }) {
      return state.deltaTime ? Promise.resolve(state.deltaTime)
        : Home.getDeltaTime().then((deltaT) => {
          commit(SYSTEM.GET_DELTA_TIME, deltaT)
          return deltaT
        })
    },
  },
  modules: { user, exchange, market, article, feedback },
})

export default store
