<template>
  <div class="my-exchange">
    <tab v-model="tab.value" :options="tab.options"
         :style="tabStyle.wrap"
         :tabStyle="tabStyle.tab"
         :selectedStyle="tabStyle.selected"/>
    <my-table :type="tableType"
              :heads="tab.value==='open'?openHeads:historyHeads" :sort="false"
              :data="showData"
              :headTrStyle="tableStyle.head"
              :trStyle="tableStyle.tr"
              :scrollbarProps="{isMobile, maxHeight: 'calc(3.3rem - .32rem - .3rem)'}">
      <template v-if="tab.value==='open'">
        <button v-for="(t, i) in showData" class="btn-cancel"
                :key="i" :slot="i+'-'+(openHeads.length-1)" @click="click(i)">
          {{$t('order.cancel')}}
        </button>
      </template>
      <template v-else>
        <template v-for="(t, i) in showData">
          <button v-if="isButton(data[i].status)" class="btn-cancel font-green"
                  :key="i" :slot="i+'-'+(historyHeads.length-1)" @click="click(i)">
            {{t.status}}
          </button>
          <span v-else class="cancel" :key="i" :slot="i">{{t.status}}</span>
        </template>
      </template>
    </my-table>
    <pagination :config="pageConfig" :noPage="true" @to="pageConfig.page=$event"/>
    <my-overlay v-if="showOverlay&&showOverlay.type==='details'" @close="showOverlay.rej()"
                :head="$t('order')+' '+showOverlay.item.id+'('+showOverlay.item.pair+')'">
      <my-table class="table"
                type="extend"
                :scrollbarProps="{isMobile, maxHeight: '50vh'}"
                :sort="false"
                :heads="detailsHeads(showOverlay.feeAsset)"
                :data="showOverlay.item.children"
                :trStyle="overlayTableStyle.tr"
                :headTrStyle="overlayTableStyle.head"/>
    </my-overlay>
  </div>
</template>

<script>
import MyOverlay from 'components/client/MyOverlay'
import Tab from 'components/client/Tab'
import Status from 'data/immutable-data/Status'
import { headsDeal } from 'utils/HeadsDeal'
import { mapActions } from 'vuex'

