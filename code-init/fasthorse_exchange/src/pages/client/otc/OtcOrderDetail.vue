<template>
  <page-container class="container-inner otc-order-detail"
                  :title="$t('otc.order.title')">
    <section class="content">
      <router-link class="back" to="/otc">&lt; {{$t('otc.exchange.back')}}</router-link>
      <div class="order">
        <h1 class="h1">
          <span v-html="orderStatus.name"></span>
          <template v-if="orderStatus.statusTip">
            <span v-if="countDown"
                  class="tip"
                  v-html="$t(orderStatus.statusTip, {countDown})"></span>
            <span v-else-if="status.value===4"
                  class="tip"
                  v-html="$t(orderStatus.statusTip, {time: updateTime})"></span>
            <span v-else-if="!(status.value===1&&type===1)"
                  class="tip">{{$t(orderStatus.statusTip)}}</span>
          </template>
        </h1>
        <div class="left">
          <section class="section">
            <h2 class="h2">{{$t('otc.order.info')}}
              <span class="symbol">( {{order.asset}} / {{order.currency}} )</span>
            </h2>
            <div class="wrap table">
              <div v-for="item in showItems"
                   class="item"
                   :key="item.alias">
                <span class="label">{{$t(item.name)}}:</span>
                <span class="value"
                      :class="{[item.alias]:true, 'font-red':item.alias==='amountC'}"
                      v-html="item.formatter(order,item.alias)"></span>
              </div>
            </div>
          </section>
          <section class="section">
            <template v-if="payTypes.length||status.value===4">
              <h2 v-if="type===1" class="h2">
                <template v-if="status.value===1">
                  {{$t('otc.order.seller.pay-type.chose')}}
                </template>
                <template v-else>
                  {{$t('otc.order.seller.pay-type')}}
                </template>
                <!--<span v-if="status.value!==4" class="merchant-info">-->
                <!--( {{$t('otc.merchant.name')}}：-->
                <!--{{order.merchantName}} - {{order.merchantPhone}} )-->
                <!--</span>-->
              </h2>
              <h2 v-else class="h2">{{$t('otc.order.me.pay-type')}}</h2>
            </template>
            <div v-if="status.value!==4" class="wrap">
              <div v-for="p in payTypes"
                   class="pay-type"
                   :key="p.type"
                   @click="type===1&&status.value===1?pay = p:''">
                <check-box v-if="type===1&&status.value===1"
                           checkboxSize=".26rem"
                           :value="pay.id===p.id?'checked':''"
                           :icons="icons"
                           @input="pay = p"/>
                <img class="icon" :src="p.typeInfo.icon" :alt="$t(p.typeInfo.name)">
                <h3 class="type-name">{{$t(p.typeInfo.name)}}</h3>
                <span class="type-value">{{p.name}}</span>
                <span class="account">{{p.subName}}</span>
                <div v-if="p.type!==0" class="qrcode">
                  <img alt="qrcode" class="qrcode-min" :src="require('assets/qrcode.jpg')">
                  <img alt="qrcode" class="qrcode-origin" :src="p.value">
                </div>
                <span v-else class="value">{{p.value}}</span>
              </div>
            </div>
            <div v-else class="wrap">
              <span class="pay-type-hide">{{$t('otc.order.pay-type.hide')}}</span>
            </div>
          </section>
          <div class="btn-group">
            <button v-if="type===1 && status.value===1" class="btn btn-green-fill"
                    @click="set('confirm')">{{$t('otc.order.paid.submit')}}
            </button>
            <button v-if="type===1 && status.value===3" class="btn btn-green-fill"
                    @click="set('success')">{{$t('otc.order.buy.completed.submit')}}
            </button>
            <button v-if="type===2 && status.value===3" class="btn btn-green-fill"
                    @click="set('success')">{{$t('otc.order.sell.completed.submit')}}
            </button>
            <button v-if="status.value===1" class="btn btn-cancel"
                    @click="set('cancel')">{{$t('otc.order.cancel.submit')}}
            </button>
            <button v-if="status.value===4" class="btn btn-end btn-gray-fill">
              {{$t('otc.order.canceled')}}
            </button>
            <button v-if="status.value===7" class="btn btn-end btn-gray-fill">
              {{$t('otc.order.succeed')}}
            </button>
          </div>
        </div>
        <section class="tips">
          <h3 class="title">{{$t('otc.tips.title')}}:</h3>
          <p v-for="(t, i) in tips"
             v-html="t"
             class="p"
             :key="i"></p>
        </section>
      </div>
    </section>
    <overlay-confirm v-if="modal"
                     :tipText="modal.tip"
                     :cancelText="$t('back')"
                     @close="modal.rej()"
                     @cancel="modal.rej()"
                     @confirm="modal.res()"/>
  </page-container>
</template>

<script>
import Status from 'data/immutable-data/Status'
import { OrderCountDown } from 'utils/OrderCountDown'
import { mapActions, mapState } from 'vuex'

const icons = Object.freeze({
  default: 'icon-checkbox-un',
  checked: 'icon-checkbox font-green',
})

