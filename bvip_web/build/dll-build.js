require('./check-versions')()

process.env.NODE_ENV = 'production'

const rm = require('rimraf')
const chalk = require('chalk')
const dllWebpackConfig = require('./webpack.dll.conf')
const path = require('path')

const buildUtil = require('./build-util')

rm(path.resolve(__dirname, '../static/dll'), err => {
  if (err) throw err

  buildUtil.spinner.start('Dll: start building ...')
  let pro = buildUtil.chunkDeal('Dll', dllWebpackConfig)

  pro.then(() => {
    buildUtil.printCompiledArr()
    console.log(chalk.yellow(
      '  Tip: Now, you can use the dll file via DllReferencePlugin\n',
    ))
  }).catch((err) => {
    buildUtil.printCompiledArr()
    if (err) console.log(chalk.red(`${err.type || err.name || 'Error'}: ${err.message}`))
    process.exit(1)
  })
})
