<template>
  <page-container class="user-content deposit" :title="$t('asset.manage')">
    <nav-head :nav="nav"></nav-head>
    <tab-head v-model="tab.value" :options="tab.options"/>
    <deposit-pin/>
  </page-container>
</template>

<script>
import DepositPin from '@/page-zt/components/user-center/DepositPin'
import TabHead from '@/page-zt/components/user-center/TabHead'
import NavHead from '@/page-zt/components/user-center/NavHead'

export default {
  name: 'Deposit',
  data() {
    return {
      tab: {
        value: 'deposit',
        options: [
          { name: 'asset.deposit', value: 'deposit' },
        ],
      },
      nav: {
        value: 1,
        options: [
          { name: this.$t('asset.manage'), url: '/user-center/assets-manage' },
          { name: this.$t('asset.deposit'), url: '' },
        ],
      },
    }
  },
  methods: {},
  components: { TabHead, DepositPin, NavHead },
}
</script>
