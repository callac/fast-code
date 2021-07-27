const fsExtra = require('fs')
const path = require('path')

function getEntries(directory = './src/css/pages', reg = /\.scss$/, suffix = 'scss', activityName = '') {
  const entries = []
  fsExtra.readdirSync(path.resolve(__dirname, directory))
    .forEach((filename) => {
      if (filename !== 'component-css') {
        const name = filename.replace(reg, '')
        const activityN = activityName || name
        if (reg.test(filename)
          && !(fsExtra.statSync(path.resolve(__dirname, directory, filename)).isDirectory())) {
          entries.push({
            name,
            activityName: activityN,
            filename: path.resolve(__dirname, directory, filename), // source filename
            distName: `${directory.replace('../src/', '')}/${name}.${suffix}`, // ends of dest filename
          })
        } else {
          entries.push(...getEntries(`${directory}/${filename}`, reg, suffix, activityN))
        }
      }
    })

  return entries
}

console.log(getEntries('./src/css/components').map(ent => ent.distName))
