<template>
  <div class="depth-map">
    <div class="exchange-side-header">{{$t('exchange.deep')}}</div>
    <my-table class="table-head" :heads="myHeads" :noBody="true" :data="[]"
              :sort="false" :headTrStyle="tableStyle.head"/>
    <div class="tbody"
         :class="{'upper':tab.value===tab.options[1].value,
                        'under':tab.value===tab.options[2].value}">
      <rows-depth v-if="tab.value!==tab.options[2].value" class="rows-depth up"
                  :heads="myHeads" :data="data.sell" bg="rgba(250,74,97,.1)"
                  :rowStyle="tableStyle.tr" @rowClick="emit($event, 'buy')"
                  :style="tab.value===tab.options[0].value ? {height: 'calc(50% - 0.16rem)'} : {}"
      />
      <div class="current-price">
        <span class="price" :class="getColor(coin.rate)"
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
                  :rowStyle="tableStyle.tr" @rowClick="emit($event, 'sell')"
                  :style="tab.value===tab.options[0].value ? {height: 'calc(50% - 0.16rem)'} : {}"
      />
    </div>
    <depth-tab v-model="tab.value" class="depth-tab-wrap"
         :options="tab.options"
         :style="tabStyle.wrap"
         :tabStyle="tabStyle.tab"
         :selectedStyle="tabStyle.selected"/>
  </div>
</template>

<script>
import RowsDepth from 'components/client/RowsDepth'
import DepthTab from 'components/client/DepthTab'
import { headsDeal } from 'utils/HeadsDeal'

// 深度列表组件
export default {
  name: 'DepthMap',
  components: { DepthTab, RowsDepth },
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
    theme: String,
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
            name: `<img width="22" src="${require('assets/client/exchange/icon-both-t3.png')}">`,
            selectName: `<img width="22" src="${require('assets/client/exchange/icon-both-select.png')}">`,
            value: 'both',
            needTran: false,
          },
          {
            name: `<img width="22" src="${require('assets/client/exchange/icon-upper-t3.png')}">`,
            selectName: `<img width="22" src="${require('assets/client/exchange/icon-upper-select.png')}">`,
            value: 'upper',
            needTran: false,
          },
          {
            name: `<img width="22" src="${require('assets/client/exchange/icon-under-t3.png')}">`,
            selectName: `<img width="22" src="${require('assets/client/exchange/icon-under-select.png')}">`,
            value: 'under',
            needTran: false,
          },
        ],
      },
      heads: [
        {
          name: 'price(base)',
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
          style: { width: '34%', textAlign: 'right', whiteSpace: 'nowrap' },
        },
        {
          name: 'total-1(name)',
          alias: 'total',
          style: { width: '36%', textAlign: 'right' },
        },
      ],
    }
  },
  watch: {
    theme() {
      if (this.theme === 'black') {
        this.tab.options[0].name = `<img width="22" src="${require('assets/client/exchange/icon-both-t3.png')}">`
        this.tab.options[0].selectName = `<img width="22" src="${require('assets/client/exchange/icon-both-select.png')}">`
        this.tab.options[1].name = `<img width="22" src="${require('assets/client/exchange/icon-upper-t3.png')}">`
        this.tab.options[1].selectName = `<img width="22" src="${require('assets/client/exchange/icon-upper-select.png')}">`
        this.tab.options[2].name = `<img width="22" src="${require('assets/client/exchange/icon-under-t3.png')}">`
        this.tab.options[2].selectName = `<img width="22" src="${require('assets/client/exchange/icon-under-select.png')}">`
      } else {
        this.tab.options[0].name = `<img width="22" src="${require('assets/client/exchange/icon-both-t3-white.png')}">`
        this.tab.options[0].selectName = `<img width="22" src="${require('assets/client/exchange/icon-both-select-white.png')}">`
        this.tab.options[1].name = `<img width="22" src="${require('assets/client/exchange/icon-upper-t3-white.png')}">`
        this.tab.options[1].selectName = `<img width="22" src="${require('assets/client/exchange/icon-upper-select-white.png')}">`
        this.tab.options[2].name = `<img width="22" src="${require('assets/client/exchange/icon-under-t3-white.png')}">`
        this.tab.options[2].selectName = `<img width="22" src="${require('assets/client/exchange/icon-under-select-white.png')}">`
      }
    },
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
