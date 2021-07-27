<template>
  <select-base class="lang-pin" :class="{tran:homeHeader}" v-model="lang.value"
               :options="lang.options"
               :scrollbarProps="{isMobile}"/>
</template>

<script>
// 语言选择框组件
export default {
  name: 'LangPin-zg',
  data() {
    return {
      lang: {
        value: this.$lang.getLang(),
        options: this.$langOptions,
      },
    }
  },
  computed: {
    homeHeader() {
      return ['/home', '/'].includes(this.$route.path)
    },
  },
  watch: {
    'lang.value'(val) {
      // this.$lang.setLang(val, this)
      this.$lang.setLangAndRefresh(val)
    },
  },
  methods: {},
}
</script>
