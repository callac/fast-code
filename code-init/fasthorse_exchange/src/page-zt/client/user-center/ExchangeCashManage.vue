<template>
  <page-container class="user-content exchange-cash-manage" :title="$t('c2c')">
    <div class="assets-manager-title">{{$t('c2c')}}</div>
    <my-order/>
  </page-container>
</template>

<script>
import MyOrder from '../../components/MyOrder/MyOrder'

export default {
  name: 'ExchangeCashManage',
  data() {
    return {}
  },
  components: { MyOrder },
}
</script>
