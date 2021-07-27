<template>
  <page-container class="container-inner article-wrap" :title="$t(type)">
    <div class="content">
      <h1 class="h1">{{$t(type)}}</h1>
      <!--<help-aside/>-->
      <query :queryFn="queryFn" :noResult="list&&list.length<1" :queryAgain="queryAgain"
             @error="log('ArticleList:', $event)">
        <msg-pin v-for="(m,i) in list" :msg="m" :route="'/'+type+'/'+m.id+'.html'" :key="i"/>
        <pagination :config="pageConfig" @to="pageConfig.page=$event;queryAgain=true"/>
      </query>
    </div>
  </page-container>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import MsgPin from '../../components/MsgPin/MsgPin'
// import HelpAside from 'components/client/HelpAside'

export default {
  name: 'ArticleList',
  data() {
    return {
      pageConfig: {
        total: 1,
        pages: 1,
        page: 1,
        pageSize: 10,
      },
      queryAgain: false,
    }
  },
  computed: {
    ...mapState('article', ['articleList']),
    type() {
      // return this.$route.params.type
      return 'announce'
    },
    list() {
      const t = (this.articleList.news || {})
      return t.news && t.news.map(item => ({
        ...item,
        brief: item.description || item.title,
        createdAt: item.dateline,
      }))
    },
  },
  watch: {
    type() {
      this.pageConfig.page = 1
    },
  },
  methods: {
    ...mapActions('article', ['getArticles']),
    queryFn() {
      this.queryAgain = false
      return this.getArticles({
        type: 'news',
        ...this.pageC(this.pageConfig),
      })
        .then((res) => {
          this.pageConfig = {
            ...this.pageConfig,
            total: res.total,
            pages: Math.ceil(res.total / this.pageConfig.pageSize),
          }
        })
        .catch(this.snackBar.error)
    },
  },
  components: { MsgPin },
}
</script>
