<template>
  <div class="tree-menu">
    <div v-for="(option,i) in options" :key="i" class="branch">
      <div class="name" @click.stop.prevent="choose(option,i)">
        <span class="icon-checkbox" :class="checked===option.name?'checked':''"></span>
        <div class="text-wrap" :style="noBorder?{border:'none'}:{paddingBottom:'.1rem'}">
          <span class="text">{{option.name}}</span>
          <tree-menu class="tree-menu-sub"
                     v-if="option.children&&option.children.length>0&&checked===option.name"
                     :options="option.children" :checkedObj="checkedObj&&checkedObj.children"
                     :noBorder="true"
                     @input="emit(option,$event.value)"
                     @unfold="unfoldFn"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// 树形组件
export default {
  name: 'TreeMenu',
  mounted() {
    if (this.checkedObj) this.checked = this.checkedObj.name
    this.initUnfold()
  },
  props: {
    checkedObj: Object,
    options: Array,
    noBorder: Boolean,
  },
  data() {
    return {
      checked: '',
      unfold: [{ index: 0, value: '' }],
    }
  },
  computed: {},
  watch: {
    value(val) {
      this.myValue = val
    },
    checkedObj(val) {
      this.checked = val.name
      this.initUnfold()
    },
    options() {
      this.initUnfold()
    },
  },
  methods: {
    initUnfold() {
      if (this.checkedObj && this.options) {
        (this.options || []).find((option, i) => {
          if (option.value && option.value === this.checkedObj.value) {
            this.unfold[0].index = i
            this.unfold[0].value = this.checkedObj.value
            return true
          }
          return false
        })
      }
    },
    input(val) {
      this.pristine = false
      this.valid = (val && this.config.validateFn(val)) || (!this.config.required && !val)
      this.$emit('input', this.config.needTrim ? val.trim() : val)
      this.$emit('check', { pristine: this.pristine, valid: this.valid })
    },
    choose(option, index) {
      this.unfold[0] = { index, value: option.value }
      this.$emit('unfold', this.unfold)
      if (option.children) {
        this.checked = this.checked === option.name ? '' : option.name
      } else {
        this.emit(option, option.value)
      }
    },
    emit(option, value) {
      this.checked = option.name
      this.$emit('input', {
        value,
        path: this.unfold.map(item => item.index),
        values: this.unfold.map(item => item.value),
      })
    },
    unfoldFn(val) {
      this.unfold = [this.unfold[0]].concat(val)
      this.$emit('unfold', this.unfold)
    },
  },
}
</script>
