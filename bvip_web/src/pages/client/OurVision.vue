<template>
  <page-container class="container-inner our-vision">
    <div v-if="symbolsArrC" class="market">
      <vue-seamless-scroll :data="mainPrices" :class-option="optionLeft" class="seamless-warp2">
        <table class="scroll-box">
          <tr>
            <td v-for="(p, i) in mainPrices" :key="i">
              <router-link class="main-price"
                           :to="'/exchange?coin='+p.symbol">
                <div>
                  <h2>{{p.base_asset}}/{{p.quote_asset}}
                    <em class="rate" :class="getColor(p.rate)">{{(p.rate||0).toFixed(2)+'%'}}</em>
                  </h2>
                  <em class="price" :class="getColor(p.rate)">
                    {{p.last||0}} <span class="unit">{{p.quote_asset}}</span></em>
                </div>
                <div>
                  <img
                    v-if="parseFloat(p.rate) < 0"
                    :src="require('assets/client/home/home-mj-wave-red.png')" alt="">
                  <img v-else :src="require('assets/client/home/home-mj-wave-green.png')" alt="">
                </div>
              </router-link>
            </td>
          </tr>
        </table>
      </vue-seamless-scroll>
    </div>
    <div class="banner-wraps">
      <p>{{$t('vision-banner')}}</p>
    </div>
    <div class="content-body">
      <div class="containers">
        <div class="cont1">
          <p>{{$t('vision-contain-1')}}</p>
          <p>{{$t('vision-contain-2')}}</p>
        </div>
        <div class="cont2">
          <p>{{$t('vision-contain-3')}}</p>
          <p>{{$t('vision-contain-4')}}</p>
        </div>
      </div>
      <div class="price-table">
        <div class="price-title">{{$t('vision-title')}}</div>
        <div class="table-detail">
          <div v-for="(item, idx) in tableDetail" :key="idx" class="table-item">
            <p>{{item.title}}</p>
            <p>{{item.text}}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="footer-img"></div>
  </page-container>
</template>

<script>
/* eslint-disable import/no-unresolved */
import { CustomCoin } from 'utils/CustomCoin'
import { symbolsMixin } from 'utils/HomeMixin'
import VueSeamlessScroll from 'vue-seamless-scroll'
import { mapActions } from 'vuex'

export default {
  name: 'Home',
  mixins: [symbolsMixin],
  beforeMount() {
    this.searching = true
    this.getSymbols().then(() => {
      this.listenPrices()
    }).catch(this.snackBar.error).then(() => {
      this.searching = false
    })
  },
  mounted() {
    // setTimeout(() => {
    //   this.getWidth()
    //   window.addEventListener('resize', this.getWidth)
    // }, 1000)
  },
  beforeDestroy() {
    this.listenPricesUnsubscribe()
    // window.removeEventListener('resize', this.getWidth)
  },
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
      swiperOption: {
        direction: 'vertical',
        height: 40,
        speed: 300,
        autoplay: {
          delay: 3000,
        },
      },
      searching: false,
      showIndex: 0,
      newsWidth: '',
      tableDetail: [
        {
          title: this.$t('vision-key-1'),
          text: this.$t('vision-value-1'),
        },
        {
          title: this.$t('vision-key-2'),
          text: this.$t('vision-value-2'),
        },
        {
          title: this.$t('vision-key-3'),
          text: this.$t('vision-value-3'),
        },
        {
          title: this.$t('vision-key-4'),
          text: this.$t('vision-value-4'),
        },
        {
          title: this.$t('vision-key-5'),
          text: this.$t('vision-value-5'),
        },
        {
          title: this.$t('vision-key-6'),
          text: this.$t('vision-value-6'),
        },
      ],
    }
  },
  computed: {
    appsDesc() {
      return this.$t(this.apps.desc).split('\n')
    },
    showBanners() {
      return this.banners.filter(b => b.endpoint === 'web')
    },
    mainPrices() {
      return this.symbolsArrC.filter(item => item.recommend)
    },
    tabOptions() {
      return this.tab.options.map(item => ({
        ...item,
        name: `${item.icon ? `<img src="${item.icon}" style="margin: 0 .1rem 0 0">` : ''}${item.value}`,
      }))
    },
    optionLeft() {
      return {
        direction: 2,
        limitMoveNum: 2,
      }
    },
  },
  watch: {
    'article.value'() {
      this.getArticleList()
    },
  },
  methods: {
    ...mapActions('market', ['getSymbols', 'listenPrices', 'listenPricesUnsubscribe', 'updateSymbol']),
    ...mapActions('article', ['getArticles']),
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
    goExchange(index) {
      const item = this.tableData[index]
      this.$router.push(`/exchange?coin=${item.symbol}`)
    },
  },
  components: { VueSeamlessScroll },
}
</script>
