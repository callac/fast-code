import { currentTheme } from '$router/ThemeComponents'
import { AuthToken } from 'data/api/auth-token'
import { LangStore } from 'extensions/i18n'
import { KlineSocket, Socket } from 'extensions/socket'
import BaseRoot from 'pages/client/BaseRoot'
import Frame from '../../page-zt/client/Frame'
import MobileFrame from 'pages/mobile/MobileFrame'
import NotFound from 'pages/NotFound'
import Vue from 'vue'
import Router from 'vue-router'

const { Home, OurVision } = currentTheme
// const Exchange = () => import('pages/client/Exchange' /* webpackChunkName:"Exchange" */)
const Exchange = () => import('pages/client/Exchange-t3' /* webpackChunkName:"Exchange-t3" */)
const ExchangeCash = () => import('../../page-zt/client/ExchangeCash/ExchangeCash' /* webpackChunkName:"ExchangeCash" */)
const SignIn = () => import('../../page-zt/client/SignIn/SignIn' /* webpackChunkName:"SignIn" */)
const SignUp = () => import('../../page-zt/client/SignUp/SignUp' /* webpackChunkName:"SignUp" */)
const PasswordReset = () => import('../../page-zt/client/PasswordResetCopy/PasswordResetCopy' /* webpackChunkName:"PasswordReset" */)
const RepairOrder = () => import('pages/client/RepairOrder' /* webpackChunkName:"RepairOrder" */)

const AboutUs = () => import('../../page-zt/client/article/AboutUs' /* webpackChunkName:"AboutUs" */)
const UserAgreement = () => import('../../page-zt/client/article/UserAgreement' /* webpackChunkName:"UserAgreement" */)
const PrivacyPolicy = () => import('../../page-zt/client/article/PrivacyPolicy' /* webpackChunkName:"PrivacyPolicy" */)
const HelpList = () => import('../../page-zt/client/article/HelpList' /* webpackChunkName:"HelpList" */)
const HelpDetail = () => import('../../page-zt/client/article/HelpDetail' /* webpackChunkName:"HelpDetail" */)
const HelpDetailArticle = () => import('../../page-zt/client/article/HelpDetailArticle' /* webpackChunkName:"HelpDetailArticle" */)
const Help = () => import('../../page-zt/client/article/Help' /* webpackChunkName:"Help" */)
const ArticleList = () => import('../../page-zt/client/article/ArticleList' /* webpackChunkName:"ArticleList" */)
const Article = () => import('../../page-zt/client/article/Article' /* webpackChunkName:"Article" */)
const News = () => import('../../page-zt/client/article/News' /* webpackChunkName:"News" */)
const NewsDetail = () => import('../../page-zt/client/article/NewsDetail' /* webpackChunkName:"NewsDetail" */)

const Whitepaper = () => import('pages/client/Whitepaper' /* webpackChunkName:"Whitepaper" */)

const UserCenter = () => import('../../page-zt/client/user-center/UserCenter' /* webpackChunkName:"UserCenter" */)
const Security = () => import('../../page-zt/client/user-center/Security' /* webpackChunkName:"Security" */)
const BindPhone = () => import('../../page-zt/client/user-center/BindPhone' /* webpackChunkName:"BindPhone" */)
const EditPhone = () => import('../../page-zt/client/user-center/EditPhone' /* webpackChunkName:"EditPhone" */)
const BindEmail = () => import('../../page-zt/client/user-center/BindEmail' /* webpackChunkName:"BindEmail" */)
const ResetPassword = () => import('../../page-zt/client/user-center/ResetPassword' /* webpackChunkName:"ResetPassword" */)
const SetFundPassword = () => import('../../page-zt/client/user-center/SetFundPassword' /* webpackChunkName:"SetFundPassword" */)
const BindGoogleVerify = () => import('../../page-zt/client/user-center/BindGoogleVerify' /* webpackChunkName:"BindGoogleVerify" */)
const EditGoogleVerify = () => import('../../page-zt/client/user-center/EditGoogleVerify' /* webpackChunkName:"EditGoogleVerify" */)
const CashPaySet = () => import('../../page-zt/client/user-center/CashPaySet' /* webpackChunkName:"CashPaySet" */)
const AssetsManage = () => import('../../page-zt/client/user-center/AssetsManage' /* webpackChunkName:"AssetsManage" */)
const Deposit = () => import('../../page-zt/client/user-center/Deposit' /* webpackChunkName:"Deposit" */)
const Withdraw = () => import('../../page-zt/client/user-center/Withdraw' /* webpackChunkName:"Withdraw" */)
const ExchangeManage = () => import('../../page-zt/client/user-center/ExchangeManage' /* webpackChunkName:"ExchangeManage" */)
const ExchangeCashManage = () => import('../../page-zt/client/user-center/ExchangeCashManage' /* webpackChunkName:"ExchangeCashManage" */)
const MessageCenter = () => import('../../page-zt/client/user-center/MessageCenter' /* webpackChunkName:"MessageCenter" */)
const Message = () => import('../../page-zt/client/user-center/Message' /* webpackChunkName:"Message" */)
const Certification = () => import('../../page-zt/client/user-center/Certification' /* webpackChunkName:"Certification" */)
const UserInvite = () => import('../../page-zt/client/user-center/UserInvite' /* webpackChunkName:"UserInvite" */)
const APIManagement = () => import('../../page-zt/client/user-center/APIManagement' /* webpackChunkName:"APIManagement" */)

