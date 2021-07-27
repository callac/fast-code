'use strict'
const config = require('../config')
const HappyPack = require('happypack')
const utils = require('./utils')
const isProduction = process.env.NODE_ENV === 'production'
const useHappypack = !process.env.NO_HAPPYPACK
const vueLoaderConfig = require('./vue-loader.conf')

const plugins = { css: [], js: [], vueCommon: [] }

const createHappyPack = (() => {
  const threadPool = HappyPack.ThreadPool({ size: 4 })
  return (id, loaders) => ({
    plugin: new HappyPack({
      id,
      threadPool,
      loaders,
      verbose: false,
    }),
    loaders: [`happypack/loader?id=${id}`],
  })
})()

function loadersDeal(id, loaders, replaceLoader) {
  if (isProduction && useHappypack && id !== 'vue') {
    const h = createHappyPack(id, loaders)
    if (id === 'js') {
      plugins[id] = [h.plugin]
    } else if (id === 'vueCommon') {
      plugins[id] = [h.plugin]
    } else {
      plugins.css.push(h.plugin)
    }
    return [...h.loaders, ...(replaceLoader ? [replaceLoader] : [])]
  }
  return [
    ...loaders,
    ...(replaceLoader ? [replaceLoader] : []),
  ]
}

const vueLoader = (id, loaders) => (replaceLoader) => {
  return {
    test: /\.vue$/,
    loader: loadersDeal(id, loaders, replaceLoader),
    include: utils.pathResolve('src'),
  }
}

const jsLoader = (id, loaders) => replaceLoader => ({
  test: /\.js$/,
  loader: loadersDeal(id, loaders, replaceLoader),
  include: [
    utils.pathResolve('src'),
    utils.pathResolve('config'),
    utils.pathResolve('test'),
    utils.pathResolve('node_modules/webpack-dev-server/client'),
  ],
})

const cssLoader = (extension, loaders) => (replaceLoader) => ({
  test: new RegExp('\\.' + extension + '$'),
  loader: utils.extractCss(loadersDeal(extension, loaders, replaceLoader), isProduction),
})

const cssLoaders = utils.cssLoaders(isProduction ? {
  sourceMap: config.build.productionSourceMap,
  usePostCSS: true,
} : {
  sourceMap: config.dev.cssSourceMap,
  usePostCSS: true,
})

const loaders = {
  ...cssLoaders,
  js: ['babel-loader?cacheDirectory=true'],
  vueCommon: [{ loader: 'vue-loader', options: vueLoaderConfig }],
  vue: [{ loader: 'vue-loader', options: vueLoaderConfig }],
}

const rules = Object.keys(loaders).reduce((pre, type) => {
  let loader = loaders[type]
  if (type === 'js') {
    pre[type] = jsLoader(type, loader)
  } else if (type === 'vueCommon') {
    pre[type] = vueLoader(type, loader)
  } else if (type === 'vue') {
    pre[type] = vueLoader(type, loader, false)
  } else {
    pre.css.push(cssLoader(type, loader))
  }
  return pre
}, { css: [] })

exports.rules = rules
exports.plugins = plugins
