<template>
  <div class="user-pin user conversion-currency">
    <drop-down
      class="item"
      arrowPosition="end"
      :popperOptions="{placement: 'bottom-end'}"
    >
      <span class="currency name capitalize">
        {{$t('currency.conversion')}}
      </span>
      <div class="sub-items" slot="popper">
        <div v-for="item in $currency.options"
             class="currency-item sub-item"
             :class="{selected: $currencyVal === item.value}"
             :key="item.value"
             @click="setCurrency(item.value)">{{item.name}}
        </div>
      </div>
    </drop-down>
  </div>
</template>

<script>
import DropDown from 'components/common/DropDown'
import { mapActions, mapState } from 'vuex'

// 折合方式切换
export default {
  name: 'ConversionCurrency',
  components: { DropDown },
  data() {
    return {}
  },
  computed: {
    ...mapState('exchange', ['exchangeRate', 'anchorCoin']),
  },
  methods: {
    ...mapActions('exchange', ['getExchangeRate']),
    setCurrency(val) {
      this.$currency.setCurrency(val)
    },
  },
  created() {
    if (['BTC_USD', 'USD_CNY'].some(k => !this.exchangeRate[k])) {
      this.getExchangeRate().catch(this.snackBar.error)
    }
  },
}
</script>
