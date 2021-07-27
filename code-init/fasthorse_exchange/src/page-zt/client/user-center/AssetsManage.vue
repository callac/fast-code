<template>
  <page-container class="user-content assets-manage" :title="$t('asset.manage')">
    <div class="assets-manager-title">{{$t('asset.manage')}}</div>
    <div class="my-capital">
      <p class="capital-title">{{$t('asset.my')}}</p>
      <div class="convert">
        <div v-for="(item,i) in convertItems" class="item" :key="i">
          <span class="value">{{c2ThousandsCount(myAssets[item.alias].toFixed(2))}}</span>
          <p class="name">{{item.name}}(<span class="unit">{{item.unit}}</span>)</p>
        </div>
      </div>
    </div>
    <tab-head v-model="tab.value" :options="tab.options"/>
    <currency-account v-if="tab.value===tab.options[0].value"/>
    <token-statement v-if="tab.value===tab.options[1].value"/>
    <address-manage v-if="tab.value===tab.options[2].value"/>
    <doughnut-chart v-if="tab.value===tab.options[3].value" :data="chartAssets"/>
  </page-container>
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex'
import AddressManage from '../../components/user-center/AddressManage'
import CurrencyAccount from '../../components/user-center/CurrencyAccount'
import TabHead from '../../components/user-center/TabHead'
import TokenStatement from '../../components/user-center/TokenStatement'
import DoughnutChart from '../../components/user-center/DoughnutChart'

export default {
  name: 'AssetsManage',
  beforeMount() {
    this.searching = true
    this.getAssets().catch(this.snackBar.error).then(() => {
      this.searching = false
    })
  },
  data() {
    return {
      tab: {
        value: this.$route.query.type || 'currency',
        options: [
          { name: 'account.details', value: 'currency' },
          { name: 'token.records', value: 'tokenStatement' },
          { name: 'asset.withdraw.address.manage', value: 'addressManage' },
          { name: this.$t('token.distributions'), value: 'doughnutChart' },
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
  computed: {
    ...mapState('user', {
      info: 'info',
      coins: state => state.assets,
    }),
    ...mapState('exchange', ['anchorCoin']),
    ...mapState(['siteInfo']),
    ...mapGetters('market', ['symbolsArr']),
    assets() {
      return Object.keys(this.coins).map((k) => {
        const { available, freeze, other_freeze } = this.coins[k]
        const total = this.bigNum(this.coins[k].available)
          .plus(this.coins[k].freeze)
          .plus(this.coins[k].other_freeze)
          .toString()
        const toFixed = 2
        const cA = this.$exAmount(available, { base_asset: k }, toFixed)
        const cF = this.$exAmount(freeze, { base_asset: k }, toFixed)
        const cO = this.$exAmount(other_freeze, { base_asset: k }, toFixed)
        const cTotal = this.$exAmount(total, { base_asset: k }, toFixed)
        return {
          ...this.coins[k],
          total,
          cA,
          cF,
          cO,
          cTotal,
          name: k,
        }
      })
    },
    myAssets() {
      return this.assets.reduce((pre, item1) => {
        const { cA, cF, cO } = item1
        return {
          available: cA ? pre.available.plus(cA) : pre.available,
          freeze: cF ? pre.freeze.plus(cF) : pre.freeze,
          other_freeze: cO ? pre.other_freeze.plus(cO) : pre.other_freeze,
        }
      }, {
        available: this.bigNum(0),
        freeze: this.bigNum(0),
        other_freeze: this.bigNum(0),
      })
    },
    chartAssets() {
      return Object.keys(this.coins).map((k) => {
        const { available, freeze, other_freeze } = this.coins[k]
        const total = this.bigNum(this.coins[k].available)
          .plus(this.coins[k].freeze)
          .plus(this.coins[k].other_freeze)
          .toString()
        const toFixed = 2
        const cA = this.$exAmount(available, { base_asset: k }, toFixed)
        const cF = this.$exAmount(freeze, { base_asset: k }, toFixed)
        const cO = this.$exAmount(other_freeze, { base_asset: k }, toFixed)
        const cTotal = this.$exAmount(total, { base_asset: k }, toFixed)
        return {
          ...this.coins[k],
          total,
          cA,
          cF,
          cO,
          cTotal,
          name: k,
        }
      })
    },
    convertItems() {
      return [
        {
          name: this.$t('balance.avail') + this.$t('convert-into'),
          alias: 'available',
          unit: this.$currencyObj.unit,
        },
        {
          name: this.$t('balance.exchange-frozen') + this.$t('convert-into'),
          alias: 'freeze',
          unit: this.$currencyObj.unit,
        },
        {
          name: this.$t('balance.other-frozen') + this.$t('convert-into'),
          alias: 'other_freeze',
          unit: this.$currencyObj.unit,
        },
      ]
    },
  },
  methods: {
    ...mapActions('user', ['getAssets']),
  },
  components: { TabHead, CurrencyAccount, AddressManage, TokenStatement, DoughnutChart },
}
</script>
