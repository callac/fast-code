<template>
  <div v-if="assets" class="currency-account">
    <!--<div class="convert">-->
    <!--<div v-for="(item,i) in convertItems" class="item" :key="i">-->
    <!--<span class="value">{{c2ThousandsCount(myAssets[item.alias].toFixed(2))}}</span>-->
    <!--<p class="name">{{item.name}}(<span class="unit">{{item.unit}}</span>)</p>-->
    <!--</div>-->
    <!--</div>-->
    <!--<h2 class="h2">{{$t('coin')}}{{$t('details')}}</h2>-->
    <check-box checkboxSize=".26rem"
               :name="$t('assets.driblet.hide')"
               :value="hideZero?'checked':''"
               :icons="{default: 'icon-checkbox-un',
                          checked: 'icon-checkbox font-blue'}"
               @input="hideZero=!!$event" />
    <my-table :heads="heads" :data="showAssets" ref="table"
              :searching="searching" :sort="false" @error="error">
      <template v-for="(item,i) in showAssets" :slot="i+'-'+(heads.length-1)">
        <template v-if="siteInfo.otcEnabled && otcAssets.includes(item.name)">
          <button class="btn"
                  :key="i+'tr'"
                  @click="transfer(item)">{{$t('otc.assets.transfer')}}
          </button>
        </template>
        <button class="btn"
                :class="item.recharge_status?'':'btn-disabled'"
                :key="i+'green'"
                @click="item.recharge_status?click(item, 'deposit'):''">
          {{$t('asset.deposit')}}
        </button>
        <button class="btn"
                :class="item.withdraw_status?'':'btn-disabled'"
                :key="i+'red'"
                @click="item.withdraw_status?click(item, 'withdraw'):''">
          <!--{{!(+item.available)&&+item.withdraw_freeze
          ?$t('asset.withdraw.record'):$t('asset.withdraw')}}-->
          {{$t('asset.withdraw')}}
        </button>
      </template>
    </my-table>
    <overlay-confirm v-if="showOverlay" :tipText="$t('unauthorized.tip')"
                     :confirmText="$t('authorize')" @close="showOverlay.rej()"
                     @cancel="showOverlay.rej()"
                     @confirm="$router.push('/user-center/security/certification')"/>
    <!--未注册OTC提示-->
    <overlay-confirm v-if="modal&&modal.type==='confirm'"
                     :tipText="modal.title"
                     :confirmText="modal.conformText"
                     @close="modal.rej()"
                     @cancel="modal.rej()"
                     @confirm="modal.res()"/>
    <!--otc转出-->
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
// import TabHead from 'components/client/user-center/TabHead'
import MyInput from 'components/client/MyInput'
import MyOverlay from 'components/client/MyOverlay'
import { mapActions, mapGetters, mapState } from 'vuex'
import { dataDeal } from 'utils/DataDeal'

export default {
  name: 'CurrencyAccount',
  components: { MyInput, MyOverlay },
  data() {
    return {
      tab: '',
      showOverlay: null,
      searching: false,
      modal: null,
      hideZero: false,
    }
  },
  computed: {
    ...mapState('user', {
      info: 'info',
      coins: state => state.assets,
    }),
    ...mapState(['headers']),
    ...mapState('exchange', ['anchorCoin']),
    ...mapState('market', ['foreignOtcAssets']),
    ...mapGetters(['siteInfo']),
    ...mapGetters('market', ['symbolsArr']),
    unit() {
      return this.$currencyObj.unit
    },
    heads() {
      const formatter = (item, alias) => this.c2ThousandsCount(this.numTrim(item[alias],
        item.precision))
      return [
        { name: 'coin', alias: 'name', style: { textAlign: 'center' } },
        { name: 'balance.avail', alias: 'available', style: { textAlign: 'center' }, formatter },
        {
          name: 'balance.exchange-frozen',
          alias: 'freeze',
          style: { textAlign: 'center' },
          formatter,
        },
        {
          name: 'balance.other-frozen',
          alias: 'other_freeze',
          style: { textAlign: 'center' },
          formatter,
        },
        { name: 'balance.all', alias: 'total', style: { textAlign: 'center' }, formatter },
        { name: `${this.$t('convert-into')}(${this.unit})`, alias: 'cTotal', style: { textAlign: 'center' }, formatter },
        { name: 'action', style: { width: '24%', textAlign: 'right' } },
      ]
    },
    otcAssets() {
      return this.foreignOtcAssets.map(asset => asset.asset_code)
    },
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
        // const convert = this.$exAmount(total, { base_asset: k }, toFixed)
        const cTotal = this.$exAmount(total, { base_asset: k }, toFixed)
        return {
          ...this.coins[k],
          total,
          cA,
          cF,
          cO,
          cTotal,
          // convert,
          name: k,
        }
      })
    },
    showAssets() {
      if (this.hideZero) {
        if (this.$currencyObj.value === 'CNY') {
          return this.assets.filter(v => Number(v.cTotal) >= 10)
        }
        return this.assets.filter(v => Number(v.cTotal) >= 1)
      }
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
        { name: this.$t('coin') + this.$t('details'), value: 'table', needTran: false },
        { name: this.$t('coin') + this.$t('distribution'), value: 'chart', needTran: false },
      ]
    },
    OTCLink() {
      let url = ''
      try {
        url = this.headers.find(label_name => label_name === 'OTC').api_url;
      } catch (e) {
        url = `/otc-web/${this.$i18n.locale}/`;
      }
      return url
    },
  },
  watch: {
    tabOptions: {
      handler() {
        if (!this.tab) this.tab = this.tabOptions[0].value
      },
      immediate: true,
    },
    // unit() {
    //   console.log(this.$refs.table)
    // },
  },
  methods: {
    ...mapActions('user', ['getAssets', 'transferToOtc', 'checkUser']),
    ...mapActions('market', ['getSymbols', 'listenPrices', 'listenPricesUnsubscribe', 'getForeignOtcAssets']),
    click(item, type) {
      if (this.siteInfo.is_preaudit && !this.info.identity_authenticated) {
        new Promise((res, rej) => {
          this.showOverlay = { res, rej }
        }).catch((e) => {
          if (!e) this.showOverlay = null
        })
      } else if (type === 'deposit') {
        this.$router.push(`/user-center/assets-manage/deposit?coin=${item.name}`)
      } else {
        this.$router.push(`/user-center/assets-manage/withdraw?coin=${item.name}`)
      }
    },
    transfer(asset) {
      this.checkUser()
        .then((res) => {
          if (!res.exist) {
            // otc未注册
            this.modal = {
              type: 'confirm',
              title: this.$t('otc.no.sign-up'),
              conformText: this.$t('sign-up'),
              res: () => window.open(this.OTCLink),
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
          }
        })
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
