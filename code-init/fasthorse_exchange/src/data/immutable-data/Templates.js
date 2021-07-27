import { format, parse } from 'date-fns'

function dFormatter(fmt) {
  return (item, alias) => {
    const time = item[alias]
    let t = 0
    if (+time) t = time * 1000
    return format(parse(t || time), fmt || 'YYYY-MM-DD HH:mm:ss')
  }
}

export default class Templates {
  static templates = {
    feedback: {
      phone: {
        name: 'phone',
        alias: 'phone',
        required: false,
      },
      email: {
        name: 'email',
        alias: 'email',
        required: false,
      },
      title: {
        name: 'title',
        alias: 'subject',
      },
      content: {
        name: 'content',
        alias: 'body',
        inputType: 'textarea',
      },
      createdAt: {
        name: 'createdAt',
        alias: 'CreatedAt',
        formatter: dFormatter('MM-DD HH:mm'),
      },
      updatedAt: {
        name: 'updatedAt',
        alias: 'UpdatedAt',
        formatter: dFormatter('MM-DD HH:mm'),
      },
      attachments: {
        name: 'attachments',
        alias: 'attach',
        inputType: 'files',
        required: false,
        formatter(item, alias) {
          return item[alias].split(',').reduce((pre, val) => (val ? `${pre}<img class="t-img" src="${val}">` : pre), '')
        },
      },
    },
  }

  static generator(key, { filterFn = null, order = null, dealFn = null } = {}) {
    if (order instanceof Array) {
      return order.reduce(
        (pre, k) => pre.concat([dealFn
          ? dealFn(k, { ...Templates.templates[key][k] })
          : { ...Templates.templates[key][k] }]),
        [],
      )
    }

    let arr = Object.keys(Templates.templates[key])
    if (typeof filterFn === 'function') arr = arr.filter(filterFn)
    return arr.map((k) => {
      const t = { ...Templates.templates[key][k] }
      if (typeof dealFn === 'function') {
        return dealFn(k, t)
      }
      return t
    })
  }

  static cannotEdit(key) {
    return Templates.copy(key).map((item) => {
      item.canEdit = false
      return item
    })
  }
}
