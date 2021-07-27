<template>
  <div class="header-coins exchange-aside">
    <section>
      <div class="coins" ref="AsideCoin">
        <div v-for="(c, j) in coins" class="zone-tab"
             @click="checkTab(j, c.name, c.statement)"
             :class="{'selected':index===j}"
             :key="j">
          {{c.needTran ? $t(c.name) : c.name}}
        </div>
      </div>
      <div class="search-container">
        <input type="text" v-model="keyWord" placeholder="搜索"/>
        <span class="icon" @click="doSearch">
          <img :src="require('assets/client/exchange/icon-search.png')">
        </span>
      </div>
      <exchange-table type="extend"
                      style="height: 0.36rem;"
                      :heads="tableHeads"
                      :data="[]"
                      :headTrStyle="{height: '.36rem',fontSize:'0.1rem', paddingLeft: '0.15rem'}"
                      :trStyle="{height: '.28rem',cursor:'pointer', display: 'none'}"
                      @select="select(item.arr[$event].ID)"
                      @clickTr="chose(index, item.arr[$event].ID)"
                      @sort="sortType=$event"/>
      <scroll-bar class="ts">
        <exchange-table class="coins-table changeTableStyle"
                        v-show="searchState"
                        type="extend"
                        :heads="tableHeads"
                        :data="searchList"
                        :headTrStyle="{height: '.36rem',fontSize:'0.1rem', display: 'none'}"
                        :trStyle="{height: '.28rem',cursor:'pointer'}"
                        @select="select(searchList[$event].ID)"
                        @clickTr="chose(index, searchList[$event].ID)"/>
        <exchange-table class="coins-table changeTableStyle"
                        v-show="customState && customList.length > 0"
                        type="extend"
                        :heads="tableHeads"
                        :data="customList"
                        :headTrStyle="{height: '.36rem',fontSize:'0.1rem', display: 'none'}"
                        :trStyle="{height: '.28rem',cursor:'pointer'}"
                        @select="select(customList[$event].ID)"
                        @clickTr="chose(index, customList[$event].ID)"/>
        <div class="tsw">
          <div v-show="!searchState && !customState"
               class="table-wrap"
               v-for="(item, idx) in tableData[index]"
               :key="idx">
            <div class="table-title">{{item.tn ? item.tn : ''}}</div>
            <exchange-table class="coins-table changeTableStyle"
                            type="extend"
                            :heads="tableHeads"
                            :data="item.arr ? item.arr : []"
                            :headTrStyle="{height: '.36rem',fontSize:'0.1rem', display: 'none'}"
                            :trStyle="{height: '.28rem',cursor:'pointer'}"
                            @select="select(item.arr[$event].ID)"
                            @clickTr="chose(index, item.arr[$event].ID)"
                            @sort="sortType=$event"/>
          </div>
          <div v-if="tableData[index]&&tableData[index].length === 0" style="padding-top: 50%;">
            <div class="no-result-icon">
              <img :src="require('assets/tradingview/empty.png')"/>
            </div>
            <div class="no-result">
              {{$t('result.no.record')}}
            </div>
          </div>
        </div>
      </scroll-bar>
    </section>
    <!--风险提示-->
    <overlay v-if="showOverlay">
      <div class="overlayBox">
        <div class="head">
          <span class="iconfont icon-info-circle"></span>
          <span>{{$t('statement.title')}}</span>
        </div>
        <div class="context">
          {{localStatement}}
        </div>
        <div class="btn-wrap">
          <p @click="showOverlay = false">{{$t('statement.btn')}}</p>
        </div>
      </div>
    </overlay>
    <overlay v-if="showStatement">
      <div class="overlayBox">
        <div class="head">
          <span class="iconfont icon-info-circle"></span>
          <span>{{$t('statement.title')}}</span>
        </div>
        <div class="context">
          {{statementContent}}
        </div>
        <div class="btn-wrap">
          <p class="checkbox" @click="noDisturb = !noDisturb">
            <span>
              <i v-if="noDisturb" class="iconfont icon-xuanzhong"></i>
              <i v-else class="iconfont icon-fangkuang"></i>
            </span>
            {{$t('no-disturb')}}
          </p>
          <p class="btn" @click="closeOverlay">{{$t('statement.btn')}}</p>
        </div>
      </div>
    </overlay>
  </div>
</template>

<script>
import ExchangeTable from 'components/tradingview/ExchangeTable'
import { CustomCoin } from 'utils/CustomCoin'
import { symbolsMixin } from 'utils/HomeMixin'
import { orderBy, homeSymbolSort } from 'utils/Sort'
import { mapActions, mapState } from 'vuex'
import ScrollBar from 'vue-scrollbar-live'

