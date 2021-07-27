'use strict'
'use strict'
require('./check-versions')()

process.env.NODE_ENV = 'production'

const rm = require('rimraf')
const chalk = require('chalk')
const config = require('../config')
const webpackConfig = require('./webpack.prod.conf')
const cssTemplatesConfig = require('./webpack.prod.css_and_templates.conf')
const { products } = require('./replace-str')

const buildUtil = require('./build-util')

rm(config.build.assetsRoot, err => {
  if (err) throw err

  let { templates, themes } = process.env
  templates = templates && templates.split(',')
  themes = themes && themes.split(',')

  const productsArr = Object.keys(products)
    .filter(k => (
      (!templates || templates.includes(products[k].template))
      && (!themes || (themes.includes(products[k].theme)))
    ))
    .map(k => ({
      ...products[k],
      key: `ThemeComponents(${products[k].key})`,
      webpackConfig: cssTemplatesConfig,
    }))

  const masks = productsArr.reduce(
    (pre, pro) => {
      const exist = pre.some(pro1 => pro1.mask === pro.mask)
      if (exist) return pre
      return pre.concat({ ...pro, key: `Mask(${pro.mask})`, webpackConfig })
    },
    [],
  )

  buildUtil.spinner.start('Masks: building ...')
  let pro = Promise.all(
    masks.map(item => buildUtil.chunkDeal(item.key, item.webpackConfig(item))),
  )

  pro = pro.then(() => {
    buildUtil.spinner.start('ThemeComponents: building ...')
    return Promise.all(
      productsArr.map(item => buildUtil.chunkDeal(item.key, item.webpackConfig(item))),
    )
  })

  pro.then(() => {
    buildUtil.printCompiledArr()
    console.log(chalk.yellow(
      '  Tip: built files are meant to be served over an HTTP server.\n' +
      '  Opening index.html over file:// won\'t work.\n',
    ))
  }).catch((err) => {
    buildUtil.printCompiledArr()
    if (err) console.log(chalk.red(`${err.type || err.name || 'Error'}: ${err.message}`))
    process.exit(1)
  })
})

