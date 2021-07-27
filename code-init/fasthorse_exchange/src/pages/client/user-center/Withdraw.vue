<template>
  <page-container class="user-content withdraw" :title="$t('asset.manage')">
    <tab-head v-model="tab.value" :options="tab.options"/>
    <withdraw-pin/>
  </page-container>
</template>

<script>
import TabHead from 'components/client/user-center/TabHead'
import WithdrawPin from 'components/client/user-center/WithdrawPin'

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
    }
  },
  methods: {},
  components: { TabHead, WithdrawPin },
}
</script>