// 币币交易页面显示在 header 的交易对列表信息
export default {
  name: 'HeaderCoins',
  mixins: [symbolsMixin],
  // beforeMount() {
  //   setTimeout(() => {
  //     this.getSymbolClasses()
  //     this.getSymbols().then(() => {
  //       this.listenPrices()
  //     })
  //     this.initTab()
  //   }, 3000)
  // },
  mounted() {
    if (this.symbolsArrC.length === 0) {
      this.getSymbolClasses()
      this.getSymbols()
    }
    this.getListenPrices();
  },
  destroyed() {
    this.listenPricesUnsubscribe()
  },
  data() {
    return {
      searchState: false, // 搜索状态
      searchList: [], // 搜索列表
      customState: false,
      tab: {
        value: 'all',
        options: [
          { value: 'all' },
          { value: 'custom' },
        ],
      },
      sortType: {
        alias: 'symbol1',
        value: 'asc',
      },
      keyWord: '', // 搜索值
      index: 1,
      showOverlay: false, // 风险提示弹窗状态
      showStatement: false,
      statementContent: '',
      localStatement: '', // 风险提示内容
      noDisturb: false,
      checkedSymbolClass: '',
    }
  },
  components: {
    ExchangeTable,
    ScrollBar,
  },
  computed: {
    ...mapState('market', ['symbols', 'quoteAssets', 'symbolClasses']),
    coins() {
      if (this.symbolsArrC.length < 1) return []
      // const items = this.symbolsArrC.filter(item => item.symbol !== this.$route.query.coin)
      const items = this.symbolsArrC
      const { alias = 'volume', value = 'desc' } = this.sortType
      const result = [
        { name: 'custom', needTran: true, statement: '' },
        { name: 'all', needTran: true, statement: '' },
        ...orderBy(this.symbolClasses,
          'display_order',
          'asc',
          true).map(item => ({
          ...item,
          needTran: false,
        })),
      ].map(key => ({
        // name: key ? `${key} ${this.$t('ex-zone')}` : this.$t('custom'),
        ...key,
        coins: homeSymbolSort((alias && value
          ? orderBy(items,
            this.arrC.includes(alias) ? alias + 1 : alias,
            value)
          : items)
          .filter(item => (
            /* eslint-disable */
            key.name === 'all' ? item
              : (key.name === 'custom'
              ? item.tableSelected
              : (this.filterTab().indexOf(key.name) > -1
              ? this.filterPlate(item.classes, key.ID)
              : item.quote_asset === key.name)))),  'quote_asset'),
      }))
      // console.log(result)
      return result
    },
    customList() {
      return this.symbolsArrC.filter(item => item.tableSelected)
    },
    heads() {
      return [
        {
          type: 'select',
          style: { padding: '0 0.05rem 0 .2rem', width: '0.2rem' },
          checkboxStyle: { marginLeft: '-.05rem' },
        },
        { name: 'coin',
          alias: this.index === 0 ? 'symbol1' : 'base_asset',
          style: { padding: 0, textAlign: 'left', marginLeft: '-.05rem' },
          formatter: (item) => {
            const coin = (this.index === 0 || this.searchState
              || this.index > this.quoteAssets.length)
              ? item.symbol1 : item.base_asset
            if (item.symbol === this.$route.query.coin) {
              return `<span class="selected">${coin}</span>`
            }
            return `${coin}`
          },
        },
        {
          name: 'last-price',
          alias: 'last',
          // sort: false,
          style: { padding: 0, textAlign: 'right' },
          formatter: (item, alias) => {
            const price = item[alias] || 0
            return `${price}<span style="margin: 0 0 0 .06rem;font-size: .14rem;">${this.$cEx(item[`${alias}1`])}</span>`
          },
        },
        {
          name: 'change',
          alias: 'rate',
          style: { padding: '0 .2rem 0 0', textAlign: 'right' },
          formatter: (item) => {
            const value = `${(item.rate || 0).toFixed(2)}%`
            const color = this.getColor(item.rate)
            return `<span class="${color}">${value}</span>`
          },
        },
        { name: 'max-price', alias: 'high' },
        { name: 'min-price', alias: 'low' },
        { name: '24h-vol', alias: 'volume' },
      ]
    },
    myHeads() {
      return this.heads.slice(1)
    },
    tableHeads() {
      return this.heads.slice(0, 4)
        .map(item => (item.alias === 'last' ? {
          ...item,
          formatter: null,
          style: { whiteSpace: 'nowrap', textAlign: 'right' },
        } : item))
    },
    tableData() {
      return this.coins.map(zone => zone.coins)
    },
    coin() {
      const name = this.$route.query.coin
      const symbol = this.symbols[name] || this.symbols[Object.keys(this.symbols)[0]]
      return symbol ? this.dealSymbol(symbol) : {}
    },
  },
  watch: {
    'coin.symbol': {
      handler(val) {
        if (val) {
          this.$router.replace(`${this.$route.path}?coin=${val}`)
        }
      },
      immediate: true,
    },
    keyWord() {
      this.doSearch()
    },
  },
  methods: {
    ...mapActions('market', [ 'listenPrices', 'listenPricesUnsubscribe', 'updateSymbol', 'getSymbolClasses', 'getSymbols']),
    // 检测是否推送k线
    getListenPrices() {
      if(this.symbolsArrC.length>0){
        console.log('发送websocket推送')
        this.listenPrices()
      }else{
        setTimeout(()=>{
          this.getListenPrices()
        },3000)
      }
    },
    // initTab() {
    //   if (this.quoteAssets.length > 0) {
    //     const options = [
    //       // ...this.quoteAssets.map(as => ({ ...as, needTran: false })),
    //       { value: 'all' },
    //       { value: 'custom' },
    //       ...orderBy(this.symbolClasses,
    //         'display_order',
    //         'asc',
    //         true)
    //         .map(as => (
    //           {
    //             name: as.shorthand,
    //             value: as.name,
    //             classed_id: as.ID,
    //             needTran: false })),
    //     ]
    //     this.tab = {
    //       options,
    //       value: options[0].value,
    //     }
    //   }
    // },
    select(ID) {
      const item = this.symbolsArrC.find(i => i.ID === ID);
      (!item.tableSelected ? CustomCoin.addCustom(item.ID) : CustomCoin.delCustom(item.ID))
        .then(() => {
          item.tableSelected = item.tableSelected ? '' : 'checked'
          this.updateSymbol(item)
        })
        .catch(this.snackBar.error)
    },
    chose(index, ID) {
      let item = {}
      item = this.symbolsArrC.filter(item => item.ID === ID)[0]
      this.$router.replace(`${this.$route.path}?coin=${item.symbol}`)
    },
    checkTab(i, name, statement) {
      if (name === 'custom') {
        this.customState = true
      } else {
        this.customState = false
      }
      if (name !== 'custom' && name !== 'all') {
        this.checkedSymbolClass = this.symbolClasses.filter(item => item.name === name)[0].ID
        const haveClass = localStorage.getItem('noDisturbArr') && (localStorage.getItem('noDisturbArr').indexOf(this.checkedSymbolClass) !== -1)
        if (statement !== '' && !haveClass)  {
          this.showStatement = true
          this.statementContent = statement
        }
      }
      if (i >= 3) {
        this.$refs.AsideCoin.scrollLeft = 15 * i;
      } else {
        this.$refs.AsideCoin.scrollLeft = 0;
      }
      // 创业板块
      // if (i > this.quoteAssets.length) {
      //   this.localStatement = this.symbolClasses[i - this.quoteAssets.length - 1].statement
      //   if (this.localStatement) {
      //     this.showOverlay = true
      //   }
      // }
      // this.tab.value = i
      this.index = i
      this.doSearch()
    },
    // 搜索
    /* eslint-disable */
    doSearch() {
      this.searchState = true
      if (this.keyWord !== '') {
        let items = []
        this.tableData[this.index].forEach(item => {
          items = items.concat(item.arr)
        })
        // console.log(items)
        this.searchList = items.filter(item => String(item.base_asset).indexOf(String(this.keyWord).toUpperCase()) !== -1)
      } else {
        this.searchList = []
        this.searchState = false
      }
    },
    filterTab() {
      // return this.symbolClasses.map(item => item.shorthand === val)
      const tab = []
      this.symbolClasses.forEach((item) => {
        tab.push(item.name)
      })
      return tab
    },
    filterPlate(arr, id) {
      if (arr.length) {
        return arr.map(item => (item.symbol_class_id)).includes(id)
      }
      return false
    },
    closeOverlay() {
      const disTurb = JSON.parse(localStorage.getItem('noDisturbArr')) || []
      if (this.noDisturb) {
        // if (disTurb) {
        //   console.log(disTurb)
        //   disTurb.push(this.checkedSymbolClass)
        //   localStorage.setItem('noDisturbArr', JSON.stringify(disTurb))
        // } else {
        //   const arr = []
        //   arr.push(this.checkedSymbolClass)
        //   localStorage.setItem('noDisturbArr', JSON.stringify(arr))
        // }
        disTurb.push(this.checkedSymbolClass)
        localStorage.setItem('noDisturbArr', JSON.stringify(disTurb))
      }
      this.showStatement = false
      this.noDisturb = false
    },
  },
}
</script>
