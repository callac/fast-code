const LangMap = {
  'en': {
    name: 'English',
    module: () => import('assets/lang/en/index' /* webpackChunkName: "Lang-en" */),
  },
  'zh-hans': {
    name: '简体中文',
    module: () => import('assets/lang/zh-hans/index' /* webpackChunkName: "Lang-zh-hans" */),
  },
  'zh-hant': {
    name: '繁體中文',
    module: () => import('assets/lang/zh-hant/index' /* webpackChunkName: "Lang-zh-hant" */),
  },
  'ja': {
    name: '日本語',
    module: () => import('assets/lang/ja/index' /* webpackChunkName: "Lang-ja" */),
  },
}

const langKeys = Object.freeze(Object.keys(LangMap))

const Langs = Object.freeze(langKeys
  .map(key => ({ name: LangMap[key].name, value: key })))

export { LangMap, langKeys, Langs }
