<template>
  <div class="article-content">
    <!--<h1 class="float-header">{{$t(title)}}-->
      <!--<span v-if="showDel" class="iconfont icon-del" @click="$emit('close')"></span></h1>-->
    <div class="assets-manager-title privacy-title">{{$t(title)}}</div>
    <div v-html="article.content" class="content-detail assets-manager-detail"></div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  name: 'Agreement',
  beforeMount() {
    this.getAboutArticle(this.id).catch(this.snackBar.error)
  },
  props: {
    showDel: Boolean,
  },
  data() {
    return {
      title: 'about-us.privacy-policy',
      id: 'privacy-policy',
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
