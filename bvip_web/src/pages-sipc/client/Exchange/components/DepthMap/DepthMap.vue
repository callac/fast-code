<template>
  <div class="depth-map">
    <h2 class="depth-map-title">{{$t('sipc.exchange.coin.order')}}</h2>
    <my-table class="table-head"
              :heads="myHeads"
              :noBody="true"
              :data="[]"
              :sort="false"
    />
    <div class="tbody">
      <rows-depth
        class="rows-depth sell"
        bg="rgba(250,74,97,.1)"
        :heads="myHeads"
        :data="data.sell"
        @rowClick="emit($event, 'buy')"
      />
      <div class="current-price">
        <img
          v-if="coin.rate>=0"
          class="img"
          :src="require('../../assets/icon-up.png')"
          alt=""
        />
        <img
          v-else
          class="img"
          :src="require('../../assets/icon-down.png')"
          alt=""
        />
        <span
          class="price"
          :class="getColor(coin.rate)"
          @click="emit({price})"
        >{{price}}</span>
        <span class="ex" v-html="$cEx($exPrice(coin))"></span>
      </div>
      <rows-depth
        class="rows-depth buy"
        bg="rgba(13,178,124,.1)"
        :heads="myHeads"
        :data="data.buy"
        @rowClick="emit($event, 'sell')"
      />
    </div>
  </div>
</template>

<script>
import RowsDepth from 'components/client/RowsDepth'
import { headsDeal } from 'utils/HeadsDeal'
import messages from './DepthMap.msg'

export default {
  name: 'DepthMap',
  components: { RowsDepth },
  i18n: { messages },
  props: {
    coin: Object,
    data: {
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
