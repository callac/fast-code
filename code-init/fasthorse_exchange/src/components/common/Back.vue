<template>
  <div class="back-wrap" @click="Back">
    <slot/>
  </div>
</template>

<script>
export default {
  name: 'Back',
  data() {
    return {}
  },
  beforeDestroy() {
  },
  methods: {
    back() {
      this.$router.back()
    },
  },
}
</script>
