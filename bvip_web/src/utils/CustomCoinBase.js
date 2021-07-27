import Storage from 'utils/StorageX'
// eslint-disable-next-line import/no-unresolved,import/extensions
import User from 'data/api/user-<<mask>>'

/**
 * @desc 通过 localStorage 管理自选交易对，存储交易对 ID
 * @class CustomCoinBase
 * store according to id, use JSON.stringify
 */
export class CustomCoinBase {
  // 获取 localStorage 中的自选交易对
  static getCustom() {
    return Promise.resolve(CustomCoinBase.localStorage.get(CustomCoinBase.key) || [])
  }

  // 存储自选交易对
  static setCustom(arr = []) {
    return Promise.resolve().then(() => {
      CustomCoinBase.localStorage.set(CustomCoinBase.key, arr)
    })
  }

  // 添加一个自选交易对
  static addCustom(id) {
    if (CustomCoinBase.localStorage.get('AUTH_TOKEN').length) {
      User.setCustom(`${id}`)
    }
    return CustomCoinBase.getCustom().then((arr) => {
      arr.push(id)
      return CustomCoinBase.setCustom(arr)
    })
  }

  // 删除一个自选交易对
  static delCustom(id) {
    if (CustomCoinBase.localStorage.get('AUTH_TOKEN').length) {
      User.dleCustom(`${id}`)
    }
    return CustomCoinBase.getCustom().then((arr) => {
      arr.splice(Object.keys(arr).find(k => arr[k] === id), 1)
      return CustomCoinBase.setCustom(arr)
    })
  }

  // 处理交易对列表，为交易对对象添加 tableSelected 字段
  // 返回处理之后的交易对列表，以及自选交易对列表
  static dealCoins(coins) {
    return CustomCoinBase.getCustom().then((custom) => {
      const customObj = []
      const coins1 = coins.map((item) => {
        const isCustom = custom.includes(item.ID)
        if (isCustom) {
          const item1 = { ...item, tableSelected: 'checked' }
          customObj.push(item1)
          return item1
        }
        return item
      })
      return {
        coins: coins1, // 处理过的交易对列表
        custom: customObj, // 自选交易对列表
      }
    })
  }
}

// key 值
CustomCoinBase.key = 'custom-coin'

// 封装好的 localStorage 实例
CustomCoinBase.localStorage = new Storage()
