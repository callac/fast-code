// 表格头部信息处理
// 如：([{ name: 'price(asset)', ...} ], { asset: 'CNT' }) => [{ name: '价格(CNT)', ...}]
export function headsDeal(targetArr = [], unitObj = {}) {
  // Need bind vm -> this
  return targetArr.map((item) => {
    let { name } = item
    const arr = name.match(/([^()]*)\(([^()]*)\)/)
    if (arr) {
      name = `${this.$t(arr[1])}(${(unitObj && unitObj[arr[2]]) || ''})`
      return { ...item, name, needTran: false }
    }
    return { ...item }
  })
}
