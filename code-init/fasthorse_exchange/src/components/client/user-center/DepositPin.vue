<template>
  <div class="deposit-pin">
    <template v-if="asset.recharge_status">
      <div class="address">
        <my-input v-for="(item, i) in address"
                  type="1"
                  :value="item.value"
                  :item="item"
                  :style="{width: '6rem'}"
                  :inputStyle="{width: '5rem'}"
                  :key="i"
                  @btnClick="copy(item.defaultVal)"/>
        <img class="img transition" :src="qrcode" alt="">
      </div>
      <ul class="tips">
        <template v-for="(t,i) in tips">
          <template v-if="i===1">
            <li class="li" :key="i" v-if="Number(assets[coin].min_confirmation)>0">
              {{t}}
            </li>
          </template>
          <template v-else-if="i===2">
            <li class="li" :key="i" v-if="Number(assets[coin].min_amount)>0">
               {{t}}
            </li>
          </template>
          <li class="li" v-else :key="i">
            {{t}}
          </li>
        </template>
      </ul>
    </template>
    <h2 class="h2">{{$t('asset.deposit.record')}}</h2>
    <my-table :heads="heads" :data="showRecords"
              :searching="searching" :sort="false"/>
    <pagination :config="pageConfig" @to="pageConfig.page=$event;getList()"/>
  </div>
</template>

<script>
import MyInput from 'components/client/MyInput'
import Status from 'data/immutable-data/Status'
import { ellipsis } from 'utils/CommonStyle'
import { copyText, QrCode } from 'utils/Utils'
import { mapActions, mapState } from 'vuex'
// import { setTimeout } from 'timers';

// 充值页面
export default {
  name: 'DepositPin',
  beforeMount() {
    (this.assets[this.coin] ? Promise.resolve() : this.getAssets()).then(() => {
      if (this.asset.recharge_status) {
        this.getDepositAddress(this.coin).catch(this.snackBar.error)
      }
    })
    this.getList()
  },
  data() {
    return {
      qrcode: null,
      heads: [
        { name: 'time', alias: 'date', style: { textAlign: 'left' } },
        { name: 'coin', alias: 'coin', style: { textAlign: 'left' } },
        { name: 'exchange.hash', alias: 'ellAddress', style: { textAlign: 'left', width: '30%' } },
        { name: 'amount', alias: 'amount', style: { textAlign: 'left' } },
        { name: 'amount.confirm', alias: 'confirmation', style: { textAlign: 'left' } },
        { name: 'status', alias: 'statusName', style: { textAlign: 'right' } },
      ],
      searching: false,
      pageConfig: {
        total: 1,
        pages: 1,
        page: 1,
        pageSize: 10,
      },
    }
  },
  computed: {
    ...mapState('user', ['rechargeRecords', 'depositAddresses', 'assets']),
    coin() {
      return this.$route.query.coin
    },
    asset() {
      return this.assets[this.coin] || {}
    },
    records() {
      const r = this.rechargeRecords[this.coin]
      return r && r.records ? r.records.map(item => ({
        ...item,
        date: this.dateFormatter(item.CreatedAt, 'YYYY-MM-DD HH:mm:ss'),
        ellAddress: ellipsis.str(item.tx_hash, 20),
        statusName: Status.assetOpStatus[item.status === 2 ? 'PROCESSING' : 'COMPLETED'].name,
        coin: this.coin,
      })) : []
    },
    address() {
      const addressObj = this.depositAddresses[this.coin]
      const address = (addressObj && addressObj.address && addressObj.address.split(':')) || ['']
      return address.map((ad, i) => ({
        name: this.$t(i === 0 ? 'asset.deposit.address' : 'memo'),
        defaultVal: ad,
        btnText: this.$t('copy'),
        canEdit: false,
        needTran: false,
      }))
    },
    tips() {
      return this.address.length === 2 ? this.$t('asset.deposit.labeltip', { coin: this.coin, min_confirmation: this.assets[this.coin].min_confirmation, min_amount: this.assets[this.coin].min_amount }).split('\n')
        : this.$t('asset.deposit.tip', { coin: this.coin, min_confirmation: this.assets[this.coin].min_confirmation, min_amount: this.assets[this.coin].min_amount }).split('\n')
    },
    showRecords() {
      return this.records
        && this.records.map(item => ({ ...item, statusName: this.$t(item.statusName) }))
    },
  },
  watch: {
    rechargeRecords(val) {
      const r = val[this.coin]
      if (r) {
        this.pageConfig = {
          ...this.pageConfig,
          total: r.total,
          pages: Math.ceil(r.total / this.pageConfig.pageSize),
        }
      }
    },
    address(val) {
      if (val[0].defaultVal) {
        this.getQrcode()
      }
    },
  },
  methods: {
    ...mapActions('user', ['getRechargeRecords', 'getDepositAddress', 'getAssets']),
    copy(text) {
      copyText(text)
        .then(val => this.snackBar.info(this.$t(val)))
        .catch(e => this.snackBar.error(this.$t(e)))
    },
    getList() {
      this.searching = true
      this.getRechargeRecords({ asset: this.coin, ...this.pageC(this.pageConfig) })
        .catch(this.snackBar.error)
        .then(() => {
          this.searching = false
        })
    },
    getQrcode() {
      QrCode(this.address[0].defaultVal).then((url) => {
        this.qrcode = url
      })
    },
  },
  components: { MyInput },
}
</script>
