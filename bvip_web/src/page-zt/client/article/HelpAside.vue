<template>
  <aside v-if="!searching&&classesArr[type]&&classesArr[type].length>0" class="help-aside">
    <router-link v-for="(h,i) in classes[type]" class="a"
                 :key="i"
                 :to="route+h.id+'&&detailTitle='+h.name">
      {{h.name}}
    </router-link>
    <loading v-if="searching" color="#fff" size=".3rem"/>
  </aside>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  name: 'HelpAside',
  beforeMount() {
    if (!(this.classesArr[this.type] && this.classesArr[this.type].length > 0)) {
      this.searching = true
      this.getArticleClass(this.type).catch(this.snackBar.error).then(() => {
        this.searching = false
      })
      this.getArticleClass('news').catch(this.snackBar.error).then(() => {
        // this.searching = false
      })
    }
  },
  data() {
    return {
      searching: false,
      route: '/helpDetail?classId=',
      // items: [
      //   { name: 'help-center.guide', type: 'guide' },
      //   { name: 'deposit&withdraw', type: 'top-up' },
      //   { name: 'help-center.deal-guide', type: 'deal-guide' },
      //   { name: 'help-center.rate-definition', type: 'rate-definition' },
      //   { name: 'user.certification', type: 'certification' },
      // ],
    }
  },
  computed: {
    ...mapState('article', ['classes']),
    ...mapGetters('article', ['classesArr']),
    pathname() {
      return window.location.pathname
    },
    type() {
      return 'help'
      // return this.pathname.split('/')[this.pathname.length - 1]
    },
    classId() {
      const t = this.classesArr[this.type]
      return this.$route.query.classId || (t && t[0] && t[0].id)
    },
  },
  methods: {
    ...mapActions('article', ['getArticleClass']),
  },
}
</script>