const infinity = '0001-01-01T00:00:00Z'

const formatter = (item, alias) => item[alias]
export default {
  name: 'OtcOrderDetail',
  data() {
    return {
      icons,
      pay: '',
      order: {},
      items: [
        {
          name: 'otc.order.type',
          alias: 'type',
          formatter: (item, alias) => {
            const value = +item[alias]
            if (value === 1) {
              return `<span class="font-green">${this.$t('buy-1')}</span>`
            }
            return `<span class="font-red">${this.$t('sell-1')}</span>`
          },
        },
        { name: 'otc.order.id', alias: 'id', formatter },
        { name: 'otc.merchant.name', alias: 'merchantName', formatter },
        { name: 'otc.merchant.phone', alias: 'merchantPhone', formatter },
        { name: 'otc.order.price', alias: 'priceC', formatter },
        { name: 'otc.order.count', alias: 'countC', formatter },
        { name: 'otc.order.amount', alias: 'amountC', formatter },
        {
          name: 'otc.order.remark',
          alias: 'user_id',
          formatter: (item, alias) => `${item[alias]} <span class="unit">(${this.$t('otc.order.remark.tip')})</span>`,
        },
      ],
      modal: null,
      countDown: '',
    }
  },
  computed: {
    ...mapState(['deltaTime']),
    id() {
      return this.$route.params.id
    },
    type() {
      return +this.order.type
    },
    status() {
      return this.order.statusObj || {}
    },
    updateTime() {
      return this.dateFormatter(this.order.update_time)
    },
    orderStatus() {
      const name = `${this.$t('order-1')}: <span class="status-${this.status.value}">${this.$t(this.status.name)}</span>`
      let statusTip = ''
      if (this.status.value === 1) {
        if (this.type === 1) {
          statusTip = 'otc.order.buy.left-time'
        } else {
          statusTip = 'otc.order.sell.wait'
        }
      } else if (this.status.value === 2 || this.status.value === 5) {
        if (this.type === 1) {
          statusTip = 'otc.order.buy.processing'
        } else {
          statusTip = 'otc.order.sell.processing'
        }
      } else if (this.status.value === 4) {
        statusTip = 'otc.order.canceled.tip'
      }
      return {
        name,
        statusTip,
      }
    },
    showItems() {
      const { order: { type }, items, items: { length } } = this
      return +type === 1 ? items : items.slice(0, length - 1)
    },
    payTypes() {
      return (this.order.merchantPayTypes || []).map(p => ({
        ...p,
        typeInfo: Status.otcPayType[p.type] || {},
      }))
    },
    tips() {
      return this.$t('otc.tips.content').split('\n')
    },
  },
  watch: {
    id: {
      handler() {
        this.getOrder()
      },
      immediate: true,
    },
    order: {
      handler(val) {
        if (val && val.order_no
          && +val.type === 1
          && +val.status === 1
          && (val.expire_time && val.expire_time !== infinity)) {
          this.getDeltaTime().then(() => {
            OrderCountDown.bind(val.expire_time, this.getCountDown, this.deltaTime)
          })
          this.$on('hook:beforeDestroy', () => {
            OrderCountDown.unbind(val.expire_time, this.getCountDown)
          })
        }
      },
      immediate: true,
    },
  },
  methods: {
    ...mapActions(['getDeltaTime']),
    ...mapActions('exchange', ['getOtcOrderDetails', 'otcUpdate']),
    getOrder() {
      if (this.id) {
        this.getOtcOrderDetails(this.id)
          .then((res) => {
            this.order = res
          })
          .catch(this.snackBar.error)
      }
    },
    update(action) {
      if (this.type === 1 && this.status.value === 1 && !this.pay && action !== 'cancel') {
        this.snackBar.error(this.$t('otc.order.update.pay-type.tip'))
      } else {
        this
          .otcUpdate({
            order_no: this.id,
            action,
            pay_method: this.pay.type,
            pay_method_id: this.pay.id,
          })
          .then(() => {
            if (action === 'cancel') this.snackBar.info(this.$t('otc.order.cancel.success'))
            else this.snackBar.info(this.$t(`otc.order.${this.type === 1 ? 'buy' : 'sell'}.${action === 'confirm' ? 'confirm' : 'completed'}.success`))
            this.getOrder()
          })
          .catch(this.snackBar.error)
      }
    },
    set(type) {
      let tip = ''
      if (type === 'confirm') {
        tip = this.$t('otc.order.paid.tip')
      } else if (type === 'cancel') {
        tip = this.$t('otc.order.cancel.tip')
      } else if (this.type === 1) {
        tip = this.$t('otc.order.buy.completed.tip')
      } else {
        tip = this.$t('otc.order.sell.completed.tip')
      }
      this.setModal({
        type,
        tip,
        res: () => this.update(type),
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
      if (parseInt(val, 10)) {
        this.countDown = `${this.$t('count-down')}: <span class='font-red' style='font-size:inherit'>${val}</span>`
      } else {
        this.getOrder()
      }
    },
  },
}
</script>
