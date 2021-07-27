<template>
  <div v-if="assets" class="currency-account">
    <template v-if="$currencyVal">
      <div class="convert">
        <div v-for="(item,i) in convertItems"
             class="item"
             :key="i">
          <span class="value">{{c2ThousandsCount(myAssets[item.alias].toFixed(2))}}</span>
          <p class="name">{{item.name}}(<span class="unit">{{item.unit}}</span>)
          </p>
        </div>
      </div>
      <tab-head v-model="tab" :options="tabOptions" />
      <check-box checkboxSize=".26rem"
                 :name="$t('assets.zero.hide')"
                 :value="hideZero?'checked':''"
                 :icons="{default: 'icon-checkbox-un',
                          checked: 'icon-checkbox font-green'}"
                 @input="hideZero=!!$event" />
    </template>
    <br>
    <my-table v-if="tab===tabOptions[0].value"
              :heads="heads"
              :data="showAssets"
              :searching="searching"
              :sort="false"
              @error="error">
      <template v-for="(item,i) in showAssets"
                :slot="i+'-'+(heads.length-1)">
        <template v-if="siteInfo.otcEnabled && otcAssets.includes(item.name)">
          <button class="btn-1"
                  :key="i+'tr'"
                  @click="transfer(item)">{{$t('otc.assets.transfer')}}
          </button>
        </template>
        <button class="btn-1"
                :class="item.recharge_status?'btn-green-fill':'btn-gray-fill'"
                :key="i+'green'"
                @click="item.recharge_status?click(item, 'deposit'):''">
          {{$t('asset.deposit')}}
        </button>
        <button class="btn-1"
                :class="item.withdraw_status?'btn-red-fill':'btn-gray-fill'"
                :key="i+'red'"
                @click="item.withdraw_status?click(item, 'withdraw'):''">
          {{$t('asset.withdraw')}}
        </button>
      </template>
    </my-table>
    <doughnut-chart v-else class="charts" :data="assets" />
    <overlay-confirm v-if="modal&&modal.type==='confirm'"
                     :tipText="modal.title"
                     :confirmText="modal.conformText"
                     @close="modal.rej()"
                     @cancel="modal.rej()"
                     @confirm="modal.res()" />
    <my-overlay v-if="modal&&modal.type==='transfer'"
                :head="modal.title"
                @close="modal.rej()">
      <span class="tip">{{$t('otc.assets.transfer.tip', modal.asset)}}</span>
      <my-input v-for="item in modal.items"
                v-model="item.value"
                type="1"
                :item="item"
                :key="item.alias"
                @btnClick="setMax()"
      />
      <btn-once class="submit btn-green-fill" :clickFn="modal.res">
        {{$t('submit')}}
      </btn-once>
    </my-overlay>
  </div>
</template>

<script>
import MyInput from 'components/client/MyInput'
import MyOverlay from 'components/client/MyOverlay'
import DoughnutChart from 'components/client/user-center/DoughnutChart'
import TabHead from 'components/client/user-center/TabHead'
import { dataDeal } from 'utils/DataDeal'
import { mapActions, mapGetters, mapState } from 'vuex'

