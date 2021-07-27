<template>
  <page-container class="user-content exchange-cash-manage" :title="$t('exchange.cash')">
    <my-order/>
  </page-container>
</template>

<script>
import MyOrder from 'components/client/MyOrder'

export default {
  name: 'ExchangeCashManage',
  data() {
    return {}
  },
  components: { MyOrder },
}
</script>
