import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  format,
  parse,
} from 'date-fns'

// 时间格式化
export function dateFormat(time, fmt) {
  return format(parse(time), fmt)
}

// 计算传入时间与现在时间的差值
export function timeConversion(time, delta = 0) {
  // time 毫秒数
  const d = parse(time)
  const now = Date.now() - delta
  return {
    day: Math.floor(differenceInDays(d, now)),
    hour: differenceInHours(d, now) % 24,
    minute: differenceInMinutes(d, now) % 60,
    second: differenceInSeconds(d, now) % 60,
  }
}
