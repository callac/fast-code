<template>
  <div class="whitepaper">
    <object :data="pdf" type="application/pdf"
            width="100%" height="900px">
      <!--<embed src="http://yoursite.com/the.pdf" type="application/pdf"></embed>-->
    </object>
  </div>
</template>

<script>
export default {
  name: 'whitepaper',
  data() {
    return {
      pdf: null,
    }
  },
  watch: {
    '$i18n.locale'() {
      // 监听语言包更换
      this.setLang()
    },
  },
  created() {
    this.pdf = this.$i18n.locale === 'en' ? require('assets/pdf/whitepaper-en.pdf') : require('assets/pdf/whitepaper-zh.pdf')
  },
  methods: {
    setLang() {
      this.pdf = this.$i18n.locale === 'en' ? require('assets/pdf/whitepaper-en.pdf') : require('assets/pdf/whitepaper-zh.pdf')
    },
  },
}
</script>
