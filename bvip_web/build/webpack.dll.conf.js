'use strict'
const webpack = require('webpack')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const config = require('../config')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const utils = require('./utils')

const dlls = {
  VueReference: [
    'babel-polyfill',
    'vue',
    'vuex',
    'vue-router',
    'vue-i18n',
    'axios',
  ],
  UIAndUtils: [
    '@livelybone/copy',
    '@livelybone/rem-init',
    '@livelybone/scroll-get',
    '@livelybone/simple-observer',
    '@livelybone/storage',
    '@livelybone/vue-button',
    '@livelybone/vue-datepicker',
    '@livelybone/vue-input',
    '@livelybone/vue-loading',
    '@livelybone/vue-pagination',
    '@livelybone/vue-popper',
    '@livelybone/vue-select',
    '@livelybone/vue-table',
    'vue-img-tag',
    'vue-scrollbar-live',
    'vue-slide-for-more',
    'vuejs-snackbar',
    'big.js',
    'qrcode',
  ],
}

module.exports = {
  entry: dlls,
  output: {
    path: utils.pathResolve('static'),
    filename: `dll/[name]-[chunkhash].dll.js`,
    publicPath: '<%= htmlWebpackPlugin.options.assetsPublicPath %>/<%= htmlWebpackPlugin.options.assetsSubDirectory %>',
    library: '[name]',
  },
  plugins: [
    new UglifyJsPlugin({
      uglifyOptions: {
        compress: {
          warnings: false,
        },
      },
      sourceMap: config.build.productionSourceMap,
      parallel: true,
      cache: true,
    }),
    new HtmlWebpackPlugin({
      filename: utils.pathResolve('/static/index.html'),
      template: 'index-pro.html',
      inject: 'head',
      minify: {
        removeComments: true,
        collapseWhitespace: false,
        collapseInlineTagWhitespace: false,
        removeAttributeQuotes: true,
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'dependency',
    }),
    new webpack.DllPlugin({
      path: utils.pathResolve('/static/dll/[name]-manifest.json'),
      name: '[name]',
      context: utils.pathResolve('/'),
    })
  ]
}
