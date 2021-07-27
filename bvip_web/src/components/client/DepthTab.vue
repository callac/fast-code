<template>
  <div v-if="valid" class="tab-wrap">
    <div v-for="(t, i) in options"
         class="tab"
         :class="{selected:value===t.value}"
         :style="style(value===t.value)"
         :key="i"
         v-html="value===t.value ? t.selectName : t.name"
         @click="$emit('input', t.value)">
    </div>
  </div>
</template>

<script>
// Tab 切换组件
export default {
  name: 'Tab',
  props: {
    value: [Number, String],
    options: Array,
    tabStyle: Object,
    selectedStyle: Object,
  },
  data() {
    return {}
  },
  computed: {
    valid() {
      let valid = true
      if (this.options) valid = this.options.every(item => item.name && item.value !== undefined)
      if (!valid) {
        this.$emit('error', 'Tab: prop options is invalid')
      }
      return valid
    },
  },
  methods: {
    style(selected) {
      return selected ? { ...this.tabStyle, ...this.selectedStyle } : this.tabStyle
    },
  },
}
</script>
