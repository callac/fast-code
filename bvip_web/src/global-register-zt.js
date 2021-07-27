import InputBase from '@livelybone/vue-input'
import Loading from '@livelybone/vue-loading'
import Pagination from '@livelybone/vue-pagination'
import { SelectBase } from '@livelybone/vue-select'
// eslint-disable-next-line import/extensions
import Big from 'big.js'
import NoResult from 'components/common/NoResult'
import PageContainer from 'components/common/PageContainer'
import CheckBox from 'components/form/CheckBox'
import { format, parse } from 'date-fns'
import ErrorPoster from 'utils/ErrorPoster'
import { getPrecision } from 'utils/GetPrecision'
// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import ImgTag from 'vue-img-tag'

const ButtonOnce = () => import('components/common/ButtonOnce' /* webpackChunkName: "ButtonOnce" */)

// eslint-disable-next-line max-len
// const SlideForMore = () => import('vue-slide-for-more/lib/SlideForMore' /* webpackChunkName: "SlideForMore" */);

const FileInput = () => import('components/form/FileInput' /* webpackChunkName: "FileInput" */)
const MyTable = () => import('components/table/MyTable' /* webpackChunkName: "MyTable" */)

const Overlay = () => import('components/common/Overlay' /* webpackChunkName: "Overlay" */)
const OverlayConfirm = () => import('./page-zt/components/OverlayConfirm/OverlayConfirm' /* webpackChunkName: "OverlayConfirm" */)

const Query = () => import('components/common/Query' /* webpackChunkName: "Query" */)

