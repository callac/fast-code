import Home from 'data/api/home'
import { ARTICLE } from 'data/store/mutations-types'
import Vue from 'vue'

const state = {
  familiarList: {},
  articleList: {},
  articles: {},
  classes: {},
  aboutArticles: {},
}

const getters = {
  classesArr(_state) {
    const obj = {}
    Object.keys(_state.classes).forEach((i) => {
      obj[i] = Object.keys(_state.classes[i]).map(k => _state.classes[i][k])
    })
    return obj
  },
}

const mutations = {
  [ARTICLE.GET_ARTICLES](_state, { type, classId, array }) {
    Vue.set(_state.articleList, type, { [classId || type]: array })
  },
  [ARTICLE.GET_FAMILIAR](_state, { type, array }) {
    Vue.set(_state.familiarList, type, array)
  },
  [ARTICLE.UPDATE_CLASSES](_state, { type, info }) {
    Vue.set(_state.classes, type, { ...(_state.classes[type]), ...info })
  },
  [ARTICLE.GET_ARTICLE](_state, { type, id, info }) {
    Vue.set(_state.articles, type, { ...(_state.articles[type] || {}), [id]: info })
  },
  [ARTICLE.GET_ABOUT_ARTICLE](_state, { unique_id, article }) {
    Vue.set(_state.aboutArticles, unique_id, article)
  },
}

const actions = {
  getArticleClass({ commit }, type) {
    return Home.getArticleClass(type).then((res) => {
      commit(ARTICLE.UPDATE_CLASSES,
        { type, info: res.reduce((pre, item) => ({ ...pre, [item.id]: item }), {}) })
      return res
    })
  },
  getArticles({ commit }, { type, class_id, offset, limit }) {
    return Home.getArticles({ type, class_id, offset, limit })
      .then((res) => {
        commit(ARTICLE.GET_ARTICLES, { type, classId: class_id, array: res.records })
        return res
      })
  },
  getArticle({ commit }, { id, type }) {
    return Home.getArticle({ id, type })
      .then((res) => {
        commit(ARTICLE.GET_ARTICLE, { type, id, info: res })
      })
  },
  getAboutArticle(context, unique_id) {
    return context.state[unique_id] ? Promise.resolve(context.state[unique_id])
      : Home.getAboutArticle(unique_id).then((article) => {
        context.commit(ARTICLE.GET_ABOUT_ARTICLE, { unique_id, article })
        return article
      })
  },
}

export const article = {
  namespaced: true, // 增加命名空间，外部使用时需要指明命名空间（如果没有外部冲突，可以去掉）
  state,
  getters,
  mutations,
  actions,
}
