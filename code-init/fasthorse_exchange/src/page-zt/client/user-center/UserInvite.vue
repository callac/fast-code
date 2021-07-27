<template>
  <page-container class="user-content user-invite" :title="$t('user.invite')">
    <div class="assets-manager-title">{{$t('user.invite')}}</div>
    <div class="my-info" v-if="inviteData.is_open_activity">
      <div class="super-broker">
        <a :href="inviteTo">
          <div class="name">
            <!--<p>{{$t('invite.you')}}</p>-->
            <!--<p class="value">-->
              <!--{{inviteData.invite_level === '金牌经纪人'-->
              <!--? $t('invite.related')-->
              <!--: (inviteData.invite_level === '银牌经纪人'-->
              <!--? $t('invite.unrelated') : '&#45;&#45;')}}-->
              <!--<img :src="inviteData.invite_level === '金牌经纪人' ? hat1 : hat2" alt="">-->
            <!--</p>-->
            <p>{{$t('invite.head.1')}}</p>
            <p class="value">
              {{$t('invite.head.2')}}
              <img :src="inviteData.invite_level === '金牌经纪人' ? hat1 : hat2" alt="">
            </p>
            <img :src="inviteData.invite_level === '金牌经纪人' ? hat1 : hat2" alt="">
          </div>
        </a>
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
            {{$t('invite.receive')}}({{$currencyObj.unit}})
            <span class="value">{{brokeMoney || 0.00}}</span>
          </div>
        </div>
        <div class="annotation">* {{$t('invite.tip-1')}}</div>
      </div>
    </div>
    <!--<div class="invite-code">-->
      <!--<span class="label">ID</span>-->
      <!--<span>{{info.id}}</span>-->
    <!--</div>-->
    <!--<div class="invite-code">-->
      <!--<span class="label">VIP</span>-->
      <!--<span>{{info.vip}}</span>-->
    <!--</div>-->
    <div class="invitation-way">
      <div class="invitation-title">{{$t('invite.method')}}</div>
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
          <img class="mini" :src="link.qrcode" alt="" @mouseenter="showImg" @mouseleave="hideImg">
          <section class="wrap transition" :class="{'has-bg':hasBg}" ref="bigImg">
            <img-tag class="bigger"
                     :src="hasBg?inviteImg(link.qrcode):link.qrcode"
                     alt=""/>
            <span v-if="!hasBg" class="tip">{{$t('invite.tip')}}</span>
          </section>
        </div>
      </div>
    </div>
    <tab-head
      v-model="tab1.value"
      style="margin-bottom: 0"
      :options="inviteData.is_open_activity ? tab1.options : tab1.options.slice(0, 1)"/>
    <my-table class="invite-table" :heads="this.t === 1 ? heads : heads2"
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
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  name: 'UserInvite',
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
  data() {
    return {
      isZt: /(127\.0\.0\.1)|(47\.97\.206\.151)|(zt\.com)/.test(window.location.origin),
      tab1: {
        value: 'records',
        options: [
          { name: 'invite.records', value: 'records' },
          { name: this.$t('invite.rebate'), value: 'rebase' },
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
        { name: 'invite.relation', alias: 'levelName', style: { textAlign: 'center' } },
        { name: 'invite.account-1.id', alias: 'user_id', style: { textAlign: 'center' } },
        { name: 'invite.account.id', alias: 'recommend_user_id', style: { textAlign: 'center' } },
        { name: 'status', alias: 'statusName', style: { textAlign: 'center' } },
        {
          name: 'sign-up.time',
          alias: 'CreatedAt',
          style: { textAlign: 'center' },
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
      hat1: require('assets/client/user-center/zt/hat1@2x.png'),
      hat2: require('assets/client/user-center/zt/hat2@2x.png'),
    }
  },
  computed: {
    ...mapState('user', ['info', 'inviteData', 'inviteRecords', 'rebaseRecords', 'inviteInfo', 'inviteTop']),
    ...mapState('exchange', ['exchangeRate']),
    ...mapGetters('market', ['symbolsArr']),
    data() {
      const records = this.inviteRecords && this.inviteRecords.recordsC
      return records && records.map(item => ({
        ...item,
        statusName: this.$t(item.status ? 'authorized' : 'unauthorized'),
        rewardsStr: item.rewards && Object.keys(item.rewards).reduce((pre, k) => `${pre ? `${pre},` : ''}${item.rewards[k]}${k}`, ''),
        levelName: item.level && item.level === 1 ? this.$t('invite.related1') : this.$t('invite.unrelated1'),
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
        invite_level: this.$t(item.invite_level === 1 ? this.$t('invite.related') : this.$t('invite.unrelated')),
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
        { name: 'invite.account.id', alias: 'invite_user_id', style: { textAlign: 'center' } },
        { name: 'invite.relation', alias: 'invite_level', style: { textAlign: 'center' } },
        { name: 'status', alias: 'user_auth', style: { textAlign: 'center' } },
        { name: `${this.$t('invite.last')}(${this.$currencyObj.unit})`, alias: 'new_balance', needTran: false, style: { textAlign: 'center' } },
        { name: `${this.$t('invite.total')}(${this.$currencyObj.unit})`, alias: 'balance', needTran: false, style: { textAlign: 'center' } },
      ]
    },
    inviteTo() {
      return `/activity/Superbroker/${this.inviteData.is_open_two_invite ? 'InviteCommission' : 'InviteCommission_2'}`
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
    'tab1.value'(newValue, oldValue) {
      console.log(newValue, oldValue)
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
    showImg() {
      this.$refs.bigImg[0].style.opacity = 1
    },
    hideImg() {
      this.$refs.bigImg[0].style.opacity = 0
    },
  },
  components: { TabHead, MyInput },
}
</script>