export default function () {
  Vue.config.errorHandler = (error, vm, info) => {
    // 使用 ErrorPoster 发送错误信息
    ErrorPoster.postMsg({
      type: 'error-runtime',
      message: error.message || error,
      details: {
        error,
        vm: vm.$options.name,
        info,
      },
    })
  }

  /* 注册全局组件 */

  // 页面容器
  Vue.component('page-container', PageContainer)

  // 查询组件容器
  Vue.component('query', Query)

  // 自定义 button，自带防抖
  Vue.component('btn-once', ButtonOnce)

  // 自定义 img 标签，可直接显示 File 类型的图片对象
  Vue.component('img-tag', ImgTag)

  // 未查询到内容时显示的占位符
  Vue.component('no-result', NoResult)

  // 普通表单项
  Vue.component('input-base', InputBase)

  // 图片上传表单项，可调用摄像头
  Vue.component('file-input', FileInput)

  // 自定义的 select
  Vue.component('select-base', SelectBase)

  // checkbox 表单项
  Vue.component('check-box', CheckBox)

  // 表格组件
  Vue.component('my-table', MyTable)

  // 弹窗的深色背景层
  Vue.component('overlay', Overlay)

  // 确认弹窗
  Vue.component('overlay-confirm', OverlayConfirm)

  // loading 动画组件
  Vue.component('loading', Loading)

  // 分页组件
  Vue.component('pagination', Pagination)
  // Vue.component('slide-for-more', SlideForMore);

  // 时间格式化管道
  Vue.filter('datePipe', (time, { fmt }) => {
    let t = 0
    if (+time) t = time * 1000
    return format(parse(t || time), fmt || 'YYYY-MM-DD HH:mm:ss')
  })

  // 资金格式化管道
  Vue.filter('amountPipe', (amount, { symbol, unit }) => (symbol || '') + amount + (unit || ''))

  Vue.mixin({
    methods: {
      log(...args) {
        console.log(...args)
      },
      warn(...args) {
        console.warn(...args)
      },
      error(...args) {
        console.error(...args)
      },
      alert(val) {
        alert(val)
      },
      // 获取涨跌颜色类名，目前为 -- 绿涨红跌
      getColor(delta) {
        const d = parseFloat(delta)
        if (d > 0) return 'font-green'
        return d === 0 || Number.isNaN(d) ? '' : 'font-red'
      },
      // 时间格式化
      dateFormatter(time, fmt) {
        if (!time) return ''
        let t = 0
        if (+time) t = time * 1000
        return format(parse(t || time), fmt || 'YYYY-MM-DD HH:mm:ss')
      },
      // 取数字精度，并将末尾的 '0' 去掉，如 this.numTrim(3.100001, 3) => '3.1'
      numTrim(val, toFixed) {
        if (toFixed <= 0) return Math.floor(+val).toString()
        return +val ? this.bigNum(val).toFixed(toFixed).replace(/\.?0*$/, '') : '0'
      },
      // 判断值是否为空
      isEmpty(value) {
        return value === '' || value === null || value === undefined
      },
      // 提交前，判断表单项是否通过验证
      validate(items) {
        let errorType = ''
        const item = items.find((i) => {
          if (i.alias) {
            const isEmpty = this.isEmpty(i.value)
            // 判断错误类型是否为空
            if (isEmpty && i.required !== false) {
              errorType = 'empty'
              return true
            }
            // 判断错误类型是否为非法
            if (!isEmpty && i.validator && !i.validator(i.value)) {
              errorType = 'invalid'
              return true
            }
          }
          return false
        })
        // 根据不同的错误类型以及表单项本身的信息，返回不同的错误信息
        if (item) {
          const { name, errorText, needTran } = item
          if (needTran !== false) {
            return Promise.reject(errorType === 'empty' ? new Error(`${this.$t(name)}: ${this.$t('required')}`) : `${this.$t(name)}: ${this.$t(errorText) || this.$t('invalid')}`)
          }
          return Promise.reject(errorType === 'empty' ? new Error(`${name}: ${this.$t('required')}`) : `${name}: ${errorText || this.$t('invalid')}`)
        }

        // 通过验证，resolve 空值
        return Promise.resolve()
      },
      // 创建 big.js 实例
      bigNum(val) {
        return Big(val || 0)
      },
      // 折合数值处理，展示到自第一个非0小数位的两个小数位，并且至少保留两位小数
      // 如： 3.0123 => 3.012; 3.123 => 3.12; 3.1 => 3.10; 3.0001 => 3.00010
      $numFixed2(val) {
        const num = this.bigNum(val)
        return num.toFixed(Math.max(2, -num.mod(1).toExponential().split('e')[1] + 1))
      },
      getPrecision,
      // 分页数据转换，用于对接接口，将前台分页数据转换成接口需要的数据
      pageC(pageConfig) {
        return {
          limit: pageConfig.pageSize,
          offset: (pageConfig.page - 1) * pageConfig.pageSize,
        }
      },
      // 字符串缩略
      ellipsis(str, len) {
        return `${str.slice(0, len)}${str.length < len ? '' : '...'}`
      },
      // 比较两次输入的密码是否一致
      pwdConfirmValidate(item, item1) {
        return item.value !== item1.value ? Promise.reject(new Error(this.$t('password.confirm.error'))) : Promise.resolve()
      },
      // 数值千分号转换，如： 321566 => '321,566'; 321566.3553 => '321,566.3553'
      c2ThousandsCount(val) {
        const arr = val.toString().split('.')
        const addSemicolon = (str, orderBy = 'asc') => {
          const flag = str[0] === '-' ? '-' : ''
          const str1 = flag ? str.slice(1) : str
          const len = str1.length
          const arr1 = []
          if (orderBy === 'asc') {
            arr1.push(str1.substr(0, len % 3))
            for (let i = 0; i < Math.floor(len / 3); i += 1) {
              arr1.push(str1.substr((len % 3) + (i * 3), 3))
            }
          } else {
            for (let i = 0; i < len / 3; i += 1) {
              arr1.push(str1.substr(i * 3, 3))
            }
          }
          return flag + arr1.filter(s => s).join(',')
        }
        return arr.map((str, i) => (i === 0 ? addSemicolon(str) : str)).join('.') || '0'
      },
    },
  })
}
