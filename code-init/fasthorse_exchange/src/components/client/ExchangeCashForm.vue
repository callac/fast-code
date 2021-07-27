<template>
  <div class="exchange-cash-form">
    <h2 class="h2" :class="{sell:type!=='buy'}">{{title}}{{coin}}</h2>
    <div class="forms">
      <my-input v-for="(item,i) in showItems" :value="item.value" @input="input(+i, $event)"
                type="1" :item="item" :key="i"/>
      <btn-once class="submit" :class="type==='buy'?'btn-green-fill':'btn-red-fill'"
                :useLoading="true" :clickFn="submit">
        {{$t('sure')}}{{title}}
        {{type==='buy'?'CNY -> '+coin:coin+' -> CNY'}}
      </btn-once>
    </div>
    <overlay-confirm
      v-if="showOverlay&&showOverlay.type==='unauthorized'"
      :tipText="$t('unauthorized.tip')"
      @close="showOverlay.rej()"
      @cancel="showOverlay.rej()"
      @confirm="showOverlay.res()"
    />
    <overlay-confirm
      v-else-if="showOverlay&&showOverlay.type==='unbind'"
      :tipText="$t('bank.card.unbind.tip')"
      @close="showOverlay.rej()"
      @cancel="showOverlay.rej()"
      @confirm="showOverlay.res()"
    />
    <my-overlay
      v-else-if="showOverlay&&showOverlay.type==='chooseBank'"
      :head="$t('bank.card.choose')"
      @close="showOverlay.rej()"
    >
      <my-input type="1" :value="card.value" :item="card"
                @input="$set(card, 'value', $event);$forceUpdate()"/>
      <button class="submit" :class="type==='sell'?'btn-red-fill':'btn-green-fill'"
              @click="showOverlay.res()">
        {{$t('sure')+$t(type)}}
      </button>
    </my-overlay>
    <my-overlay
      v-else-if="showOverlay&&showOverlay.type==='op-confirm'"
      :head="title+$t('info')"
      @close="showOverlay.rej()"
    >
      <div class="wrap">
        <div class="money">
        <span v-for="(h,i) in heads" :key="i" class="item">
          <span class="name">{{$t(h.name)}} ({{h.name==='amount'?coin:'CNY'}})</span>
          <span class="value">{{showOverlay.order[h.alias]}}</span></span>
        </div>
        <div class="payee">
        <span v-for="(h,i) in heads1" class="item" :key="i">
          <span class="name">{{$t(h.name)}}</span>
          <span class="value" :id="h.name">{{showOverlay.order[h.alias]}}</span>
          <button v-if="h.copy" class="btn"
                  @click="copy(h.name)">{{$t('copy')}}</button>
        </span>
        </div>
      </div>
      <!--<btn-once class="btn-green-fill btn-sure"
                :clickFn="showOverlay.res">{{$t('sure')}}</btn-once>-->
      <template v-if="type==='buy'">
        <span class="tip" v-html="expireTimeTip"></span>
        <span class="tip" v-html="countDown"></span>
      </template>
      <span v-else class="tip"
            v-html="$t('transfer.tip.sell',
              {coin: '<span class=\'font-red\' style=\'font-size:inherit\'>'
                      +showOverlay.order.amount+coin+'</span>'})">
      </span>
      <div v-if="type==='buy'" class="btn-group">
        <button class="btn-red-fill" @click="showOverlay.rej()">{{$t('window.close')}}</button>
        <btn-once class="btn-green-fill" :clickFn="paid">{{$t('sure')}}{{$t('paid')}}</btn-once>
      </div>
    </my-overlay>
    <overlay-confirm
      v-if="showOverlay1"
      :tipText="$t('paid.confirm.tip')"
      @close="showOverlay1.rej()"
      @cancel="showOverlay1.rej()"
      @confirm="showOverlay1.res()"
    />
  </div>
</template>

