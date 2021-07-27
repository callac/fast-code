<template>
  <page-container v-if="siteInfo.otcEnabled" class="container-inner otc"
                  :title="$t('otc.title')">
    <section class="content tabs">
      <div v-for="(t, i) in tabOptions"
           class="tab"
           :class="{selected: tab === t.value}"
           :key="i"
           @click="tab=t.value">
        {{$t(t.name)}}
        <span class="asset">{{asset}}</span>
      </div>
    </section>
    <section class="content merchants">
      <div class="prices">
        <div v-for="(item, i) in priceItems"
             class="item"
             :key="i">
          {{$t(item.name)}}:
          <span class="price" v-html="item.formatter(otcPrice, item.alias)"></span>
        </div>
      </div>
      <!--<div class="filters">-->
      <!--{{$t('otc.filters.pay-type')}}:-->
      <!--<check-box v-for="p in payTypes"-->
      <!--checkboxSize=".26rem"-->
      <!--:name="$t(p.name)"-->
      <!--:key="p.value"-->
      <!--:value="payType.has(p.value)?'checked':''"-->
      <!--:icons="icons"-->
      <!--@input="payTypeSwitch(p.value)"/>-->
      <!--</div>-->
      <div class="table">
        <div class="tr tr-h">
          <div v-for="m in merchantItems"
               class="th"
               :style="m.style"
               :key="m.name">{{$t(m.name)}}
          </div>
        </div>
        <div v-for="d in otcMerchants"
             class="tr tr-b"
             :class="{selected: selectedMerchant && d.id === selectedMerchant.id}"
             :key="d.id">
          <div v-if="selectedMerchant&&d.id===selectedMerchant.id" class="form">
            <my-input type="1"
                      :item="count"
                      v-model="count.value"
                      @btnClick="setMax()"
                      @keyboardInput="setValue('count', $event)"/>
            <span class="iconfont icon-money"></span>
            <my-input type="1"
                      :item="amount"
                      v-model="amount.value"
                      @keyboardInput="setValue('amount', $event)"/>
            <btn-once class="btn-2"
                      :class="tabObj.btnClass"
                      :useLoading="true"
                      :clickFn="submit">
              {{$t(tabObj.btnText)}}
            </btn-once>
            <button class="btn-2 btn-gray-fill"
                    @click="selectedMerchant=null">
              {{$t('cancel-1')}}
            </button>
          </div>
          <template v-for="m in merchantItems">
            <div v-if="m.alias"
                 class="td"
                 :style="m.style"
                 :key="d.id+'-'+m.name"
                 v-html="m.formatter(d, m.alias)">
            </div>
            <div v-else
                 class="td"
                 :style="m.style"
                 :key="d.id+'-'+m.name">
              <button v-if="!selectedMerchant||d.id!==selectedMerchant.id"
                      class="btn-1"
                      :class="tabObj.btnClass"
                      @click="selectedMerchant = d">
                {{$t(tabObj.btnText)}}
              </button>
            </div>
          </template>
        </div>
        <no-result v-if="otcMerchants.length<1" :tipText="$t('otc.merchant.no')"/>
      </div>
      <pagination :config="merchantPageConfig" @to="merchantPageConfig.page=$event"/>
    </section>
    <section v-if="info.id" class="content orders">
      <tab-head v-model="orderTab" :options="orderTabOptions"/>
      <my-table :sort="false" :heads="orderItems" :data="otcOrders">
        <router-link v-for="(o, i) in otcOrders"
                     class="link"
                     :to="'/otc/'+o.id"
                     :slot="i+'-'+(orderItems.length-1)"
                     :key="o.id">{{$t('details-1')}}
        </router-link>
      </my-table>
      <pagination :config="orderPageConfig" @to="orderPageConfig.page=$event"/>
    </section>
    <section class="content tips">
      <h3 class="title">{{$t('otc.tips.title')}}:</h3>
      <p v-for="(t, i) in tips"
         v-html="t"
         class="p"
         :key="i"></p>
    </section>
    <overlay-confirm v-if="modal && modal.type === 'unauthorized'"
                     :tipText="$t('unauthorized.tip')"
                     @close="modal.rej()"
                     @cancel="modal.rej()"
                     @confirm="modal.res()"/>
    <overlay-confirm v-else-if="modal && modal.type === 'unbind'"
                     :tipText="$t('otc.pay-type.unbind.tip')"
                     @close="modal.rej()"
                     @cancel="modal.rej()"
                     @confirm="modal.res()"/>
    <overlay-confirm v-else-if="modal && modal.type === 'unset'"
                     :tipText="$t('password.fund.unset.tip')"
                     @close="modal.rej()"
                     @cancel="modal.rej()"
                     @confirm="modal.res()"/>
    <!--<my-overlay v-else-if="modal && modal.type==='success'"-->
    <!--class="success-overlay"-->
    <!--:head="$t('otc.submit.success')"-->
    <!--@close="modal.rej()">-->
    <!--<template v-if="tabObj.btnText === 'buy-1'">-->
    <!--<span class="tip" v-html="expireTimeTip"></span>-->
    <!--<span class="tip" v-html="countDown"></span>-->
    <!--</template>-->
    <!--<span v-else class="tip"-->
    <!--v-html="$t('otc.submit.success.tip.sell',-->
    <!--{coin: '<span class=\'font-red\' style=\'font-size:inherit\'>'-->
    <!--+modal.order.amount+' '+asset+'</span>'})">-->
    <!--</span>-->
    <!--<div class="btns">-->
    <!--<router-link class="btn btn-go btn-main"-->
    <!--:to="'/otc/'+modal.order.order_no">-->
    <!--{{tabObj.btnText==='buy-1'?$t('otc.order.pay'):$t('otc.order.view')}}-->
    <!--</router-link>-->
    <!--<button class="btn btn-back"-->
    <!--@click="modal.rej">{{$t('back')}}-->
    <!--</button>-->
    <!--</div>-->
    <!--</my-overlay>-->
    <my-overlay v-else-if="modal"
                :head="$t(tabObj.btnText)"
                @close="modal.rej()">
      <div class="form">
        <my-input v-for="item in extraItems"
                  type="1"
                  v-model="item.value"
                  :key="item.alias"
                  :item="item"/>
      </div>
      <btn-once class="btn-submit"
                :class="tabObj.btnClass"
                :clickFn="modal.res">{{$t('submit')}}
      </btn-once>
    </my-overlay>
  </page-container>
  <page-container v-else class="container-inner otc"/>
