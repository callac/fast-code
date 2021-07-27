<template>
  <page-container class="user-content withdraw" :title="$t('asset.manage')">
    <nav-head :nav="nav"></nav-head>
    <tab-head v-model="tab.value" :options="tab.options"/>
    <withdraw-pin/>
  </page-container>
</template>

<script>
import TabHead from '@/page-zt/components/user-center/TabHead'
import WithdrawPin from '@/page-zt/components/user-center/WithdrawPin'
import NavHead from '@/page-zt/components/user-center/NavHead'

export default {
  name: 'Withdraw',
  data() {
    return {
      tab: {
        value: 'withdraw',
        options: [
          { name: 'asset.withdraw', value: 'withdraw' },
        ],
      },
      nav: {
        value: 1,
        options: [
          { name: this.$t('asset.manage'), url: '/user-center/assets-manage' },
          { name: this.$t('asset.withdraw'), url: '' },
        ],
      },
    }
  },
  methods: {},
  components: { TabHead, WithdrawPin, NavHead },
}
</script>
