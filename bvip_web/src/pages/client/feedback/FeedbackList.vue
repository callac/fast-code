<template>
  <page-container class="feedback-list" :title="title">
    <div class="content container-inner">
      <h1>
        {{title}}
        <div class="search-wrap">
          <!--<input class="search"-->
          <!--type="text"-->
          <!--:value="keyword.currValue"-->
          <!--:placeholder="$t(keyword.placeholder)"-->
          <!--@input="setKeyword">-->
          <!--<span class="iconfont icon-search"></span>-->
          <router-link class="new font-main" to="/feedback/new">{{$t('feedback.new')}}</router-link>
        </div>
      </h1>
      <my-table :heads="heads"
                :data="list"
                @clickTr="go">
        <button class="btn btn-main"
                v-for="(l, i) in list"
                :key="l.id"
                :slot="i+'-'+(heads.length-1)">{{rT}}
        </button>
      </my-table>
      <pagination :config="pageConfig" @to="pageConfig.page=$event"/>
    </div>
  </page-container>
</template>

<script>
import Templates from 'data/immutable-data/Templates'
import Debounce from 'utils/Debounce'
import { mapActions, mapState } from 'vuex'

const showOrder = ['phone', 'email', 'title', 'createdAt', 'updatedAt']

export default {
  name: 'List',
  data() {
    return {
      pageConfig: {
        page: 1,
        pageSize: 10,
        pages: 0,
      },
      keyword: {
        currValue: '',
        placeholder: 'asset.search-1',
        value: '',
        debonce: new Debounce(),
      },
    }
  },
  computed: {
    ...mapState('feedback', ['list']),
    title() {
      return this.$t('feedback.list')
    },
    heads() {
      return [
        ...Templates.generator('feedback', {
          order: showOrder,
          dealFn: (k, _item) => ({
            ..._item,
            sort: false,
            formatter: _item.formatter || ((item, alias) => item[alias] || '--'),
          }),
        }),
        { type: 'operation', style: { textAlign: 'right' } },
      ]
    },
    rT() {
      return this.$t('reply')
    },
  },
  watch: {
    'pageConfig.page'() {
      this.getRecords()
    },
    'keyword.value'() {
      this.getRecords()
    },
  },
  methods: {
    ...mapActions('feedback', ['getList']),
    getRecords() {
      return this.getList({ ...this.pageC(this.pageConfig), keyword: this.keyword.value })
        .then((res) => {
          this.pageConfig = {
            ...this.pageConfig,
            pages: res.total / this.pageConfig.pageSize,
          }
        })
        .catch(this.snackBar.error)
    },
    setKeyword(ev) {
      const { target: { value } } = ev
      this.keyword.currValue = value
      this.keyword.debonce.handle(() => {
        this.keyword.value = value
      })
    },
    go(index) {
      this.$router.push(`/feedback/${this.list[index].ID}`)
    },
  },
  created() {
    this.getRecords()
  },
}
</script>
