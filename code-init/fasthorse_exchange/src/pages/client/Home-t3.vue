<template>
  <page-container class="container-inner home">
    <div class="banner-title">
      <!--<h2>{{$t('platform.title')}}</h2>-->
      <div class="title">
        <p>Global Exchange Platform</p>
        <div class="user-pin" v-if="!user.id">
          <router-link to="/sign-up">{{$t('sign-up')}}</router-link>
          <span>{{$t('is-sign-up')}}</span>
          <router-link to="/sign-in">{{$t('sign-in')}}</router-link>
        </div>
      </div>
    </div>
    <div class="banner-wrap">
      <banner :banners="showBanners"/>
    </div>
    <div class="announce-wrap">
      <div class="announce-content">
        <div class="announce-title">
          <span class="iconfont icon-horn"></span>
          <span class="h">{{$t('news.title')}} </span>
        </div>
        <div class="item">
          <span v-for="(item, idx) in announce" :key="idx">
            <router-link v-if="item.id"
                         :to="'/announce/'+item.id"
                         class="announce">
              {{item.title}}
            </router-link>
            {{announce.length-1 === idx ? '' : '/'}}
          </span>
        </div>
        <router-link style="color: #182933" to="/announce">
          {{$t('news.more')}}&gt;&gt;
        </router-link>
      </div>
    </div>
    <div v-if="symbolsArrC" class="market">
      <div v-if="mainPrices.length>2" class="main-prices">
        <router-link v-for="(p, i) in mainPrices" class="main-price" :key="i"
                     :to="'/exchange?coin='+p.symbol">
          <h2>
            <p>{{p.base_asset}}<span style="color: #8a9399;">/{{p.quote_asset}}</span></p>
            <p class="rate" :class="getBgColor(p.rate)">{{(p.rate||0).toFixed(2)+'%'}}</p>
          </h2>
          <span class="price">
            {{p.last||0}} <span class="unit">{{p.quote_asset}}</span></span>
        </router-link>
      </div>
      <div class="prices">
        <div class="search-wrap">
          <input class="search"
                 type="text"
                 :value="keyword.currValue"
                 :placeholder="$t(keyword.placeholder)"
                 @input="setKeyword">
          <span class="iconfont icon-search"></span>
          <div class="popper-wrap" v-if="keyword.searchSymbolList.length">
            <ul class="popper">
              <li class="popper-item" v-for="(item, idx) in keyword.searchSymbolList"
                  @click="selectSearchSymbol(item)"
                  :key="idx">{{item}}</li>
            </ul>
          </div>
        </div>
        <tab v-model="tab.value" :options="tabOptions" :tabStyle="{width: '20%'}"
             @input="cancelSelect"/>
        <div v-if="tableData.length">
          <my-table class="table changeTableStyle"
                    :heads="heads"
                    :data="tableData[0]&&tableData[0].arr"
                    :headTrStyle="{height:'.5rem',border:'none',opacity:'.6'}"
                    :trStyle="{display: 'none'}"
                    :searching="searching"
                    @select="select(tableData[$event].ID)"
                    @sort="setSort"
                    @error="log"/>
          <div class="table-wrap" v-for="(item, idx) in tableData" :key="idx">
            <div class="table-title" v-if="tab.value !== 'custom'">{{item.tn}}</div>
            <my-table class="table changeTableStyle"
                      :heads="heads"
                      :data="item.arr"
                      :headTrStyle="{height:'.5rem',border:'none',opacity:'.6',display: 'none'}"
                      :trStyle="{border:'1px solid #F4F4F6'}"
                      :searching="searching"
                      @select="select(item.arr[$event].ID)"
                      @sort="setSort"
                      @error="log">
              <template v-for="(r,i) in item.arr" :slot="i+'-1'">
                <router-link :to="`/exchange?coin=${r.symbol}`"
                             :key="i"
                             class="table-value">{{r.base_asset}}/
                  <span class="about-value">{{r.quote_asset}}</span>
                </router-link>
              </template>
            </my-table>
          </div>
        </div>
        <div class="no-data" v-else>
          没有查询到内容！
        </div>
      </div>
    </div>
    <section class="features">
      <div class="items">
        <section v-for="(item, i) in features.items" class="item" :key="i">
          <!-- <img v-if="i%2===0" class="transition" :src="item.icon"/> -->
          <div class="item-head">
            <img :src="item.icon" alt="">
          </div>
          <div class="item-text">
            <p class="title">{{$t(item.name)}}</p>
            <p class="describe">{{$t(item.desc)}}</p>
          </div>
          <!-- <img v-if="i%2===1" class="transition" :src="item.icon"/> -->
        </section>
      </div>
    </section>
    <section class="apps">
      <div class="apps-content">
        <div class="phone-img">
          <img :src="require('assets/client/home/home-t3-phone.png')" alt="">
        </div>
        <div class="app-downs">
          <div class="explain">
            <p>{{$t('apps.title')}}</p>
            <p>{{$t('apps.desc')}}</p>
          </div>
          <div class="app-btns">
            <!--<a :href="item.link" v-for="(item, idx) in apps" :key="idx"
            class="btn" target="_blank">-->
            <div v-for="(item, idx) in apps" :key="idx" class="btn">
              <i class="iconfont" :class="item.icon"></i>
              <span>{{item.name}}</span>
              <div class="down-code-layer">
                <div class="down-tips">扫码下载App</div>
                <img :src="item.img"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <app-down/>
    <overlay v-if="showOverlay">
      <div class="overlayBox">
        <div class="head">
          <span class="iconfont icon-info-circle"></span>
          <span>{{$t('statement.title')}}</span>
        </div>
        <div class="context">
          {{statements.localStatement}}
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
  </page-container>
