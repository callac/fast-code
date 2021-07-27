/* eslint-disable no-undef,import/extensions,import/no-unresolved */
import RemInit from '@livelybone/rem-init'
import en_home from 'assets/lang/en/home-<<template>>'
import ja_home from 'assets/lang/ja/home-<<template>>'
import zh_HANS_home from 'assets/lang/zh-hans/home-<<template>>'
import zh_HANT_home from 'assets/lang/zh-hant/home-<<template>>'
import 'babel-polyfill'
import themes from 'config/themes.json'
// 在这个文件中加载网站的 css 资源
import '../../css/app-<<mask>>.scss'

// 设置页面的 viewport
RemInit({
  pageNoScale: /noScale/i.test(window.location.href),
  pageScalable: true,
  pageScaleMaxFactor: true,
  pageScaleMiddleware: (fontScale, isMobile) => {
    if (isMobile) {
      if (window.location.pathname.indexOf('/mobile') === 0) return 1 / fontScale
      return 1 / fontScale / fontScale / (1200 / fontScale / window.screen.availWidth)
    }
    return 1
  },
})

// 当前组合的特定组件或资源文件
export const currentTheme = {
  ClientHeader: () => import('components/client/ClientHeader-<<template>>' /* webpackChunkName:"ClientHeader" */),
  Home: () => import('pages/client/Home-<<template>>' /* webpackChunkName:"Home" */),
  OurVision: () => import('pages/client/OurVision' /* webpackChunkName:"OurVision" */),
  defaultBanner: require('assets/logo-fac-banner/banner-<<template>>-<<theme>>.jpg'),
  defaultLogo: require('assets/logo-fac-banner/logo-<<template>>-<<theme>>.png'),
}

// 当前组合的首页的语言包
export const home = {
  'zh-hans': zh_HANS_home,
  'zh-hant': zh_HANT_home,
  'en': en_home,
  'ja': ja_home,
}

// 当前组合的 K 线的主题，用于旧版 K 线（jquery 版的）
export const KlineTheme = themes.find(t => t.name === Theme).klineTheme
