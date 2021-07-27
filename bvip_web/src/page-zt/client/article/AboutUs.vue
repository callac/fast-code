<template>
  <page-container class="container-inner about-us" :title="$t('about-us')">
    <div class="content article-content">
      <div class="assets-manager-title">{{$t('about-us')}}</div>
      <div v-html="article.content" class="content-detail assets-manager-detail"></div>
    </div>
  </page-container>
</template>

<script>
import { mapActions, mapState } from 'vuex'
// import NavHead from '@/page-zt/components/user-center/NavHead'

export default {
  name: 'AboutUs',
  beforeMount() {
    this.getAboutArticle(this.id).catch(this.snackBar.error)
  },
  data() {
    return {
      nav: {
        value: 1,
        options: [
          { name: this.$t('about-us'), url: '' },
        ],
      },
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
  // components: { NavHead },
}
</script>
