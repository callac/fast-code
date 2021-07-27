<template>
  <form class="exchange-form" @submit.prevent="">
    <div class="balance">
      {{$t('price.'+button)}} {{coin}}
      <template v-if="user.id">
        <span class="value">{{$t('balance')}}:{{balanceVal}} {{balance}}</span>
      </template>
    </div>
    <exchange-input v-for="(item,i) in items" v-model="item.value" :key="i" :item="item"/>
    <div class="ranges">
      <button v-for="(r,i) in ranges" class="range" :key="i"
              :class="button==='sell'?'range-red':'range-green'"
              type="button"
              @click="balanceVal?input(balanceVal*r.value):''">{{r.name}}
      </button>
    </div>
    <div v-if="isLimit" class="total">{{$t('total')}} <span>{{total}} {{base}}</span></div>
    <btn-once class="submit" :class="button==='sell'?'btn-red-fill':'btn-green-fill'"
              :useLoading="true" :canUseAgain="true" :clickFn="submitFn">
      <!--{{$t(user.id?button:'sign-in-or-up')}}-->
      {{$t(user.id?'price.'+button:'sign-in-or-up')}}
    </btn-once>
  </form>
</template>

<script>
import ExchangeInput from 'components/tradingview/ExchangeInput'
import { mapState } from 'vuex'

// 币币交易表单，买或者卖
export default {
  name: 'ExchangeForm',
  props: {
    coin: String,
    base: String,
    items: Array,
    type: String,
    buttonType: String,
    submitFn: Function,
    precision: Number,
  },
  data() {
    return {
      ranges: [
        { name: '25%', value: 0.25 },
        { name: '50%', value: 0.50 },
        { name: '75%', value: 0.75 },
        { name: '100%', value: 1.00 },
      ],
    }
  },
  computed: {
    ...mapState('user', {
      user: state => state.info,
      assets: state => state.assets,
    }),
    isLimit() {
      return this.type === 'limit'
    },
    button() {
      return this.buttonType === 'sell' ? 'sell' : 'buy'
    },
    balance() {
      return this.button === 'sell' ? this.coin : this.base
    },
    balanceVal() {
      return this.numTrim((this.assets[this.balance] && this.assets[this.balance].available) || 0,
        this.precision || 8)
    },
    total() {
      return (this.items[0].value * this.items[1].value).toFixed(this.precision || 8) || 0
    },
  },
  methods: {
    input(val) {
      if (this.buttonType === 'buy' && this.type === 'limit') {
        if (this.items[0].value) {
          this.$set(this.items[1], 'value', this.items[1].preFormatter(val / this.items[0].value))
        } else {
          this.snackBar.error(this.$t('please-set') + this.$t(this.items[0].name))
        }
      } else {
        this.$set(this.items[1], 'value', this.items[1].preFormatter(val))
      }
    },
  },
  components: { ExchangeInput },
}
</script>
