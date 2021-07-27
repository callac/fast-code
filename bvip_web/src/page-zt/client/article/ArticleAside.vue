<template>
  <page-container class="articleAside-wrap" :title="$t(type)">
    <div class="aside-content">
      <h1 class="h1">{{detailTitle}}</h1>
      <div class="aside-wrap">
        <query class="aside-right" :queryFn="queryFn" :noResult="!list||list.length<1"
               :queryAgain="queryAgain" @error="log('HelpList:',$event)">
          <msg-pin v-for="(m,i) in list" :msg="m" :noTime="false"
                   :class="{'router-link-active':parseInt(routeId)===parseInt(m.id)}"
                   :route=
                     "'/helpDetailArticle/'+
                     m.id+'.html?classId='+($route.query.classId||'')+
                     '&&detailTitle='+($route.query.detailTitle||'')"
                   :key="i"/>
          <!--<pagination :config="pageConfig" @to="pageConfig.page=$event;queryAgain=true"/>-->
          <div v-if="pageConfig.pages>1" class="more">
            <router-link
              :to="'/helpDetail?classId='
              +($route.query.classId||'')
              +'&detailTitle='
              +($route.query.detailTitle||'')">{{'查看更多'}}>></router-link>
          </div>
        </query>
      </div>
    </div>
  </page-container>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import MsgPin from '../../components/MsgPin/MsgPin'

export default {
  name: 'HelpDetail',
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
    routeId() {
      // console.log(this.$route.path)
      const ids = this.$route.path.split('/')
      return ids[ids.length - 1]
    },
    articleId() {
      return parseFloat(window.location.pathname.split('/')[4])
    },
    classId() {
      const t = this.classesArr[this.type]
      return this.$route.query.classId || (t && t[0] && t[0].id)
    },
    detailTitle() {
      return this.$route.query.detailTitle || ''
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
    articleId() {
      // console.log(this.articleId)
    },
  },
  methods: {
    ...mapActions('article', ['getArticles']),
    queryFn() {
      this.queryAgain = false
      let pro = Promise.resolve('no-query')
      if (this.classesArr[this.type] && this.classesArr[this.type].length > 0) {
        pro = this.getArticles({ type: this.type, class_id: this.classId })
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
  components: { MsgPin },
}
</script>
