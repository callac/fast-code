// 在数组中，获取在目标元素之前的一个元素
export function getPre(arr, el) {
  const index = +Object.keys(arr).find(i => arr[i] === el)
  if (index === undefined) {
    throw new Error('Element is not in the array')
  }
  return index !== 0 ? arr[index + 1] : arr[arr.length - 1]
}

// 在数组中，获取在目标元素之后的一个元素
export function getNext(arr, el) {
  const index = +Object.keys(arr).find(i => arr[i] === el)
  if (index === undefined) {
    throw new Error('Element is not in the array')
  }
  return index !== arr.length - 1 ? arr[index + 1] : arr[0]
}

/**
 * @desc 数组排序
 * @param { Array<Object> }   arr         元素都为一个对象的数组
 * @param { String|Number }   by          排序字段
 * @param { String }          type        倒序 or 正序
 * @param { Boolean }         isNumber    字段值是否为数字
 * */
export function orderBy(arr, by, type = 'asc', isNumber = false) {
  const arr1 = [...arr]
  const fn = (a1, a2) => {
    const a11 = isNumber ? +a1[by] : a1[by]
    const a21 = isNumber ? +a2[by] : a2[by]
    return (type === 'asc' ? a11 > a21 : a11 < a21) ? 1 : -1
  }
  arr1.sort(fn)
  return arr1
}

/**
 * @desc 数组转化为对象
 * @param { Array<Object> } arr     元素都为一个对象的数组
 * @param { String|Number } by      转化为对象的键
 * */
export function convertToObj(arr, by) {
  const obj = {}
  arr.forEach((item) => {
    obj[item[by]] = item
  })
  return obj
}

/**
 * @desc 将两个数组按键名（by）合并，不保证顺序
 * */
export function deepMergeArr(targetArr, arr, by) {
  const obj = { ...convertToObj(targetArr, by), ...convertToObj(arr, by) }
  return Object.keys(obj).map(k => obj[[k]])
}

/**
 * @desc 对象的深度合并
 * @return { Object|Array } 返回一个新对象
 * */
export function deepMergeObj(targetObj, obj) {
  if (targetObj instanceof Array || obj instanceof Array) return [...targetObj, ...obj]
  const o = {}
  Object.keys({ ...targetObj, ...obj }).forEach((k) => {
    if (targetObj[k] instanceof Object && obj[k] instanceof Object) {
      o[k] = deepMergeObj(targetObj[k], obj[k])
    } else {
      o[k] = obj[k] || targetObj[k]
    }
  })
  return o
}

/**
 * @desc 筛选数组
 * */
export function filterZero(arr, by, isNumber = true) {
  return arr.filter(item => (isNumber ? +item[by] : item[by]))
}


/**
 * @desc 数组对象中某值相同数量排序
 * @return 返回排序好的新数组
 * */

function flatten(arr) {
  while (arr.some(item => Array.isArray(item))) {
    /* eslint-disable */
    arr = [].concat(...arr);
  }
  return arr;
}


export function sortByNum(arr, by) {
  const obj = {}
  arr.forEach((item) => {
    Object.keys(obj)
    if (Object.keys(obj).includes(item[by])) {
      obj[item[by]].push(item)
    } else {
      obj[item[by]] = [item]
    }
  })
  function so(arr1, arr2) {
    return arr1.length > arr2.length ? 1 : -1
  }
  return flatten(Object.values(obj).sort(so))
}


/**
 * @desc 数组对象中某值相同数量排序
 * @return [{tn:'', arr:[]}]返回排序好的新数组
 * */

export function homeSymbolSort(arr, by) {
  const obj = {}
  arr.forEach((item) => {
    Object.keys(obj)
    if (Object.keys(obj).includes(item[by])) {
      obj[item[by]].push(item)
    } else {
      obj[item[by]] = [item]
    }
  })
  const resultArr = []
  for (let k in obj) {
    let o = {}
    o.tn = k
    o.arr = obj[k]
    resultArr.push(o)
  }
  function so(o1, o2) {
    return o1.order > o2.order ? 1 : -1
  }
  const sortArr = [
    { symbol: 'CNT', order: 1, },
    { symbol: 'USDT', order: 2, },
    { symbol: 'BTC', order: 3, },
    { symbol: 'ETH', order: 4, },
  ]
  resultArr.map(item => Object.assign(item, sortArr.filter(n => n.symbol === item.tn)[0]))
  return resultArr.sort(so)
}

/**
 * @desc 数组扁平化
 * @return 返回一个处理后的一维数组
 * */

export function steamroller(arr){
  return arr.reduce((prev,next)=>{
    return prev.concat(Array.isArray(next)?steamroller(next):next)
  },[])
}
