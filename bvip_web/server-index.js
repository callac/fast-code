/* eslint-disable semi */
const axios = require('axios')
const Koa = require('koa')
const fs = require('fs')
const parse = require('parse5')
const config = require('./config/config')
const { products } = require('./config/themes')

const { port = 3000, expireTime = 3000 } = process.env
const template = process.env.defaultTemplate || 'default'
const theme = process.env.defaultTheme || template
const productKey = `${template}-${theme}`
const app = new Koa()
const cache = {}

function joinUrl(base, url) {
  return `${base.replace(/\/?$/, '')}/${url.replace(/^\/?/, '')}`
}

function getHtml(filename) {
  return fs.readFileSync(`./dist/${filename}`, { encoding: 'utf8' })
}

const styleTemp = 'style'

function needGet(host) {
  const cacheItem = cache[host]

  // if cache not exist or expired -> do query;
  if (!cacheItem || cacheItem.expire < Date.now()) return { needGet: true }

  // else use cache;
  const { replacedHtml } = cacheItem
  return { needGet: false, replacedHtml }
}

function find(html, tag = 'body') {
  const nodes = []
  if (html.childNodes) {
    html.childNodes.forEach((node) => {
      if (node.nodeName === tag) {
        nodes.push(node)
      }
      if (node.childNodes && node.childNodes.length > 0) {
        nodes.push(...find(node, tag))
      }
    })
  }
  return nodes
}

function render(host) {
  if (host.startsWith('localhost')) {
    return ''
  }
  const query = needGet(host)
  console.log('get', host)
  return query.needGet ? axios.get(`${config.localhost}/site`,
    { headers: { host } }).then((res) => {
    let { result } = res.data
    if (!result || !result[styleTemp]) {
      result = { ...result, template_theme: { template, theme, key: productKey } }
    } else {
      const arr = result[styleTemp].split(',')
      arr[1] = arr[1] || arr[0]
      result = {
        ...result,
        template_theme: { template: arr[0], theme: arr[1], key: arr.join('-') },
      }
    }

    const {
      service_js,
      tongji_js,
      template_theme: { key: productKey1 },
      title = '',
      seo_keywords = '',
      seo_content = '',
    } = result
    delete result.title
    delete result.seo_title
    delete result.seo_keywords
    delete result.seo_content
    result.headTitle = title
    const state = `<script type="text/javascript">window.INIT_STATE=${JSON.stringify({ siteInfo: result })}</script>`
    const titleVal = `<title>${title}</title>`
    const keywords = `<meta name="keywords" content="${seo_keywords}">`
    const content = `<meta name="description" content="${seo_content}">`
    const document = parse.parse(getHtml(products[productKey1].html))
    const head = find(document, 'head')[0]
    const body = find(document, 'body')[0]
    const breakLines = find(document, '#text').filter(node => /^\s+$/.test(node.value))
    breakLines.forEach((item) => {
      item.value = '\n'
    })
    head.childNodes.unshift(find(parse.parse(titleVal), 'title')[0], breakLines[0])
    head.childNodes.unshift(find(parse.parse(state), 'script')[0], breakLines[0])
    head.childNodes.unshift(find(parse.parse(content), 'meta')[0], breakLines[0])
    head.childNodes.unshift(find(parse.parse(keywords), 'meta')[0], breakLines[0])
    const pushInBody = (script, { async = true, name = '' } = {}) => {
      if (script) {
        const str = script.startsWith('http')
          ? `<script type="text/javascript" src="${script}" ${async ? 'async' : ''}></script>`
          : `<script type="text/javascript">try { ${script} } catch (e) { console.error('Script(${name}) - ', e) }</script>`
        body.childNodes.push(find(parse.parse(str), 'script')[0], breakLines[0])
      }
    }
    pushInBody(service_js, { name: 'service_js' })
    pushInBody(tongji_js, { name: 'tongji_js' })
    const h = parse.serialize(document)

    // update cache
    cache[host] = {
      siteInfo: result,
      replacedHtml: h,
      expire: Date.now() + +expireTime,
    }
    return h
  }) : Promise.resolve(query.replacedHtml)
}

app.use(async (ctx) => {
  const { req: { headers: { host } }, response } = ctx
  response.type = 'text/html'
  response.body = await render(host)
})

app.listen(port)
console.log('---- Listen to %s', port)