<script>
import MyInput from 'components/client/MyInput'
import MyOverlay from 'components/client/MyOverlay'
import Status from 'data/immutable-data/Status'
import { dataDeal } from 'utils/DataDeal'
import { posFixedNumber } from 'utils/InputFormatter'
import { OrderCountDown } from 'utils/OrderCountDown'
import { copyDom } from 'utils/Utils'
import { mapActions, mapState } from 'vuex'

const infinity = '0001-01-01T00:00:00Z'

// C2C 交易表单
export default {
  name: 'ExchangeCashForm',
  components: { MyInput, MyOverlay },
  props: {
    coin: String,
    type: {
      default: 'buy',
      type: String,
    },
    submitFn: {
      default: () => Promise.resolve(),
      type: Function,
    },
    minAmount: [String, Number],
    maxAmount: [String, Number],
    price: [String, Number],
  },
  data() {
    const isMobile = typeof window !== 'undefined' ? window.isMobile : false
    return {
      showOverlay: null,
      showOverlay1: null,
      items: [
        {
          name: 'price',
          alias: 'price',
          value: this.price,
          unit: 'CNY',
          canEdit: false,
          addTitle: 'price',
        },
        {
          name: 'amount',
          alias: 'amount',
          value: '',
          preFormatter: posFixedNumber(2),
          unit: this.coin,
          addTitle: 'amount',
          requiredInPage: false,
        },
        {
          name: 'total',
          alias: 'total',
          value: '',
          preFormatter: posFixedNumber(2),
          unit: 'CNY',
          requiredInPage: false,
        },
        {
          name: this.type === 'buy' ? 'pay.type' : 'pay.type-1',
          alias: 'type',
          value: 'bank',
          inputType: 'select',
          options: Object.keys(Status.payType).map(k => ({
            ...Status.payType[k],
            name: isMobile ? this.$t(Status.payType[k].name)
              : `<img src="${Status.payType[k].icon}" style="height: .24rem; margin: 0 .04rem 0 0">${this.$t(Status.payType[k].name)}`,
            needTran: false,
          })),
        },
      ],
      countDown: '',
    }
  },
  computed: {
    ...mapState(['deltaTime']),
    ...mapState('user', ['info', 'bankCards']),
    heads() {
      return [
        { name: 'total', alias: 'total' },
        { name: 'price', alias: 'price' },
        { name: 'amount', alias: 'amount' },
        { name: 'commission', alias: 'fee' },
      ]
    },
    heads1() {
      return [
        { name: this.type !== 'buy' ? 'payer' : 'payee', alias: 'name' },
        { name: 'bank', alias: 'bank' },
        { name: 'bank.branch', alias: 'sub_bank' },
        { name: 'bank.card', alias: 'card_number', copy: true },
        { name: 'verify.code-1', alias: 'remark', copy: true },
      ]
    },
    card() {
      return {
        name: 'bank.card',
        value: '',
        alias: 'user_bank_id',
        inputType: 'select',
        options: [
          { name: 'bank.card.choose', value: '', needTran: true },
          ...this.bankCards ? this.bankCards
            .map(b => ({ name: `${b.bank} ${b.card_number}`, value: b.ID })) : [],
        ],
      }
    },
    title() {
      return this.$t(this.type === 'buy' ? 'buy-1' : 'sell-1')
    },
    showItems() {
      return this.items.map((item) => {
        if (item.addTitle) {
          item.name = this.title + this.$t(item.addTitle)
          item.needTran = false
        }
        if (item.addTitle === 'price') {
          item.value = this.price
        }
        if (item.addTitle === 'amount') {
          item.validator = val => +val >= this.minAmount && +val <= this.maxAmount
          item.errorText = this.$t('exchange.cash.amount.tip', {
            type: this.title,
            min: this.minAmount,
            max: this.maxAmount,
          })
        }
        return item
      })
    },
    expireTimeTip() {
      if (this.showOverlay && this.showOverlay.order) {
        const expireTime = this.showOverlay.order.expire_time
        if (!expireTime || expireTime === infinity) return this.$t('transfer.tip-1')
        return this.$t('transfer.tip', {
          time: `<span class='font-red' style='font-size:inherit'>${this.dateFormatter(this.showOverlay.order.expire_time)}</span>`,
        })
      }
      return ''
    },
  },
  watch: {
    coin(val) {
      this.items[1].unit = val
    },
  },
  methods: {
    ...mapActions(['getDeltaTime']),
    ...mapActions('user', ['getCard']),
    ...mapActions('exchange', ['confirmCashOrder', 'getCashOrders']),
    input(index, val) {
      this.$set(this.items[index], 'value', val)
      if (index === 1) {
        if (this.items[0].value) {
          this.$set(this.items[2], 'value', !val ? '' : this.numTrim(val * this.items[0].value, 2))
        }
      } else if (index === 2) {
        if (this.items[0].value) {
          this.$set(this.items[1], 'value', !val ? '' : this.numTrim(val / this.items[0].value, 2))
        }
      }
    },
    submit() {
      if (!this.info.id) {
        return Promise.resolve(this.$router.push(`/sign-in?redirectTo=${this.$route.path}`))
      }
      if (!this.info.identity_authenticated) {
        return new Promise((res, rej) => {
          this.showOverlay = {
            type: 'unauthorized',
            res: () => this.$router.push('/user-center/security/certification'),
            rej,
          }
        }).catch(() => {
          this.showOverlay = null
        })
      }
      if (!this.info.bank_card_bound) {
        return new Promise((res, rej) => {
          this.showOverlay = {
            type: 'unbind',
            res: () => this.$router.push('/user-center/security/pay-set'),
            rej,
          }
        }).catch(() => {
          this.showOverlay = null
        })
      }
      const data = dataDeal(this.items)
      return this.validate(this.items)
        .then(() => (this.bankCards.length ? Promise.resolve() : this.getCard()))
        .then(() => new Promise((res, rej) => {
          this.showOverlay = {
            type: 'chooseBank',
            res: () => this.validate([this.card])
              .then(() => this.submitFn({ ...data, user_bank_id: this.card.value }))
              .then(res).catch(this.snackBar.error),
            rej,
          }
        }))
        .then((result) => {
          new Promise((res, rej) => {
            this.showOverlay = {
              type: 'op-confirm',
              rej: (...args) => rej(result, ...args),
              order: {
                ...result.order,
                ...result.merchant,
                ...data,
                user_bank_id: this.card.value,
                orderId: result.order.ID,
              },
            }

            return this.getDeltaTime().then(() => {
              OrderCountDown.bind(result.order.expire_time, this.getCountDown, this.deltaTime)
            })
          }).catch((res) => {
            OrderCountDown.unbind(res.order.expire_time, this.getCountDown)
            this.showOverlay = null
          })
        })
        .then(() => {
          this.items.forEach((item) => {
            if (['amount', 'total'].includes(item.alias)) item.value = ''
          })
          this.card.value = ''
          this.$forceUpdate()
        })
        .catch((err) => {
          if (err) this.snackBar.error(err)
          else this.showOverlay = null
        })
    },
    paid() {
      return new Promise((res, rej) => {
        this.showOverlay1 = {
          res: () => this.confirmCashOrder(this.showOverlay.order.orderId).then(() => {
            this.snackBar.info(this.$t('sure') + this.$t('success'))
            this.showOverlay1 = null
            this.showOverlay = null
            res()
          }).then(() => this.getCashOrders({ status: 1 })).catch(this.snackBar.error),
          rej,
        }
      }).catch((err) => {
        if (err) this.snackBar.error(err)
        else this.showOverlay1 = null
      })
    },
    copy(id) {
      copyDom(document.getElementById(id))
        .then(val => this.snackBar.info(this.$t(val)))
        .catch(e => this.snackBar.error(this.$t(e)))
    },
    getCountDown(val) {
      this.countDown = parseInt(val, 10)
        ? `${this.$t('count-down')}: <span class='font-red' style='font-size:inherit'>${val}</span>`
        : `<span class='font-red'>${this.$t('expired')}</span>`
    },
  },
}
</script>
