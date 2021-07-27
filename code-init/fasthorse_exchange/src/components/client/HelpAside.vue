<template>
  <aside v-if="!searching&&classesArr[type]&&classesArr[type].length>1" class="help-aside">
    <router-link v-for="(h,i) in classes[type]" class="a"
                 :class="{active:+classId===+h.id}" :key="i"
                 :to="route+h.id">
      {{h.name}}
    </router-link>
    <loading v-if="searching" color="#fff" size=".3rem"/>
  </aside>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'

// 帮助中心左侧边栏
export default {
  name: 'HelpAside',
  beforeMount() {
    if (!(this.classesArr[this.type] && this.classesArr[this.type].length > 0)) {
      this.searching = true
      this.getArticleClass(this.type).catch(this.snackBar.error).then(() => {
        this.searching = false
      })
    }
  },
  data() {
    return {
      searching: false,
      route: '/article/help?classId=',
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
    type() {
      return 'help'
    },
    classId() {
      const t = this.classesArr[this.type]
      return this.$route.query.classId || (t && t[0] && t[0].id)
    },
  },
  // watch: {
  //   type: {
  //     handler() {
  //       console.log(this.type)
  //     },
  //     immediate: true,
  //   },
  //   classes: {
  //     handler() {
  //       console.log(this.classes)
  //     },
  //     immediate: true,
  //   },
  // },
  methods: {
    ...mapActions('article', ['getArticleClass']),
  },
}
</script>
