import { currentTheme } from '$router/ThemeComponents'
import Frame from '@/pages-sipc/client/Frame'
import { AuthToken } from 'data/api/auth-token'
import { LangStore } from 'extensions/i18n'
import { KlineSocket, Socket } from 'extensions/socket'
import BaseRoot from 'pages/client/BaseRoot'
import MobileFrame from 'pages/mobile/MobileFrame'
import NotFound from 'pages/NotFound'
import Vue from 'vue'
import Router from 'vue-router'

const { Home } = currentTheme
const Exchange = () => import('@/pages-sipc/client/Exchange/Exchange' /* webpackChunkName:"Exchange" */)
const ExchangeCash = () => import('pages/client/ExchangeCash/ExchangeCash' /* webpackChunkName:"ExchangeCash" */)
const SignIn = () => import('@/pages-sipc/client/SignIn/SignIn' /* webpackChunkName:"SignIn" */)
const SignUp = () => import('@/pages-sipc/client/SignUp/SignUp' /* webpackChunkName:"SignUp" */)
const PasswordReset = () => import('@/pages-sipc/client/PasswordReset/PasswordReset' /* webpackChunkName:"PasswordReset" */)
const RepairOrder = () => import('@/pages-sipc/client/RepairOrder/RepairOrder' /* webpackChunkName:"RepairOrder" */)

const AboutUs = () => import('pages/client/article/AboutUs' /* webpackChunkName:"AboutUs" */)
const UserAgreement = () => import('pages/client/article/UserAgreement' /* webpackChunkName:"UserAgreement" */)
const PrivacyPolicy = () => import('pages/client/article/PrivacyPolicy' /* webpackChunkName:"PrivacyPolicy" */)
const HelpList = () => import('pages/client/article/HelpList' /* webpackChunkName:"HelpList" */)
const Help = () => import('pages/client/article/Help' /* webpackChunkName:"Help" */)
const ArticleList = () => import('pages/client/article/ArticleList' /* webpackChunkName:"ArticleList" */)
const Article = () => import('pages/client/article/Article' /* webpackChunkName:"Article" */)

const AssetsManage = () => import('@/pages-sipc/client/UserCenter/AssetsManage/AssetsManage' /* webpackChunkName:"AssetsManage" */)
const Deposit = () => import('@/pages-sipc/client/UserCenter/Deposit/Deposit' /* webpackChunkName:"Deposit" */)
const Withdraw = () => import('@/pages-sipc/client/UserCenter/Withdraw/Withdraw' /* webpackChunkName:"Withdraw" */)
const Security = () => import('@/pages-sipc/client/UserCenter/Security/Security' /* webpackChunkName:"Security" */)
const CashPaySet = () => import('@/pages-sipc/client/UserCenter/CashPaySet/CashPaySet' /* webpackChunkName:"CashPaySet" */)
const Certification = () => import('@/pages-sipc/client/UserCenter/Certification/Certification' /* webpackChunkName:"Certification" */)
const UserInvite = () => import('pages/client/user-center/UserInvite' /* webpackChunkName:"UserInvite" */)

const FeedbackList = () => import('pages/client/feedback/FeedbackList' /* webpackChunkName:"FeedbackList" */)
const Feedback = () => import('pages/client/feedback/Feedback' /* webpackChunkName:"Feedback" */)

const AssetsList = () => import('pages/client/assets/AssetsList' /* webpackChunkName:"AssetsList" */)
const AssetInfo = () => import('pages/client/assets/AssetInfo' /* webpackChunkName:"AssetInfo" */)

const Otc = () => import('pages/client/otc/Otc' /* webpackChunkName:"Otc" */)
const OtcOrderDetail = () => import('pages/client/otc/OtcOrderDetail' /* webpackChunkName:"OtcOrderDetail" */)

const MobileSignIn = () => import('pages/mobile/MobileSignIn' /* webpackChunkName:"MobileSignIn" */)
const MobileSignUp = () => import('pages/mobile/MobileSignUp' /* webpackChunkName:"MobileSignUp" */)
const MobileActivity = () => import('pages/mobile/MobileActivity' /* webpackChunkName:"MobileActivity" */)

