<template>
  <div class="withdraw-pin">
    <template v-if="assets[coin]&&+assets[coin].withdraw_status">
      <my-input v-for="(item,i) in showItems" type="1" v-model="item.value" :key="i+'1'"
                :item="item"
                @btnClick="btnClick(item.name)"/>
      <!--<div class="decoration"></div>-->
      <my-input v-for="(item,i) in showVerifyItems" type="1" v-model="item.value" :key="i"
                :item="item" @btnClick="btnClick(item.name)"/>
      <btn-once class="submit btn-green-fill" :clickFn="submit">{{$t('submit')}}</btn-once>
    </template>
    <h2 class="h2">{{$t('asset.withdraw.record')}}</h2>
    <my-table :class="{'no-data': showRecords&&showRecords.length<1}"
              :heads="heads" :data="showRecords" :sort="false">
      <template v-for="(r,i) in showRecords" :slot="i+'-7'">
        <button v-if="0===+r.status" class="btn btn-cancel btn-red" :key="i"
                @click="overlay('cancel',showRecords[i].ID)">
          {{$t('cancel')}}
        </button>
        <template v-else>——</template>
      </template>
    </my-table>
    <pagination :config="pageConfig" @to="pageConfig.page=$event;getData()"/>
    <overlay-confirm v-if="showOverlay&&showOverlay.type==='cancel'"
                     :tipText="$t('sure')+$t('cancel')+$t('ma')"
                     @cancel="showOverlay.rej()" @close="showOverlay.rej()" @confirm="cancel"/>
    <overlay-confirm v-if="showOverlay&&showOverlay.type==='unauthorized'"
                     :tipText="$t('unauthorized.tip')"
                     :confirmText="$t('authorize')" @close="showOverlay.rej()"
                     @cancel="showOverlay.rej()"
                     @confirm="$router.push('/user-center/security/certification')"/>
    <overlay-confirm v-if="showOverlay&&showOverlay.type==='password.unset'"
                     :tipText="$t('password.fund.unset.tip')"
                     :confirmText="$t('set')"
                     @close="showOverlay.rej()"
                     @cancel="showOverlay.rej()"
                     @confirm="$router.push('/user-center/security/set-password-fund')"/>
  </div>
</template>

<script>
import MyInput from 'components/client/MyInput'
import Status from 'data/immutable-data/Status'
import { ellipsis } from 'utils/CommonStyle'
import { dataDeal } from 'utils/DataDeal'
import { validatePassword, validateVerifyCode } from 'utils/FormValidate'
import { posFixedNumber, verifyCodeNumber } from 'utils/InputFormatter'
import { mapActions, mapState } from 'vuex'

