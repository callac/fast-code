<template>
  <section class="exchange-form">
    <h2 class="symbol-name">{{symbolInfo.symbol1}}</h2>
    <div class="symbol-prices">
      <div
        v-for="item in prices"
        :key="item.alias"
        class="price"
      >
        <span class="name">{{$t(item.name)}}</span>
        <span
          class="value"
          v-html="item.formatter?item.formatter(symbolInfo, item.alias):symbolInfo[item.alias]"
        ></span>
      </div>
    </div>
    <div class="form">
      <tab v-model="type" :options="tabOptions"/>
      <my-input
        type="1"
        v-model="items[0].value"
        :item="items[0]"
      />
      <button
        class="btn-switch-form-type btn-main"
        @click="switchFormType"
      >{{$t(formType.text)}}
      </button>
      <my-input
        type="1"
        v-model="items[1].value"
        :item="items[1]"
      />
      <div class="total">&asymp; {{total}} {{symbolInfo.quote_asset}}</div>
      <btn-once
        class="btn-submit btn-main-fill"
        :clickFn="submit"
      >{{$t('sipc.exchange.coin')}}
      </btn-once>
    </div>
    <overlay-confirm v-if="modal"
                     :tipText="$t('unauthorized.tip')"
                     :confirmText="$t('authorize')"
                     @close="modal.rej()"
                     @cancel="modal.rej()"
                     @confirm="$router.push('/user-center/security/certification')"/>
  </section>
</template>

<script>
import MyInput from 'components/client/MyInput'
import Tab from 'components/client/Tab'
import { dataDeal } from 'utils/DataDeal'
import { posFixedNumber } from 'utils/InputFormatter'
import { mapActions, mapGetters, mapState } from 'vuex'
import messages from './ExchangeForm.msg'

const icons = {
  up: require('../../assets/icon-up.png'),
  down: require('../../assets/icon-down.png'),
}

const types = {
  limit: {
    value: 'limit',
    text: 'sipc.exchange.market',
  },
  market: {
    value: 'market',
    text: 'sipc.exchange.limit',
  },
}

export default {
  name: 'Form',
  i18n: { messages },
  components: { Tab, MyInput },
  props: {
    price: [Number, String],
    precision: Object,
  },
  data() {
    return {
      prices: [
        {
          name: 'last-price',
          alias: 'last',
          formatter: (item, alias) => {
            const rate = `${(item.rate || 0) > 0 ? '+' : ''}${(item.rate || 0).toFixed(2)}%`
            const color = this.getColor(item.rate)
            return `<span class="last ${color}">
                      ${item[alias]}
                    </span>
                    ${color ? `<img class="icon" src="${color === 'font-green' ? icons.up : icons.down}" alt="icon">` : ''}
                    <span class="rate ${color}">${rate}</span>
                    <span class="ex">${this.$cEx(this.$exPrice(item, alias))}</span>`
          },
        },
        { name: 'max-price', alias: 'high' },
        { name: 'min-price', alias: 'low' },
        { name: '24h-vol', alias: 'volume' },
      ],
      type: 'buy',
      items: [
        {
          name: 'price',
          alias: 'price',
          value: '',
          unit: '',
          canEdit: true,
          defaultVal: 'sipc.exchange.by.market-price',
          labelStyle: { width: '.6rem' },
          preFormatter: this.priceFormat,
        },
        {
          name: 'amount',
          alias: 'amount',
          value: '',
          unit: '',
          labelStyle: { width: '.6rem' },
          preFormatter: this.amountFormat,
        },
      ],
      modal: null,
      formType: {
        value: 'limit',
        text: 'sipc.exchange.market',
      },
    }
  },
  computed: {
    ...mapGetters(['siteInfo']),
    ...mapState('market', ['symbols']),
    ...mapState('user', ['assets', 'info']),
    $_precision() {
      return {
        price: 8,
        amount: 8,
        total: 8,
        ...this.precision,
      }
    },
    symbol() {
      return this.$route.query.symbol || ''
    },
    symbolInfo() {
      return {
        ...this.symbols[this.symbol],
        symbol1: this.symbol.replace('_', '/'),
      }
    },
    balance() {
      return this.button === 'sell' ? this.coin : this.base
    },
    balanceVal() {
      return this.numTrim((this.assets[this.balance] && this.assets[this.balance].available) || 0,
        this.precision || 8)
    },
    tabOptions() {
      return [
        {
          name: this.$t('sipc.exchange.coin') + this.symbolInfo.base_asset,
          value: 'buy',
          needTran: false,
        },
        {
          name: this.$t('sipc.exchange.coin') + this.symbolInfo.quote_asset,
          value: 'sell',
          needTran: false,
        },
      ]
    },
    total() {
      return (this.items[0].value * this.items[1].value || 0).toFixed(this.$_precision.total)
    },
  },
  watch: {
    price: {
      handler() {
        this.setItems()
      },
      immediate: true,
    },
    symbolInfo: {
      handler(newVal, oldVal = {}) {
        if (
          newVal.quote_asset !== oldVal.quote_asset
          || newVal.base_asset !== oldVal.base_asset
        ) {
          this.setItems()
        }
      },
      immediate: true,
    },
    formType: {
      handler() {
        this.setItems()
      },
      immediate: true,
    },
  },
  methods: {
    ...mapActions('exchange', ['tradeLimit', 'tradeByMarket']),
    switchFormType() {
      if (this.formType.value === 'limit') this.formType = types.market
      else this.formType = types.limit
    },
    setItems() {
      if (this.formType.value === 'limit') {
        this.items[0].value = this.price || ''
        this.items[0].canEdit = true
      } else {
        this.items[0].value = ''
        this.items[0].canEdit = false
      }
      this.items[0].unit = this.symbolInfo.quote_asset
      this.items[0].defaultVal = this.$t('sipc.exchange.by.market-price')
      this.items[0].name = this.$t('price')
      this.items[0].needTran = false
      this.items[1].unit = this.symbolInfo.base_asset
    },
    submit() {
      if (!this.info.id) {
        this.$router.push(`/sign-in?redirectTo=${this.$route.fullPath}`)
      }
      if (this.siteInfo.is_preaudit && !this.info.identity_authenticated) {
        return new Promise((res, rej) => {
          this.modal = { res, rej }
        }).catch((e) => {
          if (!e) this.modal = null
        })
      }
      return this.validate(this.formType.value === 'limit' ? this.items : this.items.slice(1))
        .then(() => {
          const market = this.symbol
          const side = this.type === 'buy' ? 2 : 1
          const data = { market, side, ...dataDeal(this.items) }
          return (
            this.formType.value === 'limit'
              ? this.tradeLimit(data)
              : this.tradeByMarket(data)
          )
            .then(() => {
              this.snackBar.info(this.$t('order.success'))
              this.items[1].value = ''
            })
        })
    },
    priceFormat(val) {
      return posFixedNumber(this.$_precision.price)(val)
    },
    amountFormat(val) {
      return posFixedNumber(this.$_precision.amount)(val)
    },
  },
}
</script>
