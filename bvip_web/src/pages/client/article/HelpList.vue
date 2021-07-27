<template>
  <page-container class="container-inner article-wrap" :title="$t(type)">
    <div class="content">
      <h1 class="h1">{{$t(type)}}</h1>
      <div class="wrap">
        <help-aside/>
        <query class="right" :queryFn="queryFn" :noResult="!list||list.length<1"
               :queryAgain="queryAgain" @error="log('HelpList:',$event)">
          <msg-pin v-for="(m,i) in list" :msg="m"
                   :route="'/article/help/'+m.id+'?classId='+($route.query.classId||'')" :key="i"/>
          <pagination :config="pageConfig" @to="pageConfig.page=$event;queryAgain=true"/>
        </query>
      </div>
    </div>
  </page-container>
</template>

<script>
import HelpAside from 'components/client/HelpAside'
import MsgPin from 'components/client/MsgPin'
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  name: 'HelpList',
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
    ...mapState('article', ['articleList', 'classes']),
    ...mapGetters('article', ['classesArr']),
    type() {
      return 'help'
    },
    classId() {
      const t = this.classesArr[this.type]
      return this.$route.query.classId || (t && t[0] && t[0].id)
    },
    list() {
      const t = this.articleList[this.type] || {}
      return t[this.classId] && t[this.classId].map(item => ({
        ...item,
        brief: item.description || item.title,
        createdAt: item.dateline,
      }))
    },
  },
  watch: {
    classId() {
      this.pageConfig.page = 1
      this.queryAgain = true
    },
    classes(val) {
      if (val[this.type] && Object.keys(val[this.type]).length > 0) {
        this.pageConfig.page = 1
        this.queryAgain = true
      }
    },
  },
  methods: {
    ...mapActions('article', ['getArticles']),
    queryFn() {
      this.queryAgain = false
      let pro = Promise.resolve('no-query')
      if (this.classesArr[this.type] && this.classesArr[this.type].length > 0) {
        pro = this.getArticles({
          type: this.type,
          class_id: this.classId,
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
      }
      return pro
    },
  },
  components: { MsgPin, HelpAside },
}
</script>
