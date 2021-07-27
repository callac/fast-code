<template>
  <page-container class="container-inner article-wrap" :title="$t(type)">
    <div class="content">
      <!--<h1 class="h1">{{$t(type)}}</h1>-->
      <div class="wrap">
        <help-aside/>
        <query :queryFn="queryFn" :noResult="!info" class="article-content"
               @error="log('Help:',$event)">
          <template v-if="info">
            <h1>{{info.title}}</h1>
            <span class="subhead"><!--{{info.author}}&nbsp;&nbsp;&nbsp;&nbsp;-->
            {{info.dateline|datePipe('')}}</span>
            <!--<div v-html="info.content"></div>-->
          </template>
        </query>
      </div>
    </div>
  </page-container>
</template>

<script>
import HelpAside from 'components/client/HelpAside'
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  name: 'Help',
  beforeMount() {
  },
  data() {
    return {}
  },
  computed: {
    ...mapState('article', ['articles', 'classes']),
    ...mapGetters('article', ['classesArr']),
    id() {
      return this.$route.params.id
    },
    type() {
      return 'help'
    },
    info() {
      return (this.articles[this.type] && this.articles[this.type][this.id]) || null
    },
  },
  methods: {
    ...mapActions('article', ['getArticle']),
    queryFn() {
      return this.getArticle({ type: this.type, id: this.id }).catch(this.snackBar.error)
    },
  },
  components: { HelpAside },
}
</script>
