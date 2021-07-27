<template>
  <div class="doughnut-chart">
    <template v-if="showData.length>0">
      <div class="bars">
        <div v-for="(d, i) in showData"
             class="bar-item transition"
             :class="{'hover':hoverAsset===d.asset}"
             :key="d.asset">
          <span class="asset transition">{{d.asset}}</span>
          <div class="amount">
            <div class="text" :style="{width: getWidth(i)}">
              <span class="value">{{d.cValue}} {{$currencyVal}}</span>
              <span class="ratio">{{d.ratio}}</span>
            </div>
            <div class="bar" :style="{background: colors[i], width: getWidth(i)}"></div>
          </div>
        </div>
      </div>
      <svg class="doughnut"
           :width="chartSize&&chartSize.width"
           :height="chartSize&&chartSize.height"
           ref="chart">
        <template v-if="chartSize">
          <circle :cx="chartSize.width/2"
                  :cy="chartSize.height/2"
                  :r="cSize(0.95)"
                  :stroke-width="cSize(1)"
                  stroke="rgba(0,0,0,.2)"
                  fill="none"></circle>
          <path v-for="(d,i) in showData1"
                class="chart-path"
                :d="getD(showData1.length-1-i)"
                :key="d.asset"
                :stroke-width="stroke"
                :stroke="colors[showData1.length-1-i]"
                @mousemove.stop="hover(i)"
                fill="none"></path>
          <text class='chart-title'
                :x="chartSize.width/2"
                :y="chartSize.height/2+cSize(1.8)"
                text-anchor="middle">{{$t('asset.chart.title')}}
          </text>
        </template>
      </svg>
    </template>
    <span v-else class="no-data">{{$t('asset.distribution.no')}}</span>
  </div>
</template>

<script>
import { getRect } from '@livelybone/scroll-get'

// 资产分布图
export default {
  name: 'DoughnutChart',
  props: {
    data: Array,
  },
  data() {
    return {
      colors: [
        '#E6722B',
        '#E6943C',
        '#EBB446',
        '#E6CB45',
        '#E5E65F',
        '#3CC48E',
        '#24B3AB',
        '#10D4E6',
        '#01C9FD',
        '#4E9AE6',
      ],
      chartSize: null,
      hoverAsset: '',
    }
  },
  computed: {
    showData() {
      let total = 0
      const data = [...this.data]
        .filter(d => +d.cTotal)
        .map((d) => {
          const cValue = +d.cTotal
          total += cValue
          return { ...d, asset: d.name, cValue }
        })
        .sort((a, b) => b.cValue - a.cValue)
      if (data.length <= 10) {
        return data.map((d) => {
          const ratio1 = d.cValue / total * 100
          return {
            ...d,
            ratio1,
            ratio: `${ratio1 < 0.01 ? '<0.01' : (ratio1 - 0.005).toFixed(2)}%`,
          }
        })
      }
      return data
        .slice(0, 9)
        .map((d) => {
          const ratio1 = d.cValue / total * 100
          return {
            ...d,
            ratio1,
            ratio: `${ratio1 < 0.01 ? '<0.01' : (ratio1 - 0.005).toFixed(2)}%`,
          }
        })
        .concat(data
          .slice(9)
          .reduce((pre, d) => {
            const cValue = pre.cValue + d.cValue
            const ratio1 = cValue / total * 100
            return {
              ...pre,
              cValue,
              ratio1,
              ratio: `${ratio1 < 0.01 ? '<0.01' : (ratio1 - 0.005).toFixed(2)}%`,
            }
          }, { asset: this.$t('other'), cValue: 0 }))
    },
    showData1() {
      const data = [...this.showData]
      return data.reverse()
    },
    stroke() {
      return this.cSize(0.9)
    },
    r() {
      return this.cSize(1.05)
    },
  },
  watch: {
    showData: {
      handler(val) {
        if (val.length > 0) {
          this.getChartSize()
        }
      },
      immediate: true,
    },
  },
  methods: {
    getWidth(index) {
      return `${Math.max(this.showData[index].cValue / this.showData[0].cValue * 100, 20)}%`
    },
    getD(index) {
      let ratio1 = this.showData.slice(0, index + 1).reduce((pre, d) => pre + d.ratio1, 0)
      ratio1 = ratio1 >= 100 ? 99.99999 : ratio1
      const LargeArcFlag = ratio1 >= 50 ? 1 : 0
      const { r, chartSize: { width, height } } = this
      const a = Math.PI * (1 / 2 - 2 * ratio1 / 100)
      const p1 = `${width / 2},${height / 2 - r}`
      const p2 = `${Math.cos(a) * r + width / 2},${height / 2 - Math.sin(a) * r}`
      return `M${p1} A${r},${r},0,${LargeArcFlag},1,${p2}`
    },
    getChartSize() {
      this.$nextTick(() => {
        this.chartSize = getRect(this.$refs.chart)
      })
    },
    cSize(val) {
      return val * window.rootSize.value
    },
    hover(index = '') {
      if (typeof index !== 'number') this.hoverAsset = ''
      else this.hoverAsset = this.showData1[index].asset
    },
  },
  mounted() {
    window.addEventListener('mousemove', this.hover)
    this.$on('hook:beforeDestroy', () => {
      window.removeEventListener('mousemove', this.hover)
    })
  },
}
</script>
