<template>
  <page-container class="container-inner article-wrap" :title="$t(type)">
    <query :queryFn="queryFn" :noResult="!info" class="content article-content"
           @error="log('Article:', $event)">
      <template v-if="info">
        <h1>{{info.title}}</h1>
        <span class="subhead"><!--{{info.author}}&nbsp;&nbsp;&nbsp;&nbsp;-->
        {{info.dateline|datePipe('')}}</span>
        <div v-html="info.content"></div>
      </template>
    </query>
  </page-container>
</template>

<script>
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
      return (this.articles.news && this.articles.news[this.id]) || null
    },
  },
  methods: {
    ...mapActions('article', ['getArticle']),
    queryFn() {
      return this.getArticle({ id: this.id, type: 'news' }).catch(this.snackBar.error)
    },
  },
}
</script>
