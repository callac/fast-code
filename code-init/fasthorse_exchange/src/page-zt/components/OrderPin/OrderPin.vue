<template>
  <transition name="fade-enter">
    <section class="order-pin">
      <!--<h2>-->
      <!--<span v-for="(h,i) in heads" :key="i">-->
        <!--{{h.name==='time'?dateFormatter(order[h.alias]):order[h.alias]}}-->
      <!--</span>-->
      <!--</h2>-->
      <div class="wrap">
        <h3 :class="type.name==='sell-1'?'font-red':'font-green'">
          {{$t(type.name)}}<br>{{order.coin}}</h3>
        <p class="order-num">{{order['order_no']}}</p>
        <p class="time">{{dateFormatter(order['UpdatedAt'])}}</p>
        <div class="money">
          <span class="total"><span
            class="unit">{{totalAmount.unit}}</span>{{totalAmount.amount}}</span><br>
          <span v-for="(h,i) in heads1" :key="i">
          <span class="name">{{$t(h.name)}}:</span> {{order[h.alias]}}<br></span>
        </div>
        <div class="payee">
          <template v-for="(h,i) in heads2">
            <div v-if="order[h.alias]" class="item" :key="i">
              <span class="name">{{$t(h.name)}}:</span>
              <span>{{ellipsis(order[h.alias]||'', 20)}}</span>
              <span v-if="h.copy" class="fuzhi"
                      @click="copy(order[h.alias])"><i class="iconfont icon-fuzhi-copy"></i>
              </span>
            </div>
          </template>
        </div>
        <div class="status-wrap">
          <template v-if="status.name==='pay.wait'">
            <div class="btn-group">
              <button v-if="type.name==='buy-1'" class="btn-status btn-orange" @click="paid">
                {{$t('confirm-paid')}}
              </button>
              <button class="btn-status btn-cancel" @click="cancel">
                {{$t('cancel')}}
              </button>
            </div>
            <div v-if="countDown" class="left">
              <span class="iconfont icon-clock font-red"></span>
              <span class="font-red">{{$t('count-down')}}: {{countDown}}</span>
            </div>
          </template>
          <span v-else class="status" :class="status.name==='completed-1'?'font-green':'font-red'">
        {{$t(status.name)}}</span>
        </div>
      </div>
      <overlay-confirm v-if="showOverlay"
                       :tipText="showOverlay.type==='cancel'
                                ?$t('sure')+$t('cancel')+$t('ma'):$t('paid.confirm.tip')"
                       @close="showOverlay.rej()" @cancel="showOverlay.rej()"
                       @confirm="showOverlay.res()"/>
    </section>
  </transition>
</template>

<script>
import Status from 'data/immutable-data/Status'
import { OrderCountDown } from 'utils/OrderCountDown'
import { copyText } from 'utils/Utils'
import { mapActions, mapState } from 'vuex'

// 单个C2C订单信息组件
export default {
  name: 'OrderPin',
  beforeDestroy() {
    OrderCountDown.unbind(this.order.expire_time, this.getCountDown)
  },
  props: {
    order: {
      default() {
        return {}
      },
      type: Object,
    },
  },
  data() {
    return {
      heads: [
        { alias: 'order_no' },
        { alias: 'UpdatedAt' },
      ],
      heads1: [
        { name: 'price', alias: 'price' },
        { name: 'amount', alias: 'amount' },
        { name: 'commission', alias: 'fee' },
        { name: 'real.amount', alias: 'real_amount' },
      ],
      showOverlay: null,
      countDown: '',
    }
  },
  computed: {
    ...mapState(['deltaTime']),
    type() {
      return Status.cashOrderType[this.order.type]
    },
    heads2() {
      return [
        { name: this.type.name === 'sell-1' ? 'payer' : 'payee', alias: 'merchant_name' },
        { name: 'phone', alias: 'merchant_phone' },
        { name: 'bank', alias: 'merchant_bank' },
        { name: 'bank.branch', alias: 'merchant_sub_bank' },
        { name: 'bank.card', alias: 'merchant_card_number', copy: true },
        { name: 'verify.code-1', alias: 'remark', copy: true },
      ]
    },
    payType() {
      return Status.payType[this.order.pay_method] || {}
    },
    status() {
      return Status.cashOrderStatus[this.order.status] || {}
    },
    totalAmount() {
      const { total_amount, unit } = this.order || {}
      const u = unit || total_amount.replace(/[.\d]/g, '') || '￥'
      return { unit: u, amount: total_amount.replace(unit, '') }
    },
  },
  watch: {
    order: {
      handler(val) {
        if (this.type.name !== 'sell-1' && val && val.status === 1) {
          const { expire_time } = val
          OrderCountDown.unbind(expire_time, this.getCountDown)
          this.getDeltaTime().then(() => {
            OrderCountDown.bind(expire_time, this.getCountDown, this.deltaTime)
          })
        }
      },
      immediate: true,
    },
  },
  methods: {
    ...mapActions(['getDeltaTime']),
    ...mapActions('exchange', ['cancelCashOrder', 'confirmCashOrder', 'getCashOrders']),
    copy(text) {
      copyText(text)
        .then(val => this.snackBar.info(this.$t(val)))
        .catch(e => this.snackBar.error(this.$t(e)))
    },
    cancel() {
      new Promise((res, rej) => {
        this.showOverlay = {
          type: 'cancel',
          rej,
          res: () => this.cancelCashOrder(this.order.ID)
            .then(res).catch(this.snackBar.error),
        }
      }).then(() => {
        this.snackBar.info(this.$t('canceled'))
        this.showOverlay = null
        this.$emit('refresh')
      }).catch((e) => {
        if (!e) this.showOverlay = null
      })
    },
    paid() {
      new Promise((res, rej) => {
        this.showOverlay = {
          type: 'confirm',
          rej,
          res: () => this.confirmCashOrder(this.order.ID)
            .then(res).catch(this.snackBar.error),
        }
      }).then(() => {
        this.snackBar.info(this.$t('sure') + this.$t('success'))
        this.showOverlay = null
        this.$emit('refresh')
      }).catch((e) => {
        if (!e) this.showOverlay = null
      })
    },
    getCountDown(val) {
      this.countDown = val
      if (this.countDown === '00') {
        this.getCashOrders({ status: 1 }).catch(this.snackBar.error)
      }
    },
  },
}
</script>