// 充值页面
export default {
  name: 'WithdrawPin',
  beforeMount() {
    this.getData()
  },
  data() {
    return {
      Status,
      items: this.itemsFn(),
      verifyItems: this.verifyItemsFn(),
      heads: [
        { name: 'time', alias: 'date', style: { textAlign: 'left' } },
        { name: 'coin', alias: 'asset', style: { textAlign: 'left' } },
        { name: 'address', alias: 'ellAddress', style: { textAlign: 'left', width: '25%' } },
        { name: 'amount', alias: 'amount', style: { textAlign: 'left' } },
        { name: 'commission', alias: 'fee', style: { textAlign: 'left' } },
        { name: 'actual-receipt', alias: 'real_amount', style: { textAlign: 'left' } },
        { name: 'status', alias: 'statusName', style: { textAlign: 'left' } },
        { name: 'action', style: { textAlign: 'right' } },
      ],
      showOverlay: null,
      pageConfig: {
        total: 1,
        pages: 1,
        page: 1,
        pageSize: 10,
      },
      queryAgain: false,
    }
  },
  computed: {
    ...mapState('user', ['info', 'addresses', 'assets', 'security', 'withdrawRecords']),
    coin() {
      return this.$route.query.coin
    },
    records() {
      const obj = this.withdrawRecords[this.coin]
      return obj && obj.records && obj.records.map(item => ({
        ...item,
        date: this.dateFormatter(item.CreatedAt, 'YYYY-MM-DD HH:mm:ss'),
        ellAddress: ellipsis.str(`${item.name} - ${item.address}` || '', 20),
        statusName: Status.withdrawStatus[item.status].name,
      }))
    },
    showItems() {
      return this.items.map((item) => {
        if (item.alias === 'amount') {
          item.name = this.$t('amount')
          item.validator = val => +val <= +this.assets[this.coin].available
          item.errorText = this.$t('asset.withdraw.tip', { max: this.assets[this.coin].available })
          item.placeholder = item.errorText
          item.btnText = this.$t('asset.withdraw.all')
          item.needTran = false
        }
        return item
      })
    },
    showVerifyItems() {
      return this.verifyItems.filter(item => Object.keys(this.security).every((key) => {
        const include = item.name.includes(key)
        return !include || (include && this.security[key])
      }))
    },
    showRecords() {
      return this.records
        && this.records.map(item => ({
          ...item,
          statusName: `<span style="font-size:inherit" class="${item.status === Status.withdrawStatus[5].value ? '' : 'font-green'}">${this.$t(item.statusName)}</span>`,
        }))
    },
  },
  watch: {
    coin(val) {
      if (val) {
        this.$set(this.items[0], 'value', val)
        this.getData()
      }
    },
    addresses(val) {
      if (val && val.records && val.records.length > 0) {
        const options = val.records.map(item => ({
          name: item.name,
          value: item.ID,
        }))
        this.$set(this.items, 1, { ...this.items[1], value: options[0].value, options })
      }
    },
    assets(val) {
      if (val && val[this.coin]) {
        this.$set(this.items[3], 'value', val[this.coin].withdraw_fee)
      }
    },
    'items.2.value'(val) {
      const value = (val ? this.bigNum(val).minus(this.items[3].value) : '').toString()
      this.$set(this.items[4], 'value', value >= 0 ? value : '0')
    },
  },
  methods: {
    ...mapActions('user', ['getSecurity', 'withdraw', 'getWithdrawAddresses', 'getAssets', 'getWithdrawRecords', 'withdrawCancel', 'getCodeAfterLogin']),
    getData() {
      if (this.coin) {
        this.getWithdrawAddresses({ asset: this.coin }).catch(this.snackBar.error)
        this.getList()
      }
      this.getAssets().catch(this.snackBar.error)
      this.getSecurity().catch(this.snackBar.error)
    },
    getList() {
      this.getWithdrawRecords({ asset: this.coin, ...this.pageC(this.pageConfig) })
        .then((res) => {
          this.pageConfig = {
            ...this.pageConfig,
            total: res.total,
            pages: Math.ceil(res.total / this.pageConfig.pageSize),
          }
        })
        .catch(this.snackBar.error)
    },
    overlay(type, ID) {
      return new Promise((res, rej) => {
        this.showOverlay = { res, rej, type, ID }
      }).then(() => {
        this.showOverlay = null
      }).catch((e) => {
        if (!e) this.showOverlay = null
      })
    },
    cancel() {
      this.withdrawCancel(this.showOverlay.ID).then(() => {
        this.snackBar.info(this.$t('cancel.success'))
        this.showOverlay.res()
        this.getList()
      }).catch(this.snackBar.error)
    },
    btnClick(type) {
      switch (type) {
        case 'asset.withdraw.address':
          return this.$router.replace('/user-center/assets-manage?type=addressManage')
        case this.$t('amount'): {
          const asset = this.assets[this.coin]
          return this.$set(this.items, '2', { ...this.items[2], value: asset && asset.available })
        }
        case 'verify.code.phone':
          return this.getCode(0)
        default:
          return this.getCode()
      }
    },
    getCode(type = 1) {
      return this.getCodeAfterLogin({ type, use_type: 7 }).then(() => {
        this.snackBar.info(this.$t('verify.code.get.success'))
      })
    },
    submit() {
      if (!this.info.identity_authenticated) {
        return this.overlay('unauthorized')
      }
      if (!this.info.withdraw_password_set) {
        return this.overlay('password.unset')
      }
      const items = [...this.items, ...this.showVerifyItems]
      return this.validate(items)
        .then(() => this.withdraw(dataDeal(items)).then(() => {
          this.snackBar.info(this.$t('submitted'))
          this.getData()
          this.items = this.itemsFn()
          this.verifyItems = this.verifyItemsFn()
        }))
        .catch(this.snackBar.error)
    },
    itemsFn() {
      const coin = this.coin || this.$route.query.coin
      const fee = this.assets && this.assets[coin] && this.assets[coin].withdraw_fee
      return [
        {
          name: 'coin',
          alias: 'asset',
          value: coin,
          canEdit: false,
        },
        {
          name: 'asset.withdraw.address',
          alias: 'address_id',
          value: '',
          inputType: 'select',
          options: [],
          btnText: 'add',
        },
        {
          name: 'amount',
          alias: 'amount',
          value: '',
          preFormatter: posFixedNumber(8),
          btnText: 'asset.withdraw.all',
          requiredInPage: false,
        },
        {
          name: 'commission',
          defaultVal: 'auto-calc',
          value: fee,
          canEdit: false,
          requiredInPage: false,
        },
        {
          name: 'actual-receipt',
          defaultVal: 'auto-calc',
          value: '',
          canEdit: false,
          requiredInPage: false,
        },
      ]
    },
    verifyItemsFn() {
      return [
        {
          name: 'password.fund',
          alias: 'password',
          value: '',
          inputType: 'password',
          validator: validatePassword,
          placeholder: 'password.tip',
          errorText: '',
          requiredInPage: false,
        },
        {
          name: 'verify.code.phone',
          alias: 'sms_code',
          value: '',
          placeholder: 'verify.code.phone',
          preFormatter: verifyCodeNumber,
          validator: validateVerifyCode,
          errorText: '',
          btnText: 'verify.code.get',
          btnCodeFn: () => this.getCode(0),
          requiredInPage: false,
        },
        {
          name: 'verify.code.email',
          alias: 'email_code',
          value: '',
          placeholder: 'verify.code.email',
          preFormatter: verifyCodeNumber,
          validator: validateVerifyCode,
          errorText: '',
          btnText: 'verify.code.get',
          btnCodeFn: () => this.getCode(),
          requiredInPage: false,
        },
        {
          name: 'verify.code.google',
          alias: 'two_step_code',
          value: '',
          placeholder: 'verify.code.google',
          preFormatter: verifyCodeNumber,
          errorText: '',
          requiredInPage: false,
        },
      ]
    },
  },
  components: { MyInput },
}
</script>
