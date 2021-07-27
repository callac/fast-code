<template>
  <div v-if="valid" class="check-box user-select-none"
       @click.stop="input"
       :style="styles">
    <span class="iconfont" :class="{[icons.checked]:value, [icons.default]:!value}"
          :style="{fontSize: checkboxSize, margin:'0 .05rem 0 0'}"></span>
    {{name}}
  </div>
</template>

<script>
// checkbox 表单项
export default {
  name: 'CheckBox',
  props: {
    value: {
      default: '',
      type: String,
    },
    name: String,
    checkboxSize: { type: String, default: '14px' },
    // 设置选中状态以及非选中状态的类名
    icons: {
      default() {
        return {
          default: 'icon-shoucang',
          checked: 'icon-shoucangfill',
        }
      },
      type: Object,
    },
    styles: Object,
  },
  data() {
    return {}
  },
  computed: {
    valid() {
      let valid = true
      if (this.value) {
        valid = ['', 'checked', 'parts'].includes(this.value)
      }
      if (!valid) {
        this.$emit('error', 'CheckBox: prop value is invalid')
        return valid
      }
      if (!valid) {
        this.$emit('error', 'CheckBox: prop status is invalid')
        return valid
      }
      return valid
    },
  },
  methods: {
    input() {
      this.$emit('input', this.value !== 'checked' ? 'checked' : '')
    },
  },
}
</script>