// 币账户
export default {
  name: 'CurrencyAccount',
  components: { TabHead, DoughnutChart, MyInput, MyOverlay },
  data() {
    const formatter = (item, alias) => this.c2ThousandsCount(this.numTrim(item[alias],
      item.precision))
    return {
      tab: '',
      heads: [
        { name: 'coin', alias: 'name', style: { textAlign: 'left' } },
        {
          name: 'balance.avail',
          alias: 'available',
          style: { textAlign: 'left' },
          formatter,
        },
        {
          name: 'balance.exchange-frozen',
          alias: 'freeze',
          style: { textAlign: 'left' },
          formatter,
        },
        {
          name: 'balance.other-frozen',
          alias: 'other_freeze',
          style: { textAlign: 'left' },
          formatter,
        },
        {
          name: 'balance.all',
          alias: 'total',
          style: { textAlign: 'left' },
          formatter,
        },
        { name: 'action', style: { width: '20%', textAlign: 'right' } },
      ],
      modal: null,
      searching: false,
      hideZero: false,
    }
  },
  computed: {
    ...mapState('user', {
      info: 'info',
      coins: state => state.assets,
    }),
    ...mapState('exchange', ['anchorCoin']),
    ...mapState('market', ['foreignOtcAssets']),
    ...mapGetters(['siteInfo']),
    otcAssets() {
      return this.foreignOtcAssets.map(asset => asset.asset_code)
    },
    assets() {
      return Object.keys(this.coins)
        .map((k) => {
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
    showAssets() {
      if (this.hideZero) return this.assets.filter(v => +v.total)
      return this.assets
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
    tabOptions() {
      return [
        {
          name: this.$t('coin') + this.$t('details'),
          value: 'table',
          needTran: false,
        },
        {
          name: this.$t('coin') + this.$t('distribution'),
          value: 'chart',
          needTran: false,
        },
      ]
    },
  },
  watch: {
    tabOptions: {
      handler() {
        if (!this.tab) this.tab = this.tabOptions[0].value
      },
      immediate: true,
    },
  },
  methods: {
    ...mapActions('user', ['getAssets', 'transferToOtc']),
    ...mapActions('market', ['getSymbols', 'listenPrices', 'listenPricesUnsubscribe', 'getForeignOtcAssets']),
    click(item, type) {
      if (this.siteInfo.is_preaudit && !this.info.identity_authenticated) {
        this.modal = {
          type: 'confirm',
          title: this.$t('unauthorized.tip'),
          conformText: this.$t('authorize'),
          res: () => this.$router.push('/user-center/security/certification'),
          rej: () => {
            this.modal = null
          },
        }
      } else if (type === 'deposit') {
        this.$router.push(`/user-center/assets-manage/deposit?coin=${item.name}`)
      } else {
        this.$router.push(`/user-center/assets-manage/withdraw?coin=${item.name}`)
      }
    },
    transfer(asset) {
      // if (!this.info.withdraw_password_set) {
      //   this.modal = {
      //     type: 'confirm',
      //     title: this.$t('password.fund.unset.tip'),
      //     conformText: this.$t('set'),
      //     res: () => this.$router.push('/user-center/security/set-password-fund'),
      //     rej: () => {
      //       this.modal = null
      //     },
      //   }
      // } else {
      this.modal = {
        type: 'transfer',
        title: `${this.$t('otc.assets.transfer')}`,
        asset,
        items: [
          {
            name: 'otc.assets.transfer.amount',
            alias: 'amount',
            btnText: 'all',
            value: '',
            preFormatter(val) {
              const reg = /^(\d*\.)?\d*$/
              return reg.test(val) ? val : val.slice(0, val.length - 1)
            },
          },
          // {
          //   name: 'password.fund',
          //   alias: 'withdraw_password',
          //   inputType: 'password',
          //   value: '',
          //   preFormatter: strTrimAll,
          // },
        ],
        res: () => this.validate(this.modal.items)
          .then(() => this.transferToOtc({
            asset: asset.name,
            ...dataDeal(this.modal.items),
          }))
          .then(() => {
            this.snackBar.info(this.$t('otc.transfer-out.success'))
            this.modal = null
          }),
        rej: () => {
          this.modal = null
        },
      }
      // }
    },
    setMax() {
      if (this.modal && this.modal.asset) {
        this.$set(this.modal.items[0], 'value', this.modal.asset.available)
      }
    },
  },
  beforeMount() {
    this.searching = true
    this.getAssets().catch(this.snackBar.error).then(() => {
      this.searching = false
    })
    this.getForeignOtcAssets().catch(this.snackBar.error)
    this.getSymbols().then(() => {
      this.listenPrices()
    }).catch(this.snackBar.error)
  },
  beforeDestroy() {
    this.listenPricesUnsubscribe()
  },
}
</script>
