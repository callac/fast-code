import { Observer } from '@livelybone/simple-observer'
import Storage from 'utils/StorageX'

let next
let currentTokenInMemory

/**
 * auth_token
 */
export class AuthToken {
  static setToken(val) {
    const { token = '', token_expire = '', need_safe = 0 } = val || {}
    this.localStorage.set(this.safeLoginKey, need_safe)
    if (token_expire) this.localStorage.set(this.expireKey, token_expire)

    this.localStorage.set(this.key, token)
    currentTokenInMemory = token
  }

  static getToken() {
    const token = this.get(this.key)
    if (!token) return token
    const now = Date.now()
    const expireTime = +this.localStorage.get(this.expireKey) * 1000

    // 过期
    if (now > expireTime) {
      this.setToken('')
      next('', true)
      return ''
    }

    return token
  }

  static get(key) {
    return this.localStorage.get(key)
  }
}


AuthToken.key = 'AUTH_TOKEN'

AuthToken.expireKey = 'EXPIRE'

AuthToken.safeLoginKey = 'SAFE_LOGIN'

AuthToken.localStorage = new Storage(true)

// 监听过期，或者在浏览器其他窗口操作导致的 token 变化
AuthToken.tokenChange = new Observer((nt) => {
  next = nt
})

// Storage 事件
AuthToken.localStorage.addHandler(({ key }) => {
  if (key === AuthToken.key && !AuthToken.get(AuthToken.safeLoginKey)) {
    const token = AuthToken.getToken()
    if (token !== currentTokenInMemory) next(token, false)
  }
})