</template>

<script>
import MyInput from 'components/client/MyInput'
import MyOverlay from 'components/client/MyOverlay'
import TabHead from 'components/client/user-center/TabHead'
import Status from 'data/immutable-data/Status'
import { dataDeal } from 'utils/DataDeal'
import { posFixedNumber, posIntFormatter } from 'utils/InputFormatter'
import Singleton from 'utils/Singleton'
import { mapActions, mapGetters, mapState } from 'vuex'

const tabOptions = Object.freeze({
  1: { name: 'otc.tab.buy', btnText: 'buy-1', btnClass: 'btn-green-fill', value: '1' },
  2: { name: 'otc.tab.sell', btnText: 'sell-1', btnClass: 'btn-red-fill', value: '2' },
})
const formatter = (item, alias) => item[alias] || 0
const payType = Object.keys(Status.otcPayType)
  .reduce((pre, k) => pre.add(Status.otcPayType[k].value), new Set())
const icons = Object.freeze({
  default: 'icon-checkbox-un',
  checked: 'icon-checkbox font-green',
})

const orderTabOptions = Object.freeze([
  { name: 'otc.order.all', value: '-1' },
  { name: 'otc.order.un-completed', value: Status.otcOrderStatus[8].value },
  { name: 'otc.order.completed', value: Status.otcOrderStatus[7].value },
  { name: 'otc.order.cancel', value: Status.otcOrderStatus[4].value },
])

const infinity = '0001-01-01T00:00:00Z'

