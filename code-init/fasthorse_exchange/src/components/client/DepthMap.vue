<template>
  <div class="depth-map">
    <tab v-model="tab.value"
         :options="tab.options"
         :style="tabStyle.wrap"
         :tabStyle="tabStyle.tab"
         :selectedStyle="tabStyle.selected"/>
    <my-table class="table-head" :heads="myHeads" :noBody="true" :data="[]"
              :sort="false" :headTrStyle="tableStyle.head"/>
    <div class="tbody"
         :class="{'upper':tab.value===tab.options[1].value,
                        'under':tab.value===tab.options[2].value}">
      <rows-depth v-if="tab.value!==tab.options[2].value" class="rows-depth up"
                  :heads="myHeads" :data="data.sell" bg="rgba(250,74,97,.1)"
                  :rowStyle="tableStyle.tr" @rowClick="emit($event, 'buy')"/>
      <div class="current-price">
        <span class="price"
              @click="emit({price})">
          {{price}}</span>
        <span class="rate" :class="getColor(coin.rate)">{{(coin.rate||0).toFixed(2)}}%</span>
        <div class="img">
          <img v-if="coin.rate>=0" :src="require('assets/client/exchange/icon-vol-upper.png')"
               alt=""/>
          <img v-else :src="require('assets/client/exchange/icon-vol-under.png')"
               alt=""/>
        </div>
      </div>
      <rows-depth v-if="tab.value!==tab.options[1].value" class="rows-depth"
                  :heads="myHeads" :data="data.buy" bg="rgba(13,178,124,.1)"
                  :rowStyle="tableStyle.tr" @rowClick="emit($event, 'sell')"/>
    </div>
  </div>
</template>

<script>
import RowsDepth from 'components/client/RowsDepth'
import Tab from 'components/client/Tab'
import { headsDeal } from 'utils/HeadsDeal'

// 深度列表组件
export default {
  name: 'DepthMap',
  components: { Tab, RowsDepth },
  props: {
    coin: Object,
    tabStyle: {
      default() {
        return {}
      },
      type: Object,
    },
    tableStyle: {
      default() {
        return {}
      },
      type: Object,
    },
    data: {
      default() {
        return {}
      },
      type: Object,
    },
  },
  data() {
    return {
      tab: {
        value: 'both',
        options: [
          {
            name: `<img src="${require('assets/client/exchange/icon-both.png')}">`,
            value: 'both',
            needTran: false,
          },
          {
            name: `<img src="${require('assets/client/exchange/icon-upper.png')}">`,
            value: 'upper',
            needTran: false,
          },
          {
            name: `<img src="${require('assets/client/exchange/icon-under.png')}">`,
            value: 'under',
            needTran: false,
          },
        ],
      },
      heads: [
        {
          name: 'price',
          alias: 'price',
          style: { width: '30%', textAlign: 'left' },
          formatter: (item) => {
            const value = item.price
            const color = this.getColor(item.type === 'sell' ? -1 : 1)
            return `<span class="${color}" style="font-size:inherit">${value}</span>`
          },
        },
        {
          name: 'amount(name)',
          alias: 'size',
          style: { width: '35%', textAlign: 'right', whiteSpace: 'nowrap' },
        },
        {
          name: 'total-1',
          alias: 'total',
          style: { width: '35%', textAlign: 'right' },
        },
      ],
    }
  },
  computed: {
    myHeads() {
      return headsDeal.call(this, this.heads, this.coin)
    },
    precision() {
      const { precision = {} } = this.coin || {}
      return precision
    },
    price() {
      return +this.coin.last ? (+this.coin.last).toFixed(this.precision.price) : 0
    },
  },
  methods: {
    emit(obj, type = '') {
      this.$emit('setPrice', { ...obj, type })
    },
  },
}
</script>
