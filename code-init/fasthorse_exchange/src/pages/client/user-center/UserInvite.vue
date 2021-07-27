<template>
  <page-container class="user-content user-invite" :title="$t('user.invite')">
    <div v-if="inviteData.is_open_activity">
      <tab-head :value="tab2.value" :options="tab2.options"/>
      <div class="super-broker">
        <div class="name">
          {{$t('invite.identify.key')}}
          <span class="value">
          {{inviteData.invite_level === '' ? '--' : inviteData.invite_level}}
        </span>
        </div>
        <div class="broker-data">
          <div>
            {{$t('invite.related')}}
            <span class="value">{{inviteData.invite_one_num || 0}}</span>
          </div>
          <div v-if="inviteData.is_open_two_invite">
            {{$t('invite.unrelated')}}
            <span class="value">{{inviteData.invite_two_num}}</span>
          </div>
          <div>
            {{$t('invite.received')}}({{$currencyObj.unit}})
            <span class="value">{{brokeMoney || 0.00}}</span>
          </div>
        </div>
        <div class="tip">* {{$t('invite.explain')}}</div>
      </div>
    </div>

    <tab-head :value="tab.value" :options="tab.options"/>
    <div class="invite-code">
      <span class="label">ID</span>
      <span>{{info.id}}</span>
    </div>
    <div class="invite-code">
      <span class="label">VIP</span>
      <span>{{info.vip}}</span>
    </div>
    <div class="invite-code">
      <span class="label">{{$t('invite.code')}}</span>
      <span class="value">{{inviteInfo.invite_code}}</span>
      <button class="copy" @click="copy(inviteInfo.invite_code)">{{$t('copy')}}</button>
    </div>
    <div v-for="(link, i) in showLinks" class="link" :key="i">
      <my-input type="1" :value="ellipsis(link.value, 56)" :item="link"
                :inputStyle="{fontSize: '.12rem'}"
                @btnClick="copy(link.value)"/>
      <div class="qrcode">
        <img class="mini" :src="link.qrcode" alt="">
        <section class="wrap transition" :class="{'has-bg':hasBg}">
          <img-tag class="bigger"
                   :src="hasBg?inviteImg(link.qrcode):link.qrcode"
                   alt=""/>
          <span v-if="!hasBg" class="tip">{{$t('invite.tip')}}</span>
        </section>
      </div>
    </div>
    <tab-head
      v-model="tab1.value"
      class="tab-head-1"
      :options="inviteData.is_open_activity ? tab1.options : tab1.options.slice(0, 1)"/>
    <my-table :heads="this.t === 1 ? heads : heads2"
              :data="this.t === 1 ? data : data2"
              :sort="false" :searching="searching"/>
    <pagination :config="pageConfig" @to="pageConfig.page=$event;getList()"/>
  </page-container>
</template>

