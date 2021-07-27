<template>
  <div class="exchange-forms">
    <tab v-model="formType.value" :options="formType.options"
         :style="tabStyle.wrap"
         :tabStyle="tabStyle.tab"
         :selectedStyle="tabStyle.selected" ref="tab"/>
    <div v-if="assetInfo"
         class="tab-pos"
         @click="showIntro">{{$t('asset.details')}}
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
      <scroll-bar v-else-if="assetInfo"
                  class="info-wrap"
                  :maxHeight="maxHeight">
        <h4>
          {{assetInfo.asset_code}}
          <span class="full-name">{{assetInfo.full_name}}</span>
        </h4>
        <div class="info"
             v-for="(item, i) in items"
             :key="i">
          <span class="name">{{$t(item.name)}}</span>
          <a v-if="item.link&&assetInfo[item.alias]"
             class="value font-main"
             :href="assetInfo[item.alias]">
            {{ellipsis(assetInfo[item.alias]||'--', 70)}}</a>
          <span v-else-if="!item.fullWidth"
                class="value"
                :class="{'font-main': item.em||item.link,}">
            {{item.formatter?item.formatter(assetInfo[item.alias])
            :ellipsis(assetInfo[item.alias]||'--', 70)}}
          </span>
          <span v-else class="value full-width">
            {{assetInfo[item.alias]}}</span>
        </div>
      </scroll-bar>
    </div>
    <overlay-confirm v-if="showOverlay"
                     :tipText="$t('unauthorized.tip')"
                     :confirmText="$t('authorize')"
                     @close="showOverlay.rej()"
                     @cancel="showOverlay.rej()"
                     @confirm="$router.push('/user-center/security/certification')"/>
  </div>
</template>

<script>
import ExchangeForm from 'components/client/ExchangeForm'
import Tab from 'components/client/Tab'
import { dataDeal } from 'utils/DataDeal'
import { posFixedNumber } from 'utils/InputFormatter'
import ScrollBar from 'vue-scrollbar-live'
import { mapActions, mapGetters, mapState } from 'vuex'

const limitFormGenerator = (unit, name, alias, value = '', precision = 8) => ({
  id: Math.random(),
  name,
  alias,
  inputType: 'text',
  placeholder: name,
  preFormatter: posFixedNumber(precision),
  unit,
  value,
  requiredInPage: false,
})

const marketFormGenerator = (unit, name, alias, type, precision = 8) => ({
  id: Math.random(),
  name,
  alias,
  inputType: 'text',
  unit,
  value: '',
  preFormatter: posFixedNumber(precision),
  defaultVal: !name ? `exchange.by.market-price.${type}` : '',
  canEdit: !!name,
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
        ],
      },
      showOverlay: null,
      introState: false, // 资产详情弹窗
      // 基准资产介绍项
      items: [
        {
          name: 'asset.issue-date',
          alias: 'release_time',
          formatter: val => this.dateFormatter(val, 'YYYY-MM-DD'),
        },
        { name: 'asset.total-supply', alias: 'release_total', em: true },
        { name: 'asset.circulating-supply', alias: 'circulation_total', em: true },
        { name: 'asset.official-website', alias: 'official_website', link: true },
        { name: 'asset.white-paper', alias: 'white_paper', link: true },
        { name: 'asset.block-query', alias: 'block_query', link: true },
        // { name: 'asset.founding-team', alias: 'founding_team' },
        { name: 'asset.recommend-organization', alias: 'recommend_organization' },
        { name: 'info.brief', alias: 'desc', fullWidth: true },
      ],
      maxHeight: '',
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
            sell: ['price.sell', 'amount'],
            buy: ['price.buy', 'amount'],
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
          const alias = ['', 'amount']
          const name = { sell: alias, buy: ['', 'total'] }
          const precisions = {
            sell: [this.precision.price, this.precision.amount],
            buy: [this.precision.price, this.precision.price],
          }
          this.market = {
            ...this.market,
            sell: [val.base, val.name]
              .map((u, i) => marketFormGenerator(u, name.sell[i], alias[i], 'sell', precisions.sell[i])),
            buy: [val.base, val.base]
              .map((u, i) => marketFormGenerator(u, name.buy[i], alias[i], 'buy', precisions.buy[i])),
          }
        }
      }
    },
    submit(type) {
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
          this.snackBar.info(this.$t('order.success'))
          this.init(this.coin, this.formType.value, true)
        })
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
    // 资产详情弹出
    showIntro() {

    },
  },
  components: { ExchangeForm, Tab, ScrollBar },
}
</script>
