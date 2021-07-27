<template>
  <div class="withdraw-pin-wrap">
    <div class="withdraw-pin">
      <template v-if="assets[coin]&&+assets[coin].withdraw_status">
        <div v-for="(item,i) in showItems" :key="i + '1'">
          <template v-if="i<=1">
            <div class="asset-withdraw-address"
                 v-if="item.alias==='address_id' && item.inputType === 'select'">
              <div class="my-input type-1 can-not-edit dark">
                <label class="label">{{$t(item.name)}}</label>
                <input type="text" :placeholder="item.placeholder"
                       v-model="item.value"
                       @focus="addressStatus=true"
                       @blur="hideAddress"
                       @input="clearAddress"
                       autocomplete="off"
                       class="input-base">
                <div class="address-name">{{item.label}}</div>
              </div>
              <div class="address-list" v-show="addressStatus"
                   :style="{height: item.options.length*0.32+'rem'}">
                <div class="address-item" v-for="(jItem , j) in item.options" :key="j"
                     @click="checkAddress(jItem)">
                  <span class="value">{{jItem.address}}</span>
                  <span class="name">{{jItem.name}}</span>
                </div>
              </div>
            </div>
            <my-input v-else type="1" v-model="item.value"
                      :item="item"
                      @btnClick="btnClick(item.name)"/>
          </template>
        </div>
        <!--<template v-if="has_memo === 1">-->
          <!--<my-input type="1" v-model="memo"-->
                    <!--v-if="addresses.records.length > 0 && memoState"-->
                    <!--:item="{-->
                    <!--name: 'memo',-->
                   <!--alias: 'memo',-->
                   <!--value: '',-->
                   <!--canEdit: false,-->
                   <!--requiredInPage: false,-->
                  <!--}"/>-->
          <!--<my-input type="1" v-model="memo"-->
                    <!--v-else-->
                    <!--:item="{-->
                    <!--name: 'memo',-->
                   <!--alias: 'memo',-->
                   <!--value: '',-->
                   <!--canEdit: true,-->
                   <!--requiredInPage: false,-->
                  <!--}"/>-->
        <!--</template>-->
        <my-input type="1" v-model="memo"
                  v-if="has_memo === 1"
                  :item="{
                    name: 'memo',
                   alias: 'memo',
                   value: '',
                   canEdit: true,
                   requiredInPage: false,
                  }"/>
        <div v-for="(item,i) in showItems" :key="i+'2'">
          <my-input v-if="i>1" type="1" v-model="item.value"
                    :item="item"
                    @btnClick="btnClick(item.name)"/>
        </div>
        <!--<div class="decoration"></div>-->
        <my-input v-for="(item,i) in showVerifyItems" type="1" v-model="item.value" :key="i"
                  :item="item" @btnClick="btnClick(item.name)"/>
        <btn-once class="submit btn-green-fill" :clickFn="submit">{{$t('submit')}}</btn-once>
      </template>
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
                       :confirmText="$t('set')" @close="showOverlay.rej()"
                       @cancel="showOverlay.rej()"
                       @confirm="$router.push('/user-center/security/set-password-fund')"/>
    </div>
    <!--提币记录-->
    <div class="record-table">
      <h1 class="tab-head">
        <span class="tab" :class="{'selected':tabValue === coin}"
        @click="tabChange(coin)">
          {{coin}}{{$t('asset.withdraw.record')}}
        </span>
        <span class="tab" :class="{'selected':tabValue === ''}"
          @click="tabChange('')">
          {{$t('all')}}{{$t('asset.withdraw.record')}}
        </span>
      </h1>
      <my-table :class="{'no-data': showRecords&&showRecords.length<1}"
                :heads="heads" :data="showRecords" :sort="false">
        <template v-for="(r,i) in showRecords" :slot="i+'-4'">
          <button v-if="0===+r.status" class="btn btn-cancel btn-red" :key="i"
                  @click="overlay('cancel',showRecords[i].ID)">
            {{$t('cancel')}}
          </button>
          <!--<template v-else>——</template>-->
          <button class="btn" :key="i+'1'"
                  @click="showWithdraw(showRecords[i])">
            {{$t('details-1')}}
          </button>
        </template>
      </my-table>
      <pagination :config="pageConfig" @to="pageConfig.page=$event;getData()"/>
    </div>
    <!--加入常用地址提示-->
    <my-overlay :head="$t('tip')" v-if="addressTips" @close="addressTips=false">
      <div class="withdraw-tips">
        <i class="icon">
          <img :src="require('assets/client/user-center/zt/icon-doubt-red.png')"/>
        </i>
        {{$t('add.address.tips')}}</div>
      <div class="my-input type-1 dark">
        <label class="label">{{$t('address')}}</label>
        <div class="name-value">{{address}}</div>
      </div>
      <my-input v-model="addressName.value" :item="addressName" type="1"/>
      <div class="button-content">
        <button class="cancel-btn" @click="addressTips=false">{{$t('cancel-1')}}</button>
        <button class="enter-btn" @click="addAddress">{{$t('add.btn')}}</button>
      </div>
    </my-overlay>
    <!--提币记录详情-->
    <my-overlay v-if="withdrawStatus" :head="$t('asset.withdraw.detail')"
                @close="withdrawStatus=false">
      <div class="my-input type-1 dark">
        <label class="label">{{$t('withdraw.detail.coin')}}</label>
        <div class="name-value">{{withdrawDetail.asset}}</div>
      </div>
      <div class="my-input type-1 dark">
        <label class="label">{{$t('withdraw.detail.time')}}</label>
        <div class="name-value">{{withdrawDetail.date}}</div>
      </div>
      <div class="my-input type-1 dark">
        <label class="label">{{$t('asset.withdraw.address')}}</label>
        <div class="name-value">{{withdrawAddress ? withdrawAddress: '--'}}</div>
      </div>
      <div class="my-input type-1 dark">
        <label class="label">{{$t('withdraw.detail.hash')}}</label>
        <div class="name-value">{{withdrawDetail.tx_id}}</div>
      </div>
      <div class="my-input type-1 dark">
        <label class="label">{{$t('withdraw.detail.amount')}}</label>
        <div class="name-value">{{withdrawDetail.amount}}</div>
      </div>
      <div class="my-input type-1 dark">
        <label class="label">{{$t('withdraw.detail.fee')}}</label>
        <div class="name-value">{{withdrawDetail.fee}}</div>
      </div>
      <div class="my-input type-1 dark">
        <label class="label">{{$t('withdraw.detail.account')}}</label>
        <div class="name-value">{{withdrawDetail.real_amount}}</div>
      </div>
      <div class="my-input type-1 dark" style="margin-bottom: 0;">
        <label class="label">{{$t('withdraw.detail.state')}}</label>
        <div class="name-value" v-html="withdrawDetail.statusName"></div>
      </div>
      <div class="my-input type-1 dark">
        <label class="label"></label>
        <div class="name-value">{{withdrawDetail.remark}}</div>
      </div>
    </my-overlay>
  </div>
