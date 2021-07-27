<template>
  <div v-if="info.id" class="my-order">
    <router-link class="link" to="/user-center/security/pay-set">{{$t('pay.set')}}</router-link>
    <tab-head v-model="tab.value" :options="tab.options"/>
    <query :queryFn="getList" :noResult="!data||data.length<1" :queryAgain="queryAgain"
           :noResultStyle="style" :loadingStyle="style" @error="log('MyOrder:', $event)">
      <order-pin v-for="o in data" :order="o" :key="o.ID" @refresh="getList"/>
    </query>
    <pagination :config="pageConfig" :noPage="true"
                @to="pageConfig.page=$event;queryAgain=true"/>
  </div>
</template>

<script>
import OrderPin from 'components/client/OrderPin'
import TabHead from 'components/client/user-center/TabHead'
import Status from 'data/immutable-data/Status'
import { mapActions, mapState } from 'vuex'

// 我的C2C订单
export default {
  name: 'MyOrder',
  data() {
    const options = Object.keys(Status.cashOrderStatus).reduce((pre, k) => {
      const item = Status.cashOrderStatus[k]
      const item2 = pre.find(i => i.aliasName && i.aliasName === item.aliasName)
      if (item2) {
        item2.value = `${item2.value},${item.value}`
      } else {
        const item1 = { ...item, name: item.aliasName || item.name }
        pre.push(item1)
      }
      return pre
    }, [])
    return {
      tab: {
        value: options[0].value,
        options,
      },
      queryAgain: false,
      style: { top: 0 },
      pageConfig: {
        page: 1,
        pageSize: 10,
        currPageSize: 0,
      },
    }
  },
  computed: {
    ...mapState('exchange', ['orderHistory']),
    ...mapState('user', ['info']),
    data() {
      return this.orderHistory
        .filter(item => this.tab.value.toString().includes(item.status))
    },
  },
  watch: {
    'tab.value'() {
      this.pageConfig.page = 1
      this.queryAgain = true
    },
    info() {
      this.pageConfig.page = 1
      this.queryAgain = true
    },
  },
  methods: {
    ...mapActions('exchange', ['getCashOrders']),
    getList() {
      return this.info.id
        ? this.getCashOrders({ status: this.tab.value, ...this.pageC(this.pageConfig) })
          .then((res) => {
            this.pageConfig = {
              ...this.pageConfig,
              currPageSize: res.length,
            }
          })
          .catch(this.snackBar.error)
          .then(() => {
            this.queryAgain = false
          })
        : Promise.resolve('no-query')
    },
  },
  components: { OrderPin, TabHead },
}
</script>
