import Feedback from 'data/api/feedback'
import { FEEDBACK } from 'data/store/mutations-types'
import Vue from 'vue'

const state = () => ({
  list: [],
  details: {},
})

const getters = {}

const mutations = {
  [FEEDBACK.GET_LIST](_state, list) {
    Vue.set(_state, 'list', list)
  },
  [FEEDBACK.GET_DETAILS](_state, info) {
    Vue.set(_state.details, info.id, info)
  },
}

const actions = {
  getList({ commit }, { limit, offset, keyword }) {
    return Feedback.getList({ limit, offset, keyword })
      .then((res) => {
        commit(FEEDBACK.GET_LIST, res.records)
        return res
      })
  },
  getDetails({ commit }, id) {
    return Feedback.getDetail(id)
      .then((res) => {
        commit(FEEDBACK.GET_DETAILS, res)
        return res
      })
  },
  create(context, info) {
    return Feedback.create(info)
  },
  reply(context, info) {
    return Feedback.reply(info)
  },
}

export const feedback = {
  namespaced: true,
  state: state(),
  getters,
  mutations,
  actions,
}
