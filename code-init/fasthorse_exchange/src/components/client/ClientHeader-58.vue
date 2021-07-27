<template>
  <header class="content client-header transition"
          :class="{'home':homeHeader, 'bg': homeHeader&&homeBg,'header-1':otherHeader}">
    <img class="logo" :src="siteInfo.logo" alt="ZT区块链数字资产交易平台" @click="$router.push('/')"/>
    <nav v-if="!otherHeader" class="nav">
      <template v-for="(r,i) in nav">
        <router-link v-if="r.route" class="a" :key="i" :to="r.route">
          {{r.needTran===false?r.name:$t(r.name)}}
        </router-link>
        <a v-else class="a" target="_blank" :href="r.href" :key="i">
          {{r.needTran===false?r.name:$t(r.name)}}
        </a>
      </template>
    </nav>
    <header-coins v-else/>
    <user-pin v-if="hasUserPin"/>
    <conversion-currency/>
    <lang-pin/>
  </header>
</template>

<script>
import ConversionCurrency from 'components/client/ConversionCurrency'
import HeaderCoins from 'components/client/HeaderCoins-58'
import LangPin from 'components/client/LangPin-58'
import UserPin from 'components/client/UserPin-58'
import { orderBy } from 'utils/Sort'
import { mapActions, mapGetters, mapState } from 'vuex'

// 页头
export default {
  name: 'ClientHeader-zg',
  beforeMount() {
    this.getHeaders().catch(this.snackBar.error)
  },
  data() {
    return {
      homeBg: false,
    }
  },
  computed: {
    ...mapState(['headers']),
    ...mapGetters(['siteInfo']),
    nav() {
      return orderBy([
        { name: 'exchange.coin', route: '/exchange', order: 1 },
        ...(this.siteInfo.c2cEnabled
          ? [{ name: 'exchange.cash', route: '/exchange/cash', order: 2 }] : []),
        { name: 'announce', route: '/article/announce', order: 3 },
        // { name: 'help', route: '/article/help', order: 4 },
        ...this.headers.map(h => ({
          name: h.label_name,
          href: h.api_url,
          order: +h.order,
          needTran: false,
        })),
      ], 'order')
    },
    homeHeader() {
      return ['/home', '/'].includes(this.$route.path)
    },
    otherHeader() {
      return ['/exchange'].find(route => route === this.$route.path)
    },
    hasUserPin() {
      return !['/sign-in', '/sign-up', '/password/reset'].includes(this.$route.path)
    },
  },
  methods: {
    ...mapActions(['getHeaders']),
  },
  components: { UserPin, LangPin, HeaderCoins, ConversionCurrency },
}
</script>
