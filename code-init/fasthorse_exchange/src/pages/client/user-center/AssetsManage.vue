<template>
  <page-container class="user-content assets-manage" :title="$t('asset.manage')">
    <tab-head v-model="tab.value" :options="tab.options"/>
    <currency-account v-if="tab.value===tab.options[0].value"/>
    <token-statement v-if="tab.value===tab.options[1].value"/>
    <address-manage v-if="tab.value===tab.options[2].value"/>
  </page-container>
</template>

<script>
import AddressManage from 'components/client/user-center/AddressManage'
import CurrencyAccount from 'components/client/user-center/CurrencyAccount'
import TabHead from 'components/client/user-center/TabHead'
import TokenStatement from 'components/client/user-center/TokenStatement'

export default {
  name: 'AssetsManage',
  data() {
    return {
      tab: {
        value: this.$route.query.type || 'currency',
        options: [
          { name: 'account.currency', value: 'currency' },
          { name: 'token.statement', value: 'tokenStatement' },
          { name: 'asset.withdraw.address.manage', value: 'addressManage' },
        ],
      },
    }
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
  components: { TabHead, CurrencyAccount, AddressManage, TokenStatement },
}
</script>
