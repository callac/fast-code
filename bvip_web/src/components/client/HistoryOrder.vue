<template>
  <div class="history-order">
    <tab :value="''"
         :options="tab"
         :style="tabStyle.wrap"
         :tabStyle="tabStyle.tab"
         :selectedStyle="tabStyle.selected"/>
    <my-table :heads="myHeads" :data="data" :searching="searching"
              :sort="false" :headTrStyle="tableStyle.head" :trStyle="tableStyle.tr"/>
  </div>
</template>

<script>
import Tab from 'components/client/Tab'
import { headsDeal } from 'utils/HeadsDeal'

// 历史交易组件
export default {
  name: 'HistoryOrder',
  props: {
    coin: Object,
    data: Array,
    searching: Boolean,
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
  },
  data() {
    return {
      heads: [
        {
          name: 'price',
          alias: 'price',
          style: { width: '40%', textAlign: 'left' },
          formatter: (item) => {
            const value = item.price
            const color = this.getColor(item.type === 'sell' ? -1 : 1)
            return `<span class="${color}" style="font-size:inherit">${value}</span>`
          },
        },
        {
          name: 'amount(name)',
          alias: 'size',
          style: { width: '30%', textAlign: 'right', whiteSpace: 'nowrap' },
        },
        {
          name: 'time',
          alias: 'createdAt',
          style: { width: '30%', textAlign: 'right' },
        },
      ],
      tab: [{ name: 'exchange.history', value: '' }],
    }
  },
  computed: {
    myHeads() {
      return headsDeal.call(this, this.heads, this.coin)
    },
  },
  components: { Tab },
}
</script>
