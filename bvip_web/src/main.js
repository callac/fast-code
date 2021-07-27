import 'babel-polyfill'
import { initialExtensions } from '@/extensions/extensions'
import store from 'data/store'
import Vue from 'vue'
import App from './App'
// eslint-disable-next-line import/no-unresolved,import/extensions
import register from './global-register-<<mask>>'
// 根据 mask 使用不同的路由配置
// eslint-disable-next-line import/no-unresolved,import/extensions
import { createRouter } from './router/router-<<mask>>'

Vue.config.productionTip = false

// 注册 Http, Cache, bus, 资产折合等服务
const { i18n } = initialExtensions()

// 注册全局函数，属性，组件，错误处理函数
register()

// 创建路由
/* eslint-disable no-new */
const router = createRouter(i18n, store)

// 创建 Vue 根实例，注入 router，store，i18n
const root = new Vue({
  router,
  store,
  i18n,
  render: h => h(App),
})

// window.onload = () => {
//   // prod: webpack HtmlWebpackPlugin 配置 {inject: 'head',chunksSortMode: 'dependency'}，
//   // 使得js代码被插入到了 head 标签，先于 body DOM 生成之前运行，因此使用 DOMContentLoaded 事件处理
//   if (typeof window !== 'undefined') {
//     store.replaceState({ ...store.state, ...window.INIT_STATE })
//   }
//   root.$mount('#app')
// }
document.addEventListener('DOMContentLoaded', () => {
  // prod: webpack HtmlWebpackPlugin 配置 {inject: 'head',chunksSortMode: 'dependency'}，
  // 使得js代码被插入到了 head 标签，先于 body DOM 生成之前运行，因此使用 DOMContentLoaded 事件处理
  if (typeof window !== 'undefined') {
    store.replaceState({ ...store.state, ...window.INIT_STATE })
  }
  root.$mount('#app')
})
