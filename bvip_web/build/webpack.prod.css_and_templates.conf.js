const webpack = require('webpack')
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const utils = require('./utils')
const config = require('../config')
const baseWebpackConfig = require('./webpack.base.conf')
const env = require('../config/prod.env')
const happypackConf = require('./happypack.conf')

const VueReference = new webpack.DllReferencePlugin({
  context: utils.pathResolve(''),
  manifest: utils.pathResolve('/static/dll/VueReference-manifest.json'),
})
const UIAndUtils = new webpack.DllReferencePlugin({
  context: utils.pathResolve(''),
  manifest: utils.pathResolve('/static/dll/UIAndUtils-manifest.json'),
})

module.exports = (product) => {
  const { mask, template, theme, loader, html } = product
  return merge(baseWebpackConfig(mask, template, theme, loader), {
    entry: {
      ThemeComponents: [`./src/router/router-${mask}/ThemeComponents.js`],
    },
    output: {
      path: config.build.assetsRoot,
      filename: utils.assetsPath('js/[name].[chunkhash].js'),
      chunkFilename: utils.assetsPath('js/[name]-[chunkhash].chunk.js'),
      library: 'ThemeComponents',
      libraryTarget: 'var',
      // globalObject: 'this',
    },
    module: {
      rules: [
        happypackConf.rules.vue(loader),
        ...happypackConf.rules.css.map((rule) => rule(loader)),
      ],
    },
    devtool: config.build.productionSourceMap ? config.build.devtool : false,
    plugins: [
      new webpack.DefinePlugin({
        'process.env': env,
      }),
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
      // extract css into its own file
      new ExtractTextPlugin({
        filename: utils.assetsPath(`css/[name].[contenthash].css`),
        // Setting the following option to `false` will not extract CSS from codesplit chunks.
        // Their CSS will instead be inserted dynamically with style-loader when the codesplit chunk has been loaded by webpack.
        // It's currently set to `true` because we are seeing that sourcemaps are included in the codesplit bundle as well when it's `false`,
        // increasing file size: https://github.com/vuejs-templates/webpack/issues/1110
        allChunks: true,
      }),
      // Compress extracted CSS. We are using this plugin so that possible
      // duplicated CSS from different pages can be deduped.
      new OptimizeCSSPlugin({
        cssProcessorOptions:  config.build.productionSourceMap
          ? { safe: true, map: { inline: false } }
          : { safe: true },
      }),
      // generate dist index.html with correct asset hash for caching.
      // you can customize output by editing /index.html
      // see https://github.com/ampedandwired/html-webpack-plugin
      new HtmlWebpackPlugin({
        filename: config.build.index(html),
        template: config.build.index(`index-${mask}.html`),
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
      ...happypackConf.plugins.css,
      VueReference,
      UIAndUtils,
    ],
  })
}
