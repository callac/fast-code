<template>
  <div v-if="assets" class="currency-account">
    <template v-if="$currencyVal">
      <div class="convert">
        <div v-for="(item,i) in convertItems"
             class="item"
             :key="i">
          <span class="name">{{item.name}}</span>
          <span class="value-sipc">
            {{item.toSIPC(myAssets[item.alias])}}
            <span class="unit">SIPC</span>
          </span>
          <span class="value">
            &asymp;{{item.unit}}{{c2ThousandsCount(myAssets[item.alias].toFixed(2))}}
          </span>
        </div>
      </div>
      <check-box checkboxSize=".26rem"
                 :name="$t('assets.zero.hide')"
                 :value="hideZero?'checked':''"
                 :icons="{default: 'icon-checkbox-sipc',
                          checked: 'icon-checkbox-checked-sipc'}"
                 @input="hideZero=!!$event"/>
    </template>
    <br>
    <my-table
      :heads="heads"
      :data="showAssets"
      :searching="searching"
      :sort="false"
      @error="error"
    >
      <template v-for="(item,i) in showAssets"
                :slot="i+'-'+(heads.length-1)">
        <template v-if="siteInfo.otcEnabled && otcAssets.includes(item.name)">
        <button class="btn-1"
        :key="i+'tr'"
        @click="transfer(item)">{{$t('otc.assets.transfer')}}
        </button>
        </template>
        <button class="btn-1"
                :class="item.recharge_status?'font-blue':'font-gray'"
                :key="i+'green'"
                @click="item.recharge_status?click(item, 'deposit'):''">
          {{$t('asset.deposit')}}
        </button>
        <button class="btn-1"
                :class="item.withdraw_status?'font-blue':'font-gray'"
                :key="i+'red'"
                @click="item.withdraw_status?click(item, 'withdraw'):''">
          {{$t('asset.withdraw')}}
        </button>
      </template>
    </my-table>
    <overlay-confirm v-if="modal&&modal.type==='confirm'"
                     :tipText="modal.title"
                     :confirmText="modal.conformText"
                     @close="modal.rej()"
                     @cancel="modal.rej()"
                     @confirm="modal.res()"/>
    <!--<my-overlay v-if="modal&&modal.type==='transfer'"-->
    <!--:head="modal.title"-->
    <!--@close="modal.rej()">-->
    <!--<span class="tip">{{$t('otc.assets.transfer.tip', modal.asset)}}</span>-->
    <!--<my-input v-for="item in modal.items"-->
    <!--v-model="item.value"-->
    <!--type="1"-->
    <!--:item="item"-->
    <!--:key="item.alias"-->
    <!--@btnClick="setMax()"-->
    <!--/>-->
    <!--<btn-once class="submit btn-green-fill" :clickFn="modal.res">{{$t('submit')}}</btn-once>-->
    <!--</my-overlay>-->
  </div>
</template>

<script>
import { dataDeal } from 'utils/DataDeal'
import { strTrimAll } from 'utils/Utils'
import { mapActions, mapGetters, mapState } from 'vuex'
import messages from './CurrencyAccount.msg'

export default {
  name: 'CurrencyAccount',
  i18n: { messages },
  data() {
    return {
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
    ...mapGetters(['siteInfo', 'otcAssets']),
    heads() {
      const formatter = (item, alias) => this.c2ThousandsCount(
        this.numTrim(item[alias], item.precision),
      )
      return [
        { name: 'asset', alias: 'name', style: { textAlign: 'left' } },
        { name: 'balance.avail', alias: 'available', style: { textAlign: 'left' }, formatter },
        {
          name: this.$t('balance.exchange-frozen'),
          alias: 'freeze',
          style: { textAlign: 'left' },
          formatter,
          needTran: false,
        },
        {
          name: 'balance.other-frozen',
          alias: 'other_freeze',
          style: { textAlign: 'left' },
          formatter,
        },
        { name: 'balance.all', alias: 'total', style: { textAlign: 'left' }, formatter },
        { name: 'action', style: { width: '20%', textAlign: 'right' } },
      ]
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
        const { cTotal: cT } = item1
        return {
          total: cT ? pre.total.plus(cT) : pre.total,
        }
      }, {
        total: this.bigNum(0),
      })
    },
    convertItems() {
      return [
        {
          name: this.$t('assets.convert-to'),
          alias: 'total',
          unit: this.$currencyObj.unit,
          toSIPC: val => this.c2ThousandsCount((val * this.$exPrice({ base_asset: 'SIPC' })).toFixed(2)),
        },
      ]
    },
  },
  methods: {
    ...mapActions('user', ['getAssets', 'transferToOtc']),
    ...mapActions('market', ['getSymbols', 'listenPrices', 'listenPricesUnsubscribe']),
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
      if (!this.info.withdraw_password_set) {
        this.modal = {
          type: 'confirm',
          title: this.$t('password.fund.unset.tip'),
          conformText: this.$t('set'),
          res: () => this.$router.push('/user-center/security/set-password-fund'),
          rej: () => {
            this.modal = null
          },
        }
      } else {
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
            {
              name: 'password.fund',
              alias: 'withdraw_password',
              inputType: 'password',
              value: '',
              preFormatter: strTrimAll,
            },
          ],
          res: () => this.validate(this.modal.items)
            .then(() => this.transferToOtc({
              coin_id: asset.name,
              ...dataDeal(this.modal.items),
            })),
          rej: () => {
            this.modal = null
          },
        }
      }
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
    this.getSymbols().then(() => {
      this.listenPrices()
    }).catch(this.snackBar.error)
  },
  beforeDestroy() {
    this.listenPricesUnsubscribe()
  },
}
</script>