</template>

<script>
/* eslint-disable import/no-unresolved */
import AppDown from 'components/client/AppDown'
import Banner from 'components/client/Banner-t3'
import Tab from 'components/client/Tab-t3'
import { CustomCoin } from 'utils/CustomCoin'
import { orderBy, homeSymbolSort } from 'utils/Sort'
// import { calcRate } from 'utils/DataDeal'
import { mapActions, mapState } from 'vuex'
import Debounce from 'utils/Debounce'
import Storage from 'utils/StorageX'
import { QrCode } from '../../utils/Utils'
// import { isMobile } from '../../utils/UserAgent'
import { symbolsMixin } from '../../utils/HomeMixin'

export default {
  name: 'Home',
  components: { Tab, Banner, AppDown },
  mixins: [symbolsMixin],
  data() {
    return {
      wrap: '',
      tab: {
        value: 'custom',
        options: [
          { value: 'custom' },
        ],
      },
      sortType: {},
      searching: false,
      features: {
        title: 'advantages.title',
        desc: 'advantages.desc',
        items: [
          {
            name: 'advantages.2.title',
            desc: 'advantages.2.desc',
            icon: require('assets/client/home/home-adv-1-<<template>>-<<theme>>.png'),
          },
          {
            name: 'advantages.3.title',
            desc: 'advantages.3.desc',
            icon: require('assets/client/home/home-adv-2-<<template>>-<<theme>>.png'),
          },
          {
            name: 'advantages.4.title',
            desc: 'advantages.4.desc',
            icon: require('assets/client/home/home-adv-3-<<template>>-<<theme>>.png'),
          },
          {
            name: 'advantages.6.title',
            desc: 'advantages.6.desc',
            icon: require('assets/client/home/home-adv-4-<<template>>-<<theme>>.png'),
          },
        ],
      },
      article: {
        value: 'news',
        options: [
          { name: 'news.title', value: 'news', route: '/article/announce' },
          // { name: 'help', value: 'help', route: '/article/help' },
        ],
      },
      showIndex: 0,
      newsWidth: '',
      asset: '',
      keyword: {
        currValue: '',
        placeholder: 'search-coin',
        value: '',
        searchSymbolList: [],
        debonce: new Debounce(),
        isSelect: false,
        selectSymbol: '',
      },
      showOverlay: false,
      statements: {
        localStatement: '',
        statementArr: [],
      },
      noDisturb: false,
      checkedSymbolClass: '',
    }
  },
  computed: {
    ...mapState('market', ['quoteAssets', 'symbolClasses']),
    ...mapState('article', ['articleList']),
    ...mapState(['banners', 'siteInfo']),
    ...mapState('user', {
      user: state => state.info,
    }),
    apps() {
      return [
        {
          name: this.$t('android'),
          icon: 'icon-android',
          img: require('assets/android.png'),
          link: this.siteInfo.android_url,
        },
        {
          name: this.$t('ios'),
          icon: 'icon-iphone',
          img: require('assets/ios.png'),
          link: this.siteInfo.ios_url,
        },
      ]
    },
    newsItemStyle() {
      return { width: `calc(${this.newsWidth}px / 3)` }
    },
    showArticle() {
      const { options, value } = this.article
      return options.find(item => item.value === value) || {}
    },
    left() {
      return `calc(100% / 3  * ${-this.showIndex} + ${this.newsWidth}px / 6)`
    },
    articleTitle() {
      return (this.article.options.find(op => op.value === this.article.value) || {}).name
    },
    articles() {
      return [...((this.articleList[this.article.value] || {})[this.article.value] || [])]
    },
    // announce() {
    //   return this.articles[this.articles.length - 1] || {}
    // },
    announce() {
      return this.articles || []
    },
    appsDesc() {
      return this.$t(this.apps.desc).split('\n')
    },
    showBanners() {
      return this.banners.filter(b => b.endpoint === 'web')
    },
    heads() {
      const formatter = (item, alias) => {
        const val = item[alias] || 0
        return `<span class="table-value">${val}</span><br><span class="about-value">${this.$cEx(item[`${alias}1`])}</span>`
      }
      return [
        {
          type: 'select',
          style: { width: '3%', whiteSpace: 'nowrap', paddingRight: '0' },
          checkboxStyle: { margin: '0 0 0 .05rem' },
        },
        {
          name: 'pair',
          alias: 'symbolObj',
          sort: 'symbol',
          // formatter: (item) => {
          //   const { base_asset, quote_asset } = item
          //   return `<a href="/exchange?coin=${item.symbol}" class="table-value">
          // ${base_asset}/<span class="about-value">${quote_asset}</span></a>`
          // },
          style: { width: '13.5%' },
        },
        {
          name: 'coin',
          alias: 'base_asset_name',
          formatter: (item, alias) => item[alias] || item.base_asset,
          style: { width: '15%' },
        },
        {
          name: 'last-price',
          alias: 'last',
          formatter,
          style: { textAlign: 'left', width: '10%' },
        },
        {
          name: 'max-price',
          alias: 'high',
          formatter,
          style: { textAlign: 'left', width: '10%' },
        },
        {
          name: 'min-price',
          alias: 'low',
          formatter,
          style: { textAlign: 'left', width: '10%' },
        },
        {
          name: 'change',
          alias: 'rate',
          formatter: (item) => {
            const value = `${(item.rate || 0).toFixed(2)}%`
            const color = this.getColor(item.rate)
            return `<span class="${color}">${value}</span>`
          },
          style: { textAlign: 'center', width: '8%' },
        },
        {
          name: '24h-vol',
          alias: 'volume',
          formatter: (item, alias) => `<span>${item[alias]}</span>`,
          style: { textAlign: 'right', width: '15%' },
        },
        {
          type: 'goto',
          style: { width: '5%', whiteSpace: 'nowrap', textAlign: 'center' },
          formatter: item => (item.three_icon ? `<a href="${item.three_url}" style="opacity: 1" target="_blank">
              <img src=${item.three_icon} alt="" width="36px" height="36px">
            </a>` : ''),
        },
      ]
    },
    mainPrices() {
      return this.symbolsArrC.filter(item => item.recommend).splice(0, 5)
    },
    tableData() {
      if (!this.symbolsArrC) return []
      if (this.keyword.isSelect) {
        return homeSymbolSort(this.symbolsArr.filter(item => (item.symbol1 === this.keyword.selectSymbol)), 'quote_asset')
      }
      const val = this.tab.value
      // if (val === 'all') {
      //   return homeSymbolSort(this.symbolsArr, 'quote_asset')
      // }
      const classes_id = this.symbolClasses.filter(item => (item.name === val))[0]
        && this.symbolClasses.filter(item => (item.name === val))[0].ID
      const { alias = 'volume', value = 'desc' } = this.sortType
      // console.log('symbolsArr1=================')
      // console.log(this.symbolsArr1)
      const result = homeSymbolSort((alias && value
        ? orderBy(this.symbolsArrC,
          this.arrC.includes(alias) ? alias + 1 : alias,
          value,
          this.arrC.includes(alias))
        : this.symbolsArrC)
        .filter(item => (
          /* eslint-disable */
          val === 'all' ? true :
            (val === 'custom' ? item.tableSelected
            : (this.filterTab.indexOf(val) > -1
              ? this.filterPlate(item.classes, classes_id)
              : item.quote_asset === val)))), 'quote_asset')
      /* eslint-enable */
      // console.log(result)
      return result
    },
    tabOptions() {
      return this.tab.options.map(item => ({
        ...item,
        name: `${item.icon ? `<img src="${item.icon}" style="margin: 0 .1rem 0 0">` : ''}${item.value}`,
      }))
    },
    filterTab() {
      // return this.symbolClasses.map(item => item.shorthand === val)
      const tab = []
      this.symbolClasses.forEach((item) => {
        tab.push(item.name)
      })
      return tab
    },
    optionLeft2() {
      return {
        singleHeight: window.isMobile ? 120 : 40, // 单步运动停止的高度(默认值0是无缝不停止的滚动) direction => 0/1
        waitTime: 2500, // 单步运动停止的时间(默认值1000ms)
        step: 1,
        limitMoveNum: 1,
      }
    },
    searchSymbol() {
      return this.symbolsArr.map(item => (item.symbol1))
    },
  },
  watch: {
    'article.value'() {
      this.getArticleList()
    },
    articles(val) {
      this.showIndex = val && val.length > 3 ? val.length - 3 : 0
    },
    quoteAssets() {
      this.initTab()
    },
    'tab.value'(n) {
      if (n !== 'custom' && n !== 'all') {
        const haveStatement = this.statements.statementArr.find(item => (item.name === n && item.statement !== ''))
        this.checkedSymbolClass = this.symbolClasses.filter(item => item.name === n)[0].ID
        const haveClass = localStorage.getItem('noDisturbArr') && (localStorage.getItem('noDisturbArr').indexOf(this.checkedSymbolClass) !== -1)
        if (haveStatement && !haveClass) {
          this.statements.localStatement = haveStatement.statement
          this.showOverlay = true
        }
      }
      if (n !== this.keyword.selectSymbol.split('/')[1]) {
        this.keyword.isSelect = false
      }
    },
  },
  methods: {
    ...mapActions('market', ['getSymbols', 'listenPrices', 'listenPricesUnsubscribe', 'updateSymbol', 'getSymbolClasses']),
    ...mapActions('article', ['getArticles']),
    ...mapActions('user', ['getCustom', 'sycCustom', 'getUserInfo']),
    initTab() {
      if (this.quoteAssets.length > 0) {
        const options = [
          // ...this.quoteAssets.map(as => ({ ...as, needTran: false })),
          { value: 'custom' },
          { value: 'all' },
          ...orderBy(this.symbolClasses,
            'display_order',
            'asc',
            true)
            .map(as => (
              {
                name: as.shorthand,
                value: as.name,
                classed_id: as.ID,
                needTran: false,
                icon: as.icon })),
        ]
        // 获取包含声明的tab
        this.statements = {
          localStatement: '',
          statementArr: this.symbolClasses
            .filter(item => (item.statement !== undefined || item.statement !== '' || item.statement !== null))
            .map(item => ({ statement: item.statement, name: item.name })),
        }
        this.tab = {
          options,
          value: options[1].value,
        }
      }
    },
    select(ID) {
      const item = this.symbolsArrC.find(i => i.ID === ID);
      (!item.tableSelected ? CustomCoin.addCustom(item.ID) : CustomCoin.delCustom(item.ID))
        .then(() => {
          item.tableSelected = item.tableSelected ? '' : 'checked'
          this.updateSymbol(item)
        })
        .catch(this.snackBar.error)
    },
    setSort(val) {
      this.sortType = val
    },
    getArticleList() {
      if (this.articles.length < 1) {
        this.getArticles({ type: this.article.value }).catch(this.snackBar.error)
      } else if (this.articles.length > 3) {
        this.showIndex = this.articles.length - 3
      }
    },
    toPrev() {
      const index = this.showIndex - 1
      if (index > -1) {
        this.showIndex = index
      }
    },
    toNext() {
      const index = this.showIndex + 1
      if (index < this.articles.length - 1) {
        this.showIndex = index
      }
    },
    getWidth() {
      this.newsWidth = this.$refs.newsEl.clientWidth
    },
    backStyle(url) {
      return {
        background: `url(${url}) no-repeat center center / auto`,
      }
    },
    bgStyle(url, i) {
      if (i === 0) {
        return {
          background: `url(${url}) no-repeat left center / auto`,
        }
      }
      return {
        background: `url(${url}) no-repeat 1.6rem center / auto`,
        borderRight: 'none',
        paddingLeft: '3.2rem',
        paddingRight: 0,
      }
    },
    getBgColor(value) {
      const val = parseFloat(value)
      if (val > 0) return 'bg-green'
      return val === 0 || Number.isNaN(val) ? 'bg-ray' : 'bg-red'
    },
    setKeyword(ev) {
      const { target: { value } } = ev
      this.keyword.currValue = value
      this.keyword.debonce.handle(() => {
        this.keyword.value = value
        if (value !== '') {
          // console.log(this.symbolsArr)
          this.keyword.searchSymbolList = this.searchSymbol.filter(item => (item.split('/')[0].indexOf(value.toUpperCase()) !== -1))
        } else {
          this.keyword.searchSymbolList = []
        }
      })
    },
    cancelSelect(v) {
      if (v !== this.keyword.currValue) {
        this.keyword.isSelect = false
      }
    },
    selectSearchSymbol(item) {
      this.tab = {
        ...this.tab,
        value: item.split('/')[1],
      }
      this.keyword = {
        ...this.keyword,
        isSelect: true,
        selectSymbol: item,
        currValue: '',
        searchSymbolList: [],
      }
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
      this.showOverlay = false
      this.noDisturb = false
    },
  },
  beforeMount() {
    this.searching = true
    this.getSymbolClasses()
    this.getSymbols().then(() => {
      // const result = res
      // result.map((item) => {
      //   item.rate = calcRate(item.last, item.open)
      //   return item
      // })
      // this.symbolsArrC = result
      this.listenPrices()
    }).catch(this.snackBar.error).then(() => {
      this.searching = false
    })
    this.getArticleList()
    this.initTab()
    // if (isMobile()) {
    //   this.getUserInfo().then((res) => {
    //     if (!res.id) {
    //       window.location.replace('/mobile/home')
    //     }
    //   }).catch(() => {
    //     window.location.replace('/mobile/home')
    //   })
    // }
  },
  mounted() {
    // console.log(this.symbolsArr.map(item => (item.symbol1)))
    if (this.user && this.user.id) {
      this.getCustom().then((res) => {
        const sto = new Storage()
        const customCoin = sto.get('custom-coin') || []
        const lastCustom = Array.from(new Set(customCoin.concat(res.map(item => (item.symbol_id)))))
        sto.set('custom-coin', lastCustom)
        const cions = lastCustom.join(',')
        this.sycCustom(cions)
      })
    }
    /* eslint-disable */
    try {
      this.apps.map((item) => {
        QrCode(item.link).then((dUrl) => {
          item.img = dUrl
        })
      })
    }catch (e) {
    }
  },
  beforeDestroy() {
    this.listenPricesUnsubscribe()
    // window.removeEventListener('resize', this.getWidth)
  },
}
</script>
