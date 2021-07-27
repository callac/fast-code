<template>
  <router-view/>
</template>

<script>
export default {
  name: 'MobileFrame',
  mounted() {
    document.body.setAttribute('class', 'mobile')
  },
  beforeDestroy() {
    document.body.removeAttribute('class')
  },
  data() {
    return {}
  },
  methods: {},
}
</script>
