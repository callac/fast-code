import bus from 'extensions/bus'
import CachePlugin from 'extensions/cache'
import { CurrencyPlugin } from 'extensions/CurrencyConversionNew'
import HttpPlugin from 'extensions/http'
import { initialI18n } from 'extensions/i18n'
import Vue from 'vue'

export function initialExtensions() {
  Vue.use(bus)
  Vue.use(HttpPlugin)
  Vue.use(CachePlugin)
  Vue.use(CurrencyPlugin)
  const i18n = initialI18n()

  // @livelybone/rem-init 工具会暴露 window.isMobile
  if (typeof window !== 'undefined') Vue.prototype.isMobile = window.isMobile
  return { i18n }
}
