import { strTrimAll } from 'utils/Utils'

//
function replaceSample(val, sample) {
  return val + sample.substr(val.length)
}

// 格式化输入字符串为数值
export function numberFormatter(val) {
  const reg = {
    float: /^[-+]?(0\.|[1-9][0-9]*\.)[0-9]*$/,
    int: /^[-+]?(0|([1-9][0-9]*))?$/,
  }
  let value = val.toString()
  while (!(reg.float.test(value) || reg.int.test(value)) && value.length > 0) {
    value = value.slice(0, value.length - 1)
  }
  return value
}

// 格式化输入字符串为正数
export function posNumberFormatter(val) {
  const reg = {
    float: /^\+?(0\.|[1-9][0-9]*\.)[0-9]*$/,
    int: /^\+?(0|([1-9][0-9]*))?$/,
  }
  let value = val.toString()
  while (!(reg.float.test(value) || reg.int.test(value)) && value.length > 0) {
    value = value.slice(0, value.length - 1)
  }
  return value
}

// 格式化输入字符串为整数
export function intFormatter(val) {
  const reg = {
    int: /^[-+]?(0|([1-9][0-9]*))?$/,
  }
  let value = val.toString()
  while (!reg.int.test(value) && value.length > 0) {
    value = value.slice(0, value.length - 1)
  }
  return value
}

// 格式化输入字符串为正整数
export function posIntFormatter(val) {
  const reg = {
    int: /^\+?(0|([1-9][0-9]*))?$/,
  }
  let value = val.toString()
  while (!reg.int.test(value) && value.length > 0) {
    value = value.slice(0, value.length - 1)
  }
  return value
}

// 格式化输入字符串为最大小数位 toFixed 的数值
export function fixedNumber(toFixed) {
  return (val) => {
    const value = numberFormatter(val).split('.')
    if (value[1]) {
      value[1] = value[1].slice(0, toFixed)
    }
    return value.join('.')
  }
}

// 格式化输入字符串为最大小数位 toFixed 的正数值
export function posFixedNumber(toFixed) {
  return (val) => {
    if (!toFixed) return posIntFormatter(val)
    const value = posNumberFormatter(val).split('.')
    if (value[1]) {
      value[1] = value[1].slice(0, toFixed)
    }
    return value.join('.')
  }
}

// 格式化输入字符串为数字验证码
export function verifyCodeNumber(val) {
  const reg = {
    int: /^[-+]?[0-9]*$/,
  }
  let value = val.toString()
  while ((!reg.int.test(value) && value.length > 0) || value.length > 6) {
    value = value.slice(0, value.length - 1)
  }
  return value
}

// 格式化输入字符串为时间字符串
export function verifyDatetime(val) {
  const reg = /^[12][90]\d{2}-[01]\d-[0123]\d\s[01]\d:[0-6]\d:[0-6]\d$/
  const sample = '2018-05-06 12:30:00'
  let value = val.toString()
  while (!reg.test(replaceSample(value, sample)) && value.length > 0) {
    value = value.slice(0, value.length - 1)
  }
  return value
}

// 格式化输入字符串为日期字符串
export function verifyDate(val) {
  const reg = /^[12][90]\d{2}-[01]\d-[0123]\d$/
  const sample = '2018-05-06'
  let value = val.toString()
  while (!reg.test(replaceSample(value, sample)) && value.length > 0) {
    value = value.slice(0, value.length - 1)
  }
  return value
}

// 格式化输入字符串为手机号码
export function phonePreFormatter(str) {
  return str.replace(/[^\d]/g, '')
}

// 格式化输入字符串为邮箱
export function emailPreFormatter(str) {
  return strTrimAll(str)
}
