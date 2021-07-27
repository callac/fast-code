<template>
  <div>
    <nav-head :nav="nav"></nav-head>
    <page-container class="container-inner article-wrap" :title="$t(type)">
      <news-aside/>
      <query :queryFn="queryFn" :noResult="!info" class="content article-content"
             style="width: 9.6rem;"
             @error="log('Article:', $event)">
        <template v-if="info">
          <h1>{{info.title}}</h1>
          <span class="subhead"><!--{{info.author}}&nbsp;&nbsp;&nbsp;&nbsp;-->
        {{info.dateline|datePipe('')}}</span>
          <div v-html="info.content" style="word-wrap:break-word; overflow: hidden"></div>
        </template>
      </query>
    </page-container>
  </div>
</template>

<script>
import NavHead from '@/page-zt/components/user-center/NavHead'
import NewsAside from '@/page-zt/client/article/NewsAside'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'Article',
  data() {
    return {}
  },
  computed: {
    ...mapState('article', ['articles']),
    id() {
      return this.$route.params.id.split('.')[0]
    },
    type() {
      return this.$route.params.type
    },
    info() {
      return (this.articles.help && this.articles.help[this.id]) || null
    },
    classId() {
      return 206
    },
    detailTitle() {
      return this.$route.query.detailTitle || ''
    },
    nav() {
      return {
        value: 3,
        options: [
          { name: '新闻资讯', url: '/new' },
          { name: this.info ? this.info.title : '', url: '' },
        ],
      }
    },
  },
  watch: {
    id() {
      this.queryFn()
    },
  },
  methods: {
    ...mapActions('article', ['getArticle']),
    queryFn() {
      return this.getArticle({ id: this.id, type: 'help' }).catch(this.snackBar.error)
    },
  },
  components: {
    NewsAside,
    NavHead,
  },
}
</script>
