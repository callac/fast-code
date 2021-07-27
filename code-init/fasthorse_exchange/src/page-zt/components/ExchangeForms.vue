<template>
  <div class="exchange-forms">
    <tab v-model="formType.value" :options="formType.options"
         :style="tabStyle.wrap"
         :tabStyle="tabStyle.tab"
         :selectedStyle="tabStyle.selected" ref="tab"/>
    <div v-if="assetInfo"
         class="tab-pos"
         :class="{selected: formType.value==='intro'}"
         @click="showIntro"
         >
      <span class="icon">
        <img :src="require('assets/client/exchange/icon-coin-intro.png')"/>
      </span>{{$t('asset.details')}}
    </div>
    <div class="forms-wrap">
      <template v-if="formType.value!=='intro'">
        <exchange-form v-for="(items, key) in (formType.value==='limit'?limit:market)"
                       :key="key"
                       :items="items"
                       :coin="coin.name"
                       :base="coin.base"
                       :type="formType.value"
                       :buttonType="key"
                       :precision="precision.total"
                       :submitFn="()=>submit(key)"/>
      </template>
    </div>
    <overlay-confirm v-if="showOverlay"
                     :tipText="$t('unauthorized.tip')"
                     :confirmText="$t('authorize')"
                     @close="showOverlay.rej()"
                     @cancel="showOverlay.rej()"
                     @confirm="$router.push('/user-center/security/certification')"/>
    <!--币种介绍弹窗-->
    <div class="intro-layer-container" v-if="introState">
      <div class="intro-layer">
        <div class="intro-layer-header">
          <div class="intro-pic">
            <img :src="assetInfo.icon"/>
          </div>
          <div class="intro-header-content">
            <div class="intro-header-name">
              {{assetInfo.asset_code}}
              <span class="full-name">{{assetInfo.full_name}}</span>
            </div>
            <div class="intro-header-info">
              {{assetInfo.desc}}
            </div>
          </div>
          <!--<h4>-->
            <!--{{assetInfo.asset_code}}-->
            <!--<span class="full-name">{{assetInfo.full_name}}</span>-->
          <!--</h4>-->
          <div class="close-btn" @click="introState=false">
            <img :src="require('assets/client/exchange/icon-close.png')">
          </div>
        </div>
        <div class="intro-layer-body">
          <div class="intro-sub-title">{{$t('info.base')}}</div>
          <div class="intro-body-content">
            <div class="info">
              <span class="name">{{$t('asset.full-name')}}</span>
              <span class="value">{{$t(assetInfo.full_name)}}</span>
            </div>
            <div class="info">
              <span class="name">{{$t('asset.block-query')}}</span>
              <a :href="assetInfo.block_query" target="_blank"
                 class="value">{{$t(assetInfo.block_query)}}</a>
            </div>
            <div class="info">
              <span class="name">{{$t('asset.official-website')}}</span>
              <a :href="assetInfo.official_website" target="_blank"
                 class="value">{{$t(assetInfo.official_website)}}</a>
            </div>
            <div class="info">
              <span class="name">{{$t('asset.founding-team')}}</span>
              <span class="value">{{$t(assetInfo.founding_team)}}</span>
            </div>
            <div class="info">
              <span class="name">{{$t('asset.white-paper')}}</span>
              <a :href="assetInfo.white_paper" target="_blank"
                 class="value">{{$t(assetInfo.white_paper)}}</a>
            </div>
            <div class="info">
              <span class="name">{{$t('asset.recommend-organization')}}</span>
              <span class="value">{{$t(assetInfo.recommend_organization)}}</span>
            </div>
          </div>
          <div class="intro-sub-title">{{$t('info.issue')}}</div>
          <div class="intro-body-content">
            <div class="info"
                 v-for="(item, i) in items"
                 :key="i">
              <span class="name">{{$t(item.name)}}</span>
              <a v-if="item.link&&assetInfo[item.alias]"
                 class="value"
                 :href="assetInfo[item.alias]">
                {{ellipsis(assetInfo[item.alias]||'--', 70)}}</a>
              <span v-else-if="!item.fullWidth"
                    class="value">
            {{item.formatter?item.formatter(assetInfo[item.alias])
            :ellipsis(assetInfo[item.alias]||'--', 70)}}
          </span>
              <span v-else class="value full-width">
            {{assetInfo[item.alias]}}</span>
            </div>
          </div>
          <div class="intro-sub-title">{{$t('asset.details-1')}}</div>
          <div class="intro-body-content" style="line-height: 1.5" v-html="assetInfo.detail">
          </div>
        </div>
      </div>
    </div>
    <!--委托提醒-->
    <my-overlay :head="$t('asset.commissioned-remind')" @close="commissionedOverlay=false"
                class="remind-layer" v-if="commissionedOverlay">
      <div class="withdraw-tips">
        <i class="icon">
          <img :src="require('assets/client/user-center/zt/icon-dange-red.png')"/>
        </i>
       {{$t('asset.continue.order')}}</div>
      <div class="remind-content">
        {{$t('asset.commissioned.tips1')}}
        <span class="price">{{$t('asset.entrusted-price')}}{{entrustedPrice}}</span>
        {{$t('asset.commissioned.tips2')}}
        <span class="price">{{$t('last-price')}}{{coin.last}}{{coin.quote_asset}}</span>
        {{$t('asset.commissioned.tips3')}}
        <span class="price">{{ratioVal}}%</span>
      </div>
      <div class="button-content">
        <button class="cancel-btn" @click="submit(type)">{{$t('asset.confirm-order')}}</button>
        <button class="enter-btn"
                @click="commissionedOverlay=false">{{$t('asset.cancel-order')}}</button>
      </div>
    </my-overlay>
  </div>
