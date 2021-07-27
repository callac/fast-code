const utils = require('./utils')
const config = require('../config')
const webpack = require('webpack')
const StrReplace = require('string-replace-webpack-plugin')
const happypackConf = require('./happypack.conf')

const StrReplacePlugin = new StrReplace()

module.exports = (themeMask = 'default', templateKey = 'default', themeKey = 'default', productLoader = '') => {
  return {
    context: utils.pathResolve(''),
    output: {
      path: config.build.assetsRoot,
      filename: '[name].js',
      publicPath: process.env.NODE_ENV === 'production'
        ? config.build.assetsPublicPath
        : config.dev.assetsPublicPath,
      chunkFilename: '[name].chunk.js',
    },
    resolve: {
      extensions: ['.js', '.vue', '.json'],
      alias: {
        components: utils.pathResolve('src/components'),
        pages: utils.pathResolve('src/pages'),
        pageZt: utils.pathResolve('src/page-zt'),
        utils: utils.pathResolve('src/utils'),
        assets: utils.pathResolve('src/assets'),
        $router: utils.pathResolve(`src/router/router-${themeMask}`),
        data: utils.pathResolve('src/data'),
        config: utils.pathResolve('config'),
        extensions: utils.pathResolve('src/extensions'),
        '@': utils.pathResolve('src'),
      },
    },
    module: {
      rules: [
        happypackConf.rules.js(productLoader),
        {
          test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
          loader: 'url-loader',
          include: /assets/,
          options: {
            limit: 10000,
            name: utils.assetsPath('img/[name].[hash:7].[ext]'),
          },
        },
        {
          test: /\.pdf$/,
          include: /assets/,
          use: {
            loader: 'file-loader',
            options: {
              name: 'doc/[name].[ext]'
            }
          }
        },
        {
          test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
          loader: 'url-loader',
          include: /assets/,
          options: {
            limit: 10000,
            name: utils.assetsPath('media/[name].[hash:7].[ext]'),
          },
        },
        {
          test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
          loader: 'url-loader',
          include: [utils.pathResolve('src/css')],
          options: {
            limit: 10000,
            name: utils.pathResolve('dist/fonts/[name].[hash:7].[ext]'),
          },
        },
      ],
    },
    node: {
      // prevent webpack from injecting useless setImmediate polyfill because Vue
      // source contains it (although only uses it if it's native).
      setImmediate: false,
      // prevent webpack from injecting mocks to Node native modules
      // that does not make sense for the client
      dgram: 'empty',
      fs: 'empty',
      net: 'empty',
      tls: 'empty',
      child_process: 'empty',
    },
    plugins: [
      new webpack.DefinePlugin({
        Template: JSON.stringify(templateKey),
        Theme: JSON.stringify(themeKey),
        Mask: JSON.stringify(themeMask),
      }),
      StrReplacePlugin,
      ...happypackConf.plugins.js,
    ],
  }
}
