<template>
  <page-container class="container-inner article-wrap" :title="$t(type)">
    <nav-head :nav="nav"></nav-head>
    <div class="content">
      <div class="wrap">
        <h1 class="detail-title">{{detailTitle}}</h1>
        <query class="right" :queryFn="queryFn" :noResult="!list||list.length<1"
               :queryAgain="queryAgain" @error="log('HelpList:',$event)">
          <msg-pin v-for="(m,i) in list" :msg="m"
                   :route=
                     "'/newDetail/'+
                     m.id+'.html'"
                   :key="i"/>
          <pagination :config="pageConfig" @to="pageConfig.page=$event;queryAgain=true"/>
        </query>
      </div>
    </div>
  </page-container>
</template>

<script>

import NavHead from '@/page-zt/components/user-center/NavHead'
import MsgPin from '../../components/MsgPin/MsgPin'
import { mapActions, mapGetters, mapState } from 'vuex'

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
    classId() {
      const t = this.classesArr[this.type]
      return 206 || (t && t[0] && t[0].id)
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
    nav() {
      return {
        value: 3,
        options: [
          // { name: this.$t('help-center'), url: '/help' },
          { name: '新闻资讯', url: '' },
        ],
      }
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
          ...this.pageC(this.pageConfig) })
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
  components: { MsgPin, NavHead },
}
</script>
