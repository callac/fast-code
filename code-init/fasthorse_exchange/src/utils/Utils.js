/* eslint-disable import/extensions,no-param-reassign */
import { copyDom as copyDom1, copyText as copyText1 } from '@livelybone/copy'
import Big from 'big.js'
import QRCode from 'qrcode'

// 复制 DOM 元素
export function copyDom(el, options) {
  return copyDom1(el, options) ? Promise.resolve('copy.success') : Promise.reject(new Error('copy.failed'))
}

// 复制文本内容
export function copyText(text) {
  const res = copyText1(text)

  // eslint-disable-next-line no-nested-ternary
  return res
    ? res.then ? res.then(() => 'copy.success') : Promise.resolve('copy.success')
    : Promise.reject(new Error('copy.failed'))
}

// 用 '0' 填充字符串到固定位数（fixed）
export function zeroFill(val, fixed) {
  const str = val.toString()
  const { length } = str
  if (fixed > length) {
    return [...Array(fixed)].map((v, i) => str[i - (fixed - length)] || '0').join('')
  }
  return str
}

// 将 ms 转换为秒
export function msToS(time) {
  return Math.ceil(time / 1000)
}

// 二维码生成
export function QrCode(url, options) {
  const opts = {
    type: 'image/jpeg',
    rendererOpts: { quality: 0.3 },
    ...options,
  }
  return new Promise((res, rej) => {
    QRCode.toDataURL(
      url,
      opts,
      (err, dataUrl) => {
        if (err) rej(err)
        res(dataUrl)
      },
    )
  })
}

// 转换成非科学计数法表示的数字
export function toNumNotExponential(val) {
  const arr = val.toString().match(/(-?[\d.]*)e(-?\d*)/)
  if (!arr) return val
  const [, decimal = ''] = (arr[1] || '').split('.')
  const exponential = (-arr[2] || 0) + decimal.length
  return new Big(val).toFixed(Math.max(0, exponential))
}

// 把对象中的数值型属性都转换成非科学计数法表示的数字
export function dealNumStringForObj(obj) {
  return Object.keys(obj).reduce((pre, k) => {
    pre[k] = +obj[k] ? toNumNotExponential(obj[k]) : obj[k]
    return pre
  }, {})
}

// 去掉字符串中的空格以及换行
export function strTrimAll(str) {
  return str.split(/[\s\n]/).join('')
}

/**
 * @param { Array } arr
 * @param { Array } vals
 * @return Array
 * @desc 从数组 arr 中去除和 vals 数组元素相同的元素
 * */
export function reduceValOfArr(arr, vals = []) {
  const arr1 = []
  arr.forEach((val) => {
    if (!vals.includes(val)) {
      arr1.push(val)
    }
  })
  return arr1
}

// 防抖动函数
/* eslint-disable */
export function debounce(func, wait) {
  let timeout = null
  return function () {
    const context = this; const
      args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}
