<template>
  <page-container class="sipc-content assets-manage" :title="$t('asset.manage')">
    <h1 class="content page-head">{{$t('asset.manage')}}</h1>
    <div class="content-wrap-1">
      <tab-head v-model="tab" :options="tabOptions"/>
      <currency-account v-if="tab===tabOptions[0].value"/>
      <token-statement v-if="tab===tabOptions[1].value"/>
      <address-manage v-if="tab===tabOptions[2].value"/>
    </div>
  </page-container>
</template>

<script>
import TabHead from 'components/client/user-center/TabHead'
import messages from './AssetsManage.msg'
import AddressManage from './components/AddressManage/AddressManage'
import CurrencyAccount from './components/CurrencyAccount/CurrencyAccount'
import TokenStatement from './components/TokenStatement/TokenStatement'

export default {
  name: 'AssetsManage',
  components: { TabHead, CurrencyAccount, AddressManage, TokenStatement },
  i18n: { messages },
  data() {
    return {
      tab: this.$route.query.type || 'currency',
    }
  },
  computed: {
    tabOptions() {
      return [
        { name: this.$t('account.currency'), value: 'currency', needTran: false },
        { name: this.$t('token.statement'), value: 'tokenStatement', needTran: false },
        { name: this.$t('asset.withdraw.address.manage'), value: 'addressManage', needTran: false },
      ]
    },
  },
  watch: {
    'tab.value'(val) {
      this.$router.push(`${this.$route.path}?type=${val}`)
    },
    '$route'(to) {
      if (this.tab.value !== to.query.type) {
        this.tab.value = to.query.type || 'currency'
      }
    },
  },
  methods: {},
}
</script>
