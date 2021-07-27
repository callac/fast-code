<template>
  <div v-if="valid" class="tab-wrap" :style="{minWidth, boxSizing: 'content-box'}">
    <div v-for="(t, i) in options"
         class="tab"
         :class="{selected:same(value,t.value)}"
         :style="style(same(value,t.value))"
         :key="i"
         :ref="'tab'+i"
         v-html="t.needTran!==false?$t(t.name):t.name"
         @click="$emit('input', t.value)">
    </div>
  </div>
</template>

<script>
// Tab 切换组件
export default {
  name: 'Tab-zg',
  props: {
    value: [Number, String],
    options: Array,
    tabStyle: Object,
    selectedStyle: Object,
  },
  data() {
    return {
      minWidth: 0,
    }
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
    getMinWidth() {
      this.$nextTick(() => {
        this.minWidth = `${(this.options || []).reduce((pre, op, i) => {
          const tab = this.$refs[`tab${i}`][0] || this.$refs[`tab${i}`]
          return pre + tab.offsetWidth
        }, 0)}px`
      })
    },
    same(v1, v2) {
      return v1.toString() === v2.toString()
    },
  },
  mounted() {
    this.getMinWidth()
  },
  updated() {
    this.getMinWidth()
  },
}
</script>