// 币币交易页面·我的委托·组件
export default {
  name: 'MyExchange',
  props: {
    coin: {
      default() {
        return { precision: {} }
      },
      type: Object,
    },
    tabStyle: {
      default() {
        return {}
      },
      type: Object,
    },
    tableStyle: {
      default() {
        return {}
      },
      type: Object,
    },
    data: {
      default() {
        return []
      },
      type: Array,
    },
    tableType: {
      default: 'extend',
      type: String,
    },
    pageSize: Number,
  },
  data() {
    return {
      tab: {
        value: 'open',
        options: [
          { name: 'open-order', value: 'open' },
          { name: 'order-history', value: 'history' },
        ],
      },
      heads: {
        base: [
          {
            name: 'date',
            alias: 'date',
            style: { width: '21%', whiteSpace: 'nowrap', textAlign: 'left' },
          },
          {
            name: 'pair',
            alias: 'symbol1',
            style: { width: '11.5%', whiteSpace: 'nowrap', textAlign: 'left' },
          },
          {
            name: 'type',
            alias: 'type',
            style: { width: '7%', whiteSpace: 'nowrap', textAlign: 'left' },
          },
          {
            name: 'price(base)',
            alias: 'price',
            style: { width: '11.6%', whiteSpace: 'nowrap', textAlign: 'left' },
          },
          {
            name: 'amount(name)',
            alias: 'amount',
            style: { width: '11.6%', whiteSpace: 'nowrap', textAlign: 'left' },
          },
          {
            name: 'total(base)',
            alias: 'total',
            style: { width: '11.6%', whiteSpace: 'nowrap', textAlign: 'left' },
          },
          {
            name: 'executed',
            alias: 'deal_stock',
            style: { width: '8.8%', whiteSpace: 'nowrap', textAlign: 'left' },
          },
        ],
        open: [
          {
            name: 'unexecuted',
            alias: 'left',
            style: { width: '8.8%', whiteSpace: 'nowrap', textAlign: 'left' },
          },
          { name: 'action', style: { width: '7%', whiteSpace: 'nowrap', textAlign: 'right' } },
        ],
        history: [
          {
            name: 'average',
            alias: 'average',
            style: { width: '8%', whiteSpace: 'nowrap', textAlign: 'left' },
          },
          {
            name: 'status',
            style: { width: '8.3%', whiteSpace: 'nowrap', textAlign: 'right' },
          },
        ],
        details: [
          {
            name: 'commission',
            alias: 'fee',
            style: {
              width: '11%',
              whiteSpace: 'nowrap',
              textAlign: 'right',
              padding: '0 .2rem 0 .1rem',
            },
          },
        ],
      },
      overlayTableStyle: {
        head: {
          height: '.42rem',
          border: 'none',
        },
        tr: {
          height: '.36rem',
          border: 'none',
        },
      },
      showOverlay: null,
      pageConfig: this.initPage(),
    }
  },
  computed: {
    baseHeads() {
      return headsDeal.call(this, this.heads.base, this.coin)
    },
    openHeads() {
      return [...this.baseHeads, ...this.heads.open]
    },
    historyHeads() {
      return [...this.baseHeads, ...this.heads.history]
    },
    showData() {
      return this.convert(this.data, this.tab.value === 'open' ? 'mtime' : 'ftime')
    },
  },
  watch: {
    'data'({ length }) {
      this.pageConfig.currPageSize = length
    },
    'tab.value': {
      handler() {
        this.initPage()
        this.emitPage()
      },
      immediate: true,
    },
    'pageConfig': {
      handler() {
        this.emitPage()
      },
      immediate: true,
    },
    'pageConfig.page'() {
      this.emitPage()
    },
  },
  methods: {
    ...mapActions('exchange', ['tradeCancel', 'orderReferences']),
    convert(arr, timeAlias) {
      return arr && arr.map((item) => {
        const type = Status.orderType[item.side]
        const status = Status.orderStatus[item.status]
        const color = this.getColor(type.name === Status.orderType[1].name ? -1 : 1)
        const { precision } = this.coin
        const price = +item.type === 2 ? this.$t('exchange.market') : this.numTrim(item.price, precision.price)
        let amount = this.numTrim(item.amount, precision.amount)
        let total = this.numTrim(item.total, precision.total)
        if (+item.type === 2) {
          if (type.name === 'buy-1') {
            amount = '--'
          } else {
            total = '--'
          }
        }
        return {
          ...item,
          type: `<span class="${color}" style="font-size:inherit">${this.$t(type.name)}</span>`,
          price: `<span class="${color}" style="font-size:inherit">${price}</span>`,
          amount,
          total,
          deal_stock: this.numTrim(item.deal_stock, precision.total),
          left: this.numTrim(item.left, precision.total),
          average: this.numTrim(item.average, precision.price),
          date: this.dateFormatter(item[timeAlias], 'YYYY-MM-DD HH:mm:ss'),
          ...status ? { status: this.$t(status.name) } : {},
        }
      })
    },
    initPage() {
      this.pageConfig = {
        page: 1,
        pageSize: this.pageSize || 30,
        currPageSize: 0,
      }
      return this.pageConfig
    },
    isButton(status) {
      return status !== Status.orderStatus.CANCELED.value
    },
    click(index) {
      const market = `${this.coin.name}_${this.coin.base}`
      const item = this.showData[index]
      const order_id = item.id
      if (this.tab.value === 'open') {
        this.tradeCancel({ market, order_id }).then(() => {
          this.snackBar.info(this.$t('cancel.success'))
        }).catch(this.snackBar.error)
      } else {
        new Promise((res, rej) => {
          this.orderReferences({ order_id }).then((result) => {
            this.showOverlay = {
              type: 'details',
              feeAsset: item.type.indexOf('卖出') > -1 ? this.coin.base : this.coin.name,
              item: {
                id: order_id,
                pair: market,
                children: result.records.map(item1 => ({
                  ...item1,
                  date: this.dateFormatter(item1.time),
                  total: this.numTrim(item1.price * item1.amount, 8),
                })),
              },
              res,
              rej,
            }
          })
        }).catch((e) => {
          if (!e) this.showOverlay = null
        })
      }
    },
    detailsHeads(feeAsset) {
      return [
        {
          ...this.baseHeads[0],
          style: { ...this.baseHeads[0].style, padding: '0 .1rem 0 .2rem' },
        },
        ...this.baseHeads.slice(3, 6),
        ...this.heads.details
          .map((item, i) => (
            i === 0 ? { ...item, name: `${this.$t(item.name)}(${feeAsset})`, needTran: false }
              : item)),
      ]
    },
    emitPage() {
      this.$emit('pageChange', { type: this.tab.value, ...this.pageC(this.pageConfig) })
    },
  },
  components: { Tab, MyOverlay },
}
</script>
