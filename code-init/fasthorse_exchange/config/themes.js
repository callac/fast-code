/**
 * 母版, 不同母版不能有相同的模板
 * */
const masks = [
  {
    name: 'default',
    templates: [
      'default',
      'zg',
      't1',
      't2',
      'mj',
      '58',
      'jp',
      'jp1',
      'jp2',
      'gaga',
    ]
  },
  {
    name: 'sipc',
    templates: [
      'sipc'
    ],
  },
  {
    name: 'zt',
    templates: [
      't3',
    ],
  }
]

/**
 * @description 主题配色
 * */
const themes = require('./themes.json')

/**
 * @description 模板/主题配色 数组
 * */
const templates = [
  {
    name: 'default',
    themes: [
      'default',
      'zg',
      'white_green',
      'white_blue',
      'white_gray',
      'black_blue',
    ].filter(theme => themes.some(t => t.name === theme)),
  },
  {
    name: 'zg',
    themes: [
      'zg',
    ].filter(theme => themes.some(t => t.name === theme)),
  },
  {
    name: 't1',
    themes: [
      'gray_dark',
    ].filter(theme => themes.some(t => t.name === theme)),
  },
  {
    name: 't2',
    themes: [
      'blue',
    ].filter(theme => themes.some(t => t.name === theme)),
  },
  {
    name: 't3',
    themes: [
      'self_help',
    ].filter(theme => themes.some(t => t.name === theme)),
  },
  {
    name: 'mj',
    themes: [
      'dark_mj',
    ].filter(theme => themes.some(t => t.name === theme)),
  },
  {
    name: 'jp',
    themes: [
      'jp',
    ].filter(theme => themes.some(t => t.name === theme)),
  },
  {
    name: 'jp1',
    themes: [
      'jp_white',
      'sipc',
    ].filter(theme => themes.some(t => t.name === theme)),
  },
  {
    name: 'jp2',
    themes: [
      'jp2',
    ].filter(theme => themes.some(t => t.name === theme)),
  },
  {
    name: '58',
    themes: [
      'yellow',
    ].filter(theme => themes.some(t => t.name === theme)),
  },
  {
    name: 'gaga',
    themes: [
      'gaga_white',
    ].filter(theme => themes.some(t => t.name === theme)),
  },
  {
    name: 'sipc',
    themes:[
      'sipc_1',
    ].filter(theme => themes.some(t => t.name === theme)),
  },
]

/**
 * @description 检查模板是否有重复，并生成 母版/模板 数组
 * */
function checkMasks() {
  const templateArr = []
  masks.forEach((mask) => {
    const sameT = templateArr.find(t => mask.templates.some(t1 => t1 === t.template))
    if (sameT) throw new Error(`不同的母版（mask: [${sameT.mask}, ${mask.name}]）有名字一样的模板（template: ${sameT.template}），请修改其中一个模板的名字`)
    templateArr.push(...mask.templates.map(t => ({ mask: mask.name, template: t })))
  })
  return templateArr
}

const templateArr = checkMasks()

/**
 * @description 生成 母版/模板/主题配色 数组
 * */
const products = templates.reduce((pre, template) => {
  const { name, themes } = template
  themes.reduce((pre1, theme) => {
    const str = `${name}-${theme}`
    const mask = templateArr.find(t => t.template === name).mask
    pre1[str] = {
      key: `${mask}-${str}`,
      template: name,
      mask,
      theme,
      html: `index-${str}.html`
    }
    return pre1
  }, pre)
  return pre
}, {})

module.exports = {
  themes,
  templates,
  products,
}
