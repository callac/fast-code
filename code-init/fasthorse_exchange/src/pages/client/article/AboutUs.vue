<template>
  <page-container class="container-inner about-us" :title="$t('about-us')">
    <div class="content article-content">
      <h1>{{$t('about-us')}}</h1>
      <div class="txt-content"  v-html="article.content"></div>
    </div>
  </page-container>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  name: 'AboutUs',
  beforeMount() {
    this.getAboutArticle(this.id).catch(this.snackBar.error)
  },
  data() {
    return {
      id: 'about-us',
    }
  },
  computed: {
    ...mapState('article', ['aboutArticles']),
    article() {
      return this.aboutArticles[this.id] || {}
    },
  },
  methods: {
    ...mapActions('article', ['getAboutArticle']),
  },
}
</script>
