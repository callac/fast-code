import { Storage } from '@livelybone/storage'

// 封装好的 localStorage，有降级机制以及缓存溢出处理机制
export default class StorageX extends Storage {
  constructor(useCookie) {
    super(useCookie, (err, params, storage) => {
      console.warn(err)

      // 如果缓存溢出报错，清空 Storage
      storage.forEach((val, k) => {
        if (k !== 'AUTH_TOKEN' && k !== 'LANG') storage.delete(k)
      })

      // 重新设置，清空 Storage
      storage.set(...params)
    })
  }
}
