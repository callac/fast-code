/* eslint-disable no-param-reassign */
import { orderBy } from 'utils/Sort'

export default class ExchangeSector {
  static inherent = [
    { id: 'custom', name: 'custom', filter: 'custom', classify: false },
    { id: 'all', name: 'symbol.all', filter: 'all' },
    { id: 'up-down', name: 'ups&downs', filter: 'up-down', classify: false },
  ]

  /**
   * @param {Array} sectors
   * */
  static getSectors(sectors = []) {
    return this.inherent.concat(sectors.map(item => ({ ...item, id: item.ID, needTran: false })))
  }

  /**
   * @param {Array} symbols
   * @param {String|Number} classId
   * @param {Function} dealFn, symbol=> cSymbol
   * @param {String} keyword
   * */
  static getSymbols(symbols = [], classId, dealFn = val => val, keyword = '') {
    if (!classId) return symbols

    // 筛选
    const match = s => !keyword
      || `${s.symbol.toUpperCase()}::::::${s.symbol.toUpperCase()}`
        .includes(keyword.toUpperCase())

    // 自选
    if (classId === 'custom') {
      const arr = symbols.filter(s => (s.tableSelected && match(s)))
      return dealFn ? arr.map(dealFn) : arr
    }

    // 全部
    if (classId === 'all') {
      return symbols.reduce((pre, s) => {
        if (!match(s)) return pre
        const { quote_asset } = s
        if (!pre[quote_asset]) pre[quote_asset] = []
        pre[quote_asset].push(dealFn(s))
        return pre
      }, {})
    }

    // 涨跌版
    if (classId === 'up-down') {
      let arr = orderBy(symbols, 'rate', 'desc', true)
      if (keyword) arr = arr.filter(match)
      return dealFn ? arr.map(dealFn) : arr
    }

    // 其他版块
    return symbols
      .filter(s => match(s)
        && s.classes
        && s.classes.some(c => c.symbol_class_id.toString() === classId.toString()))
      .reduce((pre, s) => {
        const { quote_asset } = s
        if (!pre[quote_asset]) pre[quote_asset] = []
        pre[quote_asset].push(dealFn(s))
        return pre
      }, {})
  }
}
