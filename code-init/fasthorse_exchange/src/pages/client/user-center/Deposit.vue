<template>
  <page-container class="user-content deposit" :title="$t('asset.manage')">
    <tab-head v-model="tab.value" :options="tab.options"/>
    <deposit-pin/>
  </page-container>
</template>

<script>
import DepositPin from 'components/client/user-center/DepositPin'
import TabHead from 'components/client/user-center/TabHead'

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
    }
  },
  methods: {},
  components: { TabHead, DepositPin },
}
</script>
