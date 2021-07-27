/**
 * http: axios
 */
import axios from 'axios'
import config from 'config/config'
import { AuthToken } from 'data/api/auth-token'
import { browserLang, LangStore } from 'extensions/i18n'
// import ErrorPoster from 'utils/ErrorPoster'
import { convertToFormData, getUrl } from 'utils/RequestDeal'

function setAuth(url) {
  // 登录授权 token
  axios.defaults.headers.Authorization = `Bearer ${AuthToken.getToken()}`
  // 站点 ID 标识
  axios.defaults.headers['X-SITE-ID'] = typeof window !== 'undefined' && window.INIT_STATE && window.INIT_STATE.siteInfo ? window.INIT_STATE.siteInfo.id || config.siteId : config.siteId
  // 客户端语言
  axios.defaults.headers.lang = LangStore.getLang() || browserLang || 'en'
  return url
}

function initialAxios() {
  axios.defaults.baseURL = config.backendUrl
  axios.defaults.headers['Content-Type'] = 'application/json;charset=UTF-8'
  // axios.defaults.withCredentials = true; // 允许 AJAX 跨域请求带 Cookie 设置
  // 如果你想在客户端app中获取自定义的 header 信息，需要在服务器端 header 中添加 Access-Control-Expose-Headers：
  // header('Access-Control-Expose-Headers:token,uid');
  // 处理服务器返回的错误信息
  axios.defaults.validateStatus = status => (status >= 200 && status < 300) || (status >= 400)
}

initialAxios()

// 获取 api 路径
// function getApiName(conf) {
//   return conf.url.replace(conf.baseURL, '')
// }

export class Http {
  static getOTC(url, data) {
    const uri = getUrl(url, data)
    axios.defaults.baseURL = config.backendOTCUrl
    setTimeout(() => {
      axios.defaults.baseURL = config.backendUrl
    }, 100)
    return Http.responseDeal(axios.get(setAuth(uri)))
  }

  static get(url, data) {
    const uri = getUrl(url, data)
    return Http.responseDeal(axios.get(setAuth(uri)))
  }

  static getFile(url) {
    // 适用于需要登录的情况
    return axios.get(setAuth(url), { responseType: 'blob' }).then(res => res.data)
  }

  static post(url, data) {
    return Http.responseDeal(axios.post(setAuth(url), data))
  }

  static postForm(url, data) {
    const formData = convertToFormData(data)
    return Http.responseDeal(axios.post(setAuth(url), formData, { headers: { 'Content-Type': 'multipart/form-data' } }))
  }

  static del(url) {
    return Http.responseDeal(axios.delete(setAuth(url)))
  }

  static put(url, data) {
    return Http.responseDeal(axios.put(setAuth(url), data))
  }

  static putForm(url, data) {
    const formData = convertToFormData(data)
    return Http.responseDeal(axios.put(setAuth(url), formData, { headers: { 'Content-Type': 'multipart/form-data' } }))
  }

  static all(callback, ...reqs) {
    const queue = reqs.map((req) => {
      if (req.method === 'GET') {
        return Http.get(req.url, req.data)
      }
      return axios({
        method: req.method,
        url: setAuth(req.url),
        data: req.data,
      })
    })
    return axios.all(queue).then(axios.spread((acct, perms) => {
      callback(acct, perms)
    }))
  }

  static responseDeal(promise) {
    const start = Date.now()
    return promise
      .then((res) => {
        const { data, status, config: conf } = res
        // const api = getApiName(conf)

        // 提交响应超过 10s 的接口的请求情况
        const time = Date.now() - start
        if (time > 10000) {
          // ErrorPoster.postMsg({
          //   type: 'network-statistics',
          //   level: 'warn',
          //   // level: 'normal',
          //   message: `Long response time(greater than 2 second): \`${api}\``,
          //   details: {
          //     api,
          //     time,
          //     config: { ...conf, headers: { ...conf.headers, Authorization: undefined } },
          //   },
          // })
        }

        // 去除 config, request, status, statusText...等一些其他字段，关注 data
        const { message, msg, code, result } = data || {}
        if (data) {
          if (Http.errorValidate(data)) {
            const error = new Error(message || msg)
            error.statusCode = status
            error.resCode = code
            error.config = conf
            throw error
          } else {
            return result
          }
        }
        return res
      })
      .catch((error) => {
        const statusCode = +(error.status || error.statusCode)
        if (
          statusCode >= 300
          && statusCode !== 401
          && statusCode !== 400
          && statusCode !== 426
        ) {
          // ErrorPoster.postMsg({
          //   type: 'api-error',
          //   message: error.message || error,
          //   details: {
          //     api: getApiName(error.config),
          //     statusCode,
          //     resCode: error.resCode || null,
          //     config: {
          //       ...error.config,
          //       headers: { ...error.config.headers, Authorization: undefined },
          //     },
          //     error,
          //   },
          // })
        }
        throw error
      })
  }

  static errorValidate(data = {}) {
    // 与后台约定的错误验证方式
    // 现约定， 对于返回的数据的字段 code，0 表示成功，!0 表示出错
    return data.code !== 0
  }
}

const HttpPlugin = {}

HttpPlugin.install = (Vue) => {
  Vue.prototype.$http = Http
}

export default HttpPlugin
