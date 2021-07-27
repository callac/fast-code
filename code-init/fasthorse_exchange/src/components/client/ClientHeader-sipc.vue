<template>
  <header class="client-header transition" :class="{'home':homeHeader}">
    <div class="content">
      <img class="logo" :src="siteInfo.logo" alt="LOGO" @click="$router.push('/')"/>
      <nav class="nav">
        <template v-for="(r,i) in nav">
          <router-link v-if="r.route"
                       class="a"
                       :class="{active: r.route === $route.path}"
                       :key="i"
                       :to="r.route">
            {{r.needTran===false?r.name:$t(r.name)}}
          </router-link>
          <a v-else class="a" target="_blank" :href="r.href" :key="i">
            {{r.needTran===false?r.name:$t(r.name)}}
          </a>
        </template>
      </nav>
      <user-pin v-if="hasUserPin"/>
      <conversion-currency/>
      <lang-pin/>
    </div>
  </header>
</template>

<script>
import ConversionCurrency from 'components/client/ConversionCurrency'
import LangPin from 'components/client/LangPin'
import UserPin from 'components/client/UserPin-sipc'
import { orderBy } from 'utils/Sort'
import { mapActions, mapGetters, mapState } from 'vuex'

// 页头
export default {
  name: 'ClientHeader',
  beforeMount() {
    this.getHeaders().catch(this.snackBar.error)
  },
  data() {
    return {}
  },
  computed: {
    ...mapState(['headers']),
    ...mapGetters(['siteInfo']),
    nav() {
      return orderBy([
        { name: 'asset', route: '/user-center/assets-manage', order: 0 },
        { name: 'sipc.exchange.coin', route: '/exchange', order: 1 },
        ...(this.siteInfo.c2cEnabled
          ? [{ name: 'sipc.exchange.cash', route: '/exchange/cash', order: 2 }] : []),
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
    hasUserPin() {
      return !['/sign-in', '/sign-up', '/password/reset'].includes(this.$route.path)
    },
  },
  methods: {
    ...mapActions(['getHeaders']),
  },
  components: { UserPin, LangPin, ConversionCurrency },
}
</script>