</template>

<script>
import Tab from 'components/client/Tab'
import MyOverlay from 'components/client/MyOverlay'
import { dataDeal } from 'utils/DataDeal'
import { posFixedNumber } from 'utils/InputFormatter'
import ScrollBar from 'vue-scrollbar-live'
import { mapActions, mapGetters, mapState } from 'vuex'
import ExchangeForm from './ExchangeForm'

const limitFormGenerator = (unit, name, alias, value = '', precision = 8) => ({
  id: Math.random(),
  name,
  alias,
  inputType: 'text',
  placeholder: '',
  preFormatter: posFixedNumber(precision),
  unit,
  value,
  requiredInPage: false,
})

// const marketFormGenerator = (unit, name, alias, type, precision = 8, i) => ({
//   id: Math.random(),
//   name,
//   alias,
//   inputType: 'text',
//   unit,
//   value: '',
//   preFormatter: posFixedNumber(precision),
//   defaultVal: i !== 0 ? `exchange.by.market-price.${type}` : '',
//   canEdit: i !== 0,
//   requiredInPage: false,
// })
/* eslint-disable */
const marketFormGenerator = (unit, name, alias, type, precision = 8, i) => ({
  id: Math.random(),
  name,
  alias,
  inputType: 'text',
  unit,
  value: i === 0 ? 0 : '',
  placeholder: '',
  preFormatter: posFixedNumber(precision),
  defaultVal: type ? `exchange.by.market-price.${type}` : '',
  canEdit: i === 0 ? false : true,
  requiredInPage: false,
})

const InitDataTypes = Object.freeze(['sell', 'buy'])