Vue.use(Router)

const routes = [
  {
    path: '/',
    component: Frame,
    children: [
      { path: '', name: 'Home', component: Home },
      { path: 'exchange', name: 'Exchange', component: Exchange },
      { path: 'exchange/cash', component: ExchangeCash },
      { path: 'sign-in', name: 'SignIn', component: SignIn },
      { path: 'sign-up', component: SignUp },
      { path: 'password/reset', component: PasswordReset },
      { path: 'repair-order', component: RepairOrder },
      {
        path: 'article',
        component: BaseRoot,
        children: [
          { path: 'about-us', component: AboutUs },
          { path: 'user-agreement', component: UserAgreement },
          { path: 'privacy-policy', component: PrivacyPolicy },
          { path: 'help', component: HelpList },
          { path: 'help/:id', component: Help },
          { path: ':type', component: ArticleList },
          { path: ':type/:id', component: Article },
        ],
      },
      {
        path: 'user-center',
        meta: { requireAuth: true },
        component: BaseRoot,
        children: [
          { path: 'security', name: 'Security', component: Security },
          { path: 'security/certification', component: Certification },
          { path: 'security/pay-set', component: CashPaySet },
          { path: 'assets-manage', name: 'AssetsManage', component: AssetsManage },
          { path: 'assets-manage/deposit', component: Deposit },
          { path: 'assets-manage/withdraw', component: Withdraw },
          { path: 'invite', component: UserInvite },
        ],
      },
      {
        path: 'feedback',
        meta: { requireAuth: true },
        component: BaseRoot,
        redirect: 'feedback/list',
        children: [
          { path: 'list', component: FeedbackList },
          { path: 'new', component: Feedback },
          { path: ':id', component: Feedback },
        ],
      },
      {
        path: 'asset',
        component: BaseRoot,
        redirect: 'asset/list',
        children: [
          { path: 'list', component: AssetsList },
          { path: ':assetCode', component: AssetInfo },
        ],
      },
      {
        path: 'otc',
        component: BaseRoot,
        redirect: 'otc/list',
        children: [
          { path: 'list', component: Otc },
          { path: ':id', component: OtcOrderDetail },
        ],
      },
    ],
  },
  {
    path: '/mobile',
    component: MobileFrame,
    children: [
      { path: '', component: MobileSignUp },
      { path: 'sign-in', component: MobileSignIn },
      { path: 'activity', component: MobileActivity },
    ],
  },
  { path: '*', component: NotFound },
]

export function createRouter(i18n, store) {
  const router = new Router({
    mode: 'history',
    routes,
  })

  router.beforeEach((to, fr, next) => {
    // 先异步获取语言包并设置客户端语言
    const pro = LangStore.setLang(to.query.lang || i18n.locale, { $i18n: i18n })

    const token = AuthToken.getToken()

    // 判断是否需要重定向
    const redirectToSignIn = () => {
      if (
        to.matched.some(route => route.meta.requireAuth)
        && !store.state.user.info.id
      ) {
        pro.then(() => next({
          name: window.isMobile ? 'MobileSignIn' : 'SignIn',
          query: { redirectTo: to.fullPath },
        }))
        Vue.prototype.snackBar.error('请先登录！')
      } else {
        pro.then(() => next())
      }
    }

    // 根据路由信息以及登录信息，判断在何时获取或者更新用户信息
    (
      token && !store.state.user.info.id
        ? store.dispatch('user/getUserInfo')
        : Promise.resolve()
          .then(() => {
            // 更新用户信息
            if (token) store.dispatch('user/getUserInfo')
          })
    )
      .finally(redirectToSignIn)
  })

  router.afterEach((to) => {
    // 每次路由变化，页面都重新回到顶部
    window.scrollTo(0, 0)

    // websocket 实例管理
    const needKlineSocket = ['Exchange']
    const needSocket = ['Home', 'Exchange', 'AssetsManage', 'ExchangeManage']
    if (!needSocket.includes(to.name)) {
      Socket.disconnect()
    }
    if (!needKlineSocket.includes(to.name)) {
      KlineSocket.disconnect()
    }
  })

  return router
}
