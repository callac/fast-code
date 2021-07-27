import { Http } from 'extensions/http'

export default class Home {
  /**
   * 获取客户端与服务端的时间差, 值：clientTime - serverTime
   * */
  static getDeltaTime() {
    const start = Date.now()
    return Http.get('/time')
      .catch(() => 0)
      .then(timestamp => (timestamp ? start + (Date.now() - start) / 2 - timestamp : 1))
  }

  static getArticleClass(type) {
    return Http.get('/articleClass', { type })
  }

  static getArticles({ type, class_id = '', offset = 0, limit = 10 }) {
    return Http.get('/articleList', { type, class_id, offset, limit })
  }

  static getArticle({ id, type }) {
    return Http.get(`/article/${id}`, { type })
  }

  /**
   * @param {String} unique_id, options: ['about-us', 'privacy-policy', 'user-agreement']
   *
   * */
  static getAboutArticle(unique_id = 'about-us') {
    return Http.get(`/about/${unique_id}`)
  }

  static getSiteInfo() {
    return Http.get('/site')
  }

  static getBanner(position = 'home') {
    return Http.get('/banner', { position })
  }

  static getContacts() {
    return Http.get('/aboutImage')
  }

  static getHeaders() {
    return Http.get('label/config', { type: 1 })
  }

  static getFooters() {
    return Http.get('label/config', { type: 2 })
  }
}
