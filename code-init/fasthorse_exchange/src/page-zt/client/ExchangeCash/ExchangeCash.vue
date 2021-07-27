<template>
  <page-container v-if="siteInfo.c2cEnabled"
                  class="container-inner exchange-cash"
                  :title="$t('exchange.cash')">
    <div class="content forms">
      <exchange-cash-form type="buy"
                          :coin="cashPrice.asset"
                          :price="cashPrice.buy_price"
                          :minAmount="cashPrice.min_amount"
                          :maxAmount="cashPrice.max_amount"
                          :submitFn="data=>create(data,1)"/>
      <exchange-cash-form type="sell"
                          :coin="cashPrice.asset"
                          :price="cashPrice.sell_price"
                          :minAmount="cashPrice.min_amount"
                          :maxAmount="cashPrice.max_amount"
                          :submitFn="data=>create(data,2)"/>
    </div>
    <div class="content tips">
      <h2 class="font-red h2">{{$t('tips')}}</h2>
      <p v-for="(p,i) in tips"
         class="p"
         :key="i"
         v-html="p"></p>
    </div>
    <!--<my-order class="content"/>-->
  </page-container>
  <page-container v-else class="container-inner exchange-cash"/>
</template>

<script>
// import MyOrder from 'components/client/MyOrder'
import { mapActions, mapGetters, mapState } from 'vuex'
import ExchangeCashForm from '../../components/ExchangeCashForm/ExchangeCashForm'

export default {
  name: 'ExchangeCash',
  beforeMount() {
    if (this.siteInfo.c2cEnabled) {
      this.getCashPrice().catch(this.snackBar.error)
    } else this.snackBar.error(this.$t('c2c.disabled'))
  },
  data() {
    return {}
  },
  computed: {
    ...mapState('exchange', ['cashPrice']),
    ...mapGetters(['siteInfo']),
    tips() {
      return this.$t('exchange.tip').split('\n')
    },
  },
  methods: {
    ...mapActions('exchange', ['getCashPrice', 'exchangeCash']),
    create(data, type) {
      return this.exchangeCash({ ...data, type }).then((res) => {
        this.snackBar.info(`${this.$t(type === 1 ? 'buy' : 'sell')}: ${this.$t('order.success')}`)
        return res
      })
    },
  },
  components: { ExchangeCashForm },
}
</script>