const FeedbackList = () => import('pages/client/feedback/FeedbackList' /* webpackChunkName:"FeedbackList" */)
const Feedback = () => import('pages/client/feedback/Feedback' /* webpackChunkName:"Feedback" */)

const AssetsList = () => import('pages/client/assets/AssetsList' /* webpackChunkName:"AssetsList" */)
const AssetInfo = () => import('pages/client/assets/AssetInfo' /* webpackChunkName:"AssetInfo" */)

const Otc = () => import('pages/client/otc/Otc' /* webpackChunkName:"Otc" */)
const OtcOrderDetail = () => import('pages/client/otc/OtcOrderDetail' /* webpackChunkName:"OtcOrderDetail" */)

const MobileSignIn = () => import('../../page-zt/mobile/MobileSignIn' /* webpackChunkName:"MobileSignIn" */)
const MobileSignUp = () => import('../../page-zt/mobile/MobileSignUp' /* webpackChunkName:"MobileSignUp" */)
const MobileForgetPassword = () => import('../../page-zt/mobile/ForgetPassword' /* webpackChunkName:"ForgetPassword" */)
const MobileActivity = () => import('../../page-zt/mobile/MobileActivity' /* webpackChunkName:"MobileActivity" */)
const MobileHome = () => import('../../page-zt/mobile/Home' /* webpackChunkName:"Home" */)
const MobileDownAndroid = () => import('../../page-zt/mobile/DownAndroid' /* webpackChunkName:"DownAndroid" */)
const MobileDownIos = () => import('../../page-zt/mobile/DownIos' /* webpackChunkName:"DownIos" */)

Vue.use(Router)

const routes = [
  {
    path: '/',
    component: Frame,
    children: [
      { path: '', name: 'Home', component: Home },
      { path: '/whitepaper', component: Whitepaper },
      { path: 'exchange', name: 'Exchange', component: Exchange },
      { path: 'exchange/cash', component: ExchangeCash },
      { path: 'sign-in', name: 'SignIn', component: SignIn },
      { path: 'sign-up', component: SignUp },
      { path: 'password/reset', component: PasswordReset },
      { path: 'repair-order', component: RepairOrder },
      ...(OurVision && [{ path: 'our-vision', component: OurVision }]),
      { path: 'about-us', component: AboutUs },
      { path: 'user-agreement', component: UserAgreement },
      { path: 'privacy-policy', component: PrivacyPolicy },
      { path: 'help', component: HelpList },
      { path: 'helpDetail', component: HelpDetail },
      { path: 'helpDetailArticle/:id', component: HelpDetailArticle },
      { path: 'help/:id', component: Help },
      // { path: 'article:type', component: ArticleList },
      { path: 'article:type/:id', component: Article },
      { path: 'announce', component: ArticleList },
      { path: 'announce/:id', component: Article },
      { path: 'new', component: News },
      { path: 'newDetail/:id', component: NewsDetail },
      {
        path: 'user-center',
        meta: { requireAuth: true },
        component: UserCenter,
        children: [
          { path: 'security', component: Security },
          { path: 'security/bind-phone', component: BindPhone },
          { path: 'security/edit-phone', component: EditPhone },
          { path: 'security/bind-email', component: BindEmail },
          { path: 'security/reset-password', component: ResetPassword },
          { path: 'security/set-password-fund', component: SetFundPassword },
          { path: 'security/bind-verify-google', component: BindGoogleVerify },
          { path: 'security/edit-verify-google', component: EditGoogleVerify },
          { path: 'security/certification', component: Certification },
          { path: 'security/pay-set', component: CashPaySet },
          { path: 'assets-manage', name: 'AssetsManage', component: AssetsManage },
          { path: 'assets-manage/deposit', component: Deposit },
          { path: 'assets-manage/withdraw', component: Withdraw },
          { path: 'exchange', name: 'ExchangeManage', component: ExchangeManage },
          { path: 'cash-exchange', component: ExchangeCashManage },
          { path: 'message', component: MessageCenter },
          { path: 'message/:id', component: Message },
          { path: 'invite', component: UserInvite },
          { path: 'api/management', component: APIManagement },
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
      { path: '/', redirect: 'sign-up' },
      { path: 'sign-up', component: MobileSignUp },
      { path: 'sign-in', component: MobileSignIn },
      { path: 'sign-in/forget-password', component: MobileForgetPassword },
      { path: 'activity', component: MobileActivity },
      { path: 'home', component: MobileHome },
      { path: 'down-android', component: MobileDownAndroid },
      { path: 'down-ios', component: MobileDownIos },
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
    const pro = LangStore.setLang(to.query.lang || i18n.locale, { $i18n: i18n })
    const token = AuthToken.getToken()
    if (to.matched.some(route => route.meta.requireAuth)
      && (!store.state.user.info.id || !token)) {
      store.dispatch('user/getUserInfo').then(() => {
        pro.then(() => next())
      }).catch(() => {
        pro.then(() => next({
          name: window.isMobile ? 'MobileSignIn' : 'SignIn',
          query: { redirectTo: to.fullPath },
        }))
        Vue.prototype.snackBar.error('请先登录！')
      })
    } else {
      pro.then(() => next())
    }
  })

  router.afterEach((to) => {
    window.scrollTo(0, 0)

    // websocket 实例管理
    const needKlineSocket = ['Exchange']
    const needOtherSocket = ['Home', 'Exchange', 'AssetsManage', 'ExchangeManage']
    if (!needOtherSocket.includes(to.name)) {
      Socket.disconnect()
    }
    if (!needKlineSocket.includes(to.name)) {
      KlineSocket.disconnect()
    }
  })

  return router
}