</template>

<script>
import MyInput from 'components/client/MyInput'
import MyOverlay from 'components/client/MyOverlay'
import Status from 'data/immutable-data/Status'
// import { ellipsis } from 'utils/CommonStyle'
import { dataDeal } from 'utils/DataDeal'
import { validatePassword } from 'utils/FormValidate'
import { posFixedNumber, verifyCodeNumber } from 'utils/InputFormatter'
import { mapActions, mapState } from 'vuex'

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
      tabValue: this.$route.query.coin,
      heads: [
        { name: 'asset', alias: 'asset', style: { textAlign: 'center' } },
        { name: 'withdraw.detail.time', alias: 'date', style: { textAlign: 'center', width: '15%' } },
        // { name: 'address',
        //   alias: 'ellAddress',
        //   style: { textAlign: 'center', width: '10%' },
        //   // formatter: item => `<span class="address">${item.ellAddress}</span>`,
        // },
        // { name: 'withdraw.detail.hash', alias: 'tx_id',
        // style: { textAlign: 'center', width: '15%' } },
        { name: 'withdraw.detail.amount', alias: 'amount', style: { textAlign: 'center' } },
        // { name: 'commission', alias: 'fee', style: { textAlign: 'center' } },
        // { name: 'actual-receipt', alias: 'real_amount', style: { textAlign: 'center' } },
        { name: 'withdraw.detail.state', alias: 'statusName', style: { textAlign: 'center' } },
        { name: 'action', style: { textAlign: 'center' } },
      ],
      withdrawId: '', // 提现id
      address: '', // 要添加的地址
      addressName: {
        name: 'address.note',
        alias: 'remark',
        formatter: (item, alias) => item.remark || item[alias],
        style: { width: '15%', textAlign: 'center' },
        value: '',
        placeholder: 'address.note.place',
        required: true,
      },
      addressTips: false, // 加入常用地址弹窗状态
      withdrawStatus: false, // 提币详情弹窗状态
      withdrawDetail: {}, // 提币详情弹窗
      addressStatus: false, // 地址选择列表
      showOverlay: null,
      pageConfig: {
        total: 1,
        pages: 1,
        page: 1,
        pageSize: 10,
      },
      // memoState: false, // 标签可否输入
      memo: '', // 标签
      queryAgain: false,
    }
  },
  computed: {
    ...mapState('user', ['info', 'addresses', 'assets', 'security', 'withdrawRecords']),
    coin() {
      return this.$route.query.coin
    },
    has_memo() {
      const { has_memo } = this.assets[this.coin]
      return has_memo
    },
    records() {
      /* eslint-disable */
      const obj = this.withdrawRecords[this.tabValue]
      return obj && obj.records && obj.records.map(item => ({
        ...item,
        date: this.dateFormatter(item.CreatedAt, 'YYYY-MM-DD HH:mm:ss'),
        ellAddress: `${item.name} - ${item.address}` ,
        statusName: item.status !== 3
          ? Status.withdrawStatus[item.status].name
          : (Status.withdrawStatus[item.wallet_status]
            ? Status.withdrawStatus[item.wallet_status].name
            : Status.withdrawStatus.other.name),
      }))
      // status = 5 是取消
      // status = 4 是失败
      // status = 1 是待审核
      // status = 2 是初审通过
      // status = 3 需要区分下，wallet_status = 'DONE'和FailedNotRepeat是已完成
      // 已发送status = 3 wallet_status = INIT
    },
    showItems() {
      const coin = this.coin || this.$route.query.coin
      return this.items.map((item) => {
        if (item.alias === 'amount') {
          item.name = this.$t('amount')
          item.validator = val => +val <= +this.assets[this.coin].available
          item.errorText = this.$t('asset.withdraw.tip', { max: this.assets[this.coin].available })
          item.placeholder = item.errorText
          item.btnText = this.$t('asset.withdraw.all')
          item.needTran = false
        } else if (item.name === 'commission' && this.assets && this.assets[coin]) {
          let fee = 0
          if (this.assets[coin].withdraw_fee_percent!==0){
            if(this.assets[coin].withdraw_fee === '0' ){
              fee = this.assets[coin].withdraw_fee_percent *100 +'%'
            }else{
              fee = this.assets[coin].withdraw_fee + '+'+this.assets[coin].withdraw_fee_percent *100 +'%'
            }
          }else{
            fee = this.assets[coin].withdraw_fee
          }
          item.value = fee
        } else if (item.alias === 'address_id' && this.addresses.records && this.addresses.records.length === 0) {
          item.inputType = 'text'
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
    withdrawAddress() {
      if(this.has_memo === 1){
        const addressList = String(this.withdrawDetail.address).split(':')
        let address = addressList[0]
        if(addressList[1] !== ''){
          address+= ':'
          address+= addressList[1]
        }
        return address
      }else{
        return this.withdrawDetail.address
      }
    }
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
        // const options = val.records.map(item => ({
        //   name: item.name,
        //   value: item.ID,
        // }))
        // this.$set(this.items, 1, { ...this.items[1], value: options[0].value, options })
        const options = val.records
        let inputType = 'text'
        if(options.length>0){
          inputType = 'select'
        }
        this.$set(this.items, 1, { ...this.items[1], options, inputType })
      }
    },
    assets(val) {
      if (val && val[this.coin]) {
        this.$set(this.items[3], 'value', val[this.coin].withdraw_fee)
      }
    },
    'items.2.value'(val) {
      let value = 0
      const withdraw_fee_percent = this.assets[this.coin].withdraw_fee_percent
      const withdraw_fee = this.assets[this.coin].withdraw_fee
      if(withdraw_fee_percent===0){
        value = (val ? this.bigNum(val).minus(this.items[3].value) : '').toString()
      }else{
        let price=val*(1-withdraw_fee_percent) - withdraw_fee
        const priceList= String(price).split('.')
        if(priceList.length>=2){
          const precision = Number(this.assets[this.coin].precision)
          price=priceList[0]+'.'+String(priceList[1]).slice(0,precision)
        }
        value = val ? price : ''
      }
      this.$set(this.items[4], 'value', value >= 0 ? value : '0')
    },
  },
  methods: {
    ...mapActions('user', ['getSecurity', 'withdraw', 'getWithdrawAddresses', 'getAssets', 'getWithdrawRecords', 'withdrawCancel', 'getCodeAfterLogin', 'commonAddress']),
    getData() {
      if (this.coin) {
        this.getWithdrawAddresses({ asset: this.coin }).catch(this.snackBar.error)
        this.getList()
      }
      this.getAssets().catch(this.snackBar.error)
      this.getSecurity().catch(this.snackBar.error)
    },
    tabChange(coin) {
      this.tabValue = coin;
      this.getList()
    },
    getList() {
      this.getWithdrawRecords({ asset: this.tabValue, ...this.pageC(this.pageConfig) })
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
    hideAddress() {
      setTimeout(() => {
        this.addressStatus = false
      }, 200)
    },
    // 清除地址id
    clearAddress() {
      this.items[1].label = ''
      this.items[1].Id = ''
      // this.memoState = false
    },
    // 选中提币地址
    checkAddress(item) {
      this.items[1].value = item.address
      this.items[1].label = item.name
      this.items[1].Id = item.ID
      if (this.has_memo === 1) {
        // this.memoState = true
        this.memo = item.memo
      }
    },
    // 显示提币弹窗
    showWithdraw(item) {
      this.withdrawDetail = item;
      this.withdrawStatus = true
    },
    getCode(type = 1) {
      return this.getCodeAfterLogin({ type, use_type: 7 }).then(() => {
        this.snackBar.info(this.$t('verify.code.get.success'))
      })
    },
    /* eslint-disable */
    submit() {
      if (!this.info.identity_authenticated) {
        return this.overlay('unauthorized')
      }
      if (!this.info.withdraw_password_set) {
        return this.overlay('password.unset')
      }
      const items = [...this.items, ...this.showVerifyItems]
      return this.validate(items)
        .then(() => {
          // if(this.memo === '' && this.has_memo === 1){
          //   this.snackBar.error(this.$t('memo')+':'+this.$t('required'))
          //   return false
          // }
          const data = dataDeal(items)
          data.memo = this.memo
          data.address = items[1].value
          if (items[1].Id !== '') {
            data.address_id = items[1].Id
          } else {
            data.address_id = ''
            this.address = items[1].value
            const addressValue = this.address
            if (addressValue !== '') {
              let { regex } = this.assets[this.coin]
              regex = new RegExp(regex);
              if (String(addressValue).match(regex) === null) {
                this.snackBar.error(this.$t('asset.withdraw.address') + this.$t('invalid'))
                return false
              }
            }
          }
          this.withdraw(data).then((res) => {
            this.snackBar.info(this.$t('submitted'))
            this.getData()
            this.items = this.itemsFn()
            this.verifyItems = this.verifyItemsFn()
            this.memo = ''
            if (res.exist === false) {
              this.addressTips = true
              this.withdrawId = res.id
            }
          }).catch(this.snackBar.error)
        })
        .catch(this.snackBar.error)
    },
    // 添加常用地址提交
    addAddress() {
      const items = [this.addressName]
      return this.validate(items)
        .then(() => this.commonAddress({
          ...dataDeal(items),
          id: this.withdrawId,
        }).then(() => {
          this.snackBar.info(this.$t('submitted'))
          this.addressTips = false
        })).catch(this.snackBar.error)
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
          label: '',
          Id: '',
          // btnText: 'add',
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
  components: { MyInput, MyOverlay },
}
</script>
