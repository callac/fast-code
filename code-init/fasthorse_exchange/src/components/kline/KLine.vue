<template>
  <div class="k-line" ref="k-line" @resize="log">
    <kline v-if="klineStyle"
           :style="klineStyle"
           :fontSize="fontSize"
           :isMobile="isMobile"
           :data="data"
           :updateData="updateData"
           :period.sync="period"
           :loading="loading"
           :showIndicators="indicators"
           @getMorePreData="query(true)"
           ref="kline" />
    <!--<a class="out-link" target="_blank" :href="'https://k.chainfor.com/?k=240-'+symbol">{{$t('out-link')}}</a>-->
  </div>
</template>

<script>
import Kline from 'components/kline/kline-js'
import { deepMergeArr } from 'utils/Sort'
import Storage from 'utils/StorageX'
import { mapActions, mapState } from 'vuex'

// 单条 K 线数据存储长度上限
const limit = 300

const storage = new Storage()

// 储存的键值的前缀
const keyPrefix = 'KLINE'

/**
 * @desc K 线组件
 * */
export default {
  name: 'KLine',
  components: { Kline },
  props: {
    resize: Boolean,
    // 交易对
    symbol: String,
  },
  data() {
    return {
      // K 线组件尺寸
      size: {},
      // 初始数据
      data: [],
      // 增量数据
      updateData: [],
      // K 线蜡烛时间间隔
      period: undefined,
      // 是否处于数据加载状态
      loading: false,
      // 默认显示的指标
      indicators: ['MA', 'MACD'],
      // window.rootSize 来自 @livelybone/rem-init
      fontSize: window.rootSize.value * 0.1,
    }
  },
  computed: {
    // 服务器与客户端本地时间差
    ...mapState(['deltaTime']),
    ...mapState('market', {
      // 订阅得到的增量数据
      updateData1: state => state.kline.updateData,
    }),
    user() {
      return this.$store.state.user.info
    },
    klineStyle() {
      const { height } = this.size
      if (!height) return null
      return { height: `${height}px` }
    },
    // 储存的键值
    localStorageKey() {
      if (!this.symbol || !(this.period && this.period.value)) return ''
      return this.getKey(this.symbol, this.period.value)
    },
  },
  watch: {
    user() {
      this.getSize()
    },
    resize(val) {
      if (val) {
        this.getSize()
      }
    },
    '$i18n.locale'(val) {
      // 更新 K 线组件的语言
      this.setLang(val)
    },
    period() {
      // 当间隔对象发生变化时，重新请求数据
      this.query(false, true)
    },
    symbol() {
      // 当交易对发生变化时，重新请求数据
      this.query(false, true)
    },
    updateData1({ data, market, interval }) {
      const key = this.getKey(market, interval)
      const localData = this.$refs.kline && this.$refs.kline.myData
      // 当增量数据发生变化时，通过 K 线的 updateData 更新 K 线
      // 条件：
      // 1. 交易对和时间间隔都和现在的交易对对应（此时 key 和 localStorageKey 相同）
      // 2. 第一个增量数据与 K 线本地最后一个数据的时间间隔等于 interval 的倍数
      if (
        key === this.localStorageKey
        && (data[0][0] - localData[localData.length - 1][0]) % interval === 0
      ) {
        this.updateData = data
        this.setLocalStorage(key)
      }
    },
  },
  methods: {
    ...mapActions(['getDeltaTime']),
    ...mapActions('market', ['klineQuery', 'klineUpdate', 'klineUnsubscribe']),
    query(pre = false, reset = false) {
      // 获取服务器与客户端本地时间差
      const getTime = this.getDeltaTime()

      // 获取存储键值
      const key = this.localStorageKey
      if (key) {
        const market = this.symbol
        const interval = this.period.value

        // 起始查询时间
        let start = null

        // 本地已缓存的数据
        let localData = []

        // K 线组件中已有的数据。查询之前的 K 线数据时有用
        let data = []

        const serverTime = Date.now() - this.deltaTime

        // 调用 K 线的 reset 方法重置 K 线
        if (reset) this.reset(!pre)

        // 如果是查询之前的 K 线数据，保存 K 线组件中已有的数据到 data 变量
        // 如果不是，则取出本地缓存数据 localData 赋值到 this.data，并计算出起始查询时间 start
        if (!pre) {
          this.klineUnsubscribe()
          localData = storage.get(key) || localData
          /* 如果 localStorage 中有旧数据，则使用 start 字段，值为最后一个蜡烛的时间 */
          if (localData.length > 0) {
            [start] = localData[localData.length - 1]
            if ((serverTime - start) / interval > 300) {
              this.loading = true
              this.data = []
              start = null
            } else {
              // 为避免出现重复 candle 再做一道保险
              this.data = deepMergeArr(localData, [], '0')
                .sort((a, b) => a[0] - b[0])
            }
          } else {
            this.loading = true
            this.data = []
          }
        } else {
          this.loading = true
          data = this.$refs.kline && this.$refs.kline.myData
        }

        // 查询
        getTime.then(() => {
          (serverTime - start < interval
            ? Promise.resolve([])
            : this.klineQuery({
              market,
              limit,
              start,
              end: pre && data.length > 0 ? data[0][0] - interval : serverTime,
              interval,
            }))
            .then((res) => {
              // 如果是查询之前的 K 线数据，则合并数据
              // 如果不是，则通过 updateData 将数据更新到 K 线，<kline> 会自动合并数据
              if (pre) this.data = [...res, ...data]
              else {
                this.updateData = res
                this.setLocalStorage(key)
              }
            })
            .then(() => {
              // 如果不是查询之前的 K 线数据，还需要重新订阅 K 线数据
              if (!pre) this.klineUpdate({ market, interval })
            })
            .catch((e) => {
              this.snackBar.error(e)
              if (!pre) {
                this.data = []
              }
            })
            .then(() => {
              this.loading = false
            })
        })
      }
    },
    // 计算存储的键值
    getKey(symbol, interval) {
      return `${keyPrefix}-${symbol}-${interval}`
    },
    // 设置缓存
    setLocalStorage(key) {
      this.$nextTick(() => {
        // 判断 存储键名 是否一致，如果一致则更新缓存
        if (key === this.localStorageKey) {
          const data = this.$refs.kline ? this.$refs.kline.myData : []
          storage.set(key, data.slice(Math.max(0, data.length - limit)))
        }
      })
    },
    // 设置语言
    setLang(val) {
      if (this.$refs.kline) this.setLangFn(val)
      else {
        const timer = setInterval(() => {
          if (this.$refs.kline) {
            this.setLangFn(val)
            clearInterval(timer)
          }
        }, 100)
      }
    },
    setLangFn(val) {
      const langs = {
        'zh-hans': 'zh-hans',
        'zh-hant': 'zh-hant',
        'en': 'en',
      }
      this.$refs.kline.setLang(langs[val] || 'en')
    },
    // 获取 k 线的尺寸
    getSize() {
      return new Promise((res) => {
        this.$nextTick(() => {
          const el = this.$refs['k-line']
          this.size = { width: el.clientWidth, height: el.clientHeight }
          this.$nextTick(() => {
            if (this.$refs.kline) this.$refs.kline.resize()
          })
          res(this.size)
        })
      })
    },
    // 重置 K 线
    reset(changeSymbol) {
      if (this.$refs.kline) this.$refs.kline.reset(changeSymbol)
    },
  },
  mounted() {
    this.getSize()
    this.query()
    this.setLang(this.$i18n.locale)
  },
  beforeDestroy() {
    this.klineUnsubscribe()
  },
}
</script>