// 币币交易表单
export default {
  name: 'ExchangeForms',
  beforeMount() {
    this.init(this.coin)
  },
  mounted() {
    this.setMaxHeight()
  },
  props: {
    // 交易对信息
    coin: Object,
    // 用于表单值的初始化
    initData: Object, // {type, price, amount}, type: InitDataTypes
    tabStyle: {
      default() {
        return {}
      },
      type: Object,
    },
  },
  data() {
    return {
      // 限价表单项
      limit: {
        buy: null,
        sell: null,
      },
      // 市价表单项
      market: {
        buy: null,
        sell: null,
      },
      // 表单类型选项
      formType: {
        value: 'limit',
        options: [
          {
            name: 'exchange.limit',
            value: 'limit',
          },
          {
            name: 'exchange.market',
            value: 'market',
          },
          // 新增资产详情
          // {
          //   name: 'asset.details',
          //   value: 'intro',
          // },
        ],
      },
      showOverlay: null,
      introState: false, // 币种介绍弹出状态
      commissionedOverlay: false, // 委托提醒
      commissionedNumber: 0, // 点击次数
      // 基准资产介绍项
      items: [
        {
          name: 'asset.issue-date',
          alias: 'release_time',
          formatter: val => this.dateFormatter(val, 'YYYY-MM-DD'),
        },
        { name: 'asset.total-supply', alias: 'release_total', em: true },
        { name: 'asset.circulating-supply', alias: 'circulation_total', em: true },
        // { name: 'asset.official-website', alias: 'official_website', link: true },
        // { name: 'asset.white-paper', alias: 'white_paper', link: true },
        // { name: 'asset.block-query', alias: 'block_query', link: true },
        // { name: 'asset.founding-team', alias: 'founding_team' },
        // { name: 'asset.recommend-organization', alias: 'recommend_organization' },
        // { name: 'info.brief', alias: 'desc', fullWidth: true },
      ],
      maxHeight: '',
      entrustedPrice: '', //委托价
      ratio: '', // 偏离率
      type:'',
    }
  },
  computed: {
    ...mapState('user', ['info']),
    ...mapState('market', ['assetsInfo']),
    ...mapGetters(['siteInfo']),
    coinName() {
      return `${this.coin.name}_${this.coin.base}`
    },
    precision() {
      const { precision = {} } = this.coin || {}
      return precision
    },
    assetInfo() {
      return this.assetsInfo[this.coin.name]
    },
    // 委托提醒的百分比
    ratioVal(){
      if (this.ratio!=='') {
        const ratioList=String(this.ratio).split('.')
        if(ratioList.length>=2){
          const ratioVal = ratioList[0] + '.'+ String(ratioList[1]).slice(0,2)
          return ratioVal
        }else{
          return this.ratio
        }
      }else {
        return 0
      }
    },
  },
  watch: {
    'coinName': {
      handler() {
        this.init(this.coin)
        this.getAsInfo()
      },
      immediate: true,
    },
    initData() {
      this.init(this.coin)
    },
    '$route'() {
      this.formType.value = this.formType.options[0].value
    },
  },
  methods: {
    ...mapActions('exchange', ['tradeLimit', 'tradeByMarket']),
    ...mapActions('market', ['getAssetInfo']),
    getAsInfo() {
      return this.getAssetInfo(this.coin.name).catch(console.log)
    },
    init(val, type = '', reset) {
      if (val) {
        if (type === '' || type === this.formType.options[0].value) {
          const alias = ['price', 'amount']
          const name = {
            sell: ['price', 'amount'],
            buy: ['price', 'amount'],
          }
          const { type: type1 = '', price = '', amount = '' } = this.initData || {}
          const t = InitDataTypes.includes(type1) ? type1 : ''
          const p = price ? this.numTrim(price || 0, 8) : ''
          const a = amount && !reset ? this.numTrim(amount, 8) : ''
          const values = [
            {
              val: { buy: p, sell: p },
              precision: this.precision.price,
            },
            {
              val: t ? { [t]: a } : { buy: a, sell: a },
              precision: this.precision.amount,
            },
          ]
          this.limit = {
            ...this.limit,
            sell: [val.base, val.name]
              .map((u, i) => limitFormGenerator(u, name.sell[i], alias[i],
                values[i].val.sell || '', values[i].precision)),
            buy: [val.base, val.name]
              .map((u, i) => limitFormGenerator(u, name.buy[i], alias[i],
                values[i].val.buy || '', values[i].precision)),
          }
        }
        if (type === '' || type === this.formType.options[1].value) {
          const alias = ['price', 'amount']
          const name = { sell: alias, buy: ['price', 'total'] }
          const precisions = {
            sell: [this.precision.price, this.precision.amount],
            buy: [this.precision.price, this.precision.price],
          }
          this.market = {
            ...this.market,
            sell: [val.base, val.name]
              .map((u, i) => marketFormGenerator(u, name.sell[i], alias[i], 'sell', precisions.sell[i], i)),
            buy: [val.base, val.base]
              .map((u, i) => marketFormGenerator(u, name.buy[i], alias[i], 'buy', precisions.buy[i], i)),
          }
        }
      }
    },
    submit(type) {
      this.type=type
      // 判断登录
      if (!this.info.id) {
        this.$router.push(`/sign-in?redirectTo=${this.$route.fullPath}`)
        return false;
      }
      // 判断是否需要填写资金密码，是否实名认证
      if (this.siteInfo.is_preaudit && !this.info.identity_authenticated) {
        return new Promise((res, rej) => {
          this.showOverlay = { res, rej }
        }).catch((e) => {
          if (!e) this.showOverlay = null
        })
      }
      return this.validate(this[this.formType.value][type]).then(() => {
        // 委托提醒
        if(this.coin.alert_percent!==''){
          const mount =this[this.formType.value][type][0]
          const last=Number(this.coin.last)
          this.ratio = Math.abs((Number(mount.value)-last)/last) * 100
          if(!this.commissionedOverlay && this.formType.value === 'limit' && Number(this.ratio)/100>Number(this.coin.alert_percent)){
            if((type === 'buy' && Number(mount.value)>Number(this.coin.last)) || type === 'sell' && Number(mount.value)<Number(this.coin.last)){
              this.entrustedPrice=mount.value+mount.unit
              this.commissionedOverlay=true
              return false
            }
          }
        }
        if(this.commissionedOverlay && this.commissionedNumber !== 0){
          return false
        }
        this.commissionedNumber = this.commissionedNumber + 1
        const market = this.coinName
        const side = type === 'buy' ? 2 : 1
        return (this.formType.value === 'limit' ? this.tradeLimit({
          market,
          side,
          ...dataDeal(Object.keys(this.limit[type]).map(k => this.limit[type][k])),
        }) : this.tradeByMarket({
          market,
          side,
          ...dataDeal(Object.keys(this.market[type]).map(k => this.market[type][k])),
        })).then(() => {
          this.commissionedNumber = 0
          this.commissionedOverlay=false
          this.snackBar.info(this.$t('order.success'))
          this.init(this.coin, this.formType.value, true)
        }).catch(this.snackBar.error)
      })
    },
    // 设置基准资产介绍容器的最大高度
    setMaxHeight() {
      setTimeout(() => {
        const tab = this.$refs.tab && this.$refs.tab.$el
        if (tab) this.maxHeight = `calc(3.6rem - ${tab.offsetHeight}px)`
        else this.setMaxHeight()
      }, 200)
    },
    // 显示详情
    showIntro() {
      this.introState = true;
    },
  },
  components: { ExchangeForm, Tab, ScrollBar, MyOverlay },
}
</script>