<script>
import MyInput from 'components/client/MyInput'
import TabHead from 'components/client/user-center/TabHead'
import { inviteImgPs } from 'utils/InviteImgPs'
import { copyText, QrCode } from 'utils/Utils'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'UserInvite',
  components: { TabHead, MyInput },
  data() {
    return {
      isZt: /(127\.0\.0\.1)|(47\.97\.206\.151)|(zt\.com)/.test(window.location.origin),
      tab: {
        value: '',
        options: [
          { name: 'user.invite', value: '' },
        ],
      },
      tab1: {
        value: 'records',
        options: [
          { name: 'invite.records', value: 'records' },
          { name: 'invite.rebase', value: 'rebase' },
        ],
      },
      tab2: {
        value: 'info',
        options: [
          { name: 'invite.info', value: 'info' },
        ],
      },
      items: [
        { name: 'invite.person.number', alias: 'total', value: '' },
        { name: 'invite.money.total', alias: 'total_rewards', value: '' },
      ],
      link: {
        name: 'invite.url',
        btnText: 'copy',
        value: '/mobile/activity',
        qrcode: '',
        canEdit: false,
      },
      heads: [
        { name: 'invite.relation', alias: 'levelName' },
        { name: 'invite.account-1.id', alias: 'user_id' },
        { name: 'invite.account.id', alias: 'recommend_user_id' },
        { name: 'status', alias: 'statusName' },
        {
          name: 'sign-up.time',
          alias: 'CreatedAt',
          style: { textAlign: 'right' },
          formatter: (item, alias) => this.dateFormatter(item[alias]),
        },
      ],
      searching: true,
      showLinks: null,
      pageConfig: {
        total: 1,
        pages: 1,
        page: 1,
        pageSize: 10,
      },
      t: 1,
    }
  },
  computed: {
    ...mapState('user', ['info', 'inviteData', 'inviteRecords', 'rebaseRecords', 'inviteInfo', 'inviteTop']),
    ...mapState('exchange', ['exchangeRate']),
    data() {
      const records = this.inviteRecords && this.inviteRecords.recordsC
      return records && records.map(item => ({
        ...item,
        statusName: this.$t(item.status ? 'authorized' : 'unauthorized'),
        rewardsStr: item.rewards && Object.keys(item.rewards).reduce((pre, k) => `${pre ? `${pre},` : ''}${item.rewards[k]}${k}`, ''),
      }))
    },
    data2() {
      const records = this.rebaseRecords && this.rebaseRecords.list
      return records && records.map(item => ({
        ...item,
        balance: this.isUsd ? (item.balance / this.exchangeRate.USD_CNY).toFixed(2) : item.balance,
        new_balance: this.isUsd
          ? (item.new_balance / this.exchangeRate.USD_CNY).toFixed(2)
          : item.new_balance,
        invite_level: this.$t(item.invite_level === 1 ? 'invite.related' : 'invite.unrelated'),
        user_auth: this.$t(item.user_auth ? 'authorized' : 'registered'),
      }))
    },
    showItems() {
      return this.items.map((item, i) => {
        if (i === 0) {
          return {
            ...item,
            value: this.inviteInfo[item.alias],
          }
        }
        const { rewards } = this.inviteInfo
        if (!rewards) return item
        const value = this.reduceVal(rewards)
        return { ...item, value }
      })
    },
    hasBg() {
      return !!(this.inviteInfo.image && this.inviteInfo.image.image)
    },
    brokeMoney() {
      return this.isUsd
        ? (this.inviteData.sum_balance / this.exchangeRate.USD_CNY).toFixed(2)
        : this.inviteData.sum_balance
    },
    isUsd() {
      return this.$currencyObj.unit === '$'
    },
    heads2() {
      return [
        { name: 'invite.account.id', alias: 'invite_user_id' },
        { name: 'invite.relation', alias: 'invite_level' },
        { name: 'status', alias: 'user_auth' },
        { name: `${this.$t('invite.commission.lastmonth')}(${this.$currencyObj.unit})`, alias: 'new_balance', needTran: false },
        { name: `${this.$t('invite.commission.cumulative')}(${this.$currencyObj.unit})`, alias: 'balance', needTran: false },
      ]
    },
  },
  watch: {
    inviteRecords(val) {
      this.pageConfig = {
        ...this.pageConfig,
        val,
        pages: Math.ceil(val.total / this.pageConfig.pageSize),
      }
    },
    rebaseRecords(val) {
      this.pageConfig = {
        ...this.pageConfig,
        val,
        pages: Math.ceil(val.count / this.pageConfig.pageSize),
      }
    },
    inviteInfo(val) {
      const { links } = val
      if (links) {
        Promise.all(links.map(url => new Promise((res, rej) => {
          QrCode(url).then((dUrl) => {
            res({ value: url, qrcode: dUrl })
          }).catch(rej)
        }))).then((values) => {
          this.showLinks = values.map((val1, i) => ({
            ...this.link,
            ...val1,
            name: `${this.$t(this.link.name)}${values.length > 1 ? i + 1 : ''}`,
            btnText: this.$t(this.link.btnText),
            needTran: false,
          }))
        })
      }
    },
    'tab1.value'(newValue) {
      this.t = newValue === 'records' ? 1 : 2
      this.getList(0)
    },
  },
  methods: {
    ...mapActions('user', ['getInviteData', 'getInviteRecords', 'getRebaseRecords', 'getInviteInfo', 'getInviteTop']),
    ...mapActions('market', ['getSymbols', 'listenPrices', 'listenPricesUnsubscribe']),
    inviteImg(qrcode) {
      const {
        image,
        qrcode_h = 200,
        qrcode_w = 200,
        qrcode_x = 0,
        qrcode_y = 0,
      } = this.inviteInfo.image || {}
      return inviteImgPs(
        qrcode,
        image,
        { left: qrcode_x, top: qrcode_y, width: qrcode_w, height: qrcode_h },
      )
    },
    getData() {
      this.getInviteInfo().catch(this.snackBar.error)
      this.getList()
    },
    getList(page = null) {
      this.searching = true
      if (page !== null) this.pageConfig.page = page
      if (this.t === 1) {
        this.getInviteRecords(this.pageC(this.pageConfig))
          .catch(this.snackBar.error)
          .then(() => {
            this.searching = false
          })
      } else {
        this.getRebaseRecords(this.pageC(this.pageConfig))
          .catch(this.snackBar.error)
          .then(() => {
            this.searching = false
          })
      }
    },
    copy(text) {
      copyText(text)
        .then(val => this.snackBar.info(this.$t(val)))
        .catch(e => this.snackBar.error(this.$t(e)))
    },
  },
  beforeMount() {
    this.getData()
    this.link.value = window.location.origin + this.link.value
    this.getSymbols().then(() => {
      this.listenPrices()
    }).catch(this.snackBar.error)
    this.getInviteData()
  },
  beforeDestroy() {
    this.listenPricesUnsubscribe()
  },
}
</script>
