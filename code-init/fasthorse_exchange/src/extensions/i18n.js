/**
 * 语言国际化
 * */
/* eslint-disable no-param-reassign */
import { Cookie } from '@livelybone/storage'
import { langKeys, LangMap, Langs } from 'assets/lang/LangMap'
import Vue from 'vue'
import VueI18n from 'vue-i18n'

function setI18nLanguage(i18n, lang) {
  i18n.locale = lang
  document.querySelector('html').setAttribute('lang', lang)
  return lang
}

// 获取客户端默认的语言
function getBrowserLang() {
  if (typeof window === 'undefined') return 'zh-hans'
  const language = window.INIT_STATE
    && window.INIT_STATE.siteInfo
    && window.INIT_STATE.siteInfo.language
  const lang = language && langKeys.find(l => l.toLowerCase() === language.toLowerCase())
  if (lang) return lang
  return (navigator.language || navigator.userLanguage).toLowerCase() === 'zh-cn' ? 'zh-hans' : 'en'
}

export const browserLang = getBrowserLang()
// 已加载过语言包的语言
const loadedLanguages = []

// 异步加载语言包
export function loadLanguageAsync(i18n, lang) {
  let language = lang
  if (!LangMap[lang]) {
    console.error(`The language '${lang}' has not been included in LangMap.js`)
    language = browserLang || langKeys[0]
  }
  if (!loadedLanguages.includes(language)) {
    return LangMap[language].module().then((msgs) => {
      i18n.setLocaleMessage(language, msgs.default)
      loadedLanguages.push(language)
      return setI18nLanguage(i18n, language)
    })
  }
  if (i18n.locale === language) return Promise.resolve(language)
  return Promise.resolve(setI18nLanguage(i18n, language))
}

export class LangStore {
  static getLang() {
    return this.localStorage.get(this.key)
  }

  static setLang(val, vm = null) {
    return vm ? loadLanguageAsync(vm.$i18n, val).then((lang) => {
      this.localStorage.set(this.key, lang)
    }) : Promise.reject(new Error('Param vm is null'))
  }

  static setLangAndRefresh(val) {
    if (LangMap[val]) {
      this.localStorage.set(this.key, val)
      window.location.reload()
    } else {
      console.warn(`The lang \`${val}\` you set is not exist !`)
    }
  }
}

LangStore.localStorage = Cookie

LangStore.key = 'LANG'

export function initialI18n(lang) {
  Vue.use(VueI18n)
  Vue.prototype.$lang = LangStore
  Vue.prototype.$langOptions = Langs

  const locale = lang || LangStore.getLang() || browserLang

  return new VueI18n({
    locale,
    messages: {},
    silentFallbackWarn: true,
  })
}
