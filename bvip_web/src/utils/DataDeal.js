// 将表单项的值转换成后端需要的数据
export function dataDeal(arr) {
  const d = {}
  arr.forEach((item) => {
    if (item.alias) {
      if (item.aliasType === 'time') { // 将时间转换成秒（s）
        d[item.alias] = item.valid !== false && item.value
          ? Math.floor(new Date(item.value).getTime() / 1000)
          : 0
      } else {
        d[item.alias] = item.valid !== false ? item.value : ''
      }
    }
  })
  return d
}

// 计算涨跌率
export function calcRate(last, open) {
  if (+open === 0) return 0
  return (last - open) / open * 100
}

// 将数值转换成字符串，并且将科学计数法数值拍平，如： 6e10 => "60000000000"
export function toNumberStr(num) {
  const str = num.toString()
  if (str.indexOf('e') < 0) {
    return str
  }
  const a = str.split('e')
  a[1] = +a[1]
  const pos = Math.abs(a[1])
  a[0] = a[0].split('').reverse()
  if (a[0][pos] !== undefined) {
    a[0].splice(pos, 0, '.')
  } else {
    a[0][pos] = '.'
    a[0][pos + 1] = '0'
  }
  return [...a[0]].map(val => val || '0').reverse().join('')
}

// 将对象中数值形式的字符串属性转换成数值
// 如： { a: '1', b: 'a' } => { a: 1, b: 'a' }
export function objNumDeal(obj) {
  const o = {}
  Object.keys(obj).forEach((k) => {
    const item = obj[k]
    o[k] = +item ? toNumberStr(item) : item
  })
  return o
}
