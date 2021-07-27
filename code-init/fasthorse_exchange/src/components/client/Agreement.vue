<template>
  <div class="article-content agreement">
    <!--<h1 class="float-header">-->
      <!--{{$t(title)}}-->
      <!--<span-->
        <!--v-if="showDel"-->
        <!--class="iconfont icon-del"-->
        <!--@click="$emit('close')"-->
      <!--&gt;</span>-->
    <!--</h1>-->
    <div class="txt-box">
      <div class="txt-content" v-html="article.content"></div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

// 用户协议文本
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
      title: 'sign-up.agreement',
      id: 'user-agreement',
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