export default {
  name: 'Otc',
  components: { MyInput, TabHead, MyOverlay },
  data() {
    return {
      tab: '1',
      tabOptions,
      orderTab: '-1',
      orderTabOptions,
      icons,
      payType: new Set(payType),
      payTypes: Status.otcPayType,
      priceItems: [
        { name: 'otc.price.last', alias: 'last', formatter },
        {
          name: 'otc.price.rate',
          alias: 'rateC',
          formatter: (item, alias) => {
            const value = +item[alias] || 0
            return `<span class="${this.getColor(value)}">${value > 0 ? '+' : ''}${value}%</span>`
          },
        },
        { name: 'otc.price.high', alias: 'high', formatter },
        { name: 'otc.price.low', alias: 'low', formatter },
      ],
      merchantItems: [
        {
          name: 'otc.merchant.name',
          alias: 'name',
          formatter: (item, alias) => {
            const value = item[alias]
            return `<img src="${require('assets/client/exchange/avatar-merchant.jpg')}">${value}`
          },
        },
        { name: 'otc.merchant.tick-count', alias: 'finished_count', formatter },
        { name: 'otc.merchant.price', alias: 'priceC', formatter },
        { name: 'otc.merchant.asset-count', alias: 'assetCount', formatter },
        { name: 'otc.merchant.limit', alias: 'limit', formatter },
        {
          name: 'otc.merchant.pay-type',
          alias: 'payType',
          formatter: (item, alias) => item[alias].reduce((pre, t) => `${pre}<img src="${t.icon}">`, ''),
        },
        { name: 'action' },
      ],
      orderItems: [
        { name: 'otc.order.id', alias: 'id', formatter },
        {
          name: 'otc.order.type',
          alias: 'type',
          formatter: (item, alias) => `<span class="${+item[alias] === 1 ? 'font-green' : 'font-red'}">${this.$t(tabOptions[item[alias]].btnText)}</span>`,
        },
        { name: 'otc.order.price', alias: 'priceC', formatter },
        { name: 'otc.order.count', alias: 'countC', formatter },
        { name: 'otc.order.amount', alias: 'amountC', formatter },
        { name: 'otc.order.merchant-name', alias: 'merchantName', formatter },
        { name: 'otc.order.create-time', alias: 'createdAt', formatter },
        {
          name: 'otc.order.status',
          alias: 'statusObj',
          formatter: (item, alias) => this.$t(item[alias].name),
        },
        { name: '' },
      ],
      merchantPageConfig: this.initPageConfig(),
      orderPageConfig: this.initPageConfig(),
      selectedMerchant: null,
      count: null,
      amount: null,
      pay: '',
      modal: null,
      countDown: '',
      extraItems: [],
    }
  },
  computed: {
    ...mapState('user', ['info', 'myPayTypes']),
    ...mapState('exchange', ['otcPrice', 'otcMerchants', 'otcOrders']),
    ...mapGetters(['siteInfo']),
    asset() {
      return this.otcPrice.asset || this.siteInfo.otc_asset || ''
    },
    currency() {
      return this.otcPrice.currency || this.siteInfo.otc_currency || ''
    },
    tabObj() {
      return tabOptions[this.tab] || {}
    },
    tips() {
      return this.$t('otc.tips.content').split('\n')
    },
    expireTimeTip() {
      if (this.modal && this.modal.order) {
        const expireTime = this.modal.order.expire_time
        if (!expireTime || expireTime === infinity) return this.$t('otc.submit.success.tip-1')
        return this.$t('otc.submit.success.tip', {
          time: `<span class='font-red' style='font-size:inherit'>${this.dateFormatter(this.modal.order.expire_time)}</span>`,
        })
      }
      return ''
    },
  },
  watch: {
    'asset': {
      handler() {
        if (this.siteInfo.otcEnabled) {
          this.initForm()
          this.getPrice()
        } else this.snackBar.error(this.$t('otc.disabled'))
      },
      immediate: true,
    },
    'currency': {
      handler() {
        this.initForm()
        this.getPrice()
      },
      immediate: false,
    },
    'payType': {
      handler() {
        this.getMerchants()
      },
      immediate: false,
    },
    'tab': {
      handler() {
        this.merchantPageConfig = this.initPageConfig()
        this.orderPageConfig = this.initPageConfig()
        this.getMerchants()
      },
      immediate: false,
    },
    'orderTab': {
      handler() {
        this.getOrders()
      },
      immediate: false,
    },
    'merchantPageConfig.page': {
      handler() {
        this.getMerchants()
      },
      immediate: false,
    },
    'orderPageConfig.page': {
      handler() {
        this.getOrders()
      },
      immediate: false,
    },
    selectedMerchant(val) {
      if (val) this.initForm()
    },
  },
  methods: {
    ...mapActions('exchange', [
      'getOtcPrice',
      'getOtcMerchants',
      'getMyOtcOrders',
      'exchangeOtc',
    ]),
    ...mapActions('user', ['getMyPayTypes', 'getUserInfo']),
    initPageConfig() {
      return {
        pages: 1,
        page: 1,
        pageSize: 10,
      }
    },
    initForm() {
      const type = +this.tab === 1 ? 'buy' : 'sell'
      this.count = {
        id: 'count',
        value: '',
        placeholder: `otc.${type}.form.count.placeholder`,
        btnText: 'all',
        preFormatter(val) {
          const reg = /^\d*$/
          return reg.test(val) ? val : val.slice(0, val.length - 1)
        },
      }
      this.amount = {
        id: 'amount',
        value: '',
        placeholder: `otc.${type}.form.amount.placeholder`,
        unit: this.currency,
        preFormatter(val) {
          const reg = /(^\d+\.\d{0,2}$)|(^\d+$)/
          return reg.test(val) ? val : val.slice(0, val.length - 1)
        },
      }
    },
    getPrice() {
      return Singleton.promise(() => this.getOtcPrice({
        asset: this.asset,
        currency: this.currency,
      }).then(() => {
        this.getMerchants()
        this.getOrders()
      }), 'getOtcPrice')
    },
    getMerchants() {
      this
        .getOtcMerchants({
          asset: this.asset,
          currency: this.currency,
          type: this.tab,
          // payMethod: [...this.payType.values()],
          payMethod: '',
          ...this.pageC(this.merchantPageConfig),
        })
        .then((res) => {
          this.merchantPageConfig.pages = Math.ceil(res.total / this.merchantPageConfig.pageSize)
        })
        .catch(this.snackBar.error)
    },
    getOrders() {
      (this.info.id ? Promise.resolve() : this.getUserInfo())
        .then(() => this.getMyOtcOrders({
          asset: this.asset,
          currency: this.currency,
          status: this.orderTab,
          ...this.pageC(this.orderPageConfig),
        }))
        .then((res) => {
          this.orderPageConfig.pages = Math.ceil(res.total / this.orderPageConfig.pageSize)
        })
        .catch(this.snackBar.error)
    },
    payTypeSwitch(val) {
      const exist = this.payType.has(val)
      if (!(exist && this.payType.size < 2)) {
        if (exist) {
          this.payType.delete(val)
        } else {
          this.payType.add(val)
        }
        this.payType = new Set(this.payType)
      } else {
        this.snackBar.warn(this.$t('otc.pay-type.chose-tip'))
      }
    },
    setValue(type, val) {
      if (this.selectedMerchant) {
        if (type === 'count') {
          this.$set(this.amount, 'value', val ? posFixedNumber(2)(this.selectedMerchant.price * val) : '')
        } else {
          this.$set(this.count, 'value', val ? posIntFormatter(val / this.selectedMerchant.price) : '')
        }
      }
    },
    setMax() {
      this.count.value = this.selectedMerchant.amount
      this.setValue('count', this.selectedMerchant.amount)
    },
    getExtraItems() {
      const items = []
      if (this.tab === '2') {
        items.push({
          id: 'pay-type',
          name: 'otc.sell.pay-type.chose',
          value: '',
          alias: 'payType',
          inputType: 'select',
          options: this.myPayTypes,
        })
      }
      if (this.info.withdraw_password_set) {
        items.push({
          id: 'fund',
          name: 'password.fund',
          value: '',
          alias: 'withdraw_password',
          inputType: 'password',
        })
      }
      this.$set(this, 'extraItems', items)
    },
    submit() {
      if (!this.info.id) {
        this.$router.push(`/sign-in?redirectTo=${this.$route.path}`)
        return Promise.resolve()
      }
      if (!this.info.identity_authenticated) {
        return new Promise((res, rej) => {
          this.setModal({
            type: 'unauthorized',
            res: () => this.$router.push('/user-center/security/certification'),
            rej,
          })
        })
      }
      if (!this.info.withdraw_password_set) {
        return new Promise((res, rej) => {
          this.setModal({
            type: 'unset',
            res: () => this.$router.push('/user-center/security/set-password-fund'),
            rej,
          })
        })
      }
      return new Promise((res, rej) => {
        if (!this.count.value) {
          this.snackBar.error(`${this.$t(this.count.placeholder)}: ${this.$t('required')}`)
          rej()
        } else {
          (this.tab === '2'
            ? this.getMyPayTypes()
              .then(() => new Promise((res1, rej1) => {
                if (this.myPayTypes.length < 1) {
                  this.setModal({
                    type: 'unbind',
                    res: () => this.$router.push('/user-center/security/pay-set'),
                    rej,
                  })
                  rej1()
                } else res1()
              }))
            : Promise.resolve())
            .then(() => {
              this.getExtraItems()
              if (this.extraItems.length > 0) {
                this.setModal({
                  res,
                  rej,
                })
              } else res()
            })
            .catch(rej)
        }
      })
        .then(() => this.validate(this.extraItems))
        .then(() => this.exchangeOtc({
          type: this.tab,
          payType: this.pay,
          count: this.count.value,
          merchant_account_id: this.selectedMerchant.id,
          ...dataDeal(this.extraItems),
        }))
        .then((order = {}) => {
          // this.setModal({
          //   type: 'success',
          //   order,
          //   rej,
          // })
          // this.$on('hook:beforeDestroy', rej)
          // this.getMerchants()
          // this.getOrders()
          this.snackBar.info(this.$t('otc.order.created'))
          const { order_no } = order
          this.$router.push(`/otc/${order_no}`)
        })
    },
    setModal(info = {}) {
      this.modal = {
        ...info,
        res: () => {
          this.modal = null
          if (info.res) {
            return Promise.resolve(info.res())
          }
          return Promise.resolve()
        },
        rej: () => {
          this.modal = null
          if (info.rej) {
            info.rej()
          }
        },
      }
    },
    getCountDown(val) {
      this.countDown = parseInt(val, 10)
        ? `${this.$t('count-down')}: <span class='font-red' style='font-size:inherit'>${val}</span>`
        : `<span class='font-red'>${this.$t('expired')}</span>`
    },
  },
}
</script>
